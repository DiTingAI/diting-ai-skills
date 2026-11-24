# 更新日志

所有项目的显著变更都将记录在此文件中。

## [1.0.8] - 2026-11-24

> 主题：**把「需要账号」说在前面**。命令与返回结构一行没改，只修一件事：
> 用户装完 Skill 之后，不知道自己还缺一个账号。

### 修正

- **`SKILL.md` 的 `description` 标明前置条件**
  加上「需要谛听账号（diting.cc 微信扫码即注册，免费送 30 分钟额度）」。
  这一行是 SkillHub 列表页上用户唯一会读到的文字，此前只写了 `DITING_API_KEY`，
  读起来像一个装完就能直接跑的工具。

- **`SKILL.md` 第三节改为「先有账号，再拿 API Key」**
  原文只有一句「登录后点创建 API Key」，隐含了「你已经有账号」这个前提。
  现在把注册与建 Key 拆成两个明确步骤，并补了一条给 Agent 的行为约束：
  用户说没有 Key 时，要把注册讲清楚，不能只回一句「去创建 API Key」。

- **`README.md` / `AGENT_INSTALL_GUIDE.md` / `AGENT_INSTALL_PROMPT.md` 同步同一口径**
  三个安装入口都补上账号说明，避免文档之间说法不一致。

### 依据

1.0.7 上线后，渠道漏斗显示断点在「建 Key」而不是安装：
落地到 `/skills` 的访客走到了页面，但页面本身是 Key 管理界面，
没账号的人看到它，无法判断自己该做什么。这一版只改文案，
对已安装用户、已有 Key 的用户没有任何影响。

### 兼容性

- 命令行参数、返回字段、接口地址：**完全不变**。
- 已配置 `DITING_API_KEY` 的用户无需任何操作。

## [1.0.7] - 2026-11-24

> 主题：**把用户接回网页端**。前六版解决的是「能不能用」，这一版解决「用完往哪走」。

### 新增

- **`transcribe` 返回 `web_urls` + `web_library_url`**
  此前只有 `portal_url`（通用落地页 `/skills`），用户点进去还要自己再找一遍任务，
  承接就断在这一步。现在每条任务给一条 `/video-doc/{task_id}`（与 `taskIds` 一一对应），
  另给一个任务列表页 `/home`，供批量场景收口。
- **`transcribe --poll` 完成后返回 `web_url`**
  任务完成的那一刻是用户最想看「完整笔记长什么样」的时刻，链接直接给到位。
- **`transcribe --list` 返回 `web_list_url`**
  列表 / 搜索场景没有单一 task_id，此前 Agent 只能把文件名念一遍，用户没有出口。
- **`asset-read` 全类型返回 `web_url`**
  `--type transcript / summary / outline / mindmap / qa / polish / chapters`
  以及不带 `--type` 的整份详情，都带上了同一条直链（`attachWebUrl` 统一注入）。
- `scripts/channel.js` 新增 `videoDocUrl(taskId)` 与 `libraryUrl()`，复用 `from` / `c` 归因参数。
- **回流链接带 `src=return` 标记（可测量性前提，数据校验后追加）**

  网页端的 `from=skillhub` 是**首触持久化**的（`attribution.js:118`）：用户只要从 `/skills`
  进来过一次，之后所有埋点的 `page_url` 都会被自动补上 `from=skillhub`。
  于是「用户点了本 Skill 给的回流链接」和「用户自己打开网站」在数据上完全一致，
  **回流效果无法归因** —— 加了钩子却测不出钩子的效果，等于没做。

  `appendAttribution` 遇到已带 `from` 的 URL 会原样返回（`attribution.js:163`），
  所以显式写进 URL 的 `src=return` 会完整落进 `page_url`；`parseAttribution`
  只解析 `from`/`c`，不受影响。

  上线后一条 SQL 即可算出回流：
  ```sql
  SELECT COUNT(DISTINCT visitor_id) AS return_uv
  FROM analytics_events WHERE page_url LIKE '%src=return%';
  ```

### 为什么落地页是 `/video-doc/` 而不是 `/share/`

skill 用户 100% 已经注册过（用 skill 的前提就是登录建 API Key）。
`/share/{id}` 是给**未注册访客**看的分享页，CTA 全是「注册 / 免费体验」，
对已有账号的人无效，也形不成「这是我的知识库」的认知。
`/video-doc/{id}` 是工作台详情页，左侧有导航、能回到任务列表，才具备资产沉淀感。

登录墙问题由前端解决：**配套改动 `diting-portal` 的路由守卫**，
`/video-doc/:id`、`/video-classic/:id` 未登录时不再踢回首页，
改为降级重定向到 `/share/{id}`（保留 `from` / `c` 参数）。
于是同一个链接对两类人都成立：

- 已登录 → 工作台详情页（大多数情况）
- 未登录 / 换设备 / 链接被转发 → 公开笔记页，内容照常可见

### 修复

- **文档里的 `task_id` 格式是错的**
  全包 62 处示例写作 `tsk_20260703_xxxxxxxx` 这类 `tsk_` 前缀格式，
  但生产库 55,765 条任务 **100% 是 UUID**，`tsk_` 前缀 0 条。
  更严重的是 `basic-usage.md` 里 `grep -o "tsk_[^ ]*"` 的提取脚本，
  对真实输出**永远匹配不到**，整套自动化示例是失效的。
  现已全部改为 UUID 形态，提取命令改用 UUID 正则。
- **`attachWebUrl` 的 id 取值加形状校验**
  走 `--asset-id` 时响应来自 `/v1/assets/{assetId}`，其 `id` 可能是 asset_id 而非 task_id，
  直接拼 `/video-doc/` 会 404。现在优先用显式 `--task-id`，其次 `taskId` 字段，
  最后才用「形状确实是 UUID」的 `id`。

### 说明

- 不改后端接口，链接由 CLI 侧用 `task_id` 自行拼接；`task_id` 即详情接口返回的 `id`。
- 归因口径不变：`from=skillhub&c=20261123-skillhub&client=skill`，
  网页端落地事件会带着这组参数落到 `analytics_events.page_url`，可直接统计「链接回流率」。
- **时机**：详情页与分享页都只对 `completed` 任务开放，未完成时打开会提示尚未完成。
  `transcribe` 提交后返回的 `web_urls` 需等任务跑完才可点，
  `--poll` 完成后返回的 `web_url` 可立即使用；`SKILL.md` 已注明这一点。
- **隐私**：用户未登录时链接会降级成公开笔记页，那种形态下持有链接者即可查看完整内容
  （后端 `/share/{task_id}` 的凭证模型是「标识不可枚举即凭证」，只按 task_id 查、不校验归属）。
  `SKILL.md` 第八节要求 Agent 只在「用户自己的任务」场景给出该链接，并在用户询问时如实说明。

## [1.0.6] - 2026-11-24

> 主题：**回归测试修复**。三个功能性问题，都是 1.0.2 起就存在的既存缺陷，
> 与 1.0.4 / 1.0.5 的渠道归因改动无关（那两版改动已全部通过回归）。

### 修复

- **`search` 恒返回 `success: false`**
  `/api/v1/search` 对应后端 `KnowledgeBaseController.Chat`，响应体是
  `{ answer, references, task_ids }`，**没有 `code` 字段**；原实现判 `response.code === 0`，
  于是每次搜索都被判为失败，Agent 会据此回「查询失败」。
  现改为「requestJSON 对非 2xx 已抛错，能走到返回即成功」，同时保留 `code` 兼容分支。
- **`search` 的引用来源恒为空**
  真实字段叫 `references`，原代码读 `sources` → 永远拿到空数组。
  现在同时输出 `references`（新）与 `sources`（兼容旧调用），并补充 `task_ids`。
- **`asset-read` 按类型读取被静默忽略**
  SKILL.md 与对外示例写的是 `--task-id … --type summary`，但脚本只认
  `--video-id` + 布尔开关（`--summary`）。照文档执行会返回整份详情而不是纪要，且不报错。
  现在两种写法等价：新增 `--type`（transcript / summary / outline / mindmap / qa / polish / chapters），
  `--task-id` 与 `--video-id` 互为别名；非法 `--type` 会明确报错并列出可选值。
- **请求超时形同虚设**
  原 `extraHeaders: { timeout: '600000' }` 只是把 `timeout` 当成一个无意义的 HTTP 头发出去，
  没有任何超时控制，网络挂起时 CLI 会一直卡住。改为 `AbortSignal.timeout`（纪要 10 分钟），
  超时给出中文提示（含秒数与 URL）。
- **`update` 兜底提示的链接不可归因**
  未支持的更新操作提示里是裸链 `https://diting.cc`，已补 `from` / `c` 参数，与归因规范一致。

### 文档

- API 文档地址更新为 <https://diting.cc/api-doc.html>（旧地址 `api.diting.cc/docs` 已 404），
  涉及 README / SKILL / CHANGELOG / RELEASE_NOTES / SKILLS_RELEASE_SUMMARY / docs / examples 共 7 处
- SKILL.md 新增「接口文档（权威出处）」小节：说明官方开放 API `/v1/transcriptions/*` 与本 Skill
  当前走的网页端兼容通道 `/api/v1/videos/*` 是两套入口，字段有疑问时以实际返回为准
- references/asset-read.md 补充 `--type` / `--task-id` 两种等价写法的说明

### 回归验证

| 层级 | 结果 |
|---|---|
| CLI 命令矩阵（本地 mock，35 条用例） | 31 条正常 + 4 条预期报错；31/31 请求带齐渠道埋点头 |
| Skills 单测 | 4/4 通过 |
| Portal 单测 | 72 文件 / 1134 用例通过 |
| Portal 构建 | 构建成功 + prerender 14/14 + SEO 门禁通过 |
| API | `go build ./...` + models/middleware 测试通过 |

## [1.0.5] - 2026-11-23

> 纯文档/打包同步版，**无代码行为变更**（脚本与 1.0.4 完全一致）。

### 变更

- README 恢复演示视频章节（B 站 `BV1T7Td69EyF`，录制于 v1.0.1），并逐条标注 3 处已变化：
  安装方式（zip/提示词 → `install.sh`）、取 Key 页面（`/home/apikey` → `/skills`）、
  能力边界（英文翻译/语义润色属网页端，Skill 只做转写/读取/检索）
- README 章节号顺延（演示视频 八、版本 九、支持 十、License 十一）

### 为什么单独发一版

SkillHub 的「文件」页（README 渲染）读的是**上传包内**的 README，而不是 GitHub 上的。
1.0.4 包已审核通过并在线上，但包里没有演示视频段；不重新打包，SkillHub 上永远看不到该章节。
按语义化版本，这种「只换文档、不动行为」的同步发一版 patch 比改已发布包更安全——
已装 1.0.4 的用户不受影响，也不需要理解为什么版本号没变内容却变了。

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
`https://diting.cc/api-doc.html` 与 `diting-api/router/router.go` 为准，不要凭记忆判断接口存不存在。**

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