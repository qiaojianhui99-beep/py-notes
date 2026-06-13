# 上下文管理器

上下文管理器通过 `with` 语句自动管理资源的获取和释放，确保代码的健壮性。

## with 语句

```python
# 传统方式
f = open('file.txt', 'r')
try:
    data = f.read()
finally:
    f.close()

# with 语句（推荐）
with open('file.txt', 'r') as f:
    data = f.read()
# 自动关闭文件
```

## 自定义上下文管理器

### 类实现

实现 `__enter__()` 和 `__exit__()` 方法。

```python
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
        # 返回 True 表示抑制异常
        return False

with FileManager('test.txt', 'w') as f:
    f.write('Hello')
```

### 生成器实现

使用 `contextlib.contextmanager` 装饰器。

```python
from contextlib import contextmanager

@contextmanager
def file_manager(filename, mode):
    f = open(filename, mode)
    try:
        yield f
    finally:
        f.close()

with file_manager('test.txt', 'w') as f:
    f.write('Hello')
```

## contextlib 模块

### suppress

忽略指定异常。

```python
from contextlib import suppress

with suppress(FileNotFoundError):
    os.remove('nonexistent.txt')
# 文件不存在也不会报错
```

### closing

自动调用对象的 `close()` 方法。

```python
from contextlib import closing
from urllib.request import urlopen

with closing(urlopen('http://example.com')) as page:
    data = page.read()
```

### ExitStack

动态管理多个上下文。

```python
from contextlib import ExitStack

with ExitStack() as stack:
    files = [stack.enter_context(open(f'file{i}.txt', 'w')) 
             for i in range(5)]
    for i, f in enumerate(files):
        f.write(f'File {i}')
```

## 使用场景

### 场景 1：数据库连接
自动提交或回滚事务。

```python
class DatabaseConnection:
    def __enter__(self):
        self.conn = connect_to_db()
        return self.conn
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.conn.commit()
        else:
            self.conn.rollback()
        self.conn.close()
```

### 场景 2：临时切换目录
自动恢复原目录。

```python
import os
from contextlib import contextmanager

@contextmanager
def change_dir(path):
    old_dir = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old_dir)

with change_dir('/tmp'):
    # 在 /tmp 目录工作
    pass
# 自动恢复原目录
```

### 场景 3：性能计时
测量代码块执行时间。

```python
import time
from contextlib import contextmanager

@contextmanager
def timer(name):
    start = time.time()
    yield
    end = time.time()
    print(f"{name} 耗时: {end - start:.4f}秒")

with timer("数据处理"):
    # 执行耗时操作
    time.sleep(1)
```

### 场景 4：锁管理
自动获取和释放锁。

```python
import threading

lock = threading.Lock()

with lock:
    # 临界区代码
    shared_resource += 1
# 自动释放锁
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

**题目 1**：实现上下文管理器 `Timer`，打印代码块执行时间。

<details>
<summary>💡 查看答案</summary>

```python
import time

class Timer:
    def __enter__(self):
        self.start = time.time()
        return self
    
    def __exit__(self, *args):
        self.end = time.time()
        print(f"耗时: {self.end - self.start:.4f}秒")

with Timer():
    time.sleep(0.5)
```
</details>

### 进阶练习

**题目 2**：使用 `@contextmanager` 实现临时修改环境变量。

<details>
<summary>💡 查看答案</summary>

```python
import os
from contextlib import contextmanager

@contextmanager
def temp_env_var(key, value):
    old_value = os.environ.get(key)
    os.environ[key] = value
    try:
        yield
    finally:
        if old_value is None:
            del os.environ[key]
        else:
            os.environ[key] = old_value
```
</details>

### 挑战练习

**题目 3**：实现上下文管理器，在进入和退出时发送通知（模拟监控系统）。

## 费曼学习法检验

1. **这是什么**：`__enter__()` 和 `__exit__()` 分别在什么时候调用？

2. **为什么需要**：为什么推荐用 `with` 而不是手动 try-finally？

3. **怎么用**：向新手解释 `__exit__()` 的三个参数是什么？

4. **注意事项**：`__exit__()` 返回 True 和 False 有什么区别？

::: tip 学习建议
上下文管理器让资源管理更安全！养成使用 with 语句的习惯。
:::
