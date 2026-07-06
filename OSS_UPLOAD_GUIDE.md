# 📦 OSS 上传指南 - 谛听 AI Skills

## 需要上传到 OSS 的文件

### 1. **主安装包** (必须上传)
```
文件: diting-skills-1.0.1.zip
大小: 49MB
路径: /Users/mac/Documents/workspace/06diting/01code/diting-skills/diting-skills/dist/diting-skills-1.0.1.zip
```

**OSS 目标地址:**
```
https://cdn.diting.cc/assets/diting-skills-1.0.1.zip
```

**为什么上传这个文件:**
- 这是 Agent 专用安装包
- 提示词中指定的下载地址就是这个文件
- 包含所有平台的二进制文件
- 包含完整的安装脚本和指南
- 专为小龙虾、Cursor、Claude、Codex 等 Agent 优化

### 2. **SKILL 专用包** (可选上传)
```
文件: diting-skills-v1.0.1-skill.zip
大小: 33MB
路径: /Users/mac/Documents/workspace/06diting/01code/diting-skills/diting-skills/dist/diting-skills-v1.0.1-skill.zip
```

**OSS 目标地址 (可选):**
```
https://cdn.diting.cc/assets/diting-skills-v1.0.1-skill.zip
```

**适用场景:**
- SKILLS 平台专用
- 需要 package-lock.json 的 Node.js 环境
- 体积更小，不包含所有平台的二进制文件

## 📋 上传步骤

### 方法一：使用 OSS 控制台
1. 登录 OSS 控制台 (如阿里云 OSS、腾讯云 COS)
2. 进入 `assets` 目录
3. 上传 `diting-skills-1.0.1.zip`
4. 确保权限设置为 **公共读**

### 方法二：使用 OSS CLI
```bash
# 阿里云 OSS
ossutil cp dist/diting-skills-1.0.1.zip oss://your-bucket/assets/diting-skills-1.0.1.zip

# 腾讯云 COS
coscli cp dist/diting-skills-1.0.1.zip cos://your-bucket/assets/diting-skills-1.0.1.zip
```

### 方法三：使用 API
```bash
# 使用 curl 上传
curl -X PUT \
  -H "Content-Type: application/zip" \
  -H "x-oss-object-acl: public-read" \
  -T dist/diting-skills-1.0.1.zip \
  "https://your-bucket.oss-cn-region.aliyuncs.com/assets/diting-skills-1.0.1.zip"
```

## 🔍 验证上传

上传完成后，请验证：
1. **URL 可访问**: https://cdn.diting.cc/assets/diting-skills-1.0.1.zip
2. **文件大小正确**: 49MB 左右
3. **可正常下载**: 
   ```bash
   curl -I https://cdn.diting.cc/assets/diting-skills-1.0.1.zip
   wget --spider https://cdn.diting.cc/assets/diting-skills-1.0.1.zip
   ```
4. **可正常解压**:
   ```bash
   wget -O test.zip https://cdn.diting.cc/assets/diting-skills-1.0.1.zip
   unzip -l test.zip | head -10
   ```

## 🚀 快速测试安装

使用以下命令测试安装流程：

```bash
# 测试一键安装
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash -s -- --test

# 测试手动安装
wget https://cdn.diting.cc/assets/diting-skills-1.0.1.zip
unzip diting-skills-1.0.1.zip
cd diting-skills-1.0.1
./dist/diting --version
```

## 📊 文件内容对比

| 文件 | 大小 | 包含内容 | 适用场景 |
|------|------|----------|----------|
| **diting-skills-1.0.1.zip** | 49MB | 所有二进制文件 + 安装脚本 + Agent指南 | Agent 安装 (主要) |
| diting-skills-v1.0.1-skill.zip | 33MB | 主机平台二进制 + package-lock.json | SKILLS 平台 (次要) |

## 📝 更新记录

- **2026-07-05**: 生成 v1.0.1 安装包
  - 清空并重新生成 dist 目录
  - 构建所有平台二进制文件
  - 生成最新的 ZIP 安装包
  - 验证通过所有检查

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/diting-ai/diting-skills
- **安装脚本**: https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh
- **API Key 获取**: https://diting.cc/home/apikey
- **官方文档**: https://diting.cc/home/skills

## ⚠️ 注意事项

1. **必须上传的文件**: `diting-skills-1.0.1.zip`
2. **OSS 路径必须匹配**: `/assets/diting-skills-1.0.1.zip`
3. **权限设置**: 必须设置为公共读
4. **CDN 缓存**: 上传后可能需要清除 CDN 缓存
5. **版本号**: 确保版本号与 package.json 一致 (v1.0.1)

上传完成后，用户即可使用提示词中的下载地址进行安装。