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
