# 转写

## 概述

当前支持四类转写输入：

- B 站链接（单视频 / 多P / 合集批量）→ `/api/v1/videos/bilibili/*`
- 抖音链接或分享文案 → `/v1/transcriptions/douyin*`
- 小红书链接或分享文案 → `/v1/transcriptions/xhs*`
- 本地音视频文件（≤ 200MB）→ `/v1/transcriptions/upload`

另支持：查询转写任务状态、轮询等待任务完成。

**版本限制**:
- 单文件上传上限 200MB（开放 API 闸门；网页端是 5GB）
- 暂不支持 YouTube / 快手 等其他平台（请使用网页版 https://diting.cc）
- 暂不支持智能大纲生成、思维导图生成、问答、文本润色等AI功能（这些数据通过 `GET /api/v1/videos/{task_id}` 接口读取）
- 暂不支持视频更新、重命名、标签、文件夹等管理操作（请使用网页版 https://diting.cc）

> **额度口径**：时长在「音频提取完成」后才扣减（diting-api `services/video_service.go` 步骤 3.13）。
> 链接不合法、平台不支持、解析失败都不会创建任务，不扣额度。

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

> ⚠️ **API Key 调不了**：该路由挂在 `mainmw.AuthRequired`（只认 JWT），用 API Key 请求返回 401
> `认证令牌无效，请重新登录`。CLI 会把这种情况说成「接口只接受网页端登录态」而不是「Key 过期」，
> 并给出网页端任务列表链接。需要删任务时引导用户去网页端。

---

## 2. 抖音 / 小红书转写（开放 API）

> 为什么不用 `/api/v1/videos/{platform}/*`：那组路由挂的是 `mainmw.AuthRequired`（只认 JWT），
> API Key 打过去必然 401。开放 API 的 `/v1/*` 走 `VerifyAPIKey`，才是给脚本用的通道。

### 检查链接并探测元数据

```text
POST /v1/transcriptions/douyin/check
POST /v1/transcriptions/xhs/check
```

请求体（可直接传 App 分享出来的整段文案，服务端会自己抠 URL）：

```json
{
  "video_url": "8.97 复制打开抖音，看看【xx】的作品 https://v.douyin.com/xxxxxxx/"
}
```

响应：

```json
{
  "code": 200,
  "data": {
    "platform": "douyin",
    "title": "视频标题",
    "duration": 183,
    "cover": "https://...",
    "author": "",
    "video_url_resolved": "https://www.douyin.com/video/7xxxxxxxxxxxx",
    "probe_failed": false
  }
}
```

> `probe_failed: true` 表示标题 / 时长没探到（链接失效、作品被删、风控拦截都可能）。
> 提交时服务端会再补探一次；**两次都拿不到时长会返回 `E1004`**：
> ```json
> {"code":400,"message":"无法获取视频时长，请稍后重试；若持续失败请改用本地上传","error":{"error_code":"E1004",...}}
> ```
> 时长是额度结算的依据，拿不到就不允许创建任务 —— 这不是 bug，而是防止「按 0 分钟计费」。
> 遇到 `E1004` 不要重复提交，改用 `--file` 传本地文件或去网页端。

### 提交转写任务

```text
POST /v1/transcriptions/douyin
POST /v1/transcriptions/xhs
```

请求体：

```json
{
  "video_url": "https://www.douyin.com/video/7xxxxxxxxxxxx",
  "title": "视频标题",
  "duration": 183,
  "thumbnail": "https://...",
  "language": ""
}
```

响应：

```json
{
  "code": 200,
  "data": {
    "task_id": "task-uuid-1",
    "file_name": "视频标题",
    "platform": "douyin"
  }
}
```

---

## 3. 本地音视频上传（开放 API）

```text
POST /v1/transcriptions/upload
Content-Type: multipart/form-data
```

表单字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | file | 是 | 音视频文件，单文件 ≤ 200MB |
| `language` | string | 否 | 源语言 ISO 639-1，留空按中文链路 |
| `client` | string | 否 | 提交终端，脚本固定 `skill` |

响应（注意后端自己又包了一层 `data`）：

```json
{
  "code": 200,
  "data": {
    "success": true,
    "data": {
      "task_ids": ["task-uuid-1"],
      "file_names": ["meeting.mp4"],
      "failed_files": [],
      "duplicate_files": [],
      "success_count": 1,
      "failed_count": 0,
      "duplicate_count": 0
    }
  }
}
```

> `duplicate_files` 非空表示同名任务已存在、没有新建。这不是错误，
> 不要因此让用户反复上传。

---

## 4. 视频列表查询

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

## 5. 使用建议

- 先调 check 探测元数据，再把 `video_url_resolved` + `title` + `duration` 带回 process（抖音 / 小红书）
- B 站先 check 拿 parts / season_id，再按单条或 `--batch-all` 提交
- 查询状态时使用轮询方式，间隔建议 5-10 秒
- 状态为 completed 时获取完整结果
- 不支持的平台 / 非法链接：直接引导到网页端，不要反复重试

---

## 6. 已废弃/不存在的接口

以下接口已从代码中移除，请使用替代方案：

| 废弃接口 | 替代方案 |
|----------|----------|
| `POST /api/record/create` | B 站用 `/api/v1/videos/bilibili/process`；抖音 / 小红书用 `/v1/transcriptions/{douyin,xhs}`；本地文件用 `/v1/transcriptions/upload` |
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

### 抖音 / 小红书视频转写

```bash
node scripts/transcribe.js --url "https://v.douyin.com/xxxxxxx/"
node scripts/transcribe.js --url "https://www.xiaohongshu.com/explore/xxxxxxx"
```

### 本地音视频上传

```bash
node scripts/transcribe.js --file "/path/to/meeting.mp4"
```

### 轮询状态

```bash
node scripts/transcribe.js --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --poll
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
node scripts/transcribe.js --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --summary
```

### 视频列表

```bash
node scripts/transcribe.js --list --page 1 --page_size 10
```
