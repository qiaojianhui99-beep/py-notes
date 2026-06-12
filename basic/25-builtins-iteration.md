# 常用内置函数与遍历技巧

## 核心概念

内置函数是 Python 启动后就能直接使用的函数，不需要 `import`。前面学习字符串、列表、字典、函数和文件时，已经接触过一些内置函数，比如 `print()`、`input()`、`type()`、`int()`、`str()`。

本章重点整理处理集合数据时最常见的一组内置函数和遍历技巧：

- `len()`：获取长度。
- `sum()`：求和。
- `min()` / `max()`：找最小值和最大值。
- `sorted()`：生成排序后的新列表。
- `enumerate()`：遍历时同时拿到序号和值。
- `zip()`：并行遍历多组数据。
- `any()` / `all()`：判断一组条件中是否有任意一个成立，或是否全部成立。

这些工具不会替代 `for` 循环，而是让常见操作写得更清楚。

## len()

`len()` 用来获取对象中元素的数量。

```python
name = "Python"
numbers = [10, 20, 30]
user = {"name": "Alice", "age": 18}

print(len(name))     # 6
print(len(numbers))  # 3
print(len(user))     # 2，字典中键值对的数量
```

常见用途是判断是否为空：

```python
items = []

if len(items) == 0:
    print("列表为空")
```

更符合 Python 风格的写法是直接判断对象本身：

```python
items = []

if not items:
    print("列表为空")
```

## sum()、min()、max()

`sum()` 用于数字求和。

```python
scores = [80, 95, 72]

total = sum(scores)
average = total / len(scores)

print(total)
print(average)
```

`min()` 和 `max()` 用来找最小值和最大值。

```python
temperatures = [32, 28, 35, 30]

print(min(temperatures))  # 28
print(max(temperatures))  # 35
```

如果列表可能为空，要先判断：

```python
scores = []

if scores:
    print(max(scores))
else:
    print("没有分数")
```

## sorted()

`sorted()` 会返回一个排序后的新列表，不会修改原列表。

```python
numbers = [3, 1, 5, 2]

new_numbers = sorted(numbers)

print(numbers)      # [3, 1, 5, 2]
print(new_numbers)  # [1, 2, 3, 5]
```

降序排序：

```python
numbers = [3, 1, 5, 2]

print(sorted(numbers, reverse=True))  # [5, 3, 2, 1]
```

按照自定义规则排序时，可以使用 `key`。

```python
students = [
    {"name": "Alice", "score": 90},
    {"name": "Bob", "score": 85},
    {"name": "Charlie", "score": 95},
]

students_by_score = sorted(students, key=lambda student: student["score"])
print(students_by_score)
```

这里的 `lambda student: student["score"]` 表示：排序时用每个学生字典里的 `score` 作为比较依据。

## enumerate()

如果遍历列表时既需要元素，也需要序号，可以使用 `enumerate()`。

```python
fruits = ["apple", "banana", "orange"]

for index, fruit in enumerate(fruits):
    print(index, fruit)
```

默认序号从 `0` 开始。如果想从 `1` 开始：

```python
fruits = ["apple", "banana", "orange"]

for index, fruit in enumerate(fruits, start=1):
    print(f"{index}. {fruit}")
```

这通常比 `range(len(fruits))` 更直接。

```python
# 不推荐作为首选
for i in range(len(fruits)):
    print(i, fruits[i])

# 更推荐
for i, fruit in enumerate(fruits):
    print(i, fruit)
```

## zip()

`zip()` 可以把多组数据按位置配对，适合并行遍历。

```python
names = ["Alice", "Bob", "Charlie"]
scores = [90, 85, 95]

for name, score in zip(names, scores):
    print(f"{name}: {score}")
```

也可以把两组数据合成字典：

```python
names = ["Alice", "Bob", "Charlie"]
scores = [90, 85, 95]

score_map = dict(zip(names, scores))
print(score_map)
```

如果两组数据长度不同，`zip()` 会以较短的一组为准。

```python
names = ["Alice", "Bob", "Charlie"]
scores = [90, 85]

print(list(zip(names, scores)))  # [('Alice', 90), ('Bob', 85)]
```

## any() 和 all()

`any()` 判断一组结果中是否至少有一个为真。

```python
scores = [45, 52, 88]

has_passed = any(score >= 60 for score in scores)
print(has_passed)  # True
```

`all()` 判断一组结果是否全部为真。

```python
scores = [75, 82, 90]

all_passed = all(score >= 60 for score in scores)
print(all_passed)  # True
```

检查密码时也很常用：

```python
password = "abc12345"

has_digit = any(char.isdigit() for char in password)
has_alpha = any(char.isalpha() for char in password)

if len(password) >= 8 and has_digit and has_alpha:
    print("密码格式合格")
```

## 使用场景

### 场景 1：统计成绩

```python
scores = [80, 95, 72]

print(sum(scores))
print(max(scores))
print(sum(scores) / len(scores))
```

### 场景 2：生成带序号的菜单

```python
menus = ["查看余额", "存款", "取款"]

for index, menu in enumerate(menus, start=1):
    print(f"{index}. {menu}")
```

### 场景 3：合并两组相关数据

```python
names = ["Alice", "Bob"]
ages = [18, 20]

for name, age in zip(names, ages):
    print(f"{name}: {age}")
```

### 场景 4：检查一组条件

```python
scores = [80, 75, 90]

if all(score >= 60 for score in scores):
    print("全部及格")
```

## 练习题

### 基础练习

**题目 1**：给定分数列表 `[88, 76, 95, 62]`，输出总分、最高分、最低分和平均分。

<details>
<summary>💡 查看答案</summary>

```python
scores = [88, 76, 95, 62]

total = sum(scores)
highest = max(scores)
lowest = min(scores)
average = total / len(scores)

print(f"总分: {total}")
print(f"最高分: {highest}")
print(f"最低分: {lowest}")
print(f"平均分: {average:.1f}")
```
</details>

**题目 2**：给定菜单列表 `["新增", "查询", "删除"]`，输出带序号的菜单，序号从 1 开始。

<details>
<summary>💡 查看答案</summary>

```python
menus = ["新增", "查询", "删除"]

for index, menu in enumerate(menus, start=1):
    print(f"{index}. {menu}")
```
</details>

### 进阶练习

**题目 3**：给定姓名列表 `["Alice", "Bob", "Charlie"]` 和分数列表 `[90, 85, 95]`，生成一个字典，键是姓名，值是分数。

<details>
<summary>💡 查看答案</summary>

```python
names = ["Alice", "Bob", "Charlie"]
scores = [90, 85, 95]

score_map = dict(zip(names, scores))
print(score_map)
```
</details>

### 挑战练习

**题目 4**：给定用户列表，按年龄从小到大排序，并判断是否所有用户都已成年。

```python
users = [
    {"name": "Alice", "age": 18},
    {"name": "Bob", "age": 16},
    {"name": "Charlie", "age": 22},
]
```

<details>
<summary>💡 查看答案</summary>

```python
users = [
    {"name": "Alice", "age": 18},
    {"name": "Bob", "age": 16},
    {"name": "Charlie", "age": 22},
]

sorted_users = sorted(users, key=lambda user: user["age"])
all_adults = all(user["age"] >= 18 for user in users)

print(sorted_users)
print(f"是否全部成年: {all_adults}")
```

**解析**：`sorted()` 负责排序，`all()` 负责检查所有用户是否满足同一个条件。
</details>

## 费曼学习法检验

用自己的话回答以下问题（不要看上面的内容）：

1. **这是什么**：`len()`、`sum()`、`sorted()` 分别解决什么问题？
2. **为什么需要**：为什么 `enumerate()` 通常比 `range(len(...))` 更清楚？
3. **怎么用**：向新手解释 `zip()` 如何把两组列表配对。
4. **注意事项**：`sorted()` 和列表的 `sort()` 有什么区别？`zip()` 遇到长度不同的列表会怎样？

::: tip 学习建议
这些函数不是必须一次背完。先记住它们适合解决哪类问题，写代码时再查具体参数，理解会更稳。
:::
