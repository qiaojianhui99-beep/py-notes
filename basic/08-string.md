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
