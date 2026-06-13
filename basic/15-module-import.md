# 模块与包

## 核心概念

模块就是一个 `.py` 文件，包就是包含多个模块的文件夹。使用模块和包，可以把代码拆分到不同文件中，避免所有代码都堆在一个文件里。

当你写：

```python
import math
```

意思是把 Python 已经提供的 `math` 模块导入当前文件，然后使用它里面的功能。

## import 语句

### 导入整个模块

```python
import math

print(math.pi)      # 3.141592653589793
print(math.sqrt(16)) # 4.0
```

### 导入特定函数

```python
from math import pi, sqrt

print(pi)      # 3.141592653589793
print(sqrt(16)) # 4.0
```

### 导入所有内容（不推荐）

```python
from math import *

print(pi)
print(sqrt(16))
```

### 使用别名

```python
import math as m
from math import sqrt as square_root

print(m.pi)
print(square_root(16))  # 4.0
```

## 模块搜索路径

Python 按以下顺序搜索模块：

1. 当前目录
2. `PYTHONPATH` 环境变量
3. 标准库目录
4. 第三方库目录

查看搜索路径：

```python
import sys
print(sys.path)
```

## `__name__` 变量

```python
# mymodule.py
def greet():
    print("Hello!")

if __name__ == "__main__":
    # 只有直接运行此文件时执行
    greet()
```

## 创建自定义模块

### 单文件模块

```python
# mymath.py
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b
```

使用：

```python
import mymath

result = mymath.add(3, 5)
```

## 包（Package）

包是包含多个模块的目录，必须有 `__init__.py` 文件。

### 目录结构

```
mypackage/
├── __init__.py
├── module1.py
└── module2.py
```

### `__init__.py`

```python
# mypackage/__init__.py
from .module1 import func1
from .module2 import func2

__all__ = ["func1", "func2"]
```

### 使用包

```python
# 方式1
import mypackage.module1
mypackage.module1.func1()

# 方式2
from mypackage import module1
module1.func1()

# 方式3
from mypackage.module1 import func1
func1()
```

## 相对导入

在包内部使用相对导入。

```python
# mypackage/module2.py
from . import module1        # 同级
from .module1 import func1   # 同级模块的函数
from .. import other_module  # 上级目录
```

## 常用内置模块

```python
import os       # 操作系统接口
import sys      # 系统参数
import math     # 数学函数
import random   # 随机数
import datetime # 日期时间
import json     # JSON 处理
import re       # 正则表达式
```

## 使用场景

### 场景 1：代码组织
大型项目模块化管理。

### 场景 2：代码复用
共享常用功能函数。

### 场景 3：命名空间隔离
避免命名冲突。

### 场景 4：第三方库使用
pandas、requests 等库的导入。

## 易错点

### 易错点 1：循环导入

❌ **错误示例**：
```python
# module_a.py
from module_b import func_b

def func_a():
    return "A"

# module_b.py
from module_a import func_a  # 循环导入

def func_b():
    return "B"

# ImportError: cannot import name 'func_a'
```

✅ **正确做法**：
```python
# 方法 1：延迟导入
# module_a.py
def func_a():
    from module_b import func_b  # 在函数内导入
    return "A"

# 方法 2：重构代码，避免循环依赖
# 将共同依赖提取到第三个模块
```

**说明**：两个模块互相导入会导致循环依赖错误。应该重构代码结构或使用局部导入。

### 易错点 2：`import *` 导入不明确

❌ **错误示例**：
```python
from math import *
from statistics import *

# 不清楚 sqrt 来自哪个模块
result = sqrt(16)
# 如果两个模块有同名函数，后导入的会覆盖前面的
```

✅ **正确做法**：
```python
# 方法 1：显式导入需要的内容
from math import sqrt, pi
from statistics import mean

# 方法 2：导入模块，使用模块名限定
import math
import statistics

result = math.sqrt(16)
```

**说明**：`import *` 会导入所有公开内容，容易造成命名冲突且难以追踪来源。明确导入更清晰。

### 易错点 3：模块名与标准库冲突

❌ **错误示例**：
```python
# 文件名: random.py
import random  # 实际上导入的是当前目录的 random.py，不是标准库

print(random.randint(1, 10))  # AttributeError
```

✅ **正确做法**：
```python
# 避免使用与标准库同名的文件名
# 将文件名改为: my_random.py 或 game_random.py

import random
print(random.randint(1, 10))
```

**说明**：Python 优先从当前目录导入模块。文件名不要与标准库模块同名，否则会覆盖标准库。

## 练习题

### 基础练习

**题目 1**：创建模块 `calculator.py`，包含加减乘除函数，并在另一个文件中导入使用。

<details>
<summary>💡 查看答案</summary>

```python
# calculator.py
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

# main.py
from calculator import add, subtract
print(add(3, 5))       # 8
print(subtract(10, 3)) # 7
```
</details>

### 进阶练习

**题目 2**：创建包结构 `mypackage/math/operations.py`，实现并导入。

<details>
<summary>💡 查看答案</summary>

```
mypackage/
├── __init__.py
└── math/
    ├── __init__.py
    └── operations.py
```

```python
# mypackage/math/operations.py
def multiply(a, b):
    return a * b

# main.py
from mypackage.math.operations import multiply
print(multiply(3, 4))  # 12
```
</details>

### 挑战练习

**题目 3**：解释 `if __name__ == "__main__":` 的作用，并举例说明使用场景。

<details>
<summary>💡 查看参考答案</summary>

`__name__` 是 Python 自动提供的变量。

- 文件被直接运行时，`__name__` 的值是 `"__main__"`。
- 文件被其他模块导入时，`__name__` 的值是模块名。

所以 `if __name__ == "__main__":` 常用来放“只有直接运行这个文件时才执行”的测试代码或入口代码，避免模块被导入时自动执行。

```python
# calculator.py
def add(a, b):
    return a + b

if __name__ == "__main__":
    print(add(3, 5))  # 只有直接运行 calculator.py 时才执行
```

```python
# main.py
from calculator import add

print(add(10, 20))
```

运行 `python calculator.py` 时会输出测试结果；运行 `python main.py` 时只会使用 `add()`，不会自动执行 `calculator.py` 里的测试代码。
</details>

## 费曼学习法检验

1. **这是什么**：模块和包有什么区别？`__init__.py` 的作用是什么？

2. **为什么需要**：为什么不推荐 `from module import *`？

3. **怎么用**：向新手解释相对导入和绝对导入的区别？

4. **注意事项**：循环导入是什么？如何避免？

::: tip 学习建议
模块化是大型项目的基础！理解导入机制和包结构很重要。
:::
