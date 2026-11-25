#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const channel = require('./channel');

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) {
      continue;
    }

    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      result[key] = true;
      continue;
    }

    result[key] = next;
    index += 1;
  }

  return result;
}

function getConfig(options = {}) {
  const token = process.env.DITING_API_KEY;
  const baseURL = process.env.DITING_API_BASE_URL || 'https://api.diting.cc';

  if (!token) {
    throw new Error(
      `缺少环境变量 DITING_API_KEY，请先在此页面创建 API Key：${channel.apiKeyUrl()}`
    );
  }

  return {
    token,
    baseURL,
    channel: channel.CHANNEL
  };
}

function createHeaders(token, extraHeaders = {}) {
  // 渠道埋点头必须放在最前面：调用方的 extraHeaders 允许覆盖（例如自测时关掉埋点）
  return {
    ...channel.buildAttributionHeaders(),
    Accept: 'application/json, text/plain, */*',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json;charset=UTF-8',
    'User-Agent': channel.getUserAgent(),
    ...extraHeaders
  };
}

function buildUrl(baseURL, apiPath, query = {}) {
  const target = new URL(apiPath, baseURL);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => target.searchParams.append(`${key}[]`, String(item)));
      return;
    }

    target.searchParams.set(key, String(value));
  });
  return target.toString();
}

function isRetryableError(error) {
  if (!error) return false;
  if (!error.response) return true;
  const status = error.response.status;
  if (status === 408 || status === 429) return true;
  return status >= 500 && status < 600;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJSONWithRetry({ baseURL, token, method, apiPath, query, body, extraHeaders }, options = {}) {
  const { retries = 2, baseDelay = 400 } = options;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestJSON({ baseURL, token, method, apiPath, query, body, extraHeaders });
    } catch (err) {
      lastError = err;
      if (attempt >= retries) break;
      if (!isRetryableError(err)) throw err;
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError;
}

async function requestJSON({ baseURL, token, method, apiPath, query, body, extraHeaders, timeoutMs }) {
  const normalizedMethod = method.toUpperCase();
  const finalQuery = { ...(query || {}) };
  let finalBody = body;

  const url = buildUrl(baseURL, apiPath, finalQuery);
  const headers = createHeaders(token, extraHeaders);
  const options = {
    method: normalizedMethod,
    headers
  };

  // 真正的超时控制（2026-11-24 补）：此前超时只能靠 fetch 默认行为，
  // 长任务或网络挂起会把 CLI 卡死。Node 18+ 支持 AbortSignal.timeout。
  if (timeoutMs && typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    options.signal = AbortSignal.timeout(timeoutMs);
  }

  if (finalBody !== undefined && normalizedMethod !== 'GET') {
    headers['Content-Type'] = 'application/json;charset=UTF-8';
    options.body = JSON.stringify(finalBody);
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch (fetchError) {
    if (fetchError && (fetchError.name === 'TimeoutError' || fetchError.name === 'AbortError')) {
      throw new Error(`请求超时（${Math.round((timeoutMs || 0) / 1000)}s）：${url}`);
    }
    throw new Error(`网络请求失败：${fetchError && fetchError.message ? fetchError.message : fetchError}`);
  }
  return parseJsonResponse(response);
}

/**
 * 统一解析响应体 + 错误话术映射（requestJSON / requestMultipart 共用）。
 *
 * 错误码语义与网页端一致，改动这里等于改动所有命令的报错口径，
 * 尤其是 402（额度不足）与 429（E2008/E2009）三条转化入口，不要随手简化。
 */
async function parseJsonResponse(response) {
  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`接口返回非 JSON: ${text}`);
  }

  if (!response.ok) {
    const errorCode = data.error?.error_code || data.error_code;
    // 取错误文案的优先级（2026-11-25 调整）：
    //   后端形状是 {code, message, error:{error_code, message, detail}}。
    //   `detail` 常是给日志看的技术词（例如「无效的请求参数」），
    //   而 `error.message` / 顶层 `message` 才是能直接给用户看的那句
    //   （例如「无法获取视频时长，请稍后重试；若持续失败请改用本地上传」）。
    //   此前先取 detail，等于把可执行建议换成了无信息量的一句话。
    const errorMessage = data.error?.message || data.message || data.error?.detail || `请求失败 ${response.status}`;

    let message = errorMessage;
    if (response.status === 401) {
      // 401 有两种完全不同的成因，必须分开说：
      //   a) Key 真的无效 → 让用户去重建 Key
      //   b) 这条路由只挂 JWT（AuthRequired），API Key 根本进不去
      //      （现状：DELETE /api/v1/videos/{id}、/api/v1/videos/upload 等）
      // 混在一起说会让用户把「接口不支持 Key」当成「我的 Key 过期了」，反复重建 Key。
      const jwtOnly = /登录|令牌/.test(errorMessage);
      message = jwtOnly
        ? `该接口只接受网页端登录态，API Key 不能调用（服务端返回：${errorMessage}）。请到网页端操作：${channel.libraryUrl()}`
        : `API Key 无效或已过期，请在此页面重新生成：${channel.apiKeyUrl()}`;
    } else if (response.status === 402) {
      message = `可用时长不足，请升级套餐（${channel.pricingUrl()}）：${errorMessage}`;
    } else if (response.status === 429) {
      if (errorCode === 'E2008') {
        message = `今日视频处理次数已达上限（20次），升级后可继续：${channel.pricingUrl()}`;
      } else if (errorCode === 'E2009') {
        message = `任务排队数超过上限，升级 VIP 会员可享无限排队：${channel.pricingUrl()}`;
      } else {
        message = '请求过于频繁，请稍后再试';
      }
    }

    // 带上状态码：有些路由「只认网页登录态」，401 并不代表 Key 有问题，
    // 调用方需要能区分这两种情况，否则会把「这条接口不支持 API Key」
    // 误报成「你的 Key 过期了」，用户会去反复重建 Key。
    const error = new Error(message);
    error.status = response.status;
    error.errorCode = errorCode;
    throw error;
  }

  return data;
}

/** 常见音视频扩展名 → MIME；认不出就交给服务端嗅探 */
const MIME_BY_EXT = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.flv': 'video/x-flv',
  '.webm': 'video/webm',
  '.m4v': 'video/x-m4v',
  '.wmv': 'video/x-ms-wmv',
  '.ts': 'video/mp2t',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
  '.ogg': 'audio/ogg',
  '.wma': 'audio/x-ms-wma',
  '.amr': 'audio/amr',
  '.opus': 'audio/opus'
};

function guessMimeType(filename) {
  return MIME_BY_EXT[path.extname(filename).toLowerCase()] || 'application/octet-stream';
}

/** multipart 头里的文件名不能带引号/换行，否则整个请求体会被判为畸形 */
function sanitizeFilename(filename) {
  return path.basename(String(filename || 'file')).replace(/[\r\n"]/g, '_');
}

/**
 * multipart/form-data 上传（2026-11-25 新增，用于 --file 本地音视频）
 *
 * 为什么不用 FormData / Blob：
 *   本包要求 Node 18+，而 `fs.openAsBlob` 是 Node 19.8 才有的 API；
 *   用 readFileSync + 手工拼 boundary 兼容性最好，200MB 上限也不会打爆内存
 *   （开放 API 的单文件闸门就是 200MB，调用方已在上层先校验过）。
 *
 * 为什么必须单独实现：requestJSON 会强制写 Content-Type: application/json，
 * 走 multipart 会被服务端判为解析失败。
 */
async function requestMultipart({
  baseURL,
  token,
  apiPath,
  query,
  fields,
  filePath,
  fileField = 'file',
  extraHeaders,
  timeoutMs
}) {
  const url = buildUrl(baseURL, apiPath, query || {});
  const boundary = `----DiTingSkill${crypto.randomBytes(12).toString('hex')}`;
  const chunks = [];

  Object.entries(fields || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
    ));
  });

  const filename = sanitizeFilename(path.basename(filePath));
  chunks.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="${fileField}"; filename="${filename}"\r\n` +
    `Content-Type: ${guessMimeType(filename)}\r\n\r\n`
  ));
  chunks.push(fs.readFileSync(filePath));
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  // 渠道埋点头要保留：服务端只在带 X-Visitor-Id 时补报 upload_done，
  // 少一个头这条上传就归因不到渠道。
  const headers = createHeaders(token, {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    ...extraHeaders
  });

  const options = { method: 'POST', headers, body: Buffer.concat(chunks) };
  if (timeoutMs && typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    options.signal = AbortSignal.timeout(timeoutMs);
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch (fetchError) {
    if (fetchError && (fetchError.name === 'TimeoutError' || fetchError.name === 'AbortError')) {
      throw new Error(`上传超时（${Math.round((timeoutMs || 0) / 1000)}s）：${url}`);
    }
    throw new Error(`网络请求失败：${fetchError && fetchError.message ? fetchError.message : fetchError}`);
  }

  return parseJsonResponse(response);
}

function formatJson(data) {
  return JSON.stringify(data, null, 2);
}

function extractBilibiliUrl(text) {
  if (!text) return null;

  const urlPatterns = [
    /https?:\/\/(www\.)?bilibili\.com\/video\/BV[a-zA-Z0-9]+[^\s]*/g,
    /https?:\/\/(www\.)?b23\.tv\/[a-zA-Z0-9]+/g,
    /BV[a-zA-Z0-9]+/g
  ];

  for (const pattern of urlPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      let url = matches[0];
      if (/^BV[a-zA-Z0-9]+$/.test(url)) {
        url = `https://www.bilibili.com/video/${url}`;
      }
      return url;
    }
  }

  return null;
}

function isValidBilibiliUrl(url) {
  const extractedUrl = extractBilibiliUrl(url);
  if (!extractedUrl) return false;

  const patterns = [
    /^https?:\/\/(www\.)?bilibili\.com\/video\/BV[a-zA-Z0-9]+/,
    /^https?:\/\/(www\.)?b23\.tv\/[a-zA-Z0-9]+/,
    /^BV[a-zA-Z0-9]+/
  ];

  return patterns.some(pattern => pattern.test(extractedUrl));
}

module.exports = {
  apiKeyUrl: channel.apiKeyUrl,
  buildAttributedUrl: channel.buildAttributedUrl,
  channel: channel.CHANNEL,
  extractBilibiliUrl,
  formatJson,
  getConfig,
  getVisitorId: channel.getVisitorId,
  homeUrl: channel.homeUrl,
  isValidBilibiliUrl,
  libraryUrl: channel.libraryUrl,
  parseArgs,
  pricingUrl: channel.pricingUrl,
  requestJSON,
  requestJSONWithRetry,
  requestMultipart,
  skillVersion: channel.SKILL_VERSION,
  videoDocUrl: channel.videoDocUrl
};
