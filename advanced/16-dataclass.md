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

### 易错点 1：可变默认值用 `[]` / `{}` 而非 `default_factory`

❌ **错误示例**：
```python
from dataclasses import dataclass

@dataclass
class User:
    name: str
    tags: list = []    # 致命！所有实例共享同一个列表

u1 = User("Alice")
u1.tags.append("admin")
u2 = User("Bob")
print(u2.tags)  # ['admin']！被污染了
```

✅ **正确做法**：
```python
from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    tags: list = field(default_factory=list)   # 每个实例独立
    metadata: dict = field(default_factory=dict)

u1 = User("Alice")
u1.tags.append("admin")
u2 = User("Bob")
print(u2.tags)  # []
```

**说明**：dataclass 默认值在**类定义时求值一次**，所有实例共享。可变对象（`list`、`dict`、`set`）必须用 `field(default_factory=...)`，每次创建实例都调用工厂函数生成新对象。这跟普通函数默认参数的"可变默认值陷阱"是同一个问题。

### 易错点 2：字段顺序——有默认值的字段必须在没默认值的之后

❌ **错误示例**：
```python
from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float = 0.0
    stock: int       # TypeError: non-default argument 'stock' follows default argument

Product("Mouse", stock=10)
```

✅ **正确做法**：
```python
@dataclass
class Product:
    name: str
    stock: int           # 没默认值的字段放前面
    price: float = 0.0   # 有默认值的放后面

# 或：把所有字段都给默认值
@dataclass
class Product:
    name: str
    price: float = 0.0
    stock: int = 0

# 或：用 field(init=False) 让字段不进入 __init__
from dataclasses import dataclass, field

@dataclass
class Product:
    name: str
    price: float = 0.0
    stock: int = field(default=0)
```

**说明**：dataclass 自动生成的 `__init__` 按字段定义顺序排参数，必须满足"位置参数在关键字参数之前"的 Python 规则。要打破顺序限制，可以全部给默认值，或用 `kw_only=True`（Python 3.10+）：`@dataclass(kw_only=True)` 让所有字段只能用关键字传。

### 易错点 3：`frozen=True` 与可变字段冲突，且不可与继承的"非 frozen"类混用

❌ **错误示例**：
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: int
    y: int

p = Point(1, 2)
p.x = 3   # FrozenInstanceError：不能改

# 又想要 tags 这种可变字段
@dataclass(frozen=True)
class User:
    name: str
    tags: list = field(default_factory=list)   # 编译能过，但 tags.append() 还是会变
    # "frozen" 只保护字段引用，不保护引用对象内部

# frozen 与非 frozen 继承冲突
@dataclass
class A: ...
@dataclass(frozen=True)
class B(A): ...   # ValueError: cannot inherit frozen dataclass from a non-frozen one
```

✅ **正确做法**：
```python
# 1. frozen 只防"重新赋值"，可变对象内部仍可能被改——可变字段配合 tuple
@dataclass(frozen=True)
class User:
    name: str
    tags: tuple = ()    # 用 tuple 替代 list，真正不可变

# 2. 整个继承链要么都 frozen 要么都不 frozen
@dataclass(frozen=True)
class A: ...
@dataclass(frozen=True)
class B(A): ...
```

**说明**：`frozen=True` 让 `__setattr__` 抛错，所以**字段引用不能改**。但如果字段是 list/dict，对象**内部**还是可以变的。要真正的不可变性，可变字段用 `tuple` / `frozenset` / `MappingProxyType`。继承链必须保持一致，混用 frozen 和非 frozen 会直接报错。

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
