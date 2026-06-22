# Web 中间件开发

## 中间件概念

### 什么是中间件

中间件（Middleware）是位于请求和响应之间的处理层，可以在请求到达视图函数之前或响应返回客户端之前执行代码。

**请求处理流程：**

```
客户端请求 → [中间件1] → [中间件2] → [中间件3] → 视图函数
                ↑            ↑            ↑
                └────────────┴────────────┘
                  响应时反向执行
```

### 中间件执行流程

```python
# 伪代码示例
def middleware1(request):
    print("中间件1 - 请求前")
    response = next_middleware(request)
    print("中间件1 - 响应后")
    return response

def middleware2(request):
    print("中间件2 - 请求前")
    response = next_middleware(request)
    print("中间件2 - 响应后")
    return response

def view(request):
    print("视图函数")
    return response

# 执行顺序：
# 中间件1 - 请求前
# 中间件2 - 请求前
# 视图函数
# 中间件2 - 响应后
# 中间件1 - 响应后
```

### 中间件应用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| 日志记录 | 记录请求和响应信息 | 访问日志、慢请求监控 |
| 认证授权 | 验证用户身份和权限 | JWT 验证、API 密钥检查 |
| 跨域处理 | 添加 CORS 头 | 允许前后端分离 |
| 请求计时 | 统计接口性能 | 响应时间分析 |
| 异常捕获 | 统一错误处理 | 自定义错误响应 |
| 请求限流 | 防止滥用 | IP 限流、用户限流 |
| 数据压缩 | 压缩响应内容 | GZIP 压缩 |
| 缓存控制 | 添加缓存头 | 浏览器缓存策略 |

---

## Flask 中间件

### before_request

在每个请求处理**之前**执行：

```python
from flask import Flask, request, g
import time

app = Flask(__name__)

@app.before_request
def before_request():
    """在每个请求前执行"""
    # 记录请求开始时间
    g.start_time = time.time()
    
    # 打印请求信息
    print(f"[{request.method}] {request.path}")
    
    # 可以返回 Response 对象来中断请求
    # if not request.headers.get('API-Key'):
    #     return jsonify({'error': '缺少 API Key'}), 401

@app.route('/hello')
def hello():
    return 'Hello World'
```

### after_request

在每个请求处理**之后**执行（必须返回 Response 对象）：

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.after_request
def after_request(response):
    """在每个请求后执行"""
    # 添加自定义响应头
    response.headers['X-Custom-Header'] = 'MyValue'
    
    # 添加 CORS 头
    response.headers['Access-Control-Allow-Origin'] = '*'
    
    # 计算请求耗时
    if hasattr(g, 'start_time'):
        elapsed = time.time() - g.start_time
        response.headers['X-Response-Time'] = f"{elapsed:.3f}s"
    
    return response  # 必须返回 response

@app.route('/data')
def data():
    return jsonify({'message': 'success'})
```

### teardown_request

在请求结束时执行（无论是否有异常）：

```python
from flask import Flask

app = Flask(__name__)

@app.teardown_request
def teardown_request(exception=None):
    """请求结束时执行"""
    if exception:
        print(f"请求异常: {exception}")
    
    # 清理资源（如数据库连接）
    if hasattr(g, 'db'):
        g.db.close()
```

### WSGI 中间件

Flask 基于 WSGI，可以使用 WSGI 中间件：

```python
from flask import Flask

app = Flask(__name__)

class SimpleMiddleware:
    def __init__(self, app):
        self.app = app
    
    def __call__(self, environ, start_response):
        """WSGI 调用接口"""
        print(f"请求路径: {environ['PATH_INFO']}")
        
        # 调用下一个中间件或应用
        return self.app(environ, start_response)

# 应用中间件
app.wsgi_app = SimpleMiddleware(app.wsgi_app)

@app.route('/')
def index():
    return 'Hello'
```

### 完整的 Flask 中间件示例

```python
from flask import Flask, request, jsonify, g
import time
from functools import wraps

app = Flask(__name__)

# 1. 请求日志中间件
@app.before_request
def log_request():
    """记录请求日志"""
    g.start_time = time.time()
    print(f"[{request.method}] {request.path} - {request.remote_addr}")

@app.after_request
def log_response(response):
    """记录响应日志"""
    if hasattr(g, 'start_time'):
        elapsed = time.time() - g.start_time
        print(f"响应耗时: {elapsed:.3f}s - 状态码: {response.status_code}")
    return response

# 2. CORS 中间件
@app.after_request
def add_cors_headers(response):
    """添加 CORS 头"""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

# 3. API 密钥验证中间件（装饰器方式）
def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != 'secret-key':
            return jsonify({'error': 'Invalid API Key'}), 401
        return f(*args, **kwargs)
    return decorated_function

# 使用中间件
@app.route('/api/data')
@require_api_key
def get_data():
    return jsonify({'data': 'secret data'})

@app.route('/public')
def public():
    return jsonify({'message': 'public endpoint'})
```

---

## Django Middleware

### 中间件类定义

Django 中间件是一个类，必须实现 `__init__` 和 `__call__` 方法：

```python
# middleware.py

class SimpleMiddleware:
    def __init__(self, get_response):
        """初始化，只在启动时调用一次"""
        self.get_response = get_response
        # 一次性配置和初始化
    
    def __call__(self, request):
        """每个请求都会调用"""
        # 请求到达视图前的代码
        print(f"请求前: {request.path}")
        
        # 调用下一个中间件或视图
        response = self.get_response(request)
        
        # 视图返回后的代码
        print(f"请求后: {response.status_code}")
        
        return response
```

### 中间件钩子方法

```python
class FullMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # process_request 的代码
        response = self.get_response(request)
        # process_response 的代码
        return response
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """在视图函数调用之前"""
        print(f"即将调用视图: {view_func.__name__}")
        # 返回 None 继续处理，返回 HttpResponse 则短路
        return None
    
    def process_exception(self, request, exception):
        """视图抛出异常时"""
        print(f"捕获异常: {exception}")
        # 返回 HttpResponse 或 None
        return None
    
    def process_template_response(self, request, response):
        """视图返回 TemplateResponse 时"""
        # 可以修改响应的上下文
        return response
```

### 中间件顺序

在 `settings.py` 中配置：

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 自定义中间件
    'myapp.middleware.LoggingMiddleware',
    'myapp.middleware.TimingMiddleware',
]
```

**执行顺序：**
- 请求阶段：从上到下
- 响应阶段：从下到上

```
请求 → SecurityMiddleware → SessionMiddleware → ... → 视图
响应 ← SecurityMiddleware ← SessionMiddleware ← ... ← 视图
```

### 完整的 Django 中间件示例

```python
# middleware.py
import time
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(MiddlewareMixin):
    """请求日志中间件"""
    
    def process_request(self, request):
        """请求开始"""
        request.start_time = time.time()
        logger.info(f"[{request.method}] {request.path} - {request.META.get('REMOTE_ADDR')}")
    
    def process_response(self, request, response):
        """请求结束"""
        if hasattr(request, 'start_time'):
            elapsed = time.time() - request.start_time
            logger.info(f"响应: {response.status_code} - 耗时: {elapsed:.3f}s")
        
        return response

class CORSMiddleware(MiddlewareMixin):
    """CORS 中间件"""
    
    def process_response(self, request, response):
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

class APIKeyMiddleware:
    """API 密钥验证中间件"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # 只验证 /api/ 路径
        if request.path.startswith('/api/'):
            api_key = request.META.get('HTTP_X_API_KEY')
            if not api_key or api_key != 'secret-key':
                from django.http import JsonResponse
                return JsonResponse({'error': 'Invalid API Key'}, status=401)
        
        response = self.get_response(request)
        return response

class ExceptionHandlingMiddleware:
    """统一异常处理中间件"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        return self.get_response(request)
    
    def process_exception(self, request, exception):
        """捕获视图异常"""
        from django.http import JsonResponse
        
        logger.error(f"异常: {exception}", exc_info=True)
        
        return JsonResponse({
            'error': '服务器内部错误',
            'message': str(exception)
        }, status=500)
```

**配置中间件：**

```python
# settings.py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'myapp.middleware.RequestLoggingMiddleware',  # 请求日志
    'django.contrib.sessions.middleware.SessionMiddleware',
    'myapp.middleware.CORSMiddleware',  # CORS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'myapp.middleware.APIKeyMiddleware',  # API 验证
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'myapp.middleware.ExceptionHandlingMiddleware',  # 异常处理
]
```

---

## FastAPI Middleware

### @app.middleware 装饰器

最简单的中间件定义方式：

```python
from fastapi import FastAPI, Request
import time

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """添加响应时间头"""
    start_time = time.time()
    
    # 调用下一个中间件或路由
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

### BaseHTTPMiddleware

更灵活的中间件类：

```python
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
import time

app = FastAPI()

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        """处理请求"""
        start_time = time.time()
        
        # 执行请求
        response = await call_next(request)
        
        # 添加响应头
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = f"{process_time:.3f}"
        
        return response

# 注册中间件
app.add_middleware(TimingMiddleware)

@app.get("/")
async def root():
    return {"message": "Hello"}
```

### 异步中间件

FastAPI 支持异步中间件：

```python
from fastapi import FastAPI, Request
import asyncio

app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """异步日志中间件"""
    print(f"请求开始: {request.method} {request.url.path}")
    
    # 异步调用
    response = await call_next(request)
    
    print(f"请求结束: {response.status_code}")
    return response

@app.get("/slow")
async def slow_endpoint():
    """模拟慢接口"""
    await asyncio.sleep(2)
    return {"message": "done"}
```

### 中间件顺序

中间件按**添加顺序**执行（先添加先执行）：

```python
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def middleware1(request: Request, call_next):
    print("中间件1 - 开始")
    response = await call_next(request)
    print("中间件1 - 结束")
    return response

@app.middleware("http")
async def middleware2(request: Request, call_next):
    print("中间件2 - 开始")
    response = await call_next(request)
    print("中间件2 - 结束")
    return response

@app.get("/")
async def root():
    print("路由处理")
    return {"message": "Hello"}

# 执行顺序：
# 中间件2 - 开始
# 中间件1 - 开始
# 路由处理
# 中间件1 - 结束
# 中间件2 - 结束
```

### 完整的 FastAPI 中间件示例

```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging

app = FastAPI()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 1. 请求日志中间件
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # 记录请求
        logger.info(f"[{request.method}] {request.url.path} - {request.client.host}")
        
        # 执行请求
        response = await call_next(request)
        
        # 记录响应
        process_time = time.time() - start_time
        logger.info(f"响应: {response.status_code} - 耗时: {process_time:.3f}s")
        
        return response

# 2. CORS 中间件
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. API 密钥验证中间件
class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 只验证 /api/ 路径
        if request.url.path.startswith("/api/"):
            api_key = request.headers.get("X-API-Key")
            if not api_key or api_key != "secret-key":
                return JSONResponse(
                    status_code=401,
                    content={"error": "Invalid API Key"}
                )
        
        response = await call_next(request)
        return response

# 4. 异常处理中间件
@app.middleware("http")
async def catch_exceptions(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f"异常: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": "Internal Server Error", "message": str(e)}
        )

# 注册中间件
app.add_middleware(LoggingMiddleware)
app.add_middleware(APIKeyMiddleware)

# 路由
@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/api/data")
async def get_data():
    return {"data": "secret data"}
```

---

## 常用中间件实战

### 请求日志中间件

**记录所有请求的详细信息：**

```python
from fastapi import FastAPI, Request
import logging
import time

app = FastAPI()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def request_logging(request: Request, call_next):
    """详细的请求日志"""
    start_time = time.time()
    
    # 记录请求信息
    logger.info(f"请求开始: {request.method} {request.url.path}")
    logger.info(f"客户端: {request.client.host}")
    logger.info(f"User-Agent: {request.headers.get('user-agent', 'N/A')}")
    
    # 执行请求
    response = await call_next(request)
    
    # 记录响应信息
    process_time = time.time() - start_time
    logger.info(f"响应: {response.status_code} - 耗时: {process_time:.3f}s")
    
    return response
```

### 认证中间件

**验证 JWT Token：**

```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import jwt

app = FastAPI()

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    """JWT 认证中间件"""
    
    # 跳过公开路径
    public_paths = ["/", "/login", "/register"]
    if request.url.path in public_paths:
        return await call_next(request)
    
    # 获取 Token
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"error": "未授权"}
        )
    
    token = auth_header.split(" ")[1]
    
    try:
        # 验证 Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        request.state.user = payload  # 将用户信息存储到请求中
    except jwt.ExpiredSignatureError:
        return JSONResponse(
            status_code=401,
            content={"error": "Token 已过期"}
        )
    except jwt.InvalidTokenError:
        return JSONResponse(
            status_code=401,
            content={"error": "无效的 Token"}
        )
    
    response = await call_next(request)
    return response

@app.get("/profile")
async def get_profile(request: Request):
    """获取用户信息"""
    user = request.state.user
    return {"user": user}
```

### CORS 中间件

**处理跨域请求：**

```python
from flask import Flask, request, Response

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    """添加 CORS 头"""
    # 允许的源（生产环境应该配置具体域名）
    origin = request.headers.get('Origin')
    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
    
    # 允许的方法
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    
    # 允许的头
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    
    # 允许携带凭证（Cookie）
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    
    # 预检请求缓存时间（秒）
    response.headers['Access-Control-Max-Age'] = '86400'
    
    return response

# 处理 OPTIONS 预检请求
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = Response()
    response.status_code = 200
    return response
```

### 请求计时中间件

**统计接口响应时间：**

```python
from fastapi import FastAPI, Request
import time

app = FastAPI()

# 存储接口响应时间统计
stats = {}

@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    """请求计时中间件"""
    start_time = time.time()
    
    # 执行请求
    response = await call_next(request)
    
    # 计算耗时
    process_time = time.time() - start_time
    
    # 添加响应头
    response.headers["X-Process-Time"] = f"{process_time:.3f}"
    
    # 统计数据
    path = request.url.path
    if path not in stats:
        stats[path] = {'count': 0, 'total_time': 0, 'min': float('inf'), 'max': 0}
    
    stats[path]['count'] += 1
    stats[path]['total_time'] += process_time
    stats[path]['min'] = min(stats[path]['min'], process_time)
    stats[path]['max'] = max(stats[path]['max'], process_time)
    
    return response

@app.get("/stats")
async def get_stats():
    """获取接口统计信息"""
    result = {}
    for path, data in stats.items():
        result[path] = {
            'count': data['count'],
            'avg_time': data['total_time'] / data['count'],
            'min_time': data['min'],
            'max_time': data['max']
        }
    return result
```

### 异常捕获中间件

**统一处理异常：**

```python
from flask import Flask, jsonify, request
import logging
import traceback

app = Flask(__name__)

logger = logging.getLogger(__name__)

@app.errorhandler(Exception)
def handle_exception(e):
    """统一异常处理"""
    
    # 记录异常
    logger.error(f"异常发生: {request.method} {request.path}")
    logger.error(f"错误信息: {str(e)}")
    logger.error(traceback.format_exc())
    
    # 区分不同类型的异常
    if isinstance(e, ValueError):
        return jsonify({
            'error': 'Invalid Input',
            'message': str(e)
        }), 400
    elif isinstance(e, PermissionError):
        return jsonify({
            'error': 'Forbidden',
            'message': '没有权限'
        }), 403
    else:
        # 未知异常
        return jsonify({
            'error': 'Internal Server Error',
            'message': '服务器内部错误'
        }), 500

@app.route('/test-error')
def test_error():
    raise ValueError("测试异常")
```

### IP 白名单中间件

**限制访问 IP：**

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# 白名单 IP
ALLOWED_IPS = ['127.0.0.1', '192.168.1.100']

@app.middleware("http")
async def ip_whitelist(request: Request, call_next):
    """IP 白名单中间件"""
    
    # 跳过公开路径
    if request.url.path in ["/", "/health"]:
        return await call_next(request)
    
    # 获取客户端 IP
    client_ip = request.client.host
    
    # 检查是否在白名单中
    if client_ip not in ALLOWED_IPS:
        return JSONResponse(
            status_code=403,
            content={"error": "IP 不在白名单中"}
        )
    
    response = await call_next(request)
    return response
```

### 请求限流中间件

**防止接口滥用：**

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import time
from collections import defaultdict

app = FastAPI()

# 存储每个 IP 的请求记录
request_records = defaultdict(list)

# 限流配置：每分钟最多 60 次请求
RATE_LIMIT = 60
TIME_WINDOW = 60  # 秒

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """请求限流中间件"""
    
    client_ip = request.client.host
    current_time = time.time()
    
    # 清理过期记录
    request_records[client_ip] = [
        timestamp for timestamp in request_records[client_ip]
        if current_time - timestamp < TIME_WINDOW
    ]
    
    # 检查是否超过限制
    if len(request_records[client_ip]) >= RATE_LIMIT:
        return JSONResponse(
            status_code=429,
            content={
                "error": "Too Many Requests",
                "message": f"每分钟最多 {RATE_LIMIT} 次请求"
            }
        )
    
    # 记录本次请求
    request_records[client_ip].append(current_time)
    
    response = await call_next(request)
    
    # 添加限流信息到响应头
    remaining = RATE_LIMIT - len(request_records[client_ip])
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    
    return response
```

---

## 第三方中间件

### Flask-CORS
