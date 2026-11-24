# 谛听 AI Skills —— Agent 安装提示词

> 2026-11-23 重写：旧版提示词让人去下载 `cdn.diting.cc/assets/diting-skills-1.0.1.zip`，
> 那个包长期停在 1.0.1，和仓库、文档全都对不上。现在统一走 GitHub（仓库即事实源）。

## 一、复制这段发给 Agent

```text
帮我安装「谛听 AI Skills」。执行下面这条命令即可，不要下载 zip 包：

curl -sSL https://raw.githubusercontent.com/DiTingAI/diting-ai-skills/main/install.sh | bash

装完后：
1) 我需要先拿到 API Key，请给我这个链接：https://diting.cc/skills?from=skillhub&c=20261123-skillhub&client=skill
   （打开后微信扫码登录；没有账号的话，扫码即注册，免费，新账号送 30 分钟额度）
2) 我把 Key 发给你之后，执行 export DITING_API_KEY=<我给你的Key>
3) 用 diting config 自查，再用 diting transcribe --url "<B站链接>" 转写
4) 全程不要把完整 API Key 回显出来
```

## 二、安装命令（备查）

```bash
# 一键安装（推荐）
curl -sSL https://raw.githubusercontent.com/DiTingAI/diting-ai-skills/main/install.sh | bash

# 手动安装（源码包，零第三方依赖）
curl -L https://codeload.github.com/DiTingAI/diting-ai-skills/tar.gz/refs/heads/main -o diting-skills.tar.gz
tar -xzf diting-skills.tar.gz && cd diting-ai-skills-main
node bin/diting.js --help
```

前置条件：**Node.js 18+**（脚本只用内置 `fetch`，不需要 `npm install`）。

## 三、装完自检

```bash
diting --version     # 期望输出：1.0.4 (channel=skillhub)
diting config        # Key 脱敏状态、base URL、渠道、visitor_id
diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"
```

## 四、常见问题

| 现象 | 处理 |
|---|---|
| `未检测到 Node.js` | 先装 Node 18+（https://nodejs.org），再重跑安装 |
| `command not found: diting` | 用 `node ~/.diting-skills/bin/diting.js ...`，或 `export PATH="$HOME/.diting-skills:$PATH"` |
| 401 API Key 无效 | 去 `https://diting.cc/skills?from=skillhub&c=20261123-skillhub&client=skill` 重新生成 |
| 402 可用时长不足 | 引导升级：`https://diting.cc/pricing?from=skillhub&c=20261123-skillhub&client=skill` |

## 五、其它渠道分发

```bash
DITING_SKILL_CHANNEL=your-channel DITING_SKILL_CAMPAIGN=20261123-your-topic \
  curl -sSL https://raw.githubusercontent.com/DiTingAI/diting-ai-skills/main/install.sh | bash
```

渠道标识会被写进所有对外链接与埋点请求头，**不要自造白名单外的值**（白名单见
`diting-portal/docs/渠道归因链接规范.md`）。
