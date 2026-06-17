# 多进程编程

多进程绕过 GIL 限制，适合 CPU 密集型任务。

## multiprocessing 模块

### 创建进程

```python
from multiprocessing import Process

def worker(name):
    print(f"进程 {name} 开始")

p = Process(target=worker, args=("A",))
p.start()
p.join()
```

### 进程池

```python
from multiprocessing import Pool

def square(n):
    return n * n

with Pool(processes=4) as pool:
    results = pool.map(square, range(10))
    print(results)
```

## 进程间通信

### Queue（队列）

```python
from multiprocessing import Process, Queue

def producer(q):
    for i in range(5):
        q.put(i)
    q.put(None)  # 结束信号

def consumer(q):
    while True:
        item = q.get()
        if item is None:
            break
        print(f"处理: {item}")

q = Queue()
p1 = Process(target=producer, args=(q,))
p2 = Process(target=consumer, args=(q,))

p1.start()
p2.start()
p1.join()
p2.join()
```

### Pipe（管道）

```python
from multiprocessing import Process, Pipe

def sender(conn):
    conn.send("Hello")
    conn.close()

def receiver(conn):
    msg = conn.recv()
    print(msg)

parent_conn, child_conn = Pipe()
p1 = Process(target=sender, args=(child_conn,))
p2 = Process(target=receiver, args=(parent_conn,))

p1.start()
p2.start()
p1.join()
p2.join()
```

### Manager（共享状态）

```python
from multiprocessing import Process, Manager

def worker(shared_dict, key, value):
    shared_dict[key] = value

with Manager() as manager:
    shared_dict = manager.dict()
    
    processes = []
    for i in range(5):
        p = Process(target=worker, args=(shared_dict, i, i*i))
        p.start()
        processes.append(p)
    
    for p in processes:
        p.join()
    
    print(dict(shared_dict))
```

## 进程锁

```python
from multiprocessing import Process, Lock

def print_numbers(lock, name):
    with lock:
        for i in range(5):
            print(f"{name}: {i}")

lock = Lock()
p1 = Process(target=print_numbers, args=(lock, "P1"))
p2 = Process(target=print_numbers, args=(lock, "P2"))

p1.start()
p2.start()
p1.join()
p2.join()
```

## ProcessPoolExecutor

```python
from concurrent.futures import ProcessPoolExecutor

def cpu_task(n):
    return sum(i*i for i in range(n))

with ProcessPoolExecutor(max_workers=4) as executor:
    results = executor.map(cpu_task, [10000]*10)
    print(list(results))
```

## 使用场景

### 场景 1：并行计算
大规模数值计算、数据处理。

### 场景 2：图像处理
并行处理多张图片。

### 场景 3：视频编码
并行编码视频片段。

### 场景 4：数据分析
并行处理数据集的不同部分。

## 易错点

### 易错点 1：Windows 下忘了 `if __name__ == "__main__"`

❌ **错误示例**：
```python
from multiprocessing import Process

def worker():
    print("工作")

p = Process(target=worker)
p.start()
p.join()
# Windows / macOS（spawn 启动方式）：RuntimeError 或无限递归导入
```

✅ **正确做法**：
```python
from multiprocessing import Process

def worker():
    print("工作")

if __name__ == "__main__":
    p = Process(target=worker)
    p.start()
    p.join()
```

**说明**：Windows 和 macOS 默认用 `spawn` 启动方式，子进程会**重新导入主模块**。如果不加 `if __name__ == "__main__":` 守卫，子进程导入时会再次执行 `Process().start()`，无限递归创建子进程。Linux 默认用 `fork`，老代码可能跑得起来，但跨平台兼容性需要这个守卫。

### 易错点 2：直接共享变量失败

❌ **错误示例**：
```python
from multiprocessing import Process

counter = 0   # 全局变量

def increment():
    global counter
    counter += 1

ps = [Process(target=increment) for _ in range(10)]
for p in ps: p.start()
for p in ps: p.join()
print(counter)  # 0，子进程根本没修改父进程的变量
```

✅ **正确做法**：
```python
from multiprocessing import Process, Value, Manager

# 方法 1：用 Value/Array（共享内存）
counter = Value('i', 0)
def increment():
    with counter.get_lock():
        counter.value += 1

# 方法 2：用 Manager（更灵活，支持 dict/list）
manager = Manager()
shared_list = manager.list()
```

**说明**：进程之间**内存独立**，子进程拿到的是父进程变量的拷贝。直接改全局变量不会反映回父进程。要共享，必须用 `multiprocessing.Value/Array`（共享内存）或 `Manager`（独立进程托管对象）。

### 易错点 3：进程间传递闭包/lambda 失败

❌ **错误示例**：
```python
from multiprocessing import Pool

def make_func():
    x = 10
    return lambda n: n + x   # 闭包

with Pool(4) as p:
    print(p.map(make_func(), [1, 2, 3]))  # AttributeError：无法 pickle lambda
```

✅ **正确做法**：
```python
from multiprocessing import Pool

# 必须用模块顶层、可 pickle 的函数
def add_x(n, x=10):
    return n + x

if __name__ == "__main__":
    with Pool(4) as p:
        # functools.partial 也支持 pickle
        from functools import partial
        print(p.map(partial(add_x, x=10), [1, 2, 3]))
```

**说明**：跨进程传函数要靠 `pickle` 序列化。**lambda、闭包、嵌套函数不能 pickle**。被传的函数和参数都必须在模块顶层定义。这也是 `ProcessPoolExecutor` 和 `multiprocessing.Pool` 的硬性限制。

## 练习题

### 基础练习

**题目 1**：创建 4 个进程，每个进程计算一个数的平方并打印。

<details>
<summary>💡 查看答案</summary>

```python
from multiprocessing import Process

def square(n):
    print(f"{n} 的平方是 {n*n}")

processes = [Process(target=square, args=(i,)) for i in range(1, 5)]
for p in processes:
    p.start()
for p in processes:
    p.join()
```
</details>

### 进阶练习

**题目 2**：使用进程池计算前 100 个数的立方和。

<details>
<summary>💡 查看答案</summary>

```python
from multiprocessing import Pool

def cube(n):
    return n ** 3

with Pool(processes=4) as pool:
    results = pool.map(cube, range(100))
    print(sum(results))
```
</details>

### 挑战练习

**题目 3**：实现生产者-消费者模型，5 个生产者，3 个消费者。

## 费曼学习法检验

1. **这是什么**：进程和线程有什么区别？为什么多进程能绕过 GIL？

2. **为什么需要**：什么时候用多进程？开销有多大？

3. **怎么用**：向新手解释 Queue 和 Pipe 的区别？

4. **注意事项**：进程间如何共享数据？为什么要谨慎使用 Manager？

::: tip 学习建议
多进程适合 CPU 密集型任务！但要注意进程创建和通信的开销。
:::
