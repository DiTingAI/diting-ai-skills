#!/usr/bin/env node

const {
  formatJson,
  getConfig,
  parseArgs,
  requestJSON
} = require('./shared');

/**
 * 删除视频
 * 接口: DELETE /api/v1/videos/{task_id} ✅ 存在
 */
async function deleteRecord(options = {}) {
  const config = getConfig(options);
  const recordId = options.id;

  if (!recordId) {
    throw new Error('缺少 --id 参数');
  }

  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'DELETE',
    apiPath: `/api/v1/videos/${recordId}`
  });

  return {
    success: response.code === 200,
    request: { id: recordId },
    response
  };
}

/**
 * 重试视频处理
 * 接口: POST /api/v1/videos/{video_id}/retry ✅ 存在
 */
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
    apiPath: `/api/v1/videos/${recordId}/retry`
  });

  return {
    success: response.code === 200,
    request: { id: recordId },
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

  // 以下功能对应的API接口不存在，已移除：
  // - 更新视频记录: POST /api/record/update ❌
  // - 重命名视频: POST /api/record/update ❌
  // - 移动视频到文件夹: POST /api/record/update ❌
  // - 更新视频标签: PUT /api/v1/videos/{videoId}/tags ❌
  // - 更新视频文件夹: PUT /api/v1/videos/{videoId}/folder ❌
  // 请使用网页版 diting.cc 进行这些操作。
  console.error('错误: 该脚本的以下功能对应的API接口不存在:');
  console.error('  - 更新视频记录 (update)');
  console.error('  - 重命名视频 (rename)');
  console.error('  - 移动视频到文件夹 (move)');
  console.error('  - 更新视频标签 (update-tags)');
  console.error('  - 更新视频文件夹 (update-folder)');
  console.error('\n请使用网页版 diting.cc 进行这些操作。');
  console.error('\n可用的功能:');
  console.error('  --retry --id <id>     重试视频处理');
  console.error('  --delete --id <id>    删除视频');
  process.exit(1);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = {
  deleteRecord,
  retryRecord
};
