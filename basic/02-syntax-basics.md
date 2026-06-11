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

## 使用场景

### 场景 1：代码可读性
良好的注释和命名规范让团队协作更高效。

### 场景 2：代码维护
规范的缩进和命名使代码易于理解和修改。

### 场景 3：避免语法错误
了解关键字可以避免使用保留字作为变量名。

## 练习题

### 基础练习

**题目 1**：下面哪些是合法的变量名？`user_name`, `2name`, `class`, `_private`, `userName`

<details>
<summary>💡 查看答案</summary>

合法：`user_name`, `_private`, `userName`  
不合法：`2name`（数字开头）、`class`（关键字）

**解析**：变量名不能以数字开头，不能使用关键字。
</details>

**题目 2**：修复下面代码的缩进错误：
```python
def greet():
print("Hello")
print("World")
```

<details>
<summary>💡 查看答案</summary>

```python
def greet():
    print("Hello")
    print("World")
```

**解析**：函数体内的代码必须缩进 4 个空格。
</details>

### 进阶练习

**题目 3**：编写程序，输出 Python 的所有关键字列表，并统计关键字数量。

<details>
<summary>💡 查看答案</summary>

```python
import keyword

keywords = keyword.kwlist
print(f"Python 关键字列表: {keywords}")
print(f"关键字数量: {len(keywords)}")
```
</details>

### 挑战练习

**题目 4**：设计一个变量命名检查函数 `is_valid_name(name: str) -> bool`，检查字符串是否是合法的 Python 变量名。

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：为什么 Python 使用缩进而不是花括号 `{}` 来表示代码块？

2. **为什么需要**：如果不遵循命名规范会怎样？程序还能运行吗？

3. **怎么用**：向新手解释，为什么 `class` 不能作为变量名，但 `Class` 可以？

4. **注意事项**：Tab 和空格混用会导致什么问题？如何避免？

::: tip 学习建议
养成良好的编码习惯从第一天开始！使用 4 空格缩进，遵循命名规范，写清晰的注释。
:::
