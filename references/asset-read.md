# 资产读取

## 概述

当前可读取：

- 文件详情
- 原文（逐字稿）
- AI 纪要
- 视频元数据

---

## 1. 获取资产详情

### 通过 Task ID 获取

```text
GET /api/v1/videos/{task_id}
```

响应：

```json
{
  "code": 200,
  "data": {
    "id": "vid_20260703_abc123",
    "title": "罗翔谈刑法三小时完整版",
    "source_url": "https://www.bilibili.com/video/BVxxxxx",
    "duration": 10800,
    "status": "completed",
    "transcript": "......",
    "summary": "AI 自动生成的结构化摘要...",
    "mindmap_url": "https://cdn.diting.cc/mindmap/abc123.png",
    "created_at": "2026-07-03T10:23:45Z",
    "metadata": {
      "word_count": 68432,
      "paragraph_count": 412,
      "tags": ["刑法", "罗翔", "访谈"]
    }
  }
}
```

### 通过资产 ID 获取

```text
GET /api/v1/assets/{id}
```

---

## 2. 状态判断

### 主状态（status）

| 值 | 说明 |
|---|---|
| -2 | 权益受限 |
| 0, 1, 2, 11, 12, 101 | 处理中 |
| 4 | 处理完成 |
| 90 | 需手动触发转写 |
| 100 | 文件解析失败 |

---

## 3. 使用建议

- 优先先查 `/api/v1/videos/{task_id}`
- 判断任务是否完成
- 若完成，直接读取原文、纪要等数据
- 原文、纪要数据默认返回 API 提供的原始数据，不要对原数据做二次加工，除非用户明确说继续总结

---

## Node 脚本

```bash
node scripts/asset_read.js --task-id tsk_20260703_xxxxxxxx
```

或：

```bash
node scripts/asset_read.js --asset-id vid_20260703_abc123
```