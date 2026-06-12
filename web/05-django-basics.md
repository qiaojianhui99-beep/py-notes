# Django 入门

Django 是一个全栈式 Python Web 框架，内置 ORM、Admin、认证系统，适合快速开发完整的 Web 应用。

## 特点

- 🚀 **开箱即用**：内置 ORM、Admin、认证、Session
- 🔒 **安全性**：自动防护 SQL 注入、XSS、CSRF
- 📦 **电池齐全**：表单、缓存、国际化、分页等内置功能
- 📖 **文档完善**：官方文档详尽，社区活跃

## 安装

```bash
pip install django
```

## 创建项目

```bash
# 创建项目
django-admin startproject myproject
cd myproject

# 目录结构
myproject/
├── manage.py           # 管理脚本
└── myproject/
    ├── __init__.py
    ├── settings.py     # 配置文件
    ├── urls.py         # 路由配置
    ├── asgi.py        # ASGI 入口
    └── wsgi.py        # WSGI 入口
```

## 创建应用

```bash
python manage.py startapp blog

# 应用目录结构
blog/
├── migrations/        # 数据库迁移
├── __init__.py
├── admin.py          # Admin 配置
├── apps.py           # 应用配置
├── models.py         # 模型定义
├── tests.py          # 测试
└── views.py          # 视图函数
```

**注册应用** `myproject/settings.py`：

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'blog',  # 添加应用
]
```

## 运行开发服务器

```bash
python manage.py runserver
# 访问 http://127.0.0.1:8000
```

## 模型（Models）

### 定义模型

`blog/models.py`：

```python
from django.db import models
from django.contrib.auth.models import User

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
```

### 常用字段类型

```python
# 字符串
title = models.CharField(max_length=100)
content = models.TextField()

# 数字
age = models.IntegerField()
price = models.DecimalField(max_digits=10, decimal_places=2)

# 日期时间
created_at = models.DateTimeField(auto_now_add=True)
updated_at = models.DateTimeField(auto_now=True)
date = models.DateField()

# 布尔
is_active = models.BooleanField(default=True)

# 关系
author = models.ForeignKey(User, on_delete=models.CASCADE)  # 多对一
tags = models.ManyToManyField('Tag')  # 多对多
profile = models.OneToOneField('Profile', on_delete=models.CASCADE)  # 一对一

# 其他
email = models.EmailField()
url = models.URLField()
image = models.ImageField(upload_to='images/')
file = models.FileField(upload_to='files/')
```

### 迁移数据库

```bash
# 生成迁移文件
python manage.py makemigrations

# 执行迁移
python manage.py migrate

# 查看 SQL
python manage.py sqlmigrate blog 0001
```

## 视图（Views）

### 函数视图

`blog/views.py`：

```python
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, JsonResponse
from .models import Post

def post_list(request):
    posts = Post.objects.filter(published=True)
    return render(request, 'blog/post_list.html', {'posts': posts})

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    return render(request, 'blog/post_detail.html', {'post': post})

def post_create(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        post = Post.objects.create(title=title, content=content, author=request.user)
        return redirect('post_detail', pk=post.pk)
    return render(request, 'blog/post_form.html')
```

### 类视图

```python
from django.views.generic import ListView, DetailView, CreateView
from django.urls import reverse_lazy

class PostListView(ListView):
    model = Post
    template_name = 'blog/post_list.html'
    context_object_name = 'posts'
    paginate_by = 10
    
    def get_queryset(self):
        return Post.objects.filter(published=True)

class PostDetailView(DetailView):
    model = Post
    template_name = 'blog/post_detail.html'

class PostCreateView(CreateView):
    model = Post
    fields = ['title', 'content']
    template_name = 'blog/post_form.html'
    success_url = reverse_lazy('post_list')
```

## 路由（URLs）

### 应用路由

`blog/urls.py`：

```python
from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('post/<int:pk>/', views.post_detail, name='post_detail'),
    path('post/create/', views.post_create, name='post_create'),
]
```

### 项目路由

`myproject/urls.py`：

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('blog/', include('blog.urls')),
]
```

## 模板（Templates）

### 创建模板目录

```bash
mkdir -p blog/templates/blog
```

### 基础模板

`blog/templates/blog/base.html`：

```html
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}Blog{% endblock %}</title>
</head>
<body>
    <nav>
        <a href="{% url 'blog:post_list' %}">首页</a>
        <a href="{% url 'blog:post_create' %}">发布</a>
    </nav>
    
    <main>
        {% block content %}{% endblock %}
    </main>
</body>
</html>
```

### 列表模板

`blog/templates/blog/post_list.html`：

```html
{% extends 'blog/base.html' %}

{% block title %}文章列表{% endblock %}

{% block content %}
<h1>文章列表</h1>

{% for post in posts %}
<article>
    <h2><a href="{% url 'blog:post_detail' post.pk %}">{{ post.title }}</a></h2>
    <p>{{ post.content|truncatewords:30 }}</p>
    <small>{{ post.author.username }} - {{ post.created_at|date:"Y-m-d H:i" }}</small>
</article>
{% empty %}
<p>暂无文章</p>
{% endfor %}

{% if is_paginated %}
<div class="pagination">
    {% if page_obj.has_previous %}
    <a href="?page={{ page_obj.previous_page_number }}">上一页</a>
    {% endif %}
    <span>{{ page_obj.number }} / {{ page_obj.paginator.num_pages }}</span>
    {% if page_obj.has_next %}
    <a href="?page={{ page_obj.next_page_number }}">下一页</a>
    {% endif %}
</div>
{% endif %}
{% endblock %}
```

### 模板语法

```django
{# 变量 #}
{{ post.title }}
{{ post.created_at|date:"Y-m-d" }}

{# 标签 #}
{% if user.is_authenticated %}
    欢迎，{{ user.username }}
{% else %}
    <a href="{% url 'login' %}">登录</a>
{% endif %}

{% for post in posts %}
    {{ post.title }}
{% empty %}
    暂无内容
{% endfor %}

{# 过滤器 #}
{{ post.content|truncatewords:20 }}
{{ post.title|upper }}
{{ post.created_at|timesince }}

{# URL 反向解析 #}
<a href="{% url 'blog:post_detail' post.pk %}">详情</a>
```

## Admin 后台

### 注册模型

`blog/admin.py`：

```python
from django.contrib import admin
from .models import Post

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'published', 'created_at']
    list_filter = ['published', 'created_at']
    search_fields = ['title', 'content']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'author', 'content')
        }),
        ('状态', {
            'fields': ('published',)
        }),
    )
```

### 创建超级用户

```bash
python manage.py createsuperuser
# 访问 http://127.0.0.1:8000/admin
```

## ORM 查询

```python
# 查询所有
posts = Post.objects.all()

# 过滤
posts = Post.objects.filter(published=True)
posts = Post.objects.filter(title__contains='Django')
posts = Post.objects.filter(created_at__gte='2024-01-01')

# 排除
posts = Post.objects.exclude(published=False)

# 获取单个对象
post = Post.objects.get(pk=1)
post = Post.objects.filter(title='Hello').first()

# 排序
posts = Post.objects.order_by('-created_at')

# 限制数量
posts = Post.objects.all()[:10]

# 聚合
from django.db.models import Count, Avg
Post.objects.count()
Post.objects.filter(published=True).count()

# 关联查询
posts = Post.objects.select_related('author')  # 外键
posts = Post.objects.prefetch_related('tags')  # 多对多

# Q 对象（复杂查询）
from django.db.models import Q
posts = Post.objects.filter(Q(title__contains='Django') | Q(content__contains='Python'))
```

## 表单（Forms）

### 模型表单

`blog/forms.py`：

```python
from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content', 'published']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 10}),
        }
```

### 视图中使用

```python
from .forms import PostForm

def post_create(request):
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()
            return redirect('blog:post_detail', pk=post.pk)
    else:
        form = PostForm()
    return render(request, 'blog/post_form.html', {'form': form})
```

### 模板中渲染

```html
<form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit">提交</button>
</form>
```

## 静态文件

### 配置

`settings.py`：

```python
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
```

### 使用

```html
{% load static %}
<link rel="stylesheet" href="{% static 'css/style.css' %}">
<script src="{% static 'js/script.js' %}"></script>
<img src="{% static 'images/logo.png' %}">
```

## 用户认证

```python
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('home')
    return render(request, 'login.html')

def user_logout(request):
    logout(request)
    return redirect('home')

@login_required
def profile(request):
    return render(request, 'profile.html')
```

## 配置数据库

`settings.py`：

```python
# SQLite（默认）
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# MySQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mydb',
        'USER': 'root',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

# PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mydb',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

::: tip 学习建议
1. 先理解 MTV（Model-Template-View）设计模式
2. 掌握 ORM 查询语法
3. 熟悉 Admin 后台定制
4. 学习通用视图（Generic Views）简化代码
5. 阅读官方文档：https://docs.djangoproject.com/
:::

## 下一步

- **[Django 进阶](06-django-advanced.md)** - REST API、信号、中间件、缓存
- **[Flask 入门](02-flask-basics.md)** - 轻量级框架对比
- **[FastAPI 入门](04-fastapi-basics.md)** - 现代化高性能框架
