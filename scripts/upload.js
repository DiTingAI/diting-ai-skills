#!/usr/bin/env node

const {
  formatJson,
  getConfig,
  parseArgs,
  requestJSON
} = require('./shared');

/**
 * 提交听悟任务
 * 接口: POST /api/v1/tingwu/tasks ✅ 存在
 */
async function tingwuSubmitFileTask(config, params) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/v1/tingwu/tasks',
    body: {
      source_language: params.source_language || 'cn',
      file_url: params.file_url,
      task_key: params.task_key,
      format: params.format || 'mp3',
      sample_rate: params.sample_rate || 16000,
      enable_transcription: params.enable_transcription !== false,
      enable_diarization: params.enable_diarization || false,
      speaker_count: params.speaker_count || 2,
      enable_translation: params.enable_translation || false,
      target_languages: params.target_languages || [],
      enable_auto_chapters: params.enable_auto_chapters || false,
      enable_summarization: params.enable_summarization || false,
      summarization_types: params.summarization_types || [],
      enable_text_polish: params.enable_text_polish || false
    }
  });

  return response.data || response;
}

/**
 * 提交并等待听悟任务
 * 接口: POST /api/v1/tingwu/tasks/submit-and-wait ✅ 存在
 */
async function tingwuSubmitAndWait(config, params) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'POST',
    apiPath: '/api/v1/tingwu/tasks/submit-and-wait',
    body: {
      source_language: params.source_language || 'cn',
      file_url: params.file_url,
      task_key: params.task_key,
      format: params.format || 'mp3',
      sample_rate: params.sample_rate || 16000,
      enable_transcription: params.enable_transcription !== false,
      enable_diarization: params.enable_diarization || false,
      speaker_count: params.speaker_count || 2,
      enable_translation: params.enable_translation || false,
      target_languages: params.target_languages || [],
      enable_auto_chapters: params.enable_auto_chapters || false,
      enable_summarization: params.enable_summarization || false,
      summarization_types: params.summarization_types || [],
      enable_text_polish: params.enable_text_polish || false
    }
  });

  return response.data || response;
}

/**
 * 查询听悟任务状态
 * 接口: GET /api/v1/tingwu/tasks/status?task_id=<task_id> ✅ 存在
 */
async function tingwuGetTaskStatus(config, taskId) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: '/api/v1/tingwu/tasks/status',
    query: { task_id: taskId }
  });

  return response.data || response;
}

/**
 * 获取听悟转写结果
 * 接口: GET /api/v1/tingwu/transcription?url=<result_url> ✅ 存在
 */
async function tingwuGetTranscription(config, url) {
  const response = await requestJSON({
    baseURL: config.baseURL,
    token: config.token,
    method: 'GET',
    apiPath: '/api/v1/tingwu/transcription',
    query: { url }
  });

  return response.data || response;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = getConfig(args);

  if (!args.tingwu) {
    throw new Error('MVP 版本仅支持 tingwu 模式，请使用 --tingwu 参数');
  }

  const fileUrl = args['file-url'];
  if (!fileUrl) {
    throw new Error('缺少 --file-url 参数（需要提供可访问的音频文件URL）');
  }

  const tingwuParams = {
    source_language: args['source-language'] || 'cn',
    file_url: fileUrl,
    task_key: args['task-key'] || `task_${Date.now()}`,
    format: args.format || 'mp3',
    sample_rate: args['sample-rate'] || 16000,
    enable_transcription: args['enable-transcription'] !== false,
    enable_diarization: args['enable-diarization'] || false,
    speaker_count: args['speaker-count'] || 2,
    enable_translation: args['enable-translation'] || false,
    target_languages: args['target-languages'] ? args['target-languages'].split(',') : [],
    enable_auto_chapters: args['enable-auto-chapters'] || false,
    enable_summarization: args['enable-summarization'] || false,
    summarization_types: args['summarization-types'] ? args['summarization-types'].split(',') : [],
    enable_text_polish: args['enable-text-polish'] || false
  };

  let tingwuResult;
  if (args['submit-and-wait']) {
    tingwuResult = await tingwuSubmitAndWait(config, tingwuParams);
  } else {
    tingwuResult = await tingwuSubmitFileTask(config, tingwuParams);
  }

  console.log(formatJson({
    success: true,
    fileUrl,
    tingwu: tingwuResult
  }));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = {
  tingwuSubmitFileTask,
  tingwuSubmitAndWait,
  tingwuGetTaskStatus,
  tingwuGetTranscription
};
