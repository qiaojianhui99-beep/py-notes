# 垃圾回收机制

Python 使用自动内存管理，开发者无需手动释放内存。理解垃圾回收机制有助于编写高性能代码和排查内存泄漏。

## 引用计数

Python 的主要垃圾回收机制是**引用计数**。

### 基本原理

每个对象都有一个引用计数，当引用计数为 0 时，对象被立即回收。

```python
import sys

a = []  # 引用计数 = 1
b = a   # 引用计数 = 2
c = a   # 引用计数 = 3

print(sys.getrefcount(a))  # 4 (getrefcount 本身也增加一次引用)

del b   # 引用计数 = 2
del c   # 引用计数 = 1
del a   # 引用计数 = 0，对象被回收
```

### 引用计数的优缺点

**优点**：
- 实时回收，内存释放及时
- 实现简单

**缺点**：
- 无法处理循环引用
- 每次引用变化都要修改计数，有性能开销

## 循环引用问题

引用计数无法处理循环引用，导致内存泄漏。

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

# 创建循环引用
node1 = Node(1)
node2 = Node(2)
node1.next = node2
node2.next = node1  # 循环引用

# 即使删除引用，对象仍然无法被回收
del node1
del node2
# 两个 Node 对象互相引用，引用计数永远不为 0
```

## 分代垃圾回收

Python 使用**分代回收**（Generational GC）解决循环引用问题。

### 分代假设

- 大多数对象生命周期很短
- 存活时间越长的对象，越可能继续存活

### 三代回收

```python
import gc

# 查看垃圾回收阈值
print(gc.get_threshold())  # (700, 10, 10)
# 700: 第 0 代对象数量超过 700 触发回收
# 10:  第 0 代回收 10 次后，回收第 1 代
# 10:  第 1 代回收 10 次后，回收第 2 代
```

### 手动垃圾回收

```python
import gc

# 禁用自动垃圾回收
gc.disable()

# 创建大量对象
objects = [object() for _ in range(1000)]

# 手动触发回收
collected = gc.collect()
print(f"回收了 {collected} 个对象")

# 重新启用
gc.enable()
```

## 弱引用

弱引用不增加对象的引用计数，适合缓存场景。

```python
import weakref

class Data:
    def __init__(self, value):
        self.value = value

# 强引用
obj = Data(100)
print(obj.value)  # 100

# 弱引用
weak_obj = weakref.ref(obj)
print(weak_obj().value)  # 100

# 删除强引用后，对象被回收
del obj
print(weak_obj())  # None
```

### WeakValueDictionary

自动清理失效引用的字典。

```python
import weakref

class User:
    def __init__(self, name):
        self.name = name

# 普通字典会保持引用
cache = {}
user = User("Alice")
cache[1] = user
del user
print(1 in cache)  # True，对象未被回收

# WeakValueDictionary 只保持弱引用
weak_cache = weakref.WeakValueDictionary()
user = User("Bob")
weak_cache[2] = user
del user
print(2 in weak_cache)  # False，对象已被回收
```

## gc 模块常用方法

```python
import gc

# 获取所有被追踪的对象
all_objects = gc.get_objects()
print(f"追踪了 {len(all_objects)} 个对象")

# 查看垃圾对象
gc.collect()
garbage = gc.garbage
print(f"无法回收的对象: {len(garbage)}")

# 查看引用某对象的所有对象
import sys
obj = []
referrers = gc.get_referrers(obj)
print(f"{len(referrers)} 个对象引用了 obj")

# 查看对象引用的所有对象
referents = gc.get_referents(obj)
print(f"obj 引用了 {len(referents)} 个对象")
```

## 使用场景

### 场景 1：内存敏感应用
长时间运行的服务器程序，需要定期手动回收。

```python
import gc
import time

def process_data():
    # 处理大量数据
    data = [i for i in range(1000000)]
    # ... 处理逻辑
    
    # 手动触发垃圾回收
    gc.collect()

while True:
    process_data()
    time.sleep(60)
```

### 场景 2：缓存系统
使用弱引用避免缓存占用过多内存。

```python
import weakref

class ImageCache:
    def __init__(self):
        self._cache = weakref.WeakValueDictionary()
    
    def get(self, path):
        return self._cache.get(path)
    
    def set(self, path, image):
        self._cache[path] = image
```

### 场景 3：内存泄漏排查
分析循环引用导致的内存泄漏。

```python
import gc
import objgraph

# 显示最常见的对象类型
objgraph.show_most_common_types()

# 显示某类型对象的增长
objgraph.show_growth()

# 查看对象的引用链
obj = SomeClass()
objgraph.show_backrefs([obj], filename='refs.png')
```

### 场景 4：性能优化
在性能关键代码段暂时禁用垃圾回收。

```python
import gc

def performance_critical():
    gc.disable()  # 暂时禁用
    
    try:
        # 性能关键代码
        result = heavy_computation()
    finally:
        gc.enable()  # 恢复
    
    return result
```

## 易错点

### 易错点 1：误以为 `del` 会立即释放内存

❌ **错误理解**：
```python
import sys

data = [1] * 1000000
print(sys.getrefcount(data))  # 2

del data  # 以为内存立即释放
# 实际上只是删除了名字，如果还有其他引用，内存不会释放
```

✅ **正确理解**：
```python
import sys

data = [1] * 1000000
ref = data  # 增加引用

del data  # 只是删除 data 这个名字
# ref 仍然引用对象，内存未释放

del ref  # 现在引用计数为 0，内存才会释放
```

**说明**：`del` 只是删除变量名，不是直接释放内存。只有引用计数为 0 时，内存才会被回收。

### 易错点 2：循环引用导致内存泄漏

❌ **错误示例**：
```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

# 创建循环引用
node1 = Node(1)
node2 = Node(2)
node1.next = node2
node2.next = node1  # 循环引用

del node1
del node2
# 两个对象互相引用，引用计数不为 0
# 需要等垃圾回收器介入
```

✅ **正确做法**：
```python
import weakref

class Node:
    def __init__(self, value):
        self.value = value
        self._next = None
    
    @property
    def next(self):
        return self._next() if self._next else None
    
    @next.setter
    def next(self, node):
        self._next = weakref.ref(node) if node else None

# 使用弱引用避免循环引用
```

**说明**：循环引用会导致引用计数永远不为 0。应该使用弱引用或依赖分代垃圾回收。

### 易错点 3：手动调用 `gc.collect()` 的时机不当

❌ **错误做法**：
```python
import gc

# 在循环中频繁调用
for i in range(1000):
    data = process_data(i)
    gc.collect()  # 性能极差
```

✅ **正确做法**：
```python
import gc

# 只在必要时手动调用
for i in range(1000):
    data = process_data(i)

# 处理完大批量数据后，手动回收一次
gc.collect()
```

**说明**：频繁调用 `gc.collect()` 会严重影响性能。应该让自动垃圾回收机制工作，只在处理大量数据后手动调用一次。

## 练习题

### 基础练习

**题目 1**：编写程序，创建一个对象，打印其引用计数，然后创建多个引用，观察计数变化。

<details>
<summary>💡 查看答案</summary>

```python
import sys

obj = [1, 2, 3]
print(f"初始引用计数: {sys.getrefcount(obj) - 1}")

ref1 = obj
print(f"添加 ref1: {sys.getrefcount(obj) - 1}")

ref2 = obj
print(f"添加 ref2: {sys.getrefcount(obj) - 1}")

del ref1
print(f"删除 ref1: {sys.getrefcount(obj) - 1}")
```

**解析**：`sys.getrefcount()` 本身会增加一次引用，所以要减 1。
</details>

**题目 2**：创建循环引用，使用 `gc.collect()` 回收。

<details>
<summary>💡 查看答案</summary>

```python
import gc

class Node:
    def __init__(self, value):
        self.value = value
        self.ref = None

node1 = Node(1)
node2 = Node(2)
node1.ref = node2
node2.ref = node1

del node1, node2

# 手动触发垃圾回收
collected = gc.collect()
print(f"回收了 {collected} 个对象")
```
</details>

### 进阶练习

**题目 3**：实现一个 LRU 缓存类，使用 `WeakValueDictionary` 自动清理过期条目。

<details>
<summary>💡 查看答案</summary>

```python
import weakref
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self._cache = OrderedDict()
        self._weak_cache = weakref.WeakValueDictionary()
    
    def get(self, key):
        if key in self._cache:
            self._cache.move_to_end(key)
            return self._cache[key]
        return self._weak_cache.get(key)
    
    def put(self, key, value):
        if len(self._cache) >= self.capacity:
            self._cache.popitem(last=False)
        self._cache[key] = value
        self._weak_cache[key] = value
```
</details>

### 挑战练习

**题目 4**：编写内存泄漏检测工具，比较两次快照之间对象数量的变化。

<details>
<summary>💡 查看提示</summary>

使用 `gc.get_objects()` 获取所有对象，统计各类型对象数量，比较前后差异。
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：Python 的垃圾回收使用了哪两种机制？各自解决什么问题？

2. **为什么需要**：如果只有引用计数，会有什么问题？为什么需要分代回收？

3. **怎么用**：向新手解释什么是循环引用？如何避免循环引用导致的内存泄漏？

4. **注意事项**：什么时候需要手动调用 `gc.collect()`？频繁调用会有什么副作用？

::: tip 学习建议
理解垃圾回收机制对性能优化很重要！但大多数情况下，Python 的自动内存管理已经足够好，不要过早优化。
:::
