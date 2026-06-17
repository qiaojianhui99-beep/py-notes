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

在不修改函数体的前提下，记录"谁、何时、调用了什么、返回了什么"。

```python
from functools import wraps

def log(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}({args}, {kwargs})")
        result = func(*args, **kwargs)
        print(f"返回 {result}")
        return result
    return wrapper

@log
def transfer(amount): ...
```

### 场景 2：权限验证

Web 接口、命令行工具中检查当前用户是否有权限调用某个函数。函数本身只关心业务，"是否登录"由装饰器把关。

```python
def require_login(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            raise PermissionError("请先登录")
        return func(*args, **kwargs)
    return wrapper

@require_login
def delete_account(): ...
```

### 场景 3：缓存结果

对参数相同、结果不变的纯函数（如斐波那契、阶乘）做缓存，避免重复计算。

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
```

### 场景 4：性能监控

测量函数耗时，找出慢函数。

```python
import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__}: {elapsed:.3f}s")
        return result
    return wrapper
```

## 易错点

### 易错点 1：忘记 `functools.wraps` 导致元数据丢失

❌ **错误示例**：
```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def greet(name):
    """打招呼"""
    return f"Hello {name}"

print(greet.__name__)  # 'wrapper'，原函数名丢了
print(greet.__doc__)   # None，文档字符串丢了
```

✅ **正确做法**：
```python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def greet(name):
    """打招呼"""
    return f"Hello {name}"

print(greet.__name__)  # 'greet'
print(greet.__doc__)   # '打招呼'
```

**说明**：装饰器返回的是 `wrapper` 函数，它会"冒充"原函数。不加 `@wraps(func)` 时，`__name__`、`__doc__`、`__module__` 等元数据全是 wrapper 的，调试时看不出原始函数。写装饰器永远先加 `@wraps`。

### 易错点 2：带参数装饰器的嵌套层数错误

❌ **错误示例**：
```python
def repeat(times):  # 想做 @repeat(3)
    def wrapper(func):
        result = func()  # 错！这里立刻调用了原函数
        for _ in range(times):
            func()
    return wrapper
```

✅ **正确做法**：
```python
def repeat(times):          # 第 1 层：接收参数
    def decorator(func):    # 第 2 层：接收被装饰函数
        @wraps(func)
        def wrapper(*args, **kwargs):  # 第 3 层：接收调用参数
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello {name}")
```

**说明**：带参数的装饰器必须是**三层嵌套**——参数层、函数层、wrapper 层。判断口诀：装饰器语法 `@deco(x)` 会**调用** `deco(x)` 拿到一个真正的装饰器，所以最外层只负责接收参数。

### 易错点 3：装饰器多个叠加时执行顺序混乱

❌ **错误理解**：
```python
@A
@B
@C
def f(): ...
# 以为是 A 先执行，然后 B，然后 C
```

✅ **正确理解**：
```python
# 等价于：f = A(B(C(f)))
# 装饰器从下往上"包"，最终调用从外到内
@A
@B
def f(): ...
# 等价于 f = A(B(f))

# 实际调用时：
#   1. A 的 wrapper 开始
#   2. A 调用原函数 (= B 包装后的)
#   3. B 的 wrapper 开始
#   4. B 调用真正的 f
```

**说明**：装饰器**应用顺序是从下到上**（最靠近函数的先包），**执行顺序是从外到内**（最远的先执行 wrapper 的前置逻辑）。如果 `@app.route` 和 `@login_required` 顺序写反了，路由注册会拿不到登录保护。

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
