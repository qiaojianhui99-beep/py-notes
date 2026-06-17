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

## 易错点

### 易错点 1：用元类实现"接口"——但忘了检查继承类

❌ **错误示例**：
```python
class AbstractMeta(type):
    def __new__(cls, name, bases, attrs):
        if 'required_method' not in attrs:
            raise TypeError(f"{name} 必须实现 required_method")
        return super().__new__(cls, name, bases, attrs)

class Base(metaclass=AbstractMeta):
    pass  # Base 自己没有 required_method，会立即抛错！

# 即使想跳过基类：
class Child(Base):
    pass  # 如果父类继承了 required_method，子类不实现也能通过——逻辑可能反了
```

✅ **正确做法**：
```python
class AbstractMeta(type):
    def __new__(cls, name, bases, attrs):
        # 跳过基类自身（bases 为空）和已经"显式声明"抽象的类
        if bases and not attrs.get('_abstract'):
            if 'required_method' not in attrs:
                # 也要检查是否从父类继承了
                inherited = any(hasattr(b, 'required_method') for b in bases)
                if not inherited:
                    raise TypeError(f"{name} 必须实现 required_method")
        return super().__new__(cls, name, bases, attrs)

class Base(metaclass=AbstractMeta):
    _abstract = True  # 标记自己为抽象基类，跳过检查

class Child(Base):  # 没有实现 → 报错
    pass
```

**说明**：检查"子类是否实现了方法"时要考虑两种情况——基类自身要被跳过（否则没法定义基类）、继承下来的方法是否算"已实现"。生产中这类需求更适合用 `abc.ABC` + `@abstractmethod`，行为更标准。

### 易错点 2：元类与父类元类冲突

❌ **错误示例**：
```python
class MetaA(type): pass
class MetaB(type): pass

class A(metaclass=MetaA): pass
class B(metaclass=MetaB): pass

class C(A, B): pass  # TypeError: metaclass conflict
```

✅ **正确做法**：
```python
# 让其中一个元类继承另一个，形成"共同后代"
class MetaB(MetaA): pass

class A(metaclass=MetaA): pass
class B(metaclass=MetaB): pass

class C(A, B): pass  # 现在 MetaB 是 MetaA 的子类，C 用 MetaB

# 或者显式指定 metaclass 让 Python 不必推断
class C(A, B, metaclass=MetaB): pass
```

**说明**：多继承时，Python 要求"最派生的元类"必须是所有父类元类的子类。否则报 `metaclass conflict`。解决方法：让多个元类形成继承关系，或者干脆别用多继承 + 不同元类。

### 易错点 3：`__new__` vs `__init__` 在元类中的混淆

❌ **错误示例**：
```python
class Meta(type):
    def __new__(cls, name, bases, attrs):
        # 在 __new__ 里"修改 attrs" 后忘记传给父类
        attrs['x'] = 1
        return type(name, bases, attrs)  # 不通过 super()，元类继承链断了
```

✅ **正确做法**：
```python
class Meta(type):
    def __new__(cls, name, bases, attrs):
        attrs['x'] = 1
        return super().__new__(cls, name, bases, attrs)  # 走父类
```

**说明**：元类的 `__new__` 负责**创建**类对象（接收类名、父类们、属性字典），`__init__` 在类对象创建好后做初始化。要修改"类长什么样"必须在 `__new__`，且要 `return super().__new__(cls, name, bases, attrs)`——直接 `type(name, bases, attrs)` 会绕过元类继承链，导致后续元类逻辑失效。

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
