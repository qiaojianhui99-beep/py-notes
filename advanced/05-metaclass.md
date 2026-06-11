# 元类

元类是"创建类的类"，是 Python 中最高级的元编程技术。

## type() 的两种用法

### 查看类型

```python
print(type(42))        # <class 'int'>
print(type("hello"))   # <class 'str'>
print(type(int))       # <class 'type'>
```

### 动态创建类

```python
# 等价于 class MyClass: pass
MyClass = type('MyClass', (), {})

# 带属性和方法
def say_hello(self):
    return "Hello"

MyClass = type('MyClass', 
               (object,),
               {'x': 42, 'say_hello': say_hello})

obj = MyClass()
print(obj.x)           # 42
print(obj.say_hello()) # Hello
```

## 自定义元类

元类继承自 `type`，控制类的创建过程。

```python
class Meta(type):
    def __new__(cls, name, bases, attrs):
        # 在类创建时修改
        attrs['created_by'] = 'Meta'
        return super().__new__(cls, name, bases, attrs)

class MyClass(metaclass=Meta):
    pass

print(MyClass.created_by)  # Meta
```

## 元类的应用

### 单例模式

```python
class Singleton(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=Singleton):
    pass

db1 = Database()
db2 = Database()
print(db1 is db2)  # True
```

### 自动注册类

```python
class RegisterMeta(type):
    registry = {}
    
    def __new__(cls, name, bases, attrs):
        new_cls = super().__new__(cls, name, bases, attrs)
        cls.registry[name] = new_cls
        return new_cls

class Plugin(metaclass=RegisterMeta):
    pass

class PluginA(Plugin):
    pass

class PluginB(Plugin):
    pass

print(RegisterMeta.registry.keys())
# dict_keys(['Plugin', 'PluginA', 'PluginB'])
```

### 强制子类实现方法

```python
class AbstractMeta(type):
    def __new__(cls, name, bases, attrs):
        if bases:  # 不检查基类本身
            if 'required_method' not in attrs:
                raise TypeError(f"{name} 必须实现 required_method")
        return super().__new__(cls, name, bases, attrs)

class Base(metaclass=AbstractMeta):
    pass

# class Child(Base):  # TypeError
#     pass

class Child(Base):
    def required_method(self):
        pass
```

## 使用场景

### 场景 1：ORM 框架
Django/SQLAlchemy 使用元类定义 Model。

### 场景 2：API 客户端
自动生成 API 方法。

### 场景 3：序列化框架
自动处理类的序列化逻辑。

### 场景 4：插件系统
自动发现和注册插件。

## 练习题

### 基础练习

**题目 1**：使用 type() 动态创建一个包含属性 `name` 和方法 `greet()` 的类。

<details>
<summary>💡 查看答案</summary>

```python
def greet(self):
    return f"Hello, {self.name}"

Person = type('Person', (), {'name': 'Alice', 'greet': greet})
p = Person()
print(p.greet())  # Hello, Alice
```
</details>

### 进阶练习

**题目 2**：实现元类，自动将类的所有方法名转为小写。

<details>
<summary>💡 查看答案</summary>

```python
class LowerMeta(type):
    def __new__(cls, name, bases, attrs):
        new_attrs = {}
        for key, value in attrs.items():
            if callable(value):
                new_attrs[key.lower()] = value
            else:
                new_attrs[key] = value
        return super().__new__(cls, name, bases, new_attrs)
```
</details>

### 挑战练习

**题目 3**：实现带缓存的单例元类，支持通过参数获取不同实例。

## 费曼学习法检验

1. **这是什么**：元类是什么？为什么说"类是元类的实例"？

2. **为什么需要**：什么场景下必须用元类？装饰器不能替代吗？

3. **怎么用**：向新手解释 `__new__()` 和 `__init__()` 在元类中的区别？

4. **注意事项**：元类继承有什么坑？多个元类如何协作？

::: tip 学习建议
元类是 Python 黑魔法！大多数情况用不到，但理解它能加深对 Python 对象模型的理解。
:::
