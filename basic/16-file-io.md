# 文件操作

## 核心概念

文件操作用于把数据保存到磁盘，或者从磁盘读取数据。程序运行时的数据会随着程序结束而消失，写入文件后，数据可以长期保存。

常见文件操作包括：

- 读取文件内容。
- 写入新内容。
- 追加内容。
- 复制文件。
- 检查文件路径。

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

## 使用场景

### 场景 1：数据持久化
保存配置、日志、用户数据。

### 场景 2：数据处理
CSV、JSON、TXT 文件处理。

### 场景 3：系统管理
批量文件操作、备份脚本。

### 场景 4：爬虫数据存储
保存网页、图片、数据。

## 易错点

### 易错点 1：忘记关闭文件

❌ **错误示例**：
```python
f = open("data.txt", "r")
content = f.read()
# 忘记 f.close()，资源泄漏
```

✅ **正确做法**：
```python
# 方法 1：使用 with 语句（推荐）
with open("data.txt", "r") as f:
    content = f.read()
# 文件自动关闭

# 方法 2：显式关闭
f = open("data.txt", "r")
try:
    content = f.read()
finally:
    f.close()
```

**说明**：不关闭文件会占用系统资源。`with` 语句会自动关闭文件，是最安全的方式。

### 易错点 2：使用错误的编码

❌ **错误示例**：
```python
# 文件是 UTF-8 编码，但用默认编码打开
with open("data.txt", "r") as f:  # Windows 上可能是 GBK
    content = f.read()  # UnicodeDecodeError
```

✅ **正确做法**：
```python
# 明确指定编码
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()
```

**说明**：不同系统的默认编码不同（Windows 常用 GBK，Linux/Mac 常用 UTF-8）。建议始终显式指定 `encoding="utf-8"`。

### 易错点 3：覆盖模式 `"w"` 会清空原文件

❌ **错误示例**：
```python
# 想追加内容，但用了 "w" 模式
with open("log.txt", "w") as f:  # 原文件内容被清空！
    f.write("新日志\n")
```

✅ **正确做法**：
```python
# 追加模式 "a"
with open("log.txt", "a") as f:
    f.write("新日志\n")

# 或者先读取，再写入（如果需要修改）
with open("log.txt", "r") as f:
    content = f.read()

with open("log.txt", "w") as f:
    f.write(content + "新日志\n")
```

**说明**：`"w"` 模式会清空文件原有内容。追加内容应该使用 `"a"` 模式。

## 练习题

### 基础练习

**题目 1**：读取文件 `data.txt`，统计行数和字符数。

<details>
<summary>💡 查看答案</summary>

```python
with open("data.txt", "r") as f:
    content = f.read()
    lines = content.count('\n') + 1
    chars = len(content)
    print(f"行数: {lines}, 字符数: {chars}")
```
</details>

**题目 2**：将列表 `["apple", "banana", "orange"]` 写入文件，每行一个。

<details>
<summary>💡 查看答案</summary>

```python
fruits = ["apple", "banana", "orange"]
with open("fruits.txt", "w") as f:
    for fruit in fruits:
        f.write(fruit + "\n")
```
</details>

### 进阶练习

**题目 3**：复制文件内容到新文件（支持二进制文件）。

<details>
<summary>💡 查看答案</summary>

```python
def copy_file(src, dst):
    with open(src, "rb") as f1:
        with open(dst, "wb") as f2:
            f2.write(f1.read())

copy_file("source.txt", "dest.txt")
```
</details>

### 挑战练习

**题目 4**：实现简单日志追加功能，每次把用户输入的一行内容追加到 `log.txt`。

<details>
<summary>💡 查看答案</summary>

```python
message = input("请输入日志内容: ")

with open("log.txt", "a", encoding="utf-8") as f:
    f.write(message + "\n")

print("已写入日志")
```
</details>

## 费曼学习法检验

1. **这是什么**：为什么推荐用 `with` 语句而不是手动 `close()`？

2. **为什么需要**：文本模式和二进制模式有什么区别？

3. **怎么用**：向新手解释 `r`、`w`、`a` 三种模式的区别？

4. **注意事项**：处理大文件时应该用什么方法读取？为什么？

::: tip 学习建议
文件操作是实用技能！掌握读写、路径操作和异常处理。
:::
