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
  const videoId = options['video-id'] || options['task-id']; // task-id 作为别名：SKILL.md 与多数示例用的是 --task-id

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
  const videoId = options['video-id'] || options['task-id']; // task-id 作为别名：SKILL.md 与多数示例用的是 --task-id

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
  const videoId = options['video-id'] || options['task-id']; // task-id 作为别名：SKILL.md 与多数示例用的是 --task-id

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
  const videoId = options['video-id'] || options['task-id']; // task-id 作为别名：SKILL.md 与多数示例用的是 --task-id

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
  const videoId = options['video-id'] || options['task-id']; // task-id 作为别名：SKILL.md 与多数示例用的是 --task-id

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
  const videoId = options['video-id'] || options['task-id']; // task-id 作为别名：SKILL.md 与多数示例用的是 --task-id

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
  const videoId = options['video-id'] || options['task-id']; // task-id 作为别名：SKILL.md 与多数示例用的是 --task-id

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

/**
 * 按类型读取（2026-11-24 新增 --type 支持）
 *
 * 背景：SKILL.md 与对外示例写的是 `--task-id ... --type summary`，
 * 但脚本此前只认 `--video-id ... --summary` 这种布尔开关，
 * 于是 `--type summary` 会被静默忽略、返回整份详情——用户以为拿到了纪要，其实拿到的是全部字段。
 * 现在两种写法都支持，`--type` 与布尔开关等价，`--task-id` 与 `--video-id` 等价。
 */
const TYPE_HANDLERS = {
  transcript: getVideoTranscript,
  summary: getVideoSummary,
  outline: getVideoOutline,
  mindmap: getVideoMindmap,
  qa: getVideoQA,
  polish: getVideoPolish,
  chapters: getVideoChapters
};

async function readByType(options = {}) {
  const videoId = options['video-id'] || options['task-id'];
  const typeKey = typeof options.type === 'string' ? options.type.trim().toLowerCase() : '';

  if (videoId && typeKey) {
    const handler = TYPE_HANDLERS[typeKey];
    if (!handler) {
      throw new Error(`不支持的 --type: ${typeKey}（可选：${Object.keys(TYPE_HANDLERS).join(' / ')}）`);
    }
    return handler(options);
  }

  if (videoId) {
    for (const [key, handler] of Object.entries(TYPE_HANDLERS)) {
      if (options[key]) {
        return handler(options);
      }
    }
  }

  return assetRead(options);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await readByType(args);
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
  readByType,
  getVideoTranscript,
  getVideoSummary,
  getVideoOutline,
  getVideoMindmap,
  getVideoQA,
  getVideoPolish,
  getVideoChapters
};
