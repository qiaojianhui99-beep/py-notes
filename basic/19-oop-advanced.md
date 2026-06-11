# 面向对象进阶

## 继承

子类继承父类的属性和方法。

```python
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return f"{self.name} 汪汪叫"

class Cat(Animal):
    def speak(self):
        return f"{self.name} 喵喵叫"

dog = Dog("旺财")
print(dog.speak())  # 旺财 汪汪叫
```

## 方法重写

```python
class Animal:
    def move(self):
        print("动物移动")

class Bird(Animal):
    def move(self):  # 重写父类方法
        print("鸟儿飞翔")

bird = Bird()
bird.move()  # 鸟儿飞翔
```

## super() 函数

调用父类的方法。

```python
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)  # 调用父类构造方法
        self.breed = breed

dog = Dog("旺财", "金毛")
print(dog.name)   # 旺财
print(dog.breed)  # 金毛
```

## 多继承

```python
class Flyable:
    def fly(self):
        print("飞翔")

class Swimmable:
    def swim(self):
        print("游泳")

class Duck(Flyable, Swimmable):
    pass

duck = Duck()
duck.fly()   # 飞翔
duck.swim()  # 游泳
```

## 封装

### 私有属性

```python
class BankAccount:
    def __init__(self, balance):
        self.__balance = balance  # 私有
    
    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
    
    def get_balance(self):
        return self.__balance

account = BankAccount(1000)
# account.__balance  # 错误
account.deposit(500)
print(account.get_balance())  # 1500
```

### 属性装饰器

```python
class Person:
    def __init__(self, age):
        self._age = age
    
    @property
    def age(self):
        return self._age
    
    @age.setter
    def age(self, value):
        if 0 <= value <= 120:
            self._age = value
        else:
            raise ValueError("年龄无效")

person = Person(25)
print(person.age)  # 25
person.age = 30    # OK
# person.age = -5  # ValueError
```

## 多态

同一方法在不同对象中有不同实现。

```python
class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "汪汪"

class Cat(Animal):
    def speak(self):
        return "喵喵"

def make_speak(animal):
    print(animal.speak())

dog = Dog()
cat = Cat()
make_speak(dog)  # 汪汪
make_speak(cat)  # 喵喵
```

## 常用魔法方法

```python
class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages
    
    def __str__(self):
        # print() 时调用
        return f"{self.title} ({self.pages}页)"
    
    def __repr__(self):
        # 开发者表示
        return f"Book('{self.title}', {self.pages})"
    
    def __len__(self):
        # len() 调用
        return self.pages
    
    def __eq__(self, other):
        # == 比较
        return self.title == other.title
    
    def __lt__(self, other):
        # < 比较
        return self.pages < other.pages

book = Book("Python", 300)
print(book)       # Python (300页)
print(len(book))  # 300
```

## 抽象基类

```python
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "汪汪"

# animal = Animal()  # 错误：不能实例化抽象类
dog = Dog()
```

## isinstance() 和 issubclass()

```python
class Animal:
    pass

class Dog(Animal):
    pass

dog = Dog()

# 检查实例类型
isinstance(dog, Dog)     # True
isinstance(dog, Animal)  # True

# 检查子类关系
issubclass(Dog, Animal)  # True
```

## 使用场景

### 场景 1：数据验证
使用属性装饰器验证输入。

### 场景 2：运算符重载
实现自定义类的比较、运算。

### 场景 3：上下文管理
数据库连接、文件处理。

### 场景 4：元编程
ORM 框架、API 客户端。

## 练习题

### 基础练习

**题目 1**：为 `Person` 类添加 `@property` 装饰器，年龄只读。

<details>
<summary>💡 查看答案</summary>

```python
class Person:
    def __init__(self, name, age):
        self._name = name
        self._age = age
    
    @property
    def age(self):
        return self._age

person = Person("Alice", 25)
print(person.age)  # 25
# person.age = 30  # AttributeError
```
</details>

### 进阶练习

**题目 2**：实现 `Vector` 类，支持加法和点积运算。

<details>
<summary>💡 查看答案</summary>

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    
    def dot(self, other):
        return self.x * other.x + self.y * other.y
    
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)
print(v1 + v2)      # Vector(4, 6)
print(v1.dot(v2))   # 11
```
</details>

### 挑战练习

**题目 3**：实现自定义上下文管理器 `Timer`，自动计时代码块执行时间。

## 费曼学习法检验

1. **这是什么**：`@property` 和普通方法有什么区别？为什么要用它？

2. **为什么需要**：抽象基类有什么用？为什么不直接用普通类？

3. **怎么用**：向新手解释魔术方法的命名规则和常用场景？

4. **注意事项**：什么时候需要自定义 `__str__` 和 `__repr__`？

::: tip 学习建议
OOP 进阶特性让代码更 Pythonic！掌握装饰器、魔术方法是关键。
:::
