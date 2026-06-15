# 函数定义与调用

## 核心概念

函数是一段可以重复使用的代码。把一组操作放进函数里，需要时通过函数名调用。

```python
def greet():
    print("Hello!")

greet()
```

函数可以让代码更清楚、更容易复用，也方便把复杂问题拆成小步骤。

## 定义函数

使用 `def` 定义函数：

```python
def say_hello():
    print("你好")
```

函数体必须缩进。定义函数不会立刻执行函数体，只有调用函数时才会执行。

```python
say_hello()
```

## 参数

参数是传给函数的数据。

```python
def greet(name):
    print(f"你好，{name}")

greet("Alice")
greet("Bob")
```

多个参数用逗号分隔：

```python
def add(a, b):
    print(a + b)

add(3, 5)
```

## 返回值

`return` 用来把结果交回给调用者。

```python
def add(a, b):
    return a + b

result = add(3, 5)
print(result)
```

如果函数没有写 `return`，默认返回 `None`。

```python
def show_message():
    print("Hello")

result = show_message()
print(result)  # None
```

## 多个返回值

Python 函数可以一次返回多个值，本质上返回的是元组。

```python
def get_position():
    return 10, 20

x, y = get_position()

print(x)
print(y)
```

## 函数调用顺序

函数必须先定义，再调用。

```python
def double(number):
    return number * 2

print(double(5))
```

调用函数时，实参会按顺序传给形参：

```python
def introduce(name, age):
    print(f"我叫{name}，今年{age}岁")

introduce("Alice", 18)
```

## 作用域

作用域决定变量能在哪里使用。

### 局部变量

函数内部创建的变量，只能在函数内部使用。

```python
def show_age():
    age = 18
    print(age)

show_age()
# print(age)  # 函数外不能直接使用 age
```

### 全局变量

函数外创建的变量，可以在函数内部读取。

```python
name = "Alice"

def greet():
    print(f"你好，{name}")

greet()
```

初学阶段建议：函数需要什么数据，就通过参数传进去；函数产生什么结果，就通过 `return` 返回。这样比直接修改全局变量更清楚。

## 文档字符串

文档字符串用于说明函数用途。

```python
def add(a, b):
    """返回两个数的和。"""
    return a + b
```

简单函数可以不写文档字符串；复杂函数建议写清楚参数、返回值和注意事项。

## 使用场景

### 场景 1：复用重复代码

```python
def print_line():
    print("-" * 20)

print_line()
print("用户信息")
print_line()
```

### 场景 2：拆分计算步骤

```python
def get_total(price, count):
    return price * count
```

### 场景 3：封装判断规则

```python
def is_even(number):
    return number % 2 == 0
```

### 场景 4：让主流程更清楚

```python
def show_welcome():
    print("欢迎使用程序")

show_welcome()
```

## 易错点

### 易错点 1：函数调用忘记加括号

❌ **错误示例**：
```python
def greet():
    print("Hello")

print(greet)  # 不会执行函数，只是打印函数对象
# 输出：<function greet at 0x...>
```

✅ **正确示例**：
```python
def greet():
    print("Hello")

greet()  # 加括号才会执行
```

**说明**：函数名后必须加括号才能调用。不加括号只是获取函数对象的引用。

### 易错点 2：函数内修改全局变量

❌ **错误示例**：
```python
count = 0

def increment():
    count += 1  # UnboundLocalError: local variable 'count' referenced before assignment

increment()
```

✅ **正确做法**：
```python
# 方法 1：使用 global（不推荐）
count = 0
def increment():
    global count
    count += 1

# 方法 2：通过参数和返回值（推荐）
def increment(count):
    return count + 1

count = 0
count = increment(count)
```

**说明**：函数内赋值会创建局部变量。如果要修改全局变量需要 `global` 声明，但更好的做法是通过参数和返回值传递。

### 易错点 3：返回 None 的隐式行为

❌ **错误示例**：
```python
def add(a, b):
    a + b  # 忘记写 return

result = add(3, 5)
print(result)  # None
```

✅ **正确示例**：
```python
def add(a, b):
    return a + b  # 必须显式返回

result = add(3, 5)
print(result)  # 8
```

**说明**：函数没有 `return` 语句或 `return` 后没有值时，会隐式返回 `None`。

## 练习题

### 基础练习

**题目 1**：编写函数 `is_even(number)`，判断一个数字是否为偶数。

<details>
<summary>💡 查看答案</summary>

```python
def is_even(number):
    return number % 2 == 0

print(is_even(4))
print(is_even(5))
```
</details>

**题目 2**：编写函数 `get_area(width, height)`，返回矩形面积。

<details>
<summary>💡 查看答案</summary>

```python
def get_area(width, height):
    return width * height

area = get_area(5, 3)
print(area)
```
</details>

### 进阶练习

**题目 3**：编写函数 `get_max(a, b, c)`，返回三个数中的最大值。

<details>
<summary>💡 查看答案</summary>

```python
def get_max(a, b, c):
    max_value = a

    if b > max_value:
        max_value = b
    if c > max_value:
        max_value = c

    return max_value

print(get_max(3, 9, 5))
```
</details>

### 挑战练习

**题目 4**：编写函数 `show_menu()` 输出菜单，再根据用户输入输出对应操作。

<details>
<summary>💡 查看答案</summary>

```python
def show_menu():
    print("1. 查看信息")
    print("2. 修改信息")
    print("3. 退出")

show_menu()
choice = input("请选择: ")

if choice == "1":
    print("查看信息")
elif choice == "2":
    print("修改信息")
elif choice == "3":
    print("退出")
else:
    print("未知选项")
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：函数是什么？参数和返回值分别是什么？
2. **为什么需要**：为什么重复代码适合放进函数？
3. **怎么用**：如何定义并调用一个带参数的函数？
4. **注意事项**：局部变量为什么不能在函数外直接使用？

::: tip 学习建议
写函数时先问自己：这个函数需要哪些输入？应该返回什么结果？函数名是否能说明它做什么？
:::
