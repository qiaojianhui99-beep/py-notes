# 集合（set）

## 集合创建

```python
# 空集合（不能用 {}）
empty = set()

# 包含元素
numbers = {1, 2, 3, 4, 5}
mixed = {1, "hello", 3.14}

# 从列表创建（自动去重）
lst = [1, 2, 2, 3, 3, 3]
s = set(lst)  # {1, 2, 3}
```

## 特性

- **无序**：元素没有固定顺序
- **不重复**：自动去除重复元素
- **可变**：可以添加/删除元素

## 添加元素

```python
s = {1, 2, 3}

# add: 添加单个元素
s.add(4)  # {1, 2, 3, 4}

# update: 添加多个元素
s.update([5, 6])  # {1, 2, 3, 4, 5, 6}
```

## 删除元素

```python
s = {1, 2, 3, 4, 5}

# remove: 删除指定元素（不存在会报错）
s.remove(3)

# discard: 删除指定元素（不存在不报错）
s.discard(10)

# pop: 随机删除一个元素
s.pop()

# clear: 清空集合
s.clear()
```

## 集合运算

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

# 并集
a | b           # {1, 2, 3, 4, 5, 6}
a.union(b)

# 交集
a & b           # {3, 4}
a.intersection(b)

# 差集
a - b           # {1, 2}
a.difference(b)

# 对称差集（不在交集中的元素）
a ^ b           # {1, 2, 5, 6}
a.symmetric_difference(b)
```

## 集合关系

```python
a = {1, 2, 3}
b = {1, 2, 3, 4, 5}

# 子集
a.issubset(b)     # True
a <= b            # True

# 超集
b.issuperset(a)   # True
b >= a            # True

# 无交集
a.isdisjoint({4, 5})  # True
```

## 成员检查

```python
s = {1, 2, 3}

1 in s      # True
4 in s      # False
4 not in s  # True
```

## frozenset（不可变集合）

```python
# 创建后不能修改
fs = frozenset([1, 2, 3])

# 可以作为字典的键
d = {fs: "value"}

# 支持集合运算
fs2 = frozenset([3, 4, 5])
fs | fs2  # frozenset({1, 2, 3, 4, 5})
```

## 集合推导式

```python
# 基本形式
squares = {x**2 for x in range(5)}  # {0, 1, 4, 9, 16}

# 带条件
evens = {x for x in range(10) if x % 2 == 0}  # {0, 2, 4, 6, 8}
```

## 使用场景

### 场景 1：去重
列表去重、数据清洗。

### 场景 2：集合运算
共同好友、权限交集。

### 场景 3：成员检查
快速判断元素是否存在。

### 场景 4：数据分析
唯一值统计、差异分析。

## 练习题

### 基础练习

**题目 1**：给定列表 `[1, 2, 2, 3, 3, 3]`，去除重复元素。

<details>
<summary>💡 查看答案</summary>

```python
lst = [1, 2, 2, 3, 3, 3]
unique = list(set(lst))
print(unique)  # [1, 2, 3]
```
</details>

**题目 2**：找出两个列表的共同元素。

<details>
<summary>💡 查看答案</summary>

```python
list1 = [1, 2, 3, 4]
list2 = [3, 4, 5, 6]
common = list(set(list1) & set(list2))
print(common)  # [3, 4]
```
</details>

### 进阶练习

**题目 3**：找出只在第一个列表出现但不在第二个列表的元素。

<details>
<summary>💡 查看答案</summary>

```python
list1 = [1, 2, 3, 4]
list2 = [3, 4, 5, 6]
diff = list(set(list1) - set(list2))
print(diff)  # [1, 2]
```
</details>

### 挑战练习

**题目 4**：实现一个函数，判断两个字符串是否是字母异位词（包含相同字母但顺序不同）。

<details>
<summary>💡 查看提示</summary>

使用集合比较字母种类，字典统计字母数量。
</details>

## 费曼学习法检验

1. **这是什么**：集合为什么是无序的？这对使用有什么影响？

2. **为什么需要**：集合的成员检查为什么比列表快？

3. **怎么用**：向新手解释交集、并集、差集的实际应用场景？

4. **注意事项**：为什么集合不能包含列表？如何存储可变对象的集合？

::: tip 学习建议
集合的数学运算非常强大！适合处理唯一性和关系运算问题。
:::
