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
