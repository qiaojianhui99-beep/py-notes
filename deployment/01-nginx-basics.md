# Nginx 基础配置

Nginx 是一款高性能的 Web 服务器和反向代理服务器，广泛应用于生产环境。

## Nginx 简介

### 什么是 Nginx

Nginx（发音 "engine-x"）是一个开源的高性能 HTTP 服务器和反向代理服务器，由俄罗斯程序员 Igor Sysoev 开发。

### 核心特性

- **高并发**：采用事件驱动架构，可处理数万并发连接
- **低内存**：内存占用极低，单个工作进程仅需几 MB
- **高性能**：静态文件处理速度快，响应时间短
- **稳定性**：运行稳定，很少出现崩溃
- **模块化**：支持各种功能模块扩展

### Nginx vs Apache

| 特性 | Nginx | Apache |
|------|-------|--------|
| 架构 | 事件驱动（异步非阻塞） | 进程驱动（同步阻塞） |
| 并发能力 | 高（数万） | 中（数千） |
| 内存占用 | 低 | 较高 |
| 静态文件 | 非常快 | 快 |
| 动态内容 | 需配合应用服务器 | 原生支持（mod_php） |
| 配置 | 简洁 | 复杂（.htaccess） |
| 适用场景 | 高并发、反向代理、负载均衡 | 传统 Web 托管 |

### 应用场景

1. **静态文件服务器**：托管 HTML、CSS、JS、图片等
2. **反向代理**：代理后端应用（Flask、Django、FastAPI）
3. **负载均衡**：分发请求到多台服务器
4. **SSL 终止**：统一处理 HTTPS 证书
5. **缓存服务器**：缓存静态和动态内容
6. **API 网关**：统一入口，路由分发

## 安装 Nginx

### Ubuntu/Debian 安装

```bash
# 更新软件包列表
sudo apt update

# 安装 Nginx
sudo apt install nginx -y

# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx

# 查看版本
nginx -v
```

### CentOS/RHEL 安装

```bash
# 安装 Nginx
sudo yum install nginx -y

# 或使用 dnf（CentOS 8+）
sudo dnf install nginx -y

# 启动服务
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx
```

### macOS 安装

```bash
# 使用 Homebrew
brew install nginx

# 启动 Nginx
brew services start nginx

# 或手动启动
nginx

# 查看版本
nginx -v
```

### 验证安装

安装完成后，打开浏览器访问：

```
http://服务器IP地址
或
http://localhost
```

看到 "Welcome to nginx!" 页面表示安装成功。

### 常用命令

```bash
# 启动
sudo systemctl start nginx

# 停止
sudo systemctl stop nginx

# 重启
sudo systemctl restart nginx

# 重新加载配置（不中断服务）
sudo systemctl reload nginx
# 或
sudo nginx -s reload

# 测试配置文件语法
sudo nginx -t

# 查看版本和编译参数
nginx -V
```

## 配置文件结构

### 主配置文件位置

不同系统的配置文件路径：

| 系统 | 主配置文件 | 站点配置目录 |
|------|-----------|-------------|
| Ubuntu/Debian | `/etc/nginx/nginx.conf` | `/etc/nginx/sites-available/` |
| CentOS/RHEL | `/etc/nginx/nginx.conf` | `/etc/nginx/conf.d/` |
| macOS (Homebrew) | `/usr/local/etc/nginx/nginx.conf` | `/usr/local/etc/nginx/servers/` |

### nginx.conf 结构

```nginx
# 全局块：影响全局的指令
user nginx;                      # 运行用户
worker_processes auto;           # 工作进程数（auto = CPU 核心数）
error_log /var/log/nginx/error.log;  # 错误日志
pid /run/nginx.pid;              # PID 文件

# events 块：网络连接相关
events {
    worker_connections 1024;     # 每个进程最大连接数
    use epoll;                   # Linux 使用 epoll 模型
}

# http 块：HTTP 服务器配置
http {
    # 基础配置
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # 性能优化
    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    
    # 包含其他配置文件
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
    
    # server 块：虚拟主机配置
    server {
        listen 80;               # 监听端口
        server_name example.com; # 域名
        
        # location 块：URL 匹配规则
        location / {
            root /var/www/html;  # 网站根目录
            index index.html;    # 默认首页
        }
    }
}
```

### 配置指令层级

```
全局块
├── events 块
└── http 块
    ├── upstream 块（负载均衡）
    └── server 块（虚拟主机）
        └── location 块（URL 匹配）
```

### sites-available 和 sites-enabled

Ubuntu/Debian 推荐的配置方式：

```bash
# 1. 在 sites-available 创建配置文件
sudo nano /etc/nginx/sites-available/mysite

# 2. 创建软链接到 sites-enabled
sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/

# 3. 测试配置
sudo nginx -t

# 4. 重载配置
sudo systemctl reload nginx

# 禁用站点（删除软链接）
sudo rm /etc/nginx/sites-enabled/mysite
sudo systemctl reload nginx
```

## 静态文件服务

### 基础配置

```nginx
server {
    listen 80;
    server_name example.com;
    
    # 网站根目录
    root /var/www/mysite;
    
    # 默认首页文件
    index index.html index.htm;
    
    # 访问日志
    access_log /var/log/nginx/mysite_access.log;
    error_log /var/log/nginx/mysite_error.log;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

**配置说明**：
- `listen 80`：监听 80 端口（HTTP）
- `server_name`：域名（可多个，用空格分隔）
- `root`：网站文件根目录
- `index`：默认首页文件，按顺序查找
- `try_files`：尝试查找文件，找不到返回 404

### 目录结构示例

```bash
/var/www/mysite/
├── index.html
├── about.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── images/
    └── logo.png
```

### URL 访问示例

| URL | 对应文件路径 |
|-----|------------|
| `http://example.com/` | `/var/www/mysite/index.html` |
| `http://example.com/about.html` | `/var/www/mysite/about.html` |
| `http://example.com/css/style.css` | `/var/www/mysite/css/style.css` |

### 创建测试页面

```bash
# 创建目录
sudo mkdir -p /var/www/mysite

# 创建测试页面
sudo tee /var/www/mysite/index.html > /dev/null <<'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>我的网站</title>
</head>
<body>
    <h1>欢迎访问我的网站！</h1>
    <p>这是一个由 Nginx 托管的静态网站。</p>
</body>
</html>
EOF

# 设置权限
sudo chown -R www-data:www-data /var/www/mysite  # Ubuntu/Debian
# sudo chown -R nginx:nginx /var/www/mysite      # CentOS/RHEL
```

### 文件类型配置

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/mysite;
    
    # HTML 文件
    location ~* \.html$ {
        add_header Cache-Control "public, max-age=3600";
    }
    
    # CSS/JS 文件
    location ~* \.(css|js)$ {
        add_header Cache-Control "public, max-age=86400";
        expires 1d;
    }
    
    # 图片文件
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        add_header Cache-Control "public, max-age=604800";
        expires 7d;
    }
}
```

## 反向代理入门

### 什么是反向代理

```
客户端 → Nginx (80/443) → 后端应用 (5000/8000)
```

**反向代理作用**：
- 隐藏后端服务器真实 IP
- 统一入口，负载均衡
- SSL 终止，统一处理 HTTPS
- 缓存静态资源
- 限流、防护

### 代理 Flask 应用

**Flask 应用**（运行在 5000 端口）：

```python
# app.py
from flask import Flask
app = Flask(__name__)

@app.route('/')
def index():
    return 'Hello from Flask!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**Nginx 配置**：

```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        # 代理到 Flask 应用
        proxy_pass http://127.0.0.1:5000;
        
        # 传递真实客户端信息
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 代理 Django 应用

**Django 应用**（使用 Gunicorn）：

```bash
# 安装 Gunicorn
pip install gunicorn

# 启动（8000 端口）
gunicorn myproject.wsgi:application --bind 0.0.0.0:8000
```

**Nginx 配置**：

```nginx
server {
    listen 80;
    server_name example.com;
    
    # 静态文件（由 Nginx 直接处理）
    location /static/ {
        alias /var/www/myproject/static/;
    }
    
    location /media/ {
        alias /var/www/myproject/media/;
    }
    
    # 动态请求代理到 Django
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 代理 FastAPI 应用

**FastAPI 应用**（使用 Uvicorn）：

```bash
# 安装 Uvicorn
pip install uvicorn

# 启动（8000 端口）
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Nginx 配置**：

```nginx
server {
    listen 80;
    server_name api.example.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # WebSocket 支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### proxy_set_header 详解

| Header | 作用 | 示例值 |
|--------|------|--------|
| `Host` | 原始请求的 Host | `example.com` |
| `X-Real-IP` | 客户端真实 IP | `203.0.113.1` |
| `X-Forwarded-For` | 请求经过的所有 IP | `203.0.113.1, 198.51.100.1` |
| `X-Forwarded-Proto` | 原始协议（http/https） | `https` |

**Flask 中获取真实 IP**：

```python
from flask import request

@app.route('/')
def index():
    real_ip = request.headers.get('X-Real-IP', request.remote_addr)
    return f'Your IP: {real_ip}'
```

## upstream 负载均衡

### 基本配置

```nginx
# 定义后端服务器组
upstream backend {
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    server 127.0.0.1:5003;
}

server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://backend;  # 使用 upstream 名称
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 负载均衡策略

**1. 轮询（默认）**：

```nginx
upstream backend {
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}
```

**2. 权重**：

```nginx
upstream backend {
    server 127.0.0.1:5001 weight=3;  # 权重 3
    server 127.0.0.1:5002 weight=1;  # 权重 1
}
```

**3. IP 哈希（同一 IP 固定到同一服务器）**：

```nginx
upstream backend {
    ip_hash;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}
```

**4. 最少连接**：

```nginx
upstream backend {
    least_conn;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}
```

### 健康检查

```nginx
upstream backend {
    server 127.0.0.1:5001 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:5002 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:5003 backup;  # 备用服务器
}
```

**参数说明**：
- `max_fails=3`：失败 3 次后标记为不可用
- `fail_timeout=30s`：30 秒后重新尝试
- `backup`：备用服务器，仅在主服务器全部不可用时使用

## 常用配置

### 日志配置

```nginx
http {
    # 自定义日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';
    
    # 访问日志
    access_log /var/log/nginx/access.log main;
    
    # 错误日志（级别：debug, info, notice, warn, error, crit）
    error_log /var/log/nginx/error.log warn;
    
    server {
        # 单独配置日志
        access_log /var/log/nginx/mysite_access.log;
        error_log /var/log/nginx/mysite_error.log;
    }
}
```

### GZIP 压缩

```nginx
http {
    # 启用 GZIP
    gzip on;
    
    # 压缩级别（1-9，9 最高但最慢）
    gzip_comp_level 6;
    
    # 最小压缩文件大小
    gzip_min_length 1000;
    
    # 压缩的文件类型
    gzip_types text/plain text/css application/json application/javascript 
               text/xml application/xml text/javascript;
    
    # 禁用 IE6 的 GZIP
    gzip_disable "msie6";
}
```

### 请求限制

```nginx
http {
    # 限制请求速率（每秒 10 个请求）
    limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
    
    server {
        location / {
            limit_req zone=one burst=20 nodelay;
            proxy_pass http://backend;
        }
    }
}
```

### 文件上传大小

```nginx
http {
    # 允许上传 100MB 文件
    client_max_body_size 100M;
}
```

## 常见问题

### 问题 1：403 Forbidden

**原因**：
1. 文件权限不足
2. 缺少 index 文件
3. SELinux 阻止

**解决方案**：

```bash
# 1. 检查文件权限
ls -la /var/www/mysite/

# 2. 设置正确权限
sudo chown -R www-data:www-data /var/www/mysite/  # Ubuntu
sudo chmod -R 755 /var/www/mysite/

# 3. 检查 SELinux（CentOS）
getenforce
sudo setenforce 0  # 临时关闭
# 或永久配置
sudo setsebool -P httpd_can_network_connect 1
```

### 问题 2：502 Bad Gateway

**原因**：
1. 后端应用未启动
2. 端口错误
3. 防火墙阻止

**解决方案**：

```bash
# 1. 检查后端应用是否运行
ps aux | grep python  # 或 gunicorn/uvicorn

# 2. 检查端口监听
sudo netstat -tulnp | grep 5000

# 3. 测试后端
curl http://127.0.0.1:5000

# 4. 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 问题 3：配置修改不生效

**原因**：
1. 未重载配置
2. 配置语法错误
3. 浏览器缓存

**解决方案**：

```bash
# 1. 测试配置语法
sudo nginx -t

# 2. 重载配置
sudo systemctl reload nginx

# 3. 如果报错，查看日志
sudo journalctl -u nginx -n 50

# 4. 清除浏览器缓存
# Ctrl + Shift + R（硬刷新）
```

### 问题 4：端口冲突

**错误信息**：`bind() to 0.0.0.0:80 failed (98: Address already in use)`

**解决方案**：

```bash
# 查看占用 80 端口的进程
sudo lsof -i :80
# 或
sudo netstat -tulnp | grep :80

# 停止占用进程
sudo systemctl stop apache2  # 如果是 Apache
# 或直接杀进程
sudo kill -9 <PID>
```

## 易错点

### 易错点 1：配置文件语法错误

❌ **常见错误**：

```nginx
# 忘记分号
server {
    listen 80
    server_name example.com;
}

# 花括号不匹配
server {
    listen 80;
```

✅ **正确做法**：

```nginx
server {
    listen 80;
    server_name example.com;
}
```

**检查方法**：

```bash
sudo nginx -t
```

### 易错点 2：权限问题

❌ **错误示例**：

```bash
# root 用户创建文件
sudo echo "test" > /var/www/mysite/index.html
# 文件所有者是 root，Nginx 无法读取
```

✅ **正确做法**：

```bash
# 使用正确的用户
sudo -u www-data touch /var/www/mysite/index.html
# 或设置权限
sudo chown -R www-data:www-data /var/www/mysite/
```

### 易错点 3：proxy_pass 末尾斜杠

```nginx
# 情况 1：不带斜杠
location /api/ {
    proxy_pass http://127.0.0.1:5000;
}
# 访问 /api/users → 代理到 http://127.0.0.1:5000/api/users

# 情况 2：带斜杠
location /api/ {
    proxy_pass http://127.0.0.1:5000/;
}
# 访问 /api/users → 代理到 http://127.0.0.1:5000/users（去掉 /api）
```

**规则**：
- `proxy_pass` 末尾有斜杠 → 替换 location 匹配部分
- `proxy_pass` 末尾无斜杠 → 保留完整路径

### 易错点 4：忘记重载配置

❌ **错误流程**：

```bash
# 修改配置文件
sudo nano /etc/nginx/sites-available/mysite
# 直接访问，发现不生效
```

✅ **正确流程**：

```bash
# 1. 修改配置
sudo nano /etc/nginx/sites-available/mysite

# 2. 测试语法
sudo nginx -t

# 3. 重载配置
sudo systemctl reload nginx
```

## 练习题

### 基础练习

**练习 1**：安装 Nginx 并创建静态网站

要求：
- 安装 Nginx
- 在 `/var/www/mysite` 创建 HTML 文件
- 配置 Nginx 托管该站点
- 通过浏览器访问验证

**练习 2**：配置反向代理

要求：
- 创建一个 Flask 应用（运行在 5000 端口）
- 配置 Nginx 反向代理到该应用
- 验证可以通过 80 端口访问

### 进阶练习

**练习 3**：配置多个虚拟主机

要求：
- 创建两个站点：`site1.local` 和 `site2.local`
- 修改 `/etc/hosts` 添加本地域名解析
- 配置两个 server 块
- 验证可以分别访问两个站点

**练习 4**：配置负载均衡

要求：
- 启动 3 个 Flask 应用实例（5001, 5002, 5003）
- 配置 upstream 负载均衡
- 使用权重策略（3:2:1）
- 测试负载分发效果

### 挑战练习

**练习 5**：配置缓存和压缩

要求：
- 配置静态文件缓存（CSS/JS 缓存 1 天）
- 启用 GZIP 压缩
- 使用浏览器开发者工具验证响应头
- 对比压缩前后的文件大小

## 费曼学习法检验

尝试用自己的话回答以下问题：

### 基本概念
1. Nginx 和 Apache 的主要区别是什么？
2. 什么是反向代理？和正向代理有什么区别？
3. Nginx 配置文件的层级结构是怎样的？

### 具体操作
4. 如何创建一个新的虚拟主机？
5. `proxy_pass` 末尾带斜杠和不带斜杠有什么区别？
6. 如何配置 Nginx 负载均衡？

### 问题排查
7. 遇到 403 Forbidden 错误，可能是哪些原因？
8. 502 Bad Gateway 通常表示什么问题？
9. 修改配置文件后，必须执行哪些步骤才能生效？

### 实战问题
10. 如何查看 Nginx 的访问日志和错误日志？
11. 如何限制单个 IP 的请求频率？
12. 如何配置 Nginx 只允许特定 IP 访问？

## 总结

### 快速参考

**常用命令**：

```bash
sudo nginx -t                # 测试配置
sudo systemctl reload nginx  # 重载配置
sudo systemctl restart nginx # 重启服务
tail -f /var/log/nginx/error.log  # 查看错误日志
```

**基本配置模板**：

```nginx
server {
    listen 80;
    server_name example.com;
    
    # 静态文件
    location /static/ {
        root /var/www/mysite;
    }
    
    # 反向代理
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 学习路径

1. ✅ **掌握基础**：安装、启动、配置文件结构
2. ✅ **静态文件服务**：托管 HTML/CSS/JS
3. ✅ **反向代理**：代理 Flask/Django/FastAPI
4. ✅ **负载均衡**：upstream 配置
5. ⏭️ **进阶内容**：参考 [`06-nginx-advanced.md`](06-nginx-advanced.md)
   - HTTPS 配置
   - 缓存策略
   - 性能优化
   - 安全防护

### 最佳实践

1. **配置管理**：使用 `sites-available` + `sites-enabled` 管理多站点
2. **语法检查**：修改后必须 `nginx -t` 测试
3. **日志监控**：定期检查错误日志
4. **权限控制**：文件所有者设为 `www-data` 或 `nginx`
5. **安全加固**：隐藏版本号、限制请求速率
6. **备份配置**：修改前备份配置文件
