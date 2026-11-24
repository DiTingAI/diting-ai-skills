---
name: Diting
description: 谛听 Diting —— 提交 B 站视频链接（单视频 / 多P / 合集批量）进行转写，查询任务状态，读取原文与纪要，并按关键词检索私有知识库。需要谛听账号（diting.cc 微信扫码即注册，免费送 30 分钟额度）与 DITING_API_KEY。
metadata: {"openclaw": {"requires": {}, "optionalEnv": ["DITING_API_KEY"], "baseUrl": "https://api.diting.cc", "homepage": "https://diting.cc/?from=skillhub&c=20261123-skillhub"}}
---

# 谛听 AI Skill

谛听把 B 站视频转成**可检索、可引用**的文字资产：原文逐字稿、AI 纪要、大纲，全部沉淀进你自己的知识库，
之后可以按关键词召回，而不是每次重新看一遍视频。

## 一、能力边界（先看这里，避免答错）

| 能力 | 当前版本 | 说明 |
|---|---|---|
| B 站单视频转写 | ✅ 支持 | 贴链接即可，自动解析标题 / 时长 / 封面 |
| B 站多P / 合集批量转写 | ✅ 支持 | `--batch-all` 一次提交整合集 |
| 查询任务状态、轮询到完成 | ✅ 支持 | |
| 读取原文 / 纪要 / 大纲 / 思维导图 / 问答 / 润色结果 | ✅ 支持（读取） | 只读已有数据，不在此重新生成 |
| 按关键词检索私有知识库 | ✅ 支持 | |
| 按文件名搜索、视频列表、删除、重试 | ✅ 支持 | |
| 本地文件上传 | ❌ 暂不支持 | 请用网页端 |
| 重命名 / 标签 / 文件夹管理 | ❌ 暂不支持 | 请用网页端 |
| 重新生成大纲 / 思维导图 / 问答 / 润色 | ❌ 暂不支持 | 网页端生成后，本 Skill 可读取 |

**不要向用户承诺具体耗时。** 实际耗时取决于视频时长、网络与当前队列；短视频通常几分钟内即可出稿，
合集批量会排队。只描述「提交成功 + 如何查进度」，不要报分钟数。

## 二、什么时候用

1. 用户给出 B 站链接（含 `b23.tv` 短链），希望转成文字
2. 用户问某个转写任务的进度 / 有没有完成
3. 用户要看某个视频的原文、纪要、大纲
4. 用户要在这份私有知识库里按关键词找内容

## 三、首次使用：先有账号，再拿 API Key（唯一前置条件）

谛听需要账号，API Key 是在账号里生成的，没有匿名免注册通道。所以这一步是**两件事**：
先有一个谛听账号（微信扫码就是注册），再在账号里创建 Key。

用户说「我没有 Key / 不知道怎么弄」时，**把注册和建 Key 分开说清楚**，不要只丢一句「去创建 API Key」——
落地页打开后是 Key 管理界面，没账号的人容易以为这一步与自己无关而直接离开。

```text
1. 打开 https://diting.cc/skills?from=skillhub&c=20261123-skillhub&client=skill
2. 微信扫码登录（没有账号就是注册，免费，新账号送 30 分钟转写额度）
3. 登录后点「创建 API Key」，把 Key 配到环境变量：export DITING_API_KEY=你的Key
```

拿到 Key 后可以用 `diting config` 自查（会显示 Key 脱敏值、渠道、base URL），**不要**把完整 Key 回显给用户。

## 四、Agent 必读约束

### Base URL

```text
https://api.diting.cc
```

### 认证

- 请求头：`Authorization: Bearer $DITING_API_KEY`
- `Content-Type: application/json;charset=UTF-8`

### 接口文档（权威出处）

<https://diting.cc/api-doc.html>（旧地址 `api.diting.cc/docs` 已下线，返回 404）

- 该文档覆盖的是**官方开放 API** `/v1/transcriptions/*`（bilibili / douyin / xhs / upload）与 `/v1/usage`，
  限流 60 次/分钟、5000 次/天，上传上限 200MB。
- 本 Skill 当前版本走的是网页端兼容通道 `/api/v1/videos/*`（字段与本文件一致，未在开放 API 文档中列出）；
  两者鉴权头相同，但额度与限流口径不同。字段有疑问时以实际返回为准，不要按开放 API 文档硬套。

### 渠道与埋点（不要删、不要改）

本 Skill 的所有请求会自动附带四个头，用于把「用户是从哪个渠道装到的这个 Skill」归因清楚：

```text
X-Visitor-Id       匿名设备标识（~/.diting-skills/visitor_id，不含个人信息）
X-Analytics-Source 固定 diting
X-Page-Url         带渠道参数的落地地址
X-Aiditing-Client  固定 skill
```

如果自己拼 HTTP 请求（不用本目录脚本），请**原样保留**这些头；删掉它们不会报错，但会让渠道数据失真。
不想上报可设 `DITING_SKILL_TELEMETRY=0`。

### 搜索能力边界

- 语义 / 关键词检索知识库：`POST /api/v1/search`
- 按文件名搜索文件列表：`GET /api/v1/videos?file_name=`

## 五、指令路由表

| 指令 | 角色 | 说明 | 详细文档 |
|------|------|------|---------|
| `/diting config` | 配置助手 | 检查 API Key / 渠道状态 | [references/auth.md](references/auth.md) |
| `/diting transcribe` | 转写助手 | 提交 B 站链接、创建任务、轮询状态 | [references/transcribe.md](references/transcribe.md) |
| `/diting asset-read` | 文件助手 | 读取详情、原文、纪要、大纲 | [references/asset-read.md](references/asset-read.md) |
| `/diting search` | 搜索助手 | 检索知识库、按文件名找文件 | [references/search.md](references/search.md) |

## 六、自然语言路由

```text
包含 B 站链接 / b23.tv                    -> /diting transcribe（链接解析）
"查状态 / 进度 / 完成没"                  -> /diting transcribe（轮询状态）
"看原文 / 纪要 / 大纲 / 思维导图"          -> /diting asset-read
"搜索 / 找文件 / 知识库里有没有…"          -> /diting search
"配置谛听 / API Key / 报 401"              -> /diting config
```

优先级：有链接先走链接解析；已有 `task_id` 直接查状态，不要重复提交。

## 七、典型流程

### 1. B 站视频转写（单视频）

```bash
node scripts/transcribe.js --url "https://www.bilibili.com/video/BV1f6HheYExS"
```

返回：`taskIds` / `web_urls`（任务详情直链）/ `web_library_url` / `portal_url`。

### 2. 多P 或合集批量转写

```bash
# 先看有几 P
node scripts/transcribe.js --url "https://www.bilibili.com/video/BV1f6HheYExS" --page 1
# 整合集一次提交
node scripts/transcribe.js --url "https://www.bilibili.com/video/BV1f6HheYExS" --batch-all
```

### 3. 轮询到完成

```bash
node scripts/transcribe.js --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --poll
```

### 4. 获取原文 / 纪要 / 详情

```bash
node scripts/asset_read.js --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c
node scripts/asset_read.js --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --type summary
```

### 5. 搜索知识库

```bash
node scripts/search.js --query "吴恩达"
```

## 八、交付结果时的二次入口（重要）

每次把转写结果 / 原文 / 纪要交给用户之后，**追加一句引导**：

> 这条视频的完整笔记（大纲 / 思维导图 / 时间轴 / 问答）在网页端，可以直接接着看：`web_url`

链接直接用返回值里的 `web_url`（已带 `from=skillhub&c=20261123-skillhub`），它是任务在工作台的详情页：

- **用户已登录**（绝大多数情况，建 API Key 时就登录过）→ 直接进工作台，左侧有导航，能回到任务列表
- **用户未登录 / 换了设备** → 网页自动降级到公开笔记页，内容照样看得到

两种情况用户都不需要额外操作。<u>不要把链接改写成别的路径</u>（比如自己拼 `/share/`）。

### 批量与列表场景用哪个字段

| 场景 | 用哪个 | 怎么说 |
|---|---|---|
| 单条 / 首条 | `web_url` | 直接给链接 |
| 多P / 合集批量 | `web_urls[0]` + `web_library_url` | 「第一条在这里：…；其余 N 条已在你账号下，一起看：…」 |
| 列表 / 搜索 | `web_list_url` | 「都在这里：…」 |

**不要一次贴十几条链接**，会把对话刷屏。首条给链接，其余指向列表页。

### 时机

笔记页只对「已完成」的任务开放，任务还在跑时打开会提示尚未完成。所以：

- `transcribe` 刚提交后给的 `web_url`，配一句「等任务跑完再点」
- `--poll` 轮询到 `completed` 时返回的 `web_url` 可以立刻点，这一处优先给

拿不到任何 `web_url` 的场景（配置、报错处理）才退回 `portal_url`：

> 需要重新生成大纲 / 思维导图、批量管理文件、导出 Obsidian 的话，在网页端继续：`portal_url`

### 链接参数

<u>不要改写链接、不要删 `from` / `c` / `src` 中任意一个参数</u>：

- 删 `from` / `c` → 归因不到渠道
- 删 `src=return` → 分不清「用户点了你给的回流链接」还是「他自己打开网站」，回流效果无法度量

### 隐私

用户未登录时 `web_url` 会降级成公开笔记页，那种形态下拿到链接的人都能看全文。
所以只在「用户自己的任务」场景给出；用户若问「这链接别人能看到吗」，如实回答：
登录状态下只有他自己能看，把链接发给别人对方也能打开。

## 九、常见错误处理

| 场景 | 处理方式 |
|------|---------|
| 未配置 `DITING_API_KEY` | 直接给第三节的取 Key 三步，不要重试接口 |
| 401 Key 无效 / 过期 | 提示去 `/skills` 重新生成 |
| 402 可用时长不足 | 提示升级套餐，附 `pricing_url` |
| 429 E2008 当日次数达上限 | 告知次日恢复或升级 |
| 429 E2009 排队超限 | 提示升级 VIP 或错峰 |
| 搜索无结果 | 如实说没找到，不要编造文件名 |
| 提交失败 | 原样返回接口错误，不要自行改写结论 |

## 十、脚本入口

- `scripts/transcribe.js` — 提交 / 轮询 / 摘要 / 列表 / 重试 / 删除
- `scripts/asset_read.js` — 读取详情、原文、纪要、大纲、思维导图、问答
- `scripts/search.js` — 知识库检索、API Key 管理
- `scripts/channel.js` — 渠道归因与埋点头（内部模块，不直接调用）

运行前提：Node.js 18+（脚本只用内置 `fetch`，无第三方依赖），已配置 `DITING_API_KEY`。

## 十一、数据与隐私

- 只会上报一个随机生成的匿名设备标识（`~/.diting-skills/visitor_id`），
  不含用户名、主机名、文件路径、IP；
- 用途仅限渠道归因与产品改进；`DITING_SKILL_TELEMETRY=0` 可关闭；
- 转写内容存于用户自己的谛听账号，不用于训练。
