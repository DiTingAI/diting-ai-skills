# 更新日志

所有项目的显著变更都将记录在此文件中。

## [1.0.2] - 2026-07-06

### 已修复 - API接口对齐

**上线前 Code Review，移除不存在的API接口，确保发布后无BUG**

#### update_record.js
- ❌ 移除 `POST /api/record/update`（不存在）
- ❌ 移除 `POST /api/record/retry`（不存在）→ ✅ 改用 `POST /api/v1/videos/{id}/retry`
- ❌ 移除 `POST /api/record/delete`（不存在）→ ✅ 改用 `DELETE /api/v1/videos/{task_id}`
- ❌ 移除 `PUT /api/v1/videos/{id}/tags`（不存在）
- ❌ 移除 `PUT /api/v1/videos/{id}/folder`（不存在）

#### asset_read.js
- ❌ 移除 `GET /api/v1/videos/{id}/transcript`（不存在）→ ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `originalTranscript` 字段
- ❌ 移除 `GET /api/v1/videos/{id}/summary`（不存在）→ ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `brief_summary` / `detailed_summary` 字段
- ❌ 移除 `GET /api/v1/videos/{id}/outline`（不存在）→ ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `aiOutline` 字段
- ❌ 移除 `GET /api/v1/videos/{id}/mindmap`（不存在）→ ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `mindmap` 字段
- ❌ 移除 `GET /api/v1/videos/{id}/qa`（不存在）→ ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `qaPairs` 字段
- ❌ 移除 `GET /api/v1/videos/{id}/polish`（不存在）→ ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `polishedTranscript` 字段
- ❌ 移除 `GET /api/v1/videos/{id}/chapters`（不存在）→ ✅ 改用 `GET /api/v1/videos/{task_id}` 的 `aiOutline` 字段

#### transcribe.js
- ❌ 移除 `POST /api/record/create`（不存在）
- ❌ 移除 `POST /api/v1/videos/outline`（不存在）→ 数据通过 `GET /api/v1/videos/{task_id}` 获取
- ❌ 移除 `POST /api/v1/videos/qa`（不存在）→ 数据通过 `GET /api/v1/videos/{task_id}` 获取
- ❌ 移除 `POST /api/v1/videos/mindmap`（不存在）→ 数据通过 `GET /api/v1/videos/{task_id}` 获取
- ❌ 移除 `POST /api/v1/videos/mindmap/regenerate`（不存在）
- ❌ 移除 `POST /api/v1/videos/polish`（不存在）→ 数据通过 `GET /api/v1/videos/{task_id}` 获取

#### upload.js
- ❌ 修正 `/tingwu/tasks` → ✅ `/api/v1/tingwu/tasks`
- ❌ 修正 `/tingwu/transcription` → ✅ `/api/v1/tingwu/transcription`

#### search.js
- ✅ 修正搜索参数 `query` → `question`（符合API文档规范）

### 保留的有效接口
- `POST /api/v1/videos/bilibili/check`
- `POST /api/v1/videos/bilibili/process`
- `GET /api/v1/videos/{task_id}/status`
- `GET /api/v1/videos/{task_id}`
- `POST /api/v1/videos/summary`
- `POST /api/v1/videos/{video_id}/retry`
- `GET /api/v1/videos`
- `DELETE /api/v1/videos/{task_id}`
- `GET /v1/assets/{asset_id}`
- `POST /api/v1/search`
- `GET /api/v1/apikeys`
- `POST /api/v1/apikeys`
- `DELETE /api/v1/apikeys/{keyId}`
- `POST /api/v1/tingwu/tasks`
- `POST /api/v1/tingwu/tasks/submit-and-wait`
- `GET /api/v1/tingwu/tasks/status`
- `GET /api/v1/tingwu/transcription`

## [1.0.1] - 2026-07-05

### 已修复
- 修复 `package.json` 和 `package-lock.json` 版本号不一致问题
- 改进错误处理文档和测试覆盖

### 新增
- 添加基础单元测试套件
- 创建贡献者指南 (`CONTRIBUTING.md`)
- 添加错误处理指南 (`ERROR_HANDLING.md`)
- 配置 GitHub Actions CI/CD 流水线
- 添加测试运行脚本

### 变更
- 更新 `package.json` 添加测试脚本
- 优化构建脚本错误处理
- 改进 CLI 帮助文档

## [1.0.0] - 2026-07-03

### 新增功能
- 初始版本发布
- 支持 Bilibili 视频转写
- 支持音频文件上传和转写
- 支持知识库搜索
- 支持资产读取和更新
- 多平台二进制构建支持
- 完整的 CLI 接口

### 核心功能
- `upload`: 上传本地音频/视频文件
- `transcribe`: 提交转写任务和轮询状态
- `asset-read`: 读取资产详情、原文和 AI 摘要
- `search`: 搜索知识库
- `update`: 更新记录信息

### 技术特性
- Node.js CLI 工具
- 支持 macOS、Linux、Windows
- 预编译二进制分发
- OpenClaw Skill 集成
- 完善的错误处理和重试机制