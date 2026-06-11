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
