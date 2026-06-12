# Nginx 高级配置

Nginx 在生产环境的高级配置，包括负载均衡、缓存、限流、性能优化。

## 负载均衡

### 轮询（默认）

```nginx
upstream backend {
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://backend;
    }
}
```

### 加权轮询

```nginx
upstream backend {
    server 127.0.0.1:8001 weight=3;  # 权重 3
    server 127.0.0.1:8002 weight=1;  # 权重 1
    server 127.0.0.1:8003 weight=1;
}
```

### IP Hash（会话保持）

```nginx
upstream backend {
    ip_hash;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}
```

### 最少连接

```nginx
upstream backend {
    least_conn;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}
```

### 健康检查

```nginx
upstream backend {
    server 127.0.0.1:8001 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8002 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8003 backup;  # 备用服务器
}
```

## 缓存配置

### 代理缓存

```nginx
# 缓存路径配置
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

server {
    listen 80;
    
    location / {
        proxy_cache my_cache;
        proxy_cache_valid 200 60m;
        proxy_cache_valid 404 10m;
        proxy_cache_key $scheme$proxy_host$request_uri;
        proxy_cache_bypass $http_cache_control;
        
        add_header X-Cache-Status $upstream_cache_status;
        
        proxy_pass http://backend;
    }
}
```

### 静态文件缓存

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

### 缓存清除

```nginx
location ~ /purge(/.*) {
    allow 127.0.0.1;
    deny all;
    proxy_cache_purge my_cache $scheme$proxy_host$1$is_args$args;
}
```

## 限流配置

### 限制请求速率

```nginx
# 定义限流区域
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://backend;
    }
}
```

### 限制连接数

```nginx
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

server {
    location / {
        limit_conn conn_limit 10;  # 每个 IP 最多 10 个连接
        proxy_pass http://backend;
    }
}
```

### 限制带宽

```nginx
location /download/ {
    limit_rate 500k;  # 限制下载速度 500KB/s
}
```

## WebSocket 代理

```nginx
upstream websocket {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    
    location /ws/ {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;  # 24 小时超时
    }
}
```

## Gzip 压缩

```nginx
http {
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";
    gzip_min_length 1000;
}
```

## SSL/TLS 配置

### 基础 HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://backend;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

### 安全加固

```nginx
server {
    # HSTS（强制 HTTPS）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 防止点击劫持
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    # XSS 防护
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # CSP 策略
    add_header Content-Security-Policy "default-src 'self'" always;
}
```

## 反向代理优化

### 完整配置

```nginx
upstream backend {
    server 127.0.0.1:8000;
    keepalive 32;  # 保持连接
}

server {
    listen 80;
    
    location / {
        proxy_pass http://backend;
        
        # 请求头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲区
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        
        # HTTP 版本
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

## 防盗链

```nginx
location ~* \.(gif|jpg|png|mp4)$ {
    valid_referers none blocked server_names *.example.com;
    if ($invalid_referer) {
        return 403;
    }
}
```

## IP 黑白名单

```nginx
# 白名单
location /admin/ {
    allow 192.168.1.0/24;
    allow 10.0.0.1;
    deny all;
}

# 黑名单
location / {
    deny 192.168.1.100;
    allow all;
}
```

## 日志配置

### 自定义日志格式

```nginx
log_format custom '$remote_addr - $remote_user [$time_local] '
                  '"$request" $status $body_bytes_sent '
                  '"$http_referer" "$http_user_agent" '
                  '$request_time $upstream_response_time';

access_log /var/log/nginx/access.log custom;
error_log /var/log/nginx/error.log warn;
```

### 按虚拟主机分离日志

```nginx
server {
    server_name example.com;
    access_log /var/log/nginx/example.com-access.log;
    error_log /var/log/nginx/example.com-error.log;
}
```

### 条件日志

```nginx
map $status $loggable {
    ~^[23] 0;  # 2xx 和 3xx 不记录
    default 1;
}

access_log /var/log/nginx/access.log combined if=$loggable;
```

## 性能优化

### Worker 进程配置

```nginx
user nginx;
worker_processes auto;  # 自动检测 CPU 核心数
worker_cpu_affinity auto;
worker_rlimit_nofile 65535;

events {
    use epoll;
    worker_connections 4096;
    multi_accept on;
}
```

### 连接优化

```nginx
http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 100;
    reset_timedout_connection on;
    client_body_timeout 10;
    send_timeout 2;
}
```

### 文件缓存

```nginx
http {
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

## 监控与状态

### Stub Status 模块

```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

访问 `/nginx_status`：

```
Active connections: 291
server accepts handled requests
 16630948 16630948 31070465
Reading: 6 Writing: 179 Waiting: 106
```

## 完整生产配置示例

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" $request_time';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 缓存配置
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=cache:10m max_size=1g inactive=60m;
    
    # 限流配置
    limit_req_zone $binary_remote_addr zone=req_limit:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
    
    # 上游服务器
    upstream backend {
        least_conn;
        server 127.0.0.1:8001 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:8002 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }
    
    # HTTPS 服务器
    server {
        listen 443 ssl http2;
        server_name example.com;
        
        ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        
        # 安全头
        add_header Strict-Transport-Security "max-age=31536000" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        
        # 静态文件
        location /static/ {
            alias /var/www/myapp/static/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
        
        # API 接口（限流）
        location /api/ {
            limit_req zone=req_limit burst=20 nodelay;
            limit_conn conn_limit 10;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            # 缓存
            proxy_cache cache;
            proxy_cache_valid 200 10m;
            proxy_cache_key $uri$is_args$args;
            add_header X-Cache-Status $upstream_cache_status;
        }
        
        # WebSocket
        location /ws/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_read_timeout 86400;
        }
        
        # 默认路由
        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    
    # HTTP 重定向
    server {
        listen 80;
        server_name example.com;
        return 301 https://$server_name$request_uri;
    }
}
```

## 常用运维命令

```bash
# 测试配置
nginx -t

# 重新加载配置
nginx -s reload

# 停止服务
nginx -s stop

# 优雅停止
nginx -s quit

# 查看版本
nginx -v

# 查看编译参数
nginx -V
```

## 性能测试

```bash
# 使用 ab（Apache Bench）
ab -n 10000 -c 100 http://example.com/

# 使用 wrk
wrk -t12 -c400 -d30s http://example.com/

# 使用 siege
siege -c 100 -t 60s http://example.com/
```

::: tip 最佳实践
1. 根据 CPU 核心数配置 worker_processes
2. 启用 Gzip 压缩节省带宽
3. 配置缓存减少后端压力
4. 使用限流防止滥用
5. 定期分析日志优化性能
6. 启用 HTTP/2 提升性能
:::

## 下一步

- **[Docker 容器化](03-docker.md)** - Nginx 容器化部署
- **[监控与日志](05-monitoring.md)** - Nginx 监控方案
- **[Linux 服务器部署](02-linux-server.md)** - Nginx 基础配置
