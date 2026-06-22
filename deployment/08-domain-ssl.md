# 域名与 SSL 证书配置

将网站配置 HTTPS，提升安全性和用户信任度。

## 域名基础

### 什么是域名

域名（Domain Name）是网站的地址，如 `example.com`，是 IP 地址的易记形式。

**IP 地址 vs 域名**：

| 类型 | 示例 | 特点 |
|------|------|------|
| IP 地址 | `203.0.113.10` | 难记，服务器变更需通知所有用户 |
| 域名 | `example.com` | 易记，IP 变更时只需修改 DNS |

### 域名层级结构

```
https://blog.example.com
       |    |       |
       |    |       └─ 顶级域名（TLD）
       |    └───────── 二级域名
       └────────────── 三级域名（子域名）
```

**示例**：

- **顶级域名**：`.com`、`.cn`、`.org`、`.net`
- **二级域名**：`example.com`、`google.com`
- **三级域名（子域名）**：`blog.example.com`、`api.example.com`

### 域名购买平台

**国内平台**：
- 阿里云（万网）：https://wanwang.aliyun.com
- 腾讯云：https://dnspod.cloud.tencent.com
- 西部数码：https://www.west.cn

**国外平台**：
- Namecheap：https://www.namecheap.com
- GoDaddy：https://www.godaddy.com
- Cloudflare：https://www.cloudflare.com

**价格参考**（年费）：

| 后缀 | 价格范围 |
|------|---------|
| `.com` | ¥60-80 |
| `.cn` | ¥30-50 |
| `.net` | ¥80-100 |
| `.xyz` | ¥10-30 |

## DNS 解析

### DNS 记录类型

| 记录类型 | 作用 | 示例 |
|---------|------|------|
| **A** | 域名指向 IPv4 地址 | `example.com` → `203.0.113.10` |
| **AAAA** | 域名指向 IPv6 地址 | `example.com` → `2001:db8::1` |
| **CNAME** | 域名别名 | `www.example.com` → `example.com` |
| **MX** | 邮件服务器 | `example.com` → `mail.example.com` |
| **TXT** | 文本记录（验证、SPF） | 域名验证字符串 |
| **NS** | 域名服务器 | 指定 DNS 服务器 |

### 配置 DNS 解析

**场景 1：域名指向服务器 IP**

```
类型：A
主机记录：@（或留空，表示根域名）
记录值：203.0.113.10
TTL：600（10 分钟）
```

**场景 2：配置 www 子域名**

```
类型：CNAME
主机记录：www
记录值：example.com
TTL：600
```

**场景 3：配置子域名（如 API）**

```
类型：A
主机记录：api
记录值：203.0.113.20
TTL：600
```

### DNS 传播时间

- **TTL**（Time To Live）：DNS 记录缓存时间
- **传播时间**：通常 10 分钟 - 48 小时
- **加速传播**：设置较短的 TTL（如 600 秒）

### 验证 DNS 解析

```bash
# 查询 A 记录
nslookup example.com

# 或使用 dig（Linux/macOS）
dig example.com

# 查询特定记录类型
dig example.com CNAME

# Windows 刷新 DNS 缓存
ipconfig /flushdns

# Linux/macOS 刷新 DNS 缓存
sudo systemd-resolve --flush-caches  # Ubuntu/Debian
sudo dscacheutil -flushcache          # macOS
```

### 常见 DNS 配置示例

**完整配置示例**：

| 类型 | 主机记录 | 记录值 | 说明 |
|------|---------|--------|------|
| A | @ | 203.0.113.10 | 根域名 |
| A | www | 203.0.113.10 | www 子域名 |
| A | api | 203.0.113.10 | API 子域名 |
| A | blog | 203.0.113.20 | 博客（独立服务器） |
| CNAME | cdn | cdn.example.com | CDN 加速 |
| MX | @ | mail.example.com | 邮件服务器 |
| TXT | @ | v=spf1 include:_spf.example.com ~all | SPF 记录 |

## SSL/TLS 证书

### HTTPS 原理

**HTTP vs HTTPS**：

| 协议 | 端口 | 加密 | 安全性 | SEO |
|------|------|------|--------|-----|
| HTTP | 80 | ❌ 明文传输 | 低 | 低 |
| HTTPS | 443 | ✅ TLS 加密 | 高 | 高 |

**HTTPS 加密过程**：

```
1. 客户端请求 HTTPS 连接
2. 服务器返回 SSL 证书（包含公钥）
3. 客户端验证证书合法性
4. 客户端生成对称密钥，用公钥加密发送
5. 服务器用私钥解密，获得对称密钥
6. 双方使用对称密钥加密通信
```

### 证书类型

| 类型 | 验证级别 | 价格 | 适用场景 |
|------|---------|------|---------|
| **DV**（域名验证） | 低 | 免费-低价 | 个人网站、博客 |
| **OV**（组织验证） | 中 | 中价 | 企业网站 |
| **EV**（扩展验证） | 高 | 高价 | 金融、电商 |
| **通配符** | - | 较高 | 多个子域名 |

### 证书颁发机构（CA）

**常见 CA**：
- **Let's Encrypt**：免费，自动化，90 天有效期
- **DigiCert**：商业证书，信誉高
- **Sectigo**（原 Comodo）：性价比高
- **阿里云/腾讯云**：国内服务商

**Let's Encrypt 优势**：
- ✅ 完全免费
- ✅ 自动续期
- ✅ 支持通配符证书
- ✅ 被所有主流浏览器信任

## Let's Encrypt 免费证书

### 安装 Certbot

**Ubuntu/Debian**：

```bash
# 安装 Certbot 和 Nginx 插件
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

**CentOS/RHEL 8**：

```bash
# 安装 EPEL 仓库
sudo dnf install epel-release -y

# 安装 Certbot
sudo dnf install certbot python3-certbot-nginx -y
```

**macOS**：

```bash
brew install certbot
```

### 自动获取证书（推荐）

Certbot 会自动修改 Nginx 配置：

```bash
# 为单个域名获取证书
sudo certbot --nginx -d example.com -d www.example.com

# 为多个域名获取证书
sudo certbot --nginx -d example.com -d www.example.com -d api.example.com

# 获取通配符证书（需要 DNS 验证）
sudo certbot certonly --manual --preferred-challenges dns -d example.com -d *.example.com
```

**交互式提示**：

```
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Enter email address (used for urgent renewal and security notices):
 > your@email.com

Please read the Terms of Service at https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf
Do you agree? (Y)es/(N)o:
 > Y

Would you be willing to share your email address with the Electronic Frontier Foundation?
 > N

Which names would you like to activate HTTPS for?
1: example.com
2: www.example.com
Select the appropriate numbers separated by commas and/or spaces:
 > 1,2

Obtaining a new certificate
Deploying Certificate to VirtualHost /etc/nginx/sites-enabled/example.com

Please choose whether or not to redirect HTTP traffic to HTTPS:
1: No redirect
2: Redirect - Make all requests redirect to secure HTTPS access
Select the appropriate number [1-2]:
 > 2

Congratulations! You have successfully enabled https://example.com
```

### 手动获取证书

只获取证书，不修改 Nginx 配置：

```bash
# 仅获取证书
sudo certbot certonly --nginx -d example.com -d www.example.com
```

证书文件位置：

```
/etc/letsencrypt/live/example.com/
├── fullchain.pem    # 完整证书链（Nginx 使用）
├── privkey.pem      # 私钥（Nginx 使用）
├── cert.pem         # 证书
└── chain.pem        # 中间证书
```

### 证书自动续期

Let's Encrypt 证书有效期 **90 天**，需定期续期。

**测试续期**：

```bash
# 模拟续期（不实际执行）
sudo certbot renew --dry-run
```

**自动续期配置**：

```bash
# Certbot 自动创建了 systemd timer
sudo systemctl list-timers | grep certbot

# 查看自动续期配置
sudo cat /etc/cron.d/certbot
# 或
sudo systemctl cat certbot.timer
```

**手动续期**：

```bash
# 续期所有即将过期的证书
sudo certbot renew

# 续期后重载 Nginx
sudo certbot renew --deploy-hook "systemctl reload nginx"
```

## Nginx HTTPS 配置

### 基础 HTTPS 配置

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    
    # HTTP 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    # SSL 证书路径
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 网站配置
    root /var/www/example.com;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### SSL 参数优化

**推荐配置**（安全性高）：

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    # 证书
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # 协议版本（禁用 TLS 1.0 和 1.1）
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # 加密套件
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # Session 缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # OCSP Stapling（在线证书状态协议）
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 网站内容
    location / {
        root /var/www/example.com;
        index index.html;
    }
}
```

### HTTP 重定向 HTTPS

**方式 1：301 永久重定向**（推荐）

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}
```

**方式 2：rewrite 重定向**

```nginx
server {
    listen 80;
    server_name example.com;
    rewrite ^(.*)$ https://$host$1 permanent;
}
```

**方式 3：if 判断重定向**（不推荐，性能较差）

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name example.com;
    
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
}
```

### HSTS 配置

**HSTS**（HTTP Strict Transport Security）强制浏览器使用 HTTPS：

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    # HSTS（有效期 1 年）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # 其他安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**HSTS 参数说明**：
- `max-age=31536000`：1 年有效期
- `includeSubDomains`：包含所有子域名
- `preload`：加入 HSTS 预加载列表

## 实战案例

### 案例 1：单域名 HTTPS 配置

**场景**：为 `example.com` 配置 HTTPS

**步骤**：

```bash
# 1. 配置 DNS 解析
# 在域名服务商添加 A 记录：example.com → 服务器 IP

# 2. 创建 Nginx 配置（HTTP）
sudo tee /etc/nginx/sites-available/example.com > /dev/null <<'EOF'
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example.com;
    index index.html;
}
EOF

# 3. 启用站点
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 4. 获取 SSL 证书
sudo certbot --nginx -d example.com -d www.example.com

# 5. 验证 HTTPS
curl -I https://example.com
```

### 案例 2：多域名配置

**场景**：主站 + API + 管理后台

```nginx
# 主站
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    root /var/www/example.com;
    index index.html;
}

# API
server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }
}

# 管理后台
server {
    listen 443 ssl http2;
    server_name admin.example.com;
    
    ssl_certificate /etc/letsencrypt/live/admin.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.example.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
    }
}
```

### 案例 3：通配符证书

**场景**：所有子域名使用同一证书

```bash
# 获取通配符证书（需要 DNS 验证）
sudo certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d example.com \
  -d *.example.com

# 按提示添加 TXT 记录到 DNS
# 记录类型：TXT
# 主机记录：_acme-challenge
# 记录值：（Certbot 提供的随机字符串）

# 验证 DNS 记录
dig _acme-challenge.example.com TXT

# 继续完成验证
```

**Nginx 配置**：

```nginx
server {
    listen 443 ssl http2;
    server_name *.example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # 根据子域名路由
    location / {
        if ($host = api.example.com) {
            proxy_pass http://127.0.0.1:8000;
        }
        if ($host = blog.example.com) {
            proxy_pass http://127.0.0.1:8080;
        }
    }
}
```

### 案例 4：完整部署流程

**完整脚本**：

```bash
#!/bin/bash

DOMAIN="example.com"
EMAIL="admin@example.com"
WEB_ROOT="/var/www/${DOMAIN}"

# 1. 创建网站目录
sudo mkdir -p $WEB_ROOT
sudo chown -R $USER:$USER $WEB_ROOT

# 2. 创建测试页面
cat > $WEB_ROOT/index.html <<EOF
<!DOCTYPE html>
<html>
<head><title>Welcome</title></head>
<body><h1>Hello, HTTPS!</h1></body>
</html>
EOF

# 3. 创建 Nginx 配置
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $WEB_ROOT;
    index index.html;
}
EOF

# 4. 启用站点
sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5. 获取 SSL 证书
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect

# 6. 验证
echo "Testing HTTPS..."
curl -I https://$DOMAIN

echo "Done! Visit https://$DOMAIN"
```

## 常见问题

### 问题 1：证书过期

**症状**：浏览器提示"您的连接不是私密连接"

**原因**：证书已过期（90 天有效期）

**解决方案**：

```bash
# 1. 检查证书到期时间
sudo certbot certificates

# 2. 手动续期
sudo certbot renew

# 3. 重载 Nginx
sudo systemctl reload nginx

# 4. 检查自动续期是否正常
sudo systemctl status certbot.timer
```

### 问题 2：证书不被信任

**症状**：浏览器提示"证书无效"

**原因**：
1. 证书路径错误
2. 缺少中间证书
3. 域名不匹配

**解决方案**：

```bash
# 1. 检查证书路径
ls -la /etc/letsencrypt/live/example.com/

# 2. 使用 fullchain.pem（包含中间证书）
ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;

# 3. 验证证书
openssl s_client -connect example.com:443 -servername example.com

# 4. 测试 SSL 配置
sudo nginx -t
```

### 问题 3：混合内容警告

**症状**：HTTPS 页面中包含 HTTP 资源

**原因**：页面中引用了 HTTP 的 CSS/JS/图片

**解决方案**：

```html
<!-- ❌ 错误：使用 HTTP -->
<script src="http://example.com/app.js"></script>
<img src="http://cdn.example.com/logo.png">

<!-- ✅ 正确：使用 HTTPS -->
<script src="https://example.com/app.js"></script>
<img src="https://cdn.example.com/logo.png">

<!-- ✅ 推荐：协议相对 URL -->
<script src="//example.com/app.js"></script>
```

### 问题 4：Certbot 获取证书失败

**错误信息**：`Challenge failed for domain example.com`

**原因**：
1. DNS 未生效
2. 防火墙拦截 80 端口
3. Nginx 未监听 80 端口

**解决方案**：

```bash
# 1. 验证 DNS 解析
nslookup example.com

# 2. 检查防火墙
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 3. 检查 Nginx 监听
sudo netstat -tulnp | grep :80

# 4. 查看详细错误日志
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# 5. 手动验证（standalone 模式）
sudo systemctl stop nginx
sudo certbot certonly --standalone -d example.com
sudo systemctl start nginx
```

## 易错点

### 易错点 1：DNS 未生效就获取证书

❌ **错误流程**：

```bash
# 刚配置完 DNS，立即获取证书
sudo certbot --nginx -d example.com
# 失败：DNS 未传播完成
```

✅ **正确流程**：

```bash
# 1. 配置 DNS
# 2. 等待 DNS 生效（10 分钟 - 48 小时）
nslookup example.com  # 验证解析

# 3. 确认解析正确后再获取证书
sudo certbot --nginx -d example.com
```

### 易错点 2：证书路径使用 cert.pem

❌ **错误配置**：

```nginx
ssl_certificate /etc/letsencrypt/live/example.com/cert.pem;  # 缺少中间证书
```

✅ **正确配置**：

```nginx
ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;  # 完整证书链
ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
```

### 易错点 3：忘记配置 HTTP 重定向

❌ **问题**：

```nginx
# 只配置了 HTTPS，HTTP 无法访问
server {
    listen 443 ssl;
    server_name example.com;
    # ...
}
```

✅ **正确配置**：

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    # ...
}
```

### 易错点 4：防火墙未开放 443 端口

❌ **症状**：证书配置正确但 HTTPS 无法访问

```bash
# 只开放了 80 端口
sudo ufw allow 80/tcp
```

✅ **解决方案**：

```bash
# 开放 HTTPS 端口
sudo ufw allow 443/tcp

# 或直接允许 Nginx
sudo ufw allow 'Nginx Full'

# 验证
sudo ufw status
```

## 练习题

### 基础练习

**练习 1**：购买域名并配置 DNS 解析

要求：
- 购买一个域名（或使用免费域名服务，如 Freenom）
- 配置 A 记录指向你的服务器
- 使用 `nslookup` 验证解析成功

**练习 2**：为网站配置 HTTPS

要求：
- 使用 Certbot 获取 Let's Encrypt 证书
- 配置 Nginx HTTPS
- 配置 HTTP 自动重定向到 HTTPS
- 在浏览器中验证证书有效

### 进阶练习

**练习 3**：配置子域名

要求：
- 配置 3 个子域名：`www`、`api`、`admin`
- 为每个子域名获取独立证书
- 配置不同的后端服务
- 验证所有子域名都可以通过 HTTPS 访问

**练习 4**：配置通配符证书

要求：
- 获取通配符证书（`*.example.com`）
- 配置 DNS TXT 记录完成验证
- 配置 Nginx 使用通配符证书
- 测试任意子域名都可以使用 HTTPS

### 挑战练习

**练习 5**：配置 A+ 级 SSL 评分

要求：
- 配置最佳实践的 SSL 参数
- 启用 HSTS
- 配置 OCSP Stapling
- 使用 [SSL Labs](https://www.ssllabs.com/ssltest/) 测试，达到 A+ 评分

**练习 6**：编写自动化部署脚本

要求：
- 编写 shell 脚本自动化部署流程
- 包含：创建站点、配置 Nginx、获取证书、配置 HTTPS
- 支持传入域名参数
- 包含错误处理和回滚机制

## 费曼学习法检验

尝试用自己的话回答以下问题：

### 基本概念
1. 什么是域名？域名和 IP 地址的关系是什么？
2. DNS 的 A 记录和 CNAME 记录有什么区别？
3. 为什么 HTTPS 比 HTTP 更安全？

### DNS 配置
4. 如何配置一个子域名指向不同的服务器？
5. DNS 的 TTL 值代表什么？如何影响解析速度？
6. 如何验证 DNS 解析是否生效？

### SSL 证书
7. Let's Encrypt 证书的有效期是多久？如何续期？
8. DV、OV、EV 证书有什么区别？
9. 什么是通配符证书？如何获取？

### Nginx 配置
10. 如何在 Nginx 中配置 HTTPS？
11. `fullchain.pem` 和 `cert.pem` 有什么区别？
12. 如何配置 HTTP 自动重定向到 HTTPS？

### 问题排查
13. 如果证书过期了，如何处理？
14. 什么是混合内容警告？如何解决？
15. 为什么 Certbot 获取证书失败？可能的原因有哪些？

## 总结

### 快速参考

**获取证书命令**：

```bash
# 自动配置
sudo certbot --nginx -d example.com -d www.example.com

# 仅获取证书
sudo certbot certonly --nginx -d example.com

# 续期
sudo certbot renew
```

**基础 HTTPS 配置**：

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    
    root /var/www/example.com;
    index index.html;
}
```

### 部署检查清单

- [ ] 域名已购买并实名认证
- [ ] DNS A 记录配置正确
- [ ] DNS 解析已生效（nslookup 验证）
- [ ] Nginx 已安装并配置 HTTP 站点
- [ ] 防火墙开放 80 和 443 端口
- [ ] Certbot 已安装
- [ ] SSL 证书获取成功
- [ ] Nginx 配置 HTTPS 正确
- [ ] HTTP 重定向到 HTTPS
- [ ] 浏览器验证证书有效
- [ ] 自动续期已配置

### 最佳实践

1. **域名选择**：选择简短、易记、有意义的域名
2. **DNS 配置**：使用国内 DNS（如 DNSPod）提高解析速度
3. **证书选择**：个人项目使用 Let's Encrypt 免费证书
4. **安全配置**：禁用 TLS 1.0/1.1，启用 HSTS
5. **自动续期**：配置定时任务，避免证书过期
6. **备份证书**：定期备份证书和私钥
7. **监控到期**：设置证书到期提醒
8. **性能优化**：启用 HTTP/2、Session 缓存

### 下一步学习

- ✅ 掌握域名和 DNS 配置
- ✅ 掌握 Let's Encrypt 证书获取
- ✅ 掌握 Nginx HTTPS 配置
- ⏭️ 学习 CDN 加速
- ⏭️ 学习证书监控和告警
- ⏭️ 学习多证书管理
