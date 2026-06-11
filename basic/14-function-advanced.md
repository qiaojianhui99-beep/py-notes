# 函数进阶

## 默认参数

```python
def greet(name, message="Hello"):
    print(f"{message}, {name}!")

greet("Alice")              # Hello, Alice!
greet("Bob", "Hi")          # Hi, Bob!
```

## 关键字参数

```python
def person_info(name, age, city):
    print(f"{name}, {age}岁, 来自{city}")

# 使用关键字参数（顺序无关）
person_info(age=25, city="Beijing", name="Alice")
```

## 可变参数：*args

接收任意数量的位置参数，存储为元组。

```python
def sum_all(*numbers):
    total = 0
    for num in numbers:
        total += num
    return total

sum_all(1, 2, 3)       # 6
sum_all(1, 2, 3, 4, 5) # 15
```

## 可变参数：**kwargs

接收任意数量的关键字参数，存储为字典。

```python
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25, city="Beijing")
```

## 混合使用

参数顺序：位置参数 → *args → 关键字参数 → **kwargs

```python
def func(a, b, *args, x=10, **kwargs):
    print(f"a={a}, b={b}")
    print(f"args={args}")
    print(f"x={x}")
    print(f"kwargs={kwargs}")

func(1, 2, 3, 4, x=20, name="Alice", age=25)
```

## lambda 表达式

匿名函数，用于简单操作。

```python
# 普通函数
def add(a, b):
    return a + b

# lambda 表达式
add = lambda a, b: a + b

# 常见用法：作为参数
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, numbers))  # [1, 4, 9, 16, 25]
```

## 递归函数

函数调用自身。

```python
# 阶乘
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

factorial(5)  # 120

# 斐波那契数列
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

fibonacci(6)  # 8
```

## 装饰器基础

函数装饰器用于在不修改原函数的情况下增强功能。

```python
def log_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} 完成")
        return result
    return wrapper

@log_decorator
def add(a, b):
    return a + b

add(3, 5)
# 输出:
# 调用 add
# add 完成
```

## 类型注解（Python 3.10+）

```python
# Python 3.10+ 使用 | 表示联合类型
def process(value: int | str) -> str:
    return str(value)

# 泛型函数
def first(items: list[int]) -> int | None:
    return items[0] if items else None

# 旧版本写法（Python 3.9-）
from typing import Union, List, Optional

def process_old(value: Union[int, str]) -> str:
    return str(value)

def first_old(items: List[int]) -> Optional[int]:
    return items[0] if items else None
```

## 高阶函数

### map()

```python
numbers = [1, 2, 3, 4]
squares = list(map(lambda x: x**2, numbers))  # [1, 4, 9, 16]
```

### filter()

```python
numbers = [1, 2, 3, 4, 5, 6]
evens = list(filter(lambda x: x % 2 == 0, numbers))  # [2, 4, 6]
```

### reduce()

```python
from functools import reduce

numbers = [1, 2, 3, 4]
result = reduce(lambda x, y: x + y, numbers)  # 10
```

## 使用场景

### 场景 1：API 设计
灵活的参数接口，向后兼容。

### 场景 2：装饰器开发
日志、权限、缓存等增强功能。

### 场景 3：函数式编程
map/filter/reduce 数据处理。

### 场景 4：回调函数
事件处理、异步编程。

## 练习题

### 基础练习

**题目 1**：编写函数 `greet(name, greeting="Hello")`，支持默认问候语。

<details>
<summary>💡 查看答案</summary>

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))          # Hello, Alice!
print(greet("Bob", "Hi"))      # Hi, Bob!
```
</details>

**题目 2**：使用 lambda 对列表 `[1, 2, 3, 4, 5]` 进行平方操作。

<details>
<summary>💡 查看答案</summary>

```python
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, numbers))
print(squares)  # [1, 4, 9, 16, 25]
```
</details>

### 进阶练习

**题目 3**：编写 `sum_all(*args, **kwargs)`，返回所有数字参数的和。

<details>
<summary>💡 查看答案</summary>

```python
def sum_all(*args, **kwargs):
    total = sum(args)
    total += sum(kwargs.values())
    return total

print(sum_all(1, 2, 3, a=4, b=5))  # 15
```
</details>

### 挑战练习

**题目 4**：实现一个计时装饰器 `@timer`，测量函数执行时间并打印。

<details>
<summary>💡 查看提示</summary>

使用 `time.time()` 记录开始和结束时间。
</details>

## 费曼学习法检验

1. **这是什么**：`*args` 和 `**kwargs` 的本质是什么？它们的类型是什么？

2. **为什么需要**：为什么 lambda 表达式不能包含多条语句？

3. **怎么用**：向新手解释装饰器的执行顺序和原理？

4. **注意事项**：递归函数为什么需要终止条件？没有会怎样？

::: tip 学习建议
掌握高级函数特性让代码更优雅！装饰器和 lambda 是 Python 的精华。
:::
