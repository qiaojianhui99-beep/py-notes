# 集合（set）

## 核心概念

集合用于保存一组不重复的数据。它最擅长两件事：

- 去重。
- 做交集、并集、差集等集合运算。

```python
numbers = {1, 2, 3, 3}
print(numbers)  # {1, 2, 3}
```

集合是无序的，不能依赖元素显示顺序。

## 集合创建

创建非空集合：

```python
numbers = {1, 2, 3}
names = {"Alice", "Bob", "Alice"}

print(names)  # {'Alice', 'Bob'}
```

创建空集合必须使用 `set()`：

```python
empty = set()
```

不能用 `{}` 创建空集合，因为 `{}` 表示空字典。

从列表创建集合可以自动去重：

```python
numbers = [1, 2, 2, 3, 3, 3]
unique_numbers = set(numbers)

print(unique_numbers)
```

## 集合特性

集合有三个重要特点：

- **不重复**：重复元素会被自动合并。
- **无序**：不能通过索引访问元素。
- **可变**：可以添加和删除元素。

```python
numbers = {1, 2, 3}

# print(numbers[0])  # TypeError
```

## 添加元素

```python
numbers = {1, 2, 3}

numbers.add(4)
print(numbers)

numbers.update([5, 6, 7])
print(numbers)
```

区别：

- `add()`：添加一个元素。
- `update()`：添加多个元素。

## 删除元素

```python
numbers = {1, 2, 3, 4}

numbers.remove(3)
print(numbers)

numbers.discard(10)
print(numbers)
```

区别：

- `remove()`：元素不存在会报错。
- `discard()`：元素不存在也不会报错。

清空集合：

```python
numbers.clear()
print(numbers)  # set()
```

## 成员检查

集合的成员检查非常常用。

```python
allowed_users = {"Alice", "Bob", "Charlie"}

print("Alice" in allowed_users)  # True
print("David" in allowed_users)  # False
```

如果只关心“是否存在”，集合通常比列表更合适。

## 集合运算

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
```

### 并集

两个集合的所有元素：

```python
print(a | b)        # {1, 2, 3, 4, 5, 6}
print(a.union(b))
```

### 交集

两个集合共同拥有的元素：

```python
print(a & b)             # {3, 4}
print(a.intersection(b))
```

### 差集

在 `a` 中但不在 `b` 中的元素：

```python
print(a - b)          # {1, 2}
print(a.difference(b))
```

### 对称差集

只出现在其中一个集合里的元素：

```python
print(a ^ b)  # {1, 2, 5, 6}
```

## 集合关系

```python
small = {1, 2}
big = {1, 2, 3, 4}

print(small <= big)            # True，small 是 big 的子集
print(big >= small)            # True，big 是 small 的超集
print(small.isdisjoint({5, 6})) # True，没有共同元素
```

## frozenset

`frozenset` 是不可变集合。创建后不能添加或删除元素。

```python
values = frozenset([1, 2, 3])
print(values)
```

初学阶段只需要知道它存在。普通去重和集合运算主要使用 `set`。

## 集合推导式

集合推导式可以生成新集合。

```python
squares = {number ** 2 for number in range(1, 6)}
print(squares)
```

也可以加条件：

```python
evens = {number for number in range(1, 11) if number % 2 == 0}
print(evens)
```

## 使用场景

### 场景 1：去重

```python
names = ["Alice", "Bob", "Alice"]
unique_names = set(names)
```

### 场景 2：找共同元素

```python
python_users = {"Alice", "Bob"}
java_users = {"Bob", "Charlie"}

both = python_users & java_users
```

### 场景 3：找差异

```python
yesterday = {"Alice", "Bob", "Charlie"}
today = {"Alice", "David"}

left_users = yesterday - today
new_users = today - yesterday
```

### 场景 4：权限检查

```python
admin_users = {"Alice", "Bob"}
current_user = "Alice"

if current_user in admin_users:
    print("允许访问")
```

## 易错点

### 易错点 1：创建空集合不能用 `{}`

❌ **错误示例**：
```python
empty = {}
print(type(empty))  # <class 'dict'>，不是集合
```

✅ **正确做法**：
```python
empty = set()
print(type(empty))  # <class 'set'>
```

**说明**：`{}` 会创建空字典而不是空集合。创建空集合必须使用 `set()`。

### 易错点 2：集合元素必须是不可变类型

❌ **错误示例**：
```python
s = {[1, 2], [3, 4]}  # TypeError: unhashable type: 'list'
s = {{1, 2}, {3, 4}}  # TypeError: unhashable type: 'set'
```

✅ **正确做法**：
```python
# 可以使用的元素类型
s1 = {1, 2, 3}              # 数字
s2 = {"apple", "banana"}    # 字符串
s3 = {(1, 2), (3, 4)}       # 元组
```

**说明**：集合元素必须是不可变类型（可哈希）。列表、字典、集合不能作为集合元素。

### 易错点 3：集合是无序的，不能依赖显示顺序

❌ **错误理解**：
```python
s = {3, 1, 2}
print(s)  # 可能输出 {1, 2, 3}，也可能是其他顺序

# 错误：期望第一个元素总是 3
# first = list(s)[0]  # 不能保证是 3
```

✅ **正确理解**：
```python
s = {3, 1, 2}
# 集合没有固定顺序，不要依赖显示顺序
# 如果需要有序，使用列表
ordered = sorted(s)
print(ordered)  # [1, 2, 3]
```

**说明**：集合是无序的，Python 3.7+ 字典会保持插入顺序，但集合不保证。不要依赖集合的显示顺序。

## 练习题

### 基础练习

**题目 1**：给定列表 `[1, 2, 2, 3, 3, 3]`，去除重复元素。

<details>
<summary>💡 查看答案</summary>

```python
numbers = [1, 2, 2, 3, 3, 3]
unique_numbers = set(numbers)

print(unique_numbers)
```
</details>

**题目 2**：找出两个列表的共同元素。

<details>
<summary>💡 查看答案</summary>

```python
list1 = [1, 2, 3, 4]
list2 = [3, 4, 5, 6]

common = set(list1) & set(list2)
print(common)
```
</details>

### 进阶练习

**题目 3**：找出只在第一个列表中出现、但不在第二个列表中出现的元素。

<details>
<summary>💡 查看答案</summary>

```python
list1 = [1, 2, 3, 4]
list2 = [3, 4, 5, 6]

only_in_first = set(list1) - set(list2)
print(only_in_first)
```
</details>

### 挑战练习

**题目 4**：有三组用户，分别表示昨天访问、今天访问、付费用户。找出今天新增访问用户、连续两天都访问的用户、今天访问且已经付费的用户。

<details>
<summary>💡 查看答案</summary>

```python
yesterday = {"Alice", "Bob", "Charlie"}
today = {"Alice", "David", "Eva"}
paid = {"Alice", "Eva", "Frank"}

new_today = today - yesterday
active_both_days = today & yesterday
paid_today = today & paid

print("今天新增:", new_today)
print("连续访问:", active_both_days)
print("今日付费访问:", paid_today)
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：集合是什么？它和列表有什么不同？
2. **为什么需要**：为什么去重时常用集合？
3. **怎么用**：交集、并集、差集分别怎么写？
4. **注意事项**：为什么不能依赖集合的显示顺序？

::: tip 学习建议
集合适合处理“唯一性”和“关系”。如果问题里出现共同、不同、去重、是否存在，就可以考虑集合。
:::
