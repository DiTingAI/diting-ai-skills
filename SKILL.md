---
name: Diting
description: |
  Diting - 提交B站链接进行解析转写，查询状态，读取原文、纪要和文件详情，搜索知识库，提交音频文件进行听悟转写。

  **MVP 版本限制**:
  - 暂不支持本地上传文件
  - 暂不支持文件更新、重命名、标签和文件夹操作（请使用网页版 https://diting.cc 进行操作）
  - 暂不支持智能大纲、思维导图、问答、润色等AI功能（通过 `GET /api/v1/videos/{task_id}` 读取已有数据）

  当以下情况时使用此 Skill：
  (1) 用户要提交B站链接进行解析转写
  (2) 用户要查询文件处理状态、原文、纪要、详情
  (3) 用户要按关键词搜索知识库
  (4) 用户要提交音频URL进行听悟转写
metadata: {"openclaw": {"requires": {}, "optionalEnv": ["DITING_API_KEY"], "baseUrl": "https://api.diting.cc", "homepage": "https://diting.cc"}}
---

# 谛听 AI Skill

## Agent 必读约束

### Base URL

固定使用：

```text
https://api.diting.cc
```

### 认证

每次调用接口前，先检查：

- `DITING_API_KEY`

请求头：

- `Authorization: Bearer $DITING_API_KEY`
- `Content-Type: application/json;charset=UTF-8`

若用户未提供 `DITING_API_KEY`，提示其先在 [谛听 AI 开放平台](https://diting.cc/home/apikey) 配置 API Key，再继续后续请求。

### 搜索能力边界

当前支持：

- 按关键词搜索知识库：`/api/v1/search`
- 按文件名搜索文件列表：`/api/v1/videos`

---

## 指令路由表

| 指令 | 角色 | 说明 | 详细文档 |
|------|------|------|---------|
| `/diting config` | 配置助手 | 检查 API Key 配置 | [references/auth.md](references/auth.md) |
| `/diting transcribe` | 转写助手 | 提交B站链接、创建转写任务、轮询状态、提交音频URL听悟转写 | [references/transcribe.md](references/transcribe.md) |
| `/diting asset-read` | 文件助手 | 读取详情、原文、纪要 | [references/asset-read.md](references/asset-read.md) |
| `/diting search` | 搜索助手 | 搜索知识库、按文件名搜索文件列表 | [references/search.md](references/search.md) |

---

## 自然语言路由

```text
包含B站链接              -> /diting transcribe（链接解析）
“查状态/进度/完成没”      -> /diting transcribe（轮询状态）
“看原文/纪要/详情”        -> /diting asset-read
“搜索文件/找文件/知识库”   -> /diting search
“配置谛听/API Key”       -> /diting config
“听悟转写/音频转写”       -> /diting transcribe（tingwu模式）
```

优先级：

1. B站链接优先走链接解析
2. 已有 `task_id` 时可直接查询状态

---

## 典型流程

### 1. B 站视频转写

```bash
node scripts/transcribe.js --url "https://www.bilibili.com/video/BV1f6HheYExS"
```

完成后返回：

- `task_id`
- `status`
- `estimated_seconds`

### 2. 音频文件听悟转写

```bash
node scripts/upload.js --tingwu --file-url "https://example.com/audio.mp3"
```

完成后返回：

- `task_key`
- 转写结果

### 3. 查询处理状态

```bash
node scripts/transcribe.js --task-id tsk_20260703_xxxxxxxx --poll
```

### 4. 获取原文、纪要、详情

```bash
node scripts/asset_read.js --task-id tsk_20260703_xxxxxxxx
```

或按资产 ID：

```bash
node scripts/asset_read.js --asset-id vid_20260703_abc123
```

### 5. 搜索知识库

```bash
node scripts/search.js --query "吴恩达"
```

---

## 常见错误处理

| 场景 | 处理方式 |
|------|---------|
| 未配置 `DITING_API_KEY` | 提示先在开放平台获取 API Key |
| 创建任务失败 | 原样返回接口错误 |
| 搜索无结果 | 告知用户未找到匹配文件 |
| API Key 无效/过期 | 提示用户重新生成 |
| 算力额度不足 | 引导升级创始会员 |

---

## 脚本入口

- `scripts/transcribe.js`
- `scripts/asset_read.js`
- `scripts/search.js`
- `scripts/upload.js`（仅支持 tingwu 模式）

使用前提：

- Node.js 18+
- 已配置 `DITING_API_KEY`

---

## 即将上线能力

以下能力正在开发中，敬请期待：

- 📁 **本地上传** - 支持上传本地音频/视频文件
- ✏️ **内容编辑** - 更新原文、纪要等
- 📂 **文件夹管理** - 创建文件夹、移动文件
- 🧠 **智能大纲生成** - AI 自动提取视频核心结构
- 📊 **可视化思维导图** - 多维度知识图谱展示
- 📋 **核心待办行动清单** - 从视频内容自动生成待办事项
- 🚀 **多矩阵创作者洗稿工具** - 一键生成小红书、抖音脚本、知乎回答