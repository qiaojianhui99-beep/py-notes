# Linux 服务器部署

将 Python Web 应用部署到 Linux 服务器的完整指南。

## 服务器准备

### 1. 购买云服务器

推荐选择：
- **阿里云 ECS**
- **腾讯云 CVM**
- **AWS EC2**
- **DigitalOcean Droplet**

配置建议（入门级）：
- CPU：1-2 核
- 内存：2GB+
- 系统：Ubuntu 22.04 LTS / CentOS 8

### 2. SSH 连接

```bash
# 使用密码登录
ssh root@your_server_ip

# 使用密钥登录（推荐）
ssh -i ~/.ssh/id_rsa root@your_server_ip
```

### 3. 创建非 root 用户

```bash
# 创建用户
adduser deploy

# 添加 sudo 权限
usermod -aG sudo deploy

# 切换用户
su - deploy
```

## 环境配置

### 1. 更新系统

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. 安装 Python

```bash
# Ubuntu/Debian
sudo apt install python3 python3-pip python3-venv -y

# 验证
python3 --version
pip3 --version
```

### 3. 安装必要工具

```bash
sudo apt install git nginx supervisor -y
```

## 部署 Flask 应用

### 1. 上传代码

```bash
# 方式1：Git 克隆
cd /var/www
sudo git clone https://github.com/username/myapp.git
sudo chown -R deploy:deploy myapp

# 方式2：SCP 上传
scp -r ./myapp deploy@your_server_ip:/var/www/
```

### 2. 创建虚拟环境

```bash
cd /var/www/myapp
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
nano .env
```

```env
FLASK_ENV=production
SECRET_KEY=your-production-secret-key
DATABASE_URL=mysql://user:pass@localhost/dbname
```

### 4. 安装 Gunicorn

```bash
pip install gunicorn
```

**测试运行**：

```bash
gunicorn -w 4 -b 127.0.0.1:8000 app:app
```

参数说明：
- `-w 4`：4 个 worker 进程
- `-b 127.0.0.1:8000`：绑定地址和端口
- `app:app`：模块名:应用对象

## Gunicorn 配置

### 创建配置文件

```bash
nano gunicorn_config.py
```

```python
import multiprocessing

# 工作进程数（推荐：CPU 核心数 * 2 + 1）
workers = multiprocessing.cpu_count() * 2 + 1

# 绑定地址
bind = '127.0.0.1:8000'

# 工作模式
worker_class = 'sync'  # 同步模式
# worker_class = 'gevent'  # 异步模式（需安装 gevent）

# 超时时间
timeout = 30

# 日志
accesslog = '/var/log/gunicorn/access.log'
errorlog = '/var/log/gunicorn/error.log'
loglevel = 'info'

# 进程名称
proc_name = 'myapp'

# 守护进程（由 Supervisor 管理时设为 False）
daemon = False
```

### 创建日志目录

```bash
sudo mkdir -p /var/log/gunicorn
sudo chown -R deploy:deploy /var/log/gunicorn
```

### 使用配置文件运行

```bash
gunicorn -c gunicorn_config.py app:app
```

## Nginx 配置

### 1. 创建配置文件

```bash
sudo nano /etc/nginx/sites-available/myapp
```

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /var/www/myapp/static;
        expires 30d;
    }

    location /media {
        alias /var/www/myapp/media;
        expires 7d;
    }
}
```

### 2. 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

## Supervisor 进程管理

### 1. 创建配置文件

```bash
sudo nano /etc/supervisor/conf.d/myapp.conf
```

```ini
[program:myapp]
command=/var/www/myapp/venv/bin/gunicorn -c gunicorn_config.py app:app
directory=/var/www/myapp
user=deploy
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/supervisor/myapp.log
```

### 2. 启动服务

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start myapp
```

### 3. 常用命令

```bash
sudo supervisorctl status myapp     # 查看状态
sudo supervisorctl stop myapp       # 停止
sudo supervisorctl start myapp      # 启动
sudo supervisorctl restart myapp    # 重启
sudo supervisorctl tail myapp       # 查看日志
```

## 数据库配置

### MySQL

```bash
# 安装
sudo apt install mysql-server -y

# 安全配置
sudo mysql_secure_installation

# 创建数据库
sudo mysql -u root -p
```

```sql
CREATE DATABASE myapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'myapp_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON myapp.* TO 'myapp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### PostgreSQL

```bash
# 安装
sudo apt install postgresql postgresql-contrib -y

# 切换到 postgres 用户
sudo -i -u postgres
psql
```

```sql
CREATE DATABASE myapp;
CREATE USER myapp_user WITH PASSWORD 'strong_password';
ALTER ROLE myapp_user SET client_encoding TO 'utf8';
ALTER ROLE myapp_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE myapp_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE myapp TO myapp_user;
\q
```

## HTTPS 配置（Let's Encrypt）

### 1. 安装 Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. 获取证书

```bash
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

### 3. 自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# Certbot 会自动添加 cron 任务
```

### 4. Nginx 配置（自动修改）

```nginx
server {
    listen 443 ssl;
    server_name your_domain.com;

    ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;

    # 其他配置...
}

server {
    listen 80;
    server_name your_domain.com;
    return 301 https://$host$request_uri;
}
```

## 防火墙配置

```bash
# 安装 UFW
sudo apt install ufw -y

# 配置规则
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

## 更新代码流程

```bash
# 1. 拉取最新代码
cd /var/www/myapp
git pull origin main

# 2. 激活虚拟环境
source venv/bin/activate

# 3. 更新依赖
pip install -r requirements.txt

# 4. 数据库迁移（如有）
flask db upgrade

# 5. 收集静态文件（Django）
# python manage.py collectstatic --noinput

# 6. 重启服务
sudo supervisorctl restart myapp
```

## 日志管理

### 1. 日志位置

```
/var/log/nginx/access.log        # Nginx 访问日志
/var/log/nginx/error.log         # Nginx 错误日志
/var/log/gunicorn/access.log     # Gunicorn 访问日志
/var/log/gunicorn/error.log      # Gunicorn 错误日志
/var/log/supervisor/myapp.log    # Supervisor 日志
```

### 2. 查看日志

```bash
# 实时查看
tail -f /var/log/nginx/error.log

# 查看最后 100 行
tail -n 100 /var/log/gunicorn/error.log

# 搜索错误
grep "ERROR" /var/log/supervisor/myapp.log
```

### 3. 日志轮转

```bash
sudo nano /etc/logrotate.d/myapp
```

```
/var/log/gunicorn/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        supervisorctl restart myapp > /dev/null
    endscript
}
```

## 性能优化

### 1. 调整 Worker 数量

```python
# gunicorn_config.py
workers = (2 * cpu_count) + 1  # CPU 密集型
# workers = (4 * cpu_count) + 1  # IO 密集型
```

### 2. 启用 Gzip 压缩

```nginx
# /etc/nginx/nginx.conf
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### 3. 静态文件缓存

```nginx
location /static {
    alias /var/www/myapp/static;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

## 安全加固

### 1. 禁用 root 登录

```bash
sudo nano /etc/ssh/sshd_config
```

```
PermitRootLogin no
PasswordAuthentication no  # 仅允许密钥登录
```

```bash
sudo systemctl restart sshd
```

### 2. 安装 Fail2Ban

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. 定期更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

## 监控

### 1. 系统资源

```bash
# CPU 和内存
top
htop

# 磁盘使用
df -h

# 网络连接
netstat -tunlp
```

### 2. 应用监控

推荐工具：
- **Prometheus + Grafana**：开源监控方案
- **New Relic**：商业 APM 工具
- **Sentry**：错误追踪

## 常见问题

### 1. 502 Bad Gateway

**原因**：Gunicorn 未启动或端口不匹配

**解决**：

```bash
sudo supervisorctl status myapp
netstat -tunlp | grep 8000
```

### 2. 静态文件 404

**原因**：Nginx 路径配置错误

**解决**：检查 `alias` 路径是否正确

### 3. 数据库连接失败

**原因**：数据库未启动或权限不足

**解决**：

```bash
sudo systemctl status mysql
# 检查 .env 中的 DATABASE_URL
```

::: tip 最佳实践
1. 使用非 root 用户运行应用
2. 启用 HTTPS（Let's Encrypt 免费）
3. 配置防火墙（仅开放必要端口）
4. 定期备份数据库和代码
5. 使用环境变量管理敏感配置
6. 设置日志轮转，避免磁盘占满
:::

## 下一步

- **[Docker 容器化](03-docker.md)** - 更现代化的部署方式
- **[CI/CD 自动化](04-cicd.md)** - GitHub Actions 自动部署
- **[Nginx 进阶](05-nginx-advanced.md)** - 负载均衡、缓存优化
