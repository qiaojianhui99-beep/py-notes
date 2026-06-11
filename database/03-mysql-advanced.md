# MySQL 进阶

深入探讨 MySQL 的高级特性，包括连接池、事务隔离级别、索引优化、存储过程等。

## 连接池

频繁创建和关闭数据库连接会消耗大量资源，连接池可以复用连接，提高性能。

### 使用 DBUtils

```bash
pip install DBUtils pymysql
```

```python
from dbutils.pooled_db import PooledDB
import pymysql

# 创建连接池
pool = PooledDB(
    creator=pymysql,
    maxconnections=10,      # 最大连接数
    mincached=2,            # 最小空闲连接数
    maxcached=5,            # 最大空闲连接数
    blocking=True,          # 连接池满时是否阻塞
    host='localhost',
    user='root',
    password='your_password',
    database='test_db',
    charset='utf8mb4'
)

# 从池中获取连接
conn = pool.connection()
cursor = conn.cursor()

cursor.execute('SELECT * FROM users')
users = cursor.fetchall()

cursor.close()
conn.close()  # 归还到连接池，而非真正关闭
```

### 封装连接池类

```python
import pymysql
from dbutils.pooled_db import PooledDB

class MySQLPool:
    __pool = None
    
    def __init__(self):
        if not self.__pool:
            self.__pool = PooledDB(
                creator=pymysql,
                maxconnections=10,
                mincached=2,
                maxcached=5,
                blocking=True,
                host='localhost',
                user='root',
                password='your_password',
                database='test_db',
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
    
    def get_connection(self):
        return self.__pool.connection()
    
    def execute(self, sql, params=None):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(sql, params)
            conn.commit()
            return cursor.fetchall()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

# 使用示例
db = MySQLPool()
users = db.execute('SELECT * FROM users WHERE age > %s', (25,))
```

## 事务隔离级别

MySQL 支持四种事务隔离级别，解决并发事务问题。

### 隔离级别对比

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|---------|------|-----------|------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 |
| READ COMMITTED | 不可能 | 可能 | 可能 |
| REPEATABLE READ（默认） | 不可能 | 不可能 | 可能 |
| SERIALIZABLE | 不可能 | 不可能 | 不可能 |

### 设置隔离级别

```python
import pymysql

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='your_password',
    database='test_db',
    charset='utf8mb4'
)

cursor = conn.cursor()

# 设置会话隔离级别
cursor.execute('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED')

# 查看当前隔离级别
cursor.execute('SELECT @@tx_isolation')
level = cursor.fetchone()
print(f'当前隔离级别: {level[0]}')

cursor.close()
conn.close()
```

## 索引优化

### 创建索引

```python
cursor = conn.cursor()

# 普通索引
cursor.execute('CREATE INDEX idx_name ON users(name)')

# 唯一索引
cursor.execute('CREATE UNIQUE INDEX idx_email ON users(email)')

# 组合索引
cursor.execute('CREATE INDEX idx_name_age ON users(name, age)')

# 全文索引（MyISAM 或 InnoDB 5.6+）
cursor.execute('CREATE FULLTEXT INDEX idx_content ON articles(content)')

conn.commit()
```

### 查看索引

```python
cursor.execute('SHOW INDEX FROM users')
indexes = cursor.fetchall()

for idx in indexes:
    print(idx)
```

### EXPLAIN 分析查询

```python
cursor.execute('EXPLAIN SELECT * FROM users WHERE age > 25')
result = cursor.fetchone()

print(f'扫描类型: {result[3]}')  # ALL, index, range, ref, eq_ref, const
print(f'预计扫描行数: {result[8]}')
```

## 存储过程

### 创建存储过程

```python
procedure_sql = '''
CREATE PROCEDURE get_user_count(
    IN min_age INT,
    OUT user_count INT
)
BEGIN
    SELECT COUNT(*) INTO user_count
    FROM users
    WHERE age >= min_age;
END
'''

cursor.execute(procedure_sql)
```

### 调用存储过程

```python
cursor.callproc('get_user_count', (25, 0))

# 获取输出参数
cursor.execute('SELECT @_get_user_count_1')
result = cursor.fetchone()
print(f'用户数: {result[0]}')
```

## 批量操作优化

### 使用 executemany

```python
import pymysql
import time

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='your_password',
    database='test_db',
    charset='utf8mb4'
)

cursor = conn.cursor()

# 生成 10000 条测试数据
users = [(f'用户{i}', f'user{i}@example.com', 20 + i % 30) for i in range(10000)]

start = time.time()

# ❌ 慢方式：逐条插入
for user in users:
    cursor.execute('INSERT INTO users (name, email, age) VALUES (%s, %s, %s)', user)

# ✅ 快方式：批量插入
cursor.executemany('INSERT INTO users (name, email, age) VALUES (%s, %s, %s)', users)

conn.commit()
print(f'耗时: {time.time() - start:.2f} 秒')

cursor.close()
conn.close()
```

### 使用 LOAD DATA INFILE

对于超大批量数据，使用 `LOAD DATA INFILE` 性能最优：

```python
import csv

# 先生成 CSV 文件
with open('users.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    for i in range(100000):
        writer.writerow([f'用户{i}', f'user{i}@example.com', 20 + i % 30])

# 导入到数据库
cursor.execute("""
    LOAD DATA INFILE '/path/to/users.csv'
    INTO TABLE users
    FIELDS TERMINATED BY ','
    LINES TERMINATED BY '\\n'
    (name, email, age)
""")

conn.commit()
```

## JSON 支持（MySQL 5.7+）

```python
import json

cursor = conn.cursor()

# 创建包含 JSON 字段的表
cursor.execute('''
    CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        attributes JSON
    )
''')

# 插入 JSON 数据
attrs = {'color': 'red', 'size': 'L', 'tags': ['new', 'sale']}
cursor.execute(
    'INSERT INTO products (name, attributes) VALUES (%s, %s)',
    ('T恤', json.dumps(attrs, ensure_ascii=False))
)

# 查询 JSON 字段
cursor.execute("SELECT name, attributes->>'$.color' as color FROM products")
products = cursor.fetchall()

conn.commit()
```

## 性能监控

### 慢查询日志

```python
# 开启慢查询日志
cursor.execute('SET GLOBAL slow_query_log = ON')
cursor.execute('SET GLOBAL long_query_time = 2')  # 超过 2 秒的查询

# 查看慢查询状态
cursor.execute('SHOW VARIABLES LIKE "slow%"')
settings = cursor.fetchall()
```

### 查看连接数

```python
cursor.execute('SHOW STATUS LIKE "Threads_connected"')
result = cursor.fetchone()
print(f'当前连接数: {result[1]}')

cursor.execute('SHOW VARIABLES LIKE "max_connections"')
result = cursor.fetchone()
print(f'最大连接数: {result[1]}')
```

## 读写分离

在主从复制架构中实现读写分离：

```python
class MySQLReadWrite:
    def __init__(self):
        # 主库（写）
        self.master = pymysql.connect(
            host='master_host',
            user='root',
            password='password',
            database='test_db',
            charset='utf8mb4'
        )
        
        # 从库（读）
        self.slave = pymysql.connect(
            host='slave_host',
            user='root',
            password='password',
            database='test_db',
            charset='utf8mb4'
        )
    
    def execute_write(self, sql, params=None):
        cursor = self.master.cursor()
        cursor.execute(sql, params)
        self.master.commit()
        cursor.close()
    
    def execute_read(self, sql, params=None):
        cursor = self.slave.cursor()
        cursor.execute(sql, params)
        result = cursor.fetchall()
        cursor.close()
        return result

# 使用
db = MySQLReadWrite()
db.execute_write('INSERT INTO users (name) VALUES (%s)', ('张三',))
users = db.execute_read('SELECT * FROM users')
```

## 最佳实践

::: tip 性能优化建议
1. **使用连接池**，避免频繁创建连接
2. **批量操作**优先使用 `executemany`
3. **合理使用索引**，但避免过度索引
4. **避免 SELECT \***，只查询需要的字段
5. **大表查询**使用 LIMIT 分页
:::

::: warning 安全建议
1. **永远使用参数化查询**，防止 SQL 注入
2. **最小权限原则**，不同应用使用不同账号
3. **敏感数据加密**存储（如密码使用哈希）
:::

## 练习

1. 创建一个包含 100 万条数据的测试表，对比不同插入方法的性能
2. 使用 EXPLAIN 分析慢查询，并通过添加索引优化
3. 实现一个支持连接池和事务的数据库操作类
4. 模拟高并发场景，测试不同事务隔离级别的效果
