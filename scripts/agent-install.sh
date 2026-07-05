#!/bin/bash

# 谛听 AI Skills - Agent 自动安装脚本
# 支持小龙虾助手、Cursor、Claude、Codex等主流Agent

set -e

VERSION="1.0.1"
DOWNLOAD_URL="https://oss.diting.cc/assets/diting-skills-${VERSION}.zip"
INSTALL_DIR="$HOME/.diting-skills"
BIN_DIR="/usr/local/bin"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检测操作系统
detect_os() {
    case "$(uname -s)" in
        Darwin*)
            OS="macos"
            if [[ "$(uname -m)" == "arm64" ]]; then
                ARCH="arm64"
                BINARY_NAME="diting-macos-arm64"
            else
                ARCH="x64"
                BINARY_NAME="diting-macos-x64"
            fi
            ;;
        Linux*)
            OS="linux"
            ARCH="x64"
            BINARY_NAME="diting-linux-x64"
            ;;
        CYGWIN*|MINGW*|MSYS*)
            OS="windows"
            ARCH="x64"
            BINARY_NAME="diting-win-x64.exe"
            ;;
        *)
            OS="unknown"
            ARCH="unknown"
            BINARY_NAME="diting"
            ;;
    esac
    log_info "检测到系统: $OS-$ARCH"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查curl或wget
    if command -v curl &> /dev/null; then
        DOWNLOAD_CMD="curl -L -o"
    elif command -v wget &> /dev/null; then
        DOWNLOAD_CMD="wget -O"
    else
        log_error "需要 curl 或 wget，请先安装"
        exit 1
    fi
    
    # 检查unzip
    if ! command -v unzip &> /dev/null; then
        log_error "需要 unzip，请先安装"
        exit 1
    fi
    
    # 检查Node.js（可选）
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_info "检测到 Node.js $NODE_VERSION"
    else
        log_warning "未检测到 Node.js，将使用预编译二进制文件"
    fi
}

# 下载安装包
download_package() {
    log_info "下载谛听 AI Skills v${VERSION}..."
    
    TEMP_ZIP="/tmp/diting-skills-${VERSION}.zip"
    
    if [ -f "$TEMP_ZIP" ]; then
        log_info "发现已下载的安装包，跳过下载"
    else
        log_info "从 $DOWNLOAD_URL 下载..."
        $DOWNLOAD_CMD "$TEMP_ZIP" "$DOWNLOAD_URL"
        
        if [ ! -f "$TEMP_ZIP" ]; then
            log_error "下载失败"
            exit 1
        fi
    fi
    
    echo "$TEMP_ZIP"
}

# 安装包
install_package() {
    local zip_file="$1"
    
    log_info "安装到 $INSTALL_DIR..."
    
    # 清理旧版本
    if [ -d "$INSTALL_DIR" ]; then
        log_info "发现旧版本，备份并清理..."
        BACKUP_DIR="$INSTALL_DIR.backup.$(date +%Y%m%d%H%M%S)"
        mv "$INSTALL_DIR" "$BACKUP_DIR"
        log_info "旧版本已备份到: $BACKUP_DIR"
    fi
    
    # 创建安装目录
    mkdir -p "$INSTALL_DIR"
    
    # 解压文件
    log_info "解压安装包..."
    unzip -q "$zip_file" -d "$INSTALL_DIR"
    
    # 设置权限
    chmod -R 755 "$INSTALL_DIR/bin"
    chmod -R 755 "$INSTALL_DIR/scripts"
    
    # 选择适合的二进制文件
    select_binary "$INSTALL_DIR"
    
    # 创建全局链接
    create_symlink
}

# 选择二进制文件
select_binary() {
    local install_dir="$1"
    
    log_info "选择适合 $OS-$ARCH 的二进制文件..."
    
    # 检查预编译二进制
    local binary_path=""
    
    case "$OS" in
        macos)
            if [ "$ARCH" = "arm64" ]; then
                binary_path="$install_dir/dist/diting-macos-arm64"
            else
                binary_path="$install_dir/dist/diting-macos-x64"
            fi
            ;;
        linux)
            binary_path="$install_dir/dist/diting-linux-x64"
            ;;
        windows)
            binary_path="$install_dir/dist/diting-win-x64.exe"
            ;;
        *)
            binary_path="$install_dir/dist/diting"
            ;;
    esac
    
    if [ -f "$binary_path" ]; then
        log_success "找到预编译二进制: $(basename "$binary_path")"
        chmod +x "$binary_path"
        echo "$binary_path"
    else
        log_warning "未找到预编译二进制，将使用Node.js版本"
        echo "$install_dir/bin/diting.js"
    fi
}

# 创建符号链接
create_symlink() {
    local binary_path="$1"
    
    log_info "创建全局命令链接..."
    
    # 检查是否已经有diting命令
    if command -v diting &> /dev/null; then
        log_warning "发现已存在的diting命令，跳过创建链接"
        return
    fi
    
    # 尝试创建到/usr/local/bin的链接
    if [ -w "$BIN_DIR" ]; then
        ln -sf "$binary_path" "$BIN_DIR/diting"
        log_success "已创建全局命令: $BIN_DIR/diting"
    else
        # 尝试使用sudo
        if command -v sudo &> /dev/null; then
            log_info "需要sudo权限创建全局链接..."
            sudo ln -sf "$binary_path" "$BIN_DIR/diting" && \
            log_success "已创建全局命令: $BIN_DIR/diting"
        else
            log_warning "无法创建全局链接，请手动添加以下到PATH:"
            echo "export PATH=\"$INSTALL_DIR/bin:\$PATH\""
            echo "或者使用绝对路径: $binary_path"
        fi
    fi
}

# 配置API Key
configure_api_key() {
    log_info "配置谛听AI API Key..."
    
    echo -e "${YELLOW}请按照以下步骤获取API Key:${NC}"
    echo "1. 访问: https://diting.cc/home/apikey"
    echo "2. 点击「获取 API Key」"
    echo "3. 复制生成的Key"
    echo ""
    
    read -p "请输入您的API Key (直接回车跳过): " API_KEY
    
    if [ -n "$API_KEY" ]; then
        # 创建配置文件目录
        CONFIG_DIR="$HOME/.config/diting"
        mkdir -p "$CONFIG_DIR"
        
        # 保存API Key
        echo "DITING_API_KEY=$API_KEY" > "$CONFIG_DIR/config.env"
        chmod 600 "$CONFIG_DIR/config.env"
        
        log_success "API Key已保存到: $CONFIG_DIR/config.env"
        
        # 设置环境变量
        if [[ "$SHELL" == *"zsh"* ]]; then
            SHELL_RC="$HOME/.zshrc"
        else
            SHELL_RC="$HOME/.bashrc"
        fi
        
        if ! grep -q "DITING_API_KEY" "$SHELL_RC" 2>/dev/null; then
            echo "" >> "$SHELL_RC"
            echo "# 谛听AI配置" >> "$SHELL_RC"
            echo "export DITING_API_KEY=$API_KEY" >> "$SHELL_RC"
            log_info "已添加到 $SHELL_RC，请重新打开终端或运行: source $SHELL_RC"
        fi
        
        # 测试配置
        log_info "测试API Key配置..."
        if command -v diting &> /dev/null; then
            diting config || true
        else
            "$INSTALL_DIR/bin/diting.js" config || true
        fi
    else
        log_warning "未设置API Key，请稍后手动配置"
        echo "使用方法: export DITING_API_KEY=your_key_here"
    fi
}

# 显示使用说明
show_usage() {
    echo -e "${GREEN}🎉 谛听AI Skills 安装完成！${NC}"
    echo ""
    echo "📦 安装位置: $INSTALL_DIR"
    echo ""
    echo "🚀 使用方法:"
    echo "  1. 查看帮助:"
    echo "     diting --help"
    echo ""
    echo "  2. 配置检查:"
    echo "     diting config"
    echo ""
    echo "  3. B站视频转写:"
    echo "     diting transcribe --url \"B站链接\""
    echo ""
    echo "  4. 搜索知识库:"
    echo "     diting search --query \"关键词\""
    echo ""
    echo "  5. 获取文件详情:"
    echo "     diting asset-read --task-id 任务ID"
    echo ""
    echo "🔧 手动配置API Key:"
    echo "  export DITING_API_KEY=your_api_key_here"
    echo ""
    echo "📚 详细文档:"
    echo "  - 查看 SKILL.md 获取完整指南"
    echo "  - 访问 https://diting.cc 获取更多信息"
    echo ""
    echo "🆘 获取帮助:"
    echo "  - 运行: diting --help"
    echo "  - 查看: $INSTALL_DIR/README.md"
}

# 主安装流程
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}    谛听 AI Skills 自动安装脚本        ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    # 检测系统
    detect_os
    
    # 检查依赖
    check_dependencies
    
    # 下载安装包
    zip_file=$(download_package)
    
    # 安装
    install_package "$zip_file"
    
    # 配置API Key
    configure_api_key
    
    # 显示使用说明
    show_usage
    
    echo ""
    echo -e "${GREEN}✨ 安装完成！现在可以开始使用谛听AI Skills了。${NC}"
}

# 运行主函数
main "$@"