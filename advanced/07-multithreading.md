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

### 易错点 1：用多线程跑 CPU 密集任务，速度反而更慢

❌ **错误示例**：
```python
import threading

def cpu_heavy():
    total = 0
    for i in range(10_000_000):
        total += i

# 期望"4 核 4 线程并行 → 快 4 倍"
threads = [threading.Thread(target=cpu_heavy) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
# 实际：比单线程还慢（GIL 切换开销）
```

✅ **正确做法**：
```python
from multiprocessing import Pool

def cpu_heavy(_):
    total = 0
    for i in range(10_000_000):
        total += i
    return total

# 多进程绕开 GIL，真正并行
if __name__ == "__main__":
    with Pool(4) as p:
        results = p.map(cpu_heavy, range(4))
```

**说明**：CPython 有 GIL（全局解释器锁），同一时刻只有一个线程在跑 Python 字节码。**多线程适合 I/O 密集型任务**（等待网络、磁盘、用户输入），**多进程才适合 CPU 密集型任务**（数学计算、图像处理）。

### 易错点 2：共享变量"读改写"没加锁

❌ **错误示例**：
```python
import threading

counter = 0

def increment():
    global counter
    for _ in range(100_000):
        counter += 1   # 不是原子操作！读、改、写三步可能被切走

ts = [threading.Thread(target=increment) for _ in range(10)]
for t in ts: t.start()
for t in ts: t.join()
print(counter)  # 期望 1000000，实际几十万
```

✅ **正确做法**：
```python
import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    for _ in range(100_000):
        with lock:
            counter += 1
```

**说明**：`counter += 1` 看着是一行，实际是 `LOAD → ADD → STORE` 三条字节码，线程可能在任一步被切走。共享变量的"读-改-写"必须用 `with lock:` 包起来。对纯整数累加，更轻量的方案是 `threading.Atomic` 没有，但可以用 `queue.Queue` 或干脆用 `multiprocessing.Value`。

### 易错点 3：守护线程在主进程退出时丢任务

❌ **错误示例**：
```python
import threading, time

def flush_to_db():
    while True:
        time.sleep(1)
        save_data()  # 重要数据落盘

t = threading.Thread(target=flush_to_db, daemon=True)
t.start()
# 主线程结束后，daemon 线程被强杀，可能 save_data() 写一半就没了
```

✅ **正确做法**：
```python
import threading, atexit

flush_stop = threading.Event()

def flush_to_db():
    while not flush_stop.is_set():
        if not flush_stop.wait(timeout=1):
            save_data()
    save_data()  # 退出前再刷一次

t = threading.Thread(target=flush_to_db)  # daemon=False
t.start()

def shutdown():
    flush_stop.set()
    t.join(timeout=5)  # 给 5 秒优雅退出

atexit.register(shutdown)
```

**说明**：`daemon=True` 的线程在主线程结束时**立刻被杀死**，正在做的事（写文件、入库、发消息）会被截断导致数据损坏。涉及"重要副作用"的线程不要设为 daemon，要么用 `Event` + `join` 做优雅退出，要么用 `concurrent.futures.ThreadPoolExecutor` 的上下文管理器自动 `shutdown(wait=True)`。

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
