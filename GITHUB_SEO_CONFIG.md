# GitHub Repository SEO Configuration

## Repository Settings for SEO Optimization

### Basic Information
- **Repository Name**: `diting-ai-skills` (recommended)
- **Description**: `Diting AI Skills - AI-powered video/audio transcription CLI tool with Bilibili support. Convert videos to text, generate AI summaries, and search knowledge base. Perfect for AI assistants like XiaoLongXia, Cursor, Claude, and Codex.`
- **Topics**: `ai-transcription, video-to-text, bilibili, cli-tool, ai-assistant, openai-claude, cursor-ai, xiao-long-xia, audio-processing, knowledge-base`

### Visibility Settings
- **Visibility**: Public
- **Template Repository**: No
- **Archived**: No

### Features to Enable
- ✅ Issues
- ✅ Discussions
- ✅ Projects
- ✅ Wiki
- ✅ Sponsorships
- ✅ GitHub Pages

### Branch Protection Rules
- **Main Branch**: `main`
- **Require pull request reviews**: Yes (1 required)
- **Require status checks**: Yes
  - `test` workflow must pass
  - `build` workflow must pass
- **Include administrators**: Yes
- **Require linear history**: Yes
- **Allow force pushes**: No
- **Allow deletions**: No

### GitHub Pages Settings
- **Source**: `docs` folder
- **Theme**: Minimal
- **Custom domain**: (optional) `docs.diting.cc`
- **Enforce HTTPS**: Yes

### Social Preview Image
Create `social-preview.png` (1200×630px) with:
- Diting AI Skills logo
- Tagline: "AI Video Transcription CLI"
- Key features icons
- GitHub username: @diting-ai

## SEO Metadata Files

### 1. robots.txt
```
User-agent: *
Allow: /

# GitHub Pages specific
User-agent: *
Disallow: /_next/
Disallow: /api/

Sitemap: https://diting-ai.github.io/diting-ai-skills/sitemap.xml
```

### 2. sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://github.com/diting-ai/diting-ai-skills</loc>
    <lastmod>2026-07-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://github.com/diting-ai/diting-ai-skills/blob/main/README.md</loc>
    <lastmod>2026-07-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://github.com/diting-ai/diting-ai-skills/blob/main/docs/</loc>
    <lastmod>2026-07-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### 3. .gitattributes (for SEO)
```
# Auto-detect text files and perform LF normalization
* text=auto

# Ensure proper line endings
*.md text eol=lf
*.js text eol=lf
*.json text eol=lf
*.yml text eol=lf
*.yaml text eol=lf

# Binary files
*.png binary
*.jpg binary
*.zip binary
```

## README SEO Optimization

### Keywords to Include
- **Primary**: AI transcription, video to text, Bilibili transcription, CLI tool
- **Secondary**: AI assistant, XiaoLongXia, Cursor, Claude, Codex
- **Tertiary**: audio processing, knowledge base, meeting summary

### Meta Description (in README frontmatter)
```yaml
---
description: Diting AI Skills is an AI-powered CLI tool for video/audio transcription with Bilibili support. Convert videos to text, generate AI summaries, search knowledge base. Perfect for AI assistants.
keywords:
  - ai transcription
  - video to text
  - bilibili transcription
  - ai assistant tools
  - cli tool
  - audio transcription
---
```

## GitHub Topics Strategy

### Primary Topics (High Priority)
1. `ai-transcription` - Core functionality
2. `video-to-text` - Clear description
3. `bilibili` - Unique feature
4. `cli-tool` - Tool type
5. `ai-assistant` - Target audience

### Secondary Topics (Medium Priority)
6. `openai-claude` - Platform association
7. `cursor-ai` - Platform association
8. `xiao-long-xia` - Main platform

### Tertiary Topics (Low Priority)
9. `audio-processing` - Technical domain
10. `knowledge-base` - Additional feature

## Social Media Optimization

### Open Graph Tags (for GitHub)
```html
<meta property="og:title" content="Diting AI Skills - AI Video Transcription CLI">
<meta property="og:description" content="Convert videos to text with AI. Supports Bilibili, local files, knowledge base search. Perfect for AI assistants.">
<meta property="og:image" content="https://raw.githubusercontent.com/diting-ai/diting-ai-skills/main/social-preview.png">
<meta property="og:url" content="https://github.com/diting-ai/diting-ai-skills">
<meta property="og:type" content="software">
```

### Twitter Card
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Diting AI Skills - AI Video Transcription CLI">
<meta name="twitter:description" content="AI-powered CLI tool for video/audio transcription with Bilibili support.">
<meta name="twitter:image" content="https://raw.githubusercontent.com/diting-ai/diting-ai-skills/main/social-preview.png">
```

## Analytics Integration

### GitHub Insights to Monitor
1. **Traffic Analytics**: Views, clones, referrers
2. **Popular Content**: Most viewed files
3. **Community**: Stars, forks, issues
4. **Code Frequency**: Commit activity

### External Analytics (Optional)
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## Performance Optimization

### File Size Optimization
- Minify JavaScript files
- Compress images
- Use binary releases for distribution
- Optimize documentation structure

### Load Time Optimization
- Use GitHub Pages CDN
- Implement lazy loading for images
- Minify CSS and JavaScript
- Use appropriate caching headers

## Security Considerations

### Repository Security
- Enable vulnerability alerts
- Use Dependabot for dependency updates
- Regular security audits
- Secure API key handling

### Content Security
- No sensitive data in repository
- Secure authentication flows
- Regular dependency updates
- Security headers for GitHub Pages

## Monitoring and Maintenance

### Regular Tasks
1. **Weekly**: Check issues and pull requests
2. **Monthly**: Update dependencies
3. **Quarterly**: Review SEO performance
4. **Biannually**: Major feature updates

### Success Metrics
- GitHub stars growth
- Fork count
- Issue engagement
- Pull request activity
- Documentation views

---

**Last Updated**: 2026-07-06  
**Version**: 1.0.0  
**Maintainer**: Diting AI Team