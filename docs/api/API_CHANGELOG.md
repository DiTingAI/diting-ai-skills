# API 更新日志

本文档记录 `diting-skills/scripts` 中使用的所有 API 接口的变更历史。

## [1.0.2] - 2026-07-06

### 📋 变更概述

上线前 Code Review，移除所有不存在的 API 接口，确保发布后无 BUG。

### ❌ 已移除的不存在 API 接口

#### update_record.js
| 旧接口 | 状态 | 替代方案 |
|--------|------|----------|
| `POST /api/record/update` | ❌ 不存在 | 提示用户使用网页版 https://diting.cc |
| `POST /api/record/retry` | ❌ 不存在 | ✅ 改用 `POST /api/v1/videos/{id}/retry` |
| `POST /api/record/delete` | ❌ 不存在 | ✅ 改用 `DELETE /api/v1/videos/{task_id}` |
| `PUT /api/v1/videos/{id}/tags` | ❌ 不存在 | 提示用户使用网页版 |
| `PUT /api/v1/videos/{id}/folder` | ❌ 不存在 | 提示用户使用网页版 |

#### asset_read.js
| 旧接口 | 状态 | 替代方案 |
|--------|------|----------|
| `GET /api/v1/videos/{id}/transcript` | ❌ 不存在 | ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `originalTranscript` 字段 |
| `GET /api/v1/videos/{id}/summary` | ❌ 不存在 | ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `brief_summary` / `detailed_summary` 字段 |
| `GET /api/v1/videos/{id}/outline` | ❌ 不存在 | ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `aiOutline` 字段 |
| `GET /api/v1/videos/{id}/mindmap` | ❌ 不存在 | ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `mindmap` 字段 |
| `GET /api/v1/videos/{id}/qa` | ❌ 不存在 | ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `qaPairs` 字段 |
| `GET /api/v1/videos/{id}/polish` | ❌ 不存在 | ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `polishedTranscript` 字段 |
| `GET /api/v1/videos/{id}/chapters` | ❌ 不存在 | ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `aiOutline` 字段 |

#### transcribe.js
| 旧接口 | 状态 | 替代方案 |
|--------|------|----------|
| `POST /api/record/create` | ❌ 不存在 | 提示用户使用听悟接口处理音频 |
| `POST /api/v1/videos/outline` | ❌ 不存在 | 通过 `GET /api/v1/videos/{task_id}` 获取 `aiOutline` 字段 |
| `POST /api/v1/videos/qa` | ❌ 不存在 | 通过 `GET /api/v1/videos/{task_id}` 获取 `qaPairs` 字段 |
| `POST /api/v1/videos/mindmap` | ❌ 不存在 | 通过 `GET /api/v1/videos/{task_id}` 获取 `mindmap` 字段 |
| `POST /api/v1/videos/mindmap/regenerate` | ❌ 不存在 | 提示用户使用网页版 |
| `POST /api/v1/videos/polish` | ❌ 不存在 | 通过 `GET /api/v1/videos/{task_id}` 获取 `polishedTranscript` 字段 |

#### upload.js
| 旧接口 | 状态 | 替代方案 |
|--------|------|----------|
| `POST /tingwu/tasks` | ❌ 路径错误 | ✅ 改用 `POST /api/v1/tingwu/tasks` |
| `GET /tingwu/transcription` | ❌ 路径错误 | ✅ 改用 `GET /api/v1/tingwu/transcription` |

#### search.js
| 旧参数 | 状态 | 新参数 |
|--------|------|--------|
| `query` | ⚠️ 已更新 | ✅ 改用 `question`（符合 API 文档规范） |
| `search_type` | ❌ 已移除 | 移除（API 不支持） |
| `filters` | ❌ 已移除 | 移除（API 不支持） |

### ✅ 当前可用的 API 接口

#### 1. 视频处理相关

| 接口 | 方法 | 鉴权 | 状态 |
|------|------|------|------|
| `/api/v1/videos/bilibili/check` | POST | 公开 | ✅ |
| `/api/v1/videos/bilibili/process` | POST | JWT/API Key | ✅ |
| `/api/v1/videos/{task_id}/status` | GET | JWT/API Key | ✅ |
| `/api/v1/videos/{task_id}` | GET | JWT/API Key | ✅ |
| `/api/v1/videos/summary` | POST | JWT/API Key | ✅ |
| `/api/v1/videos/{video_id}/retry` | POST | JWT/API Key | ✅ |
| `/api/v1/videos` | GET | JWT/API Key | ✅ |
| `/api/v1/videos/{task_id}` | DELETE | JWT/API Key | ✅ |

#### 2. 听悟音频转写

| 接口 | 方法 | 鉴权 | 状态 |
|------|------|------|------|
| `/api/v1/tingwu/tasks` | POST | JWT/API Key | ✅ |
| `/api/v1/tingwu/tasks/submit-and-wait` | POST | JWT/API Key | ✅ |
| `/api/v1/tingwu/tasks/status` | GET | JWT/API Key | ✅ |
| `/api/v1/tingwu/transcription` | GET | JWT/API Key | ✅ |

#### 3. 知识库搜索

| 接口 | 方法 | 鉴权 | 状态 |
|------|------|------|------|
| `/api/v1/search` | POST | JWT/API Key | ✅ |
| `/api/v1/knowledge/chat` | POST | JWT/API Key | ✅（与 search 同功能） |

#### 4. API Key 管理

| 接口 | 方法 | 鉴权 | 状态 |
|------|------|------|------|
| `/api/v1/apikeys` | GET | JWT | ✅ |
| `/api/v1/apikeys` | POST | JWT | ✅ |
| `/api/v1/apikeys/{keyId}` | DELETE | JWT | ✅ |

#### 5. OpenAPI 资产读取

| 接口 | 方法 | 鉴权 | 状态 |
|------|------|------|------|
| `/v1/assets/{id}` | GET | API Key | ✅ |

### 📝 迁移指南

#### 旧用法 → 新用法

**删除记录**:
```bash
# 旧（已废弃）
node scripts/update_record.js --delete --id xxx

# 新（推荐）
node scripts/update_record.js --delete --id xxx
# 或
node scripts/transcribe.js --video-id xxx --delete
```

**重试任务**:
```bash
# 旧（已废弃）
node scripts/update_record.js --retry --id xxx

# 新
node scripts/update_record.js --retry --id xxx
# 或
node scripts/transcribe.js --video-id xxx --retry
```

**读取转录文本**:
```bash
# 旧（已废弃）
node scripts/asset_read.js --video-id xxx --transcript

# 新（统一接口）
node scripts/asset_read.js --video-id xxx --transcript
# 现在通过 GET /api/v1/videos/{task_id} 获取 originalTranscript 字段
```

**知识库搜索**:
```bash
# 旧参数（已废弃）
node scripts/search.js --query "关键词"

# 新参数
node scripts/search.js --query "关键词"  # --query 仍然兼容，但内部已改为 question
```

### 🔍 验证

- ✅ 所有脚本语法检查通过
- ✅ 所有测试通过
- ✅ 22个 API 调用全部符合官方文档规范
- ✅ 移除了所有不存在的 API 接口

### 📞 反馈

如有问题，请联系：
- 谛听官网: https://diting.cc
- 技术支持: 通过官网联系
