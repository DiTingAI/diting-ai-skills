# 错误处理指南

本文档详细介绍了谛听 AI Skills 中的错误处理机制和最佳实践。

## 错误类型

### 1. 配置错误

**场景**: API Key 未配置或无效

```bash
错误: 缺少环境变量 DITING_API_KEY，请访问 https://diting.cc/home/apikey 获取
```

**解决方法**:
1. 获取 API Key: https://diting.cc/home/apikey
2. 设置环境变量: `export DITING_API_KEY=your-api-key`
3. 验证配置: `diting --help` 应正常显示

### 2. 网络错误

**场景**: 网络连接问题或 API 服务不可用

```bash
错误: 网络连接失败
错误: 请求超时
错误: API 服务暂时不可用
```

**解决方法**:
1. 检查网络连接
2. 等待 API 服务恢复
3. 重试命令 (系统会自动重试2次)
4. 检查 `DITING_API_BASE_URL` 配置

### 3. 认证错误

**场景**: API Key 无效或过期

```bash
错误: API Key 无效或已过期，请访问 https://diting.cc/home/apikey 重新获取
```

**解决方法**:
1. 重新生成 API Key
2. 更新环境变量
3. 检查 API Key 权限

### 4. 资源限制错误

**场景**: 额度不足或请求限制

```bash
错误: 可用时长不足，请升级套餐
错误: 今日视频处理次数已达上限（20次），请明天再试
错误: 任务排队数超过上限，升级VIP会员可享受无限排队
```

**解决方法**:
1. 升级套餐
2. 等待限制重置（每日）
3. 减少并发请求

### 5. 文件错误

**场景**: 文件不存在或格式不支持

```bash
错误: 文件不存在: /path/to/file.mp3
错误: 文件路径必须为绝对路径
错误: 不支持的文件格式
```

**解决方法**:
1. 检查文件路径是否正确
2. 使用绝对路径
3. 确保文件格式支持（见支持格式列表）

### 6. 参数错误

**场景**: 命令行参数错误

```bash
错误: 缺少 --url 参数
错误: 未知命令: unknown-command
错误: 参数 --file 必须提供文件路径
```

**解决方法**:
1. 查看帮助: `diting --help`
2. 检查参数格式
3. 参考示例命令

## 支持的文件格式

### 音频格式
- MP3 (.mp3)
- WAV (.wav) 
- M4A (.m4a)
- AAC (.aac)
- FLAC (.flac)
- OGG (.ogg)
- AMR (.amr)

### 视频格式
- MP4 (.mp4)
- MOV (.mov)
- M4V (.m4v)
- AVI (.avi)
- MKV (.mkv)
- WebM (.webm)

## 错误代码参考

### HTTP 状态码

| 状态码 | 含义 | 解决方法 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查参数格式 |
| 401 | 认证失败 | 更新 API Key |
| 402 | 额度不足 | 升级套餐 |
| 404 | 资源不存在 | 检查任务/文件 ID |
| 429 | 请求过多 | 降低请求频率 |
| 500 | 服务器错误 | 稍后重试 |
| 502/503/504 | 服务暂时不可用 | 稍后重试 |

### API 错误代码

| 错误码 | 含义 | 说明 |
|--------|------|------|
| E2001 | 认证失败 | API Key 无效 |
| E2002 | 参数错误 | 请求参数格式错误 |
| E2003 | 文件格式不支持 | 上传文件格式不受支持 |
| E2004 | 文件大小超限 | 文件超过最大限制 |
| E2005 | 任务不存在 | 任务 ID 无效 |
| E2006 | 权限不足 | 账户权限不足 |
| E2007 | 额度不足 | 套餐额度用完 |
| E2008 | 每日限制 | 达到每日处理上限 |
| E2009 | 队列限制 | 任务队列已满 |

## 调试技巧

### 1. 启用详细日志

```bash
# 设置调试环境变量
export DEBUG=diting:*
diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"
```

### 2. 检查环境变量

```bash
# 检查 API Key 是否设置
echo $DITING_API_KEY

# 检查 API 基础 URL
echo $DITING_API_BASE_URL
```

### 3. 测试 API 连接

```bash
# 测试基本连接
curl -H "Authorization: Bearer $DITING_API_KEY" https://api.diting.cc/api/v1/health

# 测试搜索功能
curl -X POST -H "Authorization: Bearer $DITING_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"test","top_k":1}' \
  https://api.diting.cc/api/v1/search
```

### 4. 验证文件上传

```bash
# 检查文件权限
ls -la /path/to/your/file.mp3

# 检查文件格式
file /path/to/your/file.mp3

# 检查文件大小
du -h /path/to/your/file.mp3
```

## 最佳实践

### 1. 错误处理策略

```javascript
// 重试机制示例
try {
  const result = await transcribeWithRetry(options);
} catch (error) {
  if (error.message.includes('网络连接')) {
    console.log('网络问题，请检查连接后重试');
  } else if (error.message.includes('额度不足')) {
    console.log('额度不足，请升级套餐');
  } else {
    console.log('未知错误:', error.message);
  }
}
```

### 2. 进度反馈

```bash
# 长任务使用轮询
diting transcribe --task-id tsk_xxx --poll

# 显示进度信息
Processing... 45%
Estimated time remaining: 2 minutes
```

### 3. 资源管理

```bash
# 检查任务状态
diting transcribe --task-id tsk_xxx

# 列出所有任务
diting transcribe --list

# 清理失败任务
diting update --id task_id --delete
```

## 常见问题解答

### Q1: API Key 在哪里获取？
A: 访问 https://diting.cc/home/apikey 注册并获取 API Key。

### Q2: 支持的最大文件大小是多少？
A: 当前支持最大 2GB 的文件上传。

### Q3: 如何处理超时错误？
A: 系统会自动重试2次，如果仍然失败，请检查网络连接或稍后重试。

### Q4: 如何查看任务进度？
A: 使用 `diting transcribe --task-id tsk_xxx --poll` 轮询任务状态。

### Q5: 支持哪些视频平台？
A: 目前主要支持 Bilibili，其他平台正在开发中。

### Q6: 如何获取技术支持？
A: 在 GitHub Issues 中提交问题，或联系 support@diting.cc。

## 故障排除流程

1. **检查配置**
   - API Key 是否正确
   - 环境变量是否设置
   - 网络连接是否正常

2. **验证命令**
   - 参数格式是否正确
   - 文件路径是否存在
   - 命令语法是否正确

3. **查看日志**
   - 启用调试模式
   - 检查错误消息
   - 查看 API 响应

4. **测试连接**
   - 测试 API 连通性
   - 验证文件上传
   - 检查任务状态

5. **联系支持**
   - 提供错误信息
   - 提供复现步骤
   - 提供环境信息

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解错误修复和改进。