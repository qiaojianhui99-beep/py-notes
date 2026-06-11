# 字符串操作

## 字符串定义

```python
s1 = "Hello"
s2 = 'World'
s3 = """多行
字符串"""
```

## 索引和切片

```python
s = "Python"

# 索引
s[0]    # 'P'
s[-1]   # 'n'

# 切片 [start:stop:step]
s[0:3]  # 'Pyt'
s[:3]   # 'Pyt'
s[3:]   # 'hon'
s[::2]  # 'Pto'
s[::-1] # 'nohtyP' (反转)
```

## 字符串拼接

```python
"Hello" + " " + "World"  # 'Hello World'
"Python" * 3             # 'PythonPythonPython'
```

## 常用方法

### 大小写转换

```python
s = "Hello World"
s.upper()       # 'HELLO WORLD'
s.lower()       # 'hello world'
s.capitalize()  # 'Hello world'
s.title()       # 'Hello World'
```

### 查找和替换

```python
s = "Hello World"
s.find("World")      # 6
s.replace("World", "Python")  # 'Hello Python'
s.count("l")         # 3
```

### 去除空白

```python
s = "  Hello  "
s.strip()   # 'Hello'
s.lstrip()  # 'Hello  '
s.rstrip()  # '  Hello'
```

### 分割和连接

```python
# 分割
"a,b,c".split(",")  # ['a', 'b', 'c']

# 连接
"-".join(["a", "b", "c"])  # 'a-b-c'
```

### 判断方法

```python
s = "Python"
s.startswith("Py")  # True
s.endswith("on")    # True
s.isalpha()         # True (全是字母)
s.isdigit()         # False
"123".isdigit()     # True
```

## 转义字符

```python
print("Hello\nWorld")  # 换行
print("Hello\tWorld")  # 制表符
print("He said \"Hi\"")  # 引号
print("C:\\Users")     # 反斜杠
print(r"C:\Users")     # 原始字符串
```

## 使用场景

### 场景 1：文本处理
数据清洗、格式转换、内容提取。

### 场景 2：用户输入验证
邮箱格式、手机号检查。

### 场景 3：文件路径操作
路径拼接、文件名提取。

### 场景 4：爬虫数据处理
HTML 标签清理、关键词提取。

## 练习题

### 基础练习

**题目 1**：统计字符串 "Hello World" 中字母 'l' 出现的次数。

<details>
<summary>💡 查看答案</summary>

```python
s = "Hello World"
print(s.count('l'))  # 3
```
</details>

**题目 2**：判断邮箱字符串是否包含 "@" 和 "."。

<details>
<summary>💡 查看答案</summary>

```python
email = "user@example.com"
if "@" in email and "." in email:
    print("邮箱格式可能正确")
```
</details>

### 进阶练习

**题目 3**：实现函数 `reverse_words(s: str) -> str`，反转句子中每个单词但保持单词顺序。
例：`"Hello World"` → `"olleH dlroW"`

<details>
<summary>💡 查看答案</summary>

```python
def reverse_words(s: str) -> str:
    words = s.split()
    reversed_words = [word[::-1] for word in words]
    return " ".join(reversed_words)

print(reverse_words("Hello World"))  # olleH dlroW
```
</details>

### 挑战练习

**题目 4**：实现一个简单的密码强度检查器，检查密码长度、是否包含大小写字母、数字。

## 费曼学习法检验

1. **这是什么**：字符串为什么是不可变的？这带来什么好处和限制？

2. **为什么需要**：`split()` 和 `join()` 为什么是互逆操作？它们解决什么问题？

3. **怎么用**：向新手解释字符串切片 `s[::2]` 和 `s[::-1]` 的含义？

4. **注意事项**：为什么路径字符串推荐用原始字符串 `r"path"`？

::: tip 学习建议
字符串操作是 Python 最常用的功能！熟练掌握切片、拼接、查找替换是基本功。
:::
