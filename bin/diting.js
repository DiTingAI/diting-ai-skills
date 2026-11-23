#!/usr/bin/env node

const {
  apiKeyUrl,
  channel,
  formatJson,
  parseArgs,
  pricingUrl,
  skillVersion,
  getVisitorId
} = require('../scripts/shared');
const { transcribe, pollTask, generateSummary, retryVideo, queryVideoList, deleteVideo } = require('../scripts/transcribe');
const { assetRead, getVideoTranscript, getVideoSummary, getVideoOutline, getVideoMindmap, getVideoQA, getVideoPolish, getVideoChapters } = require('../scripts/asset_read');
const { search, queryVideoList: searchQueryVideoList, getApiKeys, createApiKey, deleteApiKey } = require('../scripts/search');
const { retryRecord, deleteRecord } = require('../scripts/update_record');

const command = process.argv[2];
const args = parseArgs(process.argv.slice(3));

/** API Key 脱敏：只保留前缀和后 4 位，避免 Agent 把整串 Key 打进聊天记录 */
function maskKey(key) {
  if (!key) return '';
  if (key.length <= 12) return key.slice(0, 4) + '****';
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

const commandMap = {
  config: async () => {
    const key = process.env.DITING_API_KEY || '';
    const baseURL = process.env.DITING_API_BASE_URL || 'https://api.diting.cc';
    return {
      skill_version: skillVersion,
      channel,
      api_key: key ? maskKey(key) : null,
      api_key_configured: Boolean(key),
      base_url: baseURL,
      visitor_id: getVisitorId() || null,
      telemetry: Boolean(getVisitorId()),
      get_api_key: apiKeyUrl(),
      pricing: pricingUrl()
    };
  },
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
谛听 AI CLI v${skillVersion}（渠道: ${channel}）

Usage:
  diting <command> [options]

Commands:
  transcribe     Submit transcription task, poll status, generate AI content
  asset-read     Read detail, transcript, and AI summary
  search         Search knowledge base by keywords
  update         Update record (only retry and delete are available)
  config         Show API Key / base URL / channel status

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
  DITING_API_KEY          Required. 获取地址: ${apiKeyUrl()}
  DITING_API_BASE_URL     Optional (default: https://api.diting.cc)
  DITING_SKILL_CHANNEL    Optional. 渠道标识，默认 skillhub（从其它渠道分发时覆盖）
  DITING_SKILL_CAMPAIGN   Optional. 活动标识，默认 20261123-skillhub
  DITING_SKILL_TELEMETRY  Optional. 设为 0 关闭匿名埋点上报

Note:
  - 当前版本只支持 B 站链接转写（单视频 / 多P / 合集批量），不支持本地上传。
  - 智能大纲、思维导图、问答、润色等 AI 功能的数据可通过
    diting asset-read --video-id <id> --<type> 读取，或在网页端生成。
  - 完整能力清单见 SKILL.md；变更历史见 CHANGELOG.md。
`);
}

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === '--version' || command === '-v' || command === 'version') {
  console.log(`${skillVersion} (channel=${channel})`);
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
