# 性能优化

性能优化是高级开发者的必备技能。

## 性能分析

### timeit 模块

```python
import timeit

# 测试代码执行时间
time = timeit.timeit('sum(range(100))', number=10000)
print(f"执行时间: {time:.6f}秒")

# 比较不同实现
code1 = "[i for i in range(1000)]"
code2 = "list(range(1000))"

print(timeit.timeit(code1, number=10000))
print(timeit.timeit(code2, number=10000))
```

### cProfile 模块

```python
import cProfile

def slow_function():
    total = 0
    for i in range(1000000):
        total += i
    return total

cProfile.run('slow_function()')
```

### line_profiler

```bash
pip install line_profiler

# 使用
@profile
def my_function():
    pass

kernprof -l -v script.py
```

## 内存优化

### memory_profiler

```python
from memory_profiler import profile

@profile
def my_function():
    a = [1] * (10 ** 6)
    b = [2] * (2 * 10 ** 7)
    del b
    return a
```

### 使用生成器

```python
# 不好：占用大量内存
data = [i**2 for i in range(1000000)]

# 好：按需生成
data = (i**2 for i in range(1000000))
```

### __slots__

```python
# 不使用 __slots__
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# 使用 __slots__ 节省内存
class Point:
    __slots__ = ['x', 'y']
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
```

## 算法优化

### 使用内置函数

```python
# 慢
result = []
for i in range(1000):
    result.append(i * 2)

# 快
result = list(map(lambda x: x * 2, range(1000)))

# 更快
result = [i * 2 for i in range(1000)]
```

### 避免重复计算

```python
# 不好
for i in range(len(data)):
    process(data[i])

# 好
data_len = len(data)
for i in range(data_len):
    process(data[i])

# 更好
for item in data:
    process(item)
```

## 缓存

### functools.lru_cache

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(100))
```

## 并发选择

### 决策树

```python
# CPU 密集型 → multiprocessing
def cpu_bound_task():
    return sum(i*i for i in range(10**7))

# I/O 密集型 → asyncio 或 threading
async def io_bound_task():
    await asyncio.sleep(1)
    return "done"
```

## 使用场景

### 场景 1：找出性能瓶颈
使用 cProfile 定位慢函数。

### 场景 2：优化内存占用
使用生成器处理大数据。

### 场景 3：加速计算
使用缓存避免重复计算。

### 场景 4：并发优化
选择合适的并发模型。

## 易错点

### 易错点 1：靠"直觉"和单次 `time.time()` 测性能

❌ **错误示例**：
```python
import time

start = time.time()
result = my_function()
end = time.time()
print(f"耗时: {end - start:.6f}秒")
# 问题：只跑一次，受系统抖动、GC、其他进程影响极大
# 1ms 的函数可能测出 0.5ms 也可能 3ms，结论毫无意义
```

✅ **正确做法**：
```python
import timeit

# 多次运行取平均，避免偶发因素
t = timeit.timeit('my_function()', globals=globals(), number=10_000)
print(f"平均: {t / 10_000:.6f}秒/次")

# 精确测量（系统时钟分辨率有限时）
t = timeit.repeat('my_function()', globals=globals(), number=1000, repeat=5)
print(f"最快: {min(t) / 1000:.6f}秒/次")  # 取最小值更稳定
```

**说明**：单次 `time.time()` 测量精度受系统调度、GC、CPU 频率影响。`timeit` 会禁用 GC、自动重复多次、取最小值（最稳定）。**测性能永远用 `timeit`**，单次 `time.time()` 只能看大概趋势。

### 易错点 2：cProfile 看错"瓶颈"——错把外层当真凶

❌ **错误示例**：
```python
import cProfile
cProfile.run('main()')

# 输出按 tottime 排序时，看到 main() 第一，就以为 main 慢
# 实际 main 只是调用方，自己没干啥
```

✅ **正确做法**：
```python
import cProfile, pstats

profiler = cProfile.run('main()', 'out.prof')

# 看两个指标：
# - tottime：函数自己（不包括子调用）花的时间
# - cumtime：包括所有子调用的累计时间
stats = pstats.Stats('out.prof')
stats.sort_stats('tottime').print_stats(10)   # 找"自己耗时最长"的函数
stats.sort_stats('cumtime').print_stats(10)   # 找"调用链累计最长"的入口
```

**说明**：cProfile 报告里 `tottime` 是"函数本身"耗时（不含子调用），`cumtime` 是"包括子调用"。**优化要看 `tottime` 排序**——这才是真正干活多的函数。光看 `cumtime` 会停在最外层 `main()`，毫无意义。

### 易错点 3：`__slots__` 用上后失去灵活性、还可能 break 第三方库

❌ **错误示例**：
```python
class User:
    __slots__ = ['id', 'name']

u = User()
u.id = 1
u.email = 'a@b.com'   # AttributeError！__slots__ 禁止动态属性
# 后续 JSON 序列化（依赖 __dict__）会失败：
import json
json.dumps(u.__dict__)  # AttributeError: 'User' has no __dict__
```

✅ **正确做法**：
```python
# 只有"确实需要省内存"（海量实例）时才用 __slots__
class Point:
    __slots__ = ('x', 'y', 'z')   # 用元组，省一点点启动时间

# 需要动态属性 / 序列化时用 dataclass 或普通类
from dataclasses import dataclass, asdict

@dataclass
class User:
    id: int
    name: str
    email: str = ''

# 序列化
import json
u = User(1, 'Alice')
json.dumps(asdict(u))
```

**说明**：`__slots__` 会让类失去 `__dict__`，意味着不能动态加属性、不能 pickle 默认行为、不能被依赖 `__dict__` 的库（如 ORM、序列化器）直接使用。**只在确实有百万级实例**（如游戏中的粒子、大数据节点）才值得用。日常业务对象用 `@dataclass` 更省心。

## 练习题

### 基础练习

**题目 1**：比较列表推导式和 map() 的性能。

<details>
<summary>💡 查看答案</summary>

```python
import timeit

code1 = "[i*2 for i in range(10000)]"
code2 = "list(map(lambda x: x*2, range(10000)))"

t1 = timeit.timeit(code1, number=1000)
t2 = timeit.timeit(code2, number=1000)

print(f"列表推导式: {t1:.6f}秒")
print(f"map(): {t2:.6f}秒")
```
</details>

### 进阶练习

**题目 2**：使用 lru_cache 优化递归斐波那契函数。

<details>
<summary>💡 查看答案</summary>

```python
from functools import lru_cache
import timeit

# 未优化
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

# 优化后
@lru_cache(maxsize=None)
def fib_cached(n):
    if n < 2:
        return n
    return fib_cached(n-1) + fib_cached(n-2)

# 比较
print(timeit.timeit('fib(30)', globals=globals(), number=1))
print(timeit.timeit('fib_cached(30)', globals=globals(), number=1))
```
</details>

### 挑战练习

**题目 3**：分析并优化一个慢速函数，提升 10 倍性能。

## 费曼学习法检验

1. **这是什么**：过早优化为什么是万恶之源？

2. **为什么需要**：什么时候需要优化？如何判断瓶颈？

3. **怎么用**：向新手解释 CPU 密集型和 I/O 密集型的区别？

4. **注意事项**：性能优化和代码可读性如何平衡？

::: tip 学习建议
先让代码正确，再让代码快！使用工具找到真正的瓶颈。
:::
