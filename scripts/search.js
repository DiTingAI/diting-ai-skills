#!/usr/bin/env node

const {
  formatJson,
  getConfig,
  parseArgs,
  requestJSON
} = require('./shared');

async function searchKnowledgeBase(options = {}) {
  const config = getConfig(options);
  const query = options.query;

  if (!query) {
    throw new Error('缺少 --query 参数');
  }

  const payload = {
    query: String(query),
    top_k: parseInt(options['top-k'] || '5', 10),
    search_type: options['search-type'] || 'hybrid'
  };

  if (options['created-after']) {
    payload.filters = payload.filters || {};
    payload.filters.created_after = options['created-after'];
  }

  if (options.tags) {
    payload.filters = payload.filters || {};
    payload.filters.tags = options.tags.split(',').map(t => t.trim());
  }

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
    total: response.data?.total || 0,
    results: response.data?.results || []
  };
}

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

async function createApiKey(options = {}) {
  const config = getConfig(options);

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/v1/apikeys',
    body: { name: options.name || 'CLI Generated' }
  });

  return {
    success: response.code === 200,
    key: response.data || response
  };
}

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