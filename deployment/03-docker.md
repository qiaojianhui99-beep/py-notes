# Docker 容器化部署

使用 Docker 将 Python 应用容器化，实现一致的开发和生产环境。

## Docker 简介

### 核心概念

- **镜像（Image）**：应用及其依赖的只读模板
- **容器（Container）**：镜像的运行实例
- **Dockerfile**：构建镜像的配置文件
- **Docker Compose**：多容器编排工具

### 优势

✅ 环境一致性（开发、测试、生产）  
✅ 快速部署和扩展  
✅ 资源隔离  
✅ 版本控制（镜像打标签）  

## 安装 Docker

### Linux（Ubuntu）

```bash
# 更新包索引
sudo apt update

# 安装依赖
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# 添加 Docker GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证
docker --version
docker compose version
```

### 非 root 用户运行

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### macOS / Windows

下载安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Flask 应用容器化

### 1. 项目结构

```
myapp/
├── app.py
├── requirements.txt
├── Dockerfile
├── .dockerignore
└── static/
```

### 2. Dockerfile

```dockerfile
# 使用官方 Python 镜像
FROM python:3.13-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖（可选）
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### 3. .dockerignore

```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.env
.git
.gitignore
.dockerignore
Dockerfile
docker-compose.yml
*.log
```

### 4. requirements.txt

```txt
flask==3.0.0
gunicorn==21.2.0
python-dotenv==1.0.0
```

### 5. 构建镜像

```bash
docker build -t myapp:latest .
```

参数说明：
- `-t myapp:latest`：镜像名称和标签
- `.`：Dockerfile 所在目录

### 6. 运行容器

```bash
docker run -d -p 8000:5000 --name myapp-container myapp:latest
```

参数说明：
- `-d`：后台运行
- `-p 8000:5000`：端口映射（宿主机:容器）
- `--name`：容器名称

### 7. 查看容器

```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 查看日志
docker logs myapp-container

# 实时日志
docker logs -f myapp-container
```

## 多阶段构建（优化镜像大小）

```dockerfile
# 构建阶段
FROM python:3.13 AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# 运行阶段
FROM python:3.13-slim

WORKDIR /app

# 复制依赖
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# 复制应用
COPY . .

EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

**效果**：镜像大小从 1GB+ 降至 200MB 左右

## 环境变量

### 方式 1：运行时传递

```bash
docker run -d \
  -p 8000:5000 \
  -e FLASK_ENV=production \
  -e SECRET_KEY=my-secret-key \
  -e DATABASE_URL=mysql://user:pass@db/myapp \
  myapp:latest
```

### 方式 2：环境变量文件

**.env**：

```
FLASK_ENV=production
SECRET_KEY=my-secret-key
DATABASE_URL=mysql://user:pass@db/myapp
```

```bash
docker run -d -p 8000:5000 --env-file .env myapp:latest
```

## 数据持久化（Volume）

### 挂载卷

```bash
docker run -d \
  -p 8000:5000 \
  -v $(pwd)/data:/app/data \
  myapp:latest
```

### 命名卷

```bash
# 创建卷
docker volume create myapp-data

# 使用卷
docker run -d \
  -p 8000:5000 \
  -v myapp-data:/app/data \
  myapp:latest
```

## Docker Compose

### 1. docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=mysql://root:password@db/myapp
    depends_on:
      - db
      - redis
    volumes:
      - ./data:/app/data
    restart: always

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: myapp
    volumes:
      - db-data:/var/lib/mysql
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - web
    restart: always

volumes:
  db-data:
```

### 2. nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream web {
        server web:5000;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### 3. 启动服务

```bash
# 启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f web

# 停止服务
docker compose down

# 停止并删除卷
docker compose down -v
```

## FastAPI 应用容器化

### Dockerfile

```dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db/myapp
    depends_on:
      - db
    restart: always

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: always

volumes:
  postgres-data:
```

## 常用命令

### 镜像管理

```bash
# 查看镜像
docker images

# 删除镜像
docker rmi myapp:latest

# 清理悬空镜像
docker image prune

# 导出镜像
docker save -o myapp.tar myapp:latest

# 导入镜像
docker load -i myapp.tar
```

### 容器管理

```bash
# 停止容器
docker stop myapp-container

# 启动容器
docker start myapp-container

# 重启容器
docker restart myapp-container

# 删除容器
docker rm myapp-container

# 进入容器
docker exec -it myapp-container bash

# 查看容器资源使用
docker stats myapp-container
```

### 网络管理

```bash
# 查看网络
docker network ls

# 创建网络
docker network create myapp-network

# 连接容器到网络
docker network connect myapp-network myapp-container
```

## 镜像仓库

### Docker Hub

```bash
# 登录
docker login

# 打标签
docker tag myapp:latest username/myapp:latest

# 推送
docker push username/myapp:latest

# 拉取
docker pull username/myapp:latest
```

### 私有仓库（Harbor）

```bash
# 打标签
docker tag myapp:latest registry.example.com/myapp:latest

# 登录
docker login registry.example.com

# 推送
docker push registry.example.com/myapp:latest
```

## 健康检查

```dockerfile
FROM python:3.13-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

**Flask 健康检查端点**：

```python
@app.route('/health')
def health():
    return {'status': 'healthy'}, 200
```

## 日志管理

### 查看日志

```bash
# 查看最近日志
docker logs myapp-container

# 实时查看
docker logs -f myapp-container

# 最近 100 行
docker logs --tail 100 myapp-container
```

### 日志驱动

```bash
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myapp:latest
```

## 安全最佳实践

### 1. 使用非 root 用户

```dockerfile
FROM python:3.13-slim

RUN useradd -m -u 1000 appuser

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### 2. 扫描漏洞

```bash
# 使用 Trivy 扫描
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image myapp:latest
```

### 3. 使用 .dockerignore

避免将敏感文件打包到镜像中：

```
.env
.git
*.log
*.pyc
__pycache__
```

## 性能优化

### 1. 减少层数

```dockerfile
# ❌ 多层
RUN apt-get update
RUN apt-get install -y gcc
RUN apt-get clean

# ✅ 单层
RUN apt-get update && apt-get install -y gcc && apt-get clean
```

### 2. 利用缓存

```dockerfile
# 先复制 requirements.txt（依赖变化少）
COPY requirements.txt .
RUN pip install -r requirements.txt

# 再复制代码（变化频繁）
COPY . .
```

### 3. 使用轻量基础镜像

```dockerfile
# 完整版（~900MB）
FROM python:3.13

# 轻量版（~150MB）
FROM python:3.13-slim

# 超轻量（~50MB，需手动安装 Python）
FROM alpine:latest
```

::: tip 最佳实践
1. 使用多阶段构建减小镜像体积
2. 合理使用 .dockerignore
3. 启用健康检查
4. 配置日志轮转
5. 使用 Docker Compose 管理多容器应用
6. 定期更新基础镜像
:::

## 下一步

- **[CI/CD 自动化](04-cicd.md)** - GitHub Actions 自动构建和部署
- **[Kubernetes 编排](06-kubernetes.md)** - 大规模容器编排
