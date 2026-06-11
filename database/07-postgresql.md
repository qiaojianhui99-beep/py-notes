# PostgreSQL

PostgreSQL 是功能最强大的开源关系型数据库，支持高级特性如 JSON、全文搜索、地理信息等。

## 特点

- **ACID 完整性**：严格的事务支持
- **JSON 支持**：原生支持 JSON 和 JSONB 类型
- **全文搜索**：内置全文搜索引擎
- **丰富的数据类型**：数组、范围、几何等
- **可扩展性**：支持自定义函数、类型、操作符
- **并发控制**：MVCC 多版本并发控制

## 安装

### 安装 PostgreSQL

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# 下载 PostgreSQL 安装包
```

### 安装 Python 驱动

```bash
# psycopg2（推荐）
pip install psycopg2-binary

# 或使用异步驱动
pip install asyncpg
```

## 基本使用

### 连接数据库

```python
import psycopg2

# 创建连接
conn = psycopg2.connect(
    host='localhost',
    port=5432,
    database='test_db',
    user='postgres',
    password='your_password'
)

# 创建游标
cursor = conn.cursor()

# 执行查询
cursor.execute('SELECT version()')
version = cursor.fetchone()
print(f'PostgreSQL 版本: {version[0]}')

# 关闭连接
cursor.close()
conn.close()
```

### 使用上下文管理器

```python
import psycopg2

with psycopg2.connect(
    host='localhost',
    database='test_db',
    user='postgres',
    password='your_password'
) as conn:
    with conn.cursor() as cursor:
        cursor.execute('SELECT * FROM users')
        users = cursor.fetchall()
```

## CRUD 操作

### 创建表

```python
create_table_sql = '''
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
'''

cursor.execute(create_table_sql)
conn.commit()
```

### 插入数据

```python
# 单条插入
cursor.execute(
    'INSERT INTO users (name, email, age) VALUES (%s, %s, %s) RETURNING id',
    ('张三', 'zhangsan@example.com', 25)
)

user_id = cursor.fetchone()[0]
print(f'插入的 ID: {user_id}')

conn.commit()

# 批量插入
from psycopg2.extras import execute_values

users = [
    ('李四', 'lisi@example.com', 30),
    ('王五', 'wangwu@example.com', 28),
]

execute_values(
    cursor,
    'INSERT INTO users (name, email, age) VALUES %s',
    users
)

conn.commit()
```

### 查询数据

```python
# 查询所有
cursor.execute('SELECT * FROM users')
users = cursor.fetchall()

# 返回字典格式
from psycopg2.extras import RealDictCursor

cursor = conn.cursor(cursor_factory=RealDictCursor)
cursor.execute('SELECT * FROM users WHERE id = %s', (1,))
user = cursor.fetchone()

print(user['name'])
print(user['email'])
```

### 更新和删除

```python
# 更新
cursor.execute(
    'UPDATE users SET age = %s WHERE name = %s',
    (26, '张三')
)
conn.commit()

# 删除
cursor.execute('DELETE FROM users WHERE age < %s', (20,))
conn.commit()
```

## 高级特性

### JSON/JSONB 支持

```python
import json

# 创建包含 JSON 字段的表
cursor.execute('''
    CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        attributes JSONB
    )
''')

# 插入 JSON 数据
attrs = {'color': 'red', 'size': 'L', 'tags': ['new', 'sale']}
cursor.execute(
    'INSERT INTO products (name, attributes) VALUES (%s, %s)',
    ('T恤', json.dumps(attrs))
)

# 查询 JSON 字段
cursor.execute("SELECT name, attributes->>'color' as color FROM products")
products = cursor.fetchall()

# 查询包含特定 JSON 键的记录
cursor.execute("SELECT * FROM products WHERE attributes ? 'color'")

# 查询 JSON 数组
cursor.execute("SELECT * FROM products WHERE attributes->'tags' ? 'sale'")

conn.commit()
```

::: tip JSONB vs JSON
- **JSONB**：二进制格式，支持索引，查询更快（推荐）
- **JSON**：文本格式，保留原始格式，存储更快
:::

### 数组类型

```python
# 创建包含数组字段的表
cursor.execute('''
    CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100),
        tags TEXT[]
    )
''')

# 插入数组数据
cursor.execute(
    'INSERT INTO posts (title, tags) VALUES (%s, %s)',
    ('Python 教程', ['python', 'tutorial', 'programming'])
)

# 查询包含特定标签的文章
cursor.execute("SELECT * FROM posts WHERE 'python' = ANY(tags)")

# 查询包含所有指定标签的文章
cursor.execute("SELECT * FROM posts WHERE tags @> ARRAY['python', 'tutorial']")

conn.commit()
```

### 全文搜索

```python
# 创建全文搜索表
cursor.execute('''
    CREATE TABLE articles (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        search_vector tsvector
    )
''')

# 插入数据并创建搜索向量
cursor.execute('''
    INSERT INTO articles (title, content, search_vector)
    VALUES (%s, %s, to_tsvector('english', %s || ' ' || %s))
''', ('Python Guide', 'This is a comprehensive Python guide...', 'Python Guide', 'This is a comprehensive Python guide...'))

# 创建全文搜索索引
cursor.execute('CREATE INDEX idx_search ON articles USING GIN(search_vector)')

# 全文搜索
cursor.execute('''
    SELECT title, content
    FROM articles
    WHERE search_vector @@ to_tsquery('english', 'python & guide')
''')

results = cursor.fetchall()

conn.commit()
```

### 窗口函数

```python
# 排名查询
cursor.execute('''
    SELECT 
        name, 
        age,
        RANK() OVER (ORDER BY age DESC) as rank,
        ROW_NUMBER() OVER (ORDER BY age DESC) as row_num
    FROM users
''')

results = cursor.fetchall()

# 分组内排名
cursor.execute('''
    SELECT 
        department,
        name,
        salary,
        RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank
    FROM employees
''')
```

### CTE（公共表表达式）

```python
# 递归查询（如组织架构）
cursor.execute('''
    WITH RECURSIVE org_tree AS (
        -- 基础查询：顶层员工
        SELECT id, name, manager_id, 1 as level
        FROM employees
        WHERE manager_id IS NULL
        
        UNION ALL
        
        -- 递归查询：下属员工
        SELECT e.id, e.name, e.manager_id, ot.level + 1
        FROM employees e
        INNER JOIN org_tree ot ON e.manager_id = ot.id
    )
    SELECT * FROM org_tree ORDER BY level, name
''')

results = cursor.fetchall()
```

## 事务和并发

### 事务隔离级别

```python
# 设置隔离级别
conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_SERIALIZABLE)

# 事务示例
try:
    cursor.execute('UPDATE accounts SET balance = balance - %s WHERE id = %s', (100, 1))
    cursor.execute('UPDATE accounts SET balance = balance + %s WHERE id = %s', (100, 2))
    conn.commit()
except Exception as e:
    conn.rollback()
    print(f'事务失败: {e}')
```

### 行级锁

```python
# FOR UPDATE：排他锁
cursor.execute('SELECT * FROM products WHERE id = %s FOR UPDATE', (1,))
product = cursor.fetchone()

# FOR SHARE：共享锁
cursor.execute('SELECT * FROM products WHERE id = %s FOR SHARE', (1,))
```

## 连接池

```python
from psycopg2 import pool

# 创建连接池
connection_pool = pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    host='localhost',
    database='test_db',
    user='postgres',
    password='your_password'
)

# 从池中获取连接
conn = connection_pool.getconn()

# 使用连接
cursor = conn.cursor()
cursor.execute('SELECT * FROM users')
users = cursor.fetchall()

# 归还连接
connection_pool.putconn(conn)

# 关闭所有连接
connection_pool.closeall()
```

## 异步操作（asyncpg）

```bash
pip install asyncpg
```

```python
import asyncio
import asyncpg

async def main():
    # 创建连接
    conn = await asyncpg.connect(
        host='localhost',
        database='test_db',
        user='postgres',
        password='your_password'
    )
    
    # 查询
    users = await conn.fetch('SELECT * FROM users WHERE age > $1', 25)
    for user in users:
        print(dict(user))
    
    # 插入
    await conn.execute(
        'INSERT INTO users (name, email, age) VALUES ($1, $2, $3)',
        '赵六', 'zhaoliu@example.com', 35
    )
    
    # 关闭连接
    await conn.close()

asyncio.run(main())
```

## 性能优化

### 索引优化

```python
# B-tree 索引（默认）
cursor.execute('CREATE INDEX idx_email ON users(email)')

# 唯一索引
cursor.execute('CREATE UNIQUE INDEX idx_email_unique ON users(email)')

# 组合索引
cursor.execute('CREATE INDEX idx_name_age ON users(name, age)')

# GIN 索引（用于 JSONB、全文搜索）
cursor.execute('CREATE INDEX idx_attributes ON products USING GIN(attributes)')

# 部分索引
cursor.execute('CREATE INDEX idx_active_users ON users(email) WHERE is_active = true')

# 查看索引使用情况
cursor.execute('EXPLAIN ANALYZE SELECT * FROM users WHERE email = %s', ('test@example.com',))
plan = cursor.fetchall()
```

### VACUUM 和 ANALYZE

```python
# 清理死元组
cursor.execute('VACUUM users')

# 更新统计信息
cursor.execute('ANALYZE users')

# 完整清理
cursor.execute('VACUUM FULL users')

conn.commit()
```

## 实用工具类

```python
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

class PostgresDB:
    def __init__(self, host, database, user, password):
        self.config = {
            'host': host,
            'database': database,
            'user': user,
            'password': password
        }
    
    @contextmanager
    def get_connection(self):
        conn = psycopg2.connect(**self.config)
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def execute(self, sql, params=None):
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(sql, params)
                try:
                    return cursor.fetchall()
                except psycopg2.ProgrammingError:
                    return None

# 使用
db = PostgresDB('localhost', 'test_db', 'postgres', 'password')
users = db.execute('SELECT * FROM users WHERE age > %s', (25,))
```

## SQLAlchemy 集成

```python
from sqlalchemy import create_engine

# 创建引擎
engine = create_engine('postgresql://postgres:password@localhost:5432/test_db')

# 使用 SQLAlchemy ORM（参考 SQLAlchemy 章节）
```

## 最佳实践

::: tip 性能建议
1. **使用连接池**，避免频繁创建连接
2. **合理使用索引**，但避免过度索引
3. **JSONB 优于 JSON**，性能更好
4. **定期 VACUUM**，清理死元组
5. **批量操作**使用 `execute_values`
:::

::: warning 安全建议
1. **使用参数化查询**，防止 SQL 注入
2. **最小权限原则**，不同应用使用不同账号
3. **启用 SSL 连接**（生产环境）
4. **定期备份**，使用 `pg_dump` 和 `pg_restore`
:::

## 练习

1. 创建一个包含 JSONB 字段的商品表，实现灵活的属性存储
2. 使用全文搜索实现文章搜索功能
3. 使用窗口函数实现用户排行榜
4. 使用 CTE 查询树形结构数据（如评论回复）
