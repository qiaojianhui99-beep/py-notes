# asyncio 基础

asyncio 是 Python 3.4+ 引入的异步编程框架，适合 I/O 密集型任务。

## async/await 语法

### 定义协程

```python
import asyncio

async def greet():
    print("Hello")
    await asyncio.sleep(1)
    print("World")

# 运行协程
asyncio.run(greet())
```

### await 关键字

只能在 async 函数内使用 await。

```python
async def fetch_data():
    await asyncio.sleep(1)
    return "数据"

async def main():
    result = await fetch_data()
    print(result)

asyncio.run(main())
```

## 事件循环

事件循环是 asyncio 的核心。

```python
# Python 3.7+ 推荐写法
asyncio.run(main())

# 旧版本写法
loop = asyncio.get_event_loop()
loop.run_until_complete(main())
loop.close()
```

## 并发执行

### asyncio.gather()

并发运行多个协程。

```python
async def task(name, delay):
    await asyncio.sleep(delay)
    print(f"{name} 完成")
    return f"{name} result"

async def main():
    results = await asyncio.gather(
        task("A", 2),
        task("B", 1),
        task("C", 3)
    )
    print(results)

asyncio.run(main())
```

### asyncio.create_task()

创建并发任务。

```python
async def main():
    task1 = asyncio.create_task(task("A", 2))
    task2 = asyncio.create_task(task("B", 1))
    
    await task1
    await task2

asyncio.run(main())
```

## 超时控制

### asyncio.wait_for()

```python
async def slow_task():
    await asyncio.sleep(5)
    return "完成"

async def main():
    try:
        result = await asyncio.wait_for(slow_task(), timeout=2)
    except asyncio.TimeoutError:
        print("超时了")

asyncio.run(main())
```

## 异步上下文管理器

```python
class AsyncResource:
    async def __aenter__(self):
        print("获取资源")
        await asyncio.sleep(0.1)
        return self
    
    async def __aexit__(self, *args):
        print("释放资源")
        await asyncio.sleep(0.1)

async def main():
    async with AsyncResource() as resource:
        print("使用资源")

asyncio.run(main())
```

## 异步迭代器

```python
class AsyncCounter:
    def __init__(self, max_count):
        self.max_count = max_count
        self.count = 0
    
    def __aiter__(self):
        return self
    
    async def __anext__(self):
        if self.count < self.max_count:
            self.count += 1
            await asyncio.sleep(0.1)
            return self.count
        raise StopAsyncIteration

async def main():
    async for num in AsyncCounter(5):
        print(num)

asyncio.run(main())
```

## 使用场景

### 场景 1：并发 HTTP 请求
同时发起多个网络请求。

### 场景 2：WebSocket 服务
实时通信服务器。

### 场景 3：数据库查询
并发执行多个数据库查询。

### 场景 4：爬虫
高效并发爬取网页。

## 易错点

### 易错点 1：在 async 函数里调用阻塞 I/O

❌ **错误示例**：
```python
import asyncio
import time

async def task():
    time.sleep(1)   # 阻塞！整个事件循环卡住
    return "done"

async def main():
    await asyncio.gather(task(), task(), task())  # 期望并发，实际串行 3 秒

asyncio.run(main())  # 总耗时 3 秒
```

✅ **正确做法**：
```python
import asyncio

async def task():
    await asyncio.sleep(1)   # 让出控制权
    return "done"

async def main():
    await asyncio.gather(task(), task(), task())  # 真并发

asyncio.run(main())  # 总耗时 1 秒
```

**说明**：`async def` 只是声明"这个函数是协程"，**不会魔法般变成非阻塞**。`time.sleep`、`requests.get`、`open().read()` 这些都是同步阻塞，会霸占事件循环。要用 `asyncio.sleep`、`aiohttp`、`aiofiles` 这类异步库替代。

### 易错点 2：忘了 `await` 导致协程没真正执行

❌ **错误示例**：
```python
import asyncio

async def hello():
    print("Hi")

async def main():
    hello()      # 没 await，只是创建了协程对象，根本没执行
    # RuntimeWarning: coroutine 'hello' was never awaited

asyncio.run(main())
```

✅ **正确做法**：
```python
async def main():
    await hello()    # 必须显式 await

# 或并发：
async def main():
    await asyncio.gather(hello(), hello())
```

**说明**：调用 `async def` 函数只是**返回一个协程对象**，函数体并不会执行。必须 `await` 它、或用 `asyncio.create_task()` 调度、或交给 `asyncio.gather()`，代码才真正运行。Python 会发出 `RuntimeWarning: never awaited` 警告。

### 易错点 3：在同步上下文里调用 `asyncio.run()`

❌ **错误示例**：
```python
import asyncio

async def fetch_data():
    await asyncio.sleep(1)
    return [1, 2, 3]

# 已经在异步函数里又调 asyncio.run
async def main():
    data = asyncio.run(fetch_data())  # RuntimeError: asyncio.run() cannot be called from a running event loop
```

✅ **正确做法**：
```python
# 顶层同步入口
def sync_main():
    data = asyncio.run(fetch_data())

# 已在 async 上下文：用 await
async def main():
    data = await fetch_data()

# 跨同步/异步库的桥：用 asyncio.to_thread 把同步阻塞函数包成协程
async def main():
    result = await asyncio.to_thread(blocking_function)
```

**说明**：`asyncio.run()` 是事件循环的"顶层入口"，每个进程只能有一个运行中的事件循环。已经在 `async def` 里就 `await`，不要嵌套 `asyncio.run`。从同步代码调用异步代码用 `asyncio.run()`，从异步代码调用同步阻塞代码用 `asyncio.to_thread()`。

## 练习题

### 基础练习

**题目 1**：编写异步函数，并发执行 3 个任务，每个任务延迟不同时间。

<details>
<summary>💡 查看答案</summary>

```python
import asyncio

async def task(name, delay):
    await asyncio.sleep(delay)
    return f"{name} 完成"

async def main():
    results = await asyncio.gather(
        task("任务1", 1),
        task("任务2", 2),
        task("任务3", 0.5)
    )
    print(results)

asyncio.run(main())
```
</details>

### 进阶练习

**题目 2**：实现异步生成器，每秒生成一个数字。

<details>
<summary>💡 查看答案</summary>

```python
async def async_range(n):
    for i in range(n):
        await asyncio.sleep(1)
        yield i

async def main():
    async for num in async_range(5):
        print(num)

asyncio.run(main())
```
</details>

### 挑战练习

**题目 3**：实现异步重试机制，最多重试 3 次，每次间隔 1 秒。

## 费曼学习法检验

1. **这是什么**：协程和线程有什么区别？asyncio 如何实现并发？

2. **为什么需要**：什么时候用 asyncio？和多线程比有什么优势？

3. **怎么用**：向新手解释 async/await 的执行流程？

4. **注意事项**：为什么不能在同步函数中调用 await？

::: tip 学习建议
asyncio 是现代 Python 的核心特性！掌握异步编程能写出高性能 I/O 程序。
:::
