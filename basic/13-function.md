# 函数定义与调用

## 定义函数

```python
def greet():
    print("Hello!")

greet()  # 调用函数
```

## 参数和返回值

```python
def add(a, b):
    return a + b

result = add(3, 5)  # 8
```

## 多个返回值

```python
def get_point():
    return 10, 20

x, y = get_point()
```

## 无返回值

```python
def print_message():
    print("Hello")
    # 默认返回 None
```

## 函数作用域

### 局部变量

```python
def func():
    x = 10  # 局部变量
    print(x)

func()
# print(x)  # 错误：x 不存在
```

### 全局变量

```python
x = 100  # 全局变量

def func():
    print(x)  # 可以访问全局变量

func()  # 100
```

## global 关键字

修改全局变量需要使用 `global`。

```python
count = 0

def increment():
    global count
    count += 1

increment()
print(count)  # 1
```

## nonlocal 关键字

修改外层函数的局部变量。

```python
def outer():
    x = 10
    
    def inner():
        nonlocal x
        x += 1
    
    inner()
    print(x)  # 11

outer()
```

## 函数文档字符串

```python
def add(a, b):
    """
    计算两个数的和
    
    参数:
        a: 第一个数
        b: 第二个数
    
    返回:
        两数之和
    """
    return a + b

print(add.__doc__)  # 查看文档
```

## 使用场景

### 场景 1：代码复用
避免重复代码，提高维护性。

### 场景 2：模块化开发
将复杂问题分解为小函数。

### 场景 3：库和框架开发
提供 API 接口。

### 场景 4：回调和事件处理
事件驱动编程。

## 练习题

### 基础练习

**题目 1**：编写函数 `is_even(n)` 判断数字是否为偶数。

<details>
<summary>💡 查看答案</summary>

```python
def is_even(n):
    return n % 2 == 0

print(is_even(4))  # True
```
</details>

**题目 2**：编写函数 `max_of_three(a, b, c)` 返回三个数中的最大值。

<details>
<summary>💡 查看答案</summary>

```python
def max_of_three(a, b, c):
    return max(a, b, c)
```
</details>

### 进阶练习

**题目 3**：编写函数 `fibonacci(n)` 返回斐波那契数列的第 n 项。

<details>
<summary>💡 查看答案</summary>

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(6))  # 8
```
</details>

### 挑战练习

**题目 4**：实现一个函数装饰器，计算函数执行时间。

## 费曼学习法检验

1. **这是什么**：函数的参数传递是传值还是传引用？

2. **为什么需要**：为什么需要 return？不用 return 会怎样？

3. **怎么用**：向新手解释全局变量和局部变量的区别？

4. **注意事项**：什么时候需要用 global 关键字？滥用会有什么问题？

::: tip 学习建议
函数是程序的基本单元！写好函数是写好程序的第一步。
:::
