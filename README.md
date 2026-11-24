# 谛听 AI Skills（Diting Skill）

[![Version](https://img.shields.io/badge/version-1.0.8-green.svg)]()
[![License: MIT-0](https://img.shields.io/badge/License-MIT--0-blue.svg)](https://opensource.org/licenses/MIT-0)
[![Node](https://img.shields.io/badge/Node.js-18%2B-lightgrey.svg)]()
[![GitHub Stars](https://img.shields.io/github/stars/DiTingAI/diting-ai-skills?style=social)](https://github.com/DiTingAI/diting-ai-skills)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://ditingai.github.io/diting-ai-skills/)

**B 站视频 → 逐字稿 + AI 纪要，Agent 一句话调用；结果沉淀进可检索的私有知识库。**

适配 SkillHub / 小龙虾助手 / Cursor / Claude / Codex 等可直接执行 shell 命令的 Agent。

---

## 一、能力边界

| 能力 | 状态 |
|---|---|
| B 站单视频转写（含 `b23.tv` 短链） | ✅ |
| B 站多P / 合集批量转写（`--batch-all`） | ✅ |
| 任务状态查询、轮询到完成 | ✅ |
| 读取原文 / 纪要 / 大纲 / 思维导图 / 问答 / 润色结果 | ✅（只读） |
| 按关键词检索私有知识库、按文件名搜文件 | ✅ |
| 视频列表、重试、删除 | ✅ |
| 本地文件上传 | ❌ 暂不支持，用网页端 |
| 重命名 / 标签 / 文件夹管理 | ❌ 暂不支持，用网页端 |
| 重新生成大纲 / 思维导图 / 问答 / 润色 | ❌ 暂不支持，网页端生成后可读 |

> 不承诺具体耗时。实际耗时取决于视频时长、网络与当前队列，合集批量会排队。

---

## 二、快速开始（3 步）

> **需要谛听账号**：API Key 是在账号里生成的，没有匿名通道。还没有账号时，
> 下面第 1 步的链接用微信扫码即完成注册（免费，新账号送 30 分钟转写额度）。

### 1. 获取 API Key

打开 <https://diting.cc/skills?from=skillhub&c=20261123-skillhub&client=skill>，
微信扫码登录（没有账号就是注册），登录后点「创建 API Key」。

### 2. 配置环境变量

```bash
export DITING_API_KEY=你的Key
# 永久生效（zsh）
echo 'export DITING_API_KEY=你的Key' >> ~/.zshrc && source ~/.zshrc
```

### 3. 跑第一条命令

```bash
diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"
diting config        # 自查：Key 脱敏状态、渠道、base URL
diting --version     # 1.0.8 (channel=skillhub)
```

---

## 三、安装

### 方式 1：SkillHub / Agent 内安装（推荐）

直接把下面这句发给 Agent：

```text
请根据 https://skillhub.cn/install/skillhub.md 安装 @user_1c8b11dd/diting-ai
```

### 方式 2：一键脚本

```bash
curl -sSL https://raw.githubusercontent.com/DiTingAI/diting-ai-skills/main/install.sh | bash
```

### 方式 3：手动（源码包，零第三方依赖）

```bash
curl -L https://codeload.github.com/DiTingAI/diting-ai-skills/tar.gz/refs/heads/main -o diting-skills.tar.gz
tar -xzf diting-skills.tar.gz && cd diting-ai-skills-main
node bin/diting.js --help
```

> 脚本只用 Node 内置 `fetch`，**不需要 `npm install`**。需要 Node.js 18+。

---

## 四、用法

```bash
# 单视频转写
node scripts/transcribe.js --url "https://www.bilibili.com/video/BV1f6HheYExS"

# 看合集有几 P（默认第 1P）
node scripts/transcribe.js --url "https://www.bilibili.com/video/BV1f6HheYExS" --page 2

# 整合集一次性提交
node scripts/transcribe.js --url "https://www.bilibili.com/video/BV1f6HheYExS" --batch-all

# 查状态 / 轮询到完成
node scripts/transcribe.js --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --poll

# 读原文 / 纪要 / 详情
node scripts/asset_read.js --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c
node scripts/asset_read.js --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --type summary

# 知识库检索
node scripts/search.js --query "吴恩达"

# 视频列表 / 重试 / 删除
node scripts/transcribe.js --list --page 1 --page_size 10
node scripts/transcribe.js --video-id <id> --retry
node scripts/transcribe.js --video-id <id> --delete
```

完整指令表与自然语言路由见 [SKILL.md](SKILL.md)。

---

## 五、命令行之后去哪

命令行负责「提交 + 取文本」。重新生成大纲 / 思维导图、批量管理文件、导出 Obsidian 等结构化加工在网页端完成：

- 工作台：<https://diting.cc/home?from=skillhub&c=20261123-skillhub&client=skill>
- 额度与套餐：<https://diting.cc/pricing?from=skillhub&c=20261123-skillhub&client=skill>

`transcribe` 的返回值里带 `portal_url`，可直接给用户。

---

## 六、渠道归因与隐私

为了让「用户从哪个渠道装的这个 Skill」可归因，本 Skill 会对 `api.diting.cc` 的每次请求附带四个头：

| 请求头 | 内容 |
|---|---|
| `X-Visitor-Id` | 匿名设备标识，持久化在 `~/.diting-skills/visitor_id` |
| `X-Analytics-Source` | 固定 `diting` |
| `X-Page-Url` | 带 `from` / `c` 参数的落地地址 |
| `X-Aiditing-Client` | 固定 `skill` |

- 只上报随机匿名标识，**不含用户名、主机名、文件路径、IP**；转写内容不会被用于训练。
- 关闭上报：`export DITING_SKILL_TELEMETRY=0`
- 从其它渠道分发本包时可覆盖：`DITING_SKILL_CHANNEL` / `DITING_SKILL_CAMPAIGN`

---

## 七、常见问题

**Q: 报 401 / API Key 无效？**
去 <https://diting.cc/skills?from=skillhub&c=20261123-skillhub&client=skill> 重新生成，然后 `export DITING_API_KEY=新Key`。
（怀疑 Key 泄露时，在同一页面删除旧 Key 即可。）

**Q: 报 402 / 可用时长不足，或 429 今日次数达上限？**
免费额度按账号计。查看套餐：<https://diting.cc/pricing?from=skillhub&c=20261123-skillhub&client=skill>。

**Q: `command not found: diting`？**
用 `node bin/diting.js ...` 或自行把目录加到 PATH：

```bash
export PATH="$HOME/.diting-skills:$PATH"
```

**Q: 想转本地文件 / 抖音 / 小红书？**
当前 Skill 只支持 B 站链接。其它来源请在网页端 <https://diting.cc> 提交。

---

## 八、演示视频（录制于 v1.0.1，安装步骤请以本文为准）

[![在 B 站观看完整演示](https://img.shields.io/badge/Bilibili-观看完整演示-FB7299?style=flat-square&logo=bilibili&logoColor=white)](https://www.bilibili.com/video/BV1T7Td69EyF)

完整演示约 4 分钟：<https://www.bilibili.com/video/BV1T7Td69EyF>

> ⚠️ 这条视频录制于 2026-07-07（v1.0.1），有 3 处已经变化，**照做前先看这里**：
>
> 1. **安装方式已换**：视频里讲的是「下载 zip / 用提示词安装」，现在只要一条 `install.sh`
>    命令（见第三节）。旧提示词里的下载地址指向一个已经不存在的仓库，会 404。
> 2. **取 Key 页面已换**：`diting.cc/home/apikey` → `diting.cc/skills`
>    （用第五节那条带 `from=skillhub` 的链接）。
> 3. **能力边界**：视频里演示的「英文一键翻译」「语义润色」是**网页端**功能，
>    本 Skill 只负责「转写 → 读取原文/纪要 → 检索知识库」。
>
> 视频讲的「3 步工作流」（装 Skill → 贴链接 → 提问式学习）本身仍然成立。

## 九、版本

- **当前版本**：v1.0.8（2026-11-24）
- **变更历史**：[CHANGELOG.md](CHANGELOG.md)
- 本版重点：转写与读取结果新增**免登录笔记页直链** `web_url` / `web_urls`，把用户接回网页端
  （完整笔记、思维导图、时间轴、跨视频检索只在网页端）。上一版 1.0.6 修复了搜索误判、
  `asset-read --type`、请求真实超时等问题。

## 十、支持

- 仓库：<https://github.com/DiTingAI/diting-ai-skills>
- 问题反馈：<https://github.com/DiTingAI/diting-ai-skills/issues>
- 文档站：<https://ditingai.github.io/diting-ai-skills/>
- API 文档：<https://diting.cc/api-doc.html>

## 十一、License

MIT No Attribution（MIT-0）。仓库根目录有 [LICENSE](LICENSE)；
由于 SkillHub 不接受无扩展名文件，分发包不包含该文件，许可证全文如下：

```text
MIT No Attribution

Copyright 2026 谛听 AI

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
