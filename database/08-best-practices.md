# 最佳实践

数据库开发的最佳实践，包括连接池管理、SQL 注入防护、性能优化、安全策略等。

## 连接池管理

### 为什么需要连接池？

数据库连接的创建和销毁是昂贵的操作：
- **TCP 握手**：建立网络连接
- **身份验证**：验证用户名和密码
- **资源分配**：服务器端分配内存和资源

连接池通过**复用连接**显著提升性能。

### DBUtils 连接池（通用方案）

```python
from dbutils.pooled_db import PooledDB
import pymysql

class DatabasePool:
    __pool = None
    
    @classmethod
    def get_pool(cls):
        if not cls.__pool:
            cls.__pool = PooledDB(
                creator=pymysql,
                maxconnections=20,      # 最大连接数
                mincached=5,            # 初始化时创建的空闲连接数
                maxcached=10,           # 最大空闲连接数
                maxshared=0,            # 最大共享连接数（0 表示不共享）
                blocking=True,          # 连接池满时是否阻塞等待
                maxusage=1000,          # 单个连接最大复用次数
                host='localhost',
                user='root',
                password='password',
                database='test_db',
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
        return cls.__pool
    
    @classmethod
    def get_connection(cls):
        return cls.get_pool().connection()

# 使用
conn = DatabasePool.get_connection()
cursor = conn.cursor()
cursor.execute('SELECT * FROM users')
users = cursor.fetchall()
cursor.close()
conn.close()  # 归还到连接池
```

### SQLAlchemy 连接池

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    'mysql+pymysql://root:password@localhost:3306/test_db',
    poolclass=QueuePool,
    pool_size=10,           # 连接池大小
    max_overflow=20,        # 超出 pool_size 后最多创建的连接数
    pool_timeout=30,        # 获取连接的超时时间
    pool_recycle=3600,      # 连接回收时间（秒）
    pool_pre_ping=True,     # 使用前检测连接是否有效
    echo_pool=True          # 打印连接池日志
)
```

## SQL 注入防护

### 什么是 SQL 注入？

攻击者通过输入恶意 SQL 代码来操纵数据库查询。

```python
# ❌ 危险示例
username = input('用户名: ')
password = input('密码: ')

# 如果用户输入: admin' OR '1'='1
sql = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
# 实际执行: SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = ''
# 结果：绕过密码验证！
```

### 防护方法

#### 1. 使用参数化查询（推荐）

```python
# ✅ 安全示例（PyMySQL）
cursor.execute(
    'SELECT * FROM users WHERE username = %s AND password = %s',
    (username, password)
)

# ✅ 安全示例（SQLite）
cursor.execute(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    (username, password)
)

# ✅ 安全示例（PostgreSQL）
cursor.execute(
    'SELECT * FROM users WHERE username = %s AND password = %s',
    (username, password)
)
```

#### 2. 使用 ORM 框架

```python
from sqlalchemy.orm import Session

# SQLAlchemy 自动处理参数化
user = session.query(User).filter(
    User.username == username,
    User.password == password
).first()
```

#### 3. 输入验证

```python
import re

def validate_username(username):
    # 只允许字母、数字、下划线
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
        raise ValueError('用户名格式不正确')
    return username

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError('邮箱格式不正确')
    return email
```

#### 4. 最小权限原则

```sql
-- 应用使用的数据库账号只授予必要权限
GRANT SELECT, INSERT, UPDATE, DELETE ON test_db.* TO 'app_user'@'localhost';

-- 不要使用 root 账号连接数据库
```

## 密码安全

### 永远不要明文存储密码

```python
import hashlib
import secrets

# ❌ 错误：明文存储
cursor.execute('INSERT INTO users (username, password) VALUES (%s, %s)', 
               ('zhangsan', '123456'))

# ✅ 正确：使用 bcrypt（推荐）
import bcrypt

def hash_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt)

def verify_password(password, hashed):
    return bcrypt.checkpw(password.encode(), hashed)

# 注册
hashed = hash_password('123456')
cursor.execute('INSERT INTO users (username, password) VALUES (%s, %s)',
               ('zhangsan', hashed))

# 登录验证
cursor.execute('SELECT password FROM users WHERE username = %s', ('zhangsan',))
stored_password = cursor.fetchone()['password']

if verify_password('123456', stored_password):
    print('登录成功')
```

## 性能优化

### 1. 批量操作

```python
# ❌ 慢：逐条插入
for user in users:
    cursor.execute('INSERT INTO users (name, email) VALUES (%s, %s)', 
                   (user['name'], user['email']))

# ✅ 快：批量插入
cursor.executemany(
    'INSERT INTO users (name, email) VALUES (%s, %s)',
    [(u['name'], u['email']) for u in users]
)
```

### 2. 索引优化

```python
# 创建索引前后对比
import time

# 查询 100 万条数据
cursor.execute('SELECT * FROM users WHERE email = %s', ('test@example.com',))

# 创建索引
cursor.execute('CREATE INDEX idx_email ON users(email)')

# 再次查询（速度显著提升）
```

**索引使用原则**：
- 在 **WHERE、JOIN、ORDER BY** 频繁使用的列上创建索引
- 避免在**低选择性**的列上创建索引（如性别）
- **组合索引**遵循最左前缀原则
- 定期检查**慢查询日志**

### 3. 只查询需要的字段

```python
# ❌ 浪费资源
cursor.execute('SELECT * FROM users WHERE age > 25')

# ✅ 只查询需要的字段
cursor.execute('SELECT id, name, email FROM users WHERE age > 25')
```

### 4. 分页查询

```python
def get_users_paginated(page=1, page_size=20):
    offset = (page - 1) * page_size
    
    cursor.execute(
        'SELECT * FROM users LIMIT %s OFFSET %s',
        (page_size, offset)
    )
    
    return cursor.fetchall()
```

### 5. 使用 EXPLAIN 分析查询

```python
cursor.execute('EXPLAIN SELECT * FROM users WHERE age > 25')
plan = cursor.fetchall()

# 检查是否使用了索引
# type 为 ALL 表示全表扫描（需要优化）
```

## 事务管理

### 基本事务

```python
import pymysql

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='password',
    database='test_db',
    autocommit=False  # 关闭自动提交
)

cursor = conn.cursor()

try:
    # 开始事务
    cursor.execute('UPDATE accounts SET balance = balance - %s WHERE id = %s', (100, 1))
    cursor.execute('UPDATE accounts SET balance = balance + %s WHERE id = %s', (100, 2))
    
    # 提交事务
    conn.commit()
    print('转账成功')
    
except Exception as e:
    # 回滚事务
    conn.rollback()
    print(f'转账失败，已回滚: {e}')
    
finally:
    cursor.close()
    conn.close()
```

### 事务装饰器

```python
from functools import wraps

def transaction(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        conn = DatabasePool.get_connection()
        cursor = conn.cursor()
        
        try:
            result = func(cursor, *args, **kwargs)
            conn.commit()
            return result
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
    
    return wrapper

# 使用
@transaction
def transfer_money(cursor, from_id, to_id, amount):
    cursor.execute('UPDATE accounts SET balance = balance - %s WHERE id = %s', 
                   (amount, from_id))
    cursor.execute('UPDATE accounts SET balance = balance + %s WHERE id = %s', 
                   (amount, to_id))
```

## 数据库设计原则

### 1. 三大范式

**第一范式（1NF）**：每个字段都是原子性的，不可再分。

```python
# ❌ 违反 1NF
users = {
    'name': '张三',
    'phones': '12345678,87654321'  # 多个电话存储在一个字段
}

# ✅ 符合 1NF
users = {
    'name': '张三'
}
phones = [
    {'user_id': 1, 'phone': '12345678'},
    {'user_id': 1, 'phone': '87654321'}
]
```

**第二范式（2NF）**：消除部分依赖（非主属性完全依赖于主键）。

**第三范式（3NF）**：消除传递依赖。

### 2. 外键约束

```python
# 创建带外键的表
cursor.execute('''
    CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total DECIMAL(10, 2),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
''')
```

### 3. 软删除

```python
# 添加 is_deleted 字段，而不是真正删除
cursor.execute('ALTER TABLE users ADD COLUMN is_deleted TINYINT DEFAULT 0')

# "删除"记录
cursor.execute('UPDATE users SET is_deleted = 1 WHERE id = %s', (1,))

# 查询时过滤已删除记录
cursor.execute('SELECT * FROM users WHERE is_deleted = 0')
```

## 日志和监控

### 慢查询日志

```python
import time
import logging

logging.basicConfig(level=logging.INFO)

class QueryLogger:
    def __init__(self, cursor):
        self.cursor = cursor
    
    def execute(self, sql, params=None):
        start = time.time()
        self.cursor.execute(sql, params)
        elapsed = time.time() - start
        
        if elapsed > 0.1:  # 超过 100ms 记录警告
            logging.warning(f'慢查询 ({elapsed:.3f}s): {sql}')
        
        return self.cursor.fetchall()

# 使用
cursor = QueryLogger(conn.cursor())
users = cursor.execute('SELECT * FROM users WHERE age > %s', (25,))
```

## 备份和恢复

### MySQL 备份

```bash
# 备份单个数据库
mysqldump -u root -p test_db > backup.sql

# 备份所有数据库
mysqldump -u root -p --all-databases > all_backup.sql

# 恢复
mysql -u root -p test_db < backup.sql
```

### 自动备份脚本

```python
import subprocess
from datetime import datetime

def backup_mysql(host, user, password, database, backup_dir):
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = f'{backup_dir}/{database}_{timestamp}.sql'
    
    cmd = [
        'mysqldump',
        f'-h{host}',
        f'-u{user}',
        f'-p{password}',
        database
    ]
    
    with open(backup_file, 'w') as f:
        subprocess.run(cmd, stdout=f, check=True)
    
    print(f'备份完成: {backup_file}')

# 使用
backup_mysql('localhost', 'root', 'password', 'test_db', '/backups')
```

## 数据库版本管理（Alembic）

```bash
pip install alembic
```

```bash
# 初始化
alembic init migrations

# 生成迁移脚本
alembic revision --autogenerate -m "add users table"

# 执行迁移
alembic upgrade head

# 回滚
alembic downgrade -1
```

## 常见陷阱

### 1. N+1 查询问题

```python
# ❌ N+1 查询（性能差）
users = cursor.execute('SELECT * FROM users')
for user in users:
    cursor.execute('SELECT * FROM posts WHERE user_id = %s', (user['id'],))
    posts = cursor.fetchall()

# ✅ 使用 JOIN（一次查询）
cursor.execute('''
    SELECT u.*, p.*
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
''')
```

### 2. 忘记关闭连接

```python
# ❌ 连接泄漏
def get_users():
    conn = pymysql.connect(...)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    return cursor.fetchall()
    # 忘记关闭连接！

# ✅ 使用上下文管理器
def get_users():
    with pymysql.connect(...) as conn:
        with conn.cursor() as cursor:
            cursor.execute('SELECT * FROM users')
            return cursor.fetchall()
```

### 3. 时区问题

```python
# 统一使用 UTC 时间
from datetime import datetime, timezone

now = datetime.now(timezone.utc)
cursor.execute('INSERT INTO logs (created_at) VALUES (%s)', (now,))
```

## 检查清单

::: tip 开发阶段
- [ ] 使用参数化查询防止 SQL 注入
- [ ] 密码使用 bcrypt 加密存储
- [ ] 为常用查询字段创建索引
- [ ] 使用连接池管理数据库连接
- [ ] 事务操作添加异常处理
- [ ] 敏感操作记录日志
:::

::: warning 上线前
- [ ] 启用慢查询日志
- [ ] 配置数据库账号权限（最小权限原则）
- [ ] 设置连接超时时间
- [ ] 配置自动备份脚本
- [ ] 性能测试和压力测试
- [ ] 监控数据库性能指标
:::

## 练习

1. 实现一个通用的数据库连接池类，支持 MySQL、PostgreSQL、SQLite
2. 编写一个装饰器，自动记录慢查询和异常
3. 设计一个用户权限系统的数据库模型（用户、角色、权限）
4. 实现数据库自动备份脚本，保留最近 7 天的备份
