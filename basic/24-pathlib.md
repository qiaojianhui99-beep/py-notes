# 路径操作（pathlib）

## 核心概念

`pathlib` 是 Python 提供的现代路径操作模块。它用 `Path` 对象表示路径，比手动拼接字符串更清楚，也更容易兼容 Windows、macOS 和 Linux。

```python
from pathlib import Path

path = Path("data") / "users.txt"
print(path)
```

## Path 对象

### 创建路径

```python
from pathlib import Path

# 当前目录
p = Path('.')

# 绝对路径
p = Path('/usr/local')

# 用户目录
p = Path.home()

# 当前文件路径
p = Path(__file__)
```

### 路径拼接

```python
# 使用 / 运算符
base = Path('/usr')
full = base / 'local' / 'bin'
print(full)  # /usr/local/bin

# 相当于 os.path.join
```

## 路径属性

```python
p = Path('/usr/local/bin/python')

print(p.name)       # python
print(p.stem)       # python
print(p.suffix)     # （无扩展名）
print(p.parent)     # /usr/local/bin
print(p.parents[0]) # /usr/local/bin
print(p.parents[1]) # /usr/local
```

### 带扩展名的文件

```python
p = Path('document.txt')

print(p.stem)       # document
print(p.suffix)     # .txt
print(p.with_suffix('.md'))  # document.md
```

## 路径判断

```python
p = Path('test.txt')

p.exists()      # 是否存在
p.is_file()     # 是否是文件
p.is_dir()      # 是否是目录
p.is_absolute() # 是否是绝对路径
```

## 文件操作

### 读写文件

```python
p = Path('data.txt')

# 写入
p.write_text('Hello World')

# 读取
content = p.read_text()

# 二进制
p.write_bytes(b'binary data')
data = p.read_bytes()
```

### 创建目录

```python
p = Path('new_dir')

# 创建单级目录
p.mkdir()

# 创建多级目录
p.mkdir(parents=True, exist_ok=True)
```

### 遍历目录

```python
# 当前目录所有文件
for item in Path('.').iterdir():
    print(item)

# 递归查找所有 .py 文件
for py_file in Path('.').rglob('*.py'):
    print(py_file)

# 查找当前目录的 .txt 文件
for txt_file in Path('.').glob('*.txt'):
    print(txt_file)
```

## 与 os.path 对比

```python
# os.path 方式
import os
path = os.path.join('/usr', 'local', 'bin')
exists = os.path.exists(path)
basename = os.path.basename(path)

# pathlib 方式（更简洁）
from pathlib import Path
path = Path('/usr') / 'local' / 'bin'
exists = path.exists()
basename = path.name
```

## 使用场景

### 场景 1：文件查找
递归查找特定类型文件。

### 场景 2：跨平台路径
自动处理 Windows/Linux 路径差异。

### 场景 3：批量处理
遍历目录批量操作文件。

### 场景 4：配置文件
读取项目配置文件。

## 练习题

### 基础练习

**题目 1**：使用 pathlib 获取当前目录所有 .py 文件的名称。

<details>
<summary>💡 查看答案</summary>

```python
from pathlib import Path

py_files = [f.name for f in Path('.').glob('*.py')]
print(py_files)
```
</details>

### 进阶练习

**题目 2**：递归统计目录下所有文件的总大小。

<details>
<summary>💡 查看答案</summary>

```python
from pathlib import Path

def get_dir_size(path):
    total = 0
    for item in Path(path).rglob('*'):
        if item.is_file():
            total += item.stat().st_size
    return total

size = get_dir_size('.')
print(f"总大小: {size / 1024 / 1024:.2f} MB")
```
</details>

### 挑战练习

**题目 3**：扫描当前目录下的文件，按扩展名统计数量，只输出统计结果，不移动文件。

<details>
<summary>💡 查看答案</summary>

```python
from pathlib import Path

counter = {}

for item in Path(".").iterdir():
    if item.is_file():
        suffix = item.suffix or "无扩展名"
        counter[suffix] = counter.get(suffix, 0) + 1

for suffix, count in counter.items():
    print(f"{suffix}: {count}")
```
</details>

## 费曼学习法检验

1. **这是什么**：pathlib 和 os.path 有什么区别？为什么推荐 pathlib？

2. **为什么需要**：Path 对象的 / 运算符如何实现跨平台兼容？

3. **怎么用**：向新手解释 glob() 和 rglob() 的区别？

4. **注意事项**：什么时候必须用 str(path) 转换为字符串？

::: tip 学习建议
pathlib 是现代 Python 的标准！比 os.path 更优雅、更安全。
:::
