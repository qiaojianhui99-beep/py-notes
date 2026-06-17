# 正则表达式

正则表达式（Regular Expression，简称 regex）是一种描述字符串模式的**微型语言**。当字符串方法（`startswith`、`split`、`replace`）不足以表达"以什么开头、中间几位数字、以什么结尾"这类模式时，就需要正则。

学习正则前先记住一条原则：**能用字符串方法解决就别用正则**。正则的可读性和可维护性远不如普通字符串方法，只在模式确实复杂时才动用。

## re 模块

Python 通过内置 `re` 模块使用正则表达式。所有功能都围绕"模式字符串 + 目标字符串"展开。

### 基本匹配

```python
import re

text = "手机号: 13812345678"

# search：在整段文本中查找第一个匹配
match = re.search(r'\d{11}', text)
if match:
    print(match.group())  # 13812345678
    print(match.start())  # 4（匹配开始位置）
    print(match.end())    # 15（匹配结束位置）
    print(match.span())   # (4, 15)

# findall：找出全部匹配，返回字符串列表
phones = re.findall(r'\d{11}', text)
print(phones)  # ['13812345678']
```

**Match 对象的核心方法**：`re.search` 和 `re.match` 返回的不是字符串，而是 `Match` 对象（没匹配到时返回 `None`）。常用方法：

| 方法 | 用途 |
|------|------|
| `m.group(0)` 或 `m.group()` | 整个匹配到的字符串 |
| `m.group(n)` | 第 n 个分组捕获的内容 |
| `m.start()` / `m.end()` | 匹配的起始 / 结束位置（索引） |
| `m.span()` | 返回 `(start, end)` 元组 |
| `m.groups()` | 所有分组的元组 |

### 常用函数

| 函数 | 行为 |
|------|------|
| `re.match(pattern, text)` | 只从**开头**匹配，开头不匹配就失败 |
| `re.search(pattern, text)` | 在文本任意位置查找第一个匹配 |
| `re.findall(pattern, text)` | 返回所有匹配的字符串列表 |
| `re.sub(pattern, repl, text)` | 把匹配到的部分替换为 repl |
| `re.split(pattern, text)` | 按模式切分文本 |

```python
import re

# match：要求字符串从头就符合模式
re.match(r'\d+', '123abc')    # 匹配到 '123'
re.match(r'\d+', 'abc123')   # None（开头不是数字）

# search：在任意位置查找
re.search(r'\d+', 'abc123def')  # 匹配到 '123'

# findall：返回所有匹配
re.findall(r'\d+', 'a1b2c3')  # ['1', '2', '3']

# sub：替换
re.sub(r'\d+', 'X', 'a1b2')   # 'aXbX'

# split：按模式分割
re.split(r'\s+', 'a  b   c')  # ['a', 'b', 'c']
```

**`match` vs `search` 的关键区别**：`match` 严格要求从字符串开头匹配（相当于在模式前隐式加了 `^`），而 `search` 会扫描整段文本。新手最常踩的坑是该用 `search` 时用了 `match`，导致明明字符串里有匹配却返回 `None`。

## 常用模式

正则的"模式字符串"由普通字符和**元字符**组成。下面是必须记住的核心元字符。

### 基本字符（字符类）

```python
\d  # 数字 [0-9]
\D  # 非数字
\w  # 字母、数字、下划线 [a-zA-Z0-9_]
\W  # 非 \w
\s  # 空白字符（空格、Tab、换行）
\S  # 非空白字符
.   # 任意字符（除换行 \n）
```

### 量词（重复次数）

```python
*     # 0 次或多次
+     # 1 次或多次
?     # 0 次或 1 次
{n}   # 恰好 n 次
{n,}  # 至少 n 次
{n,m} # n 到 m 次
```

### 贪婪与非贪婪

量词默认是**贪婪**的，会尽量多匹配。在量词后加 `?` 变成**非贪婪**（懒汉）模式，尽量少匹配：

```python
import re

text = '<a>hello</a><b>world</b>'

# 贪婪：.* 会一直匹配到最后的 '>'
greedy = re.search(r'<.*>', text)
print(greedy.group())  # <a>hello</a><b>world</b>

# 非贪婪：.*? 碰到第一个 '>' 就停
lazy = re.search(r'<.*?>', text)
print(lazy.group())  # <a>
```

**何时用非贪婪**：解析 HTML/XML 标签、引号包围的字符串、括号内的内容时，几乎都要用 `.*?` 而不是 `.*`。

### 分组捕获

用 `(...)` 创建分组，可以从匹配结果里取出"局部内容"：

```python
import re

pattern = r'(\d{4})-(\d{2})-(\d{2})'
match = re.search(pattern, '2024-12-25')

print(match.group(0))  # 2024-12-25（整体）
print(match.group(1))  # 2024（第一个分组）
print(match.group(2))  # 12
print(match.groups())  # ('2024', '12', '25')
```

### 命名分组

数字分组不直观，可以给分组起名字：

```python
import re

pattern = r'(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})'
match = re.search(pattern, '2024-12-25')

print(match.group('year'))   # 2024
print(match.group('month'))  # 12
print(match.groupdict())     # {'year': '2024', 'month': '12', 'day': '25'}
```

## 使用场景

### 场景 1：表单数据校验

判断用户输入的电话、邮箱、身份证是否符合格式：

```python
import re

def is_valid_phone(s: str) -> bool:
    return bool(re.fullmatch(r'1[3-9]\d{9}', s))

print(is_valid_phone('13812345678'))  # True
print(is_valid_phone('12345678901'))  # False（第二位不是 3-9）
```

**说明**：`re.fullmatch` 要求**整个字符串**都匹配（隐式加了 `^` 和 `$`），用于校验比 `re.match` 更安全。

### 场景 2：从非结构化文本中抽取数据

```python
import re

log = '2024-12-25 10:30 ERROR [auth] login failed for user=alice'

# 抽出日期、级别、用户名
m = re.search(r'(\d{4}-\d{2}-\d{2}).*?(\w+) for user=(\w+)', log)
if m:
    date, level, user = m.groups()
    print(date, level, user)  # 2024-12-25 ERROR alice
```

### 场景 3：批量替换（脱敏、清洗）

```python
import re

# 手机号中间 4 位脱敏
phone = '13812345678'
hidden = re.sub(r'(\d{3})\d{4}(\d{4})', r'\1****\2', phone)
print(hidden)  # 138****5678
```

**说明**：`re.sub` 的替换字符串里 `\1`、`\2` 引用前面分组捕获的内容，常用于"保留部分内容、替换其他内容"。

### 场景 4：复杂分割

普通 `str.split` 只能用固定字符串分割。模式分割可以处理"不定数量空格"等场景：

```python
import re

# 按一个或多个空白字符分割
re.split(r'\s+', 'a  b   c')  # ['a', 'b', 'c']

# 'a  b   c'.split() 也能做到，但正则更灵活
# 例如：按逗号或分号分割
re.split(r'[,;]', 'a,b;c')  # ['a', 'b', 'c']
```

### 场景 5：配置/模板解析

```python
import re

template = 'Hello, {name}! You are {age} years old.'

# 提取所有 {xxx} 占位符
placeholders = re.findall(r'\{(\w+)\}', template)
print(placeholders)  # ['name', 'age']
```

## 实战示例

### 邮箱验证

```python
import re

email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
email = 'user@example.com'
if re.match(email_pattern, email):
    print("有效邮箱")
```

### 提取 URL

```python
import re

text = "访问 https://example.com 和 http://test.org"
urls = re.findall(r'https?://[\w\.-]+\.\w+', text)
print(urls)  # ['https://example.com', 'http://test.org']
```

**说明**：`https?` 中的 `?` 表示 `s` 可有可无，所以能同时匹配 `http` 和 `https`。

## 易错点

### 易错点 1：用 `match` 而不是 `search` 导致匹配失败

❌ **错误示例**：
```python
import re

# 想检查字符串里有没有电话号码
m = re.match(r'\d{11}', '电话是 13812345678')
print(m)  # None，因为 match 要求从头匹配
```

✅ **正确做法**：
```python
import re

# search 会扫描整段字符串
m = re.search(r'\d{11}', '电话是 13812345678')
if m:
    print(m.group())  # 13812345678
```

**说明**：`re.match` 隐式要求从字符串开头匹配，相当于模式前加了 `^`。要"在任意位置查找"应该用 `re.search`。

### 易错点 2：贪婪匹配把多段内容合并

❌ **错误示例**：
```python
import re

html = '<a>hi</a><b>bye</b>'
m = re.search(r'<.*>', html)
print(m.group())  # <a>hi</a><b>bye</b>，把整段当成一个匹配
```

✅ **正确做法**：
```python
import re

html = '<a>hi</a><b>bye</b>'

# 用非贪婪 .*?，遇到第一个 '>' 就停
tags = re.findall(r'<.*?>', html)
print(tags)  # ['<a>', '</a>', '<b>', '</b>']
```

**说明**：`*` 和 `+` 默认贪婪，会尽量多匹配字符。解析成对的分隔符（HTML 标签、引号、括号）时要加 `?` 改成非贪婪。

### 易错点 3：忘记转义特殊字符

❌ **错误示例**：
```python
import re

# 想匹配小数点，但 '.' 是元字符（匹配任意字符）
m = re.findall('3.14', '3.14 3X14 3 14')
print(m)  # ['3.14', '3X14']（'3X14' 也被错误匹配）
```

✅ **正确做法**：
```python
import re

# 用反斜杠转义 '.'，或用 re.escape 自动转义整段
m = re.findall(r'3\.14', '3.14 3X14 3 14')
print(m)  # ['3.14']

# 或：让 re 帮你转义
pattern = re.escape('3.14')
m = re.findall(pattern, '3.14 3X14')
print(m)  # ['3.14']
```

**说明**：`.`、`*`、`+`、`?`、`(`、`)`、`[`、`]`、`{`、`}`、`^`、`$`、`|`、`\` 都是元字符，匹配字面值时要加 `\` 转义。如果模式来自用户输入或变量，用 `re.escape()` 自动转义最安全。

## 练习题

### 基础练习

**题目 1**：提取文本中所有的邮箱地址。

<details>
<summary>💡 查看答案</summary>

```python
import re

text = "联系我: user@example.com 或 admin@test.org"
emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
print(emails)  # ['user@example.com', 'admin@test.org']
```

**解析**：`[\w\.-]` 表示"字母数字下划线、点、横线"中任意一个，`+` 表示至少一个。组合起来就是"邮箱用户名部分"。
</details>

**题目 2**：把字符串 `'2024-12-25'` 解析成 `年、月、日` 三个变量（提示：用分组捕获）。

<details>
<summary>💡 查看答案</summary>

```python
import re

date_str = '2024-12-25'
m = re.search(r'(\d{4})-(\d{2})-(\d{2})', date_str)
year, month, day = m.groups()
print(year, month, day)  # 2024 12 25
```

**解析**：每个 `(...)` 是一个分组，`m.groups()` 返回所有分组的元组，可以直接解包。
</details>

### 进阶练习

**题目 3**：验证密码强度（至少 8 位，包含大小写字母和数字）。

<details>
<summary>💡 查看答案</summary>

```python
import re

def is_strong_password(pwd: str) -> bool:
    if len(pwd) < 8:
        return False
    if not re.search(r'[a-z]', pwd):
        return False
    if not re.search(r'[A-Z]', pwd):
        return False
    if not re.search(r'\d', pwd):
        return False
    return True

print(is_strong_password('Abcdef1'))   # False（太短）
print(is_strong_password('abcdefg1'))  # False（没大写）
print(is_strong_password('Abcdefgh'))  # False（没数字）
print(is_strong_password('Abcd1234'))  # True
```

**解析**：与其写一个超长的正则一次性校验所有规则，不如拆成多个 `re.search` 分别检查——更易读、也更容易加新规则。
</details>

**题目 4**：把日志 `'2024-12-25 10:30 ERROR login failed'` 中的日期、级别、消息分别提取出来。

<details>
<summary>💡 查看答案</summary>

```python
import re

log = '2024-12-25 10:30 ERROR login failed'
m = re.match(r'(\S+ \S+) (\w+) (.*)', log)
ts, level, msg = m.groups()
print(ts, level, msg)
# 2024-12-25 10:30 ERROR login failed
```

**解析**：`\S` 是"非空白字符"，`*` 量词让消息部分能包含空格。`\w+` 匹配单词级别的级别名。
</details>

### 挑战练习

**题目 5**：编写函数 `mask_phone(text)`，把字符串里所有手机号中间 4 位替换为 `****`。

<details>
<summary>💡 查看答案</summary>

```python
import re

def mask_phone(text: str) -> str:
    return re.sub(r'(\d{3})\d{4}(\d{4})', r'\1****\2', text)

print(mask_phone('联系电话 13812345678，备用 13987654321'))
# 联系电话 138****5678，备用 139****4321
```

**解析**：`\1` 和 `\2` 是反向引用，在替换字符串里还原前面分组捕获的内容。
</details>

**题目 6**：编写函数，把 HTML 标签 `<a href="x">text</a>` 提取成纯文本 `text`（提示：用非贪婪）。

<details>
<summary>💡 查看答案</summary>

```python
import re

def strip_tags(html: str) -> str:
    # 用非贪婪 .*? 避免"吃掉"中间的标签
    return re.sub(r'<.*?>', '', html)

print(strip_tags('<a href="x">hello</a> <b>world</b>'))
# hello world
```

**解析**：生产环境解析 HTML 请用 `BeautifulSoup`，正则解析 HTML 是出了名的脆弱。这里只是练习非贪婪匹配。
</details>

## 费曼学习法检验

用自己的话回答以下问题（不要看上面的内容）：

1. **这是什么**：用一句话解释"正则表达式"和"普通字符串方法"的区别？

2. **为什么需要**：什么场景下字符串方法搞不定，必须用正则？什么场景下应该优先用字符串方法？

3. **怎么用**：
   - `re.match` 和 `re.search` 有什么区别？为什么新手常踩坑？
   - 给一个完全不懂编程的人解释"贪婪" vs "非贪婪"匹配。
   - `\d` 和 `[0-9]` 等价吗？

4. **注意事项**：
   - 想匹配字面值 `3.14` 时，正则应该怎么写？为什么 `'3.14'` 不行？
   - 用正则解析 HTML 为什么不可靠？应该改用什么工具？

::: tip 学习建议
正则的核心就三件事：**字符类**（`\d`、`\w`、`\s`）、**量词**（`*`、`+`、`?`、`{n,m}`）、**分组**（`(...)`）。先把这三类记住，其他遇到再查。能用字符串方法就别上正则——可读性差很多。
:::
