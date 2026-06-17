# 类型提示进阶

深入 typing 模块，编写类型安全的代码。

## 泛型（Generic）

### TypeVar

```python
from typing import TypeVar, List

T = TypeVar('T')

def first(items: List[T]) -> T:
    return items[0]

# 类型推断
num = first([1, 2, 3])      # T = int
name = first(['a', 'b'])    # T = str
```

### 泛型类

```python
from typing import Generic, TypeVar

T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self):
        self.items: List[T] = []
    
    def push(self, item: T) -> None:
        self.items.append(item)
    
    def pop(self) -> T:
        return self.items.pop()

stack: Stack[int] = Stack()
stack.push(1)
```

## Protocol（协议）

鸭子类型的类型提示。

```python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None:
        ...

def render(obj: Drawable) -> None:
    obj.draw()

class Circle:
    def draw(self) -> None:
        print("画圆")

render(Circle())  # OK，只要有 draw 方法
```

## 联合类型

```python
from typing import Union

# Python 3.10+ 推荐
def process(value: int | str) -> str:
    return str(value)

# Python 3.9-
def process_old(value: Union[int, str]) -> str:
    return str(value)
```

## Optional 和 None

```python
from typing import Optional

# Optional[T] 等价于 T | None
def find_user(id: int) -> Optional[str]:
    if id > 0:
        return "Alice"
    return None
```

## Callable

```python
from typing import Callable

def execute(func: Callable[[int, int], int]) -> int:
    return func(1, 2)

def add(a: int, b: int) -> int:
    return a + b

result = execute(add)
```

## TypedDict

```python
from typing import TypedDict

class UserDict(TypedDict):
    name: str
    age: int
    email: str

def create_user(data: UserDict) -> None:
    print(data['name'])

user: UserDict = {
    'name': 'Alice',
    'age': 25,
    'email': 'alice@example.com'
}
```

## Literal

```python
from typing import Literal

def set_mode(mode: Literal['read', 'write', 'append']) -> None:
    print(f"模式: {mode}")

set_mode('read')   # OK
# set_mode('delete')  # 类型错误
```

## 使用场景

### 场景 1：API 设计
明确函数签名，提高可维护性。

### 场景 2：IDE 支持
获得更好的代码补全和错误提示。

### 场景 3：静态类型检查
使用 mypy 等工具检查类型。

### 场景 4：文档生成
类型提示即文档。

## 易错点

### 易错点 1：把类型提示当成运行时检查

❌ **错误示例**：
```python
def add(a: int, b: int) -> int:
    return a + b

add("hello", "world")   # 运行时不会报错，照常执行
add(1, "2")             # TypeError——但不是因为类型提示报的，是 + 报的
```

✅ **正确理解**：
```python
# 类型提示只是给 IDE / mypy / pyright 看的"静态文档"
# Python 解释器完全无视，运行时不做任何类型校验

# 运行时强制校验需要：
# 1. 用 mypy / pyright 静态检查
#    $ mypy your_code.py
# 2. 或运行时用 pydantic / typeguard 显式校验
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float

Item(name="x", price="10")  # pydantic 帮你转换字符串 '10' 为 float
Item(name="x", price="abc") # ValidationError：运行时拒绝
```

**说明**：类型提示是**静态注释**，运行时完全不影响。你给 `int` 类型的参数传字符串，Python 不会拦。要真正的类型保护，要么 CI 里跑 mypy / pyright 静态分析，要么用 pydantic / typeguard 在运行时校验。

### 易错点 2：把可变对象当默认值或泛型参数共享

❌ **错误示例**：
```python
from typing import List

# 想表达"返回一个空列表"
def get_items() -> List[int]:
    return []

# 想定义"list[T]"类型时用了 List 实例
x: List[int] = []
x.append("hi")  # mypy 可能不会报（取决于配置），运行时不报
```

✅ **正确做法**：
```python
# Python 3.9+ 内置泛型，可以直接用 list/dict/tuple
def get_items() -> list[int]:
    return []

x: list[int] = []

# Python 3.9- 用 typing.List 等（小写 list 不支持泛型）
from typing import List
def get_items() -> List[int]:
    return []

# 注意：默认参数用 None + 类型提示 Optional
from typing import Optional

def process(items: Optional[list[int]] = None):
    if items is None:
        items = []
```

**说明**：Python 3.9+ 起，`list[int]`、`dict[str, int]` 可以直接作为类型注解，不用从 `typing` 导入大写版本。`typing.List` 等大写形式是 3.9 之前的写法，新代码应该用小写。但默认参数的可变陷阱依旧存在——配合类型提示时记得用 `None` 当哨兵。

### 易错点 3：`Callable` 参数类型描述方式过时

❌ **错误示例**：
```python
from typing import Callable

# 用 Callable[[int, int], int] 描述"接收两个 int 返回 int"
def apply(func: Callable[[int, int], int]) -> int:
    return func(1, 2)

# 但用 any() / **kwargs 的函数，类型就难描述
def my_func(*args, **kwargs): pass
# 旧式 Callable 没法表达 "接收任意参数"
```

✅ **正确做法**：
```python
# Python 3.10+：用 Ellipsis 表示"任意参数"
def apply(func: Callable[..., int]) -> int:
    return func()

# Python 3.12+：直接用函数定义语法描述类型（Type Parameter Syntax）
# def apply[T](func: Callable[[T], T]) -> T: ...

# 用 ParamSpec 描述"原样转发参数"
from typing import Callable, ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")

def log_and_call(func: Callable[P, R]) -> Callable[P, R]:
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"调用 {func.__name__}")
        return func(*args, **kwargs)
    return wrapper
```

**说明**：`Callable[[Arg1, Arg2], Return]` 是描述函数类型的经典方式。但有两个常见坑：参数列表只能描述固定的位置参数，`*args`/`**kwargs` 用 `Callable[..., R]` 表示"任意参数，返回 R"。要做"装饰器转发原函数签名"必须用 `ParamSpec`（3.10+）才能保住类型信息。否则装饰后的函数签名变成 `(*args, **kwargs)`，mypy 看不出原函数的参数约束。

## 练习题

### 基础练习

**题目 1**：定义泛型函数 `reverse`，反转任意类型的列表。

<details>
<summary>💡 查看答案</summary>

```python
from typing import TypeVar, List

T = TypeVar('T')

def reverse(items: List[T]) -> List[T]:
    return items[::-1]

print(reverse([1, 2, 3]))     # [3, 2, 1]
print(reverse(['a', 'b']))    # ['b', 'a']
```
</details>

### 进阶练习

**题目 2**：定义 Protocol，要求对象有 `read()` 和 `write()` 方法。

### 挑战练习

**题目 3**：使用 TypedDict 定义嵌套的配置结构。

## 费曼学习法检验

1. **这是什么**：TypeVar 和泛型的关系是什么？

2. **为什么需要**：类型提示是运行时检查还是静态检查？

3. **怎么用**：向新手解释 Protocol 和 ABC 的区别？

4. **注意事项**：过度使用类型提示有什么问题？

::: tip 学习建议
类型提示让 Python 既灵活又安全！结合 mypy 使用效果更佳。
:::
