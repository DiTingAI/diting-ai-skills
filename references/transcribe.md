# 转写

## 概述

当前支持：

- 提交 B 站链接进行解析转写
- 查询转写任务状态
- 轮询等待任务完成

**MVP 版本限制**:
- 暂不支持本地上传文件
- 暂不支持智能大纲生成、思维导图生成、问答、文本润色等AI功能（这些数据通过 `GET /api/v1/videos/{task_id}` 接口读取）
- 暂不支持视频更新、重命名、标签、文件夹等管理操作（请使用网页版 https://diting.cc）

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
      "duration": "01:23:45",
      "aid": 123456,
      "cid": 789012,
      "season_id": 0,
      "total_pages": 1,
      "pubdate": 1700000000
    }
  ],
  "orderId": ""
}
```

> **注意**: `aid`、`cid`、`season_id`、`total_pages`、`pubdate` 为可选字段。

响应：

```json
{
  "code": 200,
  "data": {
    "success": true,
    "message": "提交成功",
    "task_ids": ["task-uuid-1"],
    "success_count": 1,
    "total_count": 1,
    "failed_count": 0
  }
}
```

### 查询任务状态

```text
GET /api/v1/videos/{task_id}/status
```

### 获取视频详情

```text
GET /api/v1/videos/{task_id}
```

### 重试视频处理

```text
POST /api/v1/videos/{video_id}/retry
```

### 生成视频摘要

```text
POST /api/v1/videos/summary
```

请求体：

```json
{
  "task_id": "task-uuid-xxx"
}
```

> **注意**: 调用此接口会消耗租户的 AI 摘要配额，配额不足时返回 402 错误。

### 删除视频

```text
DELETE /api/v1/videos/{task_id}
```

---

## 2. 视频列表查询

```text
GET /api/v1/videos
```

参考参数：

| 参数 | 类型 | 说明 |
|---|---|---|
| `page` | int | 页码，默认 1 |
| `page_size` | int | 每页条数，默认 12 |
| `file_name` | string | 文件名搜索关键词 |
| `status` | array | 状态过滤 |
| `sort_field` | string | 排序字段，默认 `publishTime` |
| `sort_order` | string | 排序方向，默认 `desc` |

---

## 3. 使用建议

- 用户提供 B 站链接时，先调用 check 接口获取视频信息，再提交 process
- 查询状态时使用轮询方式，间隔建议 5-10 秒
- 状态为 completed 时获取完整结果

---

## 4. 已废弃/不存在的接口

以下接口已从代码中移除，请使用替代方案：

| 废弃接口 | 替代方案 |
|----------|----------|
| `POST /api/record/create` | 使用 B 站转写接口处理视频（音频转写暂不支持） |
| `POST /api/record/update` | 使用网页版 https://diting.cc |
| `POST /api/record/retry` | `POST /api/v1/videos/{video_id}/retry` |
| `POST /api/record/delete` | `DELETE /api/v1/videos/{task_id}` |
| `POST /api/v1/videos/outline` | 通过 `GET /api/v1/videos/{task_id}` 获取 `aiOutline` 字段 |
| `POST /api/v1/videos/qa` | 通过 `GET /api/v1/videos/{task_id}` 获取 `qaPairs` 字段 |
| `POST /api/v1/videos/mindmap` | 通过 `GET /api/v1/videos/{task_id}` 获取 `mindmap` 字段 |
| `POST /api/v1/videos/mindmap/regenerate` | 使用网页版 |
| `POST /api/v1/videos/polish` | 通过 `GET /api/v1/videos/{task_id}` 获取 `polishedTranscript` 字段 |

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

### 重试任务

```bash
node scripts/transcribe.js --video-id <video_id> --retry
```

### 删除视频

```bash
node scripts/transcribe.js --video-id <video_id> --delete
```

### 生成摘要

```bash
node scripts/transcribe.js --task-id tsk_20260703_xxxxxxxx --summary
```

### 视频列表

```bash
node scripts/transcribe.js --list --page 1 --page_size 10
```
