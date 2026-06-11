# 控制流

## if 语句

```python
age = 18
if age >= 18:
    print("成年人")
```

## if-else 语句

```python
age = 16
if age >= 18:
    print("成年人")
else:
    print("未成年人")
```

## if-elif-else 语句

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

## 嵌套条件

```python
age = 25
has_license = True

if age >= 18:
    if has_license:
        print("可以驾驶")
    else:
        print("需要考驾照")
else:
    print("年龄不够")
```

## 三元表达式

```python
age = 20
status = "成年人" if age >= 18 else "未成年人"
```

## 多条件判断

```python
# and：所有条件都为真
age = 25
if age >= 18 and age < 60:
    print("成年劳动力")

# or：任一条件为真
if age < 18 or age >= 60:
    print("非劳动年龄")

# not：取反
is_student = False
if not is_student:
    print("非学生")
```

## match-case 语句（Python 3.10+）

模式匹配，比多个 if-elif 更清晰。

```python
# Python 3.10+ 写法
def http_status(code):
    match code:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case _:
            return "Unknown"

# 模式匹配更多示例
def process_command(command):
    match command.split():
        case ["quit"]:
            print("退出程序")
        case ["load", filename]:
            print(f"加载文件: {filename}")
        case ["save", filename]:
            print(f"保存文件: {filename}")
        case _:
            print("未知命令")

# 旧版本写法（Python 3.9-）
def http_status_old(code):
    if code == 200:
        return "OK"
    elif code == 404:
        return "Not Found"
    elif code == 500:
        return "Server Error"
    else:
        return "Unknown"
```

## 使用场景

### 场景 1：用户权限验证
根据用户角色执行不同操作。

### 场景 2：表单验证
检查用户输入是否符合规则。

### 场景 3：业务逻辑分支
订单状态处理、支付方式选择。

### 场景 4：数据过滤
根据条件筛选符合要求的数据。

## 练习题

### 基础练习

**题目 1**：输入一个分数（0-100），输出等级：优秀(>=90)、良好(>=80)、及格(>=60)、不及格。

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

### 进阶练习

**题目 2**：使用 match-case 实现一个简单的菜单系统（新增/删除/查询/退出）。

<details>
<summary>💡 查看答案</summary>

```python
command = input("请输入命令 (add/del/query/exit): ")
match command:
    case "add":
        print("执行新增操作")
    case "del":
        print("执行删除操作")
    case "query":
        print("执行查询操作")
    case "exit":
        print("退出系统")
    case _:
        print("未知命令")
```
</details>

### 挑战练习

**题目 3**：实现一个密码强度检测器，检查密码是否包含大写、小写、数字、特殊字符，给出强度评级。

## 费曼学习法检验

1. **这是什么**：if-elif-else 和 match-case 各适合什么场景？

2. **为什么需要**：为什么 Python 3.10 引入 match-case？它比 if-elif 好在哪？

3. **怎么用**：向新手解释三元表达式 `a if condition else b` 的执行顺序？

4. **注意事项**：`and`/`or` 的短路特性在条件判断中有什么实际用途？

::: tip 学习建议
match-case 让复杂分支更清晰！但要注意它是 Python 3.10+ 才有的特性。
:::
