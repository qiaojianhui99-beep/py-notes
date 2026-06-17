# asyncio 进阶

深入 asyncio 的高级特性和实战应用。

## aiohttp 异步 HTTP

```python
import aiohttp
import asyncio

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    async with aiohttp.ClientSession() as session:
        html = await fetch(session, 'http://example.com')
        print(html[:100])

asyncio.run(main())
```

### 并发请求

```python
async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results

urls = ['http://example.com', 'http://example.org']
results = asyncio.run(fetch_all(urls))
```

## aiofiles 异步文件操作

```python
import aiofiles
import asyncio

async def read_file(filename):
    async with aiofiles.open(filename, 'r') as f:
        content = await f.read()
        return content

async def write_file(filename, content):
    async with aiofiles.open(filename, 'w') as f:
        await f.write(content)

asyncio.run(write_file('test.txt', 'Hello Async'))
```

## 异步队列

```python
import asyncio

async def producer(queue, n):
    for i in range(n):
        await asyncio.sleep(0.1)
        await queue.put(i)
        print(f"生产: {i}")

async def consumer(queue):
    while True:
        item = await queue.get()
        print(f"消费: {item}")
        queue.task_done()
        await asyncio.sleep(0.2)

async def main():
    queue = asyncio.Queue()
    
    prod = asyncio.create_task(producer(queue, 5))
    cons = asyncio.create_task(consumer(queue))
    
    await prod
    await queue.join()
    cons.cancel()

asyncio.run(main())
```

## 异步锁

```python
import asyncio

lock = asyncio.Lock()
counter = 0

async def increment():
    global counter
    async with lock:
        temp = counter
        await asyncio.sleep(0.01)
        counter = temp + 1

async def main():
    await asyncio.gather(*[increment() for _ in range(100)])
    print(counter)

asyncio.run(main())
```

## Semaphore（信号量）

```python
semaphore = asyncio.Semaphore(3)

async def access_resource(name):
    async with semaphore:
        print(f"{name} 访问资源")
        await asyncio.sleep(1)

async def main():
    await asyncio.gather(*[
        access_resource(f"任务{i}") for i in range(10)
    ])

asyncio.run(main())
```

## asyncio.wait()

更灵活的任务等待。

```python
async def task(name, delay):
    await asyncio.sleep(delay)
    return f"{name} 完成"

async def main():
    tasks = [
        asyncio.create_task(task("A", 1)),
        asyncio.create_task(task("B", 2)),
        asyncio.create_task(task("C", 3))
    ]
    
    # 等待第一个完成
    done, pending = await asyncio.wait(
        tasks, 
        return_when=asyncio.FIRST_COMPLETED
    )
    
    print(f"第一个完成: {done}")
    
    # 取消剩余任务
    for task in pending:
        task.cancel()

asyncio.run(main())
```

## 使用场景

### 场景 1：爬虫
高并发网页抓取。

```python
async def crawl(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

async def main():
    urls = [f"http://example.com/page{i}" for i in range(100)]
    results = await asyncio.gather(*[crawl(url) for url in urls])
```

### 场景 2：API 聚合
并发调用多个 API。

### 场景 3：实时数据处理
WebSocket、消息队列。

### 场景 4：微服务通信
异步 RPC 调用。

## 易错点

### 易错点 1：用 `asyncio.gather` 没容错——一个失败全盘皆输

❌ **错误示例**：
```python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        resp.raise_for_status()
        return await resp.text()

async def main():
    async with aiohttp.ClientSession() as session:
        # 只要有一个 URL 失败，整个 gather 抛错
        # 其他成功的请求结果也拿不到
        results = await asyncio.gather(
            fetch(session, "https://valid.com"),
            fetch(session, "https://404.com"),
            fetch(session, "https://valid2.com"),
        )
```

✅ **正确做法**：
```python
async def main():
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            fetch(session, "https://valid.com"),
            fetch(session, "https://404.com"),
            fetch(session, "https://valid2.com"),
            return_exceptions=True,   # 异常作为返回值，不传播
        )
        # results[1] 会是 Exception 对象，其他是字符串
        ok = [r for r in results if not isinstance(r, Exception)]
```

**说明**：`asyncio.gather(*tasks)` 默认 `return_exceptions=False`，任意一个任务抛错整个 `gather` 立刻抛异常，其他任务的结果全部丢失。批量抓取网页、调用多个 API 时几乎都应该传 `return_exceptions=True`，让"部分失败"成为可处理的情况。

### 易错点 2：把协程当 Task 用，导致实际还是串行

❌ **错误示例**：
```python
import asyncio

async def task(n):
    await asyncio.sleep(1)
    return n * 2

async def main():
    # 一行 await 一个，根本没并发
    a = await task(1)   # 1 秒
    b = await task(2)   # 又 1 秒
    c = await task(3)   # 又 1 秒
    # 总共 3 秒
```

✅ **正确做法**：
```python
# 方法 1：gather（推荐）
async def main():
    a, b, c = await asyncio.gather(task(1), task(2), task(3))
    # 总共 1 秒

# 方法 2：显式 create_task
async def main():
    t1 = asyncio.create_task(task(1))
    t2 = asyncio.create_task(task(2))
    t3 = asyncio.create_task(task(3))
    a, b, c = await t1, await t2, await t3   # 总共 1 秒
```

**说明**：`asyncio.gather(coro1, coro2)` 内部会自动 `create_task`，让多个协程同时跑。但**直接 `await coro1; await coro2` 是顺序执行**。要并发，要么 `gather`，要么先 `create_task` 再 `await`。

### 易错点 3：用 `asyncio.Queue` 但忘了 `task_done` / `join`

❌ **错误示例**：
```python
import asyncio

async def consumer(q):
    while True:
        item = await q.get()
        print(item)
        # 忘了 q.task_done()
        # 主协程 await q.join() 永远等不到，死锁

async def main():
    q = asyncio.Queue()
    for i in range(5): await q.put(i)
    c = asyncio.create_task(consumer(q))
    await q.join()   # 永远卡住
    c.cancel()
```

✅ **正确做法**：
```python
async def consumer(q):
    while True:
        item = await q.get()
        try:
            print(item)
        finally:
            q.task_done()   # 标记这个任务处理完了

async def main():
    q = asyncio.Queue()
    for i in range(5): await q.put(i)
    c = asyncio.create_task(consumer(q))
    await q.join()   # 等到所有 put 进去的项都被 task_done
    c.cancel()
```

**说明**：`asyncio.Queue.join()` 的协议是"队列里所有被 `get` 走的项都必须 `task_done`"。消费者处理完一项就调 `task_done()`，主流程才能从 `await q.join()` 返回。漏调会让 `join()` 永远挂起。把"处理"放进 `try/finally` 还能保证异常也算"做完了"。

## 练习题

### 基础练习

**题目 1**：使用 aiohttp 并发请求 5 个 URL，打印响应状态码。

<details>
<summary>💡 查看答案</summary>

```python
import aiohttp
import asyncio

async def fetch_status(session, url):
    async with session.get(url) as response:
        return response.status

async def main():
    urls = [f'http://httpbin.org/delay/{i}' for i in range(1, 6)]
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_status(session, url) for url in urls]
        statuses = await asyncio.gather(*tasks)
        print(statuses)

asyncio.run(main())
```
</details>

### 进阶练习

**题目 2**：实现异步重试机制，最多重试 3 次。

<details>
<summary>💡 查看答案</summary>

```python
async def fetch_with_retry(url, max_retries=3):
    for attempt in range(max_retries):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    return await response.text()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(1)
```
</details>

### 挑战练习

**题目 3**：实现异步限速器，每秒最多处理 10 个请求。

## 费曼学习法检验

1. **这是什么**：aiohttp 和 requests 有什么区别？

2. **为什么需要**：为什么需要异步锁？asyncio 不是单线程吗？

3. **怎么用**：向新手解释 asyncio.gather() 和 asyncio.wait() 的区别？

4. **注意事项**：如何处理异步代码中的异常？

::: tip 学习建议
asyncio 进阶是高性能 Python 的关键！结合 aiohttp 能写出强大的异步应用。
:::
