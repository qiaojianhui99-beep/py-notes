# 列表（list）

## 列表创建

```python
# 空列表
empty = []
lst = list()

# 包含元素的列表
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]
nested = [[1, 2], [3, 4]]
```

## 访问元素

```python
fruits = ["apple", "banana", "orange"]
fruits[0]   # 'apple'
fruits[-1]  # 'orange'
```

## 切片

```python
nums = [0, 1, 2, 3, 4, 5]
nums[1:4]   # [1, 2, 3]
nums[:3]    # [0, 1, 2]
nums[3:]    # [3, 4, 5]
nums[::2]   # [0, 2, 4]
```

## 修改列表

```python
lst = [1, 2, 3]
lst[0] = 10  # [10, 2, 3]
```

## 常用方法

### 添加元素

```python
lst = [1, 2, 3]

# append: 末尾添加
lst.append(4)  # [1, 2, 3, 4]

# insert: 指定位置插入
lst.insert(0, 0)  # [0, 1, 2, 3, 4]

# extend: 扩展列表
lst.extend([5, 6])  # [0, 1, 2, 3, 4, 5, 6]
```

### 删除元素

```python
lst = [1, 2, 3, 4, 5]

# remove: 删除指定值
lst.remove(3)  # [1, 2, 4, 5]

# pop: 删除指定索引
lst.pop()      # [1, 2, 4] (删除末尾)
lst.pop(0)     # [2, 4] (删除索引 0)

# clear: 清空列表
lst.clear()    # []
```

### 排序和反转

```python
nums = [3, 1, 4, 1, 5]

# sort: 原地排序
nums.sort()           # [1, 1, 3, 4, 5]
nums.sort(reverse=True)  # [5, 4, 3, 1, 1]

# reverse: 反转
nums.reverse()  # [1, 1, 3, 4, 5]

# sorted: 返回新列表
sorted([3, 1, 2])  # [1, 2, 3]
```

### 其他方法

```python
lst = [1, 2, 3, 2, 4]

lst.count(2)   # 2 (计数)
lst.index(3)   # 2 (查找索引)
len(lst)       # 5 (长度)
```

## 列表推导式

```python
# 基本形式
squares = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]

# 带条件
evens = [x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]

# 嵌套
matrix = [[i*j for j in range(3)] for i in range(3)]
```

## 使用场景

### 场景 1：数据收集
存储批量数据、用户列表。

### 场景 2：算法实现
排序、搜索、栈、队列。

### 场景 3：数据处理
数据过滤、转换、聚合。

### 场景 4：配置管理
菜单选项、权限列表。

## 练习题

### 基础练习

**题目 1**：创建列表 `[1, 2, 3, 4, 5]`，删除所有偶数。

<details>
<summary>💡 查看答案</summary>

```python
lst = [1, 2, 3, 4, 5]
lst = [x for x in lst if x % 2 != 0]
print(lst)  # [1, 3, 5]
```
</details>

**题目 2**：合并两个列表 `[1, 2, 3]` 和 `[4, 5, 6]`。

<details>
<summary>💡 查看答案</summary>

```python
list1 = [1, 2, 3]
list2 = [4, 5, 6]
merged = list1 + list2  # [1, 2, 3, 4, 5, 6]
```
</details>

### 进阶练习

**题目 3**：找出列表 `[3, 1, 4, 1, 5, 9, 2, 6]` 中的最大值和最小值。

<details>
<summary>💡 查看答案</summary>

```python
lst = [3, 1, 4, 1, 5, 9, 2, 6]
print(f"最大值: {max(lst)}, 最小值: {min(lst)}")
```
</details>

### 挑战练习

**题目 4**：实现列表去重并保持原顺序（不能用 set）。

<details>
<summary>💡 查看提示</summary>

使用字典或临时列表跟踪已出现的元素。
</details>

## 费曼学习法检验

1. **这是什么**：列表和元组有什么区别？为什么需要不可变的元组？

2. **为什么需要**：为什么列表推导式比 for 循环更快？

3. **怎么用**：向新手解释 `append()` 和 `extend()` 的区别？

4. **注意事项**：`lst.sort()` 和 `sorted(lst)` 有什么区别？

::: tip 学习建议
列表是 Python 最常用的数据结构！掌握增删改查和推导式是关键。
:::
