#!/usr/bin/env node

const {
  formatJson,
  getConfig,
  parseArgs,
  requestJSON
} = require('./shared');

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
    extraHeaders: { 'timeout': '600000' }
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

async function transcribe(options = {}) {
  const config = getConfig(options);
  const url = options.url;

  if (!url) {
    throw new Error('缺少 --url 参数（请输入有效的 B 站视频链接）');
  }

  if (url) {
    const extractedUrl = extractBilibiliUrl(url);
    if (!extractedUrl || !isValidBilibiliUrl(extractedUrl)) {
      throw new Error('请输入有效的B站视频链接');
    }

    console.log(`🔍 正在获取 B 站视频信息: ${extractedUrl}`);
    const videoInfo = await checkBilibiliVideo(extractedUrl, config);

    const title = videoInfo.title || '未命名视频';
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
      taskIds,
      videoInfo,
      submittedVideos: videosPayload,
      response: task
    };
  }
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
        detail
      };
    }

    if (taskStatus === 'failed' || taskStatus === 'error') {
      throw new Error(`任务 ${taskId} 失败: ${status.error || '未知错误'}`);
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
    console.log(formatJson(result));
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
  pollTask,
  generateSummary,
  retryVideo,
  queryVideoList,
  deleteVideo
};
