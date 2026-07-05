# GitHub Pages 启用指南

## 🎯 概述

已为 Diting AI Skills 项目配置了完整的 GitHub Pages 设置，使用 `/docs` 目录作为文档站点源。

## ✅ 已完成的配置

### 1. 文件结构配置
- ✅ `/docs` 目录 - 包含完整的文档结构
- ✅ `docs/_config.yml` - Jekyll 配置文件
- ✅ `docs/index.md` - 主页文件
- ✅ `docs/404.md` - 404 错误页面
- ✅ `docs/guides/github-pages-setup.md` - GitHub Pages 设置指南

### 2. GitHub Actions 配置
- ✅ `.github/workflows/deploy-pages.yml` - 自动部署工作流
- ✅ 配置为推送到 `main` 分支时自动部署
- ✅ 使用 `/docs` 目录作为源

### 3. 依赖配置
- ✅ `Gemfile` - Ruby 依赖管理
- ✅ 包含 Jekyll 和主题依赖

## 🚀 启用步骤

### 方法 1: GitHub Web 界面（推荐）

1. **访问仓库设置**
   - 打开 https://github.com/diting-ai/diting-skills
   - 点击 **Settings** 选项卡
   - 左侧菜单找到 **Pages**

2. **配置 GitHub Pages**
   - 在 **Source** 部分选择 **GitHub Actions**
   - 系统会自动检测到 `.github/workflows/deploy-pages.yml`
   - 点击 **Save**

3. **等待部署完成**
   - 首次部署需要 1-2 分钟
   - 查看部署状态：**Actions** → **Deploy to GitHub Pages**

4. **访问网站**
   - 部署成功后访问：https://diting-ai.github.io/diting-skills/

### 方法 2: GitHub CLI

```bash
# 安装 GitHub CLI
# macOS
brew install gh

# 认证
gh auth login

# 启用 GitHub Pages
gh api \
  --method POST \
  -H "Accept: application/vnd.github.v3+json" \
  /repos/diting-ai/diting-skills/pages \
  -f source='{"branch":"main","path":"/docs"}'
```

## 🔗 网站地址

- **GitHub Pages URL**: https://diting-ai.github.io/diting-skills/
- **自定义域名**（可选）：可配置为 docs.diting.cc 等

## 📁 文档结构

```
docs/
├── index.md              # 主页
├── _config.yml          # Jekyll 配置
├── 404.md              # 404 页面
├── api/                # API 文档
│   ├── cli-commands.md
│   └── endpoints.md
├── guides/             # 使用指南
│   ├── quick-start.md
│   ├── installation.md
│   ├── api-key.md
│   ├── basic-usage.md
│   ├── video-transcription.md
│   ├── knowledge-base-search.md
│   ├── file-management.md
│   ├── ai-assistant-integration.md
│   ├── github-pages-setup.md  # GitHub Pages 设置指南
│   └── ...
├── faq/                # 常见问题
│   ├── common-issues.md
│   └── ...
└── examples/           # 示例代码
```

## 🔄 自动部署

### 触发条件
- 推送到 `main` 分支
- 手动触发工作流
- 定时任务（可选配置）

### 部署流程
1. GitHub Actions 检测到代码变更
2. 运行构建工作流
3. 上传 `/docs` 目录为构建产物
4. 自动部署到 GitHub Pages

## 🛠️ 本地开发

```bash
# 进入 docs 目录
cd docs

# 安装依赖
bundle install

# 本地运行
bundle exec jekyll serve

# 访问 http://localhost:4000/diting-skills/
```

## 🔧 自定义配置

### 修改主题
编辑 `docs/_config.yml`：
```yaml
theme: jekyll-theme-cayman  # 可更换为其他主题
```

### 自定义域名
1. 在 `docs/CNAME` 中添加域名
2. 在 DNS 提供商处配置 CNAME 记录
3. 在 GitHub Pages 设置中启用自定义域名

### SEO 优化
- 已配置 `jekyll-seo-tag` 插件
- 自动生成站点地图 `/sitemap.xml`
- 优化 meta 标签

## 📊 监控和维护

### 查看部署状态
- **Actions 标签页**: 查看工作流运行状态
- **Settings → Pages**: 查看部署历史
- **GitHub Pages URL**: 访问在线站点

### 更新文档
1. 编辑 `/docs` 目录中的文件
2. 提交到 `main` 分支
3. 自动部署（1-2分钟）

## 🆘 故障排除

### 常见问题

**问题**: 部署失败
- **检查**: GitHub Actions 日志
- **常见原因**: Gemfile 依赖问题、YAML 语法错误

**问题**: 404 页面
- **检查**: baseurl 配置是否正确
- **验证**: 文件路径和 permalink 设置

**问题**: 样式丢失
- **检查**: 主题配置
- **验证**: CSS 文件引用

### 调试步骤
```bash
# 验证 Jekyll 配置
bundle exec jekyll doctor

# 本地构建测试
bundle exec jekyll build --verbose

# 检查 YAML 语法
ruby -e "require 'yaml'; YAML.load_file('_config.yml')"
```

## 📈 高级功能

### 版本控制
```bash
# 创建版本目录
mkdir -p docs/v1.0
cp -r docs/*.md docs/v1.0/
```

### 多语言支持
```yaml
# 在 _config.yml 中添加
languages: ["en", "zh"]
default_lang: "en"
```

### 搜索功能
集成 Algolia 或 lunr.js 实现客户端搜索

## 📞 支持资源

- **GitHub Pages 文档**: https://docs.github.com/en/pages
- **Jekyll 文档**: https://jekyllrb.com/docs/
- **GitHub 状态**: https://www.githubstatus.com/
- **问题反馈**: 在仓库中创建 Issue

---

**状态**: ✅ 配置完成  
**下一步**: 在 GitHub 仓库设置中启用 GitHub Pages  
**预计时间**: 2-3 分钟  
**访问地址**: https://diting-ai.github.io/diting-skills/  

**最后更新**: 2026-07-06