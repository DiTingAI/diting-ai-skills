#!/usr/bin/env node

const { formatJson, parseArgs } = require('../scripts/shared');
const { transcribe, pollTask, generateSummary, retryVideo, queryVideoList, deleteVideo } = require('../scripts/transcribe');
const { assetRead, getVideoTranscript, getVideoSummary, getVideoOutline, getVideoMindmap, getVideoQA, getVideoPolish, getVideoChapters } = require('../scripts/asset_read');
const { search, queryVideoList: searchQueryVideoList, getApiKeys, createApiKey, deleteApiKey } = require('../scripts/search');
const { retryRecord, deleteRecord } = require('../scripts/update_record');

const command = process.argv[2];
const args = parseArgs(process.argv.slice(3));

const commandMap = {
  transcribe: async (opts) => {
    if (opts['task-id'] && opts.poll) {
      return pollTask(opts);
    }
    if (opts['task-id'] && opts.summary) {
      return generateSummary(opts['task-id'], require('../scripts/shared').getConfig(opts));
    }
    if (opts['video-id'] && opts.retry) {
      return retryVideo(opts['video-id'], require('../scripts/shared').getConfig(opts));
    }
    if (opts.list) {
      return queryVideoList(require('../scripts/shared').getConfig(opts), opts);
    }
    if (opts['video-id'] && opts.delete) {
      return deleteVideo(opts['video-id'], require('../scripts/shared').getConfig(opts));
    }
    return transcribe(opts);
  },
  'asset-read': async (opts) => {
    if (opts['video-id'] && opts.transcript) {
      return getVideoTranscript(opts);
    }
    if (opts['video-id'] && opts.summary) {
      return getVideoSummary(opts);
    }
    if (opts['video-id'] && opts.outline) {
      return getVideoOutline(opts);
    }
    if (opts['video-id'] && opts.mindmap) {
      return getVideoMindmap(opts);
    }
    if (opts['video-id'] && opts.qa) {
      return getVideoQA(opts);
    }
    if (opts['video-id'] && opts.polish) {
      return getVideoPolish(opts);
    }
    if (opts['video-id'] && opts.chapters) {
      return getVideoChapters(opts);
    }
    return assetRead(opts);
  },
  search: async (opts) => {
    if (opts['list-videos']) {
      return searchQueryVideoList(opts);
    }
    if (opts['list-keys']) {
      return getApiKeys(opts);
    }
    if (opts['create-key']) {
      return createApiKey(opts);
    }
    if (opts['delete-key']) {
      return deleteApiKey(opts);
    }
    return search(opts);
  },
  update: async (opts) => {
    if (opts.retry) {
      return retryRecord(opts);
    }
    if (opts.delete) {
      return deleteRecord(opts);
    }
    // 其他更新操作（rename, move, update-tags, update-folder）的API不存在
    // 请使用网页版 https://diting.cc 进行操作
    throw new Error('该更新功能暂不可用。可用功能: --retry, --delete。请使用网页版 https://diting.cc 进行其他更新操作。');
  }
};

function printHelp() {
  console.log(`
谛听 AI CLI

Usage:
  diting <command> [options]

Commands:
  transcribe     Submit transcription task, poll status, generate AI content
  asset-read     Read detail, transcript, and AI summary
  search         Search knowledge base by keywords
  update         Update record (only retry and delete are available)

Transcribe Options:
  --url          Bilibili video URL
  --task-id      Task ID for polling/status
  --poll         Poll task status until completed
  --summary      Generate AI summary
  --retry        Retry failed task
  --list         List all videos
  --video-id     Video ID for operations
  --delete       Delete video

Asset-Read Options:
  --task-id      Task ID
  --asset-id     Asset ID
  --video-id     Video ID
  --transcript   Get transcript
  --summary      Get summary
  --outline      Get outline
  --mindmap      Get mindmap
  --qa           Get QA
  --polish       Get polished content
  --chapters     Get chapters

Search Options:
  --query        Search query
  --top-k        Number of results (default: 5)
  --list-videos  List videos
  --list-keys    List API keys
  --create-key   Create API key
  --delete-key   Delete API key (--key-id required)

Update Options:
  --id           Record ID
  --retry        Retry record
  --delete       Delete record

Examples:
  # B 站视频转写
  diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"

  # 轮询状态
  diting transcribe --task-id tsk_xxx --poll

  # 生成摘要
  diting transcribe --task-id tsk_xxx --summary

  # 读取资产详情
  diting asset-read --task-id tsk_xxx

  # 读取转录文本
  diting asset-read --video-id tsk_xxx --transcript

  # 知识库搜索
  diting search --query "吴恩达"

  # 重试/删除记录
  diting update --id tsk_xxx --retry
  diting update --id tsk_xxx --delete

Environment:
  DITING_API_KEY        Required (获取地址: https://diting.cc/home/apikey)
  DITING_API_BASE_URL   Optional (default: https://api.diting.cc)

Note:
  v1.0.2 - 已完成 Code Review，移除了不存在的API接口
  部分功能（如智能大纲生成、思维导图生成、问答、文本润色等AI功能）
  暂不支持，请通过 diting asset-read --video-id <id> --<type> 读取已有数据。
  详细变更请参考: docs/api/API_CHANGELOG.md
`);
}

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

const script = commandMap[command];
if (!script) {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

(async () => {
  const result = await script(args);
  console.log(formatJson(result));
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
