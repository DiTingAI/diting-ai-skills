# 转写

## 概述

当前支持：

- 提交 B 站链接进行解析转写
- 提交音频 URL 进行听悟转写
- 查询转写任务状态
- 轮询等待任务完成

**MVP 版本限制**: 暂不支持本地上传文件（需后端 `/api/common/sign` 和 `/api/record/create` 接口）。

---

## 1. B 站视频转写

### 检查 B 站视频

```text
POST /api/v1/videos/bilibili/check
```

请求体：

```json
{
  "video_url": "https://www.bilibili.com/video/BV1f6HheYExS"
}
```

响应：

```json
{
  "code": 200,
  "data": {
    "title": "视频标题",
    "duration": "01:23:45",
    "thumbnail": "https://...",
    "is_multi_part": false,
    "parts": []
  }
}
```

### 提交处理任务

```text
POST /api/v1/videos/bilibili/process
```

请求体：

```json
{
  "videos": [
    {
      "url": "https://www.bilibili.com/video/BV1f6HheYExS",
      "title": "视频标题",
      "thumbnail": "https://...",
      "duration": "01:23:45"
    }
  ]
}
```

响应：

```json
{
  "code": 200,
  "data": {
    "success": true,
    "task_ids": ["tsk_20260703_xxxxxxxx"]
  }
}
```

---

## 2. 听悟转写

### 提交听悟任务

```text
POST /tingwu/tasks
```

请求体：

```json
{
  "source_language": "cn",
  "file_url": "https://example.com/audio.mp3",
  "task_key": "task_xxx",
  "format": "mp3",
  "sample_rate": 16000,
  "enable_transcription": true,
  "enable_summarization": true
}
```

### 提交并等待结果

```text
POST /api/v1/tingwu/tasks/submit-and-wait
```

使用相同的请求体，但会阻塞等待转写完成后返回结果。

---

## 3. 查询任务状态

### 通过 Task ID 查询

```text
GET /api/v1/videos/{task_id}/status
```

响应：

```json
{
  "code": 200,
  "data": {
    "task_id": "tsk_20260703_xxxxxxxx",
    "status": "completed",
    "progress": "100%"
  }
}
```

### 听悟任务状态

```text
GET /api/v1/tingwu/tasks/status?task_id=xxx
```

---

## 4. 获取转写结果

```text
GET /api/v1/videos/{task_id}
```

响应包含原文、纪要、思维导图等完整数据。

---

## 5. 使用建议

- 用户提供 B 站链接时，先调用 check 接口获取视频信息，再提交 process
- 用户提供音频 URL 时，使用听悟转写接口
- 查询状态时使用轮询方式，间隔建议 5-10 秒
- 状态为 completed 时获取完整结果

---

## Node 脚本

### B 站视频转写

```bash
node scripts/transcribe.js --url "https://www.bilibili.com/video/BV1f6HheYExS"
```

### 轮询状态

```bash
node scripts/transcribe.js --task-id tsk_20260703_xxxxxxxx --poll
```

### 听悟转写

```bash
node scripts/upload.js --tingwu --file-url "https://example.com/audio.mp3"
```