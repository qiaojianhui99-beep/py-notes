# 变量与数据类型

## 变量赋值

Python 是动态类型语言，无需声明类型。

```python
x = 10
name = "Alice"
is_active = True
```

## 基本数据类型

### 1. 整数（int）

```python
num = 100
negative = -50
```

### 2. 浮点数（float）

```python
pi = 3.14
scientific = 1.5e2  # 150.0
```

### 3. 布尔值（bool）

```python
is_valid = True
is_empty = False
```

### 4. 字符串（str）

```python
name = "Alice"
message = '单引号也可以'
multi_line = """多行
字符串"""
```

### 5. 空值（None）

```python
result = None
```

## 类型转换

```python
# 转整数
int("123")      # 123
int(3.14)       # 3

# 转浮点数
float("3.14")   # 3.14
float(10)       # 10.0

# 转字符串
str(123)        # "123"
str(3.14)       # "3.14"

# 转布尔值
bool(0)         # False
bool(1)         # True
bool("")        # False
```

## 类型检查

```python
x = 10
print(type(x))              # <class 'int'>
print(isinstance(x, int))   # True
```

## 类型注解（Type Hints）

```python
# Python 3.14 推荐写法
name: str = "Alice"
age: int = 25
scores: list[int] = [90, 85, 88]
data: dict[str, int] = {"age": 25}

# 联合类型（Python 3.10+）
def process(value: int | str) -> None:
    print(value)

# 旧版本写法（Python 3.9-）
from typing import Union, List, Dict

def process_old(value: Union[int, str]) -> None:
    print(value)

scores_old: List[int] = [90, 85, 88]
data_old: Dict[str, int] = {"age": 25}
```
