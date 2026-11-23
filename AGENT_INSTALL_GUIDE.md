# 谛听 AI Skills —— Agent 安装指南

> 单一事实源原则（2026-11-23）：安装方式只在 [README.md](README.md) 与 `install.sh` 里维护，
> 本文只补充 Agent 场景的注意事项，避免三份文档各写一套安装步骤、最后全都过时。

## 一、装什么

谛听 AI Skills 是一个**纯 Node 脚本包**（`bin/` + `scripts/` + `references/`），
调用 `https://api.diting.cc` 完成 B 站视频转写与知识库检索。

- 前置：Node.js **18+**（用到内置 `fetch`）
- 依赖：**零**（不需要 `npm install`）
- 不装预编译二进制：历史上那种 137MB 的多平台二进制已不再分发，避免版本与仓库脱节

## 二、怎么装

```bash
# 方式 1：一键脚本
curl -sSL https://raw.githubusercontent.com/DiTingAI/diting-ai-skills/main/install.sh | bash

# 方式 2：源码包
curl -L https://codeload.github.com/DiTingAI/diting-ai-skills/tar.gz/refs/heads/main -o diting-skills.tar.gz
tar -xzf diting-skills.tar.gz && cd diting-ai-skills-main
node bin/diting.js --help
```

安装目录默认 `~/.diting-skills`，可用 `DITING_SKILL_HOME` 覆盖。
重装不会丢 `visitor_id`（渠道归因标识）。

## 三、Agent 侧要做的三件事

1. **要 Key**：把 <https://diting.cc/skills?from=skillhub&c=20261123-skillhub&client=skill> 给用户，
   让用户登录后创建并粘贴回来。
2. **配环境变量**：`export DITING_API_KEY=<Key>`（不要写进日志，不要回显完整 Key）。
3. **自查**：`diting config` 看到 `api_key_configured: true` 再开始转写。

## 四、可以放心依赖的行为

| 行为 | 说明 |
|---|---|
| 请求头自动带渠道归因 | `X-Visitor-Id` / `X-Analytics-Source` / `X-Page-Url` / `X-Aiditing-Client` |
| 埋点失败不影响业务 | 埋点走旁路，接口失败也不会阻断转写 |
| 可关闭埋点 | `DITING_SKILL_TELEMETRY=0` |
| 输出为纯 JSON | `transcribe` / `asset-read` / `search` 都是 `JSON.stringify(result, null, 2)` |

## 五、不要做的事

- ❌ 不要下载 `cdn.diting.cc/assets/diting-skills-*.zip`：按版本命名的 zip 已停更，会出现「文档有、文件无」
- ❌ 不要用 `npm install -g diting-skills`：该包未发布到 npm
- ❌ 不要自己拼 `from` / `c` 参数：渠道值必须来自白名单
- ❌ 不要向用户承诺转写耗时（取决于视频时长、网络与队列）

## 六、故障排查

```bash
node -v                                   # 是否 ≥ 18
diting --version                          # 是否 1.0.4
diting config                             # Key / 渠道 / visitor_id
curl -s -o /dev/null -w '%{http_code}\n' https://api.diting.cc/api/v1/videos  # 401 = 网络与路由正常
```

更细的错误码与重试策略见 [ERROR_HANDLING.md](ERROR_HANDLING.md)。
