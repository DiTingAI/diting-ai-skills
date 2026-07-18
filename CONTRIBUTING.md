# 贡献者指南

欢迎为谛听 AI Skills 项目做出贡献！本指南将帮助你了解如何参与项目开发。

## 开发环境设置

### 1. 克隆项目

```bash
git clone https://github.com/diting-ai/diting-skills.git
cd diting-skills
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，添加你的 API Key
# DITING_API_KEY=your-api-key-here
```

## 开发流程

### 1. 创建功能分支

```bash
git checkout -b feature/your-feature-name
```

### 2. 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
node __tests__/shared.test.js
```

### 3. 构建二进制文件

```bash
# 构建当前平台的二进制文件
npm run build:binary:host

# 构建所有平台的二进制文件
npm run build:binary:all
```

### 4. 代码规范

- 使用 ESLint 保持代码风格一致
- 为新增功能编写测试
- 更新相关文档

## 项目结构

```
diting-skills/
├── bin/                    # CLI 入口点
│   └── diting.js          # 主 CLI 文件
├── scripts/               # 功能脚本
│   ├── shared.js         # 共享工具函数
│   ├── transcribe.js     # 转写功能
│   ├── search.js         # 搜索功能
│   ├── asset_read.js     # 资产读取
│   ├── update_record.js  # 记录更新
│   └── build_binary.js   # 二进制构建
├── references/           # API 参考文档
│   ├── transcribe.md
│   ├── asset-read.md
│   ├── search.md
│   └── auth.md
├── __tests__/           # 测试文件
│   ├── shared.test.js
│   ├── config.test.js
│   ├── cli.test.js
│   └── run-tests.js
├── dist/                # 构建输出目录
├── package.json         # 项目配置
├── README.md           # 项目说明
└── SKILL.md            # Skill 文档
```

## 添加新功能

### 1. 添加新命令

1. 在 `bin/diting.js` 中添加命令映射
2. 创建对应的脚本文件在 `scripts/` 目录
3. 更新帮助文档
4. 添加测试

### 2. 添加新 API 端点

1. 在 `scripts/shared.js` 中添加请求函数
2. 在对应功能脚本中调用
3. 更新参考文档
4. 添加测试

## 测试

### 测试类型

1. **单元测试**: 测试单个函数或模块
2. **集成测试**: 测试多个模块的交互
3. **CLI 测试**: 测试命令行接口

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
node __tests__/shared.test.js
```

## 提交代码

### 1. 提交前检查

```bash
# 运行测试
npm test

# 构建二进制文件验证
npm run build:binary:host
```

### 2. 提交信息格式

使用 Conventional Commits 格式：

```
feat: 添加新的转写功能
fix: 修复搜索参数解析问题
docs: 更新 README 文档
test: 添加配置测试
chore: 更新依赖版本
```

### 3. 创建 Pull Request

1. 推送分支到远程仓库
2. 在 GitHub 创建 Pull Request
3. 描述功能变更和测试结果
4. 等待代码审查

## 发布流程

### 1. 版本管理

使用语义化版本控制：

- `major`: 不兼容的 API 变更
- `minor`: 向后兼容的功能新增
- `patch`: 向后兼容的问题修复

### 2. 发布步骤

1. 更新 `package.json` 版本号
2. 更新 `CHANGELOG.md`
3. 创建版本标签
4. 推送标签到 GitHub
5. 在 GitHub 发布版本

## 问题反馈

### 1. 报告 Bug

1. 使用 Issue 模板
2. 描述复现步骤
3. 提供环境信息
4. 附上相关日志

### 2. 功能建议

1. 描述使用场景
2. 提供实现思路
3. 讨论 API 设计

## 行为准则

请遵守以下行为准则：

1. **尊重他人**: 保持友好和专业的讨论
2. **包容性**: 欢迎不同背景的贡献者
3. **建设性反馈**: 提供有建设性的批评
4. **遵守许可**: 遵循 MIT-0 许可证

## 获取帮助

- 查看 [README.md](README.md) 了解基本用法
- 查看 [SKILL.md](SKILL.md) 了解 Skill 集成
- 在 GitHub Issues 中提问
- 查阅 API 参考文档

感谢你的贡献！🎉