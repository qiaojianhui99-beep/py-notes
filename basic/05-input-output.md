# 输入输出

## 核心概念

程序需要和用户交流。输出是程序把结果显示出来，输入是用户把数据交给程序。

- `print()`：把内容输出到屏幕。
- `input()`：从键盘读取用户输入。

```python
name = input("请输入姓名: ")
print("你好，", name)
```

注意：`input()` 读到的内容永远是字符串。

## print() 函数

### 基本用法

```python
print("Hello")
print(123)
print(3.14)
```

### 输出多个值

```python
name = "Alice"
age = 18

print("姓名:", name, "年龄:", age)
```

输出结果：

```text
姓名: Alice 年龄: 18
```

### sep 参数

`sep` 用来设置多个值之间的分隔符。

```python
print("2026", "06", "12", sep="-")
```

输出：

```text
2026-06-12
```

### end 参数

`end` 用来设置输出结束后追加什么内容。默认是换行。

```python
print("Hello", end=" ")
print("World")
```

输出：

```text
Hello World
```

## input() 函数

`input()` 会暂停程序，等待用户输入。

```python
name = input("请输入姓名: ")
print("你好，" + name)
```

如果要输入数字，需要手动转换类型：

```python
age_text = input("请输入年龄: ")
age = int(age_text)
print(age)
```

也可以写成一行：

```python
age = int(input("请输入年龄: "))
print(age)
```

如果用户输入的不是合法数字，转换会报错。异常处理后面会学习。

## 格式化输出

格式化输出可以把变量自然地放进文本中。

### f-string

推荐使用 f-string：

```python
name = "Alice"
age = 18

print(f"我叫{name}，今年{age}岁")
```

f-string 中可以写简单表达式：

```python
age = 18
print(f"明年 {age + 1} 岁")
```

### format() 方法

```python
print("我叫{}，今年{}岁".format("Alice", 18))
```

### 旧式 `%` 格式化

```python
print("我叫%s，今年%d岁" % ("Alice", 18))
```

新代码优先使用 f-string，旧代码中可能会见到 `format()` 和 `%`。

## 常用格式控制

### 保留小数

```python
price = 19.987
print(f"{price:.2f}")  # 19.99
```

### 对齐宽度

```python
print(f"{'Python':<10}|")  # 左对齐
print(f"{'Python':>10}|")  # 右对齐
print(f"{'Python':^10}|")  # 居中
```

### 填充字符

```python
print(f"{42:0>5}")  # 00042
print(f"{42:*>5}")  # ***42
```

## 使用场景

### 场景 1：命令行交互

```python
name = input("请输入姓名: ")
print(f"欢迎你，{name}")
```

### 场景 2：显示计算结果

```python
price = 19.9
count = 3
print(f"总价: {price * count:.2f}")
```

### 场景 3：输出对齐内容

```python
print(f"{'商品':<10}{'价格':>8}")
print(f"{'键盘':<10}{199:>8}")
```

### 场景 4：临时查看变量

```python
score = 95
print(f"当前分数: {score}")
```

## 练习题

### 基础练习

**题目 1**：输入姓名和年龄，输出 `我叫XXX，今年XX岁`。

<details>
<summary>💡 查看答案</summary>

```python
name = input("请输入姓名: ")
age = input("请输入年龄: ")

print(f"我叫{name}，今年{age}岁")
```
</details>

**题目 2**：输入两个数字，输出它们的和。

<details>
<summary>💡 查看答案</summary>

```python
a = float(input("请输入第一个数字: "))
b = float(input("请输入第二个数字: "))

print(f"两数之和是: {a + b}")
```
</details>

### 进阶练习

**题目 3**：输出数字 `42`，要求宽度为 8，右对齐，左侧用 `0` 填充。

<details>
<summary>💡 查看答案</summary>

```python
print(f"{42:0>8}")  # 00000042
```
</details>

### 挑战练习

**题目 4**：已知商品名、单价和数量，输出一张简单小票，金额保留 2 位小数。

<details>
<summary>💡 查看答案</summary>

```python
name = "键盘"
price = 199.0
count = 2
total = price * count

print(f"{'商品':<8}{'单价':>8}{'数量':>6}{'总价':>10}")
print(f"{name:<8}{price:>8.2f}{count:>6}{total:>10.2f}")
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：`print()` 和 `input()` 分别做什么？
2. **为什么需要**：为什么 `input()` 得到的数字要先转换类型？
3. **怎么用**：如何用 f-string 把变量放进一句话里？
4. **注意事项**：格式化输出中 `.2f` 表示什么？

::: tip 学习建议
输入输出是让程序“能被人使用”的第一步。先练熟 f-string，它会贯穿后面的所有章节。
:::
