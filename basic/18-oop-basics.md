# 面向对象基础

## 核心概念

面向对象是一种组织代码的方式。它把数据和操作数据的函数放在一起，形成“对象”。

先看一个简单例子：

```python
class Dog:
    def bark(self):
        print("汪汪")

my_dog = Dog()
my_dog.bark()
```

这里：

- `Dog` 是类，像一张设计图。
- `my_dog` 是对象，也叫实例。
- `bark()` 是对象能执行的方法。

## 类与对象

类用于描述一类事物，对象是根据类创建出来的具体事物。

```python
class Student:
    pass

student1 = Student()
student2 = Student()
```

`student1` 和 `student2` 都来自 `Student` 类，但它们是两个不同对象。

## __init__ 构造方法

`__init__` 会在创建对象时自动执行，常用于设置初始属性。

```python
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age

student = Student("Alice", 18)

print(student.name)
print(student.age)
```

`self.name = name` 的意思是：把传入的 `name` 保存到当前对象身上。

## self 关键字

`self` 代表当前对象本身。

```python
class Person:
    def __init__(self, name):
        self.name = name

    def greet(self):
        print(f"你好，我是 {self.name}")

person = Person("Alice")
person.greet()
```

调用时写 `person.greet()`，定义方法时要写 `self`。这是 Python 的约定和语法要求。

## 实例属性

实例属性属于具体对象。不同对象可以有不同的属性值。

```python
class Dog:
    def __init__(self, name):
        self.name = name

dog1 = Dog("旺财")
dog2 = Dog("小白")

print(dog1.name)
print(dog2.name)
```

`dog1.name` 和 `dog2.name` 互不影响。

## 实例方法

实例方法是对象能执行的操作。

```python
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

rect = Rectangle(5, 3)
print(rect.area())
```

方法内部可以通过 `self` 使用对象自己的属性。

## 类属性

类属性属于类本身，通常用于所有对象共享的值。

```python
class Dog:
    species = "犬科"

    def __init__(self, name):
        self.name = name

dog1 = Dog("旺财")
dog2 = Dog("小白")

print(dog1.species)
print(dog2.species)
print(Dog.species)
```

如果每个对象的值都不同，用实例属性；如果所有对象共享一个值，可以考虑类属性。

## 简单封装

封装是把数据和操作数据的方法放在一起，并通过方法控制如何修改数据。

```python
class BankAccount:
    def __init__(self, balance):
        self.balance = balance

    def deposit(self, amount):
        if amount > 0:
            self.balance += amount

    def withdraw(self, amount):
        if 0 < amount <= self.balance:
            self.balance -= amount
        else:
            print("余额不足或金额无效")

    def show_balance(self):
        print(f"当前余额: {self.balance}")
```

这样，账户余额的修改规则就集中在类的方法里，而不是散落在程序各处。

## 命名约定

Python 中单下划线开头的属性表示“内部使用，不建议外部直接访问”。

```python
class User:
    def __init__(self, name):
        self._name = name
```

这是约定，不是强制限制。初学阶段先遵守这个阅读习惯即可。

## 使用场景

### 场景 1：描述现实中的对象

```python
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
```

### 场景 2：把数据和操作放在一起

```python
class Counter:
    def __init__(self):
        self.count = 0

    def add(self):
        self.count += 1
```

### 场景 3：减少重复代码

```python
student1 = Student("Alice", 90)
student2 = Student("Bob", 85)
```

### 场景 4：表达业务规则

```python
class Order:
    def __init__(self, price, count):
        self.price = price
        self.count = count

    def total(self):
        return self.price * self.count
```

## 易错点

### 易错点 1：`__init__` 中忘记 `self` 参数

❌ **错误示例**：
```python
class Person:
    def __init__(name, age):  # TypeError: __init__() takes 2 positional arguments but 3 were given
        self.name = name
        self.age = age

person = Person("Alice", 18)
```

✅ **正确示例**：
```python
class Person:
    def __init__(self, name, age):  # 第一个参数必须是 self
        self.name = name
        self.age = age

person = Person("Alice", 18)
```

**说明**：类方法的第一个参数必须是 `self`，表示实例本身。即使是 `__init__` 也不例外。

### 易错点 2：实例属性和类属性混淆

❌ **错误示例**：
```python
class Counter:
    count = 0  # 类属性
    
    def __init__(self):
        count = 1  # 局部变量，不是实例属性

c = Counter()
print(c.count)  # 0，不是 1
```

✅ **正确做法**：
```python
class Counter:
    count = 0  # 类属性
    
    def __init__(self):
        self.count = 1  # 实例属性，会覆盖类属性

c = Counter()
print(c.count)  # 1
print(Counter.count)  # 0（类属性未改变）
```

**说明**：实例属性必须用 `self.属性名` 定义。不加 `self` 只是局部变量，不会成为实例属性。

### 易错点 3：方法调用忘记加括号

❌ **错误示例**：
```python
class Calculator:
    def add(self, a, b):
        return a + b

calc = Calculator()
print(calc.add)  # <bound method Calculator.add of ...>，不是结果
```

✅ **正确示例**：
```python
class Calculator:
    def add(self, a, b):
        return a + b

calc = Calculator()
print(calc.add(3, 5))  # 8，加括号并传参
```

**说明**：方法名后必须加括号才能调用。不加括号只是获取方法对象的引用。

## 练习题

### 基础练习

**题目 1**：创建 `Rectangle` 类，包含宽、高属性和计算面积的方法。

<details>
<summary>💡 查看答案</summary>

```python
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

rect = Rectangle(5, 3)
print(rect.area())
```
</details>

### 进阶练习

**题目 2**：创建 `Student` 类，包含姓名、分数，并提供 `is_passed()` 方法判断是否及格。

<details>
<summary>💡 查看答案</summary>

```python
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

    def is_passed(self):
        return self.score >= 60

student = Student("Alice", 85)
print(student.name)
print(student.is_passed())
```
</details>

### 挑战练习

**题目 3**：创建 `BankAccount` 类，包含存款、取款、查询余额功能。

<details>
<summary>💡 查看答案</summary>

```python
class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance

    def deposit(self, amount):
        if amount > 0:
            self.balance += amount

    def withdraw(self, amount):
        if 0 < amount <= self.balance:
            self.balance -= amount
        else:
            print("余额不足或金额无效")

    def get_balance(self):
        return self.balance

account = BankAccount(100)
account.deposit(50)
account.withdraw(30)
print(account.get_balance())
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：类和对象分别是什么？
2. **为什么需要**：为什么要把数据和方法放在同一个类里？
3. **怎么用**：`__init__` 和 `self` 分别有什么作用？
4. **注意事项**：实例属性和类属性有什么区别？

::: tip 学习建议
面向对象入门时先抓住一句话：类是模板，对象是具体实例，方法是对象能做的事。
:::
