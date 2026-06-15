# 字符串操作

## 核心概念

字符串是文本数据，类型是 `str`。姓名、消息、路径、邮箱、命令行输入，本质上都经常用字符串表示。

```python
name = "Alice"
message = "Hello, Python"
```

字符串是有顺序的，每个字符都有位置编号，这个编号叫索引。

## 字符串定义

可以使用单引号或双引号：

```python
s1 = "Hello"
s2 = 'World'
```

多行字符串使用三引号：

```python
text = """第一行
第二行
第三行"""
```

如果字符串中包含引号，可以交替使用：

```python
message = "I'm learning Python"
quote = '他说："你好"'
```

## 索引

索引从 `0` 开始。

```python
word = "Python"

print(word[0])   # P
print(word[1])   # y
print(word[-1])  # n
```

负数索引从右往左数，`-1` 表示最后一个字符。

## 切片

切片用于取出字符串的一部分。

```python
word = "Python"

print(word[0:3])   # Pyt
print(word[:3])    # Pyt
print(word[3:])    # hon
print(word[::2])   # Pto
print(word[::-1])  # nohtyP
```

切片格式：

```text
字符串[start:stop:step]
```

`stop` 位置不会被包含。

## 字符串拼接和重复

使用 `+` 拼接字符串：

```python
first_name = "Alice"
last_name = "Green"

full_name = first_name + " " + last_name
print(full_name)
```

使用 `*` 重复字符串：

```python
line = "-" * 20
print(line)
```

## 常用方法

字符串方法是 `str` 类型自带的操作。调用格式通常是：

```text
字符串.方法名(参数)
```

例如：

```python
text = "Hello Python"
new_text = text.replace("Python", "World")

print(new_text)  # Hello World
print(text)      # Hello Python
```

`text.replace("Python", "World")` 可以拆成四部分理解：

1. `text`：要处理的原字符串
2. `replace`：要执行的动作，意思是“替换”
3. `"Python", "World"`：方法需要的参数，表示把 `"Python"` 换成 `"World"`
4. 返回值：得到一个新字符串，原来的 `text` 不会被直接修改

学习字符串方法时，不要先背方法名，而是按下面的标准判断：

| 你想做什么 | 优先考虑的方法或写法 | 返回结果 |
|------------|----------------------|----------|
| 去掉首尾空白 | `strip()` / `lstrip()` / `rstrip()` | 新字符串 |
| 统一大小写 | `lower()` / `upper()` | 新字符串 |
| 判断是否包含内容 | `in` | `True` 或 `False` |
| 判断开头或结尾 | `startswith()` / `endswith()` | `True` 或 `False` |
| 查找位置 | `find()` | 索引位置，找不到返回 `-1` |
| 统计出现次数 | `count()` | 整数 |
| 替换内容 | `replace()` | 新字符串 |
| 拆成多段 | `split()` | 列表 |
| 把多段合成字符串 | `join()` | 新字符串 |
| 判断字符类型 | `isdigit()` / `isalpha()` / `isalnum()` | `True` 或 `False` |

### 去除空白：`strip()`、`lstrip()`、`rstrip()`

这三个方法用于清理字符串两端的空白字符。空白字符包括空格、换行 `\n`、制表符 `\t` 等。

```python
text = "  Hello  "

print(repr(text.strip()))   # 'Hello'
print(repr(text.lstrip()))  # 'Hello  '
print(repr(text.rstrip()))  # '  Hello'
```

选择标准：

- 两边都要清理：用 `strip()`
- 只清理左边：用 `lstrip()`
- 只清理右边：用 `rstrip()`

`repr()` 可以把字符串中的空格显示出来，便于观察区别。实际项目中，处理用户输入时经常先用 `strip()`：

```python
name = input("请输入姓名: ").strip()
```

### 大小写转换：`lower()`、`upper()`、`capitalize()`、`title()`

大小写方法用于改变英文字母的显示形式。

```python
text = "hello python"

print(text.upper())       # HELLO PYTHON
print(text.lower())       # hello python
print(text.capitalize())  # Hello python
print(text.title())       # Hello Python
```

选择标准：

- 做不区分大小写的比较：通常先用 `lower()`
- 生成全大写显示文本：用 `upper()`
- 只让句子第一个字符大写：用 `capitalize()`
- 让每个单词首字母大写：用 `title()`

```python
answer = " YES "

if answer.strip().lower() == "yes":
    print("用户同意")
```

这行代码从左到右执行：先用 `strip()` 去掉首尾空白，再用 `lower()` 统一成小写，最后和 `"yes"` 比较。

### 查找内容：`in`、`find()`、`count()`

如果只关心“有没有”，优先使用 `in`，它最清楚。

```python
email = "user@example.com"

print("@" in email)  # True
```

如果需要知道内容出现的位置，使用 `find()`：

```python
text = "Hello Python"

print(text.find("Python"))  # 6
print(text.find("Java"))    # -1
```

`find()` 返回的是索引位置，找不到时返回 `-1`。

如果需要知道出现了几次，使用 `count()`：

```python
text = "banana"

print(text.count("a"))   # 3
print(text.count("na"))  # 2
```

选择标准：

- 只判断是否包含：用 `in`
- 需要位置：用 `find()`
- 需要次数：用 `count()`

### 开头和结尾判断：`startswith()`、`endswith()`

这两个方法用于判断字符串是否以指定内容开头或结尾。

```python
filename = "report.pdf"

print(filename.startswith("report"))  # True
print(filename.endswith(".pdf"))      # True
```

它们比手写切片更直观：

```python
url_path = "/basic/08-string"

if url_path.startswith("/basic/"):
    print("这是基础章节")
```

### 替换内容：`replace()`

`replace(old, new)` 用于把字符串中的旧内容替换为新内容。

```python
text = "Hello Python"
new_text = text.replace("Python", "World")

print(new_text)  # Hello World
```

注意：`replace()` 不会修改原字符串，而是返回新字符串。如果希望保存结果，需要重新赋值：

```python
phone = "138 0000 0000"
phone = phone.replace(" ", "")

print(phone)  # 13800000000
```

选择标准：

- 要把固定文本换成另一个固定文本：用 `replace()`
- 要根据复杂规则替换：后面学习正则表达式时再用 `re.sub()`

### 拆分和合并：`split()`、`join()`

`split()` 把一个字符串拆成多个部分，返回列表。

```python
sentence = "Python is easy"
words = sentence.split(" ")

print(words)  # ['Python', 'is', 'easy']
```

如果不传参数，`split()` 会按连续空白拆分，更适合处理普通句子：

```python
text = "Python   is\teasy"

print(text.split())  # ['Python', 'is', 'easy']
```

`join()` 和 `split()` 相反，它把多个字符串合成一个字符串。

```python
words = ["Python", "is", "easy"]
sentence = " ".join(words)

print(sentence)  # Python is easy
```

选择标准：

- 一段文本要按分隔符切开：用 `split()`
- 多段文本要用分隔符连起来：用 `join()`

### 判断字符类型：`isdigit()`、`isalpha()`、`isalnum()`

这些方法用于判断字符串里的字符属于哪一类。

```python
print("123".isdigit())     # True，只包含数字
print("Python".isalpha())  # True，只包含字母
print("Python3".isalnum())  # True，只包含字母或数字
print("Py 3".isalnum())    # False，里面有空格
```

常见选择标准：

- 判断是否能当作正整数输入：先考虑 `isdigit()`
- 判断是否全是字母：用 `isalpha()`
- 判断是否只包含字母和数字：用 `isalnum()`

```python
age_text = input("请输入年龄: ").strip()

if age_text.isdigit():
    age = int(age_text)
    print(f"明年你 {age + 1} 岁")
else:
    print("年龄必须是数字")
```

`isdigit()` 只能处理类似 `"18"` 这样的数字字符串。负数、小数、带单位的内容都不会返回 `True`。

## 成员判断

可以用 `in` 判断字符串中是否包含某段内容：

```python
email = "user@example.com"

print("@" in email)      # True
print(".com" in email)   # True
```

## 转义字符

有些字符需要特殊写法。

```python
print("Hello\nWorld")      # 换行
print("Hello\tWorld")      # 制表符
print("He said \"Hi\"")    # 双引号
print("C:\\Users\\Alice")  # 反斜杠
```

如果路径中反斜杠很多，可以使用原始字符串：

```python
path = r"C:\Users\Alice"
print(path)
```

## 字符串不可变

字符串创建后，不能直接修改其中某个字符。

```python
word = "Python"
# word[0] = "J"  # 会报错
```

如果需要“修改”，通常是创建一个新字符串：

```python
word = "Python"
new_word = "J" + word[1:]
print(new_word)  # Jython
```

## 使用场景

### 场景 1：清理用户输入

```python
name = "  Alice  "
clean_name = name.strip()
```

### 场景 2：检查简单格式

```python
email = "user@example.com"
is_email_like = "@" in email and "." in email
```

### 场景 3：生成显示文本

```python
name = "Alice"
message = f"欢迎你，{name}"
```

### 场景 4：逐个处理字符

```python
word = "Python"

for char in word:
    print(char)
```

### 场景 5：拆分一行文本

```python
line = "Alice,18,Python"
name, age, course = line.split(",")

print(name)
print(age)
print(course)
```

## 易错点

### 易错点 1：尝试修改字符串中的字符

❌ **错误示例**：
```python
text = "Python"
text[0] = "J"  # TypeError: 'str' object does not support item assignment
```

✅ **正确做法**：
```python
text = "Python"
# 创建新字符串
text = "J" + text[1:]
print(text)  # Jython
```

**说明**：字符串是不可变的，不能直接修改某个字符。只能创建新字符串。

### 易错点 2：切片索引越界不会报错

❌ **容易误解**：
```python
text = "Python"
print(text[10])  # IndexError: string index out of range
print(text[10:15])  # 空字符串 ""，不报错
```

✅ **正确理解**：
```python
text = "Python"
# 单个索引越界会报错
# print(text[10])  # 报错

# 切片越界不报错，返回空字符串或部分内容
print(text[10:15])  # ""
print(text[2:100])  # "thon"
```

**说明**：访问单个索引越界会报错，但切片越界不会报错，返回空或部分内容。

### 易错点 3：`find()` 找不到时返回 -1

❌ **错误示例**：
```python
text = "Hello Python"
if text.find("Java"):  # -1 在布尔上下文中是 True
    print("找到了")  # 会错误地输出
```

✅ **正确做法**：
```python
text = "Hello Python"
# 方法 1：判断是否不等于 -1
if text.find("Java") != -1:
    print("找到了")

# 方法 2：使用 in（推荐）
if "Java" in text:
    print("找到了")
```

**说明**：`find()` 找不到时返回 `-1`，不是 `False`。判断时要显式比较或使用 `in`。

## 练习题

### 基础练习

**题目 1**：统计字符串 `"Hello World"` 中字母 `l` 出现的次数。

<details>
<summary>💡 查看答案</summary>

```python
text = "Hello World"
print(text.count("l"))  # 3
```
</details>

**题目 2**：判断字符串是否同时包含 `@` 和 `.`。

<details>
<summary>💡 查看答案</summary>

```python
email = "user@example.com"

if "@" in email and "." in email:
    print("格式可能正确")
else:
    print("格式可能不正确")
```
</details>

### 进阶练习

**题目 3**：输入一句话，输出去除首尾空白后的内容、全大写内容和反转后的内容。

<details>
<summary>💡 查看答案</summary>

```python
text = input("请输入一句话: ")
clean_text = text.strip()

print(clean_text)
print(clean_text.upper())
print(clean_text[::-1])
```
</details>

### 挑战练习

**题目 4**：输入一个密码，检查它是否至少 8 位，并且同时包含数字和字母。

<details>
<summary>💡 查看答案</summary>

```python
password = input("请输入密码: ")

has_digit = False
has_alpha = False

for char in password:
    if char.isdigit():
        has_digit = True
    if char.isalpha():
        has_alpha = True

if len(password) >= 8 and has_digit and has_alpha:
    print("密码格式合格")
else:
    print("密码至少 8 位，并且要包含数字和字母")
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：字符串、索引、切片分别是什么？
2. **为什么需要**：为什么字符串不能直接修改某个字符？
3. **怎么用**：看到 `text.strip().lower()` 时，你能按执行顺序解释每一步吗？
4. **注意事项**：`find()` 找不到内容时会返回什么？为什么判断是否包含时更推荐 `in`？

::: tip 学习建议
字符串方法很多，不需要一次背完。先掌握索引、切片、`strip()`、`replace()`、`split()`、`join()`、`count()` 和成员判断。每次学习新方法时，都按“处理谁、做什么、要什么参数、返回什么结果”这四步理解。
:::
