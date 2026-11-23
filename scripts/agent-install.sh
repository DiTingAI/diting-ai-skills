#!/bin/bash
#
# 谛听 AI Skills - Agent 安装入口（简易包装）
#
# 2026-11-23 重写说明：
#   旧版走 cdn.diting.cc 上按版本号命名的 zip，并依赖包内的 dist/ 预编译二进制。
#   那些 zip 长期停留在 1.0.1/1.0.2，而文档早就写到 1.0.3/1.0.4，结果是「有文档、没文件」的死链；
#   二进制包本身还有 137MB 和 glibc 兼容问题。
#
#   现在统一收敛到仓库根目录的 install.sh：
#     · 从 GitHub 源码包安装（仓库是唯一事实源）
#     · 只需要 Node.js 18+，零第三方依赖
#     · 保留 ~/.diting-skills/visitor_id（渠道归因标识跨版本不丢）
#
#   本脚本保留旧入口，避免历史文档里的地址 404。
#
set -e

REPO="DiTingAI/diting-ai-skills"
REF="${DITING_SKILL_REF:-main}"
INSTALL_SCRIPT_URL="https://raw.githubusercontent.com/${REPO}/${REF}/install.sh"

info() { printf '\033[0;34m[INFO]\033[0m %s\n' "$1"; }
fail() { printf '\033[0;31m[ERROR]\033[0m %s\n' "$1"; exit 1; }

command -v curl >/dev/null 2>&1 || fail "需要 curl，请先安装。"
command -v bash >/dev/null 2>&1 || fail "需要 bash。"

info "拉取安装脚本：${INSTALL_SCRIPT_URL}"
REMOTE_SCRIPT="$(mktemp)"
trap 'rm -f "$REMOTE_SCRIPT"' EXIT
curl -fsSL "$INSTALL_SCRIPT_URL" -o "$REMOTE_SCRIPT" || fail "安装脚本下载失败，请检查网络。"

info "执行安装（等价于 install.sh）..."
bash "$REMOTE_SCRIPT" "$@"
