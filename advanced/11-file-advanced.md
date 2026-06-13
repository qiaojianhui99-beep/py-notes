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
