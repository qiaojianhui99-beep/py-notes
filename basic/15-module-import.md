# 模块与包

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
import numpy as np
from math import sqrt as square_root

square_root(16)  # 4.0
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
