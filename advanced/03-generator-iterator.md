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
