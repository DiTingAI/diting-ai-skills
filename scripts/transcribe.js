#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  buildAttributedUrl,
  formatJson,
  getConfig,
  libraryUrl,
  parseArgs,
  requestJSON,
  requestMultipart,
  videoDocUrl
} = require('./shared');

// 开放 API 的单文件上传闸门（diting-api config.yaml: openapi.max_upload_mb = 200）。
// 网页端是 5GB，但 CLI 走 /v1，先本地拦一次，省掉 200MB 传完才报错的等待。
const MAX_UPLOAD_MB = 200;

const PLATFORM_LABELS = {
  bilibili: 'B 站',
  douyin: '抖音',
  xhs: '小红书'
};

/**
 * 平台识别（2026-11-25 新增）。
 *
 * 抖音/小红书的短链（v.douyin.com、xhslink.com）和 App 分享文案
 * 都由服务端做 302 解析与规范化，所以这里只负责「判断这是谁家的链接」，
 * 不自己展开短链——展开逻辑一旦和网页端不一致，就会出现
 * 「网页端能提交、CLI 说链接无效」这种最难解释的错。
 */
const PLATFORM_PATTERNS = [
  { platform: 'bilibili', patterns: [/bilibili\.com/i, /b23\.tv/i] },
  { platform: 'douyin', patterns: [/douyin\.com/i, /iesdouyin\.com/i] },
  // 小红书 App 现在分享出来的是 xhslink.cn（不是 .com），两者都要认；
  // 后端 services/platform_video_test.go 的「小红书短链cn真实形态」用例也是这个形态。
  { platform: 'xhs', patterns: [/xiaohongshu\.com/i, /xhslink\.(?:com|cn)/i] }
];

/** 从分享文案里抠出第一条链接；抠不到就原样返回，交给服务端 */
function extractFirstUrl(text) {
  if (!text) return '';
  const match = String(text).match(/https?:\/\/[^\s，,。；;"'）)】]+/);
  return match ? match[0] : '';
}

function detectPlatform(input) {
  const text = String(input || '');
  if (!text) return null;

  const trimmed = text.trim();
  if (/^BV[0-9A-Za-z]+$/.test(trimmed) || /^av\d+$/i.test(trimmed)) {
    return 'bilibili';
  }

  for (const { platform, patterns } of PLATFORM_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(text))) return platform;
  }
  return null;
}

/**
 * 检查抖音 / 小红书视频信息
 * 接口: POST /v1/transcriptions/{platform}/check
 *
 * 为什么走 /v1 而不是 /api/v1/videos/{platform}/check：
 *   后者挂在 setupPlatformVideoRoutes 里，用的是 mainmw.AuthRequired（只认 JWT），
 *   本 Skill 用 API Key 鉴权，打过去必然 401。开放 API 的 /v1 走 VerifyAPIKey，
 *   才是给脚本/Agent 用的通道。
 */
async function checkPlatformVideo(platform, url, config) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: `/v1/transcriptions/${platform}/check`,
    body: { video_url: url },
    // 抖音 / 小红书的元数据要走家宽 worker（yt-dlp 对这两个站直接请求必然失败），
    // 比 B 站慢一个量级；给 2 分钟，超时也要报出来而不是把 CLI 挂死。
    timeoutMs: 120000
  });

  return response.data || response;
}

/**
 * 提交抖音 / 小红书转写任务
 * 接口: POST /v1/transcriptions/{platform}
 */
async function submitPlatformTask(platform, payload, config) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: `/v1/transcriptions/${platform}`,
    body: payload,
    timeoutMs: 120000
  });

  return response.data || response;
}

/**
 * 上传本地音视频文件
 * 接口: POST /v1/transcriptions/upload（multipart，单文件 ≤ 200MB）
 */
async function uploadLocalFile(filePath, options, config) {
  const resolved = path.resolve(String(filePath));

  if (!fs.existsSync(resolved)) {
    throw new Error(`找不到本地文件：${resolved}`);
  }

  const stat = fs.statSync(resolved);
  if (!stat.isFile()) {
    throw new Error(`不是普通文件，无法上传：${resolved}`);
  }

  const sizeMB = stat.size / 1024 / 1024;
  if (sizeMB > MAX_UPLOAD_MB) {
    throw new Error(
      `文件 ${sizeMB.toFixed(1)}MB 超过单文件上限 ${MAX_UPLOAD_MB}MB（开放 API 限制）。` +
      `更大的文件请用网页端上传（上限 5GB）：${buildAttributedUrl('/home', { client: 'skill' })}`
    );
  }

  console.log(`📤 正在上传 ${path.basename(resolved)}（${sizeMB.toFixed(1)}MB）...`);

  const response = await requestMultipart({
    baseURL: config.baseURL,
    token: config.token,
    apiPath: '/v1/transcriptions/upload',
    fields: {
      language: options.language || '',
      client: 'skill'
    },
    filePath: resolved,
    fileField: 'file',
    // 200MB 走公网上传，给足 15 分钟；超时会明确提示，不会静默卡死
    timeoutMs: 900000
  });

  // 后端 UploadVideo 自己又包了一层 {success, data:{...}}，外面还有统一的 {code,message,data}。
  // 少解一层就会把 task_ids 读成 undefined，任务其实已创建、CLI 却报失败。
  const outer = response.data || response;
  const data = outer && outer.data ? outer.data : outer;

  const taskIds = Array.isArray(data.task_ids) ? data.task_ids : [];
  const failedFiles = data.failed_files || [];
  const duplicateFiles = data.duplicate_files || [];

  if (!taskIds.length) {
    // 「重复文件」不是失败：服务端按内容哈希判重，说明同一个文件此前已经转好了。
    // 单独给一句带出口的提示，避免 Agent 把用户推到「再传一次」的死循环里。
    if (duplicateFiles.length && !failedFiles.length) {
      throw new Error(
        '该文件此前已上传过（内容相同），本次未重复创建任务。已有结果在这里：' + libraryUrl()
      );
    }

    const reasons = [...failedFiles, ...duplicateFiles]
      .map((item) => `${item.filename || ''} ${item.error || '重复文件（已存在同名任务）'}`.trim())
      .filter(Boolean)
      .join('；');
    throw new Error(`上传未创建任务${reasons ? `：${reasons}` : ''}`);
  }

  return {
    success: true,
    taskIds,
    fileNames: data.file_names || [],
    failedFiles,
    duplicateFiles,
    response: data,
    portal_url: buildAttributedUrl('/skills', { client: 'skill' }),
    web_urls: taskIds.map((id) => videoDocUrl(id)).filter(Boolean),
    web_library_url: libraryUrl()
  };
}

/**
 * 检查 B 站视频信息
 * 接口: POST /api/v1/videos/bilibili/check ✅ 存在
 */
async function checkBilibiliVideo(url, config) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/v1/videos/bilibili/check',
    body: { video_url: url }
  });

  return response.data || response;
}

/**
 * 提交 B 站视频处理任务
 * 接口: POST /api/v1/videos/bilibili/process ✅ 存在
 */
async function submitProcessTask(videos, config) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/v1/videos/bilibili/process',
    body: { videos }
  });

  return response.data || response;
}

/**
 * 查询任务状态
 * 接口: GET /api/v1/videos/{task_id}/status ✅ 存在
 */
async function getTaskStatus(taskId, config) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: `/api/v1/videos/${taskId}/status`
  });

  return response.data || response;
}

/**
 * 获取视频详情（处理结果）
 * 接口: GET /api/v1/videos/{task_id} ✅ 存在
 */
async function getVideoResult(taskId, config) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: `/api/v1/videos/${taskId}`
  });

  return response.data || response;
}

/**
 * 生成视频摘要
 * 接口: POST /api/v1/videos/summary ✅ 存在
 */
async function generateSummary(taskId, config) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/v1/videos/summary',
    body: { task_id: taskId },
    // 2026-11-24：原来写的是 extraHeaders: { timeout: '600000' }，
    // 它会被当成一个无意义的 HTTP 头发出去，实际并没有任何超时控制。
    // 改成真正的请求超时（AbortSignal），纪要是长任务，给 10 分钟。
    timeoutMs: 600000
  });

  return response.data || response;
}

// 以下AI功能接口在API文档中未提及，已移除：
// - POST /api/v1/videos/outline ❌ 不存在
// - POST /api/v1/videos/qa ❌ 不存在
// - POST /api/v1/videos/mindmap ❌ 不存在
// - POST /api/v1/videos/mindmap/regenerate ❌ 不存在
// - POST /api/v1/videos/polish ❌ 不存在
// 这些功能的数据通过 GET /api/v1/videos/{task_id} 接口获取。

/**
 * 重试视频处理
 * 接口: POST /api/v1/videos/{video_id}/retry ✅ 存在
 */
async function retryVideo(videoId, config) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: `/api/v1/videos/${videoId}/retry`
  });

  return response.data || response;
}

/**
 * 查询视频列表
 * 接口: GET /api/v1/videos ✅ 存在
 */
async function queryVideoList(config, options = {}) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: '/api/v1/videos',
    query: {
      page: options.page || 1,
      page_size: options.page_size || 12,
      file_name: options.file_name || '',
      status: options.status || [],
      sort_field: options.sort_field || 'publishTime',
      sort_order: options.sort_order || 'desc'
    }
  });

  return response.data || response;
}

/**
 * 删除视频
 * 接口: DELETE /api/v1/videos/{task_id} ✅ 存在
 */
async function deleteVideo(videoId, config) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'DELETE',
    apiPath: `/api/v1/videos/${videoId}`
  });

  return response.data || response;
}

function extractBilibiliUrl(url) {
  if (!url) return null;

  const bvidMatch = url.match(/BV[a-zA-Z0-9]+/);
  if (bvidMatch) {
    return `https://www.bilibili.com/video/${bvidMatch[0]}`;
  }

  const avMatch = url.match(/av(\d+)/i);
  if (avMatch) {
    return `https://www.bilibili.com/video/av${avMatch[1]}`;
  }

  if (url.includes('bilibili.com/video/')) {
    return url.split('?')[0];
  }

  return null;
}

function isValidBilibiliUrl(url) {
  return url && (
    url.includes('bilibili.com/video/BV') ||
    url.includes('bilibili.com/video/av')
  );
}

/**
 * b23.tv 短链（2026-11-25 补）
 *
 * 短链里没有 BV 号，客户端无法还原成标准页地址，只能原样交给服务端解析
 * （diting-api services/video_service.go:357 明确把 b23.tv 视为 B 站域名）。
 * 此前本地校验只认 BV/av，导致 SKILL.md 里写的「支持 b23.tv 短链」实际打不通。
 */
function isBilibiliShortUrl(url) {
  return /^https?:\/\/(www\.)?b23\.tv\/[a-zA-Z0-9]+/i.test(String(url || '').trim());
}

async function transcribeBilibili(url, options, config) {
  const extractedUrl = extractBilibiliUrl(url) || (isBilibiliShortUrl(url) ? String(url).trim() : null);
  if (!extractedUrl) {
    throw new Error('请输入有效的 B 站视频链接（支持 bilibili.com/video/BV…、av…、b23.tv 短链）');
  }

  console.log(`🔍 正在获取 B 站视频信息: ${extractedUrl}`);
  const videoInfo = await checkBilibiliVideo(extractedUrl, config);

  const parts = videoInfo.parts || [];
  const isCollection = videoInfo.season_id > 0;
  const isMultiPart = videoInfo.is_multi_part === true;

  let videosPayload = [];

  if (parts && (isCollection || isMultiPart)) {
    console.log(`📦 检测到合集/多P（共${parts.length}P）`);
    if (options['batch-all']) {
      for (const part of parts) {
        videosPayload.push({
          url: part.url,
          thumbnail: part.thumbnail || videoInfo.thumbnail || '',
          title: part.title || videoInfo.title || '',
          duration: part.duration || videoInfo.duration || '0:00'
        });
      }
    } else {
      const pageNum = parseInt(options.page || '1', 10);
      const pageIdx = Math.max(0, Math.min(pageNum - 1, parts.length - 1));
      const selected = parts[pageIdx];
      videosPayload.push({
        url: selected.url,
        thumbnail: selected.thumbnail || videoInfo.thumbnail || '',
        title: selected.title || videoInfo.title || '',
        duration: selected.duration || videoInfo.duration || '0:00'
      });
    }
  } else {
    videosPayload.push({
      url: extractedUrl,
      thumbnail: videoInfo.thumbnail || '',
      title: videoInfo.title || '',
      duration: videoInfo.duration || '0:00'
    });
  }

  console.log(`📤 提交处理任务到谛听 AI 云端...`);
  const task = await submitProcessTask(videosPayload, config);

  if (task.success !== true) {
    throw new Error(`提交失败: ${JSON.stringify(task)}`);
  }

  const taskIds = task.task_ids || (task.task_id ? [task.task_id] : []);

  return {
    success: true,
    platform: 'bilibili',
    taskIds,
    videoInfo,
    submittedVideos: videosPayload,
    response: task,
    // 二次转化入口：命令行只做「提交 + 取文本」，大纲/思维导图/问答/文件夹管理
    // 都在网页端，把 Agent 的用户导回带渠道归因的落地页（from/c 见 scripts/channel.js）
    portal_url: buildAttributedUrl('/skills', { client: 'skill' }),
    // 2026-11-24：任务详情直链。portal_url 是「找得到入口」，web_urls 是「直接落到那条任务」。
    // 承接链路：Claude 里转完 → 点链接 → 网页端 DetailDoc 看到完整笔记/思维导图/时间轴
    //          → 第一次意识到「我的视频在这里沉淀成资产」。
    web_urls: taskIds.map((id) => videoDocUrl(id)).filter(Boolean),
    // 批量场景（多P / 合集）可能一次返回十几条，逐条贴链接会把对话刷屏。
    // 给一个列表页出口：首条用 web_urls[0]，其余让用户去这里一起看。
    web_library_url: libraryUrl()
  };
}

async function transcribePlatform(platform, url, options, config) {
  const label = PLATFORM_LABELS[platform] || platform;
  // 分享文案里常带一堆话术（「复制打开抖音…」），服务端能自己抠 URL，
  // 但先抠一次可以让日志和错误提示更可读；抠不到就整段交过去。
  const input = extractFirstUrl(url) || String(url).trim();

  console.log(`🔍 正在解析${label}链接: ${input}`);
  const videoInfo = await checkPlatformVideo(platform, input, config);

  if (videoInfo.probe_failed) {
    console.log('⚠️ 元数据探测未成功，仍可提交（标题 / 时长由服务端补探）');
  }

  const finalUrl = videoInfo.video_url_resolved || input;
  const payload = {
    video_url: finalUrl,
    title: options.title || videoInfo.title || '',
    duration: Number(videoInfo.duration) || 0,
    thumbnail: videoInfo.cover || ''
  };

  console.log(`📤 提交处理任务到谛听 AI 云端...`);
  const task = await submitPlatformTask(platform, payload, config);
  const taskId = task.task_id || (Array.isArray(task.task_ids) ? task.task_ids[0] : '');

  if (!taskId) {
    throw new Error(`提交失败: ${JSON.stringify(task)}`);
  }

  const taskIds = [taskId];

  return {
    success: true,
    platform,
    taskIds,
    videoInfo,
    submittedVideos: [payload],
    response: task,
    portal_url: buildAttributedUrl('/skills', { client: 'skill' }),
    web_urls: taskIds.map((id) => videoDocUrl(id)).filter(Boolean),
    web_library_url: libraryUrl()
  };
}

async function transcribe(options = {}) {
  const config = getConfig(options);

  // 本地音视频：multipart 上传，走开放 API /v1/transcriptions/upload
  if (options.file || options.path) {
    return uploadLocalFile(options.file || options.path, options, config);
  }

  const url = options.url;
  if (!url) {
    throw new Error(
      '缺少 --url 或 --file 参数。支持 B 站 / 抖音 / 小红书链接；本地音视频请用 --file <文件路径>'
    );
  }

  const platform = detectPlatform(url);
  if (!platform) {
    throw new Error(
      `暂不支持该链接：${url}\n` +
      '当前支持 B 站、抖音、小红书；本地音视频请用 --file <路径>。' +
      `其他平台（YouTube / 快手等）请在网页端提交：${buildAttributedUrl('/home', { client: 'skill' })}\n` +
      '本次未创建任务，不消耗额度。'
    );
  }

  if (platform !== 'bilibili') {
    return transcribePlatform(platform, url, options, config);
  }

  return transcribeBilibili(url, options, config);
}

async function pollTask(options = {}) {
  const config = getConfig(options);
  const taskId = options['task-id'];

  if (!taskId) {
    throw new Error('缺少 --task-id 参数');
  }

  const maxWait = parseInt(options['max-wait'] || '3600', 10);
  const interval = parseInt(options['interval'] || '5', 10);

  let elapsed = 0;
  while (elapsed < maxWait) {
    const status = await getTaskStatus(taskId, config);
    const taskStatus = status.status || '';
    const progress = status.progress || '';

    if (taskStatus === 'completed') {
      console.log(`✅ 任务 ${taskId} 已完成`);
      const detail = await getVideoResult(taskId, config);
      return {
        success: true,
        taskId,
        status: 'completed',
        detail,
        // 完成时给直达链接：用户此刻最想看的就是「这条的完整笔记长什么样」
        web_url: videoDocUrl(taskId)
      };
    }

    if (taskStatus === 'failed' || taskStatus === 'error') {
      // 字段名是 error_msg（2026-11-25 修正）：此前读 status.error，
      // 后端根本不返回这个 key，导致所有失败一律显示「未知错误」，
      // 用户/Agent 完全拿不到「为什么失败」。
      const reason = status.error_msg || status.errorMessage || status.error || '未返回失败原因';
      throw new Error(`任务 ${taskId} 失败（${status.current_step || '未知阶段'}）: ${reason}`);
    }

    console.log(`⏳ 任务 ${taskId} 进行中... status=${taskStatus} progress=${progress} 已等待 ${elapsed}s`);
    await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    elapsed += interval;
  }

  throw new Error(`任务 ${taskId} 超时（>${maxWait}s）`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = getConfig(args);

  if (args['task-id'] && args.poll) {
    const result = await pollTask(args);
    console.log(formatJson(result));
    return;
  }

  if (args['task-id'] && args.summary) {
    const result = await generateSummary(args['task-id'], config);
    console.log(formatJson(result));
    return;
  }

  // 以下AI功能接口在API文档中未提及，已禁用：
  // --outline, --qa, --mindmap, --regenerate-mindmap, --polish
  // 这些数据请通过 GET /api/v1/videos/{task_id} 获取。

  if (args['video-id'] && args.retry) {
    const result = await retryVideo(args['video-id'], config);
    console.log(formatJson(result));
    return;
  }

  if (args.list) {
    const result = await queryVideoList(config, {
      page: args.page,
      page_size: args.page_size,
      file_name: args.file_name,
      status: args.status,
      sort_field: args.sort_field,
      sort_order: args.sort_order
    });
    // 列表场景没有单一 task_id，补一个列表页出口，避免用户看完一屏文件名无处可去。
    // 用展开而不是改结构：后端返回是对象（含 list/total），万一是数组也兜住。
    const withEntry = Array.isArray(result)
      ? { items: result, web_list_url: libraryUrl() }
      : { ...result, web_list_url: libraryUrl() };
    console.log(formatJson(withEntry));
    return;
  }

  if (args['video-id'] && args.delete) {
    const result = await deleteVideo(args['video-id'], config);
    console.log(formatJson(result));
    return;
  }

  const result = await transcribe(args);
  console.log(formatJson(result));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = {
  transcribe,
  transcribeBilibili,
  transcribePlatform,
  uploadLocalFile,
  detectPlatform,
  extractFirstUrl,
  isBilibiliShortUrl,
  checkPlatformVideo,
  submitPlatformTask,
  pollTask,
  generateSummary,
  retryVideo,
  queryVideoList,
  deleteVideo
};
