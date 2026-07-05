# 搜索与索引

## 概述

当前支持两种搜索方式：

1. 按关键词搜索知识库（语义搜索）
2. 按文件名搜索文件列表

---

## 1. 知识库搜索

```text
POST /api/v1/search
```

参考请求体：

```json
{
  "query": "吴恩达",
  "top_k": 5,
  "search_type": "hybrid"
}
```

参数说明：

- `query`: 搜索关键词，支持空格分隔多个词
- `top_k`: 返回条数（默认 5）
- `search_type`: 搜索类型
  - `hybrid`: 混合搜索（BM25 + 向量召回 + RRF 融合排序）
  - `bm25`: 仅关键词匹配
  - `vector`: 仅向量召回

响应：

```json
{
  "code": 0,
  "data": {
    "total": 12,
    "results": [
      {
        "id": "vid_20260703_abc123",
        "title": "吴恩达机器学习课程完整版",
        "score": 0.92,
        "matched_text": "吴恩达教授在斯坦福大学开设的机器学习课程...",
        "timestamp": 123456,
        "tags": ["机器学习", "AI"]
      }
    ]
  }
}
```

---

## 2. 文件列表搜索

```text
GET /api/v1/videos
```

参考参数：

| 参数 | 类型 | 说明 |
|---|---|---|
| `page` | int | 页码，默认 1 |
| `page_size` | int | 每页条数，默认 12 |
| `file_name` | string | 文件名搜索关键词 |

---

## 3. 使用建议

- 用户说"搜索知识库"或语义相关的词，优先走 `/api/v1/search`
- 用户说"搜索文件"或"找文件"，走 `/api/v1/videos`
- 搜索无结果时，告知用户未找到匹配文件
- 搜索有结果时，展示匹配的文件列表，包含文件名、匹配内容摘要等

---

## Node 脚本

```bash
node scripts/search.js --query "吴恩达"
```

```bash
node scripts/search.js --query "机器学习" --top-k 10
```

```bash
node scripts/search.js --list-videos --page 1 --page_size 10