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
