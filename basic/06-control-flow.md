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
