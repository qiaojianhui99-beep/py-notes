# 控制流

## 核心概念

控制流决定程序下一步执行哪段代码。没有控制流，程序只能从上到下一行行执行；有了控制流，程序就能根据条件做不同选择。

```python
score = 85

if score >= 60:
    print("及格")
else:
    print("不及格")
```

## if 语句

`if` 用来表示“如果条件成立，就执行下面的代码”。

```python
age = 18

if age >= 18:
    print("成年人")
```

条件表达式的结果必须能判断真假，通常是比较运算或逻辑运算。

## if-else 语句

`else` 表示条件不成立时执行的分支。

```python
age = 16

if age >= 18:
    print("成年人")
else:
    print("未成年人")
```

## if-elif-else 语句

当选择不止两种时，使用 `elif`。

```python
score = 85

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

Python 会从上到下检查条件，遇到第一个成立的分支后，就不会继续检查后面的分支。

## 嵌套条件

一个条件语句里面还可以写另一个条件语句。

```python
age = 20
has_ticket = True

if age >= 18:
    if has_ticket:
        print("可以入场")
    else:
        print("请先买票")
else:
    print("未成年人暂不能入场")
```

嵌套不要太深。条件太复杂时，可以先把判断结果保存到变量里。

```python
age = 20
has_ticket = True

can_enter = age >= 18 and has_ticket
print(can_enter)
```

## 三元表达式

三元表达式适合简单的二选一赋值。

```python
age = 20
status = "成年人" if age >= 18 else "未成年人"

print(status)
```

如果逻辑变复杂，优先使用普通的 `if-else`。

## 多条件判断

可以使用 `and`、`or`、`not` 组合条件。

```python
age = 25

if age >= 18 and age < 60:
    print("成年劳动力")

if age < 18 or age >= 60:
    print("非劳动年龄")

is_student = False
if not is_student:
    print("不是学生")
```

## match-case 语句

`match-case` 是 Python 3.10+ 的语法，适合处理多个固定选项。

```python
command = "add"

match command:
    case "add":
        print("执行新增")
    case "delete":
        print("执行删除")
    case "query":
        print("执行查询")
    case _:
        print("未知命令")
```

如果只是少量条件，`if-elif-else` 已经足够。`match-case` 更适合选项很多、结构清晰的场景。

## 使用场景

### 场景 1：判断输入是否有效

```python
age = int(input("请输入年龄: "))

if age >= 0:
    print("年龄有效")
else:
    print("年龄不能为负数")
```

### 场景 2：根据分数给等级

```python
score = 92

if score >= 90:
    print("优秀")
else:
    print("继续努力")
```

### 场景 3：简单菜单选择

```python
choice = "1"

if choice == "1":
    print("查看信息")
elif choice == "2":
    print("修改信息")
else:
    print("未知选项")
```

### 场景 4：计算不同规则下的价格

```python
age = 10

if age < 12:
    print("儿童票")
else:
    print("成人票")
```

## 练习题

### 基础练习

**题目 1**：输入一个分数，输出等级：`优秀`、`良好`、`及格`、`不及格`。

<details>
<summary>💡 查看答案</summary>

```python
score = int(input("请输入分数: "))

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```
</details>

**题目 2**：输入年龄，判断票价：12 岁以下 20 元，12 岁及以上 40 元。

<details>
<summary>💡 查看答案</summary>

```python
age = int(input("请输入年龄: "))

if age < 12:
    print("票价: 20 元")
else:
    print("票价: 40 元")
```
</details>

### 进阶练习

**题目 3**：制作一个简单计算器，输入两个数字和运算符，输出结果。只需要支持 `+`、`-`、`*`、`/`。

<details>
<summary>💡 查看答案</summary>

```python
a = float(input("第一个数: "))
op = input("运算符 (+、-、*、/): ")
b = float(input("第二个数: "))

if op == "+":
    print(a + b)
elif op == "-":
    print(a - b)
elif op == "*":
    print(a * b)
elif op == "/":
    if b == 0:
        print("除数不能为 0")
    else:
        print(a / b)
else:
    print("未知运算符")
```
</details>

### 挑战练习

**题目 4**：输入身高和体重，计算 BMI，并输出 `偏瘦`、`正常`、`偏胖`。

<details>
<summary>💡 查看答案</summary>

```python
height = float(input("请输入身高（米）: "))
weight = float(input("请输入体重（千克）: "))

bmi = weight / (height ** 2)

if bmi < 18.5:
    print(f"BMI: {bmi:.1f}，偏瘦")
elif bmi < 24:
    print(f"BMI: {bmi:.1f}，正常")
else:
    print(f"BMI: {bmi:.1f}，偏胖")
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：`if`、`elif`、`else` 分别表示什么？
2. **为什么需要**：为什么条件顺序会影响程序结果？
3. **怎么用**：如何判断一个数字是否在某个范围内？
4. **注意事项**：什么时候应该避免写太深的嵌套条件？

::: tip 学习建议
控制流的重点不是背语法，而是把规则拆成清楚的条件。写条件前，先用中文说清楚判断规则。
:::
