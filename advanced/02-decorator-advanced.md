# 装饰器进阶

装饰器是 Python 中强大的元编程工具，用于在不修改原函数的情况下增强功能。

## 基础回顾

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("Before")
        result = func(*args, **kwargs)
        print("After")
        return result
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")
```

## 带参数的装饰器

```python
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello {name}")
```

## 类装饰器

```python
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0
    
    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"调用次数: {self.count}")
        return self.func(*args, **kwargs)

@CountCalls
def say_hello():
    print("Hello!")
```

## functools.wraps

保留原函数的元数据。

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

## 使用场景

### 场景 1：日志记录
记录函数调用信息。

### 场景 2：权限验证
检查用户权限。

### 场景 3：缓存结果
缓存函数返回值。

### 场景 4：性能监控
测量函数执行时间。

## 练习题

### 基础练习

**题目 1**：实现 `@timer` 装饰器，打印函数执行时间。

<details>
<summary>💡 查看答案</summary>

```python
import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 耗时: {end - start:.4f}秒")
        return result
    return wrapper
```
</details>

### 进阶练习

**题目 2**：实现 `@cache` 装饰器，缓存函数结果。

### 挑战练习

**题目 3**：实现 `@retry(max_attempts=3)` 装饰器，函数失败后自动重试。

## 费曼学习法检验

1. **这是什么**：装饰器的本质是什么？为什么需要 functools.wraps？

2. **为什么需要**：为什么带参数的装饰器需要三层嵌套？

3. **怎么用**：向新手解释类装饰器和函数装饰器的区别？

4. **注意事项**：装饰器的执行顺序是什么？多个装饰器如何叠加？

::: tip 学习建议
装饰器是 Python 最优雅的特性之一！掌握装饰器能让代码更简洁、更易维护。
:::
