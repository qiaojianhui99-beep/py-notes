# 字典（dict）

## 核心概念

字典用来保存“键-值”对应关系。通过键可以快速找到对应的值。

```python
person = {
    "name": "Alice",
    "age": 18
}

print(person["name"])  # Alice
```

列表适合按位置找数据，字典适合按名字找数据。

## 字典创建

```python
empty = {}

person = {
    "name": "Alice",
    "age": 18,
    "city": "Beijing"
}
```

也可以使用 `dict()`：

```python
person = dict(name="Bob", age=20)
print(person)
```

字典的键通常使用字符串，也可以使用数字、元组等不可变对象。

## 访问元素

使用键访问值：

```python
person = {"name": "Alice", "age": 18}

print(person["name"])  # Alice
```

如果键不存在，直接访问会报错：

```python
# print(person["city"])  # KeyError
```

更安全的方式是使用 `get()`：

```python
print(person.get("city"))          # None
print(person.get("city", "未知"))  # 未知
```

## 修改和添加

```python
person = {"name": "Alice"}

person["name"] = "Bob"
person["age"] = 20

print(person)
```

如果键已经存在，就是修改；如果键不存在，就是新增。

## 删除元素

```python
person = {"name": "Alice", "age": 18, "city": "Beijing"}

del person["city"]
print(person)

age = person.pop("age")
print(age)
print(person)
```

清空字典：

```python
person.clear()
print(person)  # {}
```

## 常用方法

```python
person = {"name": "Alice", "age": 18}

print(person.keys())    # 所有键
print(person.values())  # 所有值
print(person.items())   # 所有键值对
```

检查键是否存在：

```python
person = {"name": "Alice", "age": 18}

print("name" in person)  # True
print("city" in person)  # False
```

## 遍历字典

遍历键：

```python
person = {"name": "Alice", "age": 18}

for key in person:
    print(key)
```

遍历键和值：

```python
person = {"name": "Alice", "age": 18}

for key, value in person.items():
    print(f"{key}: {value}")
```

## 更新字典

```python
person = {"name": "Alice"}
person.update({"age": 18, "city": "Beijing"})

print(person)
```

`update()` 会把另一个字典中的键值对合并进来。相同键会被新值覆盖。

## 嵌套字典

字典的值也可以是另一个字典。

```python
students = {
    "Alice": {"age": 18, "score": 95},
    "Bob": {"age": 19, "score": 88}
}

print(students["Alice"]["score"])  # 95
```

嵌套字典适合表示结构化数据，但层级太深会降低可读性。

## 字典推导式

字典推导式可以生成新字典。

```python
squares = {}

for number in range(1, 6):
    squares[number] = number ** 2

print(squares)
```

可以简写为：

```python
squares = {number: number ** 2 for number in range(1, 6)}
print(squares)
```

初学时先掌握普通循环写法，再使用推导式。

## 使用场景

### 场景 1：保存用户信息

```python
user = {"name": "Alice", "age": 18}
```

### 场景 2：统计次数

```python
text = "hello"
counter = {}

for char in text:
    counter[char] = counter.get(char, 0) + 1
```

### 场景 3：保存配置

```python
config = {"theme": "dark", "language": "zh-CN"}
```

### 场景 4：根据编号查找名称

```python
status = {200: "成功", 404: "未找到"}
print(status.get(200))
```

## 练习题

### 基础练习

**题目 1**：创建一个字典保存姓名、年龄、城市，并逐项输出。

<details>
<summary>💡 查看答案</summary>

```python
person = {
    "name": "Alice",
    "age": 18,
    "city": "Beijing"
}

for key, value in person.items():
    print(f"{key}: {value}")
```
</details>

**题目 2**：统计字符串 `"hello world"` 中每个非空格字符出现的次数。

<details>
<summary>💡 查看答案</summary>

```python
text = "hello world"
counter = {}

for char in text:
    if char != " ":
        counter[char] = counter.get(char, 0) + 1

print(counter)
```
</details>

### 进阶练习

**题目 3**：合并两个字典，相同键的值相加。

<details>
<summary>💡 查看答案</summary>

```python
d1 = {"apple": 3, "banana": 2}
d2 = {"banana": 4, "orange": 5}

result = d1.copy()

for key, value in d2.items():
    result[key] = result.get(key, 0) + value

print(result)
```
</details>

### 挑战练习

**题目 4**：用字典保存商品库存，完成一次入库和一次出库，并输出最终库存。

<details>
<summary>💡 查看答案</summary>

```python
stock = {
    "apple": 10,
    "banana": 5
}

# apple 入库 3 个
stock["apple"] = stock.get("apple", 0) + 3

# banana 出库 2 个
stock["banana"] = stock.get("banana", 0) - 2

for name, count in stock.items():
    print(f"{name}: {count}")
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：字典是什么？键和值分别是什么？
2. **为什么需要**：什么时候用字典比用列表更合适？
3. **怎么用**：`dict.get(key, default)` 有什么作用？
4. **注意事项**：为什么访问不存在的键可能会报错？

::: tip 学习建议
字典的核心是“通过键找值”。只要数据天然是一一对应关系，就优先考虑字典。
:::
