# 多线程编程

多线程适合 I/O 密集型任务，但受 GIL 限制，不适合 CPU 密集型任务。

## threading 模块

### 创建线程

```python
import threading

def worker(name):
    print(f"线程 {name} 开始")
    # 执行任务
    print(f"线程 {name} 结束")

# 创建线程
t = threading.Thread(target=worker, args=("A",))
t.start()
t.join()  # 等待线程结束
```

### 线程类

```python
class WorkerThread(threading.Thread):
    def __init__(self, name):
        super().__init__()
        self.name = name
    
    def run(self):
        print(f"线程 {self.name} 执行中")

t = WorkerThread("Worker-1")
t.start()
t.join()
```

## GIL（全局解释器锁）

CPython 的 GIL 确保同一时刻只有一个线程执行 Python 字节码。

```python
import threading
import time

# CPU 密集型任务受 GIL 限制
def cpu_bound():
    count = 0
    for i in range(10000000):
        count += 1

# I/O 密集型任务不受 GIL 影响
def io_bound():
    time.sleep(1)
```

## 线程同步

### Lock（互斥锁）

```python
import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    with lock:
        counter += 1

threads = [threading.Thread(target=increment) for _ in range(100)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(counter)  # 100
```

### RLock（可重入锁）

```python
rlock = threading.RLock()

def recursive_func(n):
    with rlock:
        if n > 0:
            recursive_func(n - 1)
```

### Semaphore（信号量）

```python
import threading

semaphore = threading.Semaphore(3)  # 最多 3 个线程

def access_resource(name):
    with semaphore:
        print(f"{name} 访问资源")
        time.sleep(1)
```

### Event（事件）

```python
event = threading.Event()

def waiter():
    print("等待事件...")
    event.wait()
    print("事件触发！")

t = threading.Thread(target=waiter)
t.start()

time.sleep(1)
event.set()  # 触发事件
```

## ThreadPoolExecutor

线程池管理，自动复用线程。

```python
from concurrent.futures import ThreadPoolExecutor

def task(n):
    return n * n

with ThreadPoolExecutor(max_workers=5) as executor:
    results = executor.map(task, range(10))
    print(list(results))
```

### submit() 和 Future

```python
with ThreadPoolExecutor() as executor:
    future = executor.submit(task, 5)
    result = future.result()  # 阻塞等待结果
    print(result)
```

## 使用场景

### 场景 1：网络请求
并发下载文件、API 调用。

```python
import requests
from concurrent.futures import ThreadPoolExecutor

def download(url):
    response = requests.get(url)
    return response.content

urls = ["http://example.com/1", "http://example.com/2"]
with ThreadPoolExecutor(max_workers=5) as executor:
    results = executor.map(download, urls)
```

### 场景 2：数据库查询
并发查询多个数据库。

### 场景 3：文件 I/O
并发读写多个文件。

### 场景 4：定时任务
后台线程执行周期任务。

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

**题目 1**：创建 5 个线程，每个线程打印自己的编号。

<details>
<summary>💡 查看答案</summary>

```python
import threading

def worker(n):
    print(f"线程 {n}")

threads = [threading.Thread(target=worker, args=(i,)) for i in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()
```
</details>

### 进阶练习

**题目 2**：实现线程安全的计数器类。

<details>
<summary>💡 查看答案</summary>

```python
class SafeCounter:
    def __init__(self):
        self._value = 0
        self._lock = threading.Lock()
    
    def increment(self):
        with self._lock:
            self._value += 1
    
    def get_value(self):
        with self._lock:
            return self._value
```
</details>

### 挑战练习

**题目 3**：使用线程池并发处理 100 个任务，限制最多 10 个线程。

## 费曼学习法检验

1. **这是什么**：GIL 是什么？为什么多线程不能加速 CPU 密集型任务？

2. **为什么需要**：什么时候用多线程？什么时候用多进程？

3. **怎么用**：向新手解释 Lock 和 RLock 的区别？

4. **注意事项**：死锁是什么？如何避免死锁？

::: tip 学习建议
多线程适合 I/O 密集型任务！理解 GIL 是关键。
:::
