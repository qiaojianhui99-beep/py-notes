# 元组（tuple）

## 元组创建

```python
# 空元组
empty = ()
tup = tuple()

# 包含元素
numbers = (1, 2, 3)
single = (1,)  # 单元素元组需要逗号
mixed = (1, "hello", 3.14)

# 省略括号
point = 10, 20
```

## 特性：不可变

元组创建后不能修改、添加、删除元素。

```python
tup = (1, 2, 3)
# tup[0] = 10  # 错误！
```

## 访问元素

```python
tup = ("apple", "banana", "orange")
tup[0]   # 'apple'
tup[-1]  # 'orange'
```

## 切片

```python
tup = (0, 1, 2, 3, 4)
tup[1:4]  # (1, 2, 3)
```

## 元组解包

```python
# 基本解包
x, y = (10, 20)

# 交换变量
a, b = 1, 2
a, b = b, a  # a=2, b=1

# 函数返回多值
def get_point():
    return 10, 20

x, y = get_point()

# 扩展解包
first, *rest, last = (1, 2, 3, 4, 5)
# first=1, rest=[2,3,4], last=5
```

## 常用操作

```python
tup = (1, 2, 3, 2, 4)

# 长度
len(tup)      # 5

# 计数
tup.count(2)  # 2

# 查找索引
tup.index(3)  # 2

# 拼接
(1, 2) + (3, 4)  # (1, 2, 3, 4)

# 重复
(1, 2) * 3  # (1, 2, 1, 2, 1, 2)

# 成员检查
2 in tup  # True
```

## 元组 vs 列表

| 特性 | 元组 | 列表 |
|------|------|------|
| 可变性 | 不可变 | 可变 |
| 性能 | 更快 | 较慢 |
| 内存 | 更小 | 较大 |
| 用途 | 固定数据 | 动态数据 |

```python
# 元组适用场景
coordinates = (10, 20)  # 坐标
rgb = (255, 0, 0)       # 颜色
date = (2024, 6, 11)    # 日期

# 列表适用场景
tasks = ["task1", "task2"]  # 待办事项（可修改）
```

## 使用场景

### 场景 1：函数返回多值
返回坐标、状态码和消息。

### 场景 2：字典的键
不可变特性可作为字典键。

### 场景 3：数据保护
确保数据不被意外修改。

### 场景 4：性能优化
元组比列表占用内存更少。

## 练习题

### 基础练习

**题目 1**：创建元组 `(1, 2, 3)`，尝试修改第一个元素，观察结果。

<details>
<summary>💡 查看答案</summary>

```python
tup = (1, 2, 3)
# tup[0] = 10  # TypeError: 'tuple' object does not support item assignment
```

**解析**：元组是不可变的，无法修改元素。
</details>

**题目 2**：使用元组解包交换两个变量的值。

<details>
<summary>💡 查看答案</summary>

```python
a, b = 10, 20
a, b = b, a
print(a, b)  # 20 10
```
</details>

### 进阶练习

**题目 3**：编写函数 `get_stats(numbers: list) -> tuple`，返回列表的最大值、最小值和平均值。

<details>
<summary>💡 查看答案</summary>

```python
def get_stats(numbers: list) -> tuple:
    return max(numbers), min(numbers), sum(numbers) / len(numbers)

result = get_stats([1, 2, 3, 4, 5])
print(result)  # (5, 1, 3.0)
```
</details>

### 挑战练习

**题目 4**：解释为什么元组可以包含可变对象（如列表），这会带来什么问题？

## 费曼学习法检验

1. **这是什么**：元组的不可变性是什么意思？它和字符串的不可变性一样吗？

2. **为什么需要**：如果列表能做所有事，为什么还需要元组？

3. **怎么用**：向新手解释为什么单元素元组需要逗号 `(1,)`？

4. **注意事项**：元组解包时，左右两边元素数量不匹配会怎样？

::: tip 学习建议
元组是不可变列表！适合存储固定数据，用于函数返回多值非常方便。
:::
