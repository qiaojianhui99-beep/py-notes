# 字符串操作

## 核心概念

字符串是文本数据，类型是 `str`。姓名、消息、路径、邮箱、命令行输入，本质上都经常用字符串表示。

```python
name = "Alice"
message = "Hello, Python"
```

字符串是有顺序的，每个字符都有位置编号，这个编号叫索引。

## 字符串定义

可以使用单引号或双引号：

```python
s1 = "Hello"
s2 = 'World'
```

多行字符串使用三引号：

```python
text = """第一行
第二行
第三行"""
```

如果字符串中包含引号，可以交替使用：

```python
message = "I'm learning Python"
quote = '他说："你好"'
```

## 索引

索引从 `0` 开始。

```python
word = "Python"

print(word[0])   # P
print(word[1])   # y
print(word[-1])  # n
```

负数索引从右往左数，`-1` 表示最后一个字符。

## 切片

切片用于取出字符串的一部分。

```python
word = "Python"

print(word[0:3])   # Pyt
print(word[:3])    # Pyt
print(word[3:])    # hon
print(word[::2])   # Pto
print(word[::-1])  # nohtyP
```

切片格式：

```text
字符串[start:stop:step]
```

`stop` 位置不会被包含。

## 字符串拼接和重复

使用 `+` 拼接字符串：

```python
first_name = "Alice"
last_name = "Green"

full_name = first_name + " " + last_name
print(full_name)
```

使用 `*` 重复字符串：

```python
line = "-" * 20
print(line)
```

## 常用方法

### 大小写转换

```python
text = "Hello Python"

print(text.upper())       # HELLO PYTHON
print(text.lower())       # hello python
print(text.capitalize())  # Hello python
print(text.title())       # Hello Python
```

### 查找和替换

```python
text = "Hello Python"

print(text.find("Python"))       # 6
print(text.count("o"))           # 2
print(text.replace("Python", "World"))  # Hello World
```

`find()` 找不到时返回 `-1`。

### 去除空白

```python
text = "  Hello  "

print(repr(text.strip()))   # 'Hello'
print(repr(text.lstrip()))  # 'Hello  '
print(repr(text.rstrip()))  # '  Hello'
```

`repr()` 可以把字符串中的空格显示出来，便于观察 `strip()`、`lstrip()` 和 `rstrip()` 的区别。

### 判断方法

```python
text = "Python"

print(text.startswith("Py"))  # True
print(text.endswith("on"))    # True
print(text.isalpha())         # True
print("123".isdigit())        # True
```

## 成员判断

可以用 `in` 判断字符串中是否包含某段内容：

```python
email = "user@example.com"

print("@" in email)      # True
print(".com" in email)   # True
```

## 转义字符

有些字符需要特殊写法。

```python
print("Hello\nWorld")      # 换行
print("Hello\tWorld")      # 制表符
print("He said \"Hi\"")    # 双引号
print("C:\\Users\\Alice")  # 反斜杠
```

如果路径中反斜杠很多，可以使用原始字符串：

```python
path = r"C:\Users\Alice"
print(path)
```

## 字符串不可变

字符串创建后，不能直接修改其中某个字符。

```python
word = "Python"
# word[0] = "J"  # 会报错
```

如果需要“修改”，通常是创建一个新字符串：

```python
word = "Python"
new_word = "J" + word[1:]
print(new_word)  # Jython
```

## 使用场景

### 场景 1：清理用户输入

```python
name = "  Alice  "
clean_name = name.strip()
```

### 场景 2：检查简单格式

```python
email = "user@example.com"
is_email_like = "@" in email and "." in email
```

### 场景 3：生成显示文本

```python
name = "Alice"
message = f"欢迎你，{name}"
```

### 场景 4：逐个处理字符

```python
word = "Python"

for char in word:
    print(char)
```

## 易错点

### 易错点 1：尝试修改字符串中的字符

❌ **错误示例**：
```python
text = "Python"
text[0] = "J"  # TypeError: 'str' object does not support item assignment
```

✅ **正确做法**：
```python
text = "Python"
# 创建新字符串
text = "J" + text[1:]
print(text)  # Jython
```

**说明**：字符串是不可变的，不能直接修改某个字符。只能创建新字符串。

### 易错点 2：切片索引越界不会报错

❌ **容易误解**：
```python
text = "Python"
print(text[10])  # IndexError: string index out of range
print(text[10:15])  # 空字符串 ""，不报错
```

✅ **正确理解**：
```python
text = "Python"
# 单个索引越界会报错
# print(text[10])  # 报错

# 切片越界不报错，返回空字符串或部分内容
print(text[10:15])  # ""
print(text[2:100])  # "thon"
```

**说明**：访问单个索引越界会报错，但切片越界不会报错，返回空或部分内容。

### 易错点 3：`find()` 找不到时返回 -1

❌ **错误示例**：
```python
text = "Hello Python"
if text.find("Java"):  # -1 在布尔上下文中是 True
    print("找到了")  # 会错误地输出
```

✅ **正确做法**：
```python
text = "Hello Python"
# 方法 1：判断是否不等于 -1
if text.find("Java") != -1:
    print("找到了")

# 方法 2：使用 in（推荐）
if "Java" in text:
    print("找到了")
```

**说明**：`find()` 找不到时返回 `-1`，不是 `False`。判断时要显式比较或使用 `in`。

## 练习题

### 基础练习

**题目 1**：统计字符串 `"Hello World"` 中字母 `l` 出现的次数。

<details>
<summary>💡 查看答案</summary>

```python
text = "Hello World"
print(text.count("l"))  # 3
```
</details>

**题目 2**：判断字符串是否同时包含 `@` 和 `.`。

<details>
<summary>💡 查看答案</summary>

```python
email = "user@example.com"

if "@" in email and "." in email:
    print("格式可能正确")
else:
    print("格式可能不正确")
```
</details>

### 进阶练习

**题目 3**：输入一句话，输出去除首尾空白后的内容、全大写内容和反转后的内容。

<details>
<summary>💡 查看答案</summary>

```python
text = input("请输入一句话: ")
clean_text = text.strip()

print(clean_text)
print(clean_text.upper())
print(clean_text[::-1])
```
</details>

### 挑战练习

**题目 4**：输入一个密码，检查它是否至少 8 位，并且同时包含数字和字母。

<details>
<summary>💡 查看答案</summary>

```python
password = input("请输入密码: ")

has_digit = False
has_alpha = False

for char in password:
    if char.isdigit():
        has_digit = True
    if char.isalpha():
        has_alpha = True

if len(password) >= 8 and has_digit and has_alpha:
    print("密码格式合格")
else:
    print("密码至少 8 位，并且要包含数字和字母")
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：字符串、索引、切片分别是什么？
2. **为什么需要**：为什么字符串不能直接修改某个字符？
3. **怎么用**：如何取出字符串的前三个字符？如何反转字符串？
4. **注意事项**：`find()` 找不到内容时会返回什么？

::: tip 学习建议
字符串方法很多，不需要一次背完。先掌握索引、切片、`strip()`、`replace()`、`count()` 和成员判断。
:::
