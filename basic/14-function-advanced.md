# 函数进阶

## 核心概念

函数进阶关注的是“怎样让函数更灵活”。本章会学习默认参数、关键字参数、可变参数、lambda 表达式和递归。

这些内容都建立在上一章的基础上：函数有输入、处理过程和返回值。

## 默认参数

默认参数让调用函数时可以少传一部分参数。

```python
def greet(name, message="Hello"):
    return f"{message}, {name}!"

print(greet("Alice"))
print(greet("Bob", "Hi"))
```

默认参数适合表示常用值。

注意：默认参数通常不要使用可变对象，比如列表。这个细节后续进阶章节会继续讲。

## 关键字参数

调用函数时，可以用参数名明确指定值。

```python
def introduce(name, age, city):
    print(f"{name}，{age}岁，来自{city}")

introduce(name="Alice", age=18, city="Beijing")
introduce(city="Shanghai", name="Bob", age=20)
```

关键字参数的好处是更清楚，顺序也不容易写错。

## 位置参数和关键字参数混用

位置参数要写在关键字参数前面。

```python
def order(product, count, price):
    total = count * price
    print(f"{product}: {total:.2f}")

order("键盘", count=2, price=199.0)
```

下面写法不合法：

```python
# order(product="键盘", 2, 199.0)
```

## 可变位置参数：*args

`*args` 可以接收任意数量的位置参数，函数内部把它们当作元组使用。

```python
def sum_all(*numbers):
    total = 0

    for number in numbers:
        total += number

    return total

print(sum_all(1, 2, 3))
print(sum_all(1, 2, 3, 4, 5))
```

`args` 只是常见名字，真正起作用的是前面的 `*`。

## 可变关键字参数：**kwargs

`**kwargs` 可以接收任意数量的关键字参数，函数内部把它们当作字典使用。

```python
def show_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

show_info(name="Alice", age=18, city="Beijing")
```

`kwargs` 也是约定俗成的名字，真正起作用的是 `**`。

## 参数顺序

常见参数顺序：

```python
def func(a, b, *args, c=10, **kwargs):
    print(a)
    print(b)
    print(args)
    print(c)
    print(kwargs)
```

初学阶段不需要刻意写复杂参数。知道读到这种函数时每部分代表什么即可。

## lambda 表达式

`lambda` 用来创建简单的匿名函数。

普通函数：

```python
def square(x):
    return x ** 2
```

lambda 写法：

```python
square = lambda x: x ** 2

print(square(5))
```

lambda 适合非常短的逻辑。复杂逻辑应使用普通函数。

常见场景是配合 `sorted()` 指定排序规则：

```python
students = [
    {"name": "Alice", "score": 90},
    {"name": "Bob", "score": 85},
    {"name": "Charlie", "score": 95}
]

sorted_students = sorted(students, key=lambda student: student["score"])
print(sorted_students)
```

## 递归函数

递归是函数调用自己。

```python
def countdown(n):
    if n <= 0:
        print("结束")
    else:
        print(n)
        countdown(n - 1)

countdown(3)
```

递归必须有终止条件，否则会一直调用下去。

经典例子：阶乘。

```python
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # 120
```

递归适合天然可以拆成“小一号同类问题”的场景。简单循环能解决的问题，初学阶段优先用循环。

## 使用场景

### 场景 1：给函数提供默认行为

```python
def greet(name, message="你好"):
    print(f"{message}，{name}")
```

### 场景 2：接收不固定数量的数据

```python
def sum_all(*numbers):
    total = 0
    for number in numbers:
        total += number
    return total
```

### 场景 3：保存额外信息

```python
def show_info(**info):
    print(info)
```

### 场景 4：处理递归结构

```python
def countdown(n):
    if n > 0:
        countdown(n - 1)
```

## 易错点

### 易错点 1：默认参数使用可变对象

❌ **错误示例**：
```python
def add_item(item, items=[]):  # 危险：默认参数是可变对象
    items.append(item)
    return items

print(add_item(1))  # [1]
print(add_item(2))  # [1, 2]，不是 [2]！
print(add_item(3))  # [1, 2, 3]
```

✅ **正确做法**：
```python
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

print(add_item(1))  # [1]
print(add_item(2))  # [2]
print(add_item(3))  # [3]
```

**说明**：默认参数在函数定义时只创建一次。使用可变对象（列表、字典）作为默认值会导致所有调用共享同一个对象。应该使用 `None` 作为默认值，在函数内创建新对象。

### 易错点 2：参数顺序错误

❌ **错误示例**：
```python
def func(a, b=1, *args, c):  # SyntaxError: 位置参数不能在 *args 后
    pass

def func2(*args, a, b=1):  # 正确但容易误用
    pass

func2(1, 2, 3)  # TypeError: missing required keyword-only argument: 'a'
```

✅ **正确顺序**：
```python
# 正确顺序：位置参数 -> 默认参数 -> *args -> 关键字参数 -> **kwargs
def func(pos1, pos2, default1=1, *args, kw_only, **kwargs):
    pass

# 调用
func(1, 2, 3, 4, 5, kw_only=10, extra=20)
```

**说明**：参数顺序必须遵守规则。`*args` 后的参数必须用关键字传递（keyword-only）。

### 易错点 3：递归没有终止条件

❌ **错误示例**：
```python
def countdown(n):
    print(n)
    countdown(n - 1)  # RecursionError: maximum recursion depth exceeded

countdown(5)
```

✅ **正确做法**：
```python
def countdown(n):
    if n <= 0:  # 终止条件
        return
    print(n)
    countdown(n - 1)

countdown(5)
```

**说明**：递归函数必须有明确的终止条件，否则会无限递归直到栈溢出。

## 练习题

### 基础练习

**题目 1**：编写函数 `greet(name, message="你好")`，支持默认问候语。

<details>
<summary>💡 查看答案</summary>

```python
def greet(name, message="你好"):
    return f"{message}，{name}"

print(greet("Alice"))
print(greet("Bob", "早上好"))
```
</details>

**题目 2**：编写函数 `sum_all(*numbers)`，返回所有参数的和。

<details>
<summary>💡 查看答案</summary>

```python
def sum_all(*numbers):
    total = 0

    for number in numbers:
        total += number

    return total

print(sum_all(1, 2, 3))
print(sum_all(10, 20, 30, 40))
```
</details>

### 进阶练习

**题目 3**：编写函数 `show_profile(**info)`，逐行输出用户信息。

<details>
<summary>💡 查看答案</summary>

```python
def show_profile(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

show_profile(name="Alice", age=18, city="Beijing")
```
</details>

### 挑战练习

**题目 4**：使用递归编写 `factorial(n)`，计算 `n` 的阶乘。

<details>
<summary>💡 查看答案</summary>

```python
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：默认参数、`*args`、`**kwargs` 分别解决什么问题？
2. **为什么需要**：为什么关键字参数能让函数调用更清楚？
3. **怎么用**：什么时候可以考虑使用 lambda？
4. **注意事项**：递归函数为什么必须有终止条件？

::: tip 学习建议
函数参数越灵活，越需要保持清楚。初学阶段先写简单函数，只有确实需要时再使用可变参数。
:::
