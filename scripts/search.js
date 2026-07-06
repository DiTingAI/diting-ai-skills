#!/usr/bin/env node

const {
  formatJson,
  getConfig,
  parseArgs,
  requestJSON
} = require('./shared');

/**
 * 知识库搜索 / 问答
 * 接口: POST /api/v1/search ✅ 存在
 */
async function searchKnowledgeBase(options = {}) {
  const config = getConfig(options);
  const query = options.query || options.question;

  if (!query) {
    throw new Error('缺少 --query 或 --question 参数');
  }

  // 根据API文档，参数为: question, top_k, stream
  const payload = {
    question: String(query),
    top_k: parseInt(options['top-k'] || '5', 10),
    stream: false
  };

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/v1/search',
    body: payload
  });

  return {
    success: response.code === 0,
    request: payload,
    answer: response.data?.answer || response.answer || '',
    sources: response.data?.sources || response.sources || [],
    total_tokens: response.data?.total_tokens || response.total_tokens || 0
  };
}

/**
 * 查询视频列表
 * 接口: GET /api/v1/videos ✅ 存在
 */
async function queryVideoList(options = {}) {
  const config = getConfig(options);

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

  return {
    success: response.code === 200,
    request: options,
    ...(response.data || response)
  };
}

/**
 * 获取 API Key 列表
 * 接口: GET /api/v1/apikeys ✅ 存在
 */
async function getApiKeys(options = {}) {
  const config = getConfig(options);

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: '/api/v1/apikeys'
  });

  return {
    success: response.code === 200,
    keys: response.data || []
  };
}

/**
 * 创建 API Key
 * 接口: POST /api/v1/apikeys ✅ 存在
 */
async function createApiKey(options = {}) {
  const config = getConfig(options);

  // 根据API文档，参数为: name, scopes, expires_in_days
  const payload = {
    name: options.name || 'CLI Generated'
  };

  if (options.scopes) {
    payload.scopes = options.scopes.split(',').map(s => s.trim());
  }

  if (options['expires-in-days']) {
    payload.expires_in_days = parseInt(options['expires-in-days'], 10);
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/v1/apikeys',
    body: payload
  });

  return {
    success: response.code === 200,
    key: response.data || response
  };
}

/**
 * 删除 API Key
 * 接口: DELETE /api/v1/apikeys/{keyId} ✅ 存在
 */
async function deleteApiKey(options = {}) {
  const config = getConfig(options);
  const keyId = options['key-id'];

  if (!keyId) {
    throw new Error('缺少 --key-id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'DELETE',
    apiPath: `/api/v1/apikeys/${keyId}`
  });

  return {
    success: response.code === 200,
    response
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args['list-videos']) {
    const result = await queryVideoList(args);
    console.log(formatJson(result));
    return;
  }

  if (args['list-keys']) {
    const result = await getApiKeys(args);
    console.log(formatJson(result));
    return;
  }

  if (args['create-key']) {
    const result = await createApiKey(args);
    console.log(formatJson(result));
    return;
  }

  if (args['delete-key']) {
    const result = await deleteApiKey(args);
    console.log(formatJson(result));
    return;
  }

  const result = await searchKnowledgeBase(args);
  console.log(formatJson(result));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = {
  search: searchKnowledgeBase,
  queryVideoList,
  getApiKeys,
  createApiKey,
  deleteApiKey
};
