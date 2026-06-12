# 异常处理

## 核心概念

异常是程序运行过程中出现的问题。比如除数为 0、文件不存在、输入内容不能转成数字，都会导致异常。

如果不处理异常，程序会停止运行：

```python
number = int("abc")  # ValueError
```

异常处理的目标不是隐藏错误，而是在可预期的问题出现时，给出更友好的处理方式。

## try-except 结构

把可能出错的代码放进 `try`，把处理方式写进 `except`。

```python
try:
    number = int("abc")
except ValueError:
    print("转换失败，请提供数字字符串")
```

执行流程：

1. 先执行 `try` 中的代码。
2. 如果没有异常，跳过 `except`。
3. 如果出现匹配的异常，执行对应的 `except`。

## 捕获不同异常

不同错误对应不同异常类型。

```python
try:
    a = float(input("第一个数: "))
    b = float(input("第二个数: "))
    print(a / b)
except ValueError:
    print("请输入合法数字")
except ZeroDivisionError:
    print("除数不能为 0")
```

也可以把多个异常放在一个元组里统一处理：

```python
try:
    number = int(input("请输入数字: "))
    print(10 / number)
except (ValueError, ZeroDivisionError):
    print("输入无效或除数为 0")
```

## 获取异常信息

使用 `as` 可以拿到异常对象。

```python
try:
    number = int("abc")
except ValueError as error:
    print(f"错误信息: {error}")
```

调试时可以输出异常信息；面向普通用户时，通常输出更容易理解的提示。

## 捕获所有常规异常

`Exception` 可以捕获大多数常规异常。

```python
try:
    result = 10 / 0
except Exception as error:
    print(f"发生错误: {error}")
```

不建议随意捕获所有异常后什么都不做。这样会把真正的问题藏起来。

## else 子句

`else` 在没有异常时执行。

```python
try:
    number = int("123")
except ValueError:
    print("转换失败")
else:
    print(f"转换成功: {number}")
```

`else` 适合放“只有成功后才执行”的代码。

## finally 子句

`finally` 无论是否出现异常都会执行。

```python
try:
    print("开始执行")
    result = 10 / 2
except ZeroDivisionError:
    print("除数不能为 0")
finally:
    print("执行结束")
```

`finally` 常用于清理资源。文件操作中更推荐使用 `with`，它会自动关闭文件。

## 完整结构

```python
try:
    number = int(input("请输入数字: "))
except ValueError:
    print("输入无效")
else:
    print(f"你输入的是 {number}")
finally:
    print("程序结束")
```

实际代码中不一定四个部分都要写。最常见的是 `try-except`。

## raise 抛出异常

`raise` 用于主动抛出异常。

```python
age = -1

if age < 0:
    raise ValueError("年龄不能为负数")
```

在函数中也很常见：

```python
def check_score(score):
    if score < 0 or score > 100:
        raise ValueError("分数必须在 0 到 100 之间")
    return score
```

当函数收到不合理的数据时，主动抛出异常比返回一个含糊的结果更清楚。

## 常见异常类型

```python
int("abc")        # ValueError：值不合适
"hello" + 123     # TypeError：类型不匹配
10 / 0            # ZeroDivisionError：除数为 0
```

```python
data = {"name": "Alice"}
# data["age"]     # KeyError：字典键不存在
```

```python
items = [1, 2, 3]
# items[10]       # IndexError：列表索引超出范围
```

```python
# open("missing.txt")  # FileNotFoundError：文件不存在
```

## 使用场景

### 场景 1：处理用户输入

```python
try:
    age = int(input("请输入年龄: "))
except ValueError:
    print("年龄必须是数字")
```

### 场景 2：处理文件读取

```python
try:
    with open("data.txt", "r", encoding="utf-8") as f:
        print(f.read())
except FileNotFoundError:
    print("文件不存在")
```

### 场景 3：检查函数参数

```python
def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为 0")
    return a / b
```

### 场景 4：让程序继续运行

```python
try:
    number = int("abc")
except ValueError:
    number = 0
```

## 练习题

### 基础练习

**题目 1**：输入两个数字相除，处理输入错误和除数为 0 的情况。

<details>
<summary>💡 查看答案</summary>

```python
try:
    a = float(input("第一个数: "))
    b = float(input("第二个数: "))
    result = a / b
except ValueError:
    print("请输入合法数字")
except ZeroDivisionError:
    print("除数不能为 0")
else:
    print(f"结果: {result}")
```
</details>

### 进阶练习

**题目 2**：编写函数 `safe_read_file(filename)`，文件不存在时返回提示文本。

<details>
<summary>💡 查看答案</summary>

```python
def safe_read_file(filename):
    try:
        with open(filename, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "文件不存在"

content = safe_read_file("data.txt")
print(content)
```
</details>

### 挑战练习

**题目 3**：反复要求用户输入数字，直到输入合法数字为止。

<details>
<summary>💡 查看答案</summary>

```python
while True:
    text = input("请输入数字: ")

    try:
        number = float(text)
        break
    except ValueError:
        print("输入无效，请重新输入")

print(f"你输入的是: {number}")
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：异常是什么？`try-except` 做了什么？
2. **为什么需要**：为什么不能简单地让程序报错退出？
3. **怎么用**：如何处理用户输入不是数字的情况？
4. **注意事项**：为什么不应该随便捕获所有异常后忽略？

::: tip 学习建议
异常处理要针对“可以预料的问题”。如果你不知道怎么处理某个异常，就不要把它藏起来。
:::
