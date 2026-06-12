# HTTP 基础

在学习 Web 框架之前，需要先理解 HTTP 协议的基本原理。

## HTTP 协议概述

HTTP（HyperText Transfer Protocol）是一种无状态的应用层协议，用于客户端和服务器之间的通信。

### 请求-响应模型

```
客户端（浏览器） ----HTTP 请求----> 服务器
客户端（浏览器） <---HTTP 响应---- 服务器
```

## HTTP 请求

### 请求方法

| 方法 | 说明 | 幂等性 |
|------|------|--------|
| GET | 获取资源 | ✅ |
| POST | 创建资源 | ❌ |
| PUT | 更新资源（完整） | ✅ |
| PATCH | 更新资源（部分） | ❌ |
| DELETE | 删除资源 | ✅ |
| HEAD | 获取响应头 | ✅ |
| OPTIONS | 获取支持的方法 | ✅ |

### 请求结构

```http
GET /api/users/123 HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: application/json
Authorization: Bearer token123
```

组成部分：
1. **请求行**：方法 + 路径 + 协议版本
2. **请求头**：键值对形式的元数据
3. **空行**：分隔头部和正文
4. **请求正文**：POST/PUT 等方法携带的数据

## HTTP 响应

### 状态码

| 范围 | 类型 | 常见状态码 |
|------|------|-----------|
| 1xx | 信息 | 100 Continue |
| 2xx | 成功 | 200 OK, 201 Created, 204 No Content |
| 3xx | 重定向 | 301 Moved Permanently, 302 Found, 304 Not Modified |
| 4xx | 客户端错误 | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found |
| 5xx | 服务器错误 | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable |

### 响应结构

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 45
Set-Cookie: session=abc123

{"id": 123, "name": "Alice", "age": 25}
```

## 常用请求头

```python
# Python 模拟 HTTP 请求
import requests

headers = {
    'User-Agent': 'Mozilla/5.0',          # 客户端标识
    'Accept': 'application/json',          # 期望的响应格式
    'Content-Type': 'application/json',    # 请求正文格式
    'Authorization': 'Bearer token123',    # 认证信息
    'Cookie': 'session=abc123',            # 会话标识
}

response = requests.get('https://api.example.com/users', headers=headers)
```

## 常用响应头

```python
# 查看响应头
response = requests.get('https://example.com')

print(response.headers['Content-Type'])      # 响应格式
print(response.headers['Content-Length'])    # 正文长度
print(response.headers['Set-Cookie'])        # 设置 Cookie
print(response.headers['Cache-Control'])     # 缓存策略
```

## URL 结构

```
https://example.com:443/api/users?page=1&size=10#section
└─┬─┘ └────┬─────┘└┬┘└────┬────┘└──────┬──────┘└───┬──┘
协议      域名     端口   路径        查询参数      锚点
```

### URL 编码

```python
from urllib.parse import quote, unquote

# 编码
text = "你好 世界"
encoded = quote(text)  # '%E4%BD%A0%E5%A5%BD%20%E4%B8%96%E7%95%8C'

# 解码
decoded = unquote(encoded)  # '你好 世界'
```

## Content-Type 常见类型

| Content-Type | 说明 | 示例 |
|--------------|------|------|
| `application/json` | JSON 数据 | `{"name": "Alice"}` |
| `application/x-www-form-urlencoded` | 表单数据（URL 编码） | `name=Alice&age=25` |
| `multipart/form-data` | 文件上传 | 二进制 + 分隔符 |
| `text/html` | HTML 文档 | `<h1>Hello</h1>` |
| `text/plain` | 纯文本 | `Hello World` |
| `application/xml` | XML 数据 | `<user><name>Alice</name></user>` |

## Cookie 与 Session

### Cookie

```python
# 设置 Cookie（服务器响应头）
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure

# 发送 Cookie（客户端请求头）
Cookie: session_id=abc123
```

### Session

```python
from flask import Flask, session

app = Flask(__name__)
app.secret_key = 'secret-key'

@app.route('/login')
def login():
    session['user_id'] = 123  # 存储到服务器端
    return 'Logged in'

@app.route('/profile')
def profile():
    user_id = session.get('user_id')  # 从服务器端读取
    return f'User ID: {user_id}'
```

## HTTPS 加密

```
HTTP  → 明文传输，不安全
HTTPS → TLS/SSL 加密，推荐使用
```

### Python 验证 SSL 证书

```python
import requests

# 验证证书（默认）
response = requests.get('https://example.com')

# 忽略证书验证（不推荐，仅测试环境）
response = requests.get('https://example.com', verify=False)
```

## RESTful API 设计原则

```python
# 资源导向设计
GET    /users           # 获取用户列表
POST   /users           # 创建用户
GET    /users/123       # 获取特定用户
PUT    /users/123       # 更新用户（完整）
PATCH  /users/123       # 更新用户（部分）
DELETE /users/123       # 删除用户

# 嵌套资源
GET    /users/123/posts      # 获取用户的文章列表
POST   /users/123/posts      # 为用户创建文章
```

## 实战：Python 发送 HTTP 请求

```python
import requests

# GET 请求
response = requests.get('https://api.github.com/users/python')
print(response.status_code)  # 200
print(response.json())       # 解析 JSON

# POST 请求（JSON）
data = {'name': 'Alice', 'age': 25}
response = requests.post('https://api.example.com/users', json=data)

# POST 请求（表单）
data = {'username': 'alice', 'password': 'secret'}
response = requests.post('https://example.com/login', data=data)

# 上传文件
files = {'file': open('photo.jpg', 'rb')}
response = requests.post('https://example.com/upload', files=files)

# 自定义请求头
headers = {'Authorization': 'Bearer token123'}
response = requests.get('https://api.example.com/profile', headers=headers)
```

## 实战：Python 启动 HTTP 服务器

### 1. 标准库（测试用）

```python
# Python 3.x
python -m http.server 8000

# 访问 http://localhost:8000
```

### 2. Flask（开发推荐）

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({'message': 'Hello World'})

if __name__ == '__main__':
    app.run(debug=True, port=8000)
```

::: tip 学习建议
1. 使用浏览器开发者工具（F12 → Network）观察实际的 HTTP 请求
2. 用 Postman 或 curl 练习发送各种 HTTP 请求
3. 理解 RESTful API 设计原则
4. 掌握常见状态码和响应头的含义
:::

## 下一步

- **[Flask 入门](02-flask-basics.md)** - 轻量级 Web 框架
- **[Django 入门](05-django-basics.md)** - 全栈式框架
- **[FastAPI 入门](08-fastapi-basics.md)** - 现代化高性能框架
