# 调试技巧

## 核心概念

调试是定位和修复问题的过程。写程序时遇到错误很正常，关键是能判断：

- 程序在哪里出错。
- 变量当前是什么值。
- 实际结果和预期结果哪里不同。

调试不是随便试，而是有证据地缩小问题范围。

## print 调试

最简单但有效的调试方法。

```python
def calculate(a, b):
    print(f"调试: a={a}, b={b}")  # 调试输出
    result = a / b
    print(f"调试: result={result}")
    return result
```

## pdb 调试器

Python 内置的交互式调试器。

### 基本使用

```python
import pdb

def buggy_function(x):
    pdb.set_trace()  # 设置断点
    result = x * 2
    return result

buggy_function(5)
```

### 常用命令

```python
# pdb 交互命令
n (next)      # 下一行
s (step)      # 进入函数
c (continue)  # 继续执行
l (list)      # 查看代码
p variable    # 打印变量
q (quit)      # 退出
```

### Python 3.7+ breakpoint()

```python
def calculate(a, b):
    breakpoint()  # 推荐用法
    return a / b
```

## IDE 断点调试

### VSCode 调试

1. 点击行号左侧设置断点
2. F5 启动调试
3. 使用调试面板查看变量

### PyCharm 调试

1. 点击行号设置断点
2. 右键 → Debug
3. 使用调试窗口

## 日志调试

使用 logging 代替 print。

```python
import logging

logging.basicConfig(level=logging.DEBUG)

def process_data(data):
    logging.debug(f"输入数据: {data}")
    result = data * 2
    logging.debug(f"处理结果: {result}")
    return result
```

## 异常追踪

### traceback 模块

```python
import traceback

try:
    result = 1 / 0
except Exception as e:
    traceback.print_exc()
    # 或保存到文件
    with open('error.log', 'w') as f:
        traceback.print_exc(file=f)
```

### sys.exc_info()

```python
import sys

try:
    result = 1 / 0
except Exception:
    exc_type, exc_value, exc_tb = sys.exc_info()
    print(f"异常类型: {exc_type}")
    print(f"异常值: {exc_value}")
```

## 断言调试

```python
def divide(a, b):
    assert b != 0, "除数不能为零"
    return a / b

# 运行时会检查断言
result = divide(10, 0)  # AssertionError
```

## 使用场景

### 场景 1：快速定位问题
使用 print 或 logging 输出关键变量。

### 场景 2：复杂逻辑调试
使用 pdb 单步执行。

### 场景 3：生产环境问题
使用日志记录异常堆栈。

### 场景 4：单元测试
使用断言验证预期结果。

## 练习题

### 基础练习

**题目 1**：修复以下代码的 bug（提示：使用 print 定位问题）。

```python
def find_max(numbers):
    max_num = 0
    for num in numbers:
        if num > max_num:
            max_num = num
    return max_num

print(find_max([1, -5, 3, -2]))  # 期望 3，实际 0
```

<details>
<summary>💡 查看答案</summary>

```python
def find_max(numbers):
    if not numbers:
        return None
    
    max_num = numbers[0]  # 修复：初始化为第一个元素
    print(f"初始 max_num: {max_num}")
    
    for num in numbers:
        print(f"比较: {num} vs {max_num}")
        if num > max_num:
            max_num = num
            print(f"更新 max_num: {max_num}")
    
    return max_num

print(find_max([1, -5, 3, -2]))  # 3
```

**解析**：初始值 0 对于全负数列表会返回错误结果。
</details>

### 进阶练习

**题目 2**：使用 pdb 调试递归函数，查看调用栈。

<details>
<summary>💡 查看答案</summary>

先创建一个文件 `factorial_debug.py`：

```python
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

print(factorial(4))
```

用 pdb 启动：

```bash
python -m pdb factorial_debug.py
```

常用操作：

```text
n      # 执行下一行，不进入函数内部
s      # 进入当前函数调用
w      # 查看调用栈，也可以写 where
r      # 执行到当前函数返回
c      # 继续运行
q      # 退出调试
```

调试递归时，可以多次输入 `s` 进入 `factorial()` 的下一层调用，再输入 `w` 查看当前调用栈。你会看到 `factorial(4)` 调用 `factorial(3)`，再调用 `factorial(2)`，直到终止条件返回。

**解析**：递归调试的重点不是一次看完结果，而是观察“函数如何一层层调用，又如何一层层返回”。
</details>

### 挑战练习

**题目 3**：给 `divide(a, b)` 添加断言，确保除数不是 0，并观察断言失败时的报错。

<details>
<summary>💡 查看答案</summary>

```python
def divide(a, b):
    assert b != 0, "除数不能为 0"
    return a / b

print(divide(10, 2))
print(divide(10, 0))
```

**解析**：第二次调用会触发 `AssertionError`，错误信息是 `除数不能为 0`。
</details>

## 费曼学习法检验

1. **这是什么**：pdb 的 n 和 s 命令有什么区别？

2. **为什么需要**：什么时候用 print，什么时候用 pdb？

3. **怎么用**：向新手解释如何读懂 Python 的错误堆栈？

4. **注意事项**：生产环境为什么不能用 print 调试？

::: tip 学习建议
调试是开发者的日常工作！掌握工具能事半功倍。
:::
