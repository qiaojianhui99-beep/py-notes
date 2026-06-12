# 监控与日志管理

生产环境的应用监控、日志收集和性能分析。

## 应用监控

### 系统资源监控

#### 使用 htop

```bash
# 安装
sudo apt install htop

# 运行
htop

# 查看 CPU、内存、进程
```

#### 使用 Prometheus + Grafana

**安装 Prometheus**：

```bash
# 下载
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*

# 配置 prometheus.yml
scrape_configs:
  - job_name: 'python_app'
    static_configs:
      - targets: ['localhost:8000']

# 启动
./prometheus --config.file=prometheus.yml
```

**Python 应用集成**：

```bash
pip install prometheus-client
```

```python
from flask import Flask
from prometheus_client import Counter, Histogram, generate_latest

app = Flask(__name__)

# 定义指标
REQUEST_COUNT = Counter('app_requests_total', 'Total requests')
REQUEST_DURATION = Histogram('app_request_duration_seconds', 'Request duration')

@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    REQUEST_COUNT.inc()
    duration = time.time() - request.start_time
    REQUEST_DURATION.observe(duration)
    return response

@app.route('/metrics')
def metrics():
    return generate_latest()
```

### APM 工具

#### New Relic

```bash
pip install newrelic
newrelic-admin generate-config YOUR_LICENSE_KEY newrelic.ini
```

启动应用：

```bash
NEW_RELIC_CONFIG_FILE=newrelic.ini newrelic-admin run-program gunicorn app:app
```

#### Sentry（错误追踪）

```bash
pip install sentry-sdk
```

```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0
)

app = Flask(__name__)

@app.route('/')
def index():
    1 / 0  # 错误会自动上报到 Sentry
```

## 日志管理

### Python logging 配置

```python
import logging
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler

# 基础配置
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

# 轮转日志（按大小）
handler = RotatingFileHandler('app.log', maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))

# 轮转日志（按时间）
handler = TimedRotatingFileHandler('app.log', when='midnight', interval=1, backupCount=7)

logger = logging.getLogger(__name__)
logger.addHandler(handler)

# 使用
logger.info('Application started')
logger.error('An error occurred', exc_info=True)
```

### 结构化日志（JSON）

```bash
pip install python-json-logger
```

```python
from pythonjsonlogger import jsonlogger

handler = logging.FileHandler('app.json')
formatter = jsonlogger.JsonFormatter()
handler.setFormatter(formatter)

logger = logging.getLogger()
logger.addHandler(handler)

logger.info('User login', extra={'user_id': 123, 'ip': '192.168.1.1'})
```

输出：

```json
{
  "message": "User login",
  "user_id": 123,
  "ip": "192.168.1.1",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "INFO"
}
```

### 集中式日志收集

#### ELK Stack（Elasticsearch + Logstash + Kibana）

**docker-compose.yml**：

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  es-data:
```

**logstash.conf**：

```
input {
  tcp {
    port => 5000
    codec => json
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "python-app-%{+YYYY.MM.dd}"
  }
}
```

**Python 发送日志到 Logstash**：

```bash
pip install python-logstash
```

```python
import logstash
import logging

logger = logging.getLogger('python-logstash-logger')
logger.setLevel(logging.INFO)
logger.addHandler(logstash.TCPLogstashHandler('localhost', 5000, version=1))

logger.info('User login', extra={'user_id': 123})
```

#### Loki + Grafana

**docker-compose.yml**：

```yaml
version: '3.8'

services:
  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:2.9.0
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml

  grafana:
    image: grafana/grafana:10.2.0
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 性能分析

### cProfile

```python
import cProfile
import pstats

def slow_function():
    total = 0
    for i in range(1000000):
        total += i
    return total

# 分析
profiler = cProfile.Profile()
profiler.enable()
slow_function()
profiler.disable()

# 查看结果
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(10)
```

### memory_profiler

```bash
pip install memory-profiler
```

```python
from memory_profiler import profile

@profile
def slow_function():
    a = [1] * (10 ** 6)
    b = [2] * (2 * 10 ** 7)
    del b
    return a

slow_function()
```

运行：

```bash
python -m memory_profiler script.py
```

### Flask Debug Toolbar

```bash
pip install flask-debugtoolbar
```

```python
from flask import Flask
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

toolbar = DebugToolbarExtension(app)
```

## 健康检查

### 基础健康检查

```python
from flask import Flask, jsonify
import psutil

app = Flask(__name__)

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'cpu_percent': psutil.cpu_percent(),
        'memory_percent': psutil.virtual_memory().percent,
        'disk_percent': psutil.disk_usage('/').percent
    })

@app.route('/readiness')
def readiness():
    # 检查依赖服务
    try:
        db.session.execute('SELECT 1')
        redis_client.ping()
        return jsonify({'status': 'ready'})
    except Exception as e:
        return jsonify({'status': 'not ready', 'error': str(e)}), 503
```

### 数据库连接池监控

```python
from sqlalchemy import event
from sqlalchemy.pool import Pool

@event.listens_for(Pool, "connect")
def receive_connect(dbapi_conn, connection_record):
    logger.info("New database connection created")

@event.listens_for(Pool, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    logger.debug("Connection checked out from pool")
```

## 告警配置

### Prometheus Alertmanager

**alertmanager.yml**：

```yaml
route:
  receiver: 'email'

receivers:
  - name: 'email'
    email_configs:
      - to: 'admin@example.com'
        from: 'alert@example.com'
        smarthost: 'smtp.example.com:587'
        auth_username: 'alert@example.com'
        auth_password: 'password'

  - name: 'wechat'
    wechat_configs:
      - corp_id: 'your_corp_id'
        to_party: 'your_party'
        agent_id: 'your_agent_id'
        api_secret: 'your_api_secret'
```

**告警规则**：

```yaml
groups:
  - name: example
    rules:
      - alert: HighErrorRate
        expr: rate(app_errors_total[5m]) > 0.05
        for: 10m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        annotations:
          summary: "High memory usage"
```

### Python 告警脚本

```python
import requests

def send_alert(title, message):
    # 企业微信
    webhook_url = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY"
    data = {
        "msgtype": "text",
        "text": {
            "content": f"{title}\n{message}"
        }
    }
    requests.post(webhook_url, json=data)

    # Slack
    slack_webhook = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
    data = {
        "text": f"*{title}*\n{message}"
    }
    requests.post(slack_webhook, json=data)

# 使用
if error_rate > threshold:
    send_alert("High Error Rate", f"Current: {error_rate}")
```

## 数据库备份

### MySQL 备份

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mysql"
DB_NAME="myapp"
DB_USER="root"
DB_PASS="password"

# 创建备份
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/$DB_NAME-$DATE.sql

# 压缩
gzip $BACKUP_DIR/$DB_NAME-$DATE.sql

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# 上传到云存储（可选）
# aws s3 cp $BACKUP_DIR/$DB_NAME-$DATE.sql.gz s3://my-backup-bucket/
```

自动化备份（cron）：

```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

### PostgreSQL 备份

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgres"
DB_NAME="myapp"

# 备份
pg_dump -U postgres $DB_NAME > $BACKUP_DIR/$DB_NAME-$DATE.sql

# 压缩
gzip $BACKUP_DIR/$DB_NAME-$DATE.sql
```

### 恢复数据库

```bash
# MySQL
gunzip < backup.sql.gz | mysql -u root -p myapp

# PostgreSQL
gunzip < backup.sql.gz | psql -U postgres myapp
```

## 性能调优

### 数据库查询优化

```python
# 添加索引
from sqlalchemy import Index

Index('idx_user_email', User.email)
Index('idx_post_created', Post.created_at)

# 使用 explain 分析查询
result = db.session.execute(text("EXPLAIN SELECT * FROM posts WHERE author_id = 1"))
print(result.fetchall())
```

### 缓存优化

```python
from functools import lru_cache
import redis

redis_client = redis.Redis()

# LRU 缓存（内存）
@lru_cache(maxsize=128)
def expensive_function(arg):
    # 耗时计算
    return result

# Redis 缓存
def get_user(user_id):
    cache_key = f'user:{user_id}'
    cached = redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    user = User.query.get(user_id)
    redis_client.setex(cache_key, 3600, json.dumps(user))
    return user
```

### 异步任务

```python
from celery import Celery

celery = Celery('tasks', broker='redis://localhost:6379/0')

@celery.task
def send_email(to, subject, body):
    # 异步发送邮件
    pass

# 调用
send_email.delay('user@example.com', 'Hello', 'Email body')
```

::: tip 最佳实践
1. 设置全面的监控指标（CPU、内存、请求量）
2. 使用结构化日志便于分析
3. 配置告警及时发现问题
4. 定期备份数据库
5. 使用 APM 工具追踪性能
6. 健康检查确保服务可用
:::

## 下一步

- **[CI/CD 自动化](04-cicd.md)** - 自动化部署流程
- **[Docker 容器化](03-docker.md)** - 容器化部署
- **[Linux 服务器部署](02-linux-server.md)** - 服务器配置
