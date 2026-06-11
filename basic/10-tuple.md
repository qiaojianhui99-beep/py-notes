# 元组（tuple）

## 元组创建

```python
# 空元组
empty = ()
tup = tuple()

# 包含元素
numbers = (1, 2, 3)
single = (1,)  # 单元素元组需要逗号
mixed = (1, "hello", 3.14)

# 省略括号
point = 10, 20
```

## 特性：不可变

元组创建后不能修改、添加、删除元素。

```python
tup = (1, 2, 3)
# tup[0] = 10  # 错误！
```

## 访问元素

```python
tup = ("apple", "banana", "orange")
tup[0]   # 'apple'
tup[-1]  # 'orange'
```

## 切片

```python
tup = (0, 1, 2, 3, 4)
tup[1:4]  # (1, 2, 3)
```

## 元组解包

```python
# 基本解包
x, y = (10, 20)

# 交换变量
a, b = 1, 2
a, b = b, a  # a=2, b=1

# 函数返回多值
def get_point():
    return 10, 20

x, y = get_point()

# 扩展解包
first, *rest, last = (1, 2, 3, 4, 5)
# first=1, rest=[2,3,4], last=5
```

## 常用操作

```python
tup = (1, 2, 3, 2, 4)

# 长度
len(tup)      # 5

# 计数
tup.count(2)  # 2

# 查找索引
tup.index(3)  # 2

# 拼接
(1, 2) + (3, 4)  # (1, 2, 3, 4)

# 重复
(1, 2) * 3  # (1, 2, 1, 2, 1, 2)

# 成员检查
2 in tup  # True
```

## 元组 vs 列表

| 特性 | 元组 | 列表 |
|------|------|------|
| 可变性 | 不可变 | 可变 |
| 性能 | 更快 | 较慢 |
| 内存 | 更小 | 较大 |
| 用途 | 固定数据 | 动态数据 |

```python
# 元组适用场景
coordinates = (10, 20)  # 坐标
rgb = (255, 0, 0)       # 颜色
date = (2024, 6, 11)    # 日期

# 列表适用场景
tasks = ["task1", "task2"]  # 待办事项（可修改）
```
