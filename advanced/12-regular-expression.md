# 正则表达式

正则表达式是文本处理的强大工具。

## re 模块

### 基本匹配

```python
import re

text = "手机号: 13812345678"

# 查找
match = re.search(r'\d{11}', text)
if match:
    print(match.group())  # 13812345678

# 查找所有
phones = re.findall(r'\d{11}', text)
```

### 常用函数

```python
# match：从开头匹配
re.match(r'\d+', '123abc')

# search：查找第一个匹配
re.search(r'\d+', 'abc123def')

# findall：查找所有
re.findall(r'\d+', 'a1b2c3')

# sub：替换
re.sub(r'\d+', 'X', 'a1b2')  # aXbX

# split：分割
re.split(r'\s+', 'a  b   c')  # ['a', 'b', 'c']
```

## 常用模式

### 基本字符

```python
\d  # 数字 [0-9]
\D  # 非数字
\w  # 字母数字下划线 [a-zA-Z0-9_]
\W  # 非字母数字下划线
\s  # 空白字符
\S  # 非空白字符
.   # 任意字符（除换行）
```

### 量词

```python
*   # 0 次或多次
+   # 1 次或多次
?   # 0 次或 1 次
{n}   # 恰好 n 次
{n,}  # 至少 n 次
{n,m} # n 到 m 次
```

### 分组捕获

```python
pattern = r'(\d{4})-(\d{2})-(\d{2})'
match = re.search(pattern, '2024-12-25')

print(match.group(0))  # 2024-12-25
print(match.group(1))  # 2024
print(match.group(2))  # 12
print(match.groups())  # ('2024', '12', '25')
```

### 命名分组

```python
pattern = r'(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})'
match = re.search(pattern, '2024-12-25')

print(match.group('year'))   # 2024
print(match.groupdict())     # {'year': '2024', ...}
```

## 实战示例

### 邮箱验证

```python
email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
email = 'user@example.com'
if re.match(email_pattern, email):
    print("有效邮箱")
```

### 提取 URL

```python
text = "访问 https://example.com 和 http://test.org"
urls = re.findall(r'https?://[\w\.-]+\.\w+', text)
```

### 手机号脱敏

```python
phone = "13812345678"
hidden = re.sub(r'(\d{3})\d{4}(\d{4})', r'\1****\2', phone)
print(hidden)  # 138****5678
```

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

**题目 1**：提取文本中所有的邮箱地址。

<details>
<summary>💡 查看答案</summary>

```python
import re

text = "联系我: user@example.com 或 admin@test.org"
emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
print(emails)
```
</details>

### 进阶练习

**题目 2**：验证密码强度（至少 8 位，包含大小写字母和数字）。

### 挑战练习

**题目 3**：编写函数，将 HTML 标签转换为纯文本。

## 费曼学习法检验

1. **这是什么**：贪婪匹配和非贪婪匹配有什么区别？

2. **为什么需要**：什么时候用正则，什么时候用字符串方法？

3. **怎么用**：向新手解释 `\d+` 和 `\d+?` 的区别？

4. **注意事项**：正则表达式的性能陷阱是什么？

::: tip 学习建议
正则表达式是文本处理利器！多练习常用模式。
:::
