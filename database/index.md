# 数据库

Python 数据库操作笔记，涵盖关系型数据库（MySQL、PostgreSQL、SQLite）、NoSQL 数据库（Redis、MongoDB）以及 ORM 框架（SQLAlchemy）。

## 学习路线

```
SQLite (入门) → MySQL (核心) → SQLAlchemy (ORM) → Redis (缓存) → MongoDB (NoSQL)
```

## 章节概览

### 关系型数据库

- **[SQLite 基础](01-sqlite.md)** - Python 内置数据库，适合小型项目和原型开发
- **[MySQL 基础](02-mysql-basics.md)** - 最流行的开源关系型数据库，CRUD 操作
- **[MySQL 进阶](03-mysql-advanced.md)** - 事务、索引、连接池、性能优化
- **[SQLAlchemy ORM](04-sqlalchemy.md)** - Python 最强大的 ORM 框架
- **[PostgreSQL](07-postgresql.md)** - 功能强大的开源数据库，支持 JSON、全文搜索

### NoSQL 数据库

- **[Redis 缓存](05-redis.md)** - 高性能键值存储，缓存、会话、消息队列
- **[MongoDB 文档数据库](06-mongodb.md)** - 灵活的 JSON 风格文档存储

### 工程实践

- **[最佳实践](08-best-practices.md)** - 连接池管理、SQL 注入防护、性能优化

## 技术选型建议

| 场景 | 推荐方案 |
|------|---------|
| Web 应用主数据库 | MySQL / PostgreSQL |
| 小型项目/本地存储 | SQLite |
| 缓存/会话存储 | Redis |
| 灵活数据结构/日志存储 | MongoDB |
| 复杂查询/地理数据 | PostgreSQL |
