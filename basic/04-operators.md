# 运算符

## 算术运算符

```python
a, b = 10, 3

a + b   # 13  加法
a - b   # 7   减法
a * b   # 30  乘法
a / b   # 3.333... 除法
a // b  # 3   整除
a % b   # 1   取余
a ** b  # 1000 幂运算
```

## 比较运算符

```python
a == b  # False 等于
a != b  # True  不等于
a > b   # True  大于
a < b   # False 小于
a >= b  # True  大于等于
a <= b  # False 小于等于
```

## 逻辑运算符

```python
True and False  # False
True or False   # True
not True        # False
```

## 赋值运算符

```python
x = 10
x += 5   # x = x + 5
x -= 3   # x = x - 3
x *= 2   # x = x * 2
x /= 4   # x = x / 4
```

## 成员运算符

```python
"a" in "apple"      # True
"z" not in "apple"  # True
```

## 身份运算符

```python
a = [1, 2, 3]
b = a
c = [1, 2, 3]

a is b      # True  (同一对象)
a is c      # False (不同对象)
a == c      # True  (值相等)
```

## 运算符优先级

从高到低：
1. `**` (幂运算)
2. `*`, `/`, `//`, `%`
3. `+`, `-`
4. `==`, `!=`, `>`, `<`, `>=`, `<=`
5. `not`
6. `and`
7. `or`
