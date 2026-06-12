# Django 进阶

深入 Django 开发，掌握 REST API、信号、中间件、缓存、性能优化等高级特性。

## Django REST Framework

### 安装

```bash
pip install djangorestframework
```

**注册应用** `settings.py`：

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'blog',
]

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}
```

### 序列化器（Serializers）

`blog/serializers.py`：

```python
from rest_framework import serializers
from .models import Post, Comment

class PostSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'created_at', 'published', 'comments_count']
        read_only_fields = ['created_at']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at']
```

### API 视图

```python
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post
from .serializers import PostSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Post.objects.all()
        if self.request.user.is_authenticated:
            return queryset
        return queryset.filter(published=True)
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        post = self.get_object()
        post.published = True
        post.save()
        return Response({'status': 'published'})
```

### 路由配置

`blog/urls.py`：

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
```

访问：
- `GET /api/posts/` - 文章列表
- `POST /api/posts/` - 创建文章
- `GET /api/posts/1/` - 文章详情
- `PUT /api/posts/1/` - 更新文章
- `DELETE /api/posts/1/` - 删除文章
- `POST /api/posts/1/publish/` - 发布文章

### 权限控制

```python
from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

class PostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthorOrReadOnly]
```

### 过滤和搜索

```bash
pip install django-filter
```

```python
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

class PostViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['published', 'author']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'title']
```

访问：
- `/api/posts/?published=true`
- `/api/posts/?search=Django`
- `/api/posts/?ordering=-created_at`

## JWT 认证

```bash
pip install djangorestframework-simplejwt
```

`settings.py`：

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

`urls.py`：

```python
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
]
```

使用：

```bash
# 获取 token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 使用 token
curl http://localhost:8000/api/posts/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

## 信号（Signals）

```python
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(pre_delete, sender=Post)
def delete_post_files(sender, instance, **kwargs):
    if instance.image:
        instance.image.delete(save=False)
```

注册信号 `apps.py`：

```python
from django.apps import AppConfig

class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blog'
    
    def ready(self):
        import blog.signals
```

## 中间件（Middleware）

`blog/middleware.py`：

```python
import time
from django.utils.deprecation import MiddlewareMixin

class RequestTimingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            response['X-Request-Duration'] = str(duration)
        return response

class CorsMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
```

注册中间件 `settings.py`：

```python
MIDDLEWARE = [
    ...
    'blog.middleware.RequestTimingMiddleware',
    'blog.middleware.CorsMiddleware',
]
```

## 缓存

### 配置缓存

`settings.py`：

```python
# Redis 缓存
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# Memcached 缓存
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.PyMemcacheCache',
        'LOCATION': '127.0.0.1:11211',
    }
}
```

### 视图缓存

```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # 缓存 15 分钟
def post_list(request):
    posts = Post.objects.all()
    return render(request, 'blog/post_list.html', {'posts': posts})
```

### 模板片段缓存

```django
{% load cache %}
{% cache 500 sidebar %}
    <div class="sidebar">
        {% for item in menu_items %}
            {{ item.title }}
        {% endfor %}
    </div>
{% endcache %}
```

### 低级缓存 API

```python
from django.core.cache import cache

# 设置缓存
cache.set('my_key', 'my_value', 300)  # 300 秒

# 获取缓存
value = cache.get('my_key')

# 删除缓存
cache.delete('my_key')

# 批量操作
cache.set_many({'a': 1, 'b': 2}, 300)
cache.get_many(['a', 'b'])
```

## 异步视图（Django 4.1+）

```python
from django.http import JsonResponse
import asyncio

async def async_view(request):
    await asyncio.sleep(1)
    return JsonResponse({'message': 'Async response'})

# 异步类视图
from django.views import View

class AsyncView(View):
    async def get(self, request):
        data = await fetch_data()
        return JsonResponse(data)
```

## 自定义管理命令

`blog/management/commands/publish_posts.py`：

```python
from django.core.management.base import BaseCommand
from blog.models import Post

class Command(BaseCommand):
    help = '发布所有待发布的文章'
    
    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='不实际执行')
    
    def handle(self, *args, **options):
        posts = Post.objects.filter(published=False)
        count = posts.count()
        
        if options['dry_run']:
            self.stdout.write(f'将发布 {count} 篇文章（模拟）')
        else:
            posts.update(published=True)
            self.stdout.write(self.style.SUCCESS(f'成功发布 {count} 篇文章'))
```

运行：

```bash
python manage.py publish_posts
python manage.py publish_posts --dry-run
```

## 数据库优化

### 选择相关字段

```python
# 避免 N+1 查询
posts = Post.objects.select_related('author').all()  # 外键
posts = Post.objects.prefetch_related('tags').all()  # 多对多

# 仅查询需要的字段
posts = Post.objects.only('title', 'created_at')
posts = Post.objects.defer('content')  # 排除字段
```

### 批量操作

```python
# 批量创建
Post.objects.bulk_create([
    Post(title='Post 1', content='Content 1'),
    Post(title='Post 2', content='Content 2'),
])

# 批量更新
Post.objects.filter(published=False).update(published=True)

# 批量删除
Post.objects.filter(created_at__lt='2020-01-01').delete()
```

### 数据库索引

```python
class Post(models.Model):
    title = models.CharField(max_length=200, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['created_at', '-published']),
        ]
```

## Celery 异步任务

```bash
pip install celery redis
```

`myproject/celery.py`：

```python
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

app = Celery('myproject')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

`settings.py`：

```python
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
```

`blog/tasks.py`：

```python
from celery import shared_task
from django.core.mail import send_mail

@shared_task
def send_email_task(subject, message, recipient_list):
    send_mail(subject, message, 'from@example.com', recipient_list)
    return f'Sent email to {len(recipient_list)} recipients'
```

使用：

```python
from .tasks import send_email_task

def post_create(request):
    # ... 创建文章
    send_email_task.delay('New Post', 'A new post was created', ['admin@example.com'])
```

启动 worker：

```bash
celery -A myproject worker -l info
```

## 测试

```python
from django.test import TestCase, Client
from django.contrib.auth.models import User
from .models import Post

class PostModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('testuser', 'test@example.com', 'password')
        self.post = Post.objects.create(title='Test Post', content='Test Content', author=self.user)
    
    def test_post_creation(self):
        self.assertEqual(self.post.title, 'Test Post')
        self.assertEqual(self.post.author.username, 'testuser')
    
    def test_post_str(self):
        self.assertEqual(str(self.post), 'Test Post')

class PostViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user('testuser', 'test@example.com', 'password')
    
    def test_post_list_view(self):
        response = self.client.get('/blog/')
        self.assertEqual(response.status_code, 200)
    
    def test_post_create_view(self):
        self.client.login(username='testuser', password='password')
        response = self.client.post('/blog/create/', {
            'title': 'New Post',
            'content': 'New Content'
        })
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Post.objects.count(), 1)
```

运行测试：

```bash
python manage.py test
python manage.py test blog.tests.PostModelTest
```

## 部署配置

### 生产环境设置

`settings.py`：

```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']

# 安全设置
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000

# 静态文件
STATIC_ROOT = BASE_DIR / 'staticfiles'

# 日志
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/error.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
```

### 收集静态文件

```bash
python manage.py collectstatic
```

### 使用环境变量

```bash
pip install python-decouple
```

```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
    }
}
```

## 性能监控

```bash
pip install django-debug-toolbar
```

`settings.py`：

```python
INSTALLED_APPS = [
    ...
    'debug_toolbar',
]

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    ...
]

INTERNAL_IPS = ['127.0.0.1']
```

`urls.py`：

```python
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
```

::: tip 最佳实践
1. 使用 select_related/prefetch_related 优化查询
2. 为常用查询添加数据库索引
3. 使用 Redis 缓存热点数据
4. 异步任务用 Celery 处理
5. 生产环境关闭 DEBUG
6. 使用环境变量管理敏感配置
:::

## 下一步

- **[RESTful API 设计](07-restful-api.md)** - API 设计最佳实践
- **[Flask 进阶](03-flask-advanced.md)** - 对比学习
- **[部署指南](../deployment/)** - 部署 Django 应用
