# 更新日志

所有项目的显著变更都将记录在此文件中。

## [1.0.1] - 2026-07-05

### 已修复
- 修复 `package.json` 和 `package-lock.json` 版本号不一致问题
- 改进错误处理文档和测试覆盖

### 新增
- 添加基础单元测试套件
- 创建贡献者指南 (`CONTRIBUTING.md`)
- 添加错误处理指南 (`ERROR_HANDLING.md`)
- 配置 GitHub Actions CI/CD 流水线
- 添加测试运行脚本

### 变更
- 更新 `package.json` 添加测试脚本
- 优化构建脚本错误处理
- 改进 CLI 帮助文档

## [1.0.0] - 2026-07-03

### 新增功能
- 初始版本发布
- 支持 Bilibili 视频转写
- 支持音频文件上传和转写
- 支持知识库搜索
- 支持资产读取和更新
- 多平台二进制构建支持
- 完整的 CLI 接口

### 核心功能
- `upload`: 上传本地音频/视频文件
- `transcribe`: 提交转写任务和轮询状态
- `asset-read`: 读取资产详情、原文和 AI 摘要
- `search`: 搜索知识库
- `update`: 更新记录信息

### 技术特性
- Node.js CLI 工具
- 支持 macOS、Linux、Windows
- 预编译二进制分发
- OpenClaw Skill 集成
- 完善的错误处理和重试机制