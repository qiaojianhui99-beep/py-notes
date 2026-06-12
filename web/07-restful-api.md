# RESTful API 设计

RESTful API 设计规范和最佳实践，构建规范、易用、可扩展的 Web API。

## REST 核心原则

### 1. 资源（Resource）

用 **名词** 表示资源，而非动词：

✅ **正确**：
- `GET /users` - 获取用户列表
- `GET /users/123` - 获取特定用户
- `POST /users` - 创建用户

❌ **错误**：
- `GET /getUsers`
- `POST /createUser`
- `GET /user/delete/123`

### 2. HTTP 方法（Verb）

| 方法 | 用途 | 幂等性 |
|------|------|--------|
| GET | 获取资源 | ✅ |
| POST | 创建资源 | ❌ |
| PUT | 更新资源（完整替换） | ✅ |
| PATCH | 更新资源（部分修改） | ❌ |
| DELETE | 删除资源 | ✅ |

### 3. 状态码（Status Code）

| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 200 | OK | 成功获取/更新 |
| 201 | Created | 成功创建 |
| 204 | No Content | 成功删除 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器错误 |

## URL 设计规范

### 资源命名

```
✅ 使用复数名词
GET /users
GET /posts
GET /comments

❌ 避免单数
GET /user
GET /post
```

### 层级关系

```
✅ 嵌套资源
GET /users/123/posts          # 用户的文章列表
GET /users/123/posts/456      # 用户的特定文章
POST /users/123/posts         # 为用户创建文章

⚠️ 避免超过 3 层嵌套
GET /users/123/posts/456/comments/789/likes  # 太深
改为: GET /comments/789/likes
```

### 过滤、排序、分页

```
# 过滤
GET /posts?status=published
GET /posts?author=123&category=tech

# 排序
GET /posts?sort=created_at
GET /posts?sort=-created_at  # 降序

# 分页
GET /posts?page=2&per_page=20
GET /posts?offset=20&limit=20

# 搜索
GET /posts?q=python

# 字段选择
GET /posts?fields=id,title,author
```

## 请求与响应格式

### 请求格式（JSON）

```json
POST /api/users
Content-Type: application/json

{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secure_password"
}
```

### 响应格式

#### 成功响应

```json
GET /api/users/123

{
  "id": 123,
  "username": "alice",
  "email": "alice@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 列表响应（带分页）

```json
GET /api/posts?page=1&per_page=10

{
  "data": [
    {"id": 1, "title": "Post 1"},
    {"id": 2, "title": "Post 2"}
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 10,
    "total_pages": 10
  },
  "links": {
    "self": "/api/posts?page=1",
    "next": "/api/posts?page=2",
    "prev": null,
    "first": "/api/posts?page=1",
    "last": "/api/posts?page=10"
  }
}
```

#### 错误响应

```json
POST /api/users
Status: 400 Bad Request

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is already taken"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

## CRUD 操作示例

### 用户资源

```
# 获取用户列表
GET /api/users
Response: 200 OK

# 获取特定用户
GET /api/users/123
Response: 200 OK

# 创建用户
POST /api/users
Request Body: {"username": "alice", "email": "alice@example.com"}
Response: 201 Created
Location: /api/users/123

# 更新用户（完整）
PUT /api/users/123
Request Body: {"username": "alice", "email": "newemail@example.com"}
Response: 200 OK

# 更新用户（部分）
PATCH /api/users/123
Request Body: {"email": "newemail@example.com"}
Response: 200 OK

# 删除用户
DELETE /api/users/123
Response: 204 No Content
```

## 认证与授权

### 1. Token 认证

```http
GET /api/posts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. API Key 认证

```http
GET /api/posts
X-API-Key: your-api-key-here
```

### 3. OAuth 2.0

```http
GET /api/posts
Authorization: Bearer oauth-access-token
```

## 版本控制

### 方式 1：URL 版本

```
GET /api/v1/users
GET /api/v2/users
```

### 方式 2：请求头版本

```http
GET /api/users
Accept: application/vnd.myapp.v2+json
```

### 方式 3：查询参数

```
GET /api/users?version=2
```

**推荐**：URL 版本（简单直观）

## 错误处理

### 标准错误格式

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User not found",
    "status": 404,
    "timestamp": "2024-01-01T00:00:00Z",
    "path": "/api/users/999"
  }
}
```

### 错误码设计

```
USER_NOT_FOUND          # 用户不存在
INVALID_CREDENTIALS     # 凭证无效
PERMISSION_DENIED       # 权限不足
VALIDATION_ERROR        # 验证失败
RATE_LIMIT_EXCEEDED     # 超出限流
```

## HATEOAS（超媒体）

```json
GET /api/users/123

{
  "id": 123,
  "username": "alice",
  "email": "alice@example.com",
  "_links": {
    "self": {"href": "/api/users/123"},
    "posts": {"href": "/api/users/123/posts"},
    "followers": {"href": "/api/users/123/followers"}
  }
}
```

## 批量操作

### 批量创建

```json
POST /api/users/batch

{
  "users": [
    {"username": "alice", "email": "alice@example.com"},
    {"username": "bob", "email": "bob@example.com"}
  ]
}

Response: 207 Multi-Status
{
  "results": [
    {"status": 201, "id": 123},
    {"status": 400, "error": "Email already exists"}
  ]
}
```

### 批量更新

```json
PATCH /api/users

{
  "ids": [1, 2, 3],
  "data": {"status": "active"}
}
```

## 限流（Rate Limiting）

```http
GET /api/posts
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000

Status: 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds"
  }
}
```

## 缓存

### ETag

```http
GET /api/users/123
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

GET /api/users/123
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Response: 304 Not Modified
```

### Last-Modified

```http
GET /api/users/123
Last-Modified: Wed, 01 Jan 2024 00:00:00 GMT

GET /api/users/123
If-Modified-Since: Wed, 01 Jan 2024 00:00:00 GMT
Response: 304 Not Modified
```

## 实战：Flask API

```python
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

@app.route('/api/users', methods=['GET'])
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    pagination = User.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'data': [{'id': u.id, 'username': u.username} for u in pagination.items],
        'meta': {
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'total_pages': pagination.pages
        }
    })

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({'id': user.id, 'username': user.username, 'email': user.email})

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    
    if not data or not data.get('username') or not data.get('email'):
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Missing fields'}}), 400
    
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'id': user.id, 'username': user.username}), 201

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    db.session.commit()
    
    return jsonify({'id': user.id, 'username': user.username})

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Resource not found'}}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Internal server error'}}), 500
```

## 实战：FastAPI

```python
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import List

app = FastAPI()

class User(BaseModel):
    id: int
    username: str
    email: EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr

users_db = []

@app.get("/api/users", response_model=List[User])
def get_users(page: int = Query(1, ge=1), per_page: int = Query(10, ge=1, le=100)):
    start = (page - 1) * per_page
    end = start + per_page
    return users_db[start:end]

@app.get("/api/users/{user_id}", response_model=User)
def get_user(user_id: int):
    user = next((u for u in users_db if u['id'] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/users", response_model=User, status_code=201)
def create_user(user: UserCreate):
    new_user = {"id": len(users_db) + 1, **user.dict()}
    users_db.append(new_user)
    return new_user

@app.put("/api/users/{user_id}", response_model=User)
def update_user(user_id: int, user: UserCreate):
    existing = next((u for u in users_db if u['id'] == user_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    existing.update(user.dict())
    return existing

@app.delete("/api/users/{user_id}", status_code=204)
def delete_user(user_id: int):
    global users_db
    users_db = [u for u in users_db if u['id'] != user_id]
    return None
```

## API 文档

### Swagger/OpenAPI

FastAPI 自动生成：
- Swagger UI：`http://localhost:8000/docs`
- ReDoc：`http://localhost:8000/redoc`

Flask 使用 flask-swagger-ui：

```bash
pip install flask-swagger-ui
```

## 最佳实践总结

### ✅ 推荐

1. **使用名词表示资源**，用 HTTP 方法表示操作
2. **返回适当的状态码**（200、201、400、404 等）
3. **提供清晰的错误消息**
4. **使用分页**处理大数据集
5. **版本控制**保证兼容性
6. **使用 HTTPS** 保护数据
7. **限流**防止滥用
8. **文档完善**（Swagger/OpenAPI）

### ❌ 避免

1. ❌ URL 中使用动词（`/getUsers`）
2. ❌ 返回不准确的状态码
3. ❌ 暴露内部实现细节
4. ❌ 缺少错误处理
5. ❌ 不分页返回大量数据
6. ❌ 忽略安全性

::: tip 学习建议
1. 理解 REST 核心原则
2. 学习 HTTP 协议和状态码
3. 实践设计一个完整的 API
4. 阅读优秀 API 文档（GitHub、Stripe）
5. 使用 Postman 测试 API
:::

## 下一步

- **[Flask 进阶](03-flask-advanced.md)** - 实现 RESTful API
- **[Django REST Framework](06-django-advanced.md)** - DRF 最佳实践
- **[FastAPI 入门](04-fastapi-basics.md)** - 现代 API 开发
