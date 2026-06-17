# 生成器与迭代器

生成器是 Python 中实现惰性计算的强大工具，可以节省内存并提高性能。

## 迭代器协议

任何实现了 `__iter__()` 和 `__next__()` 方法的对象都是迭代器。

```python
class MyIterator:
    def __init__(self, max_num):
        self.max_num = max_num
        self.current = 0
    
    def __iter__(self):
        return self
    
    def __next__(self):
        if self.current < self.max_num:
            self.current += 1
            return self.current
        raise StopIteration

for num in MyIterator(5):
    print(num)  # 1, 2, 3, 4, 5
```

## 生成器函数

使用 `yield` 关键字的函数自动变为生成器。

```python
def count_up_to(n):
    count = 1
    while count <= n:
        yield count
        count += 1

for num in count_up_to(5):
    print(num)
```

### 生成器表达式

```python
# 列表推导式：占用内存
squares_list = [x**2 for x in range(1000000)]

# 生成器表达式：按需生成
squares_gen = (x**2 for x in range(1000000))
```

## yield from

Python 3.3+ 引入，用于委托子生成器。

```python
def flatten(nested_list):
    for item in nested_list:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item

data = [1, [2, 3, [4, 5]], 6]
print(list(flatten(data)))  # [1, 2, 3, 4, 5, 6]
```

## 生成器方法

### send()

```python
def echo():
    while True:
        value = yield
        print(f"收到: {value}")

gen = echo()
next(gen)
gen.send("Hello")
```

## 使用场景

### 场景 1：处理大文件
逐行读取，节省内存。

```python
def read_large_file(file_path):
    with open(file_path, 'r') as f:
        for line in f:
            yield line.strip()
```

### 场景 2：无限序列
生成无限数据流。

```python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
```

### 场景 3：管道处理
链式数据处理。

```python
def read_data():
    for i in range(100):
        yield i

def filter_even(numbers):
    for n in numbers:
        if n % 2 == 0:
            yield n

result = filter_even(read_data())
```

## 易错点

### 易错点 1：生成器只能迭代一次

❌ **错误示例**：
```python
def gen():
    yield 1
    yield 2
    yield 3

g = gen()
print(list(g))  # [1, 2, 3]
print(list(g))  # []，第二次为空！
```

✅ **正确做法**：
```python
# 想多次遍历，要么重新创建生成器
g = gen()
print(list(g))
g = gen()  # 重新创建
print(list(g))

# 要么把结果存成列表（牺牲内存换可复用性）
data = list(gen())
print(data)
print(data)
```

**说明**：生成器是"一次性"的——迭代到底就枯竭了，不会从头开始。这是为了节省内存付出的代价。如果需要多次遍历同一份数据，要么每次重建生成器，要么直接用 `list()` 缓存。

### 易错点 2：`yield` 让函数返回生成器对象而非值

❌ **错误示例**：
```python
def get_numbers():
    yield 1
    yield 2

result = get_numbers()
print(result)        # <generator object>，不是 1
print(result + 1)    # TypeError：不能加法
```

✅ **正确做法**：
```python
def get_numbers():
    yield 1
    yield 2

gen = get_numbers()

# 方法 1：next() 拿一个
first = next(gen)  # 1
second = next(gen)  # 2

# 方法 2：用 for 遍历
for n in get_numbers():
    print(n)

# 方法 3：用 list() 全部取出
nums = list(get_numbers())  # [1, 2]
```

**说明**：含 `yield` 的函数被调用时**不执行函数体**，只返回一个生成器对象。必须用 `next()`、`for` 循环、或 `list()` 才会真正执行并产出值。

### 易错点 3：`send()` 之前忘了"启动"生成器

❌ **错误示例**：
```python
def echo():
    while True:
        x = yield
        print(f"收到 {x}")

gen = echo()
gen.send("hi")  # TypeError: can't send non-None value to a just-started generator
```

✅ **正确做法**：
```python
gen = echo()

# 方法 1：用 next() 启动
next(gen)         # 推进到第一个 yield
gen.send("hi")    # 现在可以 send

# 方法 2：用 send(None) 等价于 next
gen = echo()
gen.send(None)    # 等价于 next(gen)
gen.send("hi")
```

**说明**：生成器刚创建时停在函数开头，还没执行到任何 `yield`，此时只能 `send(None)` 或 `next()`。要"喂值"必须先把生成器推到第一个 `yield` 处。`send()` 返回的值是**下一个** `yield` 表达式的结果。

## 练习题

### 基础练习

**题目 1**：实现生成器函数 `range_custom(start, end, step)`。

<details>
<summary>💡 查看答案</summary>

```python
def range_custom(start, end, step=1):
    current = start
    while current < end:
        yield current
        current += step
```
</details>

### 进阶练习

**题目 2**：实现 `batched(iterable, n)`，将可迭代对象分批。

<details>
<summary>💡 查看答案</summary>

```python
def batched(iterable, n):
    batch = []
    for item in iterable:
        batch.append(item)
        if len(batch) == n:
            yield batch
            batch = []
    if batch:
        yield batch
```
</details>

### 挑战练习

**题目 3**：实现协程式的生产者-消费者模型。

## 费曼学习法检验

1. **这是什么**：生成器和迭代器有什么区别？为什么生成器更节省内存？

2. **为什么需要**：什么时候应该用生成器而不是列表？

3. **怎么用**：向新手解释 `yield` 和 `return` 的区别？

4. **注意事项**：生成器只能遍历一次，如何多次使用同一个数据序列？

::: tip 学习建议
生成器是 Python 的精华！掌握生成器能写出高效、优雅的代码。
:::
