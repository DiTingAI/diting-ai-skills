#!/bin/bash
#
# 谛听 AI Skills - 安装脚本
#
# 设计原则（2026-11-23 重写）：
#   1. 不再依赖 cdn.diting.cc 上按版本号命名的 zip —— 那些文件长期与仓库脱节，
#      线上出现过「文档给 1.0.3、CDN 只有 1.0.2」的死链。
#   2. 直接拉 GitHub 源码包：仓库里是什么，装出来就是什么，永不落后于文档。
#   3. 不装 137MB 预编译二进制：脚本零第三方依赖，Node 18+ 直接跑。
#
# 可覆盖的环境变量：
#   DITING_SKILL_HOME   安装目录（默认 ~/.diting-skills）
#   DITING_SKILL_REF    分支/标签（默认 main）
#   DITING_SKILL_CHANNEL / DITING_SKILL_CAMPAIGN  渠道归因参数
#
set -e

REPO="DiTingAI/diting-ai-skills"
REF="${DITING_SKILL_REF:-main}"
INSTALL_DIR="${DITING_SKILL_HOME:-$HOME/.diting-skills}"
CHANNEL="${DITING_SKILL_CHANNEL:-skillhub}"
CAMPAIGN="${DITING_SKILL_CAMPAIGN:-20261123-skillhub}"
TARBALL_URL="https://codeload.github.com/${REPO}/tar.gz/refs/heads/${REF}"
API_KEY_URL="https://diting.cc/skills?from=${CHANNEL}&c=${CAMPAIGN}&client=skill"

info()  { printf '\033[0;34m[INFO]\033[0m %s\n' "$1"; }
ok()    { printf '\033[0;32m[OK]\033[0m %s\n' "$1"; }
warn()  { printf '\033[1;33m[WARN]\033[0m %s\n' "$1"; }
fail()  { printf '\033[0;31m[ERROR]\033[0m %s\n' "$1"; exit 1; }

# ---------- 1. 前置检查 ----------
command -v node >/dev/null 2>&1 || fail "未检测到 Node.js。请先安装 Node.js 18+（https://nodejs.org）后重试。"

NODE_MAJOR="$(node -e 'process.stdout.write(process.versions.node.split(".")[0])' 2>/dev/null || echo 0)"
if [ "${NODE_MAJOR:-0}" -lt 18 ]; then
  fail "Node.js 版本过低（当前 v$(node -v 2>/dev/null | sed 's/^v//')），需要 18 及以上。"
fi

command -v tar >/dev/null 2>&1 || fail "未检测到 tar，无法解压安装包。"

# ---------- 2. 下载 ----------
TMP_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t diting)"
trap 'rm -rf "$TMP_DIR"' EXIT

info "下载谛听 AI Skills（${REPO}@${REF}）..."
if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$TARBALL_URL" -o "$TMP_DIR/diting-skills.tar.gz" \
    || fail "下载失败，请检查网络后重试：$TARBALL_URL"
else
  fail "未检测到 curl。请安装 curl 或改用「源码包手动安装」（见 README）。"
fi

info "解压..."
tar -xzf "$TMP_DIR/diting-skills.tar.gz" -C "$TMP_DIR" || fail "解压失败，安装包可能不完整，请重试。"
SRC_DIR="$(find "$TMP_DIR" -maxdepth 1 -type d -name 'diting-ai-skills-*' | head -n 1)"
[ -n "$SRC_DIR" ] || fail "安装包结构异常，未找到源码目录。"

# ---------- 3. 安装（保留 visitor_id） ----------
mkdir -p "$INSTALL_DIR"
if [ -f "$INSTALL_DIR/visitor_id" ]; then
  cp "$INSTALL_DIR/visitor_id" "$TMP_DIR/visitor_id.keep" 2>/dev/null || true
fi

rm -rf "${INSTALL_DIR:?}/bin" "${INSTALL_DIR:?}/scripts" "${INSTALL_DIR:?}/references"
cp -R "$SRC_DIR/bin" "$SRC_DIR/scripts" "$SRC_DIR/references" "$INSTALL_DIR/"
cp "$SRC_DIR/SKILL.md" "$SRC_DIR/README.md" "$SRC_DIR/CHANGELOG.md" "$SRC_DIR/LICENSE" "$SRC_DIR/package.json" "$INSTALL_DIR/" 2>/dev/null || true

if [ -f "$TMP_DIR/visitor_id.keep" ]; then
  mv "$TMP_DIR/visitor_id.keep" "$INSTALL_DIR/visitor_id"
fi
chmod +x "$INSTALL_DIR/bin/diting.js"

# ---------- 4. 命令入口 ----------
cat > "$INSTALL_DIR/diting" <<'LAUNCHER'
#!/bin/sh
# 谛听 AI Skills 启动器（由 install.sh 生成）
exec node "$(dirname "$0")/bin/diting.js" "$@"
LAUNCHER
chmod +x "$INSTALL_DIR/diting"

VERSION="$(node -e 'process.stdout.write(require(process.argv[1]).version)' "$INSTALL_DIR/package.json" 2>/dev/null || echo "unknown")"

if [ -w "/usr/local/bin" ]; then
  ln -sf "$INSTALL_DIR/diting" /usr/local/bin/diting
  ok "已创建全局命令：diting"
else
  warn "无 /usr/local/bin 写权限，请自行加入 PATH："
  echo "    export PATH=\"$INSTALL_DIR:\$PATH\""
fi

# ---------- 5. 收尾 ----------
ok "安装完成：v${VERSION}（渠道 ${CHANNEL}）"

# ---------- 5.1 安装上报（2026-11-25）----------
# 为什么加这一个点：
#   SkillHub 详情页显示 885 次下载，而我们站内只看到 5 个 from=skillhub 的访客。
#   中间 99.4% 的衰减发生在「下载 → 真的装成功」还是「装成功 → 愿意登录拿 Key」，
#   在此之前完全是黑盒（codeload.github.com 不给我们下载计数）。
#   有了这条事件，885 就能拆成一个可解释的三段漏斗。
#
# 三条硬约束：
#   1. 必须静默：任何失败（无网、超时、接口挂了）都不能影响安装结果，
#      所以全程 2>/dev/null + `|| true` + --max-time 3；
#   2. visitor_id 必须复用 CLI 的同一份生成逻辑（scripts/channel.js），
#      这样「安装」和之后「第一次调通」能用同一个 id 串起来，不用设备指纹；
#   3. 不带 localhost 类 page_url —— 后端会把本地地址的事件当调试流量丢弃
#      （controllers/analytics_event_controller.go 的 isLocalDevPageURL）。
VISITOR_ID="$(node -e 'try{process.stdout.write(require(process.argv[1]).getVisitorId()||"")}catch(e){}' "$INSTALL_DIR/scripts/channel.js" 2>/dev/null || true)"
if [ -n "$VISITOR_ID" ]; then
  INSTALL_PAYLOAD="{\"event_name\":\"skill_install_done\",\"label\":\"${CHANNEL}\",\"source\":\"diting\",\"visitor_id\":\"${VISITOR_ID}\",\"page_url\":\"${API_KEY_URL}\"}"
else
  INSTALL_PAYLOAD="{\"event_name\":\"skill_install_done\",\"label\":\"${CHANNEL}\",\"source\":\"diting\",\"page_url\":\"${API_KEY_URL}\"}"
fi
# ⚠️ 域名必须是 api.diting.cc，不是 diting.cc：
#   diting.cc 是前端静态站（nginx），POST /api/v1/analytics/event 会返回 405 Not Allowed；
#   而这条 curl 被 `|| true` 保护，失败时完全静默 —— 埋点会一直"看起来正常但一条都没进库"。
#   实测（2026-11-25）：diting.cc → 405；api.diting.cc → 400 event_name 不能为空（端点正常）。
curl -s -o /dev/null -X POST "https://api.diting.cc/api/v1/analytics/event" \
  -H 'Content-Type: application/json' \
  --max-time 3 \
  -d "$INSTALL_PAYLOAD" \
  >/dev/null 2>&1 || true

echo ""
echo "下一步："
echo "  1) 获取 API Key：${API_KEY_URL}"
echo "  2) export DITING_API_KEY=你的Key"
echo "  3) diting config              # 自查配置"
echo "     diting transcribe --url \"https://www.bilibili.com/video/BV1f6HheYExS\""
echo ""
echo "文档：${INSTALL_DIR}/SKILL.md"
