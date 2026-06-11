# MongoDB 文档数据库

MongoDB 是最流行的 NoSQL 文档数据库，使用 JSON 风格的 BSON 格式存储数据，适合灵活的数据结构和快速迭代开发。

## 特点

- **文档模型**：使用类似 JSON 的 BSON 格式
- **动态模式**：无需预定义表结构
- **高性能**：支持索引和分片
- **水平扩展**：原生支持集群
- **丰富查询**：支持复杂查询和聚合

## 安装

### 安装 MongoDB

```bash
# Ubuntu/Debian
sudo apt install mongodb

# macOS
brew tap mongodb/brew
brew install mongodb-community

# Windows
# 下载 MongoDB Community Server 安装包
```

### 安装 Python 驱动

```bash
pip install pymongo
```

## 基本概念

| SQL | MongoDB |
|-----|---------|
| 数据库 (Database) | 数据库 (Database) |
| 表 (Table) | 集合 (Collection) |
| 行 (Row) | 文档 (Document) |
| 列 (Column) | 字段 (Field) |
| 主键 | _id 字段（自动生成） |

## 连接数据库

```python
from pymongo import MongoClient

# 连接到 MongoDB
client = MongoClient('mongodb://localhost:27017/')

# 或使用 URL 格式
client = MongoClient('mongodb://username:password@localhost:27017/')

# 选择数据库
db = client['test_db']

# 选择集合（不存在会自动创建）
collection = db['users']

# 测试连接
client.server_info()
```

## CRUD 操作

### 插入文档

```python
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['test_db']
users = db['users']

# 插入单个文档
user = {
    'name': '张三',
    'email': 'zhangsan@example.com',
    'age': 25,
    'tags': ['python', 'mongodb']
}

result = users.insert_one(user)
print(f'插入的 ID: {result.inserted_id}')

# 插入多个文档
users_data = [
    {'name': '李四', 'email': 'lisi@example.com', 'age': 30},
    {'name': '王五', 'email': 'wangwu@example.com', 'age': 28},
]

result = users.insert_many(users_data)
print(f'插入的 IDs: {result.inserted_ids}')
```

### 查询文档

```python
# 查询所有文档
all_users = users.find()
for user in all_users:
    print(user)

# 查询单个文档
user = users.find_one({'name': '张三'})
print(user)

# 条件查询
users_over_25 = users.find({'age': {'$gt': 25}})

# 多条件查询（AND）
results = users.find({
    'age': {'$gte': 25},
    'name': {'$regex': '^张'}
})

# OR 查询
results = users.find({
    '$or': [
        {'age': {'$gt': 30}},
        {'name': '张三'}
    ]
})

# 指定返回字段
results = users.find(
    {'age': {'$gt': 25}},
    {'name': 1, 'email': 1, '_id': 0}  # 1 表示包含，0 表示排除
)

# 排序
results = users.find().sort('age', -1)  # -1 降序，1 升序

# 限制数量
results = users.find().limit(10)

# 跳过文档（分页）
page = 1
page_size = 10
results = users.find().skip((page - 1) * page_size).limit(page_size)

# 统计数量
count = users.count_documents({'age': {'$gt': 25}})
print(f'年龄大于 25 的用户数: {count}')
```

### 查询操作符

```python
# 比较操作符
users.find({'age': {'$eq': 25}})     # 等于
users.find({'age': {'$ne': 25}})     # 不等于
users.find({'age': {'$gt': 25}})     # 大于
users.find({'age': {'$gte': 25}})    # 大于等于
users.find({'age': {'$lt': 30}})     # 小于
users.find({'age': {'$lte': 30}})    # 小于等于
users.find({'age': {'$in': [25, 30]}})  # 在列表中
users.find({'age': {'$nin': [25, 30]}}) # 不在列表中

# 逻辑操作符
users.find({'$and': [{'age': {'$gte': 25}}, {'age': {'$lte': 30}}]})
users.find({'$or': [{'age': 25}, {'age': 30}]})
users.find({'$not': {'age': {'$gt': 25}}})

# 元素操作符
users.find({'email': {'$exists': True}})  # 字段存在
users.find({'age': {'$type': 'int'}})     # 类型检查

# 数组操作符
users.find({'tags': {'$all': ['python', 'mongodb']}})  # 包含所有元素
users.find({'tags': {'$size': 2}})                      # 数组长度
users.find({'tags': 'python'})                          # 包含元素

# 正则表达式
users.find({'name': {'$regex': '^张'}})  # 以"张"开头
users.find({'email': {'$regex': '@example\.com$'}})  # 以"@example.com"结尾
```

### 更新文档

```python
# 更新单个文档
result = users.update_one(
    {'name': '张三'},
    {'$set': {'age': 26}}
)
print(f'匹配 {result.matched_count} 个，修改 {result.modified_count} 个')

# 更新多个文档
result = users.update_many(
    {'age': {'$lt': 20}},
    {'$set': {'age': 20}}
)

# 替换整个文档
users.replace_one(
    {'name': '张三'},
    {'name': '张三', 'email': 'new@example.com', 'age': 27}
)

# 更新操作符
users.update_one({'name': '张三'}, {'$set': {'email': 'new@example.com'}})  # 设置字段
users.update_one({'name': '张三'}, {'$unset': {'email': ''}})               # 删除字段
users.update_one({'name': '张三'}, {'$inc': {'age': 1}})                    # 增加数值
users.update_one({'name': '张三'}, {'$mul': {'age': 2}})                    # 乘法
users.update_one({'name': '张三'}, {'$rename': {'email': 'mail'}})         # 重命名字段

# 数组更新
users.update_one({'name': '张三'}, {'$push': {'tags': 'redis'}})           # 追加元素
users.update_one({'name': '张三'}, {'$pull': {'tags': 'redis'}})           # 移除元素
users.update_one({'name': '张三'}, {'$addToSet': {'tags': 'mysql'}})       # 添加（不重复）

# upsert（不存在则插入）
users.update_one(
    {'name': '赵六'},
    {'$set': {'age': 35}},
    upsert=True
)
```

### 删除文档

```python
# 删除单个文档
result = users.delete_one({'name': '张三'})
print(f'删除了 {result.deleted_count} 个文档')

# 删除多个文档
result = users.delete_many({'age': {'$lt': 18}})
print(f'删除了 {result.deleted_count} 个文档')

# 清空集合
users.delete_many({})
```

## 索引

```python
# 创建单字段索引
users.create_index('email')

# 创建复合索引
users.create_index([('name', 1), ('age', -1)])  # 1 升序，-1 降序

# 创建唯一索引
users.create_index('email', unique=True)

# 创建文本索引（全文搜索）
posts = db['posts']
posts.create_index([('content', 'text')])

# 使用文本索引搜索
results = posts.find({'$text': {'$search': 'python mongodb'}})

# 查看所有索引
indexes = users.list_indexes()
for index in indexes:
    print(index)

# 删除索引
users.drop_index('email_1')
```

## 聚合操作

```python
# 聚合管道
pipeline = [
    # 匹配阶段
    {'$match': {'age': {'$gte': 25}}},
    
    # 分组统计
    {'$group': {
        '_id': '$age',
        'count': {'$sum': 1},
        'names': {'$push': '$name'}
    }},
    
    # 排序
    {'$sort': {'count': -1}},
    
    # 限制数量
    {'$limit': 10}
]

results = users.aggregate(pipeline)
for result in results:
    print(result)

# 常用聚合操作符
# $sum：求和
# $avg：平均值
# $min：最小值
# $max：最大值
# $push：添加到数组
# $addToSet：添加到数组（不重复）
# $first：第一个值
# $last：最后一个值

# 统计示例
stats = users.aggregate([
    {'$group': {
        '_id': None,
        'total': {'$sum': 1},
        'avg_age': {'$avg': '$age'},
        'max_age': {'$max': '$age'},
        'min_age': {'$min': '$age'}
    }}
])

for stat in stats:
    print(stat)
```

## 嵌套文档

```python
# 插入嵌套文档
user = {
    'name': '张三',
    'email': 'zhangsan@example.com',
    'address': {
        'city': '北京',
        'district': '朝阳区',
        'street': '建国路'
    },
    'hobbies': ['读书', '旅游', '编程']
}

users.insert_one(user)

# 查询嵌套字段
results = users.find({'address.city': '北京'})

# 更新嵌套字段
users.update_one(
    {'name': '张三'},
    {'$set': {'address.city': '上海'}}
)

# 查询数组元素
results = users.find({'hobbies': '编程'})
```

## 实战应用

### 博客系统

```python
from datetime import datetime
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['blog_db']

# 文章集合
posts = db['posts']

# 插入文章
post = {
    'title': 'Python 与 MongoDB',
    'content': '本文介绍如何使用 Python 操作 MongoDB...',
    'author': 'zhangsan',
    'tags': ['python', 'mongodb', 'nosql'],
    'views': 0,
    'comments': [],
    'created_at': datetime.now()
}

post_id = posts.insert_one(post).inserted_id

# 添加评论
posts.update_one(
    {'_id': post_id},
    {
        '$push': {
            'comments': {
                'user': 'lisi',
                'content': '写得不错！',
                'created_at': datetime.now()
            }
        },
        '$inc': {'views': 1}
    }
)

# 查询文章
post = posts.find_one({'_id': post_id})
print(f"标题: {post['title']}")
print(f"浏览量: {post['views']}")
print(f"评论数: {len(post['comments'])}")
```

### 用户活动日志

```python
logs = db['logs']

# 记录日志
log = {
    'user_id': 'user123',
    'action': 'login',
    'ip': '192.168.1.1',
    'timestamp': datetime.now(),
    'metadata': {
        'device': 'iPhone',
        'browser': 'Safari'
    }
}

logs.insert_one(log)

# 统计用户活动
pipeline = [
    {'$match': {'user_id': 'user123'}},
    {'$group': {
        '_id': '$action',
        'count': {'$sum': 1}
    }},
    {'$sort': {'count': -1}}
]

stats = logs.aggregate(pipeline)
```

## 事务（MongoDB 4.0+）

```python
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['test_db']

# 开启事务
with client.start_session() as session:
    with session.start_transaction():
        try:
            # 转账操作
            db.accounts.update_one(
                {'user_id': 'user1'},
                {'$inc': {'balance': -100}},
                session=session
            )
            
            db.accounts.update_one(
                {'user_id': 'user2'},
                {'$inc': {'balance': 100}},
                session=session
            )
            
            # 提交事务
            session.commit_transaction()
            print('转账成功')
            
        except Exception as e:
            # 回滚事务
            session.abort_transaction()
            print(f'转账失败: {e}')
```

## Motor（异步驱动）

```bash
pip install motor
```

```python
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient('mongodb://localhost:27017/')
    db = client['test_db']
    users = db['users']
    
    # 异步插入
    result = await users.insert_one({'name': '张三', 'age': 25})
    print(f'插入的 ID: {result.inserted_id}')
    
    # 异步查询
    async for user in users.find({'age': {'$gt': 20}}):
        print(user)

asyncio.run(main())
```

## 最佳实践

::: tip 设计原则
1. **嵌入 vs 引用**：一对少量关系用嵌入，一对多关系用引用
2. **避免深层嵌套**：嵌套层级不超过 2-3 层
3. **文档大小限制**：单个文档不超过 16MB
4. **合理使用索引**：加速查询但会影响写入性能
:::

::: warning 注意事项
1. **_id 字段**：自动生成，默认为 ObjectId 类型
2. **原子操作**：单个文档的更新是原子的
3. **数据冗余**：适度冗余可以提高查询性能
4. **定期备份**：使用 `mongodump` 和 `mongorestore`
:::

## 练习

1. 设计一个电商系统的订单集合，包含用户信息、商品列表、地址等
2. 实现商品评论的增删改查功能
3. 使用聚合统计每个分类下的商品数量和平均价格
4. 创建合适的索引，优化常用查询
