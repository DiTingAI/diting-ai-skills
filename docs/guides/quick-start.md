# Quick Start Guide

Get started with Diting AI Skills in 5 minutes!

> **v1.0.2 更新**: 上线前已完成 Code Review，移除了所有不存在的 API 接口。详情见 [API 更新日志](../api/API_CHANGELOG.md)

## 🎯 What is Diting AI Skills?

Diting AI Skills is a powerful CLI tool that allows you to:
- 📹 Transcribe videos from Bilibili and local files
- 🎵 Convert audio to text with AI
- 🔍 Search your knowledge base
- 📝 Generate AI summaries and mind maps
- 🤖 Integrate with AI assistants like XiaoLongXia, Cursor, Claude, and Codex

## 🚀 5-Minute Setup

### Step 1: Get Your API Key
1. Visit [Diting AI Platform](https://diting.cc/skills?from=skillhub&c=20261123-skillhub&client=skill)
2. Click "Get API Key"
3. Copy your API Key

### Step 2: Install Diting AI Skills
```bash
# One-line installation
curl -sSL https://raw.githubusercontent.com/DiTingAI/diting-ai-skills/main/install.sh | bash
```

### Step 3: Configure API Key
```bash
# Set API key for current session
export DITING_API_KEY=sk-diting-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Or add to shell config for persistence
echo 'export DITING_API_KEY=sk-diting-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' >> ~/.bashrc
source ~/.bashrc
```

### Step 4: Verify Installation
```bash
# Check if installation was successful
diting --version

# View available commands
diting --help
```

## 🎬 Your First Transcription

### Transcribe a Bilibili Video
```bash
# Transcribe a Bilibili video
diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"

# Output will show task ID
# Example: Task created: 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c
```

### Check Task Status
```bash
# Use the task ID from previous command
diting transcribe --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --poll

# This will show progress and notify when complete
```

### Get Transcription Results
```bash
# Get original transcription text
diting asset-read --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --type original

# Get AI summary
diting asset-read --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --type summary

# Get mind map
diting asset-read --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --type mindmap
```

## 🔍 Search Knowledge Base

### Basic Search
```bash
# Search for keywords
diting search --query "machine learning"

# Search with filters
diting search --query "artificial intelligence" --limit 10 --offset 0
```

### Advanced Search
```bash
# Search by date range
diting search --query "python tutorial" --start-date "2024-01-01" --end-date "2024-12-31"

# Search by file type
diting search --query "meeting notes" --type video
```

## 🤖 AI Assistant Integration

### For XiaoLongXia Assistant
Send this prompt to XiaoLongXia:
```
帮我安装「谛听 AI Skills」，执行下面这条命令即可（不要下载 zip 包）：
curl -sSL https://raw.githubusercontent.com/DiTingAI/diting-ai-skills/main/install.sh | bash

装完给我这个链接拿 API Key：https://diting.cc/skills?from=skillhub&c=20261123-skillhub&client=skill
我把 Key 发给你之后，执行 export DITING_API_KEY=<Key>，再用 diting config 自查，最后用
diting transcribe --url "<B站链接>" 转写。全程不要把完整 Key 回显出来。
```

### Quick Commands for AI Assistants
```bash
# Transcribe video
diting transcribe --url "B站链接"

# Search knowledge
diting search --query "搜索关键词"

# Get file info
diting asset-read --task-id "任务ID"
```

## 📊 Common Workflows

### Workflow 1: Research Video Content
```bash
# 1. Transcribe educational video
diting transcribe --url "https://www.bilibili.com/video/BV1xxx"

# 2. Get AI summary
diting asset-read --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --type summary

# 3. Search related content
diting search --query "相关主题"
```

### Workflow 2: Meeting Recording Processing
```bash
# 1. Get transcription
diting asset-read --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --type original

# 2. Get action items (AI summary)
diting asset-read --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --type summary
```

### Workflow 3: Content Creation
```bash
# 1. Transcribe source material
diting transcribe --url "source_video_url"

# 2. Search for references
diting search --query "topic keywords"

# 3. Generate outline from mind map
diting asset-read --task-id 8f3a2b1c-6d4e-4f5a-9b8c-7d6e5f4a3b2c --type mindmap
```

## 🆘 Need Help?

### Check Installation
```bash
# Verify installation
diting --version

# Check configuration
diting config

# Test API connection
diting search --query "test" --limit 1
```

### Get Help
```bash
# View all commands
diting --help

# View command-specific help
diting transcribe --help
diting search --help
```

### Common Issues
- **API Key not working**: Get a new key from https://diting.cc/skills?from=skillhub&c=20261123-skillhub&client=skill
- **Network issues**: Check your internet connection and firewall settings
- **Command not found**: Make sure installation directory is in PATH

## 🎯 Next Steps
- Read the [Basic Usage Guide](basic-usage.md) for detailed instructions
- Explore [Advanced Features](../guides/advanced-features.md)
- Check out [Integration Examples](../examples/)
- Join our [Community Discussions](https://github.com/DiTingAI/diting-ai-skills/discussions)

---

**Pro Tip**: Use the `--verbose` flag for detailed output when debugging:
```bash
diting transcribe --url "https://www.bilibili.com/video/BV1xxx" --verbose
```