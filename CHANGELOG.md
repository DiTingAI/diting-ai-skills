# 更新日志

所有项目的显著变更都将记录在此文件中。

## [1.0.4] - 2026-11-23

> 主题：**渠道止血 + 归因埋点**。
> 线上 1.0.2 发布于 2026-07-07，到本次发布已 139 天未更新；
> SkillHub 累计下载 791 次，但因为落地链接是裸链、CLI 不带终端标识，**一次都归因不了**。

### 新增

- **渠道归因模块** `scripts/channel.js`
  - 所有对外链接统一带 `?from=skillhub&c=20261123-skillhub`（可用 `DITING_SKILL_CHANNEL` / `DITING_SKILL_CAMPAIGN` 覆盖）
  - 落地链接从 `/home/apikey` 改为规范路径 `/skills`（前者是旧 URL，会 redirect 且 query 不可靠）
- **CLI 埋点头**：每次请求带 `X-Visitor-Id` / `X-Analytics-Source` / `X-Page-Url` / `X-Aiditing-Client`
  - 服务端在任务落库后据此补报 `upload_done`（page_url 含渠道参数），
    于是「渠道落地 → 注册 → 转写」可用 `visitor_id` 串联，**无需后端改动**
  - 匿名设备标识持久化在 `~/.diting-skills/visitor_id`，不含用户名 / 主机名 / 路径
  - `DITING_SKILL_TELEMETRY=0` 可完全关闭
- `diting config` 命令（此前 SKILL.md / README 写了但实际不存在）：输出 Key 脱敏状态、base URL、渠道、visitor_id、取 Key / 升级链接
- `diting --version` 支持（此前 README 写了但实际报 Unknown command）
- `transcribe` 结果新增 `portal_url`（带归因），作为「命令行 → 网页端」二次转化入口

### 已修复

- README 与安装命令全部指向不存在的仓库 `DiTingAI/diting-ai-skills`（404），
  一键安装 `curl .../install.sh | bash` 实为死链；真实仓库为 **DiTingAI/diting-ai-skills**
- `install.sh` 改为从 GitHub 源码包安装，不再依赖 `cdn.diting.cc` 上不存在的 `1.0.3.zip`（403）；
  同时不再强依赖 137MB 预编译二进制（脚本零第三方依赖，Node 18+ 即可）
- 文档中去掉「30 秒转写」「Convert videos to text in seconds」等耗时承诺（实际耗时取决于视频时长、网络与队列）
- 文档中 `upload` / `folder` 命令与「上传本地音频/视频」能力描述已删除（这两项在当前版本不存在）
- README 版本徽章、当前版本号、发布日期统一更新；删除 README 中重复的中文段落

### 勘误（对 1.0.3 的判断修正）

1.0.3 的变更说明写「删除服务端不存在的听悟（Tingwu）转写链路」，这个判断**是错的**：

- `POST /api/v1/tingwu/tasks`、`/api/v1/tingwu/tasks/submit-and-wait` 等路由自 **2026-02-05** 起就存在
  （`diting-api` router.go），线上探测返回 401 而非 404，且 `config_prod.yaml` 已配置
  `tingwu_endpoint` / `tingwu_app_key`。
- 因此 v1.0.3 **不是修正，而是一次能力回退**：删掉了 1.0.2 已有的音频 URL 转写入口。

本次 1.0.4 **不做恢复**，原因是：
- 听悟链路属于「音频 URL 转写」，与产品主链路（B 站视频转写）不同，且当时删它是因为
  「MVP 只保留确定可用的通道」，这个取舍本身可以接受；
- 更合适的本地文件 / 音频入口是开放 API 的 `POST /v1/transcriptions/upload`（200MB 上限，
  线上已可用），将在 1.1.0 接入，而不是回退到旧脚本。

结论：**文案按「当前不支持本地上传」如实描述，等功能接完再写。随时可查的接口清单以
`https://api.diting.cc/docs` 与 `diting-api/router/router.go` 为准，不要凭记忆判断接口存不存在。**

## [1.0.3] - 2026-07-18

### 已移除

**Code Review 清理：删除服务端不存在的听悟（Tingwu）音频转写链路，确保发布后无 BUG**

- ❌ 删除 `scripts/upload.js`（OSS 上传 + 听悟提交脚本），因服务端无对应听悟接口
- ❌ 移除 `POST /api/v1/tingwu/tasks`
- ❌ 移除 `POST /api/v1/tingwu/tasks/submit-and-wait`
- ❌ 移除 `GET /api/v1/tingwu/tasks/status`
- ❌ 移除 `GET /api/v1/tingwu/transcription`
- 同步清理 `scripts/shared.js` 中仅服务于上传功能的死代码（`ensureFileExists` / `getMimeType` / `randomId` / `buildOssKey` / `uploadToOss` / `normalizeStyle` 及 OSS 相关导入）

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
- 支持音频文件上传和转写（⚠️ v1.0.3 已移除）
- 支持知识库搜索
- 支持资产读取和更新
- 多平台二进制构建支持
- 完整的 CLI 接口

### 核心功能
- `upload`: 上传本地音频/视频文件（⚠️ v1.0.3 已移除）
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