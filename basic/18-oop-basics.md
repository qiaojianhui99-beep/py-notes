# 面向对象基础

## 类与对象

```python
# 定义类
class Dog:
    pass

# 创建对象
my_dog = Dog()
```

## `__init__` 构造方法

```python
class Dog:
    def __init__(self, name, age):
        self.name = name  # 实例属性
        self.age = age
    
    def bark(self):       # 实例方法
        print(f"{self.name} 汪汪叫!")

# 创建对象
my_dog = Dog("旺财", 3)
print(my_dog.name)  # 旺财
my_dog.bark()       # 旺财 汪汪叫!
```

## self 关键字

`self` 代表实例本身，必须是实例方法的第一个参数。

```python
class Person:
    def __init__(self, name):
        self.name = name
    
    def greet(self):
        print(f"你好, 我是 {self.name}")

person = Person("Alice")
person.greet()  # 你好, 我是 Alice
```

## 实例属性 vs 类属性

```python
class Dog:
    # 类属性（所有实例共享）
    species = "犬科"
    
    def __init__(self, name):
        # 实例属性（每个实例独有）
        self.name = name

dog1 = Dog("旺财")
dog2 = Dog("小白")

print(dog1.species)  # 犬科
print(Dog.species)   # 犬科

dog1.name  # 旺财
dog2.name  # 小白
```

## 实例方法、类方法、静态方法

```python
class MyClass:
    count = 0
    
    def __init__(self):
        MyClass.count += 1
    
    # 实例方法
    def instance_method(self):
        return f"实例方法, count={self.count}"
    
    # 类方法
    @classmethod
    def class_method(cls):
        return f"类方法, count={cls.count}"
    
    # 静态方法
    @staticmethod
    def static_method():
        return "静态方法"

obj = MyClass()
obj.instance_method()       # 实例调用
MyClass.class_method()      # 类调用
MyClass.static_method()     # 类调用
```

## 私有属性和方法

使用双下划线 `__` 前缀。

```python
class BankAccount:
    def __init__(self, balance):
        self.__balance = balance  # 私有属性
    
    def __validate(self):         # 私有方法
        return self.__balance >= 0
    
    def deposit(self, amount):
        self.__balance += amount
    
    def get_balance(self):
        return self.__balance

account = BankAccount(1000)
# print(account.__balance)  # 错误！
print(account.get_balance())  # 1000
```

## 属性装饰器

```python
class Person:
    def __init__(self, name):
        self._name = name
    
    @property
    def name(self):
        return self._name
    
    @name.setter
    def name(self, value):
        if not value:
            raise ValueError("名字不能为空")
        self._name = value

person = Person("Alice")
print(person.name)  # Alice (调用 getter)
person.name = "Bob" # 调用 setter
```

## 特殊方法（魔法方法）

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __str__(self):
        # print() 时调用
        return f"Point({self.x}, {self.y})"
    
    def __repr__(self):
        # 交互式解释器显示
        return f"Point({self.x}, {self.y})"
    
    def __add__(self, other):
        # + 运算符
        return Point(self.x + other.x, self.y + other.y)
    
    def __eq__(self, other):
        # == 运算符
        return self.x == other.x and self.y == other.y

p1 = Point(1, 2)
p2 = Point(3, 4)
print(p1)       # Point(1, 2)
p3 = p1 + p2    # Point(4, 6)
```

## 使用场景

### 场景 1：数据建模
用户、订单、商品等业务对象。

### 场景 2：代码复用
通过继承共享代码逻辑。

### 场景 3：框架开发
Django Model、Flask View。

### 场景 4：游戏开发
角色、道具、场景对象。

## 练习题

### 基础练习

**题目 1**：创建 `Rectangle` 类，包含长宽属性和计算面积的方法。

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
print(rect.area())  # 15
```
</details>

### 进阶练习

**题目 2**：创建 `BankAccount` 类，包含存款、取款、查询余额功能。

<details>
<summary>💡 查看答案</summary>

```python
class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance
    
    def deposit(self, amount):
        self.balance += amount
        return self.balance
    
    def withdraw(self, amount):
        if amount <= self.balance:
            self.balance -= amount
            return self.balance
        return "余额不足"
    
    def get_balance(self):
        return self.balance
```
</details>

### 挑战练习

**题目 3**：实现 `Student` 继承 `Person`，添加成绩管理功能。

## 费曼学习法检验

1. **这是什么**：类和对象有什么区别？实例属性和类属性的区别？

2. **为什么需要**：为什么需要面向对象？函数式编程不够用吗？

3. **怎么用**：向新手解释 `self` 是什么？为什么方法的第一个参数是 `self`？

4. **注意事项**：什么时候用继承，什么时候用组合？

::: tip 学习建议
面向对象是编程思维的升级！理解封装、继承、多态三大特性。
:::
