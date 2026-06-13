# 数据类（dataclass）

dataclass 是 Python 3.7+ 引入的简化数据类定义的装饰器。

## 基本使用

### 传统类 vs 数据类

```python
# 传统方式
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def __repr__(self):
        return f"Person(name={self.name}, age={self.age})"
    
    def __eq__(self, other):
        return self.name == other.name and self.age == other.age

# dataclass 方式
from dataclasses import dataclass

@dataclass
class Person:
    name: str
    age: int

p = Person("Alice", 25)
print(p)  # Person(name='Alice', age=25)
```

## 字段选项

### 默认值

```python
@dataclass
class Product:
    name: str
    price: float
    stock: int = 0  # 默认值
    category: str = "未分类"
```

### field() 函数

```python
from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    age: int
    tags: list = field(default_factory=list)  # 可变默认值
    created_at: str = field(default_factory=lambda: str(datetime.now()))
```

### 只读字段

```python
@dataclass(frozen=True)
class Point:
    x: int
    y: int

p = Point(1, 2)
# p.x = 3  # FrozenInstanceError
```

## 特殊方法

```python
@dataclass
class Student:
    name: str
    score: int
    
    def __post_init__(self):
        # 初始化后自动调用
        if self.score < 0 or self.score > 100:
            raise ValueError("分数必须在 0-100 之间")
```

## 继承

```python
@dataclass
class Animal:
    name: str
    age: int

@dataclass
class Dog(Animal):
    breed: str

dog = Dog("Buddy", 3, "Golden Retriever")
```

## dataclass 参数

```python
@dataclass(
    order=True,      # 支持比较运算
    frozen=True,     # 不可变
    unsafe_hash=True # 可哈希（能作为字典键）
)
class Item:
    id: int
    name: str
```

## NamedTuple 替代

```python
from typing import NamedTuple

# NamedTuple（不可变）
class Point(NamedTuple):
    x: int
    y: int

# dataclass（可变）
@dataclass
class Point:
    x: int
    y: int
```

## 使用场景

### 场景 1：配置对象
存储应用配置。

### 场景 2：API 响应
结构化 API 返回数据。

### 场景 3：数据传输
进程间、网络间传输数据。

### 场景 4：ORM 模型
简化数据库模型定义。

## 易错点

### 易错点 1：待补充

❌ **错误示例**：
```python
# 待补充
```

✅ **正确做法**：
```python
# 待补充
```

**说明**：待补充

### 易错点 2：待补充

❌ **错误示例**：
```python
# 待补充
```

✅ **正确做法**：
```python
# 待补充
```

**说明**：待补充

### 易错点 3：待补充

❌ **错误示例**：
```python
# 待补充
```

✅ **正确做法**：
```python
# 待补充
```

**说明**：待补充

## 练习题

### 基础练习

**题目 1**：定义 Book 数据类，包含 title、author、price。

<details>
<summary>💡 查看答案</summary>

```python
from dataclasses import dataclass

@dataclass
class Book:
    title: str
    author: str
    price: float

book = Book("Python Guide", "John", 49.99)
print(book)
```
</details>

### 进阶练习

**题目 2**：定义 Order 数据类，包含订单列表（默认空列表）和总价（自动计算）。

<details>
<summary>💡 查看答案</summary>

```python
from dataclasses import dataclass, field

@dataclass
class Order:
    items: list = field(default_factory=list)
    total: float = field(init=False)
    
    def __post_init__(self):
        self.total = sum(item.price for item in self.items)
```
</details>

### 挑战练习

**题目 3**：实现不可变的 Config 数据类，支持从字典创建。

## 费曼学习法检验

1. **这是什么**：dataclass 和普通类有什么区别？自动生成了哪些方法？

2. **为什么需要**：什么时候用 dataclass，什么时候用 NamedTuple？

3. **怎么用**：向新手解释为什么可变默认值要用 field(default_factory)?

4. **注意事项**：frozen=True 和不可变有什么区别？

::: tip 学习建议
dataclass 是现代 Python 的最佳实践！减少样板代码，提高可读性。
:::
