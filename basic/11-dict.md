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
