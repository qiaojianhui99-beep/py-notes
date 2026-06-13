# 版本差异对照

## 核心概念

Python 会持续发布新版本。新版本会带来更简洁的语法、更好的性能和新的标准库能力。

学习版本差异不是为了追新，而是为了知道：

- 当前项目能使用哪些语法。
- 阅读旧代码时为什么写法不同。
- 团队协作时为什么要统一 Python 版本。

## Python 3.10

### 1. 联合类型 `|`

```python
# Python 3.10+
def process(value: int | str) -> int | None:
    return int(value) if value else None

# Python 3.9-
from typing import Union, Optional

def process(value: Union[int, str]) -> Optional[int]:
    return int(value) if value else None
```

### 2. match-case 语句

```python
# Python 3.10+
def http_status(code):
    match code:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case _:
            return "Unknown"

# Python 3.9-
def http_status(code):
    if code == 200:
        return "OK"
    elif code == 404:
        return "Not Found"
    else:
        return "Unknown"
```

## Python 3.11

### 1. 更清晰的错误提示

Python 3.11 改进了错误定位。很多语法错误和运行时错误会指出更具体的位置，阅读报错时更容易找到问题表达式。

学习建议：遇到报错时，先看最后一行的异常类型，再回到箭头或行号指向的位置。

### 2. tomllib 模块

```python
# Python 3.11+ (内置)
import tomllib

# Python 3.10- (需要安装 tomli)
import tomli
```

### 3. 多异常捕获仍使用元组

Python 3.11 对异常提示做了大量改进，很多报错会指出更精确的位置。对初学者来说，这能更快定位哪一段表达式出了问题。

捕获多个普通异常时，仍然推荐使用元组写法：

```python
try:
    number = int("abc")
except (ValueError, TypeError) as e:
    print(e)
```

## Python 3.12

### 1. f-string 改进

```python
# Python 3.8+ 就已支持 = 调试语法
x = 10
print(f"{x = }")  # x = 10
print(f"{sum([1,2,3]) = }")  # sum([1,2,3]) = 6

# Python 3.12 新增：支持内联表达式的多行和反斜杠
text = f"""结果: {
    1 + 2 + 3
}"""
```

### 2. 类型参数语法

```python
# Python 3.12+
def first[T](items: list[T]) -> T | None:
    return items[0] if items else None

# Python 3.11-
from typing import TypeVar

T = TypeVar('T')
def first(items: list[T]) -> T | None:
    return items[0] if items else None
```

## Python 3.13+

### 1. 更好的 REPL

- 多行编辑
- 彩色输出
- 自动补全改进

### 2. 实验性 Free-threaded 模式

```bash
# 编译时启用
python3.13t script.py
```

## 版本兼容建议

如果需要兼容旧版本：

```python
import sys

# 检查 Python 版本
if sys.version_info >= (3, 10):
    # 使用 3.10+ 特性
    def func(x: int | str):
        pass
else:
    # 兼容旧版本
    from typing import Union
    def func(x: Union[int, str]):
        pass
```

## 使用场景

### 场景 1：新项目开发
使用最新语法特性提高效率。

### 场景 2：老项目维护
理解旧版本代码，逐步迁移。

### 场景 3：团队协作
统一版本，避免兼容性问题。

### 场景 4：库开发
考虑向后兼容性。

## 易错点

### 易错点 1：Python 2 的 `print` 语句与 Python 3 的 `print()` 函数

❌ **错误示例**（Python 2 语法在 Python 3 中报错）：
```python
print "Hello"  # SyntaxError in Python 3
```

✅ **正确做法**（Python 3）：
```python
print("Hello")  # 必须使用函数形式
```

**说明**：Python 2 的 `print` 是语句，Python 3 改为函数。这是最明显的区别。

### 易错点 2：`/` 除法行为不同

❌ **容易混淆**：
```python
# Python 2: / 是整除（对整数）
print(5 / 2)  # 2

# Python 3: / 是真除法
print(5 / 2)  # 2.5
```

✅ **正确理解**：
```python
# Python 3
print(5 / 2)   # 2.5 (真除法)
print(5 // 2)  # 2 (整除)

# 如果需要跨版本兼容，总是使用 //
```

**说明**：Python 3 的 `/` 总是返回浮点数，`//` 才是整除。Python 2 的 `/` 对整数是整除，对浮点数是真除法。

### 易错点 3：使用过时的类型注解语法

❌ **旧语法**（Python 3.9 之前）：
```python
from typing import List, Dict, Union

def process(items: List[int]) -> Dict[str, Union[int, str]]:
    pass
```

✅ **新语法**（Python 3.10+）：
```python
def process(items: list[int]) -> dict[str, int | str]:
    pass
```

**说明**：Python 3.10+ 支持使用内置类型和 `|` 运算符简化类型注解。旧代码仍然有效，但新代码推荐使用新语法。

## 练习题

### 基础练习

**题目 1**：将以下代码改写为 Python 3.10+ 语法：
```python
from typing import Union
def process(x: Union[int, str]) -> Union[int, None]:
    pass
```

<details>
<summary>💡 查看答案</summary>

```python
def process(x: int | str) -> int | None:
    pass
```
</details>

### 进阶练习

**题目 2**：用 match-case 重写多个 if-elif 判断 HTTP 状态码的代码。

<details>
<summary>💡 查看答案</summary>

```python
# Python 3.10+
def handle_status(code):
    match code:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case _:
            return "Unknown"

# Python 3.9-
def handle_status_old(code):
    if code == 200:
        return "OK"
    elif code == 404:
        return "Not Found"
    elif code == 500:
        return "Server Error"
    else:
        return "Unknown"
```
</details>

### 挑战练习

**题目 3**：为一个新项目写一段版本选择说明：说明为什么选择 Python 3.14，以及如果团队有人使用旧版本会遇到什么问题。

<details>
<summary>💡 查看参考答案</summary>

本项目选择 Python 3.14，因为它可以使用现代类型注解、`match-case`、更新的标准库和更好的错误提示。团队应统一 Python 版本，否则旧版本可能无法运行新语法，例如 `int | str` 或 `match-case`。如果必须兼容旧版本，需要在文档中明确最低支持版本，并避免使用超过该版本的语法。
</details>

## 费曼学习法检验

1. **这是什么**：Python 为什么要不断更新语法？旧代码会失效吗？

2. **为什么需要**：match-case 比 if-elif 好在哪里？什么场景下更适合？

3. **怎么用**：向新手解释如何查看当前 Python 版本并选择合适的语法？

4. **注意事项**：如何在项目中平衡使用新特性和保持兼容性？

::: tip 学习建议
了解版本差异避免踩坑！新特性让代码更简洁，但要考虑团队环境。
:::

