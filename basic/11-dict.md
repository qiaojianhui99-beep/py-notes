# 字典（dict）

## 字典创建

```python
# 空字典
empty = {}
d = dict()

# 包含键值对
person = {
    "name": "Alice",
    "age": 25,
    "city": "Beijing"
}

# 使用 dict()
d = dict(name="Bob", age=30)
```

## 访问元素

```python
person = {"name": "Alice", "age": 25}

# 使用键访问
person["name"]  # 'Alice'

# get() 方法（更安全）
person.get("name")        # 'Alice'
person.get("gender", "未知")  # '未知' (提供默认值)
```

## 修改和添加

```python
person = {"name": "Alice"}

# 修改
person["name"] = "Bob"

# 添加
person["age"] = 25
```

## 删除元素

```python
person = {"name": "Alice", "age": 25, "city": "Beijing"}

# del 删除指定键
del person["city"]

# pop() 删除并返回值
age = person.pop("age")  # 25

# clear() 清空字典
person.clear()
```

## 常用方法

### 获取键、值、键值对

```python
person = {"name": "Alice", "age": 25}

person.keys()    # dict_keys(['name', 'age'])
person.values()  # dict_values(['Alice', 25])
person.items()   # dict_items([('name', 'Alice'), ('age', 25)])
```

### 遍历字典

```python
person = {"name": "Alice", "age": 25}

# 遍历键
for key in person:
    print(key)

# 遍历键值对
for key, value in person.items():
    print(f"{key}: {value}")
```

### 更新字典

```python
person = {"name": "Alice"}
person.update({"age": 25, "city": "Beijing"})
# {'name': 'Alice', 'age': 25, 'city': 'Beijing'}
```

### 检查键是否存在

```python
person = {"name": "Alice"}

"name" in person   # True
"age" in person    # False
```

## 字典推导式

```python
# 基本形式
squares = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# 带条件
evens = {x: x**2 for x in range(10) if x % 2 == 0}

# 交换键值
original = {"a": 1, "b": 2}
swapped = {v: k for k, v in original.items()}
# {1: 'a', 2: 'b'}
```

## 嵌套字典

```python
students = {
    "Alice": {"age": 20, "grade": "A"},
    "Bob": {"age": 22, "grade": "B"}
}

students["Alice"]["age"]  # 20
```

## 使用场景

### 场景 1：配置管理
应用配置、用户设置。

### 场景 2：数据映射
ID 到对象、缓存数据。

### 场景 3：计数统计
词频统计、分组聚合。

### 场景 4：JSON 数据处理
API 响应、配置文件。

## 练习题

### 基础练习

**题目 1**：创建字典存储三个学生的姓名和分数，输出分数最高的学生。

<details>
<summary>💡 查看答案</summary>

```python
students = {"Alice": 90, "Bob": 85, "Charlie": 95}
top_student = max(students, key=students.get)
print(f"{top_student}: {students[top_student]}")
```
</details>

**题目 2**：统计字符串 "hello world" 中每个字符出现的次数。

<details>
<summary>💡 查看答案</summary>

```python
s = "hello world"
count = {}
for char in s:
    if char != " ":
        count[char] = count.get(char, 0) + 1
print(count)
```
</details>

### 进阶练习

**题目 3**：合并两个字典，相同键的值相加。

<details>
<summary>💡 查看答案</summary>

```python
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}
result = d1.copy()
for k, v in d2.items():
    result[k] = result.get(k, 0) + v
print(result)  # {'a': 1, 'b': 5, 'c': 4}
```
</details>

### 挑战练习

**题目 4**：实现 LRU 缓存（最近最少使用），使用字典存储，限制容量。

## 费曼学习法检验

1. **这是什么**：字典的键为什么必须是不可变对象？

2. **为什么需要**：字典查找为什么比列表快？时间复杂度是多少？

3. **怎么用**：向新手解释 `dict.get(key, default)` 比 `dict[key]` 好在哪？

4. **注意事项**：遍历字典时能修改字典吗？会发生什么？

::: tip 学习建议
字典是 Python 最强大的数据结构！掌握增删改查和推导式，理解哈希原理。
:::
