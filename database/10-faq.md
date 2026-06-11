# 常见问题

数据库开发中常见问题的解决方案和排查方法。

## 连接问题

### MySQL 连接失败

**问题**：`Can't connect to MySQL server on 'localhost'`

**解决方案**：

```python
# 1. 检查 MySQL 服务是否启动
# Windows
# 服务管理器 → MySQL → 启动

# Linux/macOS
sudo systemctl status mysql
sudo systemctl start mysql

# 2. 检查端口是否正确
import pymysql

conn = pymysql.connect(
    host='localhost',
    port=3306,  # 默认端口
    user='root',
    password='your_password'
)

# 3. 检查防火墙设置
# 允许 3306 端口通过防火墙
```

### 连接数过多

**问题**：`Too many connections`

**解决方案**：

```python
# 1. 使用连接池
from dbutils.pooled_db import PooledDB

pool = PooledDB(
    creator=pymysql,
    maxconnections=10,  # 限制最大连接数
    blocking=True,      # 连接池满时等待
    ...
)

# 2. 及时关闭连接
try:
    conn = pymysql.connect(...)
    # 使用连接
finally:
    conn.close()  # 确保关闭

# 3. 使用上下文管理器
with pymysql.connect(...) as conn:
    # 自动关闭
    pass

# 4. 增加 MySQL 最大连接数
# 修改 my.cnf
# max_connections = 200
```

### Redis 连接失败

**问题**：`Error 61 connecting to localhost:6379. Connection refused`

**解决方案**：

```bash
# 1. 启动 Redis 服务
redis-server

# 2. 检查端口
redis-cli ping
# 返回 PONG 表示正常

# 3. 检查配置
redis-cli
> config get bind
> config get port
```

## 编码问题

### 中文乱码

**问题**：插入或查询中文显示为乱码

**解决方案**：

```python
# MySQL 三处统一使用 utf8mb4
# 1. 创建数据库时
cursor.execute('''
    CREATE DATABASE test_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci
''')

# 2. 创建表时
cursor.execute('''
    CREATE TABLE users (
        name VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
''')

# 3. 连接时
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='password',
    database='test_db',
    charset='utf8mb4'  # 重要！
)

# 检查编码
cursor.execute('SHOW VARIABLES LIKE "character%"')
for row in cursor.fetchall():
    print(row)
```

### Emoji 存储问题

**问题**：存储 emoji 表情符号失败

**解决方案**：

```python
# 必须使用 utf8mb4，不是 utf8！
# utf8 只支持 3 字节字符
# utf8mb4 支持 4 字节字符（包括 emoji）

conn = pymysql.connect(
    charset='utf8mb4'  # 不是 'utf8'
)
```

## SQL 相关

### SQL 注入风险

**问题**：字符串拼接导致 SQL 注入

```python
# ❌ 危险
username = input('用户名: ')
sql = f"SELECT * FROM users WHERE username = '{username}'"
# 输入: admin' OR '1'='1 将绕过验证

# ✅ 正确：使用参数化查询
cursor.execute(
    'SELECT * FROM users WHERE username = %s',
    (username,)
)
```

### 占位符错误

**问题**：占位符使用不当

```python
# ❌ 错误
cursor.execute('SELECT * FROM users WHERE id = ?', (1,))
# PyMySQL 使用 %s，不是 ?

# ✅ 正确
# PyMySQL/MySQL
cursor.execute('SELECT * FROM users WHERE id = %s', (1,))

# SQLite
cursor.execute('SELECT * FROM users WHERE id = ?', (1,))

# PostgreSQL (psycopg2)
cursor.execute('SELECT * FROM users WHERE id = %s', (1,))
```

### IN 子句参数化

**问题**：如何参数化 IN 子句

```python
ids = [1, 2, 3, 4, 5]

# ❌ 错误
cursor.execute('SELECT * FROM users WHERE id IN (%s)', (ids,))

# ✅ 正确：动态生成占位符
placeholders = ','.join(['%s'] * len(ids))
sql = f'SELECT * FROM users WHERE id IN ({placeholders})'
cursor.execute(sql, ids)
```

## 时区问题

### 时间相差 8 小时

**问题**：数据库存储时间与本地时间不一致

**解决方案**：

```python
from datetime import datetime, timezone

# 方案 1：统一使用 UTC 时间
utc_now = datetime.now(timezone.utc)
cursor.execute('INSERT INTO logs (created_at) VALUES (%s)', (utc_now,))

# 方案 2：连接时设置时区
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='password',
    database='test_db',
    charset='utf8mb4',
    init_command="SET time_zone='+08:00'"  # 东八区
)

# 方案 3：MySQL 配置时区
# 修改 my.cnf
# default-time-zone = '+08:00'
```

## 性能问题

### 查询速度慢

**排查步骤**：

```python
# 1. 使用 EXPLAIN 分析
cursor.execute('EXPLAIN SELECT * FROM users WHERE email = %s', ('test@example.com',))
plan = cursor.fetchone()

# 检查 type 字段
# ALL - 全表扫描（最慢，需要优化）
# index - 索引扫描
# range - 范围扫描
# ref - 索引查找
# const - 常量查找（最快）

# 2. 检查是否缺少索引
cursor.execute('SHOW INDEX FROM users')
indexes = cursor.fetchall()

# 3. 添加索引
cursor.execute('CREATE INDEX idx_email ON users(email)')

# 4. 启用慢查询日志
cursor.execute('SET GLOBAL slow_query_log = ON')
cursor.execute('SET GLOBAL long_query_time = 1')  # 超过 1 秒记录
```

### N+1 查询问题

**问题**：循环查询导致性能差

```python
# ❌ N+1 查询（1 次查用户 + N 次查文章）
users = session.query(User).all()
for user in users:
    posts = session.query(Post).filter(Post.user_id == user.id).all()
    print(f'{user.name}: {len(posts)} 篇文章')

# ✅ 使用 JOIN（1 次查询）
from sqlalchemy.orm import joinedload

users = session.query(User).options(joinedload(User.posts)).all()
for user in users:
    print(f'{user.name}: {len(user.posts)} 篇文章')
```

## ORM 问题

### DetachedInstanceError

**问题**：`DetachedInstanceError: Instance is not bound to a Session`

**原因**：在 session 关闭后访问对象的关系属性

**解决方案**：

```python
# ❌ 错误
def get_user(user_id):
    session = Session()
    user = session.query(User).filter(User.id == user_id).first()
    session.close()
    return user

user = get_user(1)
posts = user.posts  # 报错！session 已关闭

# ✅ 方案 1：在 session 内访问
def get_user_with_posts(user_id):
    session = Session()
    user = session.query(User).options(joinedload(User.posts)).filter(User.id == user_id).first()
    session.close()
    return user

# ✅ 方案 2：使用 expunge 后手动加载
session.expunge(user)  # 从 session 分离
```

### 事务未提交

**问题**：数据插入后在数据库中看不到

```python
# ❌ 忘记提交
cursor.execute('INSERT INTO users (name) VALUES (%s)', ('张三',))
# 数据未提交

# ✅ 记得提交
cursor.execute('INSERT INTO users (name) VALUES (%s)', ('张三',))
conn.commit()  # 提交事务

# ✅ 使用上下文管理器（自动提交）
with get_db() as session:
    user = User(name='张三')
    session.add(user)
    # 自动提交
```

## Redis 问题

### 内存占用过高

**问题**：Redis 内存持续增长

**解决方案**：

```python
# 1. 设置过期时间
redis_client.setex('key', 3600, 'value')  # 1 小时后过期

# 2. 定期清理
redis_client.flushdb()  # 清空当前数据库（慎用）

# 3. 配置最大内存和淘汰策略
# redis.conf
# maxmemory 2gb
# maxmemory-policy allkeys-lru  # LRU 淘汰

# 4. 查看内存使用
info = redis_client.info('memory')
print(f"使用内存: {info['used_memory_human']}")
```

### 数据类型错误

**问题**：`WRONGTYPE Operation against a key holding the wrong kind of value`

**原因**：对不同类型的 key 使用了错误的命令

```python
# String 类型
redis_client.set('key', 'value')

# ❌ 错误：用 Hash 命令操作 String
redis_client.hget('key', 'field')  # 报错

# ✅ 正确：使用对应类型的命令
redis_client.get('key')

# 检查 key 的类型
key_type = redis_client.type('key')
print(f'类型: {key_type}')  # 'string', 'hash', 'list', 'set', 'zset'
```

## 常见错误信息

### MySQL

| 错误代码 | 错误信息 | 解决方案 |
|---------|---------|---------|
| 1045 | Access denied for user | 检查用户名和密码 |
| 1062 | Duplicate entry for key | 违反唯一约束，检查是否重复 |
| 1064 | You have an error in your SQL syntax | SQL 语法错误 |
| 1146 | Table doesn't exist | 表不存在，检查表名 |
| 1366 | Incorrect string value | 编码问题，使用 utf8mb4 |
| 2003 | Can't connect to MySQL server | 服务未启动或网络问题 |
| 2006 | MySQL server has gone away | 连接超时，增加 timeout 或使用连接池 |

### SQLAlchemy

| 错误 | 原因 | 解决方案 |
|-----|------|---------|
| NoResultFound | 查询无结果 | 使用 `first()` 而不是 `one()` |
| MultipleResultsFound | 查询返回多个结果 | 添加更多过滤条件 |
| InvalidRequestError | Session 状态错误 | 检查是否重复 add/commit |
| DetachedInstanceError | 对象已脱离 Session | 在 session 内访问关系 |

## 调试技巧

### 打印 SQL 语句

```python
# SQLAlchemy
engine = create_engine('...', echo=True)  # 打印所有 SQL

# PyMySQL（手动）
sql = cursor.mogrify('SELECT * FROM users WHERE id = %s', (1,))
print(sql.decode())  # 查看实际执行的 SQL
```

### 查看连接状态

```python
# MySQL
cursor.execute('SHOW PROCESSLIST')
processes = cursor.fetchall()

# Redis
info = redis_client.info()
print(f"连接数: {info['connected_clients']}")
```

### 性能监控

```python
import time

def timeit(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f'{func.__name__} 耗时: {elapsed:.3f}s')
        return result
    return wrapper

@timeit
def slow_query():
    cursor.execute('SELECT * FROM large_table')
    return cursor.fetchall()
```

## 最佳实践建议

::: tip 开发建议
1. **使用连接池**，避免频繁创建连接
2. **参数化查询**，防止 SQL 注入
3. **统一编码**，全部使用 utf8mb4
4. **设置过期时间**，避免 Redis 内存溢出
5. **添加索引**，但不要过度索引
6. **启用慢查询日志**，定期优化
7. **使用事务**，保证数据一致性
8. **及时关闭连接**，避免资源泄漏
:::

::: warning 生产环境
1. **不要在生产环境使用 root 账号**
2. **定期备份数据库**
3. **监控数据库性能指标**
4. **配置合理的超时时间**
5. **使用 SSL 加密连接**（敏感数据）
:::

## 快速排查清单

遇到问题时按此顺序检查：

1. [ ] 服务是否启动？
2. [ ] 连接参数是否正确（host、port、user、password）？
3. [ ] 数据库/表是否存在？
4. [ ] 编码是否一致（utf8mb4）？
5. [ ] 是否使用了参数化查询？
6. [ ] 是否提交了事务（commit）？
7. [ ] 是否有索引？
8. [ ] 是否关闭了连接？
