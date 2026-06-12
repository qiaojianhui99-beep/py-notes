# 变量与数据类型

## 核心概念

变量是给数据起的名字。程序运行时，可以通过变量名找到对应的数据。

```python
name = "Alice"
age = 18
```

可以把变量理解成标签：`name` 这个标签贴在 `"Alice"` 上，`age` 这个标签贴在 `18` 上。

Python 是动态类型语言，创建变量时不需要提前声明类型。解释器会根据值自动判断类型。

## 变量赋值

使用 `=` 给变量赋值：

```python
score = 95
message = "学习 Python"
is_passed = True
```

`=` 不是数学里的“相等”，而是“把右边的值交给左边的名字”。

变量可以重新赋值：

```python
age = 18
age = 19
```

第二次赋值后，`age` 保存的是新值 `19`。

## 基本数据类型

### 整数 int

整数用于表示没有小数部分的数字。

```python
age = 18
count = -3
```

### 浮点数 float

浮点数用于表示带小数部分的数字。

```python
price = 19.9
temperature = -2.5
```

### 字符串 str

字符串用于表示文本，可以使用单引号或双引号。

```python
name = "Alice"
city = 'Beijing'
```

多行文本可以使用三引号：

```python
message = """第一行
第二行"""
```

### 布尔值 bool

布尔值只有两个：`True` 和 `False`，常用于表示判断结果。

```python
is_active = True
is_finished = False
```

注意首字母必须大写。

### 空值 None

`None` 表示“没有值”或“暂时没有结果”。

```python
result = None
```

## 查看类型

使用 `type()` 可以查看一个值的类型：

```python
name = "Alice"
age = 18

print(type(name))  # <class 'str'>
print(type(age))   # <class 'int'>
```

使用 `isinstance()` 可以判断某个值是不是指定类型：

```python
age = 18
print(isinstance(age, int))  # True
```

## 类型转换

有时数据看起来像数字，但实际是字符串，需要转换后才能当数字使用。

```python
number_text = "123"
number = int(number_text)
print(number)  # 123
```

常见转换：

```python
int("123")       # 123
float("3.14")    # 3.14
str(123)         # "123"
bool(1)          # True
bool(0)          # False
bool("")         # False
```

不是所有字符串都能转成数字：

```python
int("abc")  # 会报错
```

异常处理后面会专门学习。现在先记住：转换前要确认内容确实适合转换。

## 使用场景

### 场景 1：保存用户信息

```python
user_name = "Alice"
user_age = 18
is_vip = False
```

### 场景 2：保存商品数据

```python
product_name = "键盘"
price = 199.0
stock = 30
```

### 场景 3：保存程序状态

```python
is_logged_in = True
current_page = "home"
error_message = None
```

## 练习题

### 基础练习

**题目 1**：创建三个变量：姓名、年龄、是否正在学习 Python，并输出它们。

<details>
<summary>💡 查看答案</summary>

```python
name = "小明"
age = 18
is_learning_python = True

print(name)
print(age)
print(is_learning_python)
```
</details>

**题目 2**：使用 `type()` 查看 `"100"`、`100`、`100.0` 的类型。

<details>
<summary>💡 查看答案</summary>

```python
print(type("100"))  # <class 'str'>
print(type(100))    # <class 'int'>
print(type(100.0))  # <class 'float'>
```
</details>

### 进阶练习

**题目 3**：把字符串 `"18"` 转成整数，把整数 `18` 转成字符串，并分别输出类型。

<details>
<summary>💡 查看答案</summary>

```python
age_text = "18"
age_number = int(age_text)

number = 18
number_text = str(number)

print(age_number)
print(type(age_number))
print(number_text)
print(type(number_text))
```
</details>

### 挑战练习

**题目 4**：解释下面三个值有什么区别：`10`、`"10"`、`10.0`。

<details>
<summary>💡 查看参考答案</summary>

`10` 是整数，类型是 `int`；`"10"` 是字符串，类型是 `str`，表示文本；`10.0` 是浮点数，类型是 `float`，表示带小数部分的数字。
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：变量和数据类型分别是什么？
2. **为什么需要**：为什么 `"18"` 和 `18` 不能完全当成同一种数据？
3. **怎么用**：如何查看一个变量当前保存的数据类型？
4. **注意事项**：什么时候需要做类型转换？转换失败会怎样？

::: tip 学习建议
遇到不确定的数据，先用 `type()` 看类型。很多初学错误都来自把字符串和数字混在一起。
:::
