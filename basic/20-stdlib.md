# 常用标准库

## os 模块

操作系统接口。

```python
import os

# 当前目录
os.getcwd()

# 列出目录
os.listdir(".")

# 创建目录
os.mkdir("new_folder")
os.makedirs("path/to/folder")

# 删除
os.remove("file.txt")
os.rmdir("folder")

# 重命名
os.rename("old.txt", "new.txt")

# 路径操作
os.path.join("dir", "file.txt")
os.path.exists("file.txt")
os.path.isfile("file.txt")
os.path.isdir("folder")
os.path.getsize("file.txt")
```

## sys 模块

系统参数和函数。

```python
import sys

# Python 版本
print(sys.version)

# 命令行参数
print(sys.argv)

# 退出程序
sys.exit(0)

# 模块搜索路径
print(sys.path)
```

## datetime 模块

日期和时间。

```python
from datetime import datetime, date, time, timedelta

# 当前时间
now = datetime.now()
print(now)  # 2024-06-11 10:30:00

# 当前日期
today = date.today()
print(today)  # 2024-06-11

# 创建日期时间
dt = datetime(2024, 6, 11, 10, 30)

# 格式化
now.strftime("%Y-%m-%d %H:%M:%S")  # "2024-06-11 10:30:00"

# 解析
datetime.strptime("2024-06-11", "%Y-%m-%d")

# 时间差
delta = timedelta(days=7)
next_week = today + delta
```

## math 模块

数学函数。

```python
import math

# 常数
math.pi     # 3.141592653589793
math.e      # 2.718281828459045

# 基本运算
math.sqrt(16)    # 4.0
math.pow(2, 3)   # 8.0
math.ceil(3.2)   # 4
math.floor(3.8)  # 3

# 三角函数
math.sin(math.pi/2)  # 1.0
math.cos(0)          # 1.0

# 对数
math.log(10)      # 2.302585...
math.log10(100)   # 2.0
```

## random 模块

随机数生成。

```python
import random

# 随机浮点数 [0.0, 1.0)
random.random()

# 随机整数 [a, b]
random.randint(1, 10)

# 随机选择
random.choice([1, 2, 3, 4, 5])

# 随机打乱
lst = [1, 2, 3, 4, 5]
random.shuffle(lst)

# 随机抽样
random.sample([1, 2, 3, 4, 5], 3)  # [3, 1, 4]
```

## json 模块

JSON 数据处理。

```python
import json

# Python 对象转 JSON 字符串
data = {"name": "Alice", "age": 25}
json_str = json.dumps(data)
print(json_str)  # '{"name": "Alice", "age": 25}'

# JSON 字符串转 Python 对象
json_str = '{"name": "Bob", "age": 30}'
data = json.loads(json_str)
print(data["name"])  # Bob

# 写入 JSON 文件
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

# 读取 JSON 文件
with open("data.json", "r") as f:
    data = json.load(f)
```

## tomllib 模块（Python 3.11+）

读取 TOML 配置文件。

```python
# Python 3.11+ 内置 tomllib
import tomllib

with open("config.toml", "rb") as f:
    config = tomllib.load(f)

# 旧版本需要安装第三方库
# pip install tomli
import tomli

with open("config.toml", "rb") as f:
    config = tomli.load(f)
```

## re 模块

正则表达式（基础）。

```python
import re

# 匹配
pattern = r"\d+"
result = re.search(pattern, "abc123def")
print(result.group())  # "123"

# 查找所有
re.findall(r"\d+", "a1b2c3")  # ['1', '2', '3']

# 替换
re.sub(r"\d+", "X", "a1b2c3")  # "aXbXcX"

# 分割
re.split(r"\s+", "a b  c   d")  # ['a', 'b', 'c', 'd']
```

## time 模块

时间相关函数。

```python
import time

# 当前时间戳
time.time()  # 1686466200.123

# 暂停
time.sleep(2)  # 暂停 2 秒

# 格式化时间
time.strftime("%Y-%m-%d %H:%M:%S")
```
