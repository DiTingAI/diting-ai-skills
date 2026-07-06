# 谛听 AI Skills 发布包

## 📦 版本信息
- **版本**: v1.0.2
- **发布日期**: 2026-07-06
- **文件大小**: 15.73 MB
- **文件**: `diting-skills-v1.0.2-skill.zip`

## 📁 压缩包内容

```
diting-skills-v1.0.1-skill.zip
├── _meta.json                    # 元数据文件
├── LICENSE                       # MIT-0 许可证
├── bin/                          # CLI 入口点
│   └── diting.js                # 主 CLI 脚本
├── dist/                         # 预编译二进制文件
│   └── diting                   # macOS ARM64 可执行文件
├── references/                   # API 参考文档
│   ├── auth.md                  # 认证文档
│   ├── asset-read.md            # 资产读取文档
│   ├── search.md                # 搜索文档
│   └── transcribe.md            # 转写文档
├── scripts/                      # 核心脚本
│   ├── asset_read.js            # 资产读取脚本
│   ├── build_binary.js          # 二进制构建脚本
│   ├── create-release-zip.js    # 发布包创建脚本
│   ├── search.js                # 搜索脚本
│   ├── shared.js                # 共享工具函数
│   ├── transcribe.js            # 转写脚本
│   ├── update_record.js         # 记录更新脚本
│   └── upload.js                # 上传脚本
├── README.md                     # 项目说明
├── SKILL.md                      # Skill 使用指南
├── package.json                  # Node.js 项目配置
├── package-lock.json            # 依赖锁定文件
└── .env.example                 # 环境变量示例
```

## 🚀 快速开始

### 1. 安装方法

#### 方法一：使用预编译二进制文件
```bash
# 解压 ZIP 文件
unzip diting-skills-v1.0.1-skill.zip

# 给二进制文件执行权限
chmod +x dist/diting

# 运行 CLI
./dist/diting --help
```

#### 方法二：使用 Node.js 脚本
```bash
# 解压 ZIP 文件
unzip diting-skills-v1.0.1-skill.zip

# 安装依赖
npm install

# 运行 CLI
node bin/diting.js --help
```

### 2. 配置 API Key

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，添加您的 API Key
# DITING_API_KEY=your_api_key_here
```

### 3. 基本使用

```bash
# 查看帮助
./dist/diting --help

# 配置检查
./dist/diting config

# B站视频转写
./dist/diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"

# 搜索知识库
./dist/diting search --query "人工智能"
```

## 🔧 核心功能

| 功能 | 命令 | 描述 |
|------|------|------|
| **配置检查** | `/diting config` | 检查 API Key 配置 |
| **B站转写** | `/diting transcribe` | 解析 B站链接并创建转写任务 |
| **听悟转写** | `/diting transcribe --tingwu` | 提交音频 URL 进行听悟转写 |
| **状态查询** | `/diting transcribe --poll` | 轮询任务处理状态 |
| **资产读取** | `/diting asset-read` | 读取原文、纪要、文件详情 |
| **知识库搜索** | `/diting search` | 搜索知识库和文件列表 |

## 📋 环境要求

- **操作系统**: macOS, Linux, Windows
- **运行时**: Node.js 18+ 或直接使用预编译二进制文件
- **依赖**: 无需额外依赖（二进制版本完全独立）

## 🔄 更新日志

### v1.0.2 (2026-07-06)
- ✅ **Code Review 完成**: 移除所有不存在的 API 接口
- ✅ `update_record.js`: 移除 `/api/record/*` 接口，改用 `/api/v1/videos/*` 标准接口
- ✅ `asset_read.js`: 统一通过 `GET /api/v1/videos/{task_id}` 读取数据
- ✅ `transcribe.js`: 移除未公开的 AI 功能接口（outline/qa/mindmap/polish）
- ✅ `upload.js`: 修正听悟接口路径（添加 `/api/v1` 前缀）
- ✅ `search.js`: 修正搜索参数（`query` → `question`）
- ✅ `bin/diting.js`: 更新帮助文档，移除已废弃功能
- ✅ 添加 [API 更新日志](docs/api/API_CHANGELOG.md)

### v1.0.1 (2026-07-05)
- ✅ 修复版本号不一致问题
- ✅ 添加完整的测试套件
- ✅ 创建 GitHub Actions CI/CD 工作流
- ✅ 添加 CONTRIBUTING.md 和 ERROR_HANDLING.md
- ✅ 添加 CHANGELOG.md 和 .env.example
- ✅ 预编译 macOS ARM64 二进制文件
- ✅ 创建发布 ZIP 包

## 🛡️ 许可证

本项目使用 **MIT No Attribution License (MIT-0)**，允许自由使用、修改和分发。

## 📞 支持与反馈

- **文档**: [SKILL.md](SKILL.md) 包含详细使用指南
- **API 参考**: [references/](references/) 目录包含完整 API 文档
- **问题报告**: 请通过 GitHub Issues 提交问题

## 🔗 相关链接

- **谛听 AI 官网**: https://diting.cc
- **API 文档**: https://api.diting.cc/docs
- **开放平台**: https://diting.cc/home/apikey

---

**注意**: 此 ZIP 包为 SKILLS 发布专用包，包含所有必要的文件和预编译二进制文件，可直接用于部署和分发。