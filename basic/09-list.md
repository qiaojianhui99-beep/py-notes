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
