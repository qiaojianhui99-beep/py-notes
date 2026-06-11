# 实战项目

通过一个完整的博客系统项目，整合 MySQL、Redis、SQLAlchemy，实践数据库操作的各个方面。

## 项目需求

构建一个博客系统，包含以下功能：
- 用户注册、登录、会话管理
- 文章的增删改查
- 文章缓存
- 评论功能
- 标签系统（多对多）
- 浏览量统计

## 技术栈

- **数据库**：MySQL 8.0+
- **ORM**：SQLAlchemy
- **缓存**：Redis
- **密码加密**：bcrypt

## 环境准备

```bash
pip install sqlalchemy pymysql redis bcrypt
```

## 数据库模型设计

```python
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Table, ForeignKey
from sqlalchemy.orm import declarative_base, relationship, Session
from datetime import datetime

Base = declarative_base()

# 文章-标签关联表（多对多）
post_tags = Table(
    'post_tags',
    Base.metadata,
    Column('post_id', Integer, ForeignKey('posts.id', ondelete='CASCADE')),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'))
)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    posts = relationship('Post', back_populates='author', cascade='all, delete-orphan')
    comments = relationship('Comment', back_populates='user', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'

class Post(Base):
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False, index=True)
    content = Column(Text, nullable=False)
    views = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    author = relationship('User', back_populates='posts')
    comments = relationship('Comment', back_populates='post', cascade='all, delete-orphan')
    tags = relationship('Tag', secondary=post_tags, back_populates='posts')
    
    def __repr__(self):
        return f'<Post {self.title}>'

class Comment(Base):
    __tablename__ = 'comments'
    
    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    user = relationship('User', back_populates='comments')
    post = relationship('Post', back_populates='comments')
    
    def __repr__(self):
        return f'<Comment by {self.user_id}>'

class Tag(Base):
    __tablename__ = 'tags'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    
    posts = relationship('Post', secondary=post_tags, back_populates='tags')
    
    def __repr__(self):
        return f'<Tag {self.name}>'
```

## 数据库和缓存管理

```python
import redis
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

# 数据库配置
DATABASE_URL = 'mysql+pymysql://root:password@localhost:3306/blog_db?charset=utf8mb4'

# 创建引擎
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False
)

# 创建表
Base.metadata.create_all(engine)

# 会话工厂
SessionLocal = sessionmaker(bind=engine)

# Redis 连接
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

@contextmanager
def get_db():
    """数据库会话上下文管理器"""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
```

## 用户模块

```python
import bcrypt
import secrets

class UserService:
    @staticmethod
    def hash_password(password: str) -> str:
        """加密密码"""
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """验证密码"""
        return bcrypt.checkpw(password.encode(), hashed.encode())
    
    @staticmethod
    def register(username: str, email: str, password: str):
        """用户注册"""
        with get_db() as session:
            # 检查用户名是否存在
            if session.query(User).filter(User.username == username).first():
                raise ValueError('用户名已存在')
            
            # 检查邮箱是否存在
            if session.query(User).filter(User.email == email).first():
                raise ValueError('邮箱已被注册')
            
            # 创建用户
            user = User(
                username=username,
                email=email,
                password=UserService.hash_password(password)
            )
            session.add(user)
            session.flush()
            
            return user.id
    
    @staticmethod
    def login(username: str, password: str):
        """用户登录"""
        with get_db() as session:
            user = session.query(User).filter(User.username == username).first()
            
            if not user or not UserService.verify_password(password, user.password):
                raise ValueError('用户名或密码错误')
            
            # 生成会话 token
            token = secrets.token_urlsafe(32)
            
            # 存储到 Redis（30 分钟过期）
            redis_client.setex(
                f'session:{token}',
                1800,
                user.id
            )
            
            return token
    
    @staticmethod
    def logout(token: str):
        """用户登出"""
        redis_client.delete(f'session:{token}')
    
    @staticmethod
    def get_user_by_token(token: str):
        """通过 token 获取用户"""
        user_id = redis_client.get(f'session:{token}')
        if not user_id:
            return None
        
        with get_db() as session:
            return session.query(User).filter(User.id == int(user_id)).first()
```

## 文章模块

```python
import json

class PostService:
    @staticmethod
    def create_post(user_id: int, title: str, content: str, tag_names: list = None):
        """创建文章"""
        with get_db() as session:
            post = Post(
                title=title,
                content=content,
                user_id=user_id
            )
            
            # 处理标签
            if tag_names:
                for tag_name in tag_names:
                    tag = session.query(Tag).filter(Tag.name == tag_name).first()
                    if not tag:
                        tag = Tag(name=tag_name)
                        session.add(tag)
                    post.tags.append(tag)
            
            session.add(post)
            session.flush()
            
            return post.id
    
    @staticmethod
    def get_post(post_id: int):
        """获取文章（带缓存）"""
        cache_key = f'post:{post_id}'
        
        # 尝试从缓存获取
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        # 从数据库获取
        with get_db() as session:
            post = session.query(Post).filter(Post.id == post_id).first()
            if not post:
                return None
            
            # 增加浏览量
            post.views += 1
            session.flush()
            
            # 构建返回数据
            post_data = {
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'views': post.views,
                'author': post.author.username,
                'tags': [tag.name for tag in post.tags],
                'created_at': post.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # 写入缓存（5 分钟）
            redis_client.setex(cache_key, 300, json.dumps(post_data))
            
            return post_data
    
    @staticmethod
    def update_post(post_id: int, user_id: int, title: str = None, content: str = None):
        """更新文章"""
        with get_db() as session:
            post = session.query(Post).filter(
                Post.id == post_id,
                Post.user_id == user_id
            ).first()
            
            if not post:
                raise ValueError('文章不存在或无权限')
            
            if title:
                post.title = title
            if content:
                post.content = content
            
            session.flush()
            
            # 清除缓存
            redis_client.delete(f'post:{post_id}')
    
    @staticmethod
    def delete_post(post_id: int, user_id: int):
        """删除文章"""
        with get_db() as session:
            post = session.query(Post).filter(
                Post.id == post_id,
                Post.user_id == user_id
            ).first()
            
            if not post:
                raise ValueError('文章不存在或无权限')
            
            session.delete(post)
            session.flush()
            
            # 清除缓存
            redis_client.delete(f'post:{post_id}')
    
    @staticmethod
    def get_posts(page: int = 1, page_size: int = 20, tag: str = None):
        """获取文章列表"""
        with get_db() as session:
            query = session.query(Post)
            
            # 按标签过滤
            if tag:
                query = query.join(Post.tags).filter(Tag.name == tag)
            
            # 分页
            offset = (page - 1) * page_size
            posts = query.order_by(Post.created_at.desc()).offset(offset).limit(page_size).all()
            
            return [{
                'id': p.id,
                'title': p.title,
                'author': p.author.username,
                'views': p.views,
                'tags': [tag.name for tag in p.tags],
                'created_at': p.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for p in posts]
```

## 评论模块

```python
class CommentService:
    @staticmethod
    def add_comment(user_id: int, post_id: int, content: str):
        """添加评论"""
        with get_db() as session:
            # 检查文章是否存在
            post = session.query(Post).filter(Post.id == post_id).first()
            if not post:
                raise ValueError('文章不存在')
            
            comment = Comment(
                content=content,
                user_id=user_id,
                post_id=post_id
            )
            session.add(comment)
            session.flush()
            
            # 清除文章缓存
            redis_client.delete(f'post:{post_id}')
            
            return comment.id
    
    @staticmethod
    def get_comments(post_id: int):
        """获取文章的所有评论"""
        with get_db() as session:
            comments = session.query(Comment).filter(
                Comment.post_id == post_id
            ).order_by(Comment.created_at.desc()).all()
            
            return [{
                'id': c.id,
                'content': c.content,
                'user': c.user.username,
                'created_at': c.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for c in comments]
    
    @staticmethod
    def delete_comment(comment_id: int, user_id: int):
        """删除评论"""
        with get_db() as session:
            comment = session.query(Comment).filter(
                Comment.id == comment_id,
                Comment.user_id == user_id
            ).first()
            
            if not comment:
                raise ValueError('评论不存在或无权限')
            
            post_id = comment.post_id
            session.delete(comment)
            session.flush()
            
            # 清除文章缓存
            redis_client.delete(f'post:{post_id}')
```

## 使用示例

```python
# 1. 用户注册
try:
    user_id = UserService.register('zhangsan', 'zhangsan@example.com', '123456')
    print(f'注册成功，用户 ID: {user_id}')
except ValueError as e:
    print(f'注册失败: {e}')

# 2. 用户登录
token = UserService.login('zhangsan', '123456')
print(f'登录成功，Token: {token}')

# 3. 创建文章
user = UserService.get_user_by_token(token)
post_id = PostService.create_post(
    user_id=user.id,
    title='Python 数据库教程',
    content='这是一篇关于 Python 数据库操作的文章...',
    tag_names=['python', 'database', 'tutorial']
)
print(f'文章创建成功，ID: {post_id}')

# 4. 获取文章（第一次从数据库，第二次从缓存）
post = PostService.get_post(post_id)
print(f'文章标题: {post["title"]}')
print(f'浏览量: {post["views"]}')

# 5. 添加评论
CommentService.add_comment(user.id, post_id, '写得不错！')

# 6. 获取评论列表
comments = CommentService.get_comments(post_id)
for comment in comments:
    print(f'{comment["user"]}: {comment["content"]}')

# 7. 获取文章列表
posts = PostService.get_posts(page=1, page_size=10)
for p in posts:
    print(f'{p["title"]} - {p["author"]} - 浏览 {p["views"]}')

# 8. 按标签筛选
python_posts = PostService.get_posts(tag='python')

# 9. 用户登出
UserService.logout(token)
```

## 性能优化要点

1. **使用连接池**：`pool_size=10, max_overflow=20`
2. **Redis 缓存**：文章详情缓存 5 分钟
3. **会话管理**：使用 Redis 存储用户会话
4. **索引优化**：在 username、email、title、tag name 上创建索引
5. **批量操作**：使用 `session.add_all()` 批量插入
6. **延迟加载**：SQLAlchemy 默认延迟加载关系

## 扩展建议

1. 添加文章搜索功能（全文搜索）
2. 实现点赞、收藏功能（使用 Redis Set）
3. 添加热门文章排行榜（使用 Redis Sorted Set）
4. 实现文章草稿功能
5. 添加用户关注功能
6. 实现评论回复（树形结构）

## 完整代码仓库

将以上代码整合到一个 `blog_system.py` 文件中，即可运行完整的博客系统。

这个项目演示了：
- ✅ SQLAlchemy 模型定义和关系映射
- ✅ 数据库连接池管理
- ✅ Redis 缓存策略
- ✅ 用户会话管理
- ✅ 密码加密
- ✅ 多对多关系（文章-标签）
- ✅ 级联删除
- ✅ 分页查询
- ✅ 事务处理
