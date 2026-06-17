# 描述符

描述符是实现了描述符协议的对象，用于控制属性访问行为。

## 描述符协议

实现以下任一方法的对象就是描述符：

```python
class Descriptor:
    def __get__(self, instance, owner):
        pass
    
    def __set__(self, instance, value):
        pass
    
    def __delete__(self, instance):
        pass
```

## 数据描述符 vs 非数据描述符

```python
# 非数据描述符（只有 __get__）
class NonDataDescriptor:
    def __get__(self, instance, owner):
        return 42

# 数据描述符（有 __set__ 或 __delete__）
class DataDescriptor:
    def __get__(self, instance, owner):
        return instance._value
    
    def __set__(self, instance, value):
        instance._value = value
```

## 实际应用

### 类型检查

```python
class TypedProperty:
    def __init__(self, name, expected_type):
        self.name = name
        self.expected_type = expected_type
    
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__.get(self.name)
    
    def __set__(self, instance, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(f"{self.name} 必须是 {self.expected_type}")
        instance.__dict__[self.name] = value

class Person:
    name = TypedProperty('name', str)
    age = TypedProperty('age', int)

p = Person()
p.name = "Alice"  # OK
p.age = 25        # OK
# p.age = "25"    # TypeError
```

### 惰性属性

```python
class LazyProperty:
    def __init__(self, func):
        self.func = func
    
    def __get__(self, instance, owner):
        if instance is None:
            return self
        value = self.func(instance)
        setattr(instance, self.func.__name__, value)
        return value

class DataLoader:
    @LazyProperty
    def data(self):
        print("加载数据...")
        return [1, 2, 3]

loader = DataLoader()
print(loader.data)  # 第一次访问，加载数据
print(loader.data)  # 第二次访问，直接返回缓存
```

## property 的实现原理

```python
class Property:
    def __init__(self, fget=None, fset=None, fdel=None):
        self.fget = fget
        self.fset = fset
        self.fdel = fdel
    
    def __get__(self, instance, owner):
        if instance is None:
            return self
        if self.fget is None:
            raise AttributeError("unreadable attribute")
        return self.fget(instance)
    
    def __set__(self, instance, value):
        if self.fset is None:
            raise AttributeError("can't set attribute")
        self.fset(instance, value)
    
    def __delete__(self, instance):
        if self.fdel is None:
            raise AttributeError("can't delete attribute")
        self.fdel(instance)
```

## 使用场景

### 场景 1：数据验证
在设置属性时自动验证。

### 场景 2：计算属性
按需计算属性值。

### 场景 3：属性缓存
缓存计算结果。

### 场景 4：ORM 字段
Django Model 的字段实现。

## 易错点

### 易错点 1：`__set__` 直接给 `self.name` 赋值导致无限递归

❌ **错误示例**：
```python
class Typed:
    def __init__(self, name): self.name = name
    def __get__(self, obj, owner): return getattr(obj, self.name)
    def __set__(self, obj, value):
        # obj.x = value 会触发 __set__，而 __set__ 又调 obj.x = value → 死循环
        setattr(obj, self.name, value)

class Person:
    name = Typed('name')

p = Person()
p.name = 'Alice'  # RecursionError
```

✅ **正确做法**：
```python
class Typed:
    def __init__(self, name): self.name = name

    def __get__(self, obj, owner):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)   # 直接读实例字典

    def __set__(self, obj, value):
        obj.__dict__[self.name] = value       # 直接写实例字典
```

**说明**：`__set__` 里如果写 `obj.x = value`，Python 又会调用描述符的 `__set__`，进入无限递归。必须直接操作 `obj.__dict__` 跳过描述符机制。读也一样——用 `obj.__dict__.get(name)` 而不是 `getattr(obj, name)`。

### 易错点 2：把"实例属性名"写死导致多个描述符共用同一份数据

❌ **错误示例**：
```python
class Typed:
    def __init__(self, type_):
        self.type_ = type_
        self.value = None         # 共享存储！所有用 Typed 的属性都共用

    def __get__(self, obj, owner):
        return self.value
    def __set__(self, obj, value):
        self.value = value

class Person:
    name = Typed(str)
    age = Typed(int)

p = Person()
p.name = 'Alice'
p.age = 18
print(p.name)  # 18！name 被 age 覆盖了
```

✅ **正确做法**：
```python
class Typed:
    def __init__(self, type_):
        self.type_ = type_

    def __set_name__(self, owner, name):  # Python 3.6+ 自动调用
        self.name = name

    def __get__(self, obj, owner):
        if obj is None: return self
        return obj.__dict__.get(self.name)

    def __set__(self, obj, value):
        if not isinstance(value, self.type_):
            raise TypeError(f"{self.name} 必须是 {self.type_}")
        obj.__dict__[self.name] = value
```

**说明**：描述符实例本身在类级别（`Person.name`、`Person.age`），如果它的存储也是"自己身上的属性"，所有实例共享。正确做法是把数据**存到 instance 自己的 `__dict__`**。`__set_name__`（3.6+）让描述符自动拿到自己绑定的属性名，避免手动传字符串。

### 易错点 3：忘了处理 `instance is None`（类访问）

❌ **错误示例**：
```python
class Typed:
    def __get__(self, obj, owner):
        return obj.__dict__.get('x')  # 类访问 Person.x 时 obj 是 None

class Person:
    x = Typed()

print(Person.x)  # AttributeError: 'NoneType' has no attribute '__dict__'
```

✅ **正确做法**：
```python
class Typed:
    def __get__(self, obj, owner):
        if obj is None:
            return self           # 类访问返回描述符本身
        return obj.__dict__.get('x')
```

**说明**：`obj.x` 调用 `__get__(obj, Person)`，但 `Person.x`（通过类访问，没有实例）调用 `__get__(None, Person)`。不处理 `None` 分支会导致 `Person.x` 直接报错。这也是为什么 `@property`、`@classmethod` 等内置描述符都能优雅处理"类访问"。

## 练习题

### 基础练习

**题目 1**：实现描述符 `PositiveNumber`，确保属性值为正数。

<details>
<summary>💡 查看答案</summary>

```python
class PositiveNumber:
    def __init__(self, name):
        self.name = name
    
    def __get__(self, instance, owner):
        return instance.__dict__.get(self.name)
    
    def __set__(self, instance, value):
        if value <= 0:
            raise ValueError("必须是正数")
        instance.__dict__[self.name] = value

class Product:
    price = PositiveNumber('price')
```
</details>

### 进阶练习

**题目 2**：实现 `CachedProperty` 描述符，缓存计算结果。

### 挑战练习

**题目 3**：实现描述符，记录属性的访问历史（读写次数、最后访问时间）。

## 费曼学习法检验

1. **这是什么**：描述符协议的三个方法分别在什么时候调用？

2. **为什么需要**：`@property` 和描述符有什么区别？何时用描述符？

3. **怎么用**：向新手解释数据描述符和非数据描述符的优先级？

4. **注意事项**：为什么 `__get__()` 的 instance 参数可能为 None？

::: tip 学习建议
描述符是 Python 属性系统的基石！理解描述符才能真正理解 @property、@classmethod、@staticmethod。
:::
