#!/usr/bin/env node

const {
  formatJson,
  getConfig,
  parseArgs,
  requestJSON,
  videoDocUrl
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

  let result;

  if (videoId && typeKey) {
    const handler = TYPE_HANDLERS[typeKey];
    if (!handler) {
      throw new Error(`不支持的 --type: ${typeKey}（可选：${Object.keys(TYPE_HANDLERS).join(' / ')}）`);
    }
    result = await handler(options);
    return attachWebUrl(result, videoId);
  }

  if (videoId) {
    for (const [key, handler] of Object.entries(TYPE_HANDLERS)) {
      if (options[key]) {
        result = await handler(options);
        return attachWebUrl(result, videoId);
      }
    }
  }

  result = await assetRead(options);
  return attachWebUrl(result, videoId);
}

/**
 * 给读取结果补一个网页端详情直链（2026-11-24 新增）
 *
 * 目的：Agent 把「原文/纪要/大纲」交给用户之后，用户往往想知道
 * 「这东西在哪儿能长期看到、还能不能导出去」——命令行答不了这个问题，
 * 网页端能（思维导图、时间轴、跨视频检索、导出 Obsidian）。
 *
 * 用 ...result 浅拷贝而不是直接改对象：assetRead 返回的是接口 data，
 * 保持调用方拿到的其它字段一个不少，同时不污染原始响应。
 */
function attachWebUrl(result, explicitTaskId) {
  if (!result || typeof result !== 'object') return result;
  if (Array.isArray(result)) return result;

  // 取 id 的优先级（不要退回裸 result.id）：
  //   1. 用户显式传的 --task-id / --video-id，最可信；
  //   2. 接口返回里明确叫 taskId / task_id 的字段；
  //   3. 形状确实是 UUID 的 result.id。
  // 为什么第 3 步要校验形状：走 --asset-id 时响应来自 /v1/assets/{assetId}，
  // 它的 id 可能是 asset_id 而非 task_id，直接拿来拼 /video-doc/ 会 404。
  // 生产库 55,765 条任务全部是 UUID，所以这个校验不会误伤。
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const explicit = typeof explicitTaskId === 'string' ? explicitTaskId.trim() : '';
  const taskId = explicit
    || result.taskId
    || result.task_id
    || (typeof result.id === 'string' && UUID_RE.test(result.id) ? result.id : '');

  const url = videoDocUrl(taskId);
  if (!url) return result;

  return { ...result, web_url: url };
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
