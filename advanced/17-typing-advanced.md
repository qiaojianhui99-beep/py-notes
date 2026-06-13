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

### 易错点 1：待补充

❌ **错误示例**：
```python
# 待补充
```

✅ **正确做法**：
```python
# 待补充
```

**说明**：待补充

### 易错点 2：待补充

❌ **错误示例**：
```python
# 待补充
```

✅ **正确做法**：
```python
# 待补充
```

**说明**：待补充

### 易错点 3：待补充

❌ **错误示例**：
```python
# 待补充
```

✅ **正确做法**：
```python
# 待补充
```

**说明**：待补充

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
