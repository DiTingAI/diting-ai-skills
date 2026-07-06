#!/bin/bash

# 谛听 AI Skills - 极简安装脚本
# 专为小龙虾助手、Cursor、Claude、Codex等Agent优化

set -e

echo "🔧 安装谛听 AI Skills v1.0.1..."
echo "📥 下载安装包..."

# 下载地址
DOWNLOAD_URL="https://cdn.diting.cc/assets/diting-skills-1.0.1.zip"
INSTALL_DIR="$HOME/.diting-skills"
BIN_PATH="$INSTALL_DIR/dist/diting"

# 检测系统
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

echo "💻 系统: $OS-$ARCH"

# 下载并安装
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

if command -v curl &> /dev/null; then
    curl -L -o diting-skills.zip "$DOWNLOAD_URL"
elif command -v wget &> /dev/null; then
    wget -O diting-skills.zip "$DOWNLOAD_URL"
else
    echo "❌ 需要 curl 或 wget"
    exit 1
fi

echo "📦 解压文件..."
unzip -q diting-skills.zip
rm diting-skills.zip

# 设置权限
chmod +x "$BIN_PATH" 2>/dev/null || true

# 创建快捷方式
if [ -w "/usr/local/bin" ]; then
    ln -sf "$BIN_PATH" /usr/local/bin/diting
    echo "✅ 已创建全局命令: diting"
else
    echo "📝 请手动添加以下到PATH:"
    echo "  export PATH=\"$INSTALL_DIR/dist:\$PATH\""
    echo "  或使用: $BIN_PATH"
fi

echo ""
echo "🎉 安装完成!"
echo ""
echo "🔑 下一步: 配置API Key"
echo "1. 访问: https://diting.cc/home/apikey"
echo "2. 点击「获取 API Key」"
echo "3. 设置环境变量:"
echo "   export DITING_API_KEY=your_key_here"
echo ""
echo "🚀 使用:"
echo "   diting --help           # 查看帮助"
echo "   diting config           # 检查配置"
echo "   diting transcribe --url 'B站链接'  # 转写视频"
echo ""
echo "📚 文档: $INSTALL_DIR/README.md"