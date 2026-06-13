# 循环

## 核心概念

循环用于重复执行一段代码。遇到“做很多次”“逐个处理”“直到满足条件为止”这类需求，通常就需要循环。

Python 常用两种循环：

- `for`：适合次数明确，或逐个处理一组内容。
- `while`：适合次数不确定，但知道继续条件。

## for 循环

`for` 可以配合 `range()` 重复执行固定次数。

```python
for i in range(5):
    print(i)
```

输出：

```text
0
1
2
3
4
```

注意：`range(5)` 从 `0` 开始，到 `5` 之前停止。

## range() 函数

### range(stop)

```python
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4
```

### range(start, stop)

```python
for i in range(2, 6):
    print(i)  # 2, 3, 4, 5
```

### range(start, stop, step)

```python
for i in range(0, 10, 2):
    print(i)  # 0, 2, 4, 6, 8
```

第三个参数是步长，表示每次增加多少。

## 遍历字符串

字符串可以逐个字符处理：

```python
word = "Python"

for char in word:
    print(char)
```

这会依次输出 `P`、`y`、`t`、`h`、`o`、`n`。

## while 循环

`while` 会在条件为真时一直执行。

```python
count = 1

while count <= 5:
    print(count)
    count += 1
```

写 `while` 时，一定要让循环条件有机会变成 `False`，否则会出现死循环。

## break 语句

`break` 用来提前结束整个循环。

```python
for i in range(1, 10):
    if i == 5:
        break
    print(i)
```

输出 `1` 到 `4`，遇到 `5` 时循环结束。

## continue 语句

`continue` 用来跳过本次循环，直接进入下一次。

```python
for i in range(1, 6):
    if i == 3:
        continue
    print(i)
```

输出 `1`、`2`、`4`、`5`。

## else 子句

循环也可以带 `else`。当循环没有被 `break` 打断时，`else` 会执行。

```python
target = 3

for i in range(1, 6):
    if i == target:
        print("找到了")
        break
else:
    print("没找到")
```

初学阶段不必强行使用循环 `else`，能读懂即可。

## 嵌套循环

循环里面还可以写循环。

```python
for row in range(1, 4):
    for col in range(1, 4):
        print(f"({row}, {col})", end=" ")
    print()
```

嵌套循环常用于表格、坐标、乘法表等场景。

## 使用场景

### 场景 1：重复输出

```python
for i in range(3):
    print("欢迎学习 Python")
```

### 场景 2：累计求和

```python
total = 0

for i in range(1, 101):
    total += i

print(total)
```

### 场景 3：逐个检查字符

```python
word = "Python"

for char in word:
    print(char)
```

### 场景 4：等待用户输入正确内容

```python
password = ""

while password != "123456":
    password = input("请输入密码: ")

print("登录成功")
```

## 易错点

### 易错点 1：死循环 - 忘记更新循环条件

❌ **错误示例**：
```python
count = 0
while count < 5:
    print("Hello")  # 忘记更新 count，无限循环
```

✅ **正确示例**：
```python
count = 0
while count < 5:
    print("Hello")
    count += 1  # 必须更新条件变量
```

**说明**：`while` 循环必须保证条件最终会变为 `False`，否则会无限循环。

### 易错点 2：`range()` 的右边界不包含

❌ **错误理解**：
```python
# 想输出 1 到 10
for i in range(1, 10):  # 实际只输出 1 到 9
    print(i)
```

✅ **正确做法**：
```python
# 输出 1 到 10
for i in range(1, 11):  # 右边界要写 11
    print(i)
```

**说明**：`range(start, stop)` 不包含 `stop`。这是 Python 的设计习惯。

### 易错点 3：在循环中修改正在遍历的列表

❌ **错误示例**：
```python
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    if num % 2 == 0:
        numbers.remove(num)  # 可能跳过元素
print(numbers)  # [1, 3, 5]，但 4 被跳过了
```

✅ **正确做法**：
```python
numbers = [1, 2, 3, 4, 5]
# 方法 1：遍历副本
for num in numbers[:]:
    if num % 2 == 0:
        numbers.remove(num)

# 方法 2：创建新列表
numbers = [1, 2, 3, 4, 5]
numbers = [num for num in numbers if num % 2 != 0]
print(numbers)  # [1, 3, 5]
```

**说明**：遍历列表的同时修改它会导致索引错乱。应该遍历副本或创建新列表。

## 练习题

### 基础练习

**题目 1**：打印 1 到 10。

<details>
<summary>💡 查看答案</summary>

```python
for i in range(1, 11):
    print(i)
```
</details>

**题目 2**：打印 1 到 100 的所有偶数。

<details>
<summary>💡 查看答案</summary>

```python
for i in range(2, 101, 2):
    print(i)
```
</details>

### 进阶练习

**题目 3**：计算 1 到 100 的和。

<details>
<summary>💡 查看答案</summary>

```python
total = 0

for i in range(1, 101):
    total += i

print(total)
```
</details>

### 挑战练习

**题目 4**：输入一个正整数 `n`，打印 `n` 行星号，第 1 行 1 个，第 2 行 2 个，依次增加。

<details>
<summary>💡 查看答案</summary>

```python
n = int(input("请输入行数: "))

for i in range(1, n + 1):
    print("*" * i)
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：`for` 和 `while` 有什么区别？
2. **为什么需要**：为什么 `while` 循环容易写出死循环？
3. **怎么用**：`range(1, 10, 2)` 的三个参数分别是什么意思？
4. **注意事项**：`break` 和 `continue` 的区别是什么？

::: tip 学习建议
循环最容易通过动手掌握。先从打印数字、累计求和、星号图形这类小练习开始。
:::
