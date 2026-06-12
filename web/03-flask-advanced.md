# Flask 进阶

深入 Flask 开发，掌握数据库集成、表单验证、RESTful API、认证系统等核心技能。

## 数据库集成

### Flask-SQLAlchemy

```bash
pip install flask-sqlalchemy
```

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 定义模型
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    def __repr__(self):
        return f'<User {self.username}>'

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='posts')

# 创建数据库表
with app.app_context():
    db.create_all()
```

### CRUD 操作

```python
@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'id': user.id}), 201

@app.route('/users')
def get_users():
    users = User.query.all()
    return jsonify([{'id': u.id, 'username': u.username} for u in users])

@app.route('/users/<int:user_id>')
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({'id': user.id, 'username': user.username, 'email': user.email})

@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify({'message': 'Updated'})

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
```

### 查询高级用法

```python
# 条件查询
user = User.query.filter_by(username='alice').first()
users = User.query.filter(User.email.endswith('@gmail.com')).all()

# 排序
users = User.query.order_by(User.username.desc()).all()

# 分页
page = request.args.get('page', 1, type=int)
per_page = 10
users = User.query.paginate(page=page, per_page=per_page)

# 关联查询
posts = Post.query.join(User).filter(User.username == 'alice').all()

# 聚合
from sqlalchemy import func
user_count = db.session.query(func.count(User.id)).scalar()
```

## 表单验证（Flask-WTF）

```bash
pip install flask-wtf
```

```python
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo

app.config['SECRET_KEY'] = 'your-secret-key'

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[
        DataRequired(),
        Length(min=3, max=20)
    ])
    email = StringField('Email', validators=[
        DataRequired(),
        Email()
    ])
    password = PasswordField('Password', validators=[
        DataRequired(),
        Length(min=6)
    ])
    confirm_password = PasswordField('Confirm Password', validators=[
        DataRequired(),
        EqualTo('password', message='Passwords must match')
    ])
    submit = SubmitField('Register')

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful!', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)
```

**模板** `templates/register.html`：

```html
<form method="POST">
    {{ form.hidden_tag() }}
    
    <div>
        {{ form.username.label }}
        {{ form.username }}
        {% if form.username.errors %}
            <ul>
            {% for error in form.username.errors %}
                <li>{{ error }}</li>
            {% endfor %}
            </ul>
        {% endif %}
    </div>
    
    <div>
        {{ form.email.label }}
        {{ form.email }}
        {% if form.email.errors %}
            <ul>{% for error in form.email.errors %}<li>{{ error }}</li>{% endfor %}</ul>
        {% endif %}
    </div>
    
    <div>
        {{ form.password.label }}
        {{ form.password }}
    </div>
    
    <div>
        {{ form.confirm_password.label }}
        {{ form.confirm_password }}
    </div>
    
    {{ form.submit }}
</form>
```

## 用户认证

### 密码加密

```bash
pip install flask-bcrypt
```

```python
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.check_password_hash(user.password, data['password']):
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful'})
    
    return jsonify({'message': 'Invalid credentials'}), 401
```

### Flask-Login

```bash
pip install flask-login
```

```python
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

login_manager = LoginManager(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.check_password_hash(user.password, data['password']):
        login_user(user, remember=True)
        return jsonify({'message': 'Login successful'})
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'})

@app.route('/profile')
@login_required
def profile():
    return jsonify({'username': current_user.username, 'email': current_user.email})
```

## RESTful API

```python
from flask import jsonify, request

# GET /api/posts - 获取所有文章
@app.route('/api/posts')
def api_get_posts():
    posts = Post.query.all()
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'content': p.content,
        'author': p.user.username
    } for p in posts])

# GET /api/posts/<id> - 获取特定文章
@app.route('/api/posts/<int:post_id>')
def api_get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify({
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'author': post.user.username
    })

# POST /api/posts - 创建文章
@app.route('/api/posts', methods=['POST'])
@login_required
def api_create_post():
    data = request.json
    post = Post(title=data['title'], content=data['content'], user_id=current_user.id)
    db.session.add(post)
    db.session.commit()
    return jsonify({'id': post.id, 'message': 'Post created'}), 201

# PUT /api/posts/<id> - 更新文章
@app.route('/api/posts/<int:post_id>', methods=['PUT'])
@login_required
def api_update_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    if post.user_id != current_user.id:
        return jsonify({'message': 'Forbidden'}), 403
    
    data = request.json
    post.title = data.get('title', post.title)
    post.content = data.get('content', post.content)
    db.session.commit()
    return jsonify({'message': 'Post updated'})

# DELETE /api/posts/<id> - 删除文章
@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@login_required
def api_delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    if post.user_id != current_user.id:
        return jsonify({'message': 'Forbidden'}), 403
    
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted'})
```

## 分页

```python
@app.route('/api/posts')
def api_get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    pagination = Post.query.order_by(Post.id.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'posts': [{
            'id': p.id,
            'title': p.title,
            'content': p.content
        } for p in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    })
```

## 跨域（CORS）

```bash
pip install flask-cors
```

```python
from flask_cors import CORS

# 允许所有来源（开发环境）
CORS(app)

# 限制特定来源（生产环境）
CORS(app, resources={r"/api/*": {"origins": "https://example.com"}})
```

## 文件上传进阶

```python
from werkzeug.utils import secure_filename
import os
from datetime import datetime

UPLOAD_FOLDER = 'uploads'
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

@app.route('/api/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'message': 'Invalid file type'}), 400
    
    # 生成唯一文件名
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    unique_filename = f"{timestamp}_{filename}"
    
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(filepath)
    
    return jsonify({
        'message': 'File uploaded',
        'filename': unique_filename,
        'url': f'/uploads/{unique_filename}'
    }), 201
```

## 缓存（Flask-Caching）

```bash
pip install flask-caching
```

```python
from flask_caching import Cache

app.config['CACHE_TYPE'] = 'simple'  # 开发环境
# app.config['CACHE_TYPE'] = 'redis'  # 生产环境
# app.config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'

cache = Cache(app)

@app.route('/api/posts')
@cache.cached(timeout=60)  # 缓存 60 秒
def get_posts():
    posts = Post.query.all()
    return jsonify([{'id': p.id, 'title': p.title} for p in posts])

# 清除缓存
@app.route('/api/posts', methods=['POST'])
def create_post():
    # ... 创建文章
    cache.delete('view//api/posts')  # 清除列表缓存
    return jsonify({'message': 'Created'}), 201
```

## 日志

```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('app.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Application startup')

@app.route('/api/posts/<int:post_id>')
def get_post(post_id):
    app.logger.info(f'Accessing post {post_id}')
    post = Post.query.get_or_404(post_id)
    return jsonify({'id': post.id, 'title': post.title})
```

## 环境变量与配置

```python
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}

app.config.from_object(config[os.environ.get('FLASK_ENV', 'development')])
```

## 测试

```python
import pytest
from app import app, db, User

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

def test_home(client):
    response = client.get('/')
    assert response.status_code == 200

def test_create_user(client):
    response = client.post('/api/users', json={
        'username': 'test',
        'email': 'test@example.com'
    })
    assert response.status_code == 201
    assert b'id' in response.data
```

::: tip 最佳实践
1. 使用蓝图组织大型应用
2. 数据库迁移用 Flask-Migrate
3. 生产环境使用环境变量管理敏感配置
4. API 使用 JWT 认证替代 Session
5. 添加请求日志和错误监控
:::

## 下一步

- **[Django 入门](05-django-basics.md)** - 全栈式框架
- **[FastAPI 入门](08-fastapi-basics.md)** - 高性能异步框架
