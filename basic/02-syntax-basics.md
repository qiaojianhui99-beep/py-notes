# 基本语法

## 核心概念

语法就是 Python 规定的写法。语法正确，解释器才能理解你的代码；语法错误，程序会在运行前或运行时停止。

本章先掌握三件事：

- 注释：写给人看的说明。
- 缩进：表示哪些代码属于同一块。
- 命名：给变量起清楚、合法的名字。

## 注释

注释不会被 Python 执行，主要用于解释代码意图。

### 单行注释

```python
# 这行代码会输出一段文字
print("Hello")
```

也可以写在代码后面：

```python
print("Hello")  # 输出 Hello
```

### 多行说明

初学时，推荐连续写多行 `#`：

```python
# 下面的代码会输出两行文字
# 第一行是问候
# 第二行是学习目标
print("你好")
print("开始学习 Python")
```

三引号字符串也经常用于多行说明，但它本质上仍然是字符串。真正写注释时，先优先使用 `#`。

## 缩进规则

Python 使用缩进表示代码块，通常使用 **4 个空格**。

```python
if True:
    print("这一行缩进了 4 个空格")
    print("这一行和上一行属于同一个代码块")
```

这里先不需要深入理解 `if`，只要观察冒号 `:` 后面的代码需要缩进。

常见错误：

```python
if True:
print("缺少缩进，会报错")
```

## 标识符命名规范

标识符就是变量名等名字。合法名字必须满足：

- 由字母、数字、下划线组成。
- 不能以数字开头。
- 不能使用 Python 关键字。
- 区分大小写，`name` 和 `Name` 是两个不同名字。

```python
user_name = "Alice"
age = 18
_temp = "临时数据"
```

下面这些名字不合法：

```python
2name = "Alice"  # 不能以数字开头
class = "A"      # class 是关键字
user-name = "A"  # 不能使用减号
```

## 命名风格

Python 常用小写字母加下划线命名变量：

```python
user_name = "Alice"
total_price = 99.9
is_active = True
```

常量通常使用大写字母加下划线：

```python
MAX_SIZE = 100
DEFAULT_NAME = "guest"
```

常量不是语法限制，而是一种约定：看到全大写名字，通常表示不要随意修改。

## Python 关键字

关键字是 Python 已经占用的特殊单词，不能当变量名使用。

常见关键字包括：

```text
False, True, None, if, else, for, while, def, class, import, return
```

有些关键字现在还没学到，先记住一个原则：如果编辑器把某个单词高亮成特殊颜色，不要拿它当变量名。

## 使用场景

### 场景 1：减少语法错误

理解缩进和命名规则，可以避免最常见的入门错误。

### 场景 2：提高代码可读性

清楚的变量名比随意的 `a`、`b`、`x` 更容易理解。

### 场景 3：方便后续学习

后面学习条件、循环、函数时，缩进会反复出现。

## 练习题

### 基础练习

**题目 1**：下面哪些是合法变量名？`user_name`, `2name`, `class`, `_private`, `userName`, `user-name`

<details>
<summary>💡 查看答案</summary>

合法：`user_name`, `_private`, `userName`

不合法：`2name`、`class`、`user-name`

**解析**：变量名不能以数字开头，不能使用关键字，也不能包含减号。
</details>

**题目 2**：给下面代码添加两行注释，说明每一行 `print()` 的作用。

```python
print("Python")
print("我正在学习基本语法")
```

<details>
<summary>💡 查看答案</summary>

```python
# 输出语言名称
print("Python")

# 输出当前学习内容
print("我正在学习基本语法")
```
</details>

### 进阶练习

**题目 3**：修复下面代码的缩进错误。

```python
if True:
print("第一行")
print("第二行")
```

<details>
<summary>💡 查看答案</summary>

```python
if True:
    print("第一行")
    print("第二行")
```

**解析**：冒号后面的代码块需要统一缩进。
</details>

### 挑战练习

**题目 4**：把下面这些变量名改成更符合 Python 风格的名字：`UserName`, `total-price`, `class`, `MAXCOUNT`

<details>
<summary>💡 查看参考答案</summary>

```python
user_name = "Alice"
total_price = 99
class_name = "A"
MAX_COUNT = 100
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：注释、缩进、变量名分别解决什么问题？
2. **为什么需要**：为什么 Python 对缩进要求很严格？
3. **怎么用**：怎样判断一个变量名是否合法？
4. **注意事项**：为什么不要把关键字当变量名？

::: tip 学习建议
本章重点是养成习惯：统一 4 空格缩进，变量名用小写加下划线，注释解释“为什么这样做”。
:::
