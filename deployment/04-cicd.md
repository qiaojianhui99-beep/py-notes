# CI/CD 自动化部署

使用 GitHub Actions 实现自动化测试、构建和部署。

## CI/CD 概述

### 持续集成（CI - Continuous Integration）

- 自动运行测试
- 代码质量检查
- 构建镜像

### 持续部署（CD - Continuous Deployment）

- 自动部署到服务器
- 推送 Docker 镜像
- 更新生产环境

## GitHub Actions 基础

### 工作流文件位置

```
.github/
└── workflows/
    ├── test.yml       # 测试工作流
    ├── deploy.yml     # 部署工作流
    └── docker.yml     # Docker 构建工作流
```

### 基本语法

```yaml
name: CI/CD Pipeline      # 工作流名称

on:                        # 触发条件
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:                      # 任务
  test:                    # 任务名
    runs-on: ubuntu-latest # 运行环境
    steps:                 # 步骤
      - name: Checkout     # 步骤名
        uses: actions/checkout@v3
```

## 自动化测试

### .github/workflows/test.yml

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        python-version: ['3.11', '3.12', '3.13']
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      
      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov flake8
      
      - name: Lint with flake8
        run: |
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
          flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
      
      - name: Run tests
        run: |
          pytest --cov=. --cov-report=xml --cov-report=term
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage.xml
          flags: unittests
          name: codecov-umbrella
```

## Docker 镜像构建

### .github/workflows/docker.yml

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]
    tags:
      - 'v*.*.*'

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## 部署到服务器（SSH）

### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/myapp
            git pull origin main
            source venv/bin/activate
            pip install -r requirements.txt
            sudo supervisorctl restart myapp
```

### 配置 Secrets

在 GitHub 仓库中配置：

1. **Settings** → **Secrets and variables** → **Actions**
2. 添加以下 Secrets：
   - `SERVER_HOST`：服务器 IP
   - `SERVER_USER`：SSH 用户名
   - `SSH_PRIVATE_KEY`：SSH 私钥

生成 SSH 密钥：

```bash
ssh-keygen -t ed25519 -C "github-actions"
cat ~/.ssh/id_ed25519.pub  # 复制公钥到服务器 ~/.ssh/authorized_keys
cat ~/.ssh/id_ed25519      # 复制私钥到 GitHub Secrets
```

## Docker Compose 部署

```yaml
name: Deploy with Docker Compose

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Copy files to server
        uses: appleboy/scp-action@v0.1.4
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "docker-compose.yml,.env.production"
          target: "/var/www/myapp"
      
      - name: Deploy with Docker Compose
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/myapp
            mv .env.production .env
            docker compose pull
            docker compose up -d
            docker compose logs --tail=50
```

## 多环境部署

### .github/workflows/deploy-env.yml

```yaml
name: Deploy to Environment

on:
  push:
    branches:
      - develop    # 部署到测试环境
      - main       # 部署到生产环境

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set environment
        id: set-env
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "environment=production" >> $GITHUB_OUTPUT
            echo "server_host=${{ secrets.PROD_SERVER_HOST }}" >> $GITHUB_OUTPUT
          else
            echo "environment=staging" >> $GITHUB_OUTPUT
            echo "server_host=${{ secrets.STAGING_SERVER_HOST }}" >> $GITHUB_OUTPUT
          fi
      
      - name: Deploy to ${{ steps.set-env.outputs.environment }}
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ steps.set-env.outputs.server_host }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/myapp
            git pull origin ${{ github.ref_name }}
            docker compose -f docker-compose.${{ steps.set-env.outputs.environment }}.yml up -d
```

## 数据库迁移

```yaml
name: Database Migration

on:
  workflow_dispatch:  # 手动触发

jobs:
  migrate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run migrations
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/myapp
            source venv/bin/activate
            flask db upgrade
```

## 蓝绿部署

```yaml
name: Blue-Green Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to green environment
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            # 部署到 green 环境
            cd /var/www/myapp-green
            git pull origin main
            docker compose up -d
            
            # 健康检查
            for i in {1..30}; do
              if curl -f http://localhost:8001/health; then
                echo "Green environment is healthy"
                break
              fi
              sleep 2
            done
            
            # 切换流量（更新 Nginx 配置）
            sudo cp /etc/nginx/sites-available/myapp-green /etc/nginx/sites-enabled/myapp
            sudo nginx -t && sudo systemctl reload nginx
            
            # 停止 blue 环境
            cd /var/www/myapp-blue
            docker compose down
```

## 通知

### Slack 通知

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

### 企业微信通知

```yaml
- name: Notify WeChat Work
  if: always()
  run: |
    curl "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${{ secrets.WECHAT_WEBHOOK }}" \
      -H 'Content-Type: application/json' \
      -d '{
        "msgtype": "text",
        "text": {
          "content": "部署状态: ${{ job.status }}\n分支: ${{ github.ref_name }}\n提交: ${{ github.sha }}"
        }
      }'
```

## 回滚策略

### .github/workflows/rollback.yml

```yaml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    
    steps:
      - name: Rollback to version ${{ inputs.version }}
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/myapp
            git fetch --all --tags
            git checkout tags/${{ inputs.version }}
            docker compose pull
            docker compose up -d
```

## 性能测试

```yaml
name: Performance Test

on:
  push:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run load test
        run: |
          pip install locust
          locust -f locustfile.py --headless -u 100 -r 10 --run-time 1m --host https://myapp.com
```

## 安全扫描

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # 每周日运行

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

## 完整 CI/CD 流程

### .github/workflows/main.yml

```yaml
name: Complete CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.13'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      - name: Run tests
        run: pytest --cov
  
  build:
    needs: test
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/myapp
            docker compose pull
            docker compose up -d
      
      - name: Notify deployment
        run: echo "Deployment successful!"
```

## 最佳实践

### 1. 缓存依赖

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
```

### 2. 矩阵测试

```yaml
strategy:
  matrix:
    python-version: ['3.11', '3.12', '3.13']
    os: [ubuntu-latest, macos-latest, windows-latest]
```

### 3. 条件执行

```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: ./deploy.sh
```

### 4. 超时设置

```yaml
jobs:
  deploy:
    timeout-minutes: 10
    steps:
      - name: Deploy
        timeout-minutes: 5
        run: ./deploy.sh
```

::: tip 最佳实践
1. 测试通过后再部署
2. 使用 Secrets 管理敏感信息
3. 启用分支保护规则
4. 配置部署通知
5. 定期运行安全扫描
6. 保留部署历史，便于回滚
:::

## 下一步

- **[监控与日志](05-monitoring.md)** - 应用监控和日志管理
- **[Docker 容器化](03-docker.md)** - 容器化部署
