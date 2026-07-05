#!/usr/bin/env node

const {
  formatJson,
  getConfig,
  parseArgs,
  requestJSON
} = require('./shared');

async function updateRecord(options = {}) {
  const config = getConfig(options);
  const recordId = options.id;

  if (!recordId) {
    throw new Error('缺少 --id 参数');
  }

  const payload = {};

  if (options.title !== undefined) {
    payload.title = String(options.title);
  }

  if (options['folder-id'] !== undefined) {
    payload.folder_id = String(options['folder-id']);
  }

  if (options['folder-name'] !== undefined) {
    payload.folder_name = String(options['folder-name']);
  }

  if (options.tag !== undefined) {
    payload.tag = String(options.tag);
  }

  if (Object.keys(payload).length === 0) {
    throw new Error('至少需要指定一个更新字段: --title, --folder-id, --folder-name, --tag');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/record/update',
    body: {
      id: recordId,
      ...payload
    }
  });

  return {
    success: response.code === 200,
    request: { id: recordId, ...payload },
    response
  };
}

async function retryRecord(options = {}) {
  const config = getConfig(options);
  const recordId = options.id;

  if (!recordId) {
    throw new Error('缺少 --id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/record/retry',
    body: { id: recordId }
  });

  return {
    success: response.code === 200,
    request: { id: recordId },
    response
  };
}

async function deleteRecord(options = {}) {
  const config = getConfig(options);
  const recordId = options.id;

  if (!recordId) {
    throw new Error('缺少 --id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/record/delete',
    body: { id: recordId }
  });

  return {
    success: response.code === 200,
    request: { id: recordId },
    response
  };
}

async function renameRecord(options = {}) {
  const config = getConfig(options);
  const recordId = options.id;
  const title = options.title;

  if (!recordId) {
    throw new Error('缺少 --id 参数');
  }

  if (!title) {
    throw new Error('缺少 --title 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/record/update',
    body: {
      id: recordId,
      title: String(title)
    }
  });

  return {
    success: response.code === 200,
    request: { id: recordId, title: String(title) },
    response
  };
}

async function moveRecord(options = {}) {
  const config = getConfig(options);
  const recordId = options.id;
  const folderId = options['folder-id'];

  if (!recordId) {
    throw new Error('缺少 --id 参数');
  }

  if (!folderId) {
    throw new Error('缺少 --folder-id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/record/update',
    body: {
      id: recordId,
      folder_id: String(folderId)
    }
  });

  return {
    success: response.code === 200,
    request: { id: recordId, folder_id: String(folderId) },
    response
  };
}

async function updateVideoTags(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];
  const tags = options.tags;

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  if (!tags) {
    throw new Error('缺少 --tags 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'PUT',
    apiPath: `/api/v1/videos/${videoId}/tags`,
    body: { tags: tags.split(',') }
  });

  return {
    success: response.code === 200,
    request: { video_id: videoId, tags },
    response
  };
}

async function updateVideoFolder(options = {}) {
  const config = getConfig(options);
  const videoId = options['video-id'];
  const folderId = options['folder-id'];

  if (!videoId) {
    throw new Error('缺少 --video-id 参数');
  }

  if (!folderId) {
    throw new Error('缺少 --folder-id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'PUT',
    apiPath: `/api/v1/videos/${videoId}/folder`,
    body: { folder_id: folderId }
  });

  return {
    success: response.code === 200,
    request: { video_id: videoId, folder_id: folderId },
    response
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.retry) {
    const result = await retryRecord(args);
    console.log(formatJson(result));
    return;
  }

  if (args.delete) {
    const result = await deleteRecord(args);
    console.log(formatJson(result));
    return;
  }

  if (args.rename) {
    const result = await renameRecord(args);
    console.log(formatJson(result));
    return;
  }

  if (args.move) {
    const result = await moveRecord(args);
    console.log(formatJson(result));
    return;
  }

  if (args['update-tags']) {
    const result = await updateVideoTags(args);
    console.log(formatJson(result));
    return;
  }

  if (args['update-folder']) {
    const result = await updateVideoFolder(args);
    console.log(formatJson(result));
    return;
  }

  const result = await updateRecord(args);
  console.log(formatJson(result));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = {
  updateRecord,
  retryRecord,
  deleteRecord,
  renameRecord,
  moveRecord,
  updateVideoTags,
  updateVideoFolder
};