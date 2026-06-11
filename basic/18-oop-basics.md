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
