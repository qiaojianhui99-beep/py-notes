# Flask 入门

Flask 是一个轻量级的 Python Web 框架，简单易学，适合快速原型开发和小型应用。

## 安装

```bash
pip install flask
```

## 最小应用

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, Flask!'

if __name__ == '__main__':
    app.run(debug=True)
```

运行后访问 `http://127.0.0.1:5000`。

## 路由

### 基本路由

```python
@app.route('/')
def index():
    return 'Home Page'

@app.route('/about')
def about():
    return 'About Page'
```

### 动态路由

```python
@app.route('/user/<username>')
def show_user(username):
    return f'User: {username}'

@app.route('/post/<int:post_id>')
def show_post(post_id):
    return f'Post ID: {post_id}'
```

**类型转换器**：
- `string`：默认，接受任何不含斜杠的文本
- `int`：整数
- `float`：浮点数
- `path`：接受斜杠（用于多级路径）
- `uuid`：UUID 字符串

### HTTP 方法

```python
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return 'Processing login...'
    return 'Show login form'

# 仅 POST
@app.route('/submit', methods=['POST'])
def submit():
    return 'Data submitted'
```

## 请求对象

```python
from flask import request

@app.route('/search')
def search():
    # 查询参数：/search?q=python
    query = request.args.get('q', '')
    
    # 表单数据
    username = request.form.get('username')
    
    # JSON 数据
    data = request.json
    
    # 请求头
    user_agent = request.headers.get('User-Agent')
    
    # 方法、路径、IP
    method = request.method
    path = request.path
    ip = request.remote_addr
    
    return f'Search: {query}'
```

## 响应对象

```python
from flask import jsonify, make_response, redirect, url_for

# 返回 JSON
@app.route('/api/users')
def get_users():
    users = [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}]
    return jsonify(users)

# 自定义状态码
@app.route('/create', methods=['POST'])
def create():
    return jsonify({'message': 'Created'}), 201

# 自定义响应头
@app.route('/custom')
def custom():
    response = make_response('Custom response')
    response.headers['X-Custom-Header'] = 'Value'
    return response

# 重定向
@app.route('/old-path')
def old():
    return redirect(url_for('new_path'))

@app.route('/new-path')
def new_path():
    return 'New path'
```

## 模板渲染

### 基本用法

```python
from flask import render_template

@app.route('/hello/<name>')
def hello_user(name):
    return render_template('hello.html', name=name)
```

**模板文件** `templates/hello.html`：

```html
<!DOCTYPE html>
<html>
<head>
    <title>Hello</title>
</head>
<body>
    <h1>Hello, {{ name }}!</h1>
</body>
</html>
```

### 传递多个变量

```python
@app.route('/user/<int:user_id>')
def user_profile(user_id):
    user = {'id': user_id, 'name': 'Alice', 'age': 25}
    posts = [{'title': 'Post 1'}, {'title': 'Post 2'}]
    return render_template('profile.html', user=user, posts=posts)
```

**模板** `templates/profile.html`：

```html
<h1>{{ user.name }}</h1>
<p>Age: {{ user.age }}</p>

<h2>Posts</h2>
<ul>
{% for post in posts %}
    <li>{{ post.title }}</li>
{% endfor %}
</ul>
```

### 模板继承

**基础模板** `templates/base.html`：

```html
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}My App{% endblock %}</title>
</head>
<body>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </nav>
    
    {% block content %}{% endblock %}
    
    <footer>&copy; 2024 My App</footer>
</body>
</html>
```

**子模板** `templates/index.html`：

```html
{% extends "base.html" %}

{% block title %}Home - My App{% endblock %}

{% block content %}
    <h1>Welcome</h1>
    <p>This is the home page.</p>
{% endblock %}
```

## 静态文件

目录结构：

```
myapp/
├── app.py
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── images/
│       └── logo.png
└── templates/
    └── index.html
```

模板中引用：

```html
<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
<script src="{{ url_for('static', filename='js/script.js') }}"></script>
<img src="{{ url_for('static', filename='images/logo.png') }}">
```

## 表单处理

```python
from flask import request

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        # 保存到数据库...
        
        return redirect(url_for('login'))
    
    return render_template('register.html')
```

**模板** `templates/register.html`：

```html
<form method="POST">
    <input type="text" name="username" required>
    <input type="email" name="email" required>
    <input type="password" name="password" required>
    <button type="submit">Register</button>
</form>
```

## 文件上传

```python
from flask import request
from werkzeug.utils import secure_filename
import os

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400
    
    file = request.files['file']
    
    if file.filename == '':
        return 'No selected file', 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return 'File uploaded successfully'
    
    return 'Invalid file type', 400
```

## Cookie 与 Session

### Cookie

```python
from flask import make_response, request

@app.route('/set-cookie')
def set_cookie():
    response = make_response('Cookie set')
    response.set_cookie('username', 'alice', max_age=3600)  # 1小时
    return response

@app.route('/get-cookie')
def get_cookie():
    username = request.cookies.get('username')
    return f'Username: {username}'
```

### Session

```python
from flask import session

app.secret_key = 'your-secret-key-here'  # 生产环境用复杂的密钥

@app.route('/login', methods=['POST'])
def login():
    session['user_id'] = 123
    session['username'] = 'alice'
    return 'Logged in'

@app.route('/profile')
def profile():
    if 'user_id' in session:
        return f"Welcome, {session['username']}"
    return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return 'Logged out'
```

## 错误处理

```python
@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return 'Internal Server Error', 500
```

## 蓝图（Blueprint）

用于模块化大型应用。

**auth.py**：

```python
from flask import Blueprint

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login')
def login():
    return 'Login page'

@auth_bp.route('/register')
def register():
    return 'Register page'
```

**app.py**：

```python
from flask import Flask
from auth import auth_bp

app = Flask(__name__)
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(debug=True)
```

访问 `/auth/login` 和 `/auth/register`。

## 配置

```python
# 开发环境
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = 'dev-secret-key'

# 从文件加载
app.config.from_pyfile('config.py')

# 从环境变量
import os
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
```

**config.py**：

```python
DEBUG = False
SECRET_KEY = 'production-secret-key'
DATABASE_URI = 'mysql://user:pass@localhost/dbname'
```

## 实战项目：简单博客

```python
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# 模拟数据库
posts = [
    {'id': 1, 'title': 'First Post', 'content': 'Hello World'},
    {'id': 2, 'title': 'Second Post', 'content': 'Flask is great'},
]

@app.route('/')
def index():
    return render_template('index.html', posts=posts)

@app.route('/post/<int:post_id>')
def show_post(post_id):
    post = next((p for p in posts if p['id'] == post_id), None)
    if post:
        return render_template('post.html', post=post)
    return 'Post not found', 404

@app.route('/create', methods=['GET', 'POST'])
def create_post():
    if request.method == 'POST':
        new_post = {
            'id': len(posts) + 1,
            'title': request.form['title'],
            'content': request.form['content']
        }
        posts.append(new_post)
        return redirect(url_for('index'))
    return render_template('create.html')

if __name__ == '__main__':
    app.run(debug=True)
```

::: tip 学习建议
1. 先掌握路由、请求、响应的基本用法
2. 学习 Jinja2 模板语法（过滤器、控制结构）
3. 理解 Session 和 Cookie 的区别
4. 用蓝图组织大型项目
5. 阅读 Flask 官方文档：https://flask.palletsprojects.com/
:::

## 下一步

- **[Flask 进阶](03-flask-advanced.md)** - 数据库集成、表单验证、RESTful API
- **[Django 入门](05-django-basics.md)** - 全栈式框架
- **[FastAPI 入门](04-fastapi-basics.md)** - 现代化高性能框架
