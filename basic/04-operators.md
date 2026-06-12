# 运算符

## 核心概念

运算符是对数据进行计算、比较或判断的符号。

```python
price = 100
count = 3
total = price * count
print(total)  # 300
```

上面代码中，`*` 是乘法运算符，`=` 是赋值运算符。

## 算术运算符

算术运算符用于数字计算。

```python
a = 10
b = 3

print(a + b)   # 13，加法
print(a - b)   # 7，减法
print(a * b)   # 30，乘法
print(a / b)   # 3.3333333333333335，普通除法
print(a // b)  # 3，整除
print(a % b)   # 1，取余
print(a ** b)  # 1000，幂运算
```

常见区别：

- `/` 的结果通常是浮点数。
- `//` 只保留商的整数部分。
- `%` 得到余数，常用于判断奇偶。

## 比较运算符

比较运算符会得到布尔值：`True` 或 `False`。

```python
a = 10
b = 3

print(a == b)  # False，是否相等
print(a != b)  # True，是否不相等
print(a > b)   # True，是否大于
print(a < b)   # False，是否小于
print(a >= b)  # True，是否大于等于
print(a <= b)  # False，是否小于等于
```

Python 支持连续比较：

```python
age = 18
print(0 <= age <= 120)  # True
```

## 逻辑运算符

逻辑运算符用于组合多个判断。

```python
age = 20
has_ticket = True

print(age >= 18 and has_ticket)  # True
print(age < 18 or has_ticket)    # True
print(not has_ticket)            # False
```

含义：

- `and`：两边都为真，结果才是真。
- `or`：只要一边为真，结果就是真。
- `not`：取反。

## 赋值运算符

赋值运算符用于更新变量。

```python
count = 10
count += 5
print(count)  # 15

count -= 3
print(count)  # 12

count *= 2
print(count)  # 24
```

`count += 5` 等价于 `count = count + 5`。

## 成员运算符

成员运算符用于判断某个值是否在另一个值里面。

```python
text = "Python"

print("Py" in text)      # True
print("Java" in text)    # False
print("Java" not in text)  # True
```

本章先用字符串理解成员判断。后面学习列表、字典、集合时，`in` 还会经常出现。

## 身份运算符

`is` 用于判断两个名字是否指向同一个对象。初学阶段最常见的用法是判断是否为 `None`。

```python
result = None

print(result is None)      # True
print(result is not None)  # False
```

比较值是否相等时，通常使用 `==`；判断是否为 `None` 时，推荐使用 `is None`。

## 运算符优先级

不同运算符有不同优先级。常见顺序从高到低：

1. `**`
2. `*`, `/`, `//`, `%`
3. `+`, `-`
4. `==`, `!=`, `>`, `<`, `>=`, `<=`
5. `not`
6. `and`
7. `or`

不确定优先级时，直接使用括号：

```python
result = (10 + 5) * 3
```

括号能让代码更清楚。

## 使用场景

### 场景 1：计算金额

```python
price = 19.9
count = 3
total = price * count
```

### 场景 2：检查范围

```python
age = 18
is_valid_age = 0 <= age <= 120
```

### 场景 3：判断文本内容

```python
email = "user@example.com"
has_at = "@" in email
```

### 场景 4：更新计数

```python
count = 0
count += 1
```

## 练习题

### 基础练习

**题目 1**：计算表达式 `(10 + 5) * 3 // 2 ** 2` 的结果。

<details>
<summary>💡 查看答案</summary>

```python
result = (10 + 5) * 3 // 2 ** 2
print(result)  # 11
```

**解析**：先算括号和幂运算：`15 * 3 // 4`，再从左到右计算，结果是 `11`。
</details>

**题目 2**：判断变量 `x = 15` 是否在 10 到 20 之间，直接输出判断结果。

<details>
<summary>💡 查看答案</summary>

```python
x = 15
print(10 <= x <= 20)  # True
```
</details>

### 进阶练习

**题目 3**：用表达式判断 `number = 24` 是否为偶数。

<details>
<summary>💡 查看答案</summary>

```python
number = 24
is_even = number % 2 == 0
print(is_even)  # True
```
</details>

### 挑战练习

**题目 4**：已知商品单价 `price = 39.9`、数量 `count = 3`、优惠金额 `discount = 10`，计算最终价格并判断是否大于 100。

<details>
<summary>💡 查看答案</summary>

```python
price = 39.9
count = 3
discount = 10

total = price * count - discount
is_expensive = total > 100

print(total)
print(is_expensive)
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：算术运算符、比较运算符、逻辑运算符分别做什么？
2. **为什么需要**：为什么 `=` 和 `==` 不能混用？
3. **怎么用**：如何判断一个数字是不是偶数？
4. **注意事项**：什么时候应该主动加括号？

::: tip 学习建议
写表达式时先保证意思清楚，再追求简洁。括号不是多余的，它能降低阅读成本。
:::
