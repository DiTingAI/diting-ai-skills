#!/usr/bin/env node

const { formatJson, parseArgs } = require('../scripts/shared');
const { uploadMedia } = require('../scripts/upload');
const { transcribe, pollTask, generateSummary, generateOutline, generateQA, generateMindmap, regenerateMindmap, polishVideo, retryVideo, queryVideoList, deleteVideo } = require('../scripts/transcribe');
const { assetRead, getVideoTranscript, getVideoSummary, getVideoOutline, getVideoMindmap, getVideoQA, getVideoPolish, getVideoChapters, queryRecordList, getRecordDetail } = require('../scripts/asset_read');
const { search, queryVideoList: searchQueryVideoList, getApiKeys, createApiKey, deleteApiKey } = require('../scripts/search');
const { updateRecord, retryRecord, deleteRecord, renameRecord, moveRecord, updateVideoTags, updateVideoFolder } = require('../scripts/update_record');

const command = process.argv[2];
const args = parseArgs(process.argv.slice(3));

const commandMap = {
  upload: uploadMedia,
  transcribe: async (opts) => {
    if (opts['task-id'] && opts.poll) {
      return pollTask(opts);
    }
    if (opts['task-id'] && opts.summary) {
      return generateSummary(opts['task-id'], require('../scripts/shared').getConfig(opts));
    }
    if (opts['task-id'] && opts.outline) {
      return generateOutline(opts['task-id'], require('../scripts/shared').getConfig(opts));
    }
    if (opts['task-id'] && opts.qa) {
      return generateQA(opts['task-id'], opts.qa, require('../scripts/shared').getConfig(opts));
    }
    if (opts['task-id'] && opts.mindmap) {
      return generateMindmap(opts['task-id'], require('../scripts/shared').getConfig(opts));
    }
    if (opts['task-id'] && opts['regenerate-mindmap']) {
      return regenerateMindmap(opts['task-id'], require('../scripts/shared').getConfig(opts));
    }
    if (opts['task-id'] && opts.polish) {
      return polishVideo(opts['task-id'], require('../scripts/shared').getConfig(opts));
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
    if (opts['list-records']) {
      return queryRecordList(opts);
    }
    if (opts['record-detail']) {
      return getRecordDetail(opts);
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
    if (opts.rename) {
      return renameRecord(opts);
    }
    if (opts.move) {
      return moveRecord(opts);
    }
    if (opts['update-tags']) {
      return updateVideoTags(opts);
    }
    if (opts['update-folder']) {
      return updateVideoFolder(opts);
    }
    return updateRecord(opts);
  }
};

function printHelp() {
  console.log(`
谛听 AI CLI

Usage:
  diting <command> [options]

Commands:
  upload         Upload local audio/video and optionally create task
  transcribe     Submit transcription task, poll status, generate AI content
  asset-read     Read detail, transcript, and AI summary
  search         Search knowledge base by keywords
  update         Update record name, transcript, or meeting summary

Upload Options:
  --file         Local file path (absolute path required)
  --oss-dir      OSS directory prefix
  --create-task  Auto create transcription task after upload
  --tingwu       Use Tingwu API for transcription
  --submit-and-wait  Submit task and wait for result

Transcribe Options:
  --url          Bilibili video URL
  --upload-id    Upload ID from previous upload
  --task-id      Task ID for polling/status
  --poll         Poll task status until completed
  --summary      Generate AI summary
  --outline      Generate AI outline
  --qa           Generate QA (--qa "your question")
  --mindmap      Generate AI mindmap
  --regenerate-mindmap  Regenerate mindmap
  --polish       Generate polished content
  --retry        Retry failed task
  --list         List all videos
  --video-id     Video ID for operations

Asset-Read Options:
  --task-id      Task ID
  --asset-id     Asset ID
  --id           Record ID
  --video-id     Video ID
  --transcript   Get transcript
  --summary      Get summary
  --outline      Get outline
  --mindmap      Get mindmap
  --qa           Get QA
  --polish       Get polished content
  --chapters     Get chapters
  --list-records List records
  --record-detail Get record detail

Search Options:
  --query        Search query
  --top-k        Number of results (default: 5)
  --search-type  Search type: hybrid/bm25/vector
  --list-videos  List videos
  --list-keys    List API keys
  --create-key   Create API key
  --delete-key   Delete API key (--key-id required)

Update Options:
  --id           Record ID
  --title        New title
  --folder-id    Target folder ID
  --folder-name  Target folder name
  --tag          Tag to add
  --retry        Retry record
  --delete       Delete record
  --rename       Rename record
  --move         Move record to folder
  --update-tags  Update video tags
  --update-folder Update video folder
  --video-id     Video ID for video operations

Examples:
  diting upload --file "/path/demo.mp3" --create-task
  diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"
  diting transcribe --task-id tsk_xxx --poll
  diting transcribe --task-id tsk_xxx --summary
  diting transcribe --task-id tsk_xxx --outline
  diting transcribe --task-id tsk_xxx --qa "主要讲了什么？"
  diting transcribe --task-id tsk_xxx --mindmap
  diting transcribe --task-id tsk_xxx --polish
  diting asset-read --task-id tsk_xxx
  diting asset-read --video-id vid_xxx --transcript
  diting search --query "吴恩达"
  diting update --id 123456 --title "新标题"

Environment:
  DITING_API_KEY        Required (获取地址: https://diting.cc/home/apikey)
  DITING_API_BASE_URL   Optional (default: https://api.diting.cc)
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