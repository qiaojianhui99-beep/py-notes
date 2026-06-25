# SQLAlchemy ORM

SQLAlchemy 是 Python 最强大和最流行的 ORM（对象关系映射）框架，提供了高级的数据库抽象层。

## 什么是 ORM？

ORM 将数据库表映射为 Python 类，将表中的行映射为对象，使用面向对象的方式操作数据库。

**优点**：
- 数据库无关性（可轻松切换数据库）
- 自动处理 SQL 拼接和类型转换
- 防止 SQL 注入
- 代码更简洁易维护

**缺点**：
- 性能开销（相比原生 SQL）
- 学习成本较高
- 复杂查询可能不够灵活

## 安装

```bash
# 安装 SQLAlchemy
pip install sqlalchemy

# 安装数据库驱动（根据需要选择）
pip install pymysql        # MySQL
pip install psycopg2       # PostgreSQL
# SQLite 无需额外安装
```

## 快速开始

### 创建引擎和会话

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 创建数据库引擎
# 格式：dialect+driver://username:password@host:port/database
engine = create_engine(
    'mysql+pymysql://root:password@localhost:3306/test_db',
    echo=True,              # 打印 SQL 语句（调试用）
    pool_size=5,            # 连接池大小
    max_overflow=10         # 最大溢出连接数
)

# 创建会话工厂
Session = sessionmaker(bind=engine)

# 创建会话实例
session = Session()
```

### 定义模型

```python
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import declarative_base
from datetime import datetime

# 创建基类
Base = declarative_base()

# 定义用户模型
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True)
    age = Column(Integer)
    created_at = Column(DateTime, default=datetime.now)
    
    def __repr__(self):
        return f'<User(name={self.name}, email={self.email})>'

# 创建所有表
Base.metadata.create_all(engine)
```

## CRUD 操作

### 插入数据

```python
from sqlalchemy.orm import Session

# 创建会话
session = Session(engine)

# 单条插入
user = User(name='张三', email='zhangsan@example.com', age=25)
session.add(user)
session.commit()

print(f'插入的 ID: {user.id}')

# 批量插入
users = [
    User(name='李四', email='lisi@example.com', age=30),
    User(name='王五', email='wangwu@example.com', age=28),
]
session.add_all(users)
session.commit()

# 关闭会话
session.close()
```

### 查询数据

```python
# 查询所有
users = session.query(User).all()
for user in users:
    print(user)

# 查询单条
user = session.query(User).filter(User.id == 1).first()
print(user.name)

# 条件查询
users = session.query(User).filter(User.age > 25).all()

# 多条件（AND）
users = session.query(User).filter(
    User.age > 20,
    User.name.like('%张%')
).all()

# OR 条件
from sqlalchemy import or_
users = session.query(User).filter(
    or_(User.age > 30, User.name == '张三')
).all()

# 排序
users = session.query(User).order_by(User.age.desc()).all()

# 限制数量
users = session.query(User).limit(10).all()

# 分页
page = 1
page_size = 10
users = session.query(User).offset((page - 1) * page_size).limit(page_size).all()

# 统计数量
count = session.query(User).count()
print(f'总用户数: {count}')

# 选择特定字段
results = session.query(User.name, User.age).all()
```

### 更新数据

```python
# 方式一：先查询再修改
user = session.query(User).filter(User.id == 1).first()
if user:
    user.age = 26
    session.commit()

# 方式二：批量更新
session.query(User).filter(User.age < 20).update({User.age: 20})
session.commit()

# 方式三：使用字典更新
user = session.query(User).filter(User.id == 1).first()
user_data = {'age': 27, 'email': 'newemail@example.com'}
for key, value in user_data.items():
    setattr(user, key, value)
session.commit()
```

### 删除数据

```python
# 方式一：先查询再删除
user = session.query(User).filter(User.id == 1).first()
if user:
    session.delete(user)
    session.commit()

# 方式二：批量删除
session.query(User).filter(User.age < 18).delete()
session.commit()
```

## 关系映射

### 一对多关系

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    
    # 关系：一个用户有多篇文章
    posts = relationship('Post', back_populates='author')

class Post(Base):
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(100))
    content = Column(Text)
    user_id = Column(Integer, ForeignKey('users.id'))
    
    # 关系：一篇文章属于一个用户
    author = relationship('User', back_populates='posts')

# 使用
user = session.query(User).filter(User.id == 1).first()
print(f'{user.name} 的文章:')
for post in user.posts:
    print(f'  - {post.title}')
```

### 多对多关系

```python
from sqlalchemy import Table

# 中间表
student_course = Table(
    'student_course',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('course_id', Integer, ForeignKey('courses.id'))
)

class Student(Base):
    __tablename__ = 'students'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    
    courses = relationship('Course', secondary=student_course, back_populates='students')

class Course(Base):
    __tablename__ = 'courses'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    
    students = relationship('Student', secondary=student_course, back_populates='courses')

# 使用
student = Student(name='张三')
course1 = Course(name='Python')
course2 = Course(name='数据库')

student.courses.append(course1)
student.courses.append(course2)

session.add(student)
session.commit()
```

## 事务管理

```python
from sqlalchemy.orm import Session

session = Session(engine)

try:
    # 开始事务（自动）
    user1 = User(name='用户1', email='user1@example.com')
    user2 = User(name='用户2', email='user2@example.com')
    
    session.add(user1)
    session.add(user2)
    
    # 提交事务
    session.commit()
    print('事务提交成功')
    
except Exception as e:
    # 回滚事务
    session.rollback()
    print(f'事务回滚: {e}')
    
finally:
    session.close()
```

### 使用上下文管理器

```python
from contextlib import contextmanager

@contextmanager
def get_session():
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# 使用
with get_session() as session:
    user = User(name='张三', email='zhangsan@example.com')
    session.add(user)
```

## 高级查询

### 聚合查询

```python
from sqlalchemy import func

# 计数
count = session.query(func.count(User.id)).scalar()

# 平均值
avg_age = session.query(func.avg(User.age)).scalar()

# 最大值、最小值
max_age = session.query(func.max(User.age)).scalar()
min_age = session.query(func.min(User.age)).scalar()

# 分组统计
results = session.query(
    User.age,
    func.count(User.id).label('count')
).group_by(User.age).all()

for age, count in results:
    print(f'年龄 {age}: {count} 人')
```

### JOIN 查询

```python
# INNER JOIN
results = session.query(User, Post).join(Post).all()

# LEFT JOIN
results = session.query(User, Post).outerjoin(Post).all()

# 指定连接条件
results = session.query(User).join(Post, User.id == Post.user_id).all()
```

### 子查询

```python
from sqlalchemy import select

# 子查询
subq = session.query(
    Post.user_id,
    func.count(Post.id).label('post_count')
).group_by(Post.user_id).subquery()

# 使用子查询
results = session.query(
    User.name,
    subq.c.post_count
).join(subq, User.id == subq.c.user_id).all()
```

## 性能优化

### 延迟加载与立即加载

```python
from sqlalchemy.orm import joinedload, subqueryload

# 延迟加载（默认）：访问关系时才查询
user = session.query(User).first()
posts = user.posts  # 此时才查询 posts

# 立即加载：一次性加载关系
users = session.query(User).options(joinedload(User.posts)).all()

# 子查询加载（适合一对多）
users = session.query(User).options(subqueryload(User.posts)).all()
```

### 批量操作

```python
# 批量插入（高效）
session.bulk_insert_mappings(User, [
    {'name': f'用户{i}', 'email': f'user{i}@example.com', 'age': 20 + i}
    for i in range(1000)
])
session.commit()

# 批量更新
session.bulk_update_mappings(User, [
    {'id': 1, 'age': 26},
    {'id': 2, 'age': 31},
])
session.commit()
```

## 数据库迁移（Alembic）

```bash
pip install alembic
```

```bash
# 初始化 Alembic
alembic init alembic

# 生成迁移脚本
alembic revision --autogenerate -m "创建用户表"

# 执行迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

## 实用技巧

### 自动更新时间戳

```python
from sqlalchemy import Column, DateTime
from datetime import datetime

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
```

### 软删除

```python
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    is_deleted = Column(Integer, default=0)
    
    # 查询时自动过滤已删除记录
    __mapper_args__ = {
        'query_class': lambda cls: session.query(cls).filter(cls.is_deleted == 0)
    }
```

## 练习

1. 设计博客系统模型：用户、文章、评论、标签（多对多）
2. 实现文章的增删改查，包括关联的标签
3. 统计每个用户的文章数和评论数
4. 使用 Alembic 管理数据库版本

---

## ORM 性能优化

### N+1 查询问题

#### 什么是 N+1 问题

N+1 问题是 ORM 最常见的性能陷阱：

```python
# ❌ N+1 问题示例
users = session.query(User).all()  # 1 次查询

for user in users:
    print(user.posts)  # 每个 user 触发 1 次查询
    # 如果有 10 个用户，总共执行 1 + 10 = 11 次查询
```

**SQL 执行情况：**

```sql
-- 第 1 次查询：获取所有用户
SELECT * FROM users;

-- 第 2-11 次查询：每个用户的文章
SELECT * FROM posts WHERE user_id = 1;
SELECT * FROM posts WHERE user_id = 2;
...
SELECT * FROM posts WHERE user_id = 10;
```

**性能影响：**

| 用户数 | 查询次数 | 耗时（假设每次 10ms） |
|--------|---------|---------------------|
| 10 | 11 | 110ms |
| 100 | 101 | 1010ms（1 秒） |
| 1000 | 1001 | 10010ms（10 秒） |

#### 解决方案：joinedload

使用 **急加载（Eager Loading）** 一次性获取所有数据：

```python
from sqlalchemy.orm import joinedload

# ✅ 使用 joinedload（JOIN 查询）
users = session.query(User).options(joinedload(User.posts)).all()

for user in users:
    print(user.posts)  # 不会触发额外查询
```

**SQL 执行情况：**

```sql
-- 只执行 1 次查询（LEFT OUTER JOIN）
SELECT users.*, posts.*
FROM users
LEFT OUTER JOIN posts ON users.id = posts.user_id;
```

#### 解决方案：subqueryload

适用于一对多关系，避免笛卡尔积：

```python
from sqlalchemy.orm import subqueryload

# ✅ 使用 subqueryload（子查询）
users = session.query(User).options(subqueryload(User.posts)).all()
```

**SQL 执行情况：**

```sql
-- 第 1 次查询：获取用户
SELECT * FROM users;

-- 第 2 次查询：使用 IN 子查询获取所有文章
SELECT * FROM posts 
WHERE posts.user_id IN (1, 2, 3, ...);
```

**总共只执行 2 次查询，而不是 N+1 次！**

#### 对比：lazy vs joinedload vs subqueryload

```python
from sqlalchemy.orm import joinedload, subqueryload

# 1. 默认（lazy）- N+1 问题
users = session.query(User).all()
# SQL: SELECT * FROM users
for user in users:
    print(user.posts)  # 每次都查询

# 2. joinedload - 1 次查询（JOIN）
users = session.query(User).options(joinedload(User.posts)).all()
# SQL: SELECT users.*, posts.* FROM users LEFT JOIN posts ...

# 3. subqueryload - 2 次查询（IN 子查询）
users = session.query(User).options(subqueryload(User.posts)).all()
# SQL: SELECT * FROM users
#      SELECT * FROM posts WHERE user_id IN (...)

# 4. selectinload - 2 次查询（IN 查询，推荐）
from sqlalchemy.orm import selectinload
users = session.query(User).options(selectinload(User.posts)).all()
```

**选择建议：**

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 一对一/多对一 | `joinedload` | JOIN 效率高，数据量小 |
| 一对多 | `selectinload` | 避免笛卡尔积 |
| 多层嵌套 | `selectinload` | 多个 JOIN 会很慢 |

### 加载策略

#### 懒加载（lazy）

默认策略，访问时才查询：

```python
class User(Base):
    __tablename__ = 'users'
    posts = relationship('Post', lazy='select')  # 默认

# 使用
user = session.query(User).first()
print(user.posts)  # 触发查询
```

#### 急加载（eager）

关系定义时设置：

```python
class User(Base):
    __tablename__ = 'users'
    posts = relationship('Post', lazy='joined')  # 总是 JOIN

# 使用
user = session.query(User).first()
# SQL 自动包含 JOIN
print(user.posts)  # 不触发额外查询
```

#### selectinload

推荐用于一对多关系：

```python
from sqlalchemy.orm import selectinload

# 查询用户及其所有文章
users = session.query(User).options(
    selectinload(User.posts)
).all()

# 多层嵌套
users = session.query(User).options(
    selectinload(User.posts).selectinload(Post.comments)
).all()
```

#### joinedload

适用于一对一或多对一：

```python
from sqlalchemy.orm import joinedload

# 查询文章及其作者
posts = session.query(Post).options(
    joinedload(Post.author)
).all()
```

#### 动态加载策略

```python
# 运行时决定加载策略
def get_users(with_posts=False):
    query = session.query(User)
    
    if with_posts:
        query = query.options(selectinload(User.posts))
    
    return query.all()

# 不需要文章时
users = get_users(with_posts=False)

# 需要文章时
users = get_users(with_posts=True)
```

### 查询性能分析

#### EXPLAIN 分析

```python
from sqlalchemy import text

# 查看查询计划
query = session.query(User).filter(User.email == 'test@example.com')

# 获取 SQL
print(str(query.statement.compile(compile_kwargs={"literal_binds": True})))

# 执行 EXPLAIN
sql = str(query.statement)
result = session.execute(text(f"EXPLAIN {sql}"))
for row in result:
    print(row)
```

#### 慢查询日志

```python
import logging

# 启用 SQL 日志
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# 执行查询，日志会显示 SQL 和耗时
users = session.query(User).all()
```

#### 使用 SQLAlchemy 查询日志

```python
from sqlalchemy import event
from sqlalchemy.engine import Engine
import time

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault('query_start_time', []).append(time.time())

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - conn.info['query_start_time'].pop(-1)
    print(f"Query: {statement}")
    print(f"Time: {total:.4f}s")
    print("-" * 80)
```

### 批量操作优化

#### bulk_insert_mappings

批量插入（绕过 ORM）：

```python
# ❌ 慢：逐条插入
for i in range(1000):
    user = User(name=f'user_{i}', email=f'user_{i}@example.com')
    session.add(user)
session.commit()
# 执行 1000 次 INSERT

# ✅ 快：批量插入
users_data = [
    {'name': f'user_{i}', 'email': f'user_{i}@example.com'}
    for i in range(1000)
]
session.bulk_insert_mappings(User, users_data)
session.commit()
# 执行 1 次批量 INSERT
```

**性能对比：**

| 方式 | 1000 条数据耗时 | 说明 |
|------|---------------|------|
| 逐条 add() | ~5 秒 | 每条都触发事件和验证 |
| bulk_insert_mappings() | ~0.1 秒 | 绕过 ORM，直接插入 |

#### bulk_update_mappings

批量更新：

```python
# ❌ 慢：逐条更新
users = session.query(User).all()
for user in users:
    user.status = 'active'
session.commit()

# ✅ 快：批量更新
updates = [
    {'id': user.id, 'status': 'active'}
    for user in session.query(User).all()
]
session.bulk_update_mappings(User, updates)
session.commit()
```

#### 批量删除

```python
# ❌ 慢：逐条删除
users = session.query(User).filter(User.status == 'inactive').all()
for user in users:
    session.delete(user)
session.commit()

# ✅ 快：批量删除
session.query(User).filter(User.status == 'inactive').delete()
session.commit()
```

### 其他优化技巧

#### 只查询需要的列

```python
# ❌ 查询所有列
users = session.query(User).all()

# ✅ 只查询需要的列
users = session.query(User.id, User.name).all()
# 或
from sqlalchemy import select
stmt = select(User.id, User.name)
users = session.execute(stmt).all()
```

#### 分页优化

```python
# ❌ 使用 OFFSET（大偏移量很慢）
users = session.query(User).offset(10000).limit(10).all()

# ✅ 使用游标分页（基于 ID）
last_id = 10000
users = session.query(User).filter(User.id > last_id).limit(10).all()
```

#### 连接池配置

```python
from sqlalchemy import create_engine

engine = create_engine(
    'postgresql://user:pass@localhost/db',
    pool_size=10,           # 连接池大小
    max_overflow=20,        # 最大溢出连接数
    pool_timeout=30,        # 获取连接超时时间
    pool_recycle=3600,      # 连接回收时间（秒）
    pool_pre_ping=True      # 使用前检查连接是否有效
)
```

#### 使用索引

```python
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    email = Column(String(100), unique=True, index=True)  # 添加索引
    username = Column(String(50), index=True)
    
    # 复合索引
    __table_args__ = (
        Index('ix_user_email_status', 'email', 'status'),
    )
```

#### 避免在循环中查询

```python
# ❌ 错误：在循环中查询
post_ids = [1, 2, 3, 4, 5]
for post_id in post_ids:
    post = session.query(Post).filter(Post.id == post_id).first()
    print(post.title)

# ✅ 正确：一次性查询
posts = session.query(Post).filter(Post.id.in_(post_ids)).all()
for post in posts:
    print(post.title)
```

---

## 性能优化总结

**核心原则：**

1. **减少查询次数** - 使用 joinedload/selectinload 解决 N+1 问题
2. **只查询需要的数据** - 限制列、使用分页
3. **批量操作** - bulk_insert/update/delete
4. **使用索引** - 在常查询的列上添加索引
5. **连接池配置** - 合理设置连接池参数
6. **分析优化** - 使用 EXPLAIN 分析慢查询

**优化检查清单：**

- [ ] 是否存在 N+1 查询？使用 selectinload
- [ ] 是否查询了不需要的列？只查询必要字段
- [ ] 是否有大量插入/更新？使用 bulk 操作
- [ ] 查询条件的列是否有索引？添加索引
- [ ] 分页是否使用了大偏移量？使用游标分页
- [ ] 是否在循环中查询？改为批量查询

**下一步学习：**
- [Alembic 数据库迁移](./11-alembic.md) - 数据库版本控制
- [MySQL 进阶](./03-mysql-advanced.md) - 索引与查询优化
- [项目实战](./09-project.md) - 完整的性能优化实践
