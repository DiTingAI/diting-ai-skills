#!/usr/bin/env node

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
    throw new Error('缺少环境变量 DITING_API_KEY，请访问 https://diting.cc/home/apikey 获取');
  }

  return {
    token,
    baseURL
  };
}

function createHeaders(token, extraHeaders = {}) {
  return {
    Accept: 'application/json, text/plain, */*',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json;charset=UTF-8',
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

async function requestJSON({ baseURL, token, method, apiPath, query, body, extraHeaders }) {
  const normalizedMethod = method.toUpperCase();
  const finalQuery = { ...(query || {}) };
  let finalBody = body;

  const url = buildUrl(baseURL, apiPath, finalQuery);
  const headers = createHeaders(token, extraHeaders);
  const options = {
    method: normalizedMethod,
    headers
  };

  if (finalBody !== undefined && normalizedMethod !== 'GET') {
    headers['Content-Type'] = 'application/json;charset=UTF-8';
    options.body = JSON.stringify(finalBody);
  }

  const response = await fetch(url, options);
  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`接口返回非 JSON: ${text}`);
  }

  if (!response.ok) {
    const errorCode = data.error?.error_code || data.error_code;
    const errorMessage = data.error?.detail || data.error?.message || data.message || `请求失败 ${response.status}`;

    let message = errorMessage;
    if (response.status === 401) {
      message = 'API Key 无效或已过期，请访问 https://diting.cc/home/apikey 重新获取';
    } else if (response.status === 402) {
      message = `可用时长不足，请升级套餐: ${errorMessage}`;
    } else if (response.status === 429) {
      if (errorCode === 'E2008') {
        message = '今日视频处理次数已达上限（20次），请明天再试';
      } else if (errorCode === 'E2009') {
        message = '任务排队数超过上限，升级VIP会员可享受无限排队';
      } else {
        message = '请求过于频繁，请稍后再试';
      }
    }

    throw new Error(message);
  }

  return data;
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
  extractBilibiliUrl,
  formatJson,
  getConfig,
  isValidBilibiliUrl,
  parseArgs,
  requestJSON,
  requestJSONWithRetry
};
