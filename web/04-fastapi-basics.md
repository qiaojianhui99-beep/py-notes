# FastAPI 入门

FastAPI 是一个现代化的高性能 Python Web 框架，原生支持异步、自动生成 API 文档、类型提示驱动开发。

## 特点

- ⚡ **高性能**：基于 Starlette 和 Pydantic，性能媲美 Node.js 和 Go
- 🚀 **快速开发**：自动生成交互式 API 文档（Swagger UI）
- 🔒 **类型安全**：基于 Python 类型提示，自动数据验证
- 📖 **异步支持**：原生支持 async/await

## 安装

```bash
pip install fastapi uvicorn[standard]
```

- `fastapi`：框架本身
- `uvicorn`：ASGI 服务器

## 最小应用

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
```

**运行**：

```bash
uvicorn main:app --reload
```

访问：
- API：`http://127.0.0.1:8000`
- 交互式文档：`http://127.0.0.1:8000/docs`
- 备用文档：`http://127.0.0.1:8000/redoc`

## 路径参数

```python
@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id}

@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    return {"file_path": file_path}
```

访问 `/files/home/user/doc.txt` 时，`file_path` 为 `home/user/doc.txt`。

## 查询参数

```python
@app.get("/items")
def list_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

# 访问 /items?skip=5&limit=20
```

### 可选参数

```python
from typing import Optional

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    if q:
        return {"item_id": item_id, "q": q}
    return {"item_id": item_id}
```

### 必需参数

```python
@app.get("/items/{item_id}")
def read_item(item_id: int, q: str):  # q 是必需的
    return {"item_id": item_id, "q": q}
```

## 请求体（Pydantic 模型）

```python
from pydantic import BaseModel, EmailStr

class User(BaseModel):
    username: str
    email: EmailStr
    age: int | None = None
    is_active: bool = True

@app.post("/users")
def create_user(user: User):
    return {"username": user.username, "email": user.email}
```

**请求示例**：

```bash
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com", "age": 25}'
```

### 嵌套模型

```python
class Address(BaseModel):
    street: str
    city: str
    country: str

class User(BaseModel):
    username: str
    email: str
    address: Address

@app.post("/users")
def create_user(user: User):
    return user
```

## 响应模型

```python
class UserOut(BaseModel):
    username: str
    email: str
    # 不包含密码

@app.post("/users", response_model=UserOut)
def create_user(user: User):
    # 假设 User 包含 password 字段
    return user  # FastAPI 自动过滤掉不在 UserOut 中的字段
```

## 状态码

```python
from fastapi import status

@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user: User):
    return user

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int):
    # 删除用户
    return None
```

## 表单数据

```bash
pip install python-multipart
```

```python
from fastapi import Form

@app.post("/login")
def login(username: str = Form(), password: str = Form()):
    return {"username": username}
```

## 文件上传

```python
from fastapi import File, UploadFile

@app.post("/upload")
async def upload_file(file: UploadFile):
    contents = await file.read()
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents)
    }

# 多文件上传
@app.post("/upload-multiple")
async def upload_multiple(files: list[UploadFile]):
    return [{"filename": f.filename} for f in files]
```

## 异步支持

```python
import asyncio

@app.get("/slow")
async def slow_endpoint():
    await asyncio.sleep(5)  # 模拟慢查询
    return {"message": "Done"}

# 异步数据库查询
@app.get("/users")
async def get_users():
    users = await db.fetch_all("SELECT * FROM users")
    return users
```

## 依赖注入

```python
from fastapi import Depends

def get_current_user(token: str = Header()):
    # 验证 token
    return {"username": "alice"}

@app.get("/profile")
def read_profile(user: dict = Depends(get_current_user)):
    return user

# 数据库会话
async def get_db():
    db = Database()
    try:
        yield db
    finally:
        await db.close()

@app.get("/users")
async def get_users(db = Depends(get_db)):
    users = await db.fetch_all("SELECT * FROM users")
    return users
```

## 异常处理

```python
from fastapi import HTTPException

@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id not in database:
        raise HTTPException(status_code=404, detail="User not found")
    return database[user_id]

# 自定义异常处理器
from fastapi.responses import JSONResponse

class CustomException(Exception):
    def __init__(self, message: str):
        self.message = message

@app.exception_handler(CustomException)
async def custom_exception_handler(request, exc: CustomException):
    return JSONResponse(
        status_code=400,
        content={"message": exc.message}
    )
```

## 数据验证

```python
from pydantic import BaseModel, Field, validator

class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    age: int = Field(..., ge=0, le=150)
    
    @validator('username')
    def username_alphanumeric(cls, v):
        assert v.isalnum(), 'must be alphanumeric'
        return v
```

## 请求头与 Cookie

```python
from fastapi import Header, Cookie

@app.get("/headers")
def read_headers(user_agent: str = Header()):
    return {"User-Agent": user_agent}

@app.get("/cookies")
def read_cookies(session_id: str | None = Cookie(default=None)):
    return {"session_id": session_id}

# 设置 Cookie
from fastapi import Response

@app.get("/set-cookie")
def set_cookie(response: Response):
    response.set_cookie(key="session_id", value="abc123")
    return {"message": "Cookie set"}
```

## 后台任务

```python
from fastapi import BackgroundTasks

def send_email(email: str, message: str):
    # 模拟发送邮件
    print(f"Sending email to {email}: {message}")

@app.post("/send-notification")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_email, email, "Welcome!")
    return {"message": "Notification sent in background"}
```

## CORS

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],  # 生产环境指定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 中间件

```python
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

## 路由分组

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["users"])

@router.get("/users")
def get_users():
    return [{"username": "alice"}]

@router.post("/users")
def create_user(user: User):
    return user

# 注册路由
app.include_router(router)
```

## WebSocket

```python
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message received: {data}")
```

## 数据库集成（SQLAlchemy）

```bash
pip install sqlalchemy databases asyncpg
```

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)

Base.metadata.create_all(bind=engine)

# 依赖注入
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(username=user.username, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

## JWT 认证

```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

@app.post("/token")
def login(username: str = Form(), password: str = Form()):
    # 验证用户名密码
    access_token = create_access_token(data={"sub": username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/profile")
def read_profile(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": payload["sub"]}
```

## 测试

```python
from fastapi.testclient import TestClient

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, FastAPI!"}

def test_create_user():
    response = client.post("/users", json={
        "username": "alice",
        "email": "alice@example.com"
    })
    assert response.status_code == 201
```

## 配置与环境变量

```bash
pip install python-dotenv
```

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FastAPI App"
    database_url: str
    secret_key: str
    
    class Config:
        env_file = ".env"

settings = Settings()

@app.get("/info")
def info():
    return {"app_name": settings.app_name}
```

**.env**：

```
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
```

::: tip 学习建议
1. 先理解 Pydantic 模型和类型提示
2. 掌握异步编程（async/await）
3. 利用自动生成的 API 文档（/docs）调试
4. 学习依赖注入模式
5. 阅读官方文档：https://fastapi.tiangolo.com/
:::

## FastAPI vs Flask vs Django

| 特性 | FastAPI | Flask | Django |
|------|---------|-------|--------|
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 异步支持 | ✅ 原生 | ⚠️ 需扩展 | ⚠️ 3.1+ |
| 学习曲线 | 中等 | 简单 | 较陡 |
| API 文档 | ✅ 自动生成 | ❌ 需手动 | ❌ 需手动 |
| 数据验证 | ✅ Pydantic | ⚠️ 需扩展 | ✅ 内置 |
| 适用场景 | API 服务 | 小型应用 | 全栈项目 |

## 下一步

- **[Flask 入门](02-flask-basics.md)** - 轻量级框架
- **[Django 入门](05-django-basics.md)** - 全栈式框架
- **[RESTful API 设计](07-restful-api.md)** - API 设计最佳实践
