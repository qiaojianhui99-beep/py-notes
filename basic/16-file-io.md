# 文件操作

## 打开文件

```python
# 基本语法
f = open("file.txt", "r", encoding="utf-8")
content = f.read()
f.close()
```

## 文件模式

| 模式 | 说明 |
|------|------|
| `r` | 只读（默认） |
| `w` | 写入（覆盖） |
| `a` | 追加 |
| `r+` | 读写 |
| `rb` | 二进制读 |
| `wb` | 二进制写 |

## with 语句（推荐）

自动关闭文件，无需手动 `close()`。

```python
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()
    print(content)
# 文件自动关闭
```

## 读取文件

### read()

读取全部内容。

```python
with open("file.txt", "r") as f:
    content = f.read()
```

### readline()

读取一行。

```python
with open("file.txt", "r") as f:
    line = f.readline()
```

### readlines()

读取所有行，返回列表。

```python
with open("file.txt", "r") as f:
    lines = f.readlines()
    for line in lines:
        print(line.strip())
```

### 逐行遍历（推荐）

```python
with open("file.txt", "r") as f:
    for line in f:
        print(line.strip())
```

## 写入文件

### write()

```python
with open("file.txt", "w") as f:
    f.write("Hello\n")
    f.write("World\n")
```

### writelines()

```python
lines = ["Line 1\n", "Line 2\n", "Line 3\n"]
with open("file.txt", "w") as f:
    f.writelines(lines)
```

## 追加内容

```python
with open("file.txt", "a") as f:
    f.write("New line\n")
```

## 二进制文件

```python
# 读取二进制文件
with open("image.png", "rb") as f:
    data = f.read()

# 写入二进制文件
with open("output.bin", "wb") as f:
    f.write(data)
```

## 文件路径操作

```python
import os

# 当前目录
os.getcwd()

# 改变目录
os.chdir("/path/to/dir")

# 列出目录内容
os.listdir(".")

# 检查文件是否存在
os.path.exists("file.txt")

# 检查是否为文件
os.path.isfile("file.txt")

# 检查是否为目录
os.path.isdir("folder")

# 拼接路径
os.path.join("dir", "file.txt")

# 获取文件大小
os.path.getsize("file.txt")
```

## 文件和目录操作

```python
import os

# 创建目录
os.mkdir("new_folder")
os.makedirs("path/to/folder")  # 递归创建

# 删除文件
os.remove("file.txt")

# 删除空目录
os.rmdir("folder")

# 重命名
os.rename("old.txt", "new.txt")
```
