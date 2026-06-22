# Web 认证与授权

在 Web 应用中，认证（Authentication）和授权（Authorization）是保护用户数据和资源的核心机制。

## 认证 vs 授权

| 概念 | 英文 | 含义 | 问题 |
|------|------|------|------|
| 认证 | Authentication | 验证用户身份 | 你是谁？ |
| 授权 | Authorization | 验证用户权限 | 你能做什么？ |

**示例**：
- **认证**：登录时输入用户名和密码，验证你是 `admin` 用户
- **授权**：验证 `admin` 用户是否有权限删除文章

## 认证方式对比

### 有状态认证（Session-Based）

**原理**：
1. 用户登录成功后，服务器创建 Session，存储用户信息
2. 服务器返回 Session ID（通过 Cookie）
3. 后续请求携带 Session ID，服务器查询 Session 验证身份

**优点**：
- 服务器完全控制，可随时撤销
- 实现简单，框架原生支持

**缺点**：
- 服务器需要存储 Session（内存/Redis）
- 分布式系统需要 Session 共享
- 移动端不友好（Cookie 依赖）

### 无状态认证（Token-Based）

**原理**：
1. 用户登录成功后，服务器生成 Token（如 JWT）
2. Token 包含用户信息和签名
3. 后续请求携带 Token，服务器验证签名即可

**优点**：
- 服务器无需存储，易于扩展
- 跨域友好
- 移动端友好

**缺点**：
- Token 泄漏风险更高
- 无法主动撤销（除非加黑名单）
- Token 体积较大

### 技术选型建议

| 场景 | 推荐方案 |
|------|---------|
| 传统 Web 应用（前后端不分离） | Session |
| RESTful API | JWT Token |
| 微服务架构 | JWT Token |
| 移动端 App | JWT Token |
| 需要随时撤销登录 | Session 或 Token + Redis |

## Flask-Login 实战

Flask-Login 是 Flask 最流行的用户认证扩展，提供 Session 管理功能。

### 安装

```bash
pip install flask-login
```

### 基本配置

```python
from flask import Flask
from flask_login import LoginManager

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # 生产环境使用环境变量

# 初始化 LoginManager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # 未登录时重定向的视图
login_manager.login_message = '请先登录'
```

### User 模型定义

```python
from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, id, username, password_hash):
        self.id = id
        self.username = username
        self.password_hash = password_hash
    
    # UserMixin 自动提供以下方法：
    # is_authenticated()  是否已认证
    # is_active()         账号是否激活
    # is_anonymous()      是否匿名用户
    # get_id()            获取用户 ID

# 加载用户的回调函数（必须实现）
@login_manager.user_loader
def load_user(user_id):
    # 从数据库加载用户
    return User.query.get(int(user_id))
```

### 注册功能

```python
from werkzeug.security import generate_password_hash
from flask import request, redirect, url_for, flash

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # 检查用户是否已存在
        if User.query.filter_by(username=username).first():
            flash('用户名已存在')
            return redirect(url_for('register'))
        
        # 密码哈希（安全存储）
        password_hash = generate_password_hash(password)
        
        # 创建新用户
        user = User(username=username, password_hash=password_hash)
        db.session.add(user)
        db.session.commit()
        
        flash('注册成功，请登录')
        return redirect(url_for('login'))
    
    return render_template('register.html')
```

### 登录功能

```python
from werkzeug.security import check_password_hash
from flask_login import login_user

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        remember = request.form.get('remember')  # 记住我
        
        # 查找用户
        user = User.query.filter_by(username=username).first()
        
        # 验证密码
        if user and check_password_hash(user.password_hash, password):
            # 登录成功，创建 Session
            login_user(user, remember=remember)
            
            # 重定向到原来想访问的页面
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        else:
            flash('用户名或密码错误')
    
    return render_template('login.html')
```

### 登出功能

```python
from flask_login import logout_user

@app.route('/logout')
def logout():
    logout_user()  # 清除 Session
    flash('已退出登录')
    return redirect(url_for('index'))
```

### 保护路由

```python
from flask_login import login_required, current_user

@app.route('/profile')
@login_required  # 未登录自动重定向到 login_view
def profile():
    return f'欢迎，{current_user.username}！'

@app.route('/admin')
@login_required
def admin():
    # 手动检查权限
    if not current_user.is_admin:
        flash('没有权限访问')
        return redirect(url_for('index'))
    
    return 'Admin Dashboard'
```

### 记住我功能

```python
# 登录时传入 remember=True
login_user(user, remember=True, duration=timedelta(days=30))
```

**原理**：
- `remember=False`（默认）：Session Cookie，浏览器关闭后失效
- `remember=True`：持久化 Cookie，有效期由 `duration` 控制

## Django Authentication

Django 自带完整的用户认证系统，开箱即用。

### 内置 User 模型

```python
from django.contrib.auth.models import User

# 创建用户
user = User.objects.create_user(
    username='john',
    email='john@example.com',
    password='password123'  # 自动哈希
)

# 创建超级用户（命令行）
# python manage.py createsuperuser
```

### 注册视图

```python
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  # 注册后自动登录
            return redirect('home')
    else:
        form = UserCreationForm()
    
    return render(request, 'register.html', {'form': form})
```

### 登录视图

```python
from django.contrib.auth import authenticate, login

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        
        # 验证用户
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            return render(request, 'login.html', {'error': '用户名或密码错误'})
    
    return render(request, 'login.html')
```

### 登出视图

```python
from django.contrib.auth import logout

def logout_view(request):
    logout(request)
    return redirect('home')
```

### 保护视图

```python
from django.contrib.auth.decorators import login_required

@login_required(login_url='/login/')
def profile(request):
    return render(request, 'profile.html', {'user': request.user})

# 基于类的视图
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

class ProfileView(LoginRequiredMixin, TemplateView):
    template_name = 'profile.html'
    login_url = '/login/'
```

### 权限与用户组

```python
# 检查权限
if request.user.has_perm('app.delete_article'):
    # 可以删除文章
    pass

# 装饰器检查权限
from django.contrib.auth.decorators import permission_required

@permission_required('app.delete_article')
def delete_article(request, article_id):
    # ...
    pass

# 用户组
from django.contrib.auth.models import Group

# 创建用户组
editors = Group.objects.create(name='Editors')

# 添加用户到组
user.groups.add(editors)

# 检查用户组
if request.user.groups.filter(name='Editors').exists():
    # 是编辑组成员
    pass
```

### 自定义 User 模型

```python
# models.py
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    
    class Meta:
        db_table = 'users'

# settings.py
AUTH_USER_MODEL = 'app.CustomUser'
```

## FastAPI Security (JWT)

FastAPI 使用 JWT（JSON Web Token）实现无状态认证。

### 安装依赖

```bash
pip install fastapi python-jose[cryptography] passlib[bcrypt] python-multipart
```

### JWT 配置

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# 密钥和算法（生产环境使用环境变量）
SECRET_KEY = "your-secret-key-here-min-32-chars"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 密码哈希工具
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)
```

### 创建 JWT Token

```python
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

### User 模型

```python
from pydantic import BaseModel

class User(BaseModel):
    username: str
    email: str | None = None
    disabled: bool | None = None

class UserInDB(User):
    hashed_password: str

# 模拟数据库
fake_users_db = {
    "john": {
        "username": "john",
        "email": "john@example.com",
        "hashed_password": "$2b$12$...",  # bcrypt hash
        "disabled": False,
    }
}
```

### 登录端点

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # 查找用户
    user_dict = fake_users_db.get(form_data.username)
    if not user_dict:
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    
    user = UserInDB(**user_dict)
    
    # 验证密码
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    
    # 生成 Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
```

### 验证 Token

```python
from jose import JWTError, jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 解码 Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # 查找用户
    user_dict = fake_users_db.get(username)
    if user_dict is None:
        raise credentials_exception
    
    return UserInDB(**user_dict)
```

### 保护端点

```python
@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/items/")
async def read_items(token: str = Depends(oauth2_scheme)):
    # 简单验证，只检查 Token 是否存在
    return {"token": token}
```

### 完整示例

```python
from typing import Annotated
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 模拟用户数据库
fake_users_db = {
    "john": {
        "username": "john",
        "email": "john@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    }
}

class User(BaseModel):
    username: str
    email: str | None = None
    disabled: bool | None = None

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user_dict = fake_users_db.get(form_data.username)
    if not user_dict or not verify_password(form_data.password, user_dict["hashed_password"]):
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
```

### 客户端使用

```python
import requests

# 登录获取 Token
response = requests.post(
    "http://localhost:8000/token",
    data={"username": "john", "password": "secret"}
)
token = response.json()["access_token"]

# 使用 Token 访问受保护端点
headers = {"Authorization": f"Bearer {token}"}
response = requests.get("http://localhost:8000/users/me", headers=headers)
print(response.json())
```

## Refresh Token 机制

长期有效的 Access Token 不安全，使用 Refresh Token 实现续期：

```python
# 生成两种 Token
def create_tokens(username: str):
    access_token = create_access_token(
        data={"sub": username},
        expires_delta=timedelta(minutes=15)  # 短期
    )
    refresh_token = create_access_token(
        data={"sub": username, "type": "refresh"},
        expires_delta=timedelta(days=7)  # 长期
    )
    return access_token, refresh_token

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # ... 验证用户 ...
    access_token, refresh_token = create_tokens(form_data.username)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/token/refresh")
async def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="无效的 Refresh Token")
        
        username = payload.get("sub")
        access_token = create_access_token(data={"sub": username})
        return {"access_token": access_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token 已过期")
```

## 实战案例

### 案例 1：完整的注册登录系统（Flask）

```python
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# 用户模型
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200))
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('用户名已存在')
            return redirect(url_for('register'))
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('注册成功！')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        remember = request.form.get('remember')
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user, remember=remember)
            return redirect(url_for('dashboard'))
        else:
            flash('用户名或密码错误')
    
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return f'欢迎，{current_user.username}！'

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
```

### 案例 2：JWT API 认证（FastAPI）

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel

# 数据库配置
SQLALCHEMY_DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# JWT 配置
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

# 用户模型
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

Base.metadata.create_all(bind=engine)

# Pydantic 模型
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str

# 数据库依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 工具函数
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(UserDB).filter(UserDB.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# 注册端点
@app.post("/register", response_model=User)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 检查用户是否存在
    if db.query(UserDB).filter(UserDB.username == user.username).first():
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 创建用户
    db_user = UserDB(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 登录端点
@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# 受保护端点
@app.get("/users/me", response_model=User)
async def read_users_me(current_user: UserDB = Depends(get_current_user)):
    return current_user
```

## 易错点

### 易错点 1：密码明文存储

❌ **错误示例**：

```python
# 危险！密码明文存储
user = User(username='john', password='123456')
db.session.add(user)
```

✅ **正确做法**：

```python
from werkzeug.security import generate_password_hash

# 使用哈希算法存储
user = User(
    username='john',
    password_hash=generate_password_hash('123456')
)
db.session.add(user)
```

**说明**：
- 数据库泄漏时，哈希密码无法直接使用
- 推荐算法：bcrypt、Argon2、PBKDF2
- 避免使用：MD5、SHA1（不安全）

### 易错点 2：Token 泄漏风险

❌ **错误做法**：

```python
# Token 存储在 URL 中（容易泄漏）
return redirect(f'/dashboard?token={access_token}')

# Token 存储在 LocalStorage（易受 XSS 攻击）
# 前端：localStorage.setItem('token', token)
```

✅ **安全做法**：

```python
# Session-based：使用 HttpOnly Cookie
@app.route('/login')
def login():
    # ...
    response = make_response(redirect('/dashboard'))
    response.set_cookie('session_id', session_id, httponly=True, secure=True)
    return response

# JWT：放在 Authorization Header
# 前端：headers: { 'Authorization': `Bearer ${token}` }
```

**安全建议**：
- Cookie 设置 `HttpOnly=True`（防止 JS 读取）
- Cookie 设置 `Secure=True`（仅 HTTPS 传输）
- Cookie 设置 `SameSite=Lax`（防止 CSRF）
- JWT 存储在内存中，避免 LocalStorage

### 易错点 3：Session 过期处理不当

❌ **错误做法**：

```python
@app.route('/api/data')
@login_required
def get_data():
    # 未处理 Session 过期
    return jsonify(data)
```

✅ **正确做法**：

```python
from flask_login import login_required, current_user
from functools import wraps

def api_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/data')
@api_login_required
def get_data():
    return jsonify(data)
```

### 易错点 4：忘记 CSRF 防护

❌ **危险代码**（未启用 CSRF 保护）：

```python
from flask import Flask
app = Flask(__name__)
# 未配置 CSRF 保护
```

✅ **安全配置**：

```python
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
csrf = CSRFProtect(app)

# 表单中包含 CSRF Token
# <input type="hidden" name="csrf_token" value="{{ csrf_token() }}"/>
```

**Django 自动防护**：

```python
# Django 默认启用 CSRF 保护
# 模板中使用 {% csrf_token %}

# 如需豁免（如 API）
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def api_view(request):
    # ...
    pass
```

### 易错点 5：JWT 无法主动撤销

**问题**：JWT 是无状态的，签发后无法撤销，即使用户登出。

**解决方案**：

```python
# 方案 1：黑名单（Redis）
import redis
r = redis.Redis()

def revoke_token(token):
    # 将 Token 加入黑名单
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    exp = payload['exp']
    r.setex(f'blacklist:{token}', exp - int(time.time()), '1')

def is_token_revoked(token):
    return r.exists(f'blacklist:{token}')

# 方案 2：缩短 Token 有效期 + Refresh Token
# Access Token: 15 分钟
# Refresh Token: 7 天（存储在数据库，可撤销）
```

## 练习题

### 基础练习

**练习 1**：使用 Flask-Login 实现用户注册和登录功能

要求：
- 使用 SQLite 数据库存储用户
- 密码使用 bcrypt 哈希
- 登录成功后重定向到个人主页
- 提供登出功能

**练习 2**：为 FastAPI 应用添加 JWT 认证

要求：
- 实现 `/register` 和 `/token` 端点
- 创建一个受保护的 `/users/me` 端点
- Token 有效期 30 分钟
- 使用 Postman 或 curl 测试

### 进阶练习

**练习 3**：实现 Refresh Token 机制

要求：
- Access Token 有效期 15 分钟
- Refresh Token 有效期 7 天
- 实现 `/token/refresh` 端点
- Refresh Token 存储在 Redis 中

**练习 4**：为 Django 应用添加权限控制

要求：
- 创建 `Editor` 和 `Viewer` 两个用户组
- `Editor` 可以创建、编辑、删除文章
- `Viewer` 只能查看文章
- 使用装饰器检查权限

### 挑战练习

**练习 5**：实现第三方登录（OAuth 2.0）

要求：
- 集成 GitHub OAuth
- 用户首次登录自动创建账号
- 绑定第三方账号和本地账号
- 支持用户解绑第三方账号

**练习 6**：实现多设备登录管理

要求：
- 用户可以查看所有登录设备
- 记录设备信息（IP、浏览器、登录时间）
- 支持踢出指定设备
- 支持"登出所有设备"功能

## 费曼学习法检验

尝试用自己的话回答以下问题：

### 基本概念
1. 认证和授权有什么区别？举例说明。
2. Session 认证和 Token 认证各有什么优缺点？
3. JWT 的结构是什么？包含哪三部分？

### 具体实现
4. Flask-Login 的 `@login_required` 装饰器是如何工作的？
5. Django 的 `authenticate()` 和 `login()` 有什么区别？
6. FastAPI 中如何使用依赖注入实现认证？

### 安全问题
7. 为什么不能用 MD5 存储密码？应该用什么？
8. JWT Token 应该存储在哪里？为什么不推荐 LocalStorage？
9. 如何防止 CSRF 攻击？

### 实战问题
10. 如何实现"记住我"功能？
11. JWT 签发后如何撤销？
12. 如何实现多设备登录限制（如只允许 3 台设备同时在线）？

## 总结

### 快速参考

| 框架 | 认证方式 | 核心组件 | 适用场景 |
|------|---------|---------|---------|
| Flask-Login | Session | `login_user()`, `@login_required` | 传统 Web 应用 |
| Django Auth | Session | `authenticate()`, `login()` | 全栈项目 |
| FastAPI | JWT | `OAuth2PasswordBearer`, `Depends()` | RESTful API |

### 安全清单

- ✅ 密码使用 bcrypt/Argon2 哈希
- ✅ HTTPS 传输敏感数据
- ✅ Cookie 设置 HttpOnly、Secure、SameSite
- ✅ 启用 CSRF 保护
- ✅ Token 不存储在 URL 或 LocalStorage
- ✅ 实现速率限制（防暴力破解）
- ✅ 记录登录日志（IP、时间、设备）
- ✅ 定期更新依赖库

### 最佳实践

1. **永远不要明文存储密码**
2. **使用环境变量存储密钥**
3. **Token 有效期不要过长**（Access Token ≤ 30 分钟）
4. **实现 Refresh Token 机制**
5. **敏感操作二次验证**（如删除账号、修改密码）
6. **记录安全事件**（登录失败、异地登录）
7. **提供多因素认证（MFA）选项**
