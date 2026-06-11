# 基本语法

## 注释

### 单行注释

```python
# 这是单行注释
print("Hello")  # 行尾注释
```

### 多行注释

```python
"""
这是多行注释
可以跨越多行
"""
```

## 缩进规则

Python 使用缩进表示代码块，通常使用 4 个空格。

```python
if True:
    print("缩进 4 个空格")
    print("同一代码块")
```

## 标识符命名规范

### 规则

- 由字母、数字、下划线组成
- 不能以数字开头
- 区分大小写
- 不能使用关键字

### 命名风格

```python
# 变量和函数：小写 + 下划线
user_name = "Alice"
def get_user():
    pass

# 类名：大驼峰
class UserProfile:
    pass

# 常量：全大写 + 下划线
MAX_SIZE = 100
```

## Python 关键字

```python
import keyword
print(keyword.kwlist)
```

常见关键字：`if`, `else`, `for`, `while`, `def`, `class`, `import`, `return`, `True`, `False`, `None` 等。
