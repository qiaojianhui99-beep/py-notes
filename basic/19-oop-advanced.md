# 面向对象进阶

## 核心概念

面向对象进阶关注类之间的关系，以及如何让对象表现得更自然。核心内容包括：

- 继承：复用已有类的属性和方法。
- 方法重写：子类改变父类方法的行为。
- 多态：不同对象用同一个方法名完成各自的操作。
- 属性控制：用方法保护数据。
- 特殊方法：让对象支持 `print()`、`len()`、比较等内置操作。

## 继承

继承表示“子类是一种父类”。子类会拥有父类的属性和方法。

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def eat(self):
        print(f"{self.name} 正在吃东西")

class Dog(Animal):
    def bark(self):
        print(f"{self.name} 汪汪叫")

dog = Dog("旺财")
dog.eat()
dog.bark()
```

`Dog` 继承了 `Animal`，所以 `dog` 可以调用 `eat()`。

## 方法重写

子类可以重新定义父类已有的方法。

```python
class Animal:
    def speak(self):
        print("动物发出声音")

class Dog(Animal):
    def speak(self):
        print("汪汪")

dog = Dog()
dog.speak()
```

这叫方法重写。调用时会优先使用子类自己的实现。

## super() 函数

`super()` 用来调用父类的方法，常用于扩展父类初始化逻辑。

```python
class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    def __init__(self, name, score):
        super().__init__(name)
        self.score = score

student = Student("Alice", 95)
print(student.name)
print(student.score)
```

如果子类需要父类的初始化内容，不要重复写一遍，优先使用 `super()`。

## 多继承

Python 支持一个类继承多个父类。

```python
class Flyable:
    def fly(self):
        print("可以飞")

class Swimmable:
    def swim(self):
        print("可以游泳")

class Duck(Flyable, Swimmable):
    pass

duck = Duck()
duck.fly()
duck.swim()
```

多继承容易让关系变复杂。初学阶段优先掌握单继承。

## 多态

多态表示不同对象可以用同一个方法名响应同一类操作。

```python
class Dog:
    def speak(self):
        return "汪汪"

class Cat:
    def speak(self):
        return "喵喵"

animals = [Dog(), Cat()]

for animal in animals:
    print(animal.speak())
```

调用者不需要关心对象具体是什么类，只要它有 `speak()` 方法即可。

## 属性控制

有些属性不能随意修改，可以通过方法控制。

```python
class Person:
    def __init__(self, age):
        self._age = age

    def get_age(self):
        return self._age

    def set_age(self, age):
        if 0 <= age <= 120:
            self._age = age
        else:
            print("年龄无效")

person = Person(18)
person.set_age(20)
print(person.get_age())
```

这种写法清楚，但访问起来有点啰嗦。

## @property

`@property` 可以把方法包装成属性一样访问。

### 只读属性

先看最简单的情况：让方法像属性一样被读取。

```python
class Person:
    def __init__(self, age):
        self._age = age

    @property
    def age(self):
        """读取年龄时自动调用这个方法"""
        return self._age

person = Person(18)
print(person.age)  # 18，看起来像访问属性，实际调用了方法
```

此时 `person.age` 只能读取，不能赋值：

```python
person.age = 20  # AttributeError: can't set attribute
```

### 可读写属性

如果希望赋值时也能做检查，需要配套定义一个 **setter 方法**。

```python
class Person:
    def __init__(self, age):
        self._age = age

    @property
    def age(self):
        """读取 age 时调用"""
        return self._age

    @age.setter
    def age(self, value):
        """赋值 age 时调用，例如 person.age = 20"""
        if 0 <= value <= 120:
            self._age = value
        else:
            raise ValueError("年龄无效")

person = Person(18)
print(person.age)  # 读取时调用 @property 装饰的方法
person.age = 20    # 赋值时调用 @age.setter 装饰的方法
print(person.age)  # 20
```

**关键点**：
- `@property` 装饰的方法控制**读取**行为。
- `@age.setter` 装饰的方法控制**赋值**行为。
- setter 装饰器的名字必须是 `@属性名.setter`，这里属性名是 `age`，所以是 `@age.setter`。

这样既保留了属性访问的简洁，又能在赋值时做检查。

## 常用特殊方法

特殊方法也常被叫作魔法方法，名字前后都有双下划线。

### __str__()

控制 `print()` 对象时显示什么。

```python
class Book:
    def __init__(self, title):
        self.title = title

    def __str__(self):
        return f"《{self.title}》"

book = Book("Python 入门")
print(book)
```

### __len__()

让对象支持 `len()`。

```python
class Team:
    def __init__(self, members):
        self.members = members

    def __len__(self):
        return len(self.members)

team = Team(["Alice", "Bob"])
print(len(team))
```

### __eq__()

控制两个对象如何判断相等。

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

p1 = Point(1, 2)
p2 = Point(1, 2)
print(p1 == p2)
```

## isinstance() 和 issubclass()

```python
class Animal:
    pass

class Dog(Animal):
    pass

dog = Dog()

print(isinstance(dog, Dog))      # True
print(isinstance(dog, Animal))   # True
print(issubclass(Dog, Animal))   # True
```

- `isinstance()`：判断对象是不是某个类的实例。
- `issubclass()`：判断一个类是不是另一个类的子类。

## 使用场景

### 场景 1：复用共同属性

```python
class User:
    def __init__(self, name):
        self.name = name

class Admin(User):
    pass
```

### 场景 2：不同对象统一调用

```python
for animal in animals:
    animal.speak()
```

### 场景 3：保护属性赋值

```python
person.age = 30
```

### 场景 4：让对象更易读

```python
print(book)
```

## 易错点

### 易错点 1：子类 `__init__` 未调用父类初始化

❌ **错误示例**：
```python
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        # 忘记调用父类 __init__
        self.breed = breed

dog = Dog("Buddy", "Golden")
print(dog.name)  # AttributeError: 'Dog' object has no attribute 'name'
```

✅ **正确做法**：
```python
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)  # 调用父类初始化
        self.breed = breed

dog = Dog("Buddy", "Golden")
print(dog.name)  # Buddy
```

**说明**：子类覆盖 `__init__` 时，如果需要父类的初始化逻辑，必须显式调用 `super().__init__()`。

### 易错点 2：私有属性命名混淆

❌ **错误理解**：
```python
class Person:
    def __init__(self, name):
        self.__name = name  # 私有属性

person = Person("Alice")
print(person.__name)  # AttributeError
```

但这样可以访问：

```python
print(person._Person__name)  # Alice（名称改写）
```

✅ **正确理解**：
```python
class Person:
    def __init__(self, name):
        self._name = name  # 单下划线：约定为内部使用
        self.__id = 123   # 双下划线：名称改写，防止子类覆盖

person = Person("Alice")
print(person._name)  # 可以访问，但约定不应该
# print(person.__id)  # AttributeError
print(person._Person__id)  # 123（可以但不推荐）
```

**说明**：单下划线 `_` 是约定俗成的内部属性标记，双下划线 `__` 会触发名称改写（name mangling）。Python 没有真正的私有属性。

### 易错点 3：多态时忘记实现接口方法

❌ **错误示例**：
```python
class Animal:
    def speak(self):
        pass

class Dog(Animal):
    pass  # 忘记实现 speak

dog = Dog()
dog.speak()  # 什么都不输出，容易出错
```

✅ **正确做法**：
```python
class Animal:
    def speak(self):
        raise NotImplementedError("子类必须实现 speak 方法")

class Dog(Animal):
    def speak(self):
        return "汪汪"

dog = Dog()
print(dog.speak())  # 汪汪
```

**说明**：父类的抽象方法应该抛出 `NotImplementedError`，强制子类实现。这样能及早发现忘记实现的问题。

## 练习题

### 基础练习

**题目 1**：创建 `Animal` 父类和 `Dog` 子类，让 `Dog` 继承 `name` 属性并新增 `bark()` 方法。

<details>
<summary>💡 查看答案</summary>

```python
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def bark(self):
        return f"{self.name} 汪汪叫"

dog = Dog("旺财")
print(dog.bark())
```
</details>

### 进阶练习

**题目 2**：创建 `Person` 和 `Student`，`Student` 使用 `super()` 复用姓名属性，并新增分数字段。

<details>
<summary>💡 查看答案</summary>

```python
class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    def __init__(self, name, score):
        super().__init__(name)
        self.score = score

    def is_passed(self):
        return self.score >= 60

student = Student("Alice", 85)
print(student.name)
print(student.is_passed())
```
</details>

### 挑战练习

**题目 3**：创建 `Product` 类，实现 `__str__()`，让 `print(product)` 输出商品名和价格。

<details>
<summary>💡 查看答案</summary>

```python
class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __str__(self):
        return f"{self.name}: {self.price:.2f} 元"

product = Product("键盘", 199)
print(product)
```
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：继承、方法重写、多态分别是什么意思？
2. **为什么需要**：为什么子类调用父类初始化时要用 `super()`？
3. **怎么用**：如何用 `@property` 检查属性赋值？
4. **注意事项**：什么时候继承会让代码变复杂？

::: tip 学习建议
继承不是为了少写几行代码，而是为了表达“某类对象属于另一类对象”。关系不清楚时，不要急着用继承。
:::
