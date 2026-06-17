# 常用标准库

## 核心概念

标准库是 Python 自带的一组模块。安装 Python 后就可以直接使用，不需要额外安装。

Python 常被称为”自带电池”的语言，因为标准库已经提供了很多常用能力，比如文件系统、日期时间、数学计算、随机数和 JSON 处理。

使用标准库的一般步骤：

```python
import math

print(math.sqrt(16))
```

本章介绍 6 个最常用的标准库：

| 模块 | 核心用途 |
|------|---------|
| `os` | 操作系统交互：文件路径、目录操作 |
| `sys` | Python 运行环境信息：版本、平台、命令行参数 |
| `datetime` | 日期时间处理：获取当前时间、计算时间差、格式化 |
| `math` | 数学运算：开方、取整、三角函数、常数 |
| `random` | 随机数生成：随机整数、随机选择、打乱列表 |
| `json` | JSON 数据处理：Python 对象与 JSON 字符串互转 |

## os 模块

### 用途

`os` 模块用于和操作系统交互，主要处理文件路径和目录操作。

**核心能力**：
- 查询和操作文件路径
- 获取目录内容
- 创建和删除文件/目录
- 跨平台路径处理

### 常用方法

| 方法/属性 | 用途 | 返回值 |
|----------|------|--------|
| `os.getcwd()` | 获取当前工作目录 | 字符串路径 |
| `os.listdir(path)` | 列出目录内容 | 文件名列表 |
| `os.mkdir(path)` | 创建目录 | 无 |
| `os.remove(path)` | 删除文件 | 无 |
| `os.rmdir(path)` | 删除空目录 | 无 |
| `os.path.exists(path)` | 判断路径是否存在 | `True`/`False` |
| `os.path.isfile(path)` | 判断是否为文件 | `True`/`False` |
| `os.path.isdir(path)` | 判断是否为目录 | `True`/`False` |
| `os.path.join(*paths)` | 跨平台拼接路径 | 字符串路径 |
| `os.path.basename(path)` | 获取文件名部分 | 字符串 |
| `os.path.dirname(path)` | 获取目录部分 | 字符串 |
| `os.path.splitext(path)` | 分离文件名和扩展名 | 元组 `(name, ext)` |

### 基本用法

```python
import os

# 获取当前工作目录
print(os.getcwd())

# 列出当前目录内容
print(os.listdir("."))

# 判断路径是否存在
print(os.path.exists("data.txt"))

# 判断是文件还是目录
print(os.path.isfile("data.txt"))
print(os.path.isdir("docs"))

# 跨平台拼接路径（自动处理 / 和 \）
path = os.path.join("docs", "basic", "01-intro.md")
print(path)

# 分离路径和文件名
full_path = "/home/user/report.pdf"
print(os.path.basename(full_path))  # report.pdf
print(os.path.dirname(full_path))   # /home/user

# 分离文件名和扩展名
name, ext = os.path.splitext("report.pdf")
print(name)  # report
print(ext)   # .pdf
```

### 创建和删除操作

```python
import os

# 创建目录
os.mkdir("new_folder")

# 删除文件（危险操作，谨慎使用）
# os.remove("old.txt")

# 删除空目录（危险操作，谨慎使用）
# os.rmdir("empty_folder")
```

**注意**：删除操作不可恢复，建议先检查路径是否存在。

### 使用场景

#### 场景 1：检查文件是否存在再处理

```python
import os

filename = "data.txt"

if os.path.exists(filename):
    with open(filename, "r", encoding="utf-8") as f:
        print(f.read())
else:
    print(f"{filename} 不存在")
```

#### 场景 2：拼接跨平台路径

```python
import os

# 自动根据操作系统选择正确的路径分隔符
data_path = os.path.join("data", "users", "profile.json")
# Windows: data\users\profile.json
# Linux/macOS: data/users/profile.json
```

#### 场景 3：遍历目录中的所有文件

```python
import os

for filename in os.listdir("."):
    if os.path.isfile(filename):
        print(f"文件: {filename}")
```

#### 场景 4：批量处理特定类型文件

```python
import os

for filename in os.listdir("."):
    if filename.endswith(".txt"):
        print(f"找到文本文件: {filename}")
```

### 易错点

#### 易错点 1：路径拼接使用字符串而不是 `os.path.join`

❌ **错误示例**：
```python
# Windows 上使用反斜杠
path = "data\\users.txt"  # Linux/macOS 上会出错

# 或者使用正斜杠
path = "data/users.txt"  # Windows 通常能识别，但跨平台代码不应依赖手写分隔符
```

✅ **正确做法**：
```python
import os

# 使用 os.path.join 自动处理路径分隔符
path = os.path.join("data", "users.txt")
# Windows: data\users.txt
# Linux/macOS: data/users.txt
```

**说明**：不同操作系统的路径分隔符不同。使用 `os.path.join()` 可以自动处理，保证跨平台兼容。

#### 易错点 2：`os.remove()` 删除目录会报错

❌ **错误示例**：
```python
import os

os.remove("my_folder")  # IsADirectoryError: 不能用 remove 删除目录
```

✅ **正确做法**：
```python
import os

# 删除文件用 remove
os.remove("file.txt")

# 删除空目录用 rmdir
os.rmdir("empty_folder")

# 删除目录及其内容用 shutil.rmtree（需要导入 shutil）
import shutil
shutil.rmtree("folder_with_content")
```

**说明**：`os.remove()` 只能删除文件，`os.rmdir()` 只能删除空目录。删除非空目录需要 `shutil.rmtree()`。

#### 易错点 3：`os.listdir()` 返回的是文件名而非完整路径

❌ **错误示例**：
```python
import os

for item in os.listdir("data"):
    # 直接打开会找不到文件，因为 item 只是文件名
    with open(item, "r") as f:  # FileNotFoundError
        print(f.read())
```

✅ **正确做法**：
```python
import os

for item in os.listdir("data"):
    # 拼接完整路径
    full_path = os.path.join("data", item)
    if os.path.isfile(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            print(f.read())
```

**说明**：`os.listdir()` 返回的是相对于指定目录的文件名，需要拼接完整路径才能使用。

## sys 模块

### 用途

`sys` 模块提供与 Python 解释器和运行环境相关的信息和操作。

**核心能力**：
- 获取 Python 版本和平台信息
- 访问命令行参数
- 控制程序退出
- 查看模块搜索路径

### 常用方法

| 方法/属性 | 用途 | 返回值 |
|----------|------|--------|
| `sys.version` | 获取 Python 版本信息 | 字符串 |
| `sys.platform` | 获取操作系统平台 | 字符串（如 `'win32'`, `'linux'`, `'darwin'`） |
| `sys.argv` | 获取命令行参数列表 | 列表（第一个元素是脚本名） |
| `sys.path` | 获取模块搜索路径 | 列表 |
| `sys.exit(code)` | 退出程序 | 无（触发 `SystemExit` 异常） |
| `sys.stdin` | 标准输入流 | 文件对象 |
| `sys.stdout` | 标准输出流 | 文件对象 |
| `sys.stderr` | 标准错误流 | 文件对象 |

### 基本用法

```python
import sys

# 查看 Python 版本
print(sys.version)

# 查看操作系统平台
print(sys.platform)

# 查看模块搜索路径
print(sys.path)
```

### 命令行参数

当你运行 `python app.py arg1 arg2` 时，`sys.argv` 会保存所有参数：

```python
import sys

print(sys.argv)
# 输出：['app.py', 'arg1', 'arg2']

# 通常这样使用
if len(sys.argv) > 1:
    filename = sys.argv[1]
    print(f"处理文件: {filename}")
else:
    print("用法: python app.py <filename>")
```

### 程序退出

```python
import sys

# 正常退出（返回 0）
sys.exit(0)

# 异常退出（返回非 0 值）
sys.exit(1)

# 也可以传字符串，会打印后退出
sys.exit("发生错误，程序终止")
```

### 使用场景

#### 场景 1：编写命令行工具

```python
import sys

if len(sys.argv) < 2:
    print("用法: python converter.py <filename>")
    sys.exit(1)

filename = sys.argv[1]
print(f"转换文件: {filename}")
```

#### 场景 2：根据平台执行不同逻辑

```python
import sys

if sys.platform == "win32":
    print("Windows 系统")
    config_path = "C:\\config.txt"
elif sys.platform == "darwin":
    print("macOS 系统")
    config_path = "/Users/config.txt"
else:
    print("Linux 系统")
    config_path = "/etc/config.txt"
```

#### 场景 3：检查 Python 版本

```python
import sys

if sys.version_info < (3, 8):
    print("此程序需要 Python 3.8 或更高版本")
    sys.exit(1)
```

### 易错点

#### 易错点 1：`sys.argv[0]` 是脚本名而不是第一个参数

❌ **错误示例**：
```python
import sys

# 运行：python app.py hello
print(sys.argv[0])  # 'app.py'，不是 'hello'
```

✅ **正确理解**：
```python
import sys

# 运行：python app.py hello world
print(sys.argv[0])  # 'app.py'（脚本名）
print(sys.argv[1])  # 'hello'（第一个参数）
print(sys.argv[2])  # 'world'（第二个参数）
```

**说明**：`sys.argv` 的第一个元素始终是脚本名，实际参数从索引 `1` 开始。

#### 易错点 2：直接访问 `sys.argv` 而不检查长度

❌ **错误示例**：
```python
import sys

filename = sys.argv[1]  # IndexError: 用户没有提供参数时会报错
```

✅ **正确做法**：
```python
import sys

if len(sys.argv) < 2:
    print("请提供文件名")
    sys.exit(1)

filename = sys.argv[1]
print(f"处理文件: {filename}")
```

**说明**：使用命令行参数前应该检查参数数量，避免索引越界。

## datetime 模块

### 用途

`datetime` 模块用于处理日期和时间。

**核心能力**：
- 获取当前日期和时间
- 日期时间计算（加减天数、小时等）
- 格式化和解析日期时间字符串
- 比较日期时间

### 常用类和方法

| 类/方法 | 用途 | 返回值 |
|--------|------|--------|
| `date.today()` | 获取今天日期 | `date` 对象 |
| `datetime.now()` | 获取当前日期时间 | `datetime` 对象 |
| `timedelta(days=N)` | 表示时间差 | `timedelta` 对象 |
| `date.strftime(format)` | 格式化为字符串 | 字符串 |
| `datetime.strptime(str, format)` | 解析字符串为日期时间 | `datetime` 对象 |

**常用格式化符号**：

| 符号 | 含义 | 示例 |
|-----|------|------|
| `%Y` | 四位年份 | `2026` |
| `%m` | 两位月份 | `01`-`12` |
| `%d` | 两位日期 | `01`-`31` |
| `%H` | 24 小时制小时 | `00`-`23` |
| `%M` | 分钟 | `00`-`59` |
| `%S` | 秒 | `00`-`59` |
| `%A` | 星期几全名 | `Monday` |
| `%a` | 星期几缩写 | `Mon` |

### 基本用法

```python
from datetime import date, datetime, timedelta

# 获取今天日期
today = date.today()
print(today)  # 2026-06-17

# 获取当前日期时间
now = datetime.now()
print(now)  # 2026-06-17 14:30:25.123456
```

### 日期计算

```python
from datetime import date, timedelta

today = date.today()

# 7 天后
next_week = today + timedelta(days=7)
print(next_week)

# 30 天前
last_month = today - timedelta(days=30)
print(last_month)

# 2 小时后
from datetime import datetime, timedelta
now = datetime.now()
two_hours_later = now + timedelta(hours=2)
print(two_hours_later)
```

### 格式化日期时间

```python
from datetime import datetime

now = datetime.now()

# 常见格式
print(now.strftime("%Y-%m-%d"))              # 2026-06-17
print(now.strftime("%Y-%m-%d %H:%M:%S"))     # 2026-06-17 14:30:25
print(now.strftime("%Y年%m月%d日"))          # 2026年06月17日
print(now.strftime("%A, %B %d, %Y"))         # Tuesday, June 17, 2026
```

### 解析字符串为日期时间

```python
from datetime import datetime

# 解析日期字符串
date_str = "2026-06-17"
date_obj = datetime.strptime(date_str, "%Y-%m-%d")
print(date_obj)

# 解析日期时间字符串
datetime_str = "2026-06-17 14:30:25"
datetime_obj = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
print(datetime_obj)
```

### 比较日期

```python
from datetime import date

date1 = date(2026, 6, 17)
date2 = date(2026, 12, 31)

print(date1 < date2)   # True
print(date1 == date2)  # False

# 计算两个日期之间的天数
diff = date2 - date1
print(diff.days)  # 197
```

### 使用场景

#### 场景 1：记录当前时间戳

```python
from datetime import datetime

log_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(f"[{log_time}] 用户登录")
```

#### 场景 2：计算截止日期

```python
from datetime import date, timedelta

start_date = date.today()
deadline = start_date + timedelta(days=14)
print(f"项目截止日期: {deadline}")
```

#### 场景 3：判断是否过期

```python
from datetime import date

expiry_date = date(2026, 12, 31)
today = date.today()

if today > expiry_date:
    print("已过期")
else:
    days_left = (expiry_date - today).days
    print(f"还剩 {days_left} 天")
```

#### 场景 4：生成文件名带时间戳

```python
from datetime import datetime

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"report_{timestamp}.txt"
print(filename)  # report_20260617_143025.txt
```

### 易错点

#### 易错点 1：`date` 和 `datetime` 对象不能直接相减

❌ **错误示例**：
```python
from datetime import date, datetime

d = date(2026, 6, 17)
dt = datetime(2026, 6, 17, 14, 30)

diff = dt - d  # TypeError: 不能混用 date 和 datetime
```

✅ **正确做法**：
```python
from datetime import date, datetime

d = date(2026, 6, 17)
dt = datetime(2026, 6, 17, 14, 30)

# 方法 1：都转为 datetime
dt2 = datetime.combine(d, datetime.min.time())
diff = dt - dt2

# 方法 2：只比较日期部分
diff = dt.date() - d  # timedelta(0)
```

**说明**：`date` 和 `datetime` 是不同类型，不能直接计算。需要统一类型。

#### 易错点 2：`strftime` 和 `strptime` 混淆

❌ **错误示例**：
```python
from datetime import datetime

# 想把字符串转为日期，但用了 strftime
date_str = "2026-06-17"
date_obj = datetime.strftime(date_str, "%Y-%m-%d")  # TypeError
```

✅ **正确做法**：
```python
from datetime import datetime

# strptime: 字符串解析为日期（parse）
date_str = "2026-06-17"
date_obj = datetime.strptime(date_str, "%Y-%m-%d")

# strftime: 日期格式化为字符串（format）
now = datetime.now()
formatted = now.strftime("%Y-%m-%d")
```

**说明**：
- `strptime`：**p** = parse（解析），字符串 → 日期对象
- `strftime`：**f** = format（格式化），日期对象 → 字符串

#### 易错点 3：时区问题

❌ **错误示例**：
```python
from datetime import datetime

# datetime.now() 返回本地时间，没有时区信息
now = datetime.now()
print(now.tzinfo)  # None
```

✅ **正确理解**：
```python
from datetime import datetime, timezone

# 本地时间（不带时区）
local_now = datetime.now()

# UTC 时间（带时区）
utc_now = datetime.now(timezone.utc)
print(utc_now.tzinfo)  # UTC
```

**说明**：`datetime.now()` 返回的是不带时区的本地时间。如果需要处理时区，使用 `timezone` 或第三方库 `pytz`。

## math 模块

### 用途

`math` 模块提供标准数学函数和常数。

**核心能力**：
- 基础数学运算（开方、幂、对数）
- 取整函数
- 三角函数
- 数学常数（π、e）

### 常用方法

| 方法/常数 | 用途 | 示例 |
|----------|------|------|
| `math.sqrt(x)` | 平方根 | `math.sqrt(16)` → `4.0` |
| `math.pow(x, y)` | x 的 y 次方（返回浮点数） | `math.pow(2, 3)` → `8.0` |
| `math.ceil(x)` | 向上取整 | `math.ceil(3.2)` → `4` |
| `math.floor(x)` | 向下取整 | `math.floor(3.8)` → `3` |
| `math.fabs(x)` | 绝对值（返回浮点数） | `math.fabs(-5)` → `5.0` |
| `math.factorial(n)` | 阶乘 | `math.factorial(5)` → `120` |
| `math.gcd(a, b)` | 最大公约数 | `math.gcd(12, 8)` → `4` |
| `math.pi` | 圆周率 π | `3.141592653589793` |
| `math.e` | 自然常数 e | `2.718281828459045` |
| `math.sin(x)` | 正弦（弧度） | `math.sin(math.pi/2)` → `1.0` |
| `math.cos(x)` | 余弦（弧度） | `math.cos(0)` → `1.0` |
| `math.log(x)` | 自然对数 | `math.log(math.e)` → `1.0` |
| `math.log10(x)` | 以 10 为底的对数 | `math.log10(100)` → `2.0` |

### 基本用法

```python
import math

# 数学常数
print(math.pi)  # 3.141592653589793
print(math.e)   # 2.718281828459045

# 平方根
print(math.sqrt(16))  # 4.0

# 取整
print(math.ceil(3.2))   # 4
print(math.floor(3.8))  # 3

# 绝对值
print(math.fabs(-5))  # 5.0

# 阶乘
print(math.factorial(5))  # 120

# 最大公约数
print(math.gcd(12, 8))  # 4
```

### 使用场景

#### 场景 1：计算圆的面积

```python
import math

radius = 5
area = math.pi * radius ** 2
print(f"圆的面积: {area:.2f}")
```

#### 场景 2：向上取整（例如分页）

```python
import math

total_items = 47
page_size = 10
total_pages = math.ceil(total_items / page_size)
print(f"总页数: {total_pages}")  # 5
```

#### 场景 3：科学计算

```python
import math

# 计算角度的正弦值
angle_degrees = 30
angle_radians = math.radians(angle_degrees)  # 转为弧度
sin_value = math.sin(angle_radians)
print(f"sin(30°) = {sin_value:.2f}")  # 0.50
```

### 易错点

#### 易错点 1：`math.pow()` 返回浮点数

❌ **错误理解**：
```python
import math

result = math.pow(2, 3)
print(type(result))  # <class 'float'>，不是 int
```

✅ **正确理解**：
```python
import math

# math.pow 总是返回浮点数
print(math.pow(2, 3))  # 8.0

# 如果需要整数结果，用 ** 运算符
print(2 ** 3)  # 8
```

**说明**：`math.pow()` 总是返回浮点数。整数幂运算优先使用 `**` 运算符。

#### 易错点 2：三角函数使用的是弧度而不是角度

❌ **错误示例**：
```python
import math

# 想计算 sin(90°)，直接传 90
print(math.sin(90))  # 0.8939966636005579，错误！
```

✅ **正确做法**：
```python
import math

# 先将角度转为弧度
angle_degrees = 90
angle_radians = math.radians(angle_degrees)
print(math.sin(angle_radians))  # 1.0

# 或者直接使用 π
print(math.sin(math.pi / 2))  # 1.0
```

**说明**：`math.sin()`、`math.cos()` 等三角函数的参数单位是**弧度**，不是角度。使用 `math.radians()` 转换。

#### 易错点 3：`math.ceil()` 和 `math.floor()` 对负数的行为

❌ **错误理解**：
```python
import math

print(math.ceil(-3.2))   # -3（向上是朝正无穷）
print(math.floor(-3.2))  # -4（向下是朝负无穷）
```

✅ **正确理解**：
```python
import math

# 向上取整：朝正无穷方向
print(math.ceil(3.2))   # 4
print(math.ceil(-3.2))  # -3

# 向下取整：朝负无穷方向
print(math.floor(3.8))   # 3
print(math.floor(-3.8))  # -4

# 如果需要"朝 0 取整"，用 int()
print(int(3.8))   # 3
print(int(-3.8))  # -3
```

**说明**：`ceil` 是朝正无穷取整，`floor` 是朝负无穷取整。对负数来说，`ceil(-3.2)` 是 `-3` 而不是 `-4`。

## random 模块

### 用途

`random` 模块用于生成随机数和进行随机选择。

**核心能力**：
- 生成随机整数和浮点数
- 从序列中随机选择元素
- 打乱序列顺序
- 生成随机样本

**注意**：`random` 生成的是伪随机数，适合普通用途（游戏、模拟、抽样），但**不适合加密和安全相关场景**（应使用 `secrets` 模块）。

### 常用方法

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `random.random()` | 生成 [0.0, 1.0) 之间的随机浮点数 | 浮点数 |
| `random.randint(a, b)` | 生成 [a, b] 之间的随机整数（包含两端） | 整数 |
| `random.uniform(a, b)` | 生成 [a, b] 之间的随机浮点数 | 浮点数 |
| `random.choice(seq)` | 从序列中随机选择一个元素 | 元素 |
| `random.choices(seq, k=n)` | 从序列中随机选择 n 个元素（可重复） | 列表 |
| `random.sample(seq, k=n)` | 从序列中随机抽取 n 个不重复元素 | 列表 |
| `random.shuffle(seq)` | 就地打乱序列 | 无（直接修改原序列） |
| `random.seed(x)` | 设置随机数种子（使结果可重现） | 无 |

### 基本用法

```python
import random

# 生成 0 到 1 之间的随机浮点数
print(random.random())  # 0.8472950597550898

# 生成 1 到 6 之间的随机整数（模拟掷骰子）
print(random.randint(1, 6))  # 4

# 生成 1.0 到 10.0 之间的随机浮点数
print(random.uniform(1.0, 10.0))  # 7.234567890123456
```

### 随机选择

```python
import random

# 从列表中随机选择一个元素
fruits = ["apple", "banana", "orange", "grape"]
print(random.choice(fruits))  # orange

# 随机选择多个元素（可重复）
print(random.choices(fruits, k=3))  # ['apple', 'apple', 'banana']

# 随机抽取多个不重复元素
print(random.sample(fruits, k=2))  # ['banana', 'grape']
```

### 打乱列表

```python
import random

numbers = [1, 2, 3, 4, 5]
random.shuffle(numbers)
print(numbers)  # [3, 1, 5, 2, 4]（就地修改）
```

### 设置随机种子

```python
import random

# 设置种子后，随机序列可重现
random.seed(42)
print(random.randint(1, 10))  # 2
print(random.randint(1, 10))  # 1

# 重新设置相同的种子，序列会重复
random.seed(42)
print(random.randint(1, 10))  # 2（与第一次相同）
print(random.randint(1, 10))  # 1（与第二次相同）
```

### 使用场景

#### 场景 1：模拟掷骰子

```python
import random

dice = random.randint(1, 6)
print(f"掷出了 {dice} 点")
```

#### 场景 2：随机抽奖

```python
import random

participants = ["Alice", "Bob", "Charlie", "David", "Eve"]
winner = random.choice(participants)
print(f"中奖者: {winner}")
```

#### 场景 3：生成随机密码（仅供演示，实际应用用 `secrets`）

```python
import random
import string

# 生成 8 位随机密码
chars = string.ascii_letters + string.digits
password = ''.join(random.choices(chars, k=8))
print(password)  # aB3xK9mL
```

#### 场景 4：随机打乱题目顺序

```python
import random

questions = ["问题1", "问题2", "问题3", "问题4"]
random.shuffle(questions)
print(questions)
```

#### 场景 5：生成测试数据

```python
import random

# 生成 10 个 1-100 之间的随机整数
test_data = [random.randint(1, 100) for _ in range(10)]
print(test_data)
```

### 易错点

#### 易错点 1：`random.seed()` 的作用误解

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
print(random.randint(1, 10))  # 2
print(random.randint(1, 10))  # 1

# 重新设置相同的 seed，序列会重复
random.seed(42)
print(random.randint(1, 10))  # 2（与第一次相同）
print(random.randint(1, 10))  # 1（与第二次相同）
```

**说明**：`random.seed()` 设置随机数生成器的种子，使随机序列可重现，但序列中的每个数仍然不同。

#### 易错点 2：`random.randint()` 包含两端

❌ **错误理解**：
```python
import random

# 以为 randint(1, 6) 只会返回 1-5
dice = random.randint(1, 6)  # 实际可能返回 6
```

✅ **正确理解**：
```python
import random

# randint(a, b) 返回 [a, b]，包含 a 和 b
print(random.randint(1, 6))  # 可能返回 1, 2, 3, 4, 5, 6

# 如果需要 [a, b)，使用 randrange
print(random.randrange(1, 6))  # 可能返回 1, 2, 3, 4, 5（不包含 6）
```

**说明**：`random.randint(a, b)` 是**闭区间**，包含两端。这与 `range(a, b)` 不同。

#### 易错点 3：`choice` vs `choices` vs `sample`

❌ **错误示例**：
```python
import random

items = ["A", "B", "C"]

# 想选多个元素，但用了 choice
result = random.choice(items)  # 只返回一个元素 'B'

# 想选不重复元素，但用了 choices
result = random.choices(items, k=5)  # 可能有重复 ['A', 'A', 'B', 'C', 'A']

# 想选可重复元素，但用了 sample
result = random.sample(items, k=5)  # ValueError: 样本数量大于序列长度
```

✅ **正确做法**：
```python
import random

items = ["A", "B", "C"]

# choice：选一个元素
single = random.choice(items)  # 'B'

# choices：选多个元素（可重复）
multiple_with_repeat = random.choices(items, k=5)  # ['A', 'C', 'A', 'B', 'C']

# sample：选多个不重复元素（数量不能超过序列长度）
multiple_unique = random.sample(items, k=2)  # ['B', 'A']
```

**说明**：
- `choice`：单个元素
- `choices`：多个元素，可重复
- `sample`：多个元素，不重复

#### 易错点 4：`shuffle()` 直接修改原列表

❌ **错误示例**：
```python
import random

numbers = [1, 2, 3, 4, 5]
shuffled = random.shuffle(numbers)  # None
print(shuffled)  # None，shuffle 返回 None
```

✅ **正确做法**：
```python
import random

numbers = [1, 2, 3, 4, 5]

# shuffle 就地修改，无返回值
random.shuffle(numbers)
print(numbers)  # [3, 1, 5, 2, 4]

# 如果需要保留原列表，先复制
numbers = [1, 2, 3, 4, 5]
shuffled = numbers[:]
random.shuffle(shuffled)
print(numbers)   # [1, 2, 3, 4, 5]（原列表未变）
print(shuffled)  # [3, 1, 5, 2, 4]（新列表）
```

**说明**：`shuffle()` 直接修改原列表，返回 `None`。如需保留原列表，先复制。

## json 模块

### 用途

`json` 模块用于处理 JSON（JavaScript Object Notation）数据格式。

**核心能力**：
- Python 对象与 JSON 字符串互转
- 读写 JSON 文件
- 处理配置文件、API 数据、数据存储

**JSON 与 Python 的类型对应**：

| JSON 类型 | Python 类型 |
|----------|------------|
| `object` | `dict` |
| `array` | `list` |
| `string` | `str` |
| `number` (int) | `int` |
| `number` (real) | `float` |
| `true` / `false` | `True` / `False` |
| `null` | `None` |

### 常用方法

| 方法 | 用途 | 参数/返回值 |
|------|------|-----------|
| `json.dumps(obj)` | Python 对象 → JSON 字符串 | 返回字符串 |
| `json.loads(str)` | JSON 字符串 → Python 对象 | 返回对象 |
| `json.dump(obj, file)` | Python 对象 → JSON 文件 | 写入文件，无返回值 |
| `json.load(file)` | JSON 文件 → Python 对象 | 返回对象 |

**记忆技巧**：
- `dumps` = dump **s**tring（生成字符串）
- `loads` = load **s**tring（解析字符串）
- `dump` = 直接写入文件
- `load` = 直接读取文件

### 基本用法：对象与字符串互转

```python
import json

# Python 字典转 JSON 字符串
user = {"name": "Alice", "age": 18, "is_vip": True}
json_str = json.dumps(user)
print(json_str)  # '{"name": "Alice", "age": 18, "is_vip": true}'
print(type(json_str))  # <class 'str'>

# JSON 字符串转 Python 字典
json_text = '{"name": "Bob", "age": 20}'
user_obj = json.loads(json_text)
print(user_obj)  # {'name': 'Bob', 'age': 20}
print(type(user_obj))  # <class 'dict'>
```

### 格式化输出

```python
import json

user = {"name": "Alice", "age": 18, "hobbies": ["reading", "coding"]}

# 格式化输出（带缩进和中文）
json_str = json.dumps(user, ensure_ascii=False, indent=2)
print(json_str)
# {
#   "name": "Alice",
#   "age": 18,
#   "hobbies": [
#     "reading",
#     "coding"
#   ]
# }
```

**常用参数**：
- `ensure_ascii=False`：允许中文字符，不转义为 `\uXXXX`
- `indent=2`：每层缩进 2 个空格，便于阅读

### 读写 JSON 文件

```python
import json

# 写入 JSON 文件
user = {"name": "Alice", "age": 18}

with open("user.json", "w", encoding="utf-8") as f:
    json.dump(user, f, ensure_ascii=False, indent=2)

# 读取 JSON 文件
with open("user.json", "r", encoding="utf-8") as f:
    loaded_user = json.load(f)

print(loaded_user)  # {'name': 'Alice', 'age': 18}
```

### 处理列表

```python
import json

# 列表也可以转 JSON
users = [
    {"name": "Alice", "age": 18},
    {"name": "Bob", "age": 20}
]

json_str = json.dumps(users, ensure_ascii=False, indent=2)
print(json_str)
# [
#   {
#     "name": "Alice",
#     "age": 18
#   },
#   {
#     "name": "Bob",
#     "age": 20
#   }
# ]
```

### 使用场景

#### 场景 1：保存程序配置

```python
import json

config = {
    "theme": "dark",
    "language": "zh-CN",
    "auto_save": True
}

with open("config.json", "w", encoding="utf-8") as f:
    json.dump(config, f, ensure_ascii=False, indent=2)
```

#### 场景 2：处理 API 响应

```python
import json

# 模拟 API 返回的 JSON 字符串
api_response = '{"status": "success", "data": {"user_id": 123, "username": "alice"}}'

# 解析 JSON
response = json.loads(api_response)
print(response["status"])  # success
print(response["data"]["username"])  # alice
```

#### 场景 3：数据持久化

```python
import json

# 保存用户数据
users = [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
]

with open("users.json", "w", encoding="utf-8") as f:
    json.dump(users, f, ensure_ascii=False, indent=2)

# 读取用户数据
with open("users.json", "r", encoding="utf-8") as f:
    loaded_users = json.load(f)

for user in loaded_users:
    print(user["name"])
```

#### 场景 4：日志记录

```python
import json
from datetime import datetime

log_entry = {
    "timestamp": datetime.now().isoformat(),
    "level": "INFO",
    "message": "用户登录成功",
    "user_id": 123
}

# 追加到日志文件
with open("app.log", "a", encoding="utf-8") as f:
    f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
```

### 易错点

#### 易错点 1：`json.dump()` 和 `json.dumps()` 混淆

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

# dumps：转为字符串（dump string）
text = json.dumps(data)
print(text)  # '{"name": "Alice"}'

# dump：直接写入文件
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f)
```

**说明**：`dumps()` 返回字符串（多一个 `s` 表示 string），`dump()` 直接写入文件对象。

#### 易错点 2：忘记 `ensure_ascii=False` 导致中文乱码

❌ **错误示例**：
```python
import json

user = {"name": "张三", "age": 18}
json_str = json.dumps(user)
print(json_str)  # '{"name": "张三", "age": 18}'（中文被转义）
```

✅ **正确做法**：
```python
import json

user = {"name": "张三", "age": 18}
json_str = json.dumps(user, ensure_ascii=False)
print(json_str)  # '{"name": "张三", "age": 18}'
```

**说明**：默认情况下，`json.dumps()` 会把非 ASCII 字符转义。使用 `ensure_ascii=False` 保留中文。

#### 易错点 3：JSON 不支持所有 Python 类型

❌ **错误示例**：
```python
import json
from datetime import datetime

data = {"time": datetime.now()}
json.dumps(data)  # TypeError: Object of type datetime is not JSON serializable
```

✅ **正确做法**：
```python
import json
from datetime import datetime

# 方法 1：先转为字符串
data = {"time": datetime.now().isoformat()}
json.dumps(data)  # '{"time": "2026-06-17T14:30:25.123456"}'

# 方法 2：自定义序列化函数
def datetime_handler(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

data = {"time": datetime.now()}
json.dumps(data, default=datetime_handler)
```

**说明**：JSON 只支持基本类型（dict, list, str, int, float, bool, None）。复杂类型需要先转换。

#### 易错点 4：单引号和双引号问题

❌ **错误示例**：
```python
import json

# Python 字典可以用单引号，但 JSON 必须用双引号
json_text = "{'name': 'Alice'}"  # 单引号不是合法的 JSON
json.loads(json_text)  # JSONDecodeError
```

✅ **正确做法**：
```python
import json

# JSON 字符串必须用双引号
json_text = '{"name": "Alice"}'
data = json.loads(json_text)
print(data)  # {'name': 'Alice'}
```

**说明**：JSON 标准要求使用双引号。Python 字典可以用单引号，但 JSON 字符串必须是双引号。

## 使用场景总结

### 场景 1：处理路径和目录

```python
import os

# 跨平台路径拼接
path = os.path.join("data", "users.txt")

# 检查文件是否存在
if os.path.exists(path):
    print("文件存在")
```

### 场景 2：记录当前时间

```python
from datetime import datetime

# 生成时间戳
timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(f"[{timestamp}] 操作完成")
```

### 场景 3：生成随机结果

```python
import random

# 模拟掷骰子
dice = random.randint(1, 6)
print(f"掷出 {dice} 点")
```

### 场景 4：保存结构化数据

```python
import json

config = {"theme": "dark", "language": "zh-CN"}

with open("config.json", "w", encoding="utf-8") as f:
    json.dump(config, f, ensure_ascii=False, indent=2)
```

### 场景 5：数学计算

```python
import math

# 计算圆的面积
radius = 5
area = math.pi * radius ** 2
print(f"面积: {area:.2f}")
```

### 场景 6：命令行工具

```python
import sys

if len(sys.argv) < 2:
    print("用法: python script.py <filename>")
    sys.exit(1)

filename = sys.argv[1]
print(f"处理文件: {filename}")
```

## 易错点

### 易错点 1：路径拼接使用字符串而不是 `os.path.join`

❌ **错误示例**：
```python
# Windows 上使用反斜杠
path = "data\\users.txt"  # Linux/macOS 上会出错

# 或者使用正斜杠
path = "data/users.txt"  # Windows 通常能识别，但跨平台代码不应依赖手写分隔符
```

✅ **正确做法**：
```python
import os

# 使用 os.path.join 自动处理路径分隔符
path = os.path.join("data", "users.txt")
# Windows: data\users.txt
# Linux/macOS: data/users.txt
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
with open("data.json", "w", encoding="utf-8") as f:
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

print(f"今天: {today}")
print(f"7天后: {next_week}")
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

# 或使用列表推导式
numbers = [random.randint(1, 100) for _ in range(10)]
print(numbers)
```
</details>

**题目 3**：使用 `os.path.join` 拼接路径 `"data"`, `"users"`, `"profile.txt"`，并判断是否存在。

<details>
<summary>💡 查看答案</summary>

```python
import os

path = os.path.join("data", "users", "profile.txt")
print(f"路径: {path}")

if os.path.exists(path):
    print("文件存在")
else:
    print("文件不存在")
```
</details>

### 进阶练习

**题目 4**：把字典 `{"name": "张三", "age": 18, "city": "北京"}` 写入 `user.json`，再读取出来。

<details>
<summary>💡 查看答案</summary>

```python
import json

user = {"name": "张三", "age": 18, "city": "北京"}

# 写入文件
with open("user.json", "w", encoding="utf-8") as f:
    json.dump(user, f, ensure_ascii=False, indent=2)

# 读取文件
with open("user.json", "r", encoding="utf-8") as f:
    loaded_user = json.load(f)

print(loaded_user)
print(f"姓名: {loaded_user['name']}")
```
</details>

**题目 5**：计算从今天开始到 2026 年 12 月 31 日还有多少天。

<details>
<summary>💡 查看答案</summary>

```python
from datetime import date

today = date.today()
target = date(2026, 12, 31)

diff = target - today
print(f"距离 2026-12-31 还有 {diff.days} 天")
```
</details>

**题目 6**：使用 `math` 模块计算 100 的平方根，以及向上取整 15.3。

<details>
<summary>💡 查看答案</summary>

```python
import math

sqrt_result = math.sqrt(100)
print(f"100 的平方根: {sqrt_result}")

ceil_result = math.ceil(15.3)
print(f"15.3 向上取整: {ceil_result}")
```
</details>

### 挑战练习

**题目 7**：模拟掷骰子 100 次，统计每个点数（1-6）出现的次数。

<details>
<summary>💡 查看答案</summary>

```python
import random

counter = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}

for i in range(100):
    point = random.randint(1, 6)
    counter[point] += 1

print("点数统计:")
for point, count in counter.items():
    print(f"{point} 点: {count} 次")
```
</details>

**题目 8**：编写程序接收命令行参数，如果没有参数则提示用法并退出。

<details>
<summary>💡 查看答案</summary>

```python
import sys

if len(sys.argv) < 2:
    print("用法: python script.py <filename>")
    sys.exit(1)

filename = sys.argv[1]
print(f"处理文件: {filename}")

# 运行方式：python script.py test.txt
```
</details>

**题目 9**：从列表 `["Alice", "Bob", "Charlie", "David", "Eve"]` 中随机抽取 3 个不重复的名字。

<details>
<summary>💡 查看答案</summary>

```python
import random

names = ["Alice", "Bob", "Charlie", "David", "Eve"]
selected = random.sample(names, k=3)

print(f"抽中的名字: {selected}")
```
</details>

**题目 10**：保存当前目录中所有 `.txt` 文件的名称到 `files.json`。

<details>
<summary>💡 查看答案</summary>

```python
import os
import json

txt_files = []

for filename in os.listdir("."):
    if filename.endswith(".txt"):
        txt_files.append(filename)

with open("files.json", "w", encoding="utf-8") as f:
    json.dump(txt_files, f, ensure_ascii=False, indent=2)

print(f"找到 {len(txt_files)} 个 .txt 文件")
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：标准库和第三方库有什么区别？为什么叫"自带电池"？
2. **为什么需要**：为什么优先使用标准库，而不是自己从零写所有功能？
3. **怎么用**：
   - 如何跨平台拼接文件路径？
   - 如何计算两个日期之间的天数？
   - `json.dump()` 和 `json.dumps()` 有什么区别？
4. **注意事项**：
   - `random` 适合普通随机，为什么不适合安全敏感场景？
   - `random.randint(1, 6)` 和 `random.randrange(1, 6)` 有什么区别？
   - 为什么 JSON 字符串必须用双引号？

::: tip 学习建议
标准库不需要背完。先记住常用模块的核心用途：
- **os**：路径和目录
- **sys**：运行环境和命令行参数
- **datetime**：日期时间
- **math**：数学计算
- **random**：随机数
- **json**：JSON 数据

遇到相关需求时，先想到对应模块，再查具体方法即可。
:::

## 总结

本章介绍了 6 个最常用的 Python 标准库：

| 模块 | 记住这 3 个 |
|------|-----------|
| `os` | `os.path.join()`, `os.path.exists()`, `os.listdir()` |
| `sys` | `sys.argv`, `sys.exit()`, `sys.platform` |
| `datetime` | `date.today()`, `timedelta()`, `strftime()` |
| `math` | `math.sqrt()`, `math.ceil()`, `math.pi` |
| `random` | `random.randint()`, `random.choice()`, `random.shuffle()` |
| `json` | `json.dumps()`, `json.loads()`, `json.dump()` |

**下一步**：
- 熟悉这些模块的基本用法
- 遇到实际问题时查阅官方文档
- 逐步积累标准库的使用经验
