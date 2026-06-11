# MySQL 基础

MySQL 是最流行的开源关系型数据库，广泛应用于 Web 开发。本章介绍如何使用 Python 连接和操作 MySQL。

## 安装驱动

Python 连接 MySQL 需要安装第三方库：

```bash
# 方案一：PyMySQL（纯 Python 实现，推荐）
pip install pymysql

# 方案二：MySQL Connector（MySQL 官方）
pip install mysql-connector-python
```

本教程使用 **PyMySQL**。

## 连接数据库

### 基本连接

```python
import pymysql

# 创建连接
conn = pymysql.connect(
    host='localhost',      # 数据库地址
    port=3306,             # 端口
    user='root',           # 用户名
    password='your_password',  # 密码
    database='test_db',    # 数据库名
    charset='utf8mb4'      # 字符集
)

# 创建游标
cursor = conn.cursor()

# 关闭连接
cursor.close()
conn.close()
```

### 使用上下文管理器

```python
import pymysql

try:
    with pymysql.connect(
        host='localhost',
        user='root',
        password='your_password',
        database='test_db',
        charset='utf8mb4'
    ) as conn:
        with conn.cursor() as cursor:
            # 执行操作
            cursor.execute('SELECT VERSION()')
            version = cursor.fetchone()
            print(f'MySQL 版本: {version[0]}')
            
except pymysql.Error as e:
    print(f'数据库错误: {e}')
```

## 创建数据库和表

### 创建数据库

```python
import pymysql

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='your_password',
    charset='utf8mb4'
)

cursor = conn.cursor()

# 创建数据库
cursor.execute('CREATE DATABASE IF NOT EXISTS test_db DEFAULT CHARACTER SET utf8mb4')
cursor.execute('USE test_db')

conn.close()
```

### 创建表

```python
create_table_sql = '''
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
'''

cursor.execute(create_table_sql)
```

## CRUD 操作

### 插入数据

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

# 单条插入
sql = 'INSERT INTO users (name, email, age) VALUES (%s, %s, %s)'
cursor.execute(sql, ('张三', 'zhangsan@example.com', 25))

# 获取插入的自增 ID
user_id = cursor.lastrowid
print(f'插入的 ID: {user_id}')

# 提交事务
conn.commit()

cursor.close()
conn.close()
```

::: tip 占位符
PyMySQL 使用 `%s` 作为占位符（不论数据类型），防止 SQL 注入。
:::

### 批量插入

```python
users = [
    ('李四', 'lisi@example.com', 30),
    ('王五', 'wangwu@example.com', 28),
    ('赵六', 'zhaoliu@example.com', 35),
]

sql = 'INSERT INTO users (name, email, age) VALUES (%s, %s, %s)'
cursor.executemany(sql, users)
conn.commit()

print(f'插入了 {cursor.rowcount} 行')
```

### 查询数据

```python
# 查询所有
cursor.execute('SELECT * FROM users')
rows = cursor.fetchall()

for row in rows:
    print(row)  # 返回元组

# 查询单条
cursor.execute('SELECT * FROM users WHERE id = %s', (1,))
user = cursor.fetchone()
print(user)

# 条件查询
cursor.execute('SELECT name, email FROM users WHERE age > %s', (25,))
results = cursor.fetchall()
```

### 返回字典格式

```python
import pymysql.cursors

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='your_password',
    database='test_db',
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor  # 字典游标
)

cursor = conn.cursor()
cursor.execute('SELECT * FROM users WHERE id = %s', (1,))
user = cursor.fetchone()

# 字典形式访问
print(user['name'])
print(user['email'])
```

### 更新数据

```python
sql = 'UPDATE users SET age = %s WHERE name = %s'
cursor.execute(sql, (26, '张三'))
conn.commit()

print(f'更新了 {cursor.rowcount} 行')
```

### 删除数据

```python
sql = 'DELETE FROM users WHERE age < %s'
cursor.execute(sql, (20,))
conn.commit()

print(f'删除了 {cursor.rowcount} 行')
```

## 事务处理

```python
import pymysql

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='your_password',
    database='test_db',
    charset='utf8mb4',
    autocommit=False  # 关闭自动提交（默认）
)

cursor = conn.cursor()

try:
    # 转账操作示例
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

## 预防 SQL 注入

::: danger SQL 注入风险
永远不要使用字符串拼接构建 SQL 语句！
:::

```python
# ❌ 错误示例（有 SQL 注入风险）
name = input('请输入姓名: ')
sql = f"SELECT * FROM users WHERE name = '{name}'"
cursor.execute(sql)

# ✅ 正确示例（使用参数化查询）
name = input('请输入姓名: ')
sql = 'SELECT * FROM users WHERE name = %s'
cursor.execute(sql, (name,))
```

## 实用工具函数

### 封装数据库操作类

```python
import pymysql
from contextlib import contextmanager

class Database:
    def __init__(self, host, user, password, database):
        self.config = {
            'host': host,
            'user': user,
            'password': password,
            'database': database,
            'charset': 'utf8mb4',
            'cursorclass': pymysql.cursors.DictCursor
        }
    
    @contextmanager
    def get_connection(self):
        conn = pymysql.connect(**self.config)
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
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                return cursor.fetchall()

# 使用示例
db = Database('localhost', 'root', 'password', 'test_db')
users = db.execute('SELECT * FROM users WHERE age > %s', (25,))
```

## 常见问题

### 中文乱码

确保以下三处字符集一致：
1. 数据库字符集：`utf8mb4`
2. 表字符集：`utf8mb4`
3. 连接字符集：`charset='utf8mb4'`

### 时区问题

```python
conn = pymysql.connect(
    ...,
    init_command="SET time_zone='+08:00'"  # 设置为东八区
)
```

## 练习

1. 创建一个学生成绩管理系统（students、courses、scores 三张表）
2. 实现学生信息的增删改查
3. 查询某个学生的所有课程成绩
4. 统计每个学生的平均分
