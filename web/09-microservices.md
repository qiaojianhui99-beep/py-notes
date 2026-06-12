# 微服务架构

微服务架构将单体应用拆分为多个小型、独立的服务，每个服务专注于单一业务功能。

## 单体 vs 微服务

### 单体架构（Monolithic）

```
┌─────────────────────────────┐
│      单体应用                │
│  ┌─────────────────────┐    │
│  │  用户模块            │    │
│  │  订单模块            │    │
│  │  支付模块            │    │
│  │  库存模块            │    │
│  └─────────────────────┘    │
│         共享数据库           │
└─────────────────────────────┘
```

**问题**：
- ❌ 部署慢（修改一行代码需要重新部署整个应用）
- ❌ 扩展难（无法单独扩展某个模块）
- ❌ 技术栈固定（整个应用必须用同一技术）
- ❌ 故障传播（一个模块崩溃，整个应用挂掉）

### 微服务架构（Microservices）

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│用户服务  │  │订单服务  │  │支付服务  │  │库存服务  │
│FastAPI   │  │Flask     │  │Django    │  │Go        │
│  DB1     │  │  DB2     │  │  DB3     │  │  DB4     │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
      ↓            ↓             ↓             ↓
    ┌────────────────────────────────────────┐
    │         API 网关 / 服务发现             │
    └────────────────────────────────────────┘
```

**优势**：
- ✅ 独立部署（每个服务独立上线）
- ✅ 技术多样性（不同服务可用不同技术）
- ✅ 弹性伸缩（按需扩展特定服务）
- ✅ 故障隔离（一个服务挂了不影响其他）

---

## 核心组件

### 1. 服务拆分原则

按业务能力拆分：

```python
# 用户服务（user-service）
- 用户注册
- 用户登录
- 用户信息管理

# 订单服务（order-service）
- 创建订单
- 查询订单
- 订单状态管理

# 支付服务（payment-service）
- 发起支付
- 支付回调
- 退款处理

# 库存服务（inventory-service）
- 库存查询
- 库存扣减
- 库存预留
```

### 2. 服务间通信

#### REST API（同步）

```python
# 订单服务调用用户服务
import requests

def create_order(user_id, product_id):
    # 验证用户
    user_response = requests.get(f'http://user-service:8001/users/{user_id}')
    if user_response.status_code != 200:
        return {'error': 'User not found'}
    
    # 检查库存
    inventory_response = requests.post(
        'http://inventory-service:8003/reserve',
        json={'product_id': product_id, 'quantity': 1}
    )
    if not inventory_response.json()['success']:
        return {'error': 'Out of stock'}
    
    # 创建订单
    order = Order.create(user_id=user_id, product_id=product_id)
    return {'order_id': order.id}
```

#### 消息队列（异步）

```python
# 使用 RabbitMQ / Redis / Kafka
import pika

# 订单服务：发送消息
def create_order(user_id, product_id):
    order = Order.create(user_id=user_id, product_id=product_id)
    
    # 发送订单创建事件
    connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
    channel = connection.channel()
    channel.queue_declare(queue='order_created')
    
    channel.basic_publish(
        exchange='',
        routing_key='order_created',
        body=json.dumps({'order_id': order.id, 'user_id': user_id})
    )
    connection.close()
    
    return {'order_id': order.id}

# 支付服务：监听消息
def callback(ch, method, properties, body):
    data = json.loads(body)
    order_id = data['order_id']
    # 处理支付逻辑
    process_payment(order_id)

connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
channel = connection.channel()
channel.queue_declare(queue='order_created')
channel.basic_consume(queue='order_created', on_message_callback=callback, auto_ack=True)
channel.start_consuming()
```

### 3. API 网关

```python
# 使用 FastAPI 作为 API 网关
from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI()

SERVICES = {
    'user': 'http://user-service:8001',
    'order': 'http://order-service:8002',
    'payment': 'http://payment-service:8003',
}

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SERVICES['user']}/users/{user_id}")
        return response.json()

@app.post("/api/orders")
async def create_order(user_id: int, product_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SERVICES['order']}/orders",
            json={'user_id': user_id, 'product_id': product_id}
        )
        return response.json()

# 聚合查询
@app.get("/api/user/{user_id}/orders")
async def get_user_orders(user_id: int):
    async with httpx.AsyncClient() as client:
        # 并发请求多个服务
        user_task = client.get(f"{SERVICES['user']}/users/{user_id}")
        orders_task = client.get(f"{SERVICES['order']}/users/{user_id}/orders")
        
        user_response, orders_response = await asyncio.gather(user_task, orders_task)
        
        return {
            'user': user_response.json(),
            'orders': orders_response.json()
        }
```

### 4. 服务发现（Consul）

```python
# 注册服务
import consul

consul_client = consul.Consul(host='consul', port=8500)

# 服务注册
consul_client.agent.service.register(
    name='user-service',
    service_id='user-service-1',
    address='192.168.1.10',
    port=8001,
    check=consul.Check.http('http://192.168.1.10:8001/health', interval='10s')
)

# 服务发现
def get_service_url(service_name):
    services = consul_client.health.service(service_name, passing=True)[1]
    if services:
        service = services[0]['Service']
        return f"http://{service['Address']}:{service['Port']}"
    return None

# 调用服务
user_service_url = get_service_url('user-service')
response = requests.get(f'{user_service_url}/users/123')
```

---

## 实战：电商微服务

### 服务划分

```
┌────────────┐
│ API 网关   │
└─────┬──────┘
      │
  ┌───┴────┬────────┬─────────┐
  ↓        ↓        ↓         ↓
用户服务  订单服务  支付服务  库存服务
```

### 用户服务（Flask）

`user-service/app.py`：

```python
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    email = db.Column(db.String(120))

@app.route('/health')
def health():
    return {'status': 'healthy'}

@app.route('/users/<int:user_id>')
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({'id': user.id, 'username': user.username, 'email': user.email})

@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'id': user.id}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=8001)
```

### 订单服务（FastAPI）

`order-service/main.py`：

```python
from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI()

orders_db = []

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/orders")
async def create_order(user_id: int, product_id: int, quantity: int = 1):
    # 验证用户
    async with httpx.AsyncClient() as client:
        user_response = await client.get(f'http://user-service:8001/users/{user_id}')
        if user_response.status_code != 200:
            raise HTTPException(status_code=404, detail="User not found")
        
        # 检查库存
        inventory_response = await client.post(
            'http://inventory-service:8003/reserve',
            json={'product_id': product_id, 'quantity': quantity}
        )
        if not inventory_response.json()['success']:
            raise HTTPException(status_code=400, detail="Insufficient stock")
    
    order = {
        'id': len(orders_db) + 1,
        'user_id': user_id,
        'product_id': product_id,
        'quantity': quantity,
        'status': 'pending'
    }
    orders_db.append(order)
    
    return order

@app.get("/orders/{order_id}")
def get_order(order_id: int):
    order = next((o for o in orders_db if o['id'] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
```

### Docker Compose 编排

`docker-compose.yml`：

```yaml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8000:8000"
    depends_on:
      - user-service
      - order-service
      - inventory-service

  user-service:
    build: ./user-service
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=sqlite:///users.db

  order-service:
    build: ./order-service
    ports:
      - "8002:8002"
    depends_on:
      - user-service
      - inventory-service

  inventory-service:
    build: ./inventory-service
    ports:
      - "8003:8003"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  consul:
    image: consul:latest
    ports:
      - "8500:8500"
```

---

## 分布式事务（Saga 模式）

```python
# 订单创建 Saga
class OrderSaga:
    def __init__(self, user_id, product_id):
        self.user_id = user_id
        self.product_id = product_id
        self.order_id = None
        self.payment_id = None
    
    async def execute(self):
        try:
            # 1. 创建订单
            self.order_id = await self.create_order()
            
            # 2. 预留库存
            await self.reserve_inventory()
            
            # 3. 处理支付
            self.payment_id = await self.process_payment()
            
            # 4. 确认订单
            await self.confirm_order()
            
            return {'success': True, 'order_id': self.order_id}
        
        except Exception as e:
            # 补偿操作（回滚）
            await self.compensate()
            return {'success': False, 'error': str(e)}
    
    async def compensate(self):
        if self.payment_id:
            await self.cancel_payment(self.payment_id)
        if self.order_id:
            await self.cancel_order(self.order_id)
        await self.release_inventory()
```

---

## 监控与日志

### 分布式追踪（OpenTelemetry）

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor

# 配置追踪
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

@app.post("/orders")
async def create_order(user_id: int, product_id: int):
    with tracer.start_as_current_span("create_order"):
        # 业务逻辑
        with tracer.start_as_current_span("validate_user"):
            user = await validate_user(user_id)
        
        with tracer.start_as_current_span("reserve_inventory"):
            inventory = await reserve_inventory(product_id)
        
        return {"order_id": order_id}
```

### 集中式日志

```python
import logging
import json

logger = logging.getLogger(__name__)

# 结构化日志
def log_event(event_type, **kwargs):
    log_data = {
        'service': 'order-service',
        'event': event_type,
        'timestamp': datetime.now().isoformat(),
        **kwargs
    }
    logger.info(json.dumps(log_data))

# 使用
log_event('order_created', order_id=123, user_id=456)
```

---

## 最佳实践

### 1. 每个服务独立数据库

```
✅ 正确
用户服务 → users_db
订单服务 → orders_db

❌ 错误
用户服务 ↘
          → shared_db
订单服务 ↗
```

### 2. 服务无状态

```python
# ✅ 无状态（推荐）
@app.get("/orders/{order_id}")
def get_order(order_id: int):
    order = db.query(Order).get(order_id)
    return order

# ❌ 有状态
cache = {}  # 内存状态

@app.get("/orders/{order_id}")
def get_order(order_id: int):
    if order_id in cache:
        return cache[order_id]
    # ...
```

### 3. 熔断器（Circuit Breaker）

```python
from pybreaker import CircuitBreaker

breaker = CircuitBreaker(fail_max=5, timeout_duration=60)

@breaker
def call_external_service():
    response = requests.get('http://external-service/api')
    return response.json()
```

### 4. 限流

```python
from flask_limiter import Limiter

limiter = Limiter(app, key_func=lambda: request.remote_addr)

@app.route('/api/orders')
@limiter.limit("10 per minute")
def create_order():
    pass
```

---

## 何时使用微服务

### ✅ 适合微服务

- 大型团队（>50 人）
- 复杂业务领域
- 不同模块扩展需求差异大
- 需要技术多样性
- 高可用要求

### ❌ 不适合微服务

- 小团队（<5 人）
- 简单业务
- 创业初期
- 开发资源有限
- 单体应用性能足够

---

## 常见挑战

| 挑战 | 解决方案 |
|------|---------|
| 服务间通信复杂 | API 网关、服务网格（Istio） |
| 分布式事务 | Saga 模式、最终一致性 |
| 数据一致性 | 事件溯源、CQRS |
| 服务发现 | Consul、Eureka、K8s Service |
| 监控困难 | 分布式追踪（Jaeger、Zipkin） |
| 部署复杂 | Docker、Kubernetes |

::: tip 最佳实践
1. 从单体开始，按需拆分
2. 服务边界清晰
3. 异步通信为主
4. 完善的监控和日志
5. 自动化测试和部署
:::

## 下一步

- **[Docker 容器化](../deployment/03-docker.md)** - 微服务容器化
- **[Kubernetes 入门](../deployment/07-kubernetes.md)** - 微服务编排
- **[RESTful API 设计](../web/07-restful-api.md)** - 服务间接口设计
