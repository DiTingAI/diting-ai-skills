# 谛听鉴权配置

## 概述

`diting` 不走独立 OAuth，需要提供：

- API Key

OpenClaw 中通过环境变量配置：

- `DITING_API_KEY`

---

## Base URL

- `https://api.diting.cc`

---

## 请求头

```http
Authorization: Bearer {API_KEY}
Content-Type: application/json;charset=UTF-8
Accept: application/json, text/plain, */*
```

---

## OpenClaw 配置示例

```json
{
  "skills": {
    "entries": {
      "diting": {
        "env": {
          "DITING_API_KEY": "your-api-key"
        }
      }
    }
  }
}
```

---

## API Key 获取

访问 [谛听 AI 开放平台](https://diting.cc/home/apikey) 获取 API Key。

---

## API Key 使用

直接使用已配置的 `DITING_API_KEY` 即可，无需额外登录流程。

---

## 使用方式

- 先获取可用的 API Key
- 获取到 API Key 后，配置到 `DITING_API_KEY`