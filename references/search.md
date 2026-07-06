# 搜索与索引

## 概述

当前支持两种搜索方式：

1. 按关键词搜索知识库（向量检索问答）
2. 按文件名搜索文件列表

API Key 管理接口也已集成。

---

## 1. 知识库搜索

```text
POST /api/v1/search
```

参考请求体：

```json
{
  "question": "吴恩达",
  "top_k": 5,
  "stream": false
}
```

参数说明：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `question` | string | 是 | - | 用户问题（支持空格分隔多个词） |
| `top_k` | int | 否 | 5 | 返回最相关的片段数量 |
| `stream` | bool | 否 | false | 是否流式返回（当前版本暂不支持） |

> **注意**: 之前的 `query` 参数已更新为 `question`，`search_type` 和 `filters` 字段已废弃。

响应：

```json
{
  "code": 0,
  "data": {
    "answer": "谛听是一款视频内容智能分析工具...",
    "sources": [
      {
        "video_id": "task-xxx",
        "video_title": "视频标题",
        "start_offset": 120,
        "end_offset": 180,
        "text": "相关片段内容...",
        "score": 0.92
      }
    ],
    "total_tokens": 500
  }
}
```

> **路由说明**: `POST /api/v1/knowledge/chat` 与此接口功能完全相同，指向同一个处理函数。

---

## 2. 文件列表搜索

```text
GET /api/v1/videos
```

参考参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | int | 1 | 页码 |
| `page_size` | int | 12 | 每页条数 |
| `file_name` | string | - | 文件名搜索关键词 |
| `status` | array | - | 状态过滤 |
| `sort_field` | string | publishTime | 排序字段 |
| `sort_order` | string | desc | 排序方向 |

---

## 3. API Key 管理

### 获取 API Key 列表

```text
GET /api/v1/apikeys
```

> **注意**: 需要 JWT 鉴权（用户登录态），不支持 API Key 鉴权。

### 创建 API Key

```text
POST /api/v1/apikeys
```

请求体：

```json
{
  "name": "DiTing Skills Key",
  "scopes": ["read", "write"],
  "expires_in_days": 365
}
```

参数说明：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | Key 名称 |
| `scopes` | array | 否 | 权限范围：`read` / `write` |
| `expires_in_days` | int | 否 | 过期天数（0 表示永不过期） |

> **重要**: `secret` 仅在创建时返回一次，后续无法查看，请妥善保存。

### 删除 API Key

```text
DELETE /api/v1/apikeys/{keyId}
```

---

## 4. 使用建议

- 用户说"搜索知识库"或语义相关的词，优先走 `/api/v1/search`
- 用户说"搜索文件"或"找文件"，走 `/api/v1/videos`
- 搜索无结果时，告知用户未找到匹配文件
- 搜索有结果时，展示匹配的文件列表，包含文件名、匹配内容摘要等

---

## Node 脚本

### 知识库搜索

```bash
node scripts/search.js --query "吴恩达"
```

```bash
node scripts/search.js --query "机器学习" --top-k 10
```

### 文件列表搜索

```bash
node scripts/search.js --list-videos --page 1 --page_size 10
```

### API Key 管理

```bash
# 列出所有 API Key
node scripts/search.js --list-keys

# 创建 API Key
node scripts/search.js --create-key --name "My Key" --scopes read,write

# 删除 API Key
node scripts/search.js --delete-key --key-id <key_id>
```
