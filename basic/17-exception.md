# 异常处理

## try-except 结构

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("不能除以零")
```

## 捕获多个异常

```python
# Python 3.11+ 可以用 | 合并异常类型
try:
    num = int(input("输入数字: "))
    result = 10 / num
except ValueError | ZeroDivisionError as e:
    print(f"错误: {e}")

# 也可以分别处理
try:
    num = int(input("输入数字: "))
    result = 10 / num
except ValueError:
    print("输入无效")
except ZeroDivisionError:
    print("不能除以零")

# 旧版本写法（Python 3.10-）
try:
    num = int(input("输入数字: "))
    result = 10 / num
except (ValueError, ZeroDivisionError) as e:
    print(f"错误: {e}")
```

## 捕获所有异常

```python
try:
    # 代码
    pass
except Exception as e:
    print(f"发生错误: {e}")
```

## else 子句

没有异常时执行。

```python
try:
    result = 10 / 2
except ZeroDivisionError:
    print("除以零")
else:
    print(f"结果是 {result}")
```

## finally 子句

无论是否异常都执行（常用于清理资源）。

```python
try:
    f = open("file.txt", "r")
    content = f.read()
except FileNotFoundError:
    print("文件不存在")
finally:
    f.close()  # 确保文件关闭
```

## 完整结构

```python
try:
    # 可能出错的代码
    pass
except ValueError:
    # 处理 ValueError
    pass
except Exception as e:
    # 处理其他异常
    pass
else:
    # 没有异常时执行
    pass
finally:
    # 无论如何都执行
    pass
```

## raise 抛出异常

```python
def check_age(age):
    if age < 0:
        raise ValueError("年龄不能为负数")
    return age

try:
    check_age(-5)
except ValueError as e:
    print(e)
```

## 自定义异常

```python
class MyError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

def func():
    raise MyError("自定义错误")

try:
    func()
except MyError as e:
    print(e)
```

## 常见异常类型

```python
# ValueError：值错误
int("abc")

# TypeError：类型错误
"hello" + 123

# KeyError：键不存在
d = {"a": 1}
d["b"]

# IndexError：索引超出范围
lst = [1, 2, 3]
lst[10]

# FileNotFoundError：文件不存在
open("nonexistent.txt")

# ZeroDivisionError：除以零
10 / 0

# AttributeError：属性不存在
"hello".non_existent_method()

# ImportError：导入错误
import non_existent_module
```

## 异常链

```python
try:
    # 代码
    pass
except ValueError as e:
    raise RuntimeError("处理失败") from e
```

## ExceptionGroup（Python 3.11+）

处理多个异常。

```python
# Python 3.11+ 新特性
def process_items(items):
    errors = []
    for item in items:
        try:
            # 处理逻辑
            if item < 0:
                raise ValueError(f"负数: {item}")
        except ValueError as e:
            errors.append(e)
    
    if errors:
        raise ExceptionGroup("多个错误", errors)

# 捕获 ExceptionGroup
try:
    process_items([1, -2, 3, -4])
except* ValueError as eg:
    print(f"发现 {len(eg.exceptions)} 个 ValueError")
```
