# SQLite 基础

SQLite 是 Python 内置的轻量级数据库，无需安装额外服务，适合小型项目、原型开发和本地数据存储。

## 特点

- **零配置**：无需独立服务器进程
- **单文件**：整个数据库存储在一个文件中
- **跨平台**：支持 Windows、macOS、Linux
- **ACID 事务**：支持完整的事务特性

## 基本使用

### 连接数据库

```python
import sqlite3

# 连接到数据库（不存在则自动创建）
conn = sqlite3.connect('example.db')

# 创建游标对象
cursor = conn.cursor()

# 使用完毕后关闭
cursor.close()
conn.close()
```

### 使用上下文管理器

```python
import sqlite3

with sqlite3.connect('example.db') as conn:
    cursor = conn.cursor()
    # 执行操作
    # 自动提交事务和关闭连接
```

## CRUD 操作

### 创建表

```python
import sqlite3

with sqlite3.connect('example.db') as conn:
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            age INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
```

### 插入数据

```python
# 单条插入
cursor.execute(
    'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
    ('张三', 'zhangsan@example.com', 25)
)

# 批量插入
users = [
    ('李四', 'lisi@example.com', 30),
    ('王五', 'wangwu@example.com', 28),
]
cursor.executemany(
    'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
    users
)

conn.commit()
```

::: tip 占位符
SQLite 使用 `?` 作为占位符，防止 SQL 注入攻击。
:::

### 查询数据

```python
# 查询所有
cursor.execute('SELECT * FROM users')
rows = cursor.fetchall()
for row in rows:
    print(row)

# 查询单条
cursor.execute('SELECT * FROM users WHERE id = ?', (1,))
user = cursor.fetchone()
print(user)

# 条件查询
cursor.execute('SELECT name, email FROM users WHERE age > ?', (25,))
results = cursor.fetchall()
```

### 返回字典格式

```python
import sqlite3

conn = sqlite3.connect('example.db')
conn.row_factory = sqlite3.Row  # 设置行工厂
cursor = conn.cursor()

cursor.execute('SELECT * FROM users WHERE id = ?', (1,))
user = cursor.fetchone()

# 可以像字典一样访问
print(user['name'])
print(user['email'])
```

### 更新数据

```python
cursor.execute(
    'UPDATE users SET age = ? WHERE name = ?',
    (26, '张三')
)
conn.commit()

print(f'更新了 {cursor.rowcount} 行')
```

### 删除数据

```python
cursor.execute('DELETE FROM users WHERE age < ?', (20,))
conn.commit()

print(f'删除了 {cursor.rowcount} 行')
```

## 事务处理

```python
import sqlite3

conn = sqlite3.connect('example.db')

try:
    cursor = conn.cursor()
    
    # 开始事务（默认自动开启）
    cursor.execute('UPDATE users SET age = age + 1 WHERE id = ?', (1,))
    cursor.execute('UPDATE users SET age = age - 1 WHERE id = ?', (2,))
    
    # 提交事务
    conn.commit()
    print('事务提交成功')
    
except Exception as e:
    # 回滚事务
    conn.rollback()
    print(f'事务回滚: {e}')
    
finally:
    conn.close()
```

## 实用技巧

### 检查表是否存在

```python
cursor.execute("""
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='users'
""")

if cursor.fetchone():
    print('表已存在')
else:
    print('表不存在')
```

### 获取表结构

```python
cursor.execute('PRAGMA table_info(users)')
columns = cursor.fetchall()

for col in columns:
    print(f'{col[1]} - {col[2]}')  # 列名 - 类型
```

### 内存数据库

```python
# 用于临时数据或测试
conn = sqlite3.connect(':memory:')
```

## 常见应用场景

- **桌面应用**：配置文件、本地缓存
- **移动应用**：Android 和 iOS 内置 SQLite
- **原型开发**：快速验证数据模型
- **自动化测试**：使用内存数据库进行单元测试
- **嵌入式系统**：资源受限的环境

## 注意事项

::: warning 并发限制
SQLite 不适合高并发写入场景，单个数据库文件同时只能有一个写操作。
:::

::: warning 数据类型
SQLite 是动态类型系统，类型约束相对宽松。
:::

## 练习

1. 创建一个图书管理系统，包含 `books` 和 `authors` 两张表
2. 实现增删改查功能
3. 使用事务批量插入 1000 条测试数据
4. 查询特定作者的所有图书
