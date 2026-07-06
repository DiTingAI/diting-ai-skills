# Diting AI Skills - AI-Powered Video Transcription CLI Tool

[![License: MIT-0](https://img.shields.io/badge/License-MIT--0-blue.svg)](https://opensource.org/licenses/MIT-0)
[![Version](https://img.shields.io/badge/version-1.0.2-green.svg)]()
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey.svg)]()
[![GitHub Stars](https://img.shields.io/github/stars/diting-ai/diting-skills?style=social)]()
[![Downloads](https://img.shields.io/github/downloads/diting-ai/diting-skills/total)]()
[![GitHub Pages](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://diting-ai.github.io/diting-ai-skills/)

**Convert videos to text in seconds with AI. Supports Bilibili links, local files, and knowledge base search. Perfect for AI assistants like XiaoLongXia, Cursor, Claude, and Codex.**

## 🎬 Video Tutorial



<div align="center">
  https://github.com/user-attachments/assets/ca873939-e925-414f-a700-1b9bf5f73a57
</div>

> 💡 **New to Diting AI?** This video walks you through installation, API key setup, and your first video transcription — all in just a few minutes!

## 🚀 Quick Install

```bash
# One-click installation (recommended)
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash

# Or using wget
wget -q -O- https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash
```

## ✨ Features

- 🎯 **Fast Transcription**: Convert Bilibili videos to text in 30 seconds
- 📁 **Local File Support**: Upload and transcribe audio/video files
- 🔍 **Smart Search**: Search knowledge base with keywords and timestamps
- 📝 **AI Summarization**: Generate structured notes and mind maps
- 🤖 **AI Assistant Ready**: Optimized for XiaoLongXia, Cursor, Claude, Codex
- 📦 **Multi-platform**: macOS, Linux, Windows support
- 🔧 **No Dependencies**: Standalone binaries for all platforms
- 🌐 **Bilibili Integration**: Direct link parsing and transcription

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [AI Assistant Integration](#ai-assistant-integration)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Quick Start

### 1. Get API Key
Visit [Diting AI Platform](https://diting.cc/home/apikey) to get your API Key.

### 2. Install Diting AI Skills
```bash
# One-line installation
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash
```

### 3. Configure API Key
```bash
export DITING_API_KEY=sk-diting-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Start Using
```bash
# Transcribe Bilibili video
diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"

# Search knowledge base
diting search --query "artificial intelligence"

# Get file details
diting asset-read --task-id tsk_20260703_xxxxxxxx
```

## 📦 Installation

### Method 1: One-click Installation (Recommended)
```bash
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash
```

### Method 2: Manual Installation
```bash
# Download from OSS
wget https://cdn.diting.cc/assets/diting-skills-1.0.2.zip

# Extract
unzip diting-skills-1.0.2.zip
cd diting-skills-1.0.2

# Use binary version
chmod +x dist/diting
./dist/diting --help

# Or use Node.js version
npm install
node bin/diting.js --help
```

### Method 3: Advanced Installation
```bash
# Download advanced installation script
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/scripts/agent-install.sh -o install-diting.sh
chmod +x install-diting.sh
./install-diting.sh
```

### Method 4: npm Installation
```bash
npm install -g diting-skills
```

## 🎯 Usage

### Basic Commands

```bash
# View all commands
diting --help

# Transcribe Bilibili video
diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"

# Upload local file
diting upload --file "/path/to/video.mp4" --create-task

# Search knowledge base
diting search --query "machine learning"

# Read asset details
diting asset-read --task-id tsk_20260703_xxxxxxxx

# Audio transcription
diting transcribe --tingwu --file-url "https://example.com/audio.mp3"
```

### Task Management

```bash
# Poll task status
diting transcribe --task-id tsk_20260703_xxxxxxxx --poll

# Get original text
diting asset-read --task-id tsk_20260703_xxxxxxxx --type original

# Get AI summary
diting asset-read --task-id tsk_20260703_xxxxxxxx --type summary

# Get mind map
diting asset-read --task-id tsk_20260703_xxxxxxxx --type mindmap
```

## 🤖 AI Assistant Integration

### XiaoLongXia Assistant
Send this prompt to XiaoLongXia:
```
请安装谛听 AI Skills 功能，下载地址：https://cdn.diting.cc/assets/diting-skills-1.0.2.zip，并发送给小龙虾、Cursor、Claude、Codex 等主流 Agent，按提示即可自动安装。

在页面最上方点击「获取 API Key」，完成后把生成的 Key 发给小龙虾，即可完成鉴权并开始使用。
```

### Cursor AI
```bash
# Install in Cursor
npm install -g diting-skills
```

### Claude & Codex
```bash
# Use one-click installation
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash
```

## 📚 Documentation

### Quick Links
- **[Online Documentation](https://diting-ai.github.io/diting-ai-skills/)** - Full documentation hosted on GitHub Pages
- **[API Documentation](https://api.diting.cc/docs)** - Complete API reference
- **[SKILL Documentation](SKILL.md)** - Detailed skill usage guide
- **[Agent Installation Guide](AGENT_INSTALL_PROMPT.md)** - AI assistant integration
- **[Examples](examples/)** - Usage examples and tutorials

### GitHub Pages Documentation
This project includes comprehensive documentation hosted on GitHub Pages:
- **URL**: https://diting-ai.github.io/diting-ai-skills/
- **Source**: `/docs` directory in this repository
- **Auto-deployment**: Automatic deployment on push to main branch
- **Custom domain**: Can be configured for custom domain support

### Local Documentation
```bash
# View skill documentation
cat SKILL.md

# View API references
ls references/

# View installation guide
cat AGENT_INSTALL_PROMPT.md

# Build documentation locally (requires Jekyll)
cd docs
bundle install
bundle exec jekyll serve
```

## 🔧 Supported Platforms

### Operating Systems
- ✅ **macOS** (ARM64, x64) - Native binary support
- ✅ **Linux** (x64) - Native binary support  
- ✅ **Windows** (x64) - Native binary support (via WSL or Cygwin)

### AI Assistants
- ✅ **XiaoLongXia** - Full integration with automatic installation
- ✅ **Cursor** - Node.js environment support
- ✅ **Claude** - CLI command execution support
- ✅ **Codex** - Shell command understanding support
- ✅ **Other AI Assistants** - Compatible with any assistant that can execute shell commands

### System Requirements
- **Disk Space**: 50MB minimum
- **Network**: Access to https://api.diting.cc and https://cdn.diting.cc
- **Optional**: Node.js 18+ (for Node.js version only)

## 🛠️ Troubleshooting

### Common Issues

**Q: Installation fails?**
```bash
# Check network connection
ping cdn.diting.cc

# Check system permissions
ls -la /usr/local/bin/

# Use Node.js version as alternative
npm install
node bin/diting.js --help
```

**Q: API Key not working?**
```bash
# Get new API Key from https://diting.cc/home/apikey

# Clear old configuration
unset DITING_API_KEY

# Set new API Key
export DITING_API_KEY=your_new_key_here
```

**Q: Command not found?**
```bash
# Add to PATH manually
export PATH="$HOME/.diting-skills/dist:$PATH"

# Or use absolute path
~/.diting-skills/dist/diting --help
```

### Error Codes
- `ERR_API_KEY_MISSING`: API Key not configured
- `ERR_API_KEY_INVALID`: API Key is invalid
- `ERR_NETWORK`: Network connection failed
- `ERR_PLATFORM`: Platform not supported
- `ERR_TASK_NOT_FOUND`: Task ID not found

## 🔄 Update & Uninstall

### Update to Latest Version
```bash
# Re-run installation script
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash
```

### Uninstall
```bash
# Remove installation directory
rm -rf ~/.diting-skills

# Remove global symlink
sudo rm -f /usr/local/bin/diting

# Clean environment variables
# Edit ~/.bashrc or ~/.zshrc and remove DITING_API_KEY lines
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone repository
git clone https://github.com/diting-ai/diting-skills.git
cd diting-skills

# Install dependencies
npm install

# Build binaries
npm run build:binary:all

# Run tests
npm test
```

### Reporting Issues
Found a bug or have a feature request? Please [open an issue](https://github.com/diting-ai/diting-skills/issues).

## 📊 CLI Commands Reference

```bash
diting <command> [options]

Commands:
  transcribe      Submit transcription task (supports Bilibili links/upload IDs)
  upload          Upload local audio/video files
  asset-read      Read asset details, transcription text, AI summaries
  search          Search knowledge base
  update          Update file content
  folder          Folder operations
  config          Configure settings

Options:
  --version       Show version number
  --help          Show help
  --api-key       Set API key
  --verbose       Enable verbose output
```

## 🌐 Download Links

### Primary Download
- **Main Package**: https://cdn.diting.cc/assets/diting-skills-1.0.2.zip

### Alternative Sources
- **GitHub Releases**: https://github.com/diting-ai/diting-skills/releases
- **Install Scripts**: 
  - https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh
  - https://raw.githubusercontent.com/diting-ai/diting-skills/main/scripts/agent-install.sh

### Platform-Specific Binaries
```bash
# macOS ARM64
curl -L https://cdn.diting.cc/assets/diting-skills-1.0.0-macos-arm64 -o diting && chmod +x diting

# macOS x64
curl -L https://cdn.diting.cc/assets/diting-skills-1.0.0-macos-x64 -o diting && chmod +x diting

# Linux x64
curl -L https://cdn.diting.cc/assets/diting-skills-1.0.0-linux-x64 -o diting && chmod +x diting

# Windows x64
curl -L https://cdn.diting.cc/assets/diting-skills-1.0.0-win-x64.exe -o diting.exe
```

## 📞 Support & Community

### Official Resources
- **Website**: https://diting.cc
- **API Documentation**: https://api.diting.cc/docs
- **GitHub Repository**: https://github.com/diting-ai/diting-skills
- **Issue Tracker**: https://github.com/diting-ai/diting-skills/issues
- **Email Support**: support@diting.cc

### Community
- **GitHub Discussions**: Community discussions and Q&A
- **Contributors**: See [CONTRIBUTING.md](CONTRIBUTING.md) for contributor guidelines

## 📝 License

This project is licensed under the **MIT No Attribution (MIT-0)** License - see the [LICENSE](LICENSE) file for details.

## 📊 Version Information

**Current Version**: v1.0.2  
**Release Date**: 2026-07-06  
**Changelog**: See [CHANGELOG.md](CHANGELOG.md)

**Author**: Diting AI Team  
**Homepage**: https://diting.cc

---

**Note**: This package is optimized for AI assistant platforms, supporting one-click installation and automatic configuration. Perfect for various AI assistants! 🚀

## 🤖 小龙虾助手集成安装

### 📋 完整安装提示词

复制以下提示词发送给小龙虾助手：

```
请安装谛听 AI Skills 功能，下载地址：https://cdn.diting.cc/assets/diting-skills-1.0.2.zip，并发送给小龙虾、Cursor、Claude、Codex 等主流 Agent，按提示即可自动安装。

在页面最上方点击「获取 API Key」，完成后把生成的 Key 发给小龙虾，即可完成鉴权并开始使用。
```

### 🚀 一键安装（推荐）

```bash
# 使用curl
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash

# 或使用wget
wget -q -O- https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash
```

### 🔧 分步安装

```bash
# 1. 下载安装包
wget https://cdn.diting.cc/assets/diting-skills-1.0.2.zip

# 2. 解压
unzip diting-skills-1.0.2.zip

# 3. 进入目录
cd diting-skills-1.0.2

# 4. 使用二进制版本（推荐）
chmod +x dist/diting-*
./dist/diting-* --help

# 或使用Node.js版本
npm install
node bin/diting.js --help
```

### 🔑 API Key 配置

1. **获取 API Key**：
   - 访问：[https://diting.cc/home/apikey](https://diting.cc/home/apikey)
   - 点击「获取 API Key」
   - 复制生成的 Key

2. **配置 API Key**：
   ```bash
   # 临时设置（当前会话有效）
   export DITING_API_KEY=your_key_here
   
   # 永久设置（添加到shell配置文件）
   echo 'export DITING_API_KEY=your_key_here' >> ~/.bashrc
   # 或
   echo 'export DITING_API_KEY=your_key_here' >> ~/.zshrc
   
   # 重新加载配置
   source ~/.bashrc
   ```

### ✅ 验证安装

```bash
# 检查安装是否成功
diting --help

# 验证API Key配置
diting config

# 测试基本功能
diting --version
```

## 📦 常规安装

### 使用 npm

```bash
npm install -g diting-skills
```

### 直接下载预编译二进制

```bash
# macOS ARM64
curl -L https://cdn.diting.cc/assets/diting-skills-1.0.0-macos-arm64 -o diting && chmod +x diting

# macOS x64
curl -L https://cdn.diting.cc/assets/diting-skills-1.0.0-macos-x64 -o diting && chmod +x diting

# Linux x64
curl -L https://cdn.diting.cc/assets/diting-skills-1.0.0-linux-x64 -o diting && chmod +x diting

# Windows
curl -L https://cdn.diting.cc/assets/diting-skills-1.0.0-win-x64.exe -o diting.exe
```

## 🎯 快速开始

### 1. 获取 API Key
访问 [谛听 AI 开放平台](https://diting.cc/home/apikey) 获取 API Key。

### 2. 配置环境变量
```bash
export DITING_API_KEY=sk-diting-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 开始使用

```bash
# 转写 B 站视频
diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"

# 上传本地文件并转写
diting upload --file "/path/to/video.mp4" --create-task

# 查询任务状态
diting asset-read --task-id tsk_xxx

# 搜索知识库
diting search --query "吴恩达"

# 音频听悟转写
diting transcribe --tingwu --file-url "https://example.com/audio.mp3"
```

## 📚 详细使用指南

### 查看帮助文档
```bash
# 查看所有命令
diting --help

# 查看具体命令帮助
diting transcribe --help
diting search --help
```

### 查询任务状态
```bash
# 轮询任务状态
diting transcribe --task-id tsk_20260703_xxxxxxxx --poll

# 获取原文
diting asset-read --task-id tsk_20260703_xxxxxxxx --type original

# 获取AI摘要
diting asset-read --task-id tsk_20260703_xxxxxxxx --type summary
```

## 🔧 支持的 AI 助手平台

### 🦞 小龙虾助手
完全支持一键安装和自动化配置，安装后即可直接使用所有功能。

### ⌨️ Cursor
支持完整的 Node.js 环境，可以运行 `npm install -g diting-skills` 或使用预编译二进制。

### 🤖 Claude
需要明确的安装步骤，建议使用一键安装脚本或手动下载安装包。

### 💻 Codex
可以理解并执行安装命令，支持所有安装方法。

## 🛠️ 故障排除

### 常见问题

**Q: 安装失败怎么办？**
```bash
# 检查网络连接
ping cdn.diting.cc

# 检查系统权限
ls -la /usr/local/bin/

# 使用Node.js版本替代
npm install
node bin/diting.js --help
```

**Q: API Key无效？**
```bash
# 重新获取API Key
# 访问: https://diting.cc/home/apikey
# 生成新的Key

# 清除旧配置
unset DITING_API_KEY
```

**Q: 命令找不到？**
```bash
# 手动添加PATH
export PATH="$HOME/.diting-skills/dist:$PATH"

# 或使用绝对路径
~/.diting-skills/dist/diting --help
```

### 错误代码参考
- `ERR_API_KEY_MISSING`: 未配置API Key
- `ERR_API_KEY_INVALID`: API Key无效
- `ERR_NETWORK`: 网络连接失败
- `ERR_PLATFORM`: 平台不支持

## 📋 CLI 命令

```bash
diting <command> [options]

Commands:
  transcribe     提交转写任务（支持B站链接/上传ID）
  upload         上传本地音频/视频文件
  asset-read     读取资产详情、转写原文、AI摘要
  search         搜索知识库
  update         更新文件内容
  folder         文件夹操作
```

## 🌐 下载地址

### 主安装包
- https://cdn.diting.cc/assets/diting-skills-1.0.2.zip

### 备用地址
- https://github.com/diting-ai/diting-skills/releases/download/v1.0.2/diting-skills-1.0.2.zip

### 安装脚本
- https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh
- https://raw.githubusercontent.com/diting-ai/diting-skills/main/scripts/agent-install.sh

## 📊 系统要求

### 支持平台
- ✅ **macOS** (ARM64, x64)
- ✅ **Linux** (x64)
- ✅ **Windows** (x64, 通过WSL或Cygwin)

### 运行时要求
- **Node.js 18+** (可选，如果使用Node.js版本)
- **无依赖** (二进制版本完全独立)
- **50MB磁盘空间**

### 网络要求
- 访问 https://api.diting.cc
- 访问 https://cdn.diting.cc
- 稳定的互联网连接

## 🔄 更新与卸载

### 更新版本
```bash
# 重新运行安装脚本
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash
```

### 卸载
```bash
# 删除安装目录
rm -rf ~/.diting-skills

# 删除全局链接
sudo rm -f /usr/local/bin/diting

# 清理环境变量
# 编辑 ~/.bashrc 或 ~/.zshrc，删除 DITING_API_KEY 相关行
```

## 📖 API 文档

详细的 API 文档请参考 [SKILL.md](SKILL.md)。

## 📞 技术支持

### 官方资源
- **官网**: https://diting.cc
- **API文档**: https://api.diting.cc/docs
- **GitHub**: https://github.com/diting-ai/diting-skills
- **社区**: https://github.com/diting-ai/diting-skills/issues

### 获取帮助
```bash
# 查看帮助文档
diting --help

# 查看详细文档
cat SKILL.md

# 查看Agent安装指南
cat AGENT_INSTALL_GUIDE.md

# 查看API参考
ls references/
```

### 反馈渠道
1. **GitHub Issues**: 报告问题和建议
2. **官方邮箱**: support@diting.cc
3. **社区讨论**: GitHub Discussions

## 📊 版本信息

**当前版本**: v1.0.2  
**发布日期**: 2026-07-05  
**更新内容**:
- ✅ 完整的小龙虾助手集成支持
- ✅ 多平台二进制文件
- ✅ 自动化安装脚本
- ✅ 详细的安装指南
- ✅ 故障排除文档

**许可证**: MIT No Attribution (MIT-0)  
**作者**: 谛听 AI 团队  
**主页**: https://diting.cc

---

**安装提示**: 此安装包专为Agent平台优化，支持一键安装和自动配置，适合各种AI助手使用。🎯
