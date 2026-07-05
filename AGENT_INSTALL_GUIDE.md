# 谛听 AI Skills - Agent 安装指南

## 🎯 安装提示词模板

请复制以下提示词发送给Agent（小龙虾助手、Cursor、Claude、Codex等）：

```
请安装谛听 AI Skills 功能：

1. **自动安装（推荐）**：
   ```bash
   # 下载并运行安装脚本
   curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/scripts/agent-install.sh | bash
   
   # 或者使用wget
   wget -q -O- https://raw.githubusercontent.com/diting-ai/diting-skills/main/scripts/agent-install.sh | bash
   ```

2. **手动安装**：
   ```bash
   # 下载安装包
   wget https://oss.diting.cc/assets/diting-skills-1.0.1.zip
   
   # 解压
   unzip diting-skills-1.0.1.zip
   
   # 进入目录
   cd diting-skills-1.0.1
   
   # 使用二进制版本（推荐）
   chmod +x dist/diting-*
   ./dist/diting-* --help
   
   # 或者使用Node.js版本
   npm install
   node bin/diting.js --help
   ```

3. **配置API Key**：
   - 访问：https://diting.cc/home/apikey
   - 点击「获取 API Key」
   - 复制生成的Key
   - 设置环境变量：`export DITING_API_KEY=your_key_here`

4. **验证安装**：
   ```bash
   diting --help
   diting config
   ```

5. **开始使用**：
   ```bash
   # B站视频转写
   diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"
   
   # 搜索知识库
   diting search --query "人工智能"
   
   # 获取文件详情
   diting asset-read --task-id tsk_20260703_xxxxxxxx
   ```

**支持平台**：macOS (ARM64/x64), Linux, Windows
**运行时要求**：Node.js 18+ 或直接使用预编译二进制
**许可证**：MIT-0 (自由使用、修改、分发)
```

## 📦 下载地址

**主安装包**：
- https://oss.diting.cc/assets/diting-skills-1.0.1.zip

**备用地址**：
- https://github.com/diting-ai/diting-skills/releases/download/v1.0.1/diting-skills-1.0.1.zip

**安装脚本**：
- https://raw.githubusercontent.com/diting-ai/diting-skills/main/scripts/agent-install.sh

## 🔧 支持的Agent平台

### 1. **小龙虾助手**
```bash
# 小龙虾助手可以直接运行安装脚本
请运行: curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/scripts/agent-install.sh | bash
```

### 2. **Cursor**
```bash
# Cursor支持完整的Node.js环境
npm install -g diting-skills
# 或者使用二进制版本
```

### 3. **Claude**
```bash
# Claude需要明确的安装步骤
1. 下载安装包
2. 解压到合适位置
3. 配置环境变量
4. 测试安装
```

### 4. **Codex**
```bash
# Codex可以理解并执行安装命令
请按照提示词中的步骤安装
```

## 🚀 快速开始命令

### 一键安装
```bash
# 自动安装（包含所有配置）
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/scripts/agent-install.sh | bash
```

### 分步安装
```bash
# 1. 下载
wget https://oss.diting.cc/assets/diting-skills-1.0.1.zip

# 2. 解压
unzip diting-skills-1.0.1.zip

# 3. 配置
cd diting-skills-1.0.1
export DITING_API_KEY=your_key_here

# 4. 使用
./dist/diting --help
```

### 验证命令
```bash
# 检查版本
diting --version

# 检查配置
diting config

# 测试API连接
diting transcribe --test
```

## 📋 环境变量配置

### 必需配置
```bash
# API Key（从 https://diting.cc/home/apikey 获取）
export DITING_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 可选配置
```bash
# 自定义API端点（通常不需要修改）
export DITING_API_BASE_URL=https://api.diting.cc

# 代理设置（如果需要）
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
```

### 持久化配置
```bash
# 添加到Shell配置文件
echo 'export DITING_API_KEY=your_key_here' >> ~/.bashrc
# 或
echo 'export DITING_API_KEY=your_key_here' >> ~/.zshrc

# 重新加载配置
source ~/.bashrc
```

## 🛠️ 故障排除

### 常见问题

**Q1: 安装脚本无法运行**
```bash
# 给脚本执行权限
chmod +x agent-install.sh
./agent-install.sh
```

**Q2: API Key无效**
```bash
# 重新获取API Key
# 访问: https://diting.cc/home/apikey
# 生成新的Key并更新环境变量
```

**Q3: 命令找不到**
```bash
# 手动添加PATH
export PATH="$HOME/.diting-skills/bin:$PATH"
# 或使用绝对路径
~/.diting-skills/bin/diting --help
```

**Q4: 网络连接问题**
```bash
# 使用镜像源
export DITING_API_BASE_URL=https://api-mirror.diting.cc
# 或配置代理
```

### 错误代码

| 错误代码 | 含义 | 解决方案 |
|----------|------|----------|
| `ERR_API_KEY_MISSING` | 未配置API Key | 设置 `DITING_API_KEY` 环境变量 |
| `ERR_API_KEY_INVALID` | API Key无效 | 重新生成API Key |
| `ERR_NETWORK` | 网络连接失败 | 检查网络或代理设置 |
| `ERR_PLATFORM` | 平台不支持 | 使用Node.js版本替代二进制 |

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

# 查看API参考
ls references/
```

### 反馈渠道
1. **GitHub Issues**: 报告问题和建议
2. **官方邮箱**: support@diting.cc
3. **社区讨论**: GitHub Discussions

## 📊 版本信息

**当前版本**: v1.0.1
**发布日期**: 2026-07-05
**更新内容**:
- ✅ 完整的Agent安装支持
- ✅ 多平台二进制文件
- ✅ 自动化安装脚本
- ✅ 详细的安装指南
- ✅ 故障排除文档

**许可证**: MIT No Attribution (MIT-0)
**作者**: 谛听 AI 团队
**主页**: https://diting.cc

---

**安装提示**: 此安装包专为Agent平台优化，支持一键安装和自动配置，适合各种AI助手使用。🎯