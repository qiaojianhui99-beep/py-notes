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

## 使用场景

### 场景 1：输入验证
处理用户输入错误、数据格式异常。

### 场景 2：文件操作
处理文件不存在、权限错误。

### 场景 3：网络请求
处理超时、连接失败。

### 场景 4：数据库操作
处理连接失败、查询错误。

## 练习题

### 基础练习

**题目 1**：编写程序，输入两个数字相除，处理除零异常和输入错误。

<details>
<summary>💡 查看答案</summary>

```python
try:
    a = float(input("第一个数: "))
    b = float(input("第二个数: "))
    result = a / b
    print(f"结果: {result}")
except ValueError:
    print("输入无效，请输入数字")
except ZeroDivisionError:
    print("除数不能为零")
```
</details>

### 进阶练习

**题目 2**：编写 `safe_read_file(filename)` 函数，处理文件不存在、编码错误等异常。

<details>
<summary>💡 查看答案</summary>

```python
def safe_read_file(filename):
    try:
        with open(filename, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return f"文件 {filename} 不存在"
    except UnicodeDecodeError:
        return "文件编码错误"
    except Exception as e:
        return f"未知错误: {e}"
```
</details>

### 挑战练习

**题目 3**：实现重试装饰器，函数失败后自动重试 3 次。

<details>
<summary>💡 查看提示</summary>

使用装饰器 + 循环 + try-except 组合。
</details>

## 费曼学习法检验

1. **这是什么**：为什么需要异常处理？不处理会怎样？

2. **为什么需要**：`finally` 块什么时候执行？即使有 return 也会执行吗？

3. **怎么用**：向新手解释什么时候应该捕获异常，什么时候让它抛出？

4. **注意事项**：为什么不推荐使用空的 `except:` 捕获所有异常？

::: tip 学习建议
异常处理让程序更健壮！但不要过度使用，合理的异常处理是艺术。
:::


