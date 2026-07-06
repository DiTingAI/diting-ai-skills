#!/usr/bin/env node

const {
  formatJson,
  getConfig,
  parseArgs,
  requestJSON
} = require('./shared');

/**
 * 读取资产详情
 * 接口: GET /api/v1/videos/{task_id} 或 GET /v1/assets/{asset_id}
 */
async function assetRead(options = {}) {
  const config = getConfig(options);
  const taskId = options['task-id'];
  const assetId = options['asset-id'];

  if (!taskId && !assetId) {
    throw new Error('缺少 --task-id 或 --asset-id 参数');
  }

  let response;
  if (taskId) {
    response = await requestJSON({
      baseURL: config.baseURL,
      token: config.token,
      method: 'GET',
      apiPath: `/api/v1/videos/${taskId}`
    });
  } else {
    // OpenAPI 资产接口
    response = await requestJSON({
      baseURL: config.baseURL,
      token: config.token,
      method: 'GET',
      apiPath: `/v1/assets/${assetId}`
    });
  }

  return response.data || response;
}

/**
 * 获取视频详情（内部辅助函数）
 * 接口: GET /api/v1/videos/{task_id} ✅ 存在
 */
async function getVideoDetails(taskId, config) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: `/api/v1/videos/${taskId}`
  });

  if (!response.data) {
    throw new Error('获取视频详情失败');
  }

  return response.data;
}

/**
 * 获取视频转录文本
 * 通过 GET /api/v1/videos/{task_id} 获取，从 originalTranscript/polishedTranscript/transcriptWithTimestamp 字段读取
 */
async function getVideoTranscript(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const videoDetails = await getVideoDetails(videoId, config);

  const format = options.format || 'json';
  const timestampMode = options['timestamp-mode'] || 'word';

  let transcript;
  if (format === 'original') {
    transcript = videoDetails.originalTranscript || '';
  } else if (format === 'polished') {
    transcript = videoDetails.polishedTranscript || '';
  } else if (format === 'timestamp') {
    transcript = videoDetails.transcriptWithTimestamp || '';
  } else {
    // 默认返回所有转录文本
    transcript = {
      originalTranscript: videoDetails.originalTranscript || '',
      polishedTranscript: videoDetails.polishedTranscript || '',
      transcriptWithTimestamp: videoDetails.transcriptWithTimestamp || ''
    };
  }

  return {
    videoId,
    title: videoDetails.title || '',
    duration: videoDetails.duration || '',
    format,
    timestampMode,
    transcript
  };
}

/**
 * 获取视频摘要
 * 通过 GET /api/v1/videos/{task_id} 获取，从 brief_summary/detailed_summary 字段读取
 */
async function getVideoSummary(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const videoDetails = await getVideoDetails(videoId, config);

  return {
    videoId,
    title: videoDetails.title || '',
    brief_summary: videoDetails.brief_summary || '',
    detailed_summary: videoDetails.detailed_summary || ''
  };
}

/**
 * 获取视频大纲
 * 通过 GET /api/v1/videos/{task_id} 获取，从 aiOutline 字段读取
 */
async function getVideoOutline(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const videoDetails = await getVideoDetails(videoId, config);

  return {
    videoId,
    title: videoDetails.title || '',
    aiOutline: videoDetails.aiOutline || []
  };
}

/**
 * 获取视频思维导图
 * 通过 GET /api/v1/videos/{task_id} 获取，从 mindmap 字段读取
 */
async function getVideoMindmap(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const videoDetails = await getVideoDetails(videoId, config);

  return {
    videoId,
    title: videoDetails.title || '',
    mindmap: videoDetails.mindmap || ''
  };
}

/**
 * 获取视频问答对
 * 通过 GET /api/v1/videos/{task_id} 获取，从 qaPairs 字段读取
 */
async function getVideoQA(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const videoDetails = await getVideoDetails(videoId, config);

  return {
    videoId,
    title: videoDetails.title || '',
    qaPairs: videoDetails.qaPairs || []
  };
}

/**
 * 获取视频润色文本
 * 通过 GET /api/v1/videos/{task_id} 获取，从 polishedTranscript 字段读取
 */
async function getVideoPolish(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const videoDetails = await getVideoDetails(videoId, config);

  return {
    videoId,
    title: videoDetails.title || '',
    polishedTranscript: videoDetails.polishedTranscript || ''
  };
}

/**
 * 获取视频章节
 * 通过 GET /api/v1/videos/{task_id} 获取，从 aiOutline 字段读取（作为章节）
 */
async function getVideoChapters(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const videoDetails = await getVideoDetails(videoId, config);

  return {
    videoId,
    title: videoDetails.title || '',
    chapters: videoDetails.aiOutline || []
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args['video-id'] && args.transcript) {
    const result = await getVideoTranscript(args);
    console.log(formatJson(result));
    return;
  }

  if (args['video-id'] && args.summary) {
    const result = await getVideoSummary(args);
    console.log(formatJson(result));
    return;
  }

  if (args['video-id'] && args.outline) {
    const result = await getVideoOutline(args);
    console.log(formatJson(result));
    return;
  }

  if (args['video-id'] && args.mindmap) {
    const result = await getVideoMindmap(args);
    console.log(formatJson(result));
    return;
  }

  if (args['video-id'] && args.qa) {
    const result = await getVideoQA(args);
    console.log(formatJson(result));
    return;
  }

  if (args['video-id'] && args.polish) {
    const result = await getVideoPolish(args);
    console.log(formatJson(result));
    return;
  }

  if (args['video-id'] && args.chapters) {
    const result = await getVideoChapters(args);
    console.log(formatJson(result));
    return;
  }

  const result = await assetRead(args);
  console.log(formatJson(result));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = {
  assetRead,
  getVideoTranscript,
  getVideoSummary,
  getVideoOutline,
  getVideoMindmap,
  getVideoQA,
  getVideoPolish,
  getVideoChapters
};
