# Redis 缓存

Redis 是高性能的内存数据库，常用于缓存、会话存储、消息队列、排行榜等场景。

## 特点

- **内存存储**：读写速度极快（10 万+ QPS）
- **数据结构丰富**：String、Hash、List、Set、Sorted Set
- **持久化支持**：RDB 快照和 AOF 日志
- **原子操作**：保证并发安全
- **过期机制**：自动清理过期数据

## 安装

### 安装 Redis 服务

```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Windows
# 下载 Redis for Windows 或使用 WSL
```

### 安装 Python 客户端

```bash
pip install redis
```

## 基本使用

### 连接 Redis

```python
import redis

# 方式一：直接连接
client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,                # 数据库编号（0-15）
    password=None,       # 密码
    decode_responses=True  # 自动解码为字符串
)

# 方式二：使用 URL
client = redis.from_url('redis://localhost:6379/0')

# 测试连接
client.ping()  # 返回 True 表示成功
```

### 连接池

```python
import redis

# 创建连接池
pool = redis.ConnectionPool(
    host='localhost',
    port=6379,
    db=0,
    max_connections=10,
    decode_responses=True
)

# 从池中获取连接
client = redis.Redis(connection_pool=pool)
```

## 五种数据类型

### 1. String（字符串）

```python
# 设置值
client.set('name', '张三')
client.set('age', 25)

# 获取值
name = client.get('name')  # '张三'
age = client.get('age')    # '25'（字符串类型）

# 设置过期时间（秒）
client.setex('session:123', 3600, 'token_value')

# 设置过期时间（毫秒）
client.psetex('temp', 500, 'value')

# 批量操作
client.mset({'key1': 'value1', 'key2': 'value2'})
values = client.mget(['key1', 'key2'])  # ['value1', 'value2']

# 自增/自减
client.set('counter', 0)
client.incr('counter')     # 1
client.incrby('counter', 5)  # 6
client.decr('counter')     # 5

# 追加字符串
client.append('name', '同学')  # '张三同学'
```

### 2. Hash（哈希）

```python
# 设置字段
client.hset('user:1', 'name', '张三')
client.hset('user:1', 'age', 25)

# 批量设置
client.hset('user:1', mapping={'email': 'zhangsan@example.com', 'city': '北京'})

# 获取字段
name = client.hget('user:1', 'name')  # '张三'

# 获取所有字段
user = client.hgetall('user:1')
# {'name': '张三', 'age': '25', 'email': 'zhangsan@example.com', 'city': '北京'}

# 获取多个字段
values = client.hmget('user:1', ['name', 'age'])  # ['张三', '25']

# 检查字段是否存在
exists = client.hexists('user:1', 'name')  # True

# 删除字段
client.hdel('user:1', 'city')

# 字段自增
client.hincrby('user:1', 'age', 1)  # 26
```

### 3. List（列表）

```python
# 左侧插入
client.lpush('tasks', 'task1', 'task2', 'task3')

# 右侧插入
client.rpush('logs', 'log1', 'log2')

# 左侧弹出
task = client.lpop('tasks')  # 'task3'

# 右侧弹出
log = client.rpop('logs')    # 'log2'

# 阻塞式弹出（队列）
task = client.blpop('tasks', timeout=5)  # ('tasks', 'task2')

# 获取列表长度
length = client.llen('tasks')

# 获取范围元素
items = client.lrange('tasks', 0, -1)  # 所有元素

# 按索引获取
item = client.lindex('tasks', 0)

# 修剪列表（保留指定范围）
client.ltrim('logs', 0, 99)  # 只保留最新 100 条
```

### 4. Set（集合）

```python
# 添加成员
client.sadd('tags', 'python', 'redis', 'database')

# 获取所有成员
tags = client.smembers('tags')  # {'python', 'redis', 'database'}

# 检查成员是否存在
exists = client.sismember('tags', 'python')  # True

# 移除成员
client.srem('tags', 'database')

# 随机弹出
tag = client.spop('tags')

# 集合运算
client.sadd('set1', 'a', 'b', 'c')
client.sadd('set2', 'b', 'c', 'd')

# 交集
inter = client.sinter('set1', 'set2')  # {'b', 'c'}

# 并集
union = client.sunion('set1', 'set2')  # {'a', 'b', 'c', 'd'}

# 差集
diff = client.sdiff('set1', 'set2')    # {'a'}

# 成员数量
count = client.scard('tags')
```

### 5. Sorted Set（有序集合）

```python
# 添加成员（带分数）
client.zadd('rank', {'张三': 100, '李四': 95, '王五': 98})

# 获取排名范围（按分数升序）
top3 = client.zrange('rank', 0, 2, withscores=True)
# [('李四', 95.0), ('王五', 98.0), ('张三', 100.0)]

# 获取排名范围（按分数降序）
top3 = client.zrevrange('rank', 0, 2, withscores=True)
# [('张三', 100.0), ('王五', 98.0), ('李四', 95.0)]

# 获取成员分数
score = client.zscore('rank', '张三')  # 100.0

# 获取成员排名（从小到大）
rank = client.zrank('rank', '张三')    # 2（第三名，索引从 0 开始）

# 获取成员排名（从大到小）
rank = client.zrevrank('rank', '张三')  # 0（第一名）

# 分数自增
client.zincrby('rank', 5, '李四')  # 100

# 按分数范围查询
users = client.zrangebyscore('rank', 90, 100)

# 统计分数范围内的成员数
count = client.zcount('rank', 90, 100)

# 删除成员
client.zrem('rank', '王五')
```

## 实战应用

### 1. 缓存数据库查询结果

```python
import redis
import json
import pymysql

client = redis.Redis(host='localhost', decode_responses=True)

def get_user(user_id):
    # 先从缓存读取
    cache_key = f'user:{user_id}'
    cached = client.get(cache_key)
    
    if cached:
        print('从缓存读取')
        return json.loads(cached)
    
    # 缓存未命中，查询数据库
    print('从数据库读取')
    conn = pymysql.connect(host='localhost', user='root', password='password', database='test_db')
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    # 写入缓存（过期时间 1 小时）
    if user:
        client.setex(cache_key, 3600, json.dumps(user, default=str))
    
    return user

# 使用
user = get_user(1)
```

### 2. 会话存储

```python
import uuid

def create_session(user_id):
    session_id = str(uuid.uuid4())
    session_key = f'session:{session_id}'
    
    # 存储会话数据（过期时间 30 分钟）
    client.hset(session_key, mapping={
        'user_id': user_id,
        'login_time': '2024-01-01 10:00:00'
    })
    client.expire(session_key, 1800)
    
    return session_id

def get_session(session_id):
    session_key = f'session:{session_id}'
    return client.hgetall(session_key)

def delete_session(session_id):
    session_key = f'session:{session_id}'
    client.delete(session_key)
```

### 3. 分布式锁

```python
import time

def acquire_lock(lock_name, timeout=10):
    """获取分布式锁"""
    lock_key = f'lock:{lock_name}'
    end_time = time.time() + timeout
    
    while time.time() < end_time:
        # 尝试获取锁（NX：不存在才设置，EX：过期时间）
        if client.set(lock_key, '1', nx=True, ex=10):
            return True
        time.sleep(0.1)
    
    return False

def release_lock(lock_name):
    """释放锁"""
    lock_key = f'lock:{lock_name}'
    client.delete(lock_key)

# 使用
if acquire_lock('order:123'):
    try:
        # 执行业务逻辑
        print('处理订单')
    finally:
        release_lock('order:123')
```

### 4. 消息队列

```python
# 生产者
def send_message(queue_name, message):
    client.rpush(queue_name, message)

# 消费者
def consume_messages(queue_name):
    while True:
        # 阻塞式获取消息（超时 1 秒）
        result = client.blpop(queue_name, timeout=1)
        if result:
            queue, message = result
            print(f'收到消息: {message}')
            # 处理消息
        else:
            print('等待消息...')

# 使用
send_message('email_queue', 'send_email_to_user@example.com')
```

### 5. 排行榜

```python
# 更新分数
def update_score(user_id, score):
    client.zadd('game_rank', {user_id: score})

# 获取前 10 名
def get_top10():
    return client.zrevrange('game_rank', 0, 9, withscores=True)

# 获取用户排名
def get_user_rank(user_id):
    rank = client.zrevrank('game_rank', user_id)
    return rank + 1 if rank is not None else None

# 获取用户分数
def get_user_score(user_id):
    return client.zscore('game_rank', user_id)
```

### 6. 限流器（令牌桶）

```python
def rate_limit(user_id, max_requests=10, window=60):
    """限流：每分钟最多 10 次请求"""
    key = f'rate_limit:{user_id}'
    
    # 获取当前请求次数
    current = client.incr(key)
    
    if current == 1:
        # 第一次请求，设置过期时间
        client.expire(key, window)
    
    if current > max_requests:
        return False  # 超过限制
    
    return True  # 允许请求

# 使用
if rate_limit('user:123'):
    print('允许访问')
else:
    print('访问频率过高，请稍后再试')
```

## 持久化

### RDB（快照）

```python
# 手动触发快照
client.save()       # 阻塞式保存
client.bgsave()     # 后台保存

# 获取最后一次保存时间
last_save = client.lastsave()
```

### AOF（追加日志）

配置文件 `redis.conf`：

```
appendonly yes
appendfsync everysec  # 每秒同步
```

## 管道（Pipeline）

批量执行命令，减少网络往返：

```python
# 不使用管道（3 次网络往返）
client.set('key1', 'value1')
client.set('key2', 'value2')
client.set('key3', 'value3')

# 使用管道（1 次网络往返）
pipe = client.pipeline()
pipe.set('key1', 'value1')
pipe.set('key2', 'value2')
pipe.set('key3', 'value3')
pipe.execute()
```

## 发布订阅

```python
# 订阅者
def subscriber():
    pubsub = client.pubsub()
    pubsub.subscribe('news')
    
    for message in pubsub.listen():
        if message['type'] == 'message':
            print(f"收到消息: {message['data']}")

# 发布者
def publisher():
    client.publish('news', 'Python 3.14 发布了！')
```

## 常用命令

```python
# 检查键是否存在
client.exists('key')

# 设置过期时间
client.expire('key', 60)

# 查看剩余过期时间
ttl = client.ttl('key')

# 删除键
client.delete('key1', 'key2')

# 重命名键
client.rename('old_key', 'new_key')

# 获取所有键（生产环境慎用）
keys = client.keys('user:*')

# 扫描键（推荐）
cursor = 0
while True:
    cursor, keys = client.scan(cursor, match='user:*', count=100)
    print(keys)
    if cursor == 0:
        break
```

## 最佳实践

::: tip 性能优化
1. 使用**连接池**复用连接
2. 使用 **Pipeline** 批量操作
3. 避免使用 `keys *`，改用 `scan`
4. 设置合理的**过期时间**，避免内存溢出
:::

::: warning 注意事项
1. Redis 是**单线程**，避免长时间阻塞操作
2. **不要存储过大的值**（建议 < 10KB）
3. 生产环境**设置密码**
4. 监控**内存使用**，防止 OOM
:::

## 练习

1. 实现一个简单的缓存装饰器
2. 使用 Redis 实现分布式锁
3. 构建一个实时排行榜系统
4. 实现 API 限流功能
