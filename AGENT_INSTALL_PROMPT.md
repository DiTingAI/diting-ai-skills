# 🤖 谛听 AI Skills - Agent 安装提示词

## 📋 **完整提示词模板**

请复制以下完整提示词发送给小龙虾助手、Cursor、Claude、Codex等主流Agent：

```
# 🤖 谛听 AI Skills - Agent 安装指南

请安装谛听 AI Skills 功能，下载地址：https://cdn.diting.cc/assets/diting-skills-1.0.1.zip，并发送给小龙虾、Cursor、Claude、Codex 等主流 Agent，按提示即可自动安装。

在页面最上方点击「获取 API Key」，完成后把生成的 Key 发给小龙虾，即可完成鉴权并开始使用。

**安装包已更新**: 最新版本 v1.0.1，发布于 2026-07-05

---

## 🚀 安装步骤

### 方法一：一键安装（推荐）
```bash
# 使用curl
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash

# 或使用wget
wget -q -O- https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash
```

### 方法二：手动安装（推荐下载地址）
```bash
# 1. 下载安装包（从OSS下载）
wget https://cdn.diting.cc/assets/diting-skills-1.0.1.zip

# 2. 解压
unzip diting-skills-1.0.1.zip

# 3. 进入目录
cd diting-skills-1.0.1

# 4. 使用二进制版本（推荐）
# 查看可用的二进制文件
ls -la dist/

# 根据你的平台选择合适的二进制文件
# macOS ARM64 (M1/M2/M3)
chmod +x dist/diting-macos-arm64
./dist/diting-macos-arm64 --help

# macOS x64 (Intel)
chmod +x dist/diting-macos-x64
./dist/diting-macos-x64 --help

# Linux x64
chmod +x dist/diting-linux-x64
./dist/diting-linux-x64 --help

# Windows x64 (通过WSL)
chmod +x dist/diting-win-x64.exe
./dist/diting-win-x64.exe --help

# 或使用通用二进制
chmod +x dist/diting
./dist/diting --help

# 或使用Node.js版本
npm install
node bin/diting.js --help
```

### 方法三：高级安装（支持所有平台）
```bash
# 下载高级安装脚本
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/scripts/agent-install.sh -o install-diting.sh
chmod +x install-diting.sh
./install-diting.sh
```

---

## 🔑 API Key 配置

### 获取 API Key
1. 访问：https://diting.cc/home/apikey
2. 点击「获取 API Key」
3. 复制生成的 Key

### 配置 API Key
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

---

## ✅ 验证安装

```bash
# 检查安装是否成功
diting --help

# 验证API Key配置
diting config

# 测试基本功能
diting --version
```

---

## 🎯 开始使用

### 基本命令
```bash
# 查看所有命令
diting --help

# B站视频转写
diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"

# 搜索知识库
diting search --query "人工智能"

# 获取文件详情
diting asset-read --task-id tsk_20260703_xxxxxxxx

# 音频听悟转写
diting transcribe --tingwu --file-url "https://example.com/audio.mp3"
```

### 查询任务状态
```bash
# 轮询任务状态
diting transcribe --task-id tsk_20260703_xxxxxxxx --poll

# 获取原文
diting asset-read --task-id tsk_20260703_xxxxxxxx --type original

# 获取纪要
diting asset-read --task-id tsk_20260703_xxxxxxxx --type summary
```

---

## 📚 详细文档

### 内置文档
```bash
# 查看Skill使用指南
cat SKILL.md

# 查看API参考
ls references/

# 查看Agent安装指南
cat AGENT_INSTALL_GUIDE.md
```

### 在线资源
- **官方网站**: https://diting.cc
- **API文档**: https://api.diting.cc/docs
- **GitHub仓库**: https://github.com/diting-ai/diting-skills
- **问题反馈**: https://github.com/diting-ai/diting-skills/issues

---

## 🛠️ 技术支持

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

---

## 📊 系统要求

### 支持平台
- ✅ **macOS** (ARM64, x64) - 包含预编译二进制
- ✅ **Linux** (x64) - 包含预编译二进制
- ✅ **Windows** (x64) - 包含预编译二进制（通过WSL或Cygwin）

**注意**：`diting-skills-1.0.1.zip` 安装包已包含所有平台的二进制文件，自动适配系统架构。

### 运行时要求
- **Node.js 18+** (可选，如果使用Node.js版本)
- **无依赖** (二进制版本完全独立)
- **50MB磁盘空间**

### 网络要求
- 访问 https://api.diting.cc
- 访问 https://cdn.diting.cc
- 稳定的互联网连接

---

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

---

## 📞 联系方式

- **技术支持**: support@diting.cc
- **GitHub Issues**: https://github.com/diting-ai/diting-skills/issues
- **官方文档**: https://diting.cc/home/skills
- **社区讨论**: GitHub Discussions

---

**安装提示**: 此安装包专为Agent平台优化，支持一键安装和自动配置，适合各种AI助手使用。安装完成后，Agent即可开始使用谛听AI的所有功能！ 🚀

**许可证**: MIT-0 (自由使用、修改、分发)
**版本**: v1.0.1
**发布日期**: 2026-07-05
```

## 🎯 **精简提示词版本**

如果只需要核心提示词，使用以下版本：

```
请安装谛听 Skills 功能，下载地址：https://cdn.diting.cc/assets/diting-skills-1.0.1.zip，并发送给小龙虾、Cursor、Claude、Codex 等主流 Agent，按提示即可自动安装。

一键安装命令：
```bash
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash
```

在页面最上方点击「获取 API Key」，完成后把生成的 Key 发给小龙虾，即可完成鉴权并开始使用。

基本使用：
```bash
# 配置API Key
export DITING_API_KEY=your_key_here

# 验证安装
diting --help

# B站转写
diting transcribe --url "B站链接"

# 搜索知识库
diting search --query "关键词"
```

支持平台：macOS/Linux/Windows
文档：https://diting.cc
```

## 📱 **快速参考卡片**

**安装**: `curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash`

**配置**: `export DITING_API_KEY=your_key_here`

**验证**: `diting --help`

**使用**: 
- `diting transcribe --url "B站链接"`
- `diting search --query "关键词"`
- `diting asset-read --task-id 任务ID`

**支持**: https://diting.cc
**版本**: v1.0.1