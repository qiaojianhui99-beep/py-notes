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

## 使用场景

### 场景 1：用户输入处理
Web 表单、命令行工具接收用户输入时，需要类型转换和验证。

```python
age = int(input("请输入年龄: "))
if age >= 18:
    print("成年人")
```

### 场景 2：配置文件读取
读取 JSON、YAML 配置文件时，需要确保数据类型正确。

```python
config = {"timeout": "30", "retry": "3"}
timeout: int = int(config["timeout"])
retry: int = int(config["retry"])
```

### 场景 3：数据分析
处理 CSV、数据库数据时，需要类型转换。

```python
# CSV 读取的都是字符串
price_str = "99.99"
price = float(price_str)
total = price * 2
```

### 场景 4：API 接口开发
使用类型注解提高代码可读性和 IDE 提示。

```python
def create_user(name: str, age: int, email: str) -> dict[str, str | int]:
    return {"name": name, "age": age, "email": email}
```

## 练习题

### 基础练习

**题目 1**：编写程序，输入圆的半径，输出圆的面积（保留 2 位小数）。

<details>
<summary>💡 查看答案</summary>

```python
import math

radius = float(input("请输入半径: "))
area = math.pi * radius ** 2
print(f"圆的面积是: {area:.2f}")
```

**解析**：使用 `float()` 转换输入，`math.pi` 获取 π 值，f-string 的 `:.2f` 格式化保留 2 位小数。
</details>

**题目 2**：判断变量 `x = "123"` 是否可以转换为整数，如果可以则输出转换后的值加 10。

<details>
<summary>💡 查看答案</summary>

```python
x = "123"
if x.isdigit():
    result = int(x) + 10
    print(result)  # 133
```

**解析**：使用 `isdigit()` 方法检查字符串是否全为数字，然后再转换。
</details>

### 进阶练习

**题目 3**：编写函数 `safe_divide(a: str, b: str) -> float | None`，接收两个字符串，转换为数字后相除。如果转换失败或除数为 0，返回 `None`。

<details>
<summary>💡 查看答案</summary>

```python
def safe_divide(a: str, b: str) -> float | None:
    try:
        num_a = float(a)
        num_b = float(b)
        if num_b == 0:
            return None
        return num_a / num_b
    except ValueError:
        return None

# 测试
print(safe_divide("10", "2"))    # 5.0
print(safe_divide("10", "0"))    # None
print(safe_divide("abc", "2"))   # None
```

**解析**：使用 `try-except` 捕获转换异常，检查除数是否为 0。
</details>

### 挑战练习

**题目 4**：实现一个类型检测工具函数 `detect_type(value: str)`，自动检测字符串应该转换为什么类型（int、float、bool 或保持 str），并返回转换后的值。

<details>
<summary>💡 查看提示</summary>

- 纯数字 → int
- 小数 → float  
- "true"/"false" → bool
- 其他 → str
</details>

## 费曼学习法检验

用自己的话回答以下问题（不要看上面的内容）：

1. **这是什么**：变量和数据类型是什么？为什么需要不同的数据类型？

2. **为什么需要**：如果所有数据都用字符串存储会有什么问题？类型转换解决了什么问题？

3. **怎么用**：向一个从未编程的人解释，如何把用户输入的"18"变成数字 18 并判断是否成年？

4. **注意事项**：`int("3.14")` 会发生什么？`float("abc")` 呢？如何避免程序崩溃？

::: tip 学习建议
如果上面 4 个问题你都能流畅回答，说明你已经真正掌握了本章内容！尝试向朋友讲解一遍，是检验理解最好的方法。
:::
