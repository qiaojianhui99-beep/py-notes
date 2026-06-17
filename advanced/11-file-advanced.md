# 文件操作进阶

深入文件处理的高级技术和性能优化。

## 大文件处理

### 逐行读取

```python
# 不要这样：一次性读取全部
# content = open('huge.txt').read()  # 内存爆炸

# 推荐：逐行处理
with open('huge.txt', 'r') as f:
    for line in f:
        process(line)
```

### 分块读取

```python
def read_in_chunks(file_path, chunk_size=1024):
    with open(file_path, 'rb') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield chunk

for chunk in read_in_chunks('large_file.bin'):
    process(chunk)
```

## mmap 内存映射

```python
import mmap

with open('data.bin', 'r+b') as f:
    mm = mmap.mmap(f.fileno(), 0)
    
    # 像字符串一样访问
    print(mm[:10])
    
    # 查找
    pos = mm.find(b'pattern')
    
    mm.close()
```

## 临时文件

### tempfile 模块

```python
import tempfile

# 临时文件（自动删除）
with tempfile.TemporaryFile('w+') as f:
    f.write('临时数据')
    f.seek(0)
    print(f.read())

# 命名临时文件
with tempfile.NamedTemporaryFile(delete=False) as f:
    print(f.name)
    f.write(b'data')

# 临时目录
with tempfile.TemporaryDirectory() as tmpdir:
    print(tmpdir)
```

## 文件锁

```python
import fcntl

def lock_file(file_path):
    f = open(file_path, 'r')
    fcntl.flock(f.fileno(), fcntl.LOCK_EX)  # 排他锁
    try:
        # 操作文件
        pass
    finally:
        fcntl.flock(f.fileno(), fcntl.LOCK_UN)
        f.close()
```

## 文件监控

### watchdog

```python
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class MyHandler(FileSystemEventHandler):
    def on_modified(self, event):
        print(f'{event.src_path} 被修改')

observer = Observer()
observer.schedule(MyHandler(), path='.', recursive=False)
observer.start()
```

## 使用场景

### 场景 1：日志文件处理
逐行读取 GB 级日志文件。

### 场景 2：大数据处理
分块读取和处理大型数据集。

### 场景 3：并发写入
使用文件锁避免冲突。

### 场景 4：文件同步
监控文件变化并同步。

## 易错点

### 易错点 1：`readline()` / `readlines()` 把整个文件读进内存

❌ **错误示例**：
```python
def count_lines(path):
    with open(path) as f:
        lines = f.readlines()   # 一次性把所有行读进列表
    return len(lines)

# 对 5 GB 日志：内存爆炸，进程被 OOM 杀死
count_lines('huge.log')
```

✅ **正确做法**：
```python
def count_lines(path):
    count = 0
    with open(path) as f:
        for line in f:     # 文件对象本身是迭代器，按需读
            count += 1
    return count

# 或用内置 sum + 生成器表达式
def count_lines(path):
    with open(path) as f:
        return sum(1 for _ in f)
```

**说明**：文件对象本身实现了迭代器协议，`for line in f` 一次只读一行到内存。`readlines()` 会把所有行一次性返回成列表，大文件直接撑爆内存。规则：**只要文件可能很大，就用 `for line in f`，不要用 `readlines()`**。

### 易错点 2：`tempfile` 默认不指定 `delete=False` 时立即消失

❌ **错误示例**：
```python
import tempfile

f = tempfile.NamedTemporaryFile()
f.write(b'data')
# 想把文件路径传给子进程
path = f.name
subprocess.run(['some_tool', path])
# 某些系统（Linux）some_tool 一打开就 FileNotFoundError
# 因为 NamedTemporaryFile 在 f.close() 时立刻删除
```

✅ **正确做法**：
```python
import tempfile, os

# 方法 1：让文件活得久一点（自己负责删）
with tempfile.NamedTemporaryFile(delete=False) as f:
    f.write(b'data')
    path = f.name

try:
    subprocess.run(['some_tool', path])
finally:
    os.unlink(path)

# 方法 2：跨进程共享文件用 TemporaryDirectory + 自己起文件名
with tempfile.TemporaryDirectory() as d:
    path = os.path.join(d, 'work.bin')
    with open(path, 'wb') as f:
        f.write(b'data')
    subprocess.run(['some_tool', path])
```

**说明**：`NamedTemporaryFile` 默认 `delete=True`，关闭时立即删除。Windows 上其他进程不能打开它（独占锁），Linux 上其他进程能访问但只能在它关闭前。跨进程共享用 `delete=False` + 显式清理，或用 `TemporaryDirectory` 整体托管。

### 易错点 3：忘了文件锁是跨进程的，线程内互不影响

❌ **错误示例**：
```python
import fcntl

# 同进程两个线程同时加锁：fcntl 在同进程内不会阻塞
import threading

def write_data():
    with open('shared.txt', 'a') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)   # 期望"线程 A 写完线程 B 再写"
        f.write('hello\n')

t1 = threading.Thread(target=write_data)
t2 = threading.Thread(target=write_data)
# 实际：两个线程可能同时写，因为文件锁是"进程级"的
```

✅ **正确做法**：
```python
# 同进程内：用 threading.Lock
import threading
file_lock = threading.Lock()

def write_data():
    with file_lock:
        with open('shared.txt', 'a') as f:
            f.write('hello\n')

# 跨进程：用 fcntl（Linux/macOS）或 msvcrt（Windows）
# 注意：文件锁的 lock 不属于"线程"，属于"进程"
```

**说明**：`fcntl.flock` / `os.lockf` 是**进程级**的——同一进程内任何线程都能获取已持有的锁。同进程内的互斥要用 `threading.Lock`，跨进程互斥才用文件锁。Windows 不支持 `fcntl`，要换 `msvcrt.locking` 或第三方库（如 `portalocker`）。

## 练习题

### 基础练习

**题目 1**：编写函数，逐行读取大文件，统计包含关键词的行数。

<details>
<summary>💡 查看答案</summary>

```python
def count_keyword_lines(file_path, keyword):
    count = 0
    with open(file_path, 'r') as f:
        for line in f:
            if keyword in line:
                count += 1
    return count
```
</details>

### 进阶练习

**题目 2**：使用 mmap 快速查找文件中某个字节模式的所有位置。

### 挑战练习

**题目 3**：实现文件切片工具，将大文件分割成多个小文件。

## 费曼学习法检验

1. **这是什么**：为什么逐行读取比 read() 更节省内存？

2. **为什么需要**：mmap 适合什么场景？有什么限制？

3. **怎么用**：向新手解释文件锁的作用？

4. **注意事项**：临时文件何时被删除？如何确保清理？

::: tip 学习建议
处理大文件是实战必备技能！掌握内存友好的文件操作方法。
:::
