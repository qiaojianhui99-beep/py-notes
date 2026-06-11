# 输入输出

## print() 函数

### 基本用法

```python
print("Hello")
print(123)
print(3.14)
```

### 多个参数

```python
print("Name:", "Alice", "Age:", 25)
# 输出: Name: Alice Age: 25
```

### sep 参数（分隔符）

```python
print("A", "B", "C", sep="-")
# 输出: A-B-C
```

### end 参数（结尾符）

```python
print("Hello", end=" ")
print("World")
# 输出: Hello World
```

## input() 函数

```python
name = input("请输入姓名: ")
print("你好,", name)

# 输入数字需要类型转换
age = int(input("请输入年龄: "))
```

## 格式化输出

### 1. f-string（推荐，Python 3.6+）

```python
name = "Alice"
age = 25
print(f"我叫{name}, 今年{age}岁")
print(f"明年{age + 1}岁")

# Python 3.12+ 支持更复杂的表达式
items = [1, 2, 3]
print(f"项目: {items = }")  # 项目: items = [1, 2, 3]
print(f"{sum(items) = }")   # sum(items) = 6
```

### 2. format() 方法

```python
print("我叫{}, 今年{}岁".format("Alice", 25))
print("我叫{name}, 今年{age}岁".format(name="Alice", age=25))
```

### 3. % 格式化（旧式）

```python
print("我叫%s, 今年%d岁" % ("Alice", 25))
```

## 格式化选项

```python
# 保留小数位
pi = 3.1415926
print(f"{pi:.2f}")  # 3.14

# 对齐
print(f"{'左对齐':<10}|")
print(f"{'右对齐':>10}|")
print(f"{'居中':^10}|")

# 填充
print(f"{42:05}")  # 00042
```

## 使用场景

### 场景 1：日志记录
格式化输出运行时信息、错误日志。

### 场景 2：用户交互
命令行工具获取用户输入并反馈。

### 场景 3：数据展示
表格对齐、报表生成。

### 场景 4：调试输出
快速查看变量值和程序状态。

## 练习题

### 基础练习

**题目 1**：输入姓名和年龄，输出格式："我叫XXX，今年XX岁"。

<details>
<summary>💡 查看答案</summary>

```python
name = input("请输入姓名: ")
age = input("请输入年龄: ")
print(f"我叫{name}，今年{age}岁")
```
</details>

**题目 2**：输出一个右对齐宽度为 10 的数字 42，填充字符为 `*`。

<details>
<summary>💡 查看答案</summary>

```python
print(f"{42:*>10}")  # ********42
```
</details>

### 进阶练习

**题目 3**：制作一个简单计算器，输入两个数字和运算符，输出结果。

<details>
<summary>💡 查看答案</summary>

```python
a = float(input("第一个数: "))
op = input("运算符 (+,-,*,/): ")
b = float(input("第二个数: "))

if op == "+":
    print(f"{a} + {b} = {a + b}")
elif op == "-":
    print(f"{a} - {b} = {a - b}")
elif op == "*":
    print(f"{a} * {b} = {a * b}")
elif op == "/":
    print(f"{a} / {b} = {a / b if b != 0 else '错误'}")
```
</details>

### 挑战练习

**题目 4**：编写程序生成格式化的表格，输出商品清单（名称、单价、数量、总价）。

## 费曼学习法检验

1. **这是什么**：f-string、format() 和 % 格式化有什么区别？为什么推荐 f-string？

2. **为什么需要**：为什么 input() 返回的总是字符串？这带来什么问题？

3. **怎么用**：向新手解释如何控制浮点数显示的小数位数？

4. **注意事项**：`{var = }` 调试语法（Python 3.12+）有什么用？

::: tip 学习建议
掌握格式化输出能让程序输出更专业！多练习 f-string 的各种格式选项。
:::
