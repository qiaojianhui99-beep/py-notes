# 元组（tuple）

## 核心概念

元组和列表很像，都能保存一组有顺序的数据。最大的区别是：**元组创建后不能修改**。

```python
point = (10, 20)
print(point[0])  # 10
```

元组适合保存固定不变的数据，比如坐标、颜色、日期等。

## 元组创建

```python
empty = ()
numbers = (1, 2, 3)
mixed = (1, "hello", 3.14)
```

单元素元组必须写逗号：

```python
single = (1,)
print(type(single))  # <class 'tuple'>
```

如果不写逗号，`(1)` 只是普通整数加括号：

```python
not_tuple = (1)
print(type(not_tuple))  # <class 'int'>
```

元组可以省略括号：

```python
point = 10, 20
print(point)  # (10, 20)
```

## 访问元素

元组支持索引和切片。

```python
colors = ("red", "green", "blue")

print(colors[0])   # red
print(colors[-1])  # blue
print(colors[0:2]) # ('red', 'green')
```

## 不可变特性

元组创建后，不能修改、添加、删除元素。

```python
numbers = (1, 2, 3)
# numbers[0] = 10  # TypeError
```

如果确实需要修改，应该创建新的元组：

```python
numbers = (1, 2, 3)
new_numbers = (10,) + numbers[1:]

print(new_numbers)  # (10, 2, 3)
```

## 元组解包

元组解包可以把多个值一次性赋给多个变量。

```python
point = (10, 20)
x, y = point

print(x)
print(y)
```

也可以用来交换变量：

```python
a = 1
b = 2

a, b = b, a

print(a)  # 2
print(b)  # 1
```

解包时，左右两边数量要匹配。

```python
# x, y = (1, 2, 3)  # ValueError
```

## 扩展解包

使用 `*` 可以接收剩余元素。

```python
numbers = (1, 2, 3, 4, 5)

first, *middle, last = numbers

print(first)   # 1
print(middle)  # [2, 3, 4]
print(last)    # 5
```

注意：`*middle` 得到的是列表。

## 常用操作

```python
numbers = (1, 2, 3, 2, 4)

print(len(numbers))      # 5
print(numbers.count(2))  # 2
print(numbers.index(3))  # 2
print(2 in numbers)      # True
```

元组也支持拼接和重复：

```python
print((1, 2) + (3, 4))  # (1, 2, 3, 4)
print((1, 2) * 3)       # (1, 2, 1, 2, 1, 2)
```

## 元组 vs 列表

| 对比项 | 列表 | 元组 |
|---|---|---|
| 是否可修改 | 可以 | 不可以 |
| 常用场景 | 会变化的数据 | 固定不变的数据 |
| 写法 | `[1, 2, 3]` | `(1, 2, 3)` |

选择建议：

- 数据后续会增删改，用列表。
- 数据含义固定，不希望被改，用元组。

## 使用场景

### 场景 1：坐标

```python
position = (10, 20)
```

### 场景 2：颜色值

```python
rgb = (255, 0, 0)
```

### 场景 3：固定日期

```python
date = (2026, 6, 12)
```

### 场景 4：多变量赋值

```python
name, age = ("Alice", 18)
```

## 练习题

### 基础练习

**题目 1**：创建元组 `("Python", "Java", "Go")`，输出第一个和最后一个元素。

<details>
<summary>💡 查看答案</summary>

```python
languages = ("Python", "Java", "Go")

print(languages[0])
print(languages[-1])
```
</details>

**题目 2**：使用元组解包，把 `(1920, 1080)` 分别赋值给 `width` 和 `height`。

<details>
<summary>💡 查看答案</summary>

```python
size = (1920, 1080)
width, height = size

print(width)
print(height)
```
</details>

### 进阶练习

**题目 3**：交换变量 `a = 10` 和 `b = 20` 的值。

<details>
<summary>💡 查看答案</summary>

```python
a = 10
b = 20

a, b = b, a

print(a)  # 20
print(b)  # 10
```
</details>

### 挑战练习

**题目 4**：观察下面代码，解释为什么元组本身没变，但里面的列表变了。

```python
data = ([1, 2], "ok")
data[0].append(3)
print(data)
```

<details>
<summary>💡 查看参考答案</summary>

元组不能更换自己的元素，所以不能写 `data[0] = ...`。但 `data[0]` 指向的是一个列表，列表本身是可变的，因此可以对这个列表执行 `append()`。这说明“元组不可变”指的是元组保存的元素引用不能被替换。
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：元组是什么？它和列表最重要的区别是什么？
2. **为什么需要**：为什么有了列表还需要元组？
3. **怎么用**：如何创建单元素元组？为什么要写逗号？
4. **注意事项**：元组解包时数量不匹配会怎样？

::: tip 学习建议
把元组理解成“固定版列表”。当一组数据不应该被修改时，优先考虑元组。
:::
