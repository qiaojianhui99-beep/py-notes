# 版本差异对照

本文档汇总 Python 3.10+ 引入的新语法与旧版本的对比。

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

### 1. 异常组 ExceptionGroup

```python
# Python 3.11+
try:
    raise ExceptionGroup("错误组", [
        ValueError("错误1"),
        TypeError("错误2")
    ])
except* ValueError as e:
    print("处理 ValueError")
except* TypeError as e:
    print("处理 TypeError")
```

### 2. tomllib 模块

```python
# Python 3.11+ (内置)
import tomllib

# Python 3.10- (需要安装 tomli)
import tomli
```

### 3. 异常合并

```python
# Python 3.11+
try:
    pass
except ValueError | TypeError as e:
    print(e)

# Python 3.10-
try:
    pass
except (ValueError, TypeError) as e:
    print(e)
```

## Python 3.12

### 1. f-string 改进

```python
# Python 3.12+ 支持调试信息
x = 10
print(f"{x = }")  # x = 10
print(f"{sum([1,2,3]) = }")  # sum([1,2,3]) = 6
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
