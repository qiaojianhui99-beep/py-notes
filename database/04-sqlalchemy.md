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
