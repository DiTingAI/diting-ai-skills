---
layout: guide
title: GitHub Pages Setup
description: Complete guide to setting up GitHub Pages for Diting AI Skills documentation
permalink: /guides/github-pages-setup
---

# GitHub Pages Setup Guide

This guide explains how to enable and configure GitHub Pages for hosting the Diting AI Skills documentation.

## 📋 Prerequisites

Before starting, ensure you have:

1. A GitHub account
2. Owner or admin access to the repository
3. The repository is public (GitHub Pages for private repos requires GitHub Pro)

## 🚀 Quick Setup

### Option 1: GitHub Web Interface (Recommended)

1. **Go to repository settings**
   - Navigate to your repository on GitHub
   - Click on **Settings** tab
   - Scroll down to **Pages** section in the left sidebar

2. **Configure GitHub Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically detect and use the `.github/workflows/deploy-pages.yml` file

3. **Select branch and folder**
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/docs` (root of docs directory)

4. **Save configuration**
   - Click **Save**
   - Wait 1-2 minutes for the first deployment to complete

5. **Access your site**
   - Your site will be available at: `https://[your-username].github.io/diting-skills/`
   - Or: `https://diting-ai.github.io/diting-skills/` (for organization repos)

### Option 2: Using GitHub CLI

```bash
# Install GitHub CLI if not already installed
# macOS
brew install gh

# Linux
sudo apt-get install gh

# Windows
winget install --id GitHub.cli

# Authenticate
gh auth login

# Enable GitHub Pages
gh api \
  --method POST \
  -H "Accept: application/vnd.github.v3+json" \
  /repos/diting-ai/diting-skills/pages \
  -f source='{"branch":"main","path":"/docs"}'
```

## ⚙️ Manual Configuration

### 1. Verify Repository Settings

Ensure your repository has the following settings:
- **Repository visibility**: Public (recommended for open source projects)
- **Default branch**: `main`
- **GitHub Pages source**: GitHub Actions

### 2. Check Workflow Configuration

The repository already includes a GitHub Actions workflow for automatic deployment. Verify the file exists:
```
.github/workflows/deploy-pages.yml
```

### 3. Configure Custom Domain (Optional)

If you want to use a custom domain (e.g., `docs.diting.cc`):

1. **Add CNAME file** to `/docs` directory:
   ```bash
   echo "docs.diting.cc" > docs/CNAME
   ```

2. **Update DNS settings**:
   - Add a CNAME record pointing to `[your-username].github.io`
   - Or add A records for GitHub Pages IP addresses:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```

3. **Configure in GitHub Settings**:
   - Go to repository Settings → Pages
   - Under **Custom domain**, enter your domain
   - Check **Enforce HTTPS** (recommended)

## 🔧 Advanced Configuration

### Custom Theme

The documentation uses the `jekyll-theme-cayman` theme. To change the theme:

1. Update `docs/_config.yml`:
   ```yaml
   theme: jekyll-theme-minimal
   # or other GitHub Pages compatible themes
   ```

2. Available themes:
   - `jekyll-theme-minimal`
   - `jekyll-theme-cayman`
   - `jekyll-theme-dinky`
   - `jekyll-theme-hacker`
   - `jekyll-theme-leap-day`
   - `jekyll-theme-merlot`
   - `jekyll-theme-midnight`
   - `jekyll-theme-modernist`
   - `jekyll-theme-primer`
   - `jekyll-theme-slate`
   - `jekyll-theme-tactile`
   - `jekyll-theme-time-machine`

### Custom Build Settings

You can customize the build process in `.github/workflows/deploy-pages.yml`:

```yaml
# Example: Build with specific Jekyll version
- name: Setup Ruby
  uses: ruby/setup-ruby@v1
  with:
    ruby-version: '3.1'

# Example: Install specific theme
- name: Install dependencies
  run: |
    gem install jekyll
    gem install jekyll-theme-cayman
    gem install jekyll-seo-tag
    gem install jekyll-sitemap
```

### Environment Variables

Add environment variables for custom builds:

```yaml
env:
  JEKYLL_ENV: production
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 🚀 Deployment Process

### Automatic Deployment

The workflow automatically deploys when:
- Code is pushed to the `main` branch
- Pull requests are merged into `main`
- Workflow is manually triggered

### Manual Deployment

Trigger deployment manually:

1. **GitHub Actions tab**
   - Go to **Actions** tab in your repository
   - Select **Deploy to GitHub Pages** workflow
   - Click **Run workflow**
   - Select branch (default: `main`)
   - Click **Run workflow**

2. **Using GitHub CLI**:
   ```bash
   gh workflow run "Deploy to GitHub Pages"
   ```

### Deployment Status

Check deployment status:
- **Actions** tab → **Deploy to GitHub Pages** workflow
- **Settings** → **Pages** → View recent deployments
- Visit `https://github.com/diting-ai/diting-skills/deployments`

## 🛠️ Local Development

### 1. Install Dependencies

```bash
# Install Ruby and Bundler
# macOS
brew install ruby

# Linux (Ubuntu/Debian)
sudo apt-get install ruby-full build-essential

# Install Bundler
gem install bundler
```

### 2. Setup Local Environment

```bash
# Navigate to docs directory
cd docs

# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Access at http://localhost:4000/diting-skills/
```

### 3. Build for Production

```bash
# Clean build
bundle exec jekyll clean

# Build site
bundle exec jekyll build

# Output will be in _site directory
ls _site/
```

## 🔍 Troubleshooting

### Common Issues

**Issue**: "Page build failed"
- **Solution**: Check GitHub Actions logs for error details
- **Common causes**: Missing dependencies, syntax errors in YAML

**Issue**: "404 Not Found"
- **Solution**: Ensure baseurl is correctly set in `_config.yml`
- **Check**: Site is accessible at correct URL pattern

**Issue**: "Theme not found"
- **Solution**: Add theme to Gemfile and run `bundle install`
- **Alternative**: Use remote theme with `remote_theme`

**Issue**: "Deployment stuck"
- **Solution**: Cancel and rerun workflow
- **Check**: Repository settings for Pages configuration

### Debugging Steps

1. **Check workflow logs**:
   - Go to Actions → Deploy to GitHub Pages → View workflow run
   - Expand each step to see detailed logs

2. **Verify configuration**:
   ```bash
   # Validate Jekyll configuration
   bundle exec jekyll doctor
   
   # Test build locally
   bundle exec jekyll build --verbose
   ```

3. **Check file structure**:
   - Ensure `docs/index.md` exists
   - Verify `docs/_config.yml` is valid YAML
   - Check for missing includes or layouts

## 📊 Monitoring

### Analytics

Add Google Analytics to `_config.yml`:
```yaml
# Google Analytics
google_analytics: UA-XXXXXXXXX-X
```

### SEO Optimization

The site includes automatic SEO tags via `jekyll-seo-tag`. Verify:
- Meta descriptions are set in front matter
- Open Graph tags are generated
- Sitemap is created at `/sitemap.xml`

### Performance

Monitor site performance:
- **Google PageSpeed Insights**: https://pagespeed.web.dev/
- **WebPageTest**: https://www.webpagetest.org/
- **Lighthouse**: Built into Chrome DevTools

## 🔄 Updates and Maintenance

### Updating Documentation

1. **Make changes** to files in `/docs` directory
2. **Commit and push** to `main` branch
3. **Wait for deployment** (typically 1-2 minutes)
4. **Verify changes** at your GitHub Pages URL

### Adding New Pages

1. Create new `.md` file in appropriate directory
2. Add front matter with layout and permalink
3. Add to navigation if needed
4. Push changes

### Versioning Documentation

For versioned documentation:
```bash
# Create version directory
mkdir -p docs/v1.0

# Copy current docs
cp -r docs/*.md docs/v1.0/

# Update navigation
# Update _config.yml for version switching
```

## 🎯 Best Practices

### Documentation Structure
- Keep URLs consistent and readable
- Use descriptive permalinks
- Organize content logically by topic
- Include breadcrumb navigation

### Content Guidelines
- Write clear, concise documentation
- Include code examples where relevant
- Use consistent formatting
- Keep images optimized for web

### SEO Best Practices
- Use descriptive page titles
- Include meta descriptions
- Use header tags properly (H1, H2, H3)
- Add alt text to images
- Include internal links

## 📞 Support

If you encounter issues with GitHub Pages setup:

1. **Check GitHub Status**: https://www.githubstatus.com/
2. **GitHub Pages Documentation**: https://docs.github.com/en/pages
3. **Jekyll Documentation**: https://jekyllrb.com/docs/
4. **Open an Issue**: Report problems in the repository

## 🎉 Success!

Once configured, your documentation will be available at:
**https://diting-ai.github.io/diting-skills/**

The site will automatically update whenever you push changes to the `main` branch.

---

**Last Updated**: 2026-07-06  
**Next**: [Custom Domain Setup](/guides/custom-domain)