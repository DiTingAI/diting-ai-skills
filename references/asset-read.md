# 资产读取

## 概述

当前可读取：

- 文件详情
- 原文（逐字稿）
- AI 纪要
- 视频元数据
- AI 大纲
- 思维导图
- 问答对
- 视频标签

> **重要**: 所有数据均通过 `GET /api/v1/videos/{task_id}` 接口统一获取，从响应字段中读取。

---

## 1. 获取资产详情

### 通过 Task ID 获取（标准接口）

```text
GET /api/v1/videos/{task_id}
```

响应：

```json
{
  "code": 0,
  "data": {
    "id": "task-uuid-xxx",
    "title": "罗翔谈刑法三小时完整版",
    "thumbnail": "https://.../cover.jpg",
    "duration": "10:30",
    "originalTranscript": "原始转录文本...",
    "polishedTranscript": "润色后的转录文本...",
    "transcriptWithTimestamp": "[00:00:00] 带时间戳的文本...",
    "url": "https://.../video.mp4",
    "original_video_url": "https://www.bilibili.com/video/BV1xx",
    "bilibili_aid": 123456,
    "bilibili_cid": 789012,
    "status": "completed",
    "uploadDate": "2024-01-01",
    "processedAt": "2024-01-01T00:10:00Z",
    "aiOutline": [
      {
        "id": 1,
        "title": "章节标题",
        "start_timestamp": "00:00:00",
        "end_timestamp": "05:00",
        "duration": "05:00",
        "children": []
      }
    ],
    "ai_logic_insight": null,
    "qaPairs": [],
    "tags": ["标签1", "标签2"],
    "brief_summary": "简报摘要...",
    "detailed_summary": "详细摘要...",
    "mindmap": "mindmap data..."
  }
}
```

### 通过资产 ID 获取（OpenAPI 资产接口）

```text
GET /v1/assets/{id}
```

> **注意**: 此接口仅支持 API Key 鉴权，专为第三方集成设计。

响应：

```json
{
  "code": 0,
  "data": {
    "id": "task-uuid-xxx",
    "title": "视频标题",
    "source_url": "https://www.bilibili.com/video/BV1xx",
    "duration": 630,
    "status": "completed",
    "transcript": "完整转录文本...",
    "summary": "摘要内容...",
    "mindmap_url": "https://.../mindmap.json",
    "created_at": "2024-01-01T00:00:00Z",
    "metadata": {
      "word_count": 5000,
      "paragraph_count": 20,
      "tags": []
    }
  }
}
```

---

## 2. 数据字段说明

通过 `GET /api/v1/videos/{task_id}` 获取的主要字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 任务 ID（即视频 ID） |
| `title` | string | 视频标题 |
| `originalTranscript` | string | 原始转录文本（未经润色） |
| `polishedTranscript` | string | 润色后的转录文本 |
| `transcriptWithTimestamp` | string | 带时间戳的转录文本 |
| `aiOutline` | array | AI 生成的大纲（支持嵌套） |
| `brief_summary` | string | 简报风格摘要 |
| `detailed_summary` | string | 详细风格摘要 |
| `mindmap` | string | 思维导图数据 |
| `tags` | array | 视频标签 |
| `qaPairs` | array | 问答对 |
| `status` | string | 处理状态 |

---

## 3. 状态判断

### 主状态（status）

| 值 | 说明 |
|---|---|
| pending | 等待处理 |
| uploading | 上传中 |
| extracting_audio | 提取音频中 |
| transcribing | 语音转写中 |
| summarizing | 生成摘要中 |
| mindmapping | 生成思维导图中 |
| completed | 处理完成 |
| failed | 处理失败 |
| cancelled | 已取消 |

---

## 4. 使用建议

- 优先先查 `GET /api/v1/videos/{task_id}`
- 判断任务是否完成
- 若完成，直接读取原文、纪要、大纲、思维导图等数据
- 原文、纪要数据默认返回 API 提供的原始数据，不要对原数据做二次加工，除非用户明确说继续总结

---

## 5. 已废弃/不存在的接口

以下接口已从代码中移除，请使用替代方案：

| 废弃接口 | 替代方案 |
|----------|----------|
| `GET /api/v1/videos/{videoId}/transcript` | 通过 `GET /api/v1/videos/{task_id}` 获取 `originalTranscript` 字段 |
| `GET /api/v1/videos/{videoId}/summary` | 通过 `GET /api/v1/videos/{task_id}` 获取 `brief_summary` / `detailed_summary` 字段 |
| `GET /api/v1/videos/{videoId}/outline` | 通过 `GET /api/v1/videos/{task_id}` 获取 `aiOutline` 字段 |
| `GET /api/v1/videos/{videoId}/mindmap` | 通过 `GET /api/v1/videos/{task_id}` 获取 `mindmap` 字段 |
| `GET /api/v1/videos/{videoId}/qa` | 通过 `GET /api/v1/videos/{task_id}` 获取 `qaPairs` 字段 |
| `GET /api/v1/videos/{videoId}/polish` | 通过 `GET /api/v1/videos/{task_id}` 获取 `polishedTranscript` 字段 |
| `GET /api/v1/videos/{videoId}/chapters` | 通过 `GET /api/v1/videos/{task_id}` 获取 `aiOutline` 字段 |

---

## Node 脚本

### 获取资产详情

```bash
node scripts/asset_read.js --task-id tsk_20260703_xxxxxxxx
```

或通过 OpenAPI 资产接口：

```bash
node scripts/asset_read.js --asset-id vid_20260703_abc123
```

### 获取转录文本

```bash
# 原始转录文本
node scripts/asset_read.js --video-id tsk_20260703_xxxxxxxx --transcript --format original

# 润色后转录文本
node scripts/asset_read.js --video-id tsk_20260703_xxxxxxxx --transcript --format polished

# 带时间戳的转录文本
node scripts/asset_read.js --video-id tsk_20260703_xxxxxxxx --transcript --format timestamp

# 默认返回所有转录文本
node scripts/asset_read.js --video-id tsk_20260703_xxxxxxxx --transcript
```

### 获取摘要

```bash
node scripts/asset_read.js --video-id tsk_20260703_xxxxxxxx --summary
```

### 获取 AI 大纲

```bash
node scripts/asset_read.js --video-id tsk_20260703_xxxxxxxx --outline
```

### 获取思维导图

```bash
node scripts/asset_read.js --video-id tsk_20260703_xxxxxxxx --mindmap
```

### 获取问答对

```bash
node scripts/asset_read.js --video-id tsk_20260703_xxxxxxxx --qa
```

### 获取润色文本

```bash
node scripts/asset_read.js --video-id tsk_20260703_xxxxxxxx --polish
```

### 获取章节

```bash
node scripts/asset_read.js --video-id tsk_20260703_xxxxxxxx --chapters
```
