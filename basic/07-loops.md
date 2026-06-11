# 循环

## for 循环

### 遍历列表

```python
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)
```

### 遍历字符串

```python
for char in "Python":
    print(char)
```

### range() 函数

```python
# range(stop)
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# range(start, stop)
for i in range(2, 6):
    print(i)  # 2, 3, 4, 5

# range(start, stop, step)
for i in range(0, 10, 2):
    print(i)  # 0, 2, 4, 6, 8
```

## while 循环

```python
count = 0
while count < 5:
    print(count)
    count += 1
```

## break 语句

跳出整个循环。

```python
for i in range(10):
    if i == 5:
        break
    print(i)  # 0, 1, 2, 3, 4
```

## continue 语句

跳过当前迭代，继续下一次。

```python
for i in range(5):
    if i == 2:
        continue
    print(i)  # 0, 1, 3, 4
```

## else 子句

循环正常结束时执行（未被 break 打断）。

```python
for i in range(5):
    print(i)
else:
    print("循环结束")

# 被 break 打断时不执行 else
for i in range(5):
    if i == 3:
        break
    print(i)
else:
    print("不会执行")
```

## 嵌套循环

```python
# 打印九九乘法表
for i in range(1, 10):
    for j in range(1, i + 1):
        print(f"{j}x{i}={i*j}", end=" ")
    print()
```

## 使用场景

### 场景 1：批量数据处理
遍历文件列表、数据库记录。

### 场景 2：重复操作
自动化任务、定时任务。

### 场景 3：数据生成
生成测试数据、序列号。

### 场景 4：交互式程序
游戏主循环、CLI 工具。

## 练习题

### 基础练习

**题目 1**：打印 1-100 的所有偶数。

<details>
<summary>💡 查看答案</summary>

```python
for i in range(2, 101, 2):
    print(i, end=" ")
```
</details>

**题目 2**：求 1-100 的和。

<details>
<summary>💡 查看答案</summary>

```python
total = sum(range(1, 101))
print(total)  # 5050

# 或使用循环
total = 0
for i in range(1, 101):
    total += i
print(total)
```
</details>

### 进阶练习

**题目 3**：找出 1-100 中所有的质数。

<details>
<summary>💡 查看答案</summary>

```python
for num in range(2, 101):
    is_prime = True
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            is_prime = False
            break
    if is_prime:
        print(num, end=" ")
```
</details>

### 挑战练习

**题目 4**：实现一个猜数字游戏，随机生成 1-100 的数字，用户猜测，提示大了/小了，直到猜对。

## 费曼学习法检验

1. **这是什么**：for 和 while 有什么区别？各适合什么场景？

2. **为什么需要**：break 和 continue 的区别是什么？else 子句什么时候执行？

3. **怎么用**：向新手解释 `range(1, 10, 2)` 的三个参数含义？

4. **注意事项**：死循环是什么？如何避免 while 循环变成死循环？

::: tip 学习建议
循环是编程的核心！掌握 for 和 while 的使用场景，理解 break/continue 的区别。
:::
