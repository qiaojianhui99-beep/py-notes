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
