# concurrent.futures

concurrent.futures 提供了统一的并发接口，简化多线程和多进程编程。

## ThreadPoolExecutor

线程池执行器，适合 I/O 密集型任务。

### 基本使用

```python
from concurrent.futures import ThreadPoolExecutor

def task(n):
    return n * n

with ThreadPoolExecutor(max_workers=5) as executor:
    results = executor.map(task, range(10))
    print(list(results))
```

### submit() 方法

```python
from concurrent.futures import ThreadPoolExecutor

def download(url):
    # 模拟下载
    return f"Downloaded {url}"

with ThreadPoolExecutor(max_workers=3) as executor:
    future1 = executor.submit(download, "url1")
    future2 = executor.submit(download, "url2")
    
    print(future1.result())  # 阻塞等待结果
    print(future2.result())
```

## ProcessPoolExecutor

进程池执行器，适合 CPU 密集型任务。

```python
from concurrent.futures import ProcessPoolExecutor

def cpu_bound(n):
    return sum(i * i for i in range(n))

with ProcessPoolExecutor(max_workers=4) as executor:
    results = executor.map(cpu_bound, [10**6, 10**6, 10**6])
    print(list(results))
```

## Future 对象

### 检查状态

```python
from concurrent.futures import ThreadPoolExecutor
import time

def slow_task():
    time.sleep(2)
    return "完成"

with ThreadPoolExecutor() as executor:
    future = executor.submit(slow_task)
    
    print(future.done())      # False
    print(future.running())   # True
    
    result = future.result(timeout=5)  # 等待最多 5 秒
    print(future.done())      # True
```

### 回调函数

```python
def callback(future):
    print(f"任务完成: {future.result()}")

with ThreadPoolExecutor() as executor:
    future = executor.submit(task, 5)
    future.add_done_callback(callback)
```

## as_completed()

按完成顺序处理结果。

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import random

def task(n):
    time.sleep(random.uniform(0.1, 1))
    return n * n

with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(task, i) for i in range(5)]
    
    for future in as_completed(futures):
        print(f"结果: {future.result()}")
```

## wait()

等待多个 Future 完成。

```python
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED

with ThreadPoolExecutor() as executor:
    futures = [executor.submit(task, i) for i in range(5)]
    
    # 等待所有完成
    done, pending = wait(futures)
    
    # 等待第一个完成
    done, pending = wait(futures, return_when=FIRST_COMPLETED)
```

## 异常处理

```python
def may_fail(n):
    if n == 3:
        raise ValueError("错误")
    return n * n

with ThreadPoolExecutor() as executor:
    futures = [executor.submit(may_fail, i) for i in range(5)]
    
    for future in as_completed(futures):
        try:
            result = future.result()
            print(f"成功: {result}")
        except Exception as e:
            print(f"失败: {e}")
```

## 使用场景

### 场景 1：并发下载
同时下载多个文件。

```python
from concurrent.futures import ThreadPoolExecutor
import requests

def download_file(url):
    response = requests.get(url)
    return len(response.content)

urls = ["http://example.com/1", "http://example.com/2"]
with ThreadPoolExecutor(max_workers=10) as executor:
    results = executor.map(download_file, urls)
```

### 场景 2：并行计算
CPU 密集型任务并行化。

### 场景 3：批量数据处理
并发处理大量数据。

### 场景 4：API 聚合
并发调用多个 API。

## 易错点

### 易错点 1：`executor.map` 的结果按提交顺序而非完成顺序

❌ **错误示例**：
```python
from concurrent.futures import ThreadPoolExecutor
import time

def task(n):
    time.sleep(n)
    return n

with ThreadPoolExecutor(max_workers=3) as executor:
    # 提交顺序：sleep 5, 1, 3
    results = executor.map(task, [5, 1, 3])
    for r in results:
        print(r)   # 即使 1 先完成，也要等到 5 才打印
```

✅ **正确做法**：
```python
from concurrent.futures import ThreadPoolExecutor, as_completed

with ThreadPoolExecutor(max_workers=3) as executor:
    futures = [executor.submit(task, n) for n in [5, 1, 3]]

    # as_completed 按"完成时间"产出，谁先完成谁先出来
    for f in as_completed(futures):
        print(f.result())   # 可能顺序：1, 3, 5
```

**说明**：`executor.map(func, iterable)` 的语义是"按 iterable 顺序提交 + 按提交顺序拿结果"，第一个任务没完成就不会出第一个结果，**即使后面的任务已经完成**。要按"完成顺序"拿结果必须用 `submit + as_completed`。流式处理（如网页爬取边爬边处理）几乎都该用后者。

### 易错点 2：`with` 块结束时 Future 已经被取消，但忘了取结果

❌ **错误示例**：
```python
from concurrent.futures import ThreadPoolExecutor

def task():
    import time
    time.sleep(10)
    return "结果"

with ThreadPoolExecutor(max_workers=1) as executor:
    future = executor.submit(task)
    # 没取 future.result() 就退出 with 块
# with 退出时会调 shutdown(wait=True)，阻塞 10 秒等任务做完
# 或者：直接被强制取消（如果用了 cancel）
```

✅ **正确做法**：
```python
# 方法 1：明确取结果或处理异常
with ThreadPoolExecutor(max_workers=1) as executor:
    future = executor.submit(task)
    try:
        result = future.result(timeout=2)
    except TimeoutError:
        future.cancel()
        print("超时放弃")

# 方法 2：用 shutdown(wait=False) 让任务在后台继续，自己处理生命周期
executor = ThreadPoolExecutor(max_workers=1)
executor.submit(task)
# 显式管理生命周期，记得最后 shutdown
```

**说明**：`with ThreadPoolExecutor() as e` 在退出时会自动 `shutdown(wait=True)`——**阻塞主线程直到所有任务完成**。如果你忘了 `future.result()` 或任务卡住，整个程序会在 `with` 结束处等待。要么显式 `future.result(timeout=...)` 处理，要么不放在 `with` 里手动管理。

### 易错点 3：`ProcessPoolExecutor` 传了 lambda 或闭包

❌ **错误示例**：
```python
from concurrent.futures import ProcessPoolExecutor

def process(data):
    return [x ** 2 for x in data]

if __name__ == "__main__":
    data = [1, 2, 3, 4]

    with ProcessPoolExecutor() as executor:
        # 想做 partial，传了 lambda
        results = list(executor.map(lambda x: x ** 2, data))
        # AttributeError: Can't pickle <function <lambda>>
```

✅ **正确做法**：
```python
from concurrent.futures import ProcessPoolExecutor
from functools import partial

def square(x, exponent=2):
    return x ** exponent

if __name__ == "__main__":
    data = [1, 2, 3, 4]
    with ProcessPoolExecutor() as executor:
        # 用模块级函数 + partial
        results = list(executor.map(partial(square, exponent=2), data))
```

**说明**：跨进程必须 `pickle` 序列化任务函数和参数。**lambda、嵌套函数、闭包都不能 pickle**——这是 `ProcessPoolExecutor` 和 `multiprocessing.Pool` 的硬限制。`ThreadPoolExecutor` 在同进程内不受影响（共享内存，不用 pickle），但养成"任务函数都定义在模块顶层"的习惯能避免切到进程池时踩坑。

## 练习题

### 基础练习

**题目 1**：使用 ThreadPoolExecutor 并发计算 1-10 的平方。

<details>
<summary>💡 查看答案</summary>

```python
from concurrent.futures import ThreadPoolExecutor

def square(n):
    return n * n

with ThreadPoolExecutor(max_workers=5) as executor:
    results = executor.map(square, range(1, 11))
    print(list(results))
```
</details>

### 进阶练习

**题目 2**：使用 as_completed() 实现进度条，显示任务完成进度。

<details>
<summary>💡 查看答案</summary>

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def task(n):
    time.sleep(n)
    return n

with ThreadPoolExecutor(max_workers=3) as executor:
    futures = [executor.submit(task, i) for i in range(1, 6)]
    
    completed = 0
    total = len(futures)
    
    for future in as_completed(futures):
        result = future.result()
        completed += 1
        print(f"进度: {completed}/{total} - 完成任务 {result}")
```
</details>

### 挑战练习

**题目 3**：实现任务队列，动态添加任务并获取结果。

## 费曼学习法检验

1. **这是什么**：concurrent.futures 和 threading/multiprocessing 有什么区别？

2. **为什么需要**：什么时候用 ThreadPoolExecutor，什么时候用 ProcessPoolExecutor？

3. **怎么用**：向新手解释 map() 和 submit() 的区别？

4. **注意事项**：线程池的 max_workers 应该设置为多少？

::: tip 学习建议
concurrent.futures 是并发编程的高级接口！统一了线程和进程的使用方式。
:::
