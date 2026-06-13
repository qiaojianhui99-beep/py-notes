# 常用标准库

## 核心概念

标准库是 Python 自带的一组模块。安装 Python 后就可以直接使用，不需要额外安装。

Python 常被称为“自带电池”的语言，因为标准库已经提供了很多常用能力，比如文件系统、日期时间、数学计算、随机数和 JSON 处理。

使用标准库的一般步骤：

```python
import math

print(math.sqrt(16))
```

## os 模块

`os` 用于和操作系统交互。

```python
import os

print(os.getcwd())      # 当前工作目录
print(os.listdir("."))  # 当前目录内容
```

常用操作：

```python
import os

os.path.exists("data.txt")
os.path.isfile("data.txt")
os.path.isdir("docs")
os.path.join("docs", "index.md")
```

创建和删除文件目录时要谨慎：

```python
import os

os.mkdir("new_folder")
# os.remove("old.txt")
# os.rmdir("empty_folder")
```

## sys 模块

`sys` 提供和 Python 运行环境相关的信息。

```python
import sys

print(sys.version)
print(sys.platform)
print(sys.path)
```

命令行参数：

```python
import sys

print(sys.argv)
```

当你运行 `python app.py hello` 时，`sys.argv` 中会包含脚本名和参数。

## datetime 模块

`datetime` 用于处理日期和时间。

```python
from datetime import date, datetime, timedelta

today = date.today()
now = datetime.now()

print(today)
print(now)
```

日期计算：

```python
from datetime import date, timedelta

today = date.today()
next_week = today + timedelta(days=7)

print(next_week)
```

格式化时间：

```python
from datetime import datetime

now = datetime.now()
print(now.strftime("%Y-%m-%d %H:%M:%S"))
```

## math 模块

`math` 提供常用数学函数。

```python
import math

print(math.pi)
print(math.sqrt(16))
print(math.ceil(3.2))
print(math.floor(3.8))
```

注意：`math.pow(2, 3)` 返回浮点数，普通幂运算 `2 ** 3` 更常用。

## random 模块

`random` 用于生成随机数。

```python
import random

print(random.random())      # 0 到 1 之间的随机小数
print(random.randint(1, 6)) # 1 到 6 之间的随机整数
```

随机选择：

```python
import random

names = ["Alice", "Bob", "Charlie"]
print(random.choice(names))
```

打乱列表：

```python
import random

numbers = [1, 2, 3, 4, 5]
random.shuffle(numbers)
print(numbers)
```

## json 模块

JSON 是常见的数据交换格式，写法类似 Python 字典和列表。

```python
import json

user = {"name": "Alice", "age": 18}
text = json.dumps(user, ensure_ascii=False)

print(text)
```

JSON 字符串转 Python 对象：

```python
import json

text = '{"name": "Alice", "age": 18}'
user = json.loads(text)

print(user["name"])
```

写入 JSON 文件：

```python
import json

user = {"name": "Alice", "age": 18}

with open("user.json", "w", encoding="utf-8") as f:
    json.dump(user, f, ensure_ascii=False, indent=2)
```

读取 JSON 文件：

```python
import json

with open("user.json", "r", encoding="utf-8") as f:
    user = json.load(f)

print(user)
```

## 使用场景

### 场景 1：处理路径和目录

```python
import os

path = os.path.join("data", "users.txt")
```

### 场景 2：记录当前时间

```python
from datetime import datetime

print(datetime.now())
```

### 场景 3：生成随机结果

```python
import random

print(random.randint(1, 100))
```

### 场景 4：保存结构化数据

```python
import json

data = {"theme": "dark"}
text = json.dumps(data)
```

## 易错点

### 易错点 1：路径拼接使用字符串而不是 `os.path.join`

❌ **错误示例**：
```python
# Windows 上使用反斜杠
path = "data\\users.txt"  # Linux/Mac 上会出错

# 或者使用正斜杠
path = "data/users.txt"  # Windows 上可能有兼容性问题
```

✅ **正确做法**：
```python
import os

# 使用 os.path.join 自动处理路径分隔符
path = os.path.join("data", "users.txt")
# Windows: data\users.txt
# Linux/Mac: data/users.txt
```

**说明**：不同操作系统的路径分隔符不同。使用 `os.path.join()` 可以自动处理，保证跨平台兼容。

### 易错点 2：`random.seed()` 的作用误解

❌ **错误理解**：
```python
import random

random.seed(42)
print(random.randint(1, 10))  # 每次运行结果相同
print(random.randint(1, 10))  # 但这次的结果与上次不同
```

✅ **正确理解**：
```python
import random

# seed 确保序列可重现，但序列内的值仍然不同
random.seed(42)
print(random.randint(1, 10))  # 例如：2
print(random.randint(1, 10))  # 例如：7

# 重新设置相同的 seed，序列会重复
random.seed(42)
print(random.randint(1, 10))  # 2（与第一次相同）
print(random.randint(1, 10))  # 7（与第二次相同）
```

**说明**：`random.seed()` 设置随机数生成器的种子，使随机序列可重现，但序列中的每个数仍然不同。

### 易错点 3：`json.dump()` 和 `json.dumps()` 混淆

❌ **错误示例**：
```python
import json

data = {"name": "Alice"}

# 想写入文件，但用了 dumps
text = json.dumps(data)  # 返回字符串
# 还需要手动写入文件

# 或者想转字符串，但用了 dump
json.dump(data)  # TypeError: 缺少文件参数
```

✅ **正确做法**：
```python
import json

data = {"name": "Alice"}

# dumps：转为字符串
text = json.dumps(data)
print(text)  # '{"name": "Alice"}'

# dump：直接写入文件
with open("data.json", "w") as f:
    json.dump(data, f)
```

**说明**：`dumps()` 返回字符串（dump string），`dump()` 直接写入文件对象。记住：多一个 `s` 表示字符串。

## 练习题

### 基础练习

**题目 1**：使用 `datetime` 输出今天的日期，以及 7 天后的日期。

<details>
<summary>💡 查看答案</summary>

```python
from datetime import date, timedelta

today = date.today()
next_week = today + timedelta(days=7)

print(today)
print(next_week)
```
</details>

**题目 2**：生成 10 个 1 到 100 之间的随机整数。

<details>
<summary>💡 查看答案</summary>

```python
import random

numbers = []

for i in range(10):
    numbers.append(random.randint(1, 100))

print(numbers)
```
</details>

### 进阶练习

**题目 3**：把字典 `{"name": "Alice", "age": 18}` 写入 `user.json`，再读取出来。

<details>
<summary>💡 查看答案</summary>

```python
import json

user = {"name": "Alice", "age": 18}

with open("user.json", "w", encoding="utf-8") as f:
    json.dump(user, f, ensure_ascii=False, indent=2)

with open("user.json", "r", encoding="utf-8") as f:
    loaded_user = json.load(f)

print(loaded_user)
```
</details>

### 挑战练习

**题目 4**：模拟掷骰子 20 次，统计每个点数出现的次数。

<details>
<summary>💡 查看答案</summary>

```python
import random

counter = {}

for i in range(20):
    point = random.randint(1, 6)
    counter[point] = counter.get(point, 0) + 1

print(counter)
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：标准库和第三方库有什么区别？
2. **为什么需要**：为什么优先使用标准库，而不是自己从零写所有功能？
3. **怎么用**：导入模块后，如何调用模块里的函数？
4. **注意事项**：`random` 适合普通随机，为什么不适合安全敏感场景？

::: tip 学习建议
标准库不需要背完。先记住常用模块名，遇到日期、路径、随机数、JSON 时知道去查对应模块即可。
:::
