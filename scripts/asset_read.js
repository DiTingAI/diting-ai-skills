#!/usr/bin/env node

const {
  formatJson,
  getConfig,
  parseArgs,
  requestJSON
} = require('./shared');

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
    response = await requestJSON({
      baseURL: config.baseURL,
      token: config.token,
      method: 'GET',
      apiPath: `/api/v1/assets/${assetId}`
    });
  }

  return response.data || response;
}

async function getVideoTranscript(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: `/api/v1/videos/${videoId}/transcript`,
    query: {
      format: options.format || 'json',
      timestamp_mode: options['timestamp-mode'] || 'word'
    }
  });

  return response.data || response;
}

async function getVideoSummary(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: `/api/v1/videos/${videoId}/summary`
  });

  return response.data || response;
}

async function getVideoOutline(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: `/api/v1/videos/${videoId}/outline`
  });

  return response.data || response;
}

async function getVideoMindmap(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: `/api/v1/videos/${videoId}/mindmap`
  });

  return response.data || response;
}

async function getVideoQA(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: `/api/v1/videos/${videoId}/qa`
  });

  return response.data || response;
}

async function getVideoPolish(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: `/api/v1/videos/${videoId}/polish`
  });

  return response.data || response;
}

async function getVideoChapters(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: `/api/v1/videos/${videoId}/chapters`
  });

  return response.data || response;
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