# 列表（list）

## 核心概念

列表用于保存一组有顺序的数据。一个列表可以保存多个值，并且可以修改、添加、删除。

```python
fruits = ["apple", "banana", "orange"]
print(fruits)
```

列表适合表示“多个同类或相关的数据”，比如学生名单、商品列表、待办事项。

## 列表创建

```python
empty = []
numbers = [1, 2, 3, 4, 5]
names = ["Alice", "Bob", "Charlie"]
mixed = [1, "hello", 3.14, True]
```

列表中可以放不同类型的数据，但实际开发中，更推荐一个列表保存同一类数据。

## 访问元素

列表索引从 `0` 开始，和字符串一样。

```python
fruits = ["apple", "banana", "orange"]

print(fruits[0])   # apple
print(fruits[1])   # banana
print(fruits[-1])  # orange
```

访问不存在的索引会报错：

```python
# print(fruits[10])  # IndexError
```

## 切片

列表也支持切片。

```python
numbers = [0, 1, 2, 3, 4, 5]

print(numbers[1:4])  # [1, 2, 3]
print(numbers[:3])   # [0, 1, 2]
print(numbers[3:])   # [3, 4, 5]
print(numbers[::2])  # [0, 2, 4]
```

切片会生成一个新列表。

## 修改列表

列表是可变的，可以直接修改元素。

```python
scores = [80, 90, 70]
scores[0] = 85

print(scores)  # [85, 90, 70]
```

## 添加元素

```python
tasks = ["写作业"]

tasks.append("复习 Python")
print(tasks)  # ['写作业', '复习 Python']

tasks.insert(0, "吃早餐")
print(tasks)  # ['吃早餐', '写作业', '复习 Python']

tasks.extend(["运动", "阅读"])
print(tasks)
```

区别：

- `append()`：把一个元素加到末尾。
- `insert()`：把一个元素插入指定位置。
- `extend()`：把另一组元素追加进来。

## 删除元素

```python
numbers = [1, 2, 3, 4, 5]

numbers.remove(3)
print(numbers)  # [1, 2, 4, 5]

last = numbers.pop()
print(last)     # 5
print(numbers)  # [1, 2, 4]

numbers.clear()
print(numbers)  # []
```

区别：

- `remove(value)`：按值删除。
- `pop()`：删除并返回元素，默认删除最后一个。
- `clear()`：清空列表。

## 遍历列表

列表经常配合循环使用。

```python
fruits = ["apple", "banana", "orange"]

for fruit in fruits:
    print(fruit)
```

如果需要索引，可以使用 `range()`：

```python
fruits = ["apple", "banana", "orange"]

for i in range(len(fruits)):
    print(i, fruits[i])
```

## 排序和反转

```python
numbers = [3, 1, 4, 1, 5]

numbers.sort()
print(numbers)  # [1, 1, 3, 4, 5]

numbers.reverse()
print(numbers)  # [5, 4, 3, 1, 1]
```

`sort()` 会修改原列表。如果想保留原列表，可以使用 `sorted()`：

```python
numbers = [3, 1, 2]
new_numbers = sorted(numbers)

print(numbers)      # [3, 1, 2]
print(new_numbers)  # [1, 2, 3]
```

## 常用操作

```python
numbers = [1, 2, 3, 2, 4]

print(len(numbers))       # 5
print(numbers.count(2))   # 2
print(numbers.index(3))   # 2
print(2 in numbers)       # True
```

## 列表推导式

列表推导式可以用更短的写法生成新列表。

普通循环写法：

```python
squares = []

for number in range(1, 6):
    squares.append(number ** 2)

print(squares)
```

列表推导式写法：

```python
squares = [number ** 2 for number in range(1, 6)]
print(squares)
```

也可以加条件：

```python
evens = [number for number in range(1, 11) if number % 2 == 0]
print(evens)
```

初学时，先写普通循环。熟练后再使用列表推导式。

## 使用场景

### 场景 1：保存待办事项

```python
tasks = ["写作业", "复习", "运动"]
```

### 场景 2：保存多个分数

```python
scores = [90, 85, 100]
```

### 场景 3：批量处理文本

```python
names = ["alice", "bob", "charlie"]

for name in names:
    print(name.title())
```

### 场景 4：生成一组数据

```python
numbers = []

for i in range(1, 6):
    numbers.append(i)
```

## 易错点

### 易错点 1：列表赋值是引用而不是复制

❌ **错误示例**：
```python
list1 = [1, 2, 3]
list2 = list1  # 这不是复制，而是引用
list2.append(4)
print(list1)  # [1, 2, 3, 4]，list1 也被修改了
```

✅ **正确做法**：
```python
list1 = [1, 2, 3]
# 方法 1：使用切片复制
list2 = list1[:]
# 方法 2：使用 copy()
list2 = list1.copy()
# 方法 3：使用 list()
list2 = list(list1)

list2.append(4)
print(list1)  # [1, 2, 3]，list1 未被修改
```

**说明**：直接赋值只是创建了引用，修改其中一个会影响另一个。要复制需要使用切片或 `copy()`。

### 易错点 2：`append()` 和 `extend()` 的区别

❌ **错误示例**：
```python
list1 = [1, 2, 3]
list1.append([4, 5])
print(list1)  # [1, 2, 3, [4, 5]]，嵌套列表

list2 = [1, 2, 3]
list2.extend(4)  # TypeError: 'int' object is not iterable
```

✅ **正确做法**：
```python
# append 添加单个元素（可以是列表）
list1 = [1, 2, 3]
list1.append(4)
print(list1)  # [1, 2, 3, 4]

# extend 添加多个元素
list2 = [1, 2, 3]
list2.extend([4, 5])
print(list2)  # [1, 2, 3, 4, 5]
```

**说明**：`append()` 添加整个对象，`extend()` 添加可迭代对象中的每个元素。

### 易错点 3：`remove()` 只删除第一个匹配项

❌ **错误理解**：
```python
numbers = [1, 2, 3, 2, 4, 2]
numbers.remove(2)
print(numbers)  # [1, 3, 2, 4, 2]，只删除了第一个 2
```

✅ **正确做法**：
```python
# 删除所有的 2
numbers = [1, 2, 3, 2, 4, 2]
numbers = [num for num in numbers if num != 2]
print(numbers)  # [1, 3, 4]

# 或者循环删除（注意要遍历副本）
numbers = [1, 2, 3, 2, 4, 2]
for num in numbers[:]:
    if num == 2:
        numbers.remove(num)
```

**说明**：`remove()` 只删除第一个匹配的元素。要删除所有匹配项需要循环或列表推导式。

## 练习题

### 基础练习

**题目 1**：创建列表 `[1, 2, 3, 4, 5]`，把每个元素逐行输出。

<details>
<summary>💡 查看答案</summary>

```python
numbers = [1, 2, 3, 4, 5]

for number in numbers:
    print(number)
```
</details>

**题目 2**：合并两个列表 `[1, 2, 3]` 和 `[4, 5, 6]`。

<details>
<summary>💡 查看答案</summary>

```python
list1 = [1, 2, 3]
list2 = [4, 5, 6]

merged = list1 + list2
print(merged)
```
</details>

### 进阶练习

**题目 3**：删除列表 `[1, 2, 3, 4, 5]` 中的所有偶数，生成一个只包含奇数的新列表。

<details>
<summary>💡 查看答案</summary>

普通循环写法：

```python
numbers = [1, 2, 3, 4, 5]
odds = []

for number in numbers:
    if number % 2 != 0:
        odds.append(number)

print(odds)
```

列表推导式写法：

```python
numbers = [1, 2, 3, 4, 5]
odds = [number for number in numbers if number % 2 != 0]

print(odds)
```
</details>

### 挑战练习

**题目 4**：列表 `[3, 1, 3, 2, 1, 5]` 中有重复元素，请去重并保持原来的出现顺序。

<details>
<summary>💡 查看答案</summary>

```python
numbers = [3, 1, 3, 2, 1, 5]
result = []

for number in numbers:
    if number not in result:
        result.append(number)

print(result)  # [3, 1, 2, 5]
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：列表是什么？它适合保存什么数据？
2. **为什么需要**：为什么有了变量还需要列表？
3. **怎么用**：如何添加、删除、遍历列表元素？
4. **注意事项**：`append()` 和 `extend()` 有什么区别？

::: tip 学习建议
列表是最常用的数据结构之一。先把增删改查和循环遍历练熟，再追求更短的写法。
:::
