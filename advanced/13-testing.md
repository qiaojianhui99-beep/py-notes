# 单元测试

单元测试确保代码质量，是现代开发的必备技能。

## unittest 模块

### 基本测试

```python
import unittest

def add(a, b):
    return a + b

class TestMath(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(1, 2), 3)
        self.assertEqual(add(-1, 1), 0)
    
    def test_add_negative(self):
        self.assertEqual(add(-1, -1), -2)

if __name__ == '__main__':
    unittest.main()
```

### 常用断言

```python
self.assertEqual(a, b)      # a == b
self.assertNotEqual(a, b)   # a != b
self.assertTrue(x)          # bool(x) is True
self.assertFalse(x)         # bool(x) is False
self.assertIs(a, b)         # a is b
self.assertIsNone(x)        # x is None
self.assertIn(a, b)         # a in b
self.assertRaises(exc)      # 抛出异常
```

### setUp 和 tearDown

```python
class TestDatabase(unittest.TestCase):
    def setUp(self):
        self.db = Database()
        self.db.connect()
    
    def tearDown(self):
        self.db.close()
    
    def test_query(self):
        result = self.db.query("SELECT 1")
        self.assertIsNotNone(result)
```

## pytest 框架

### 简单测试

```python
# test_math.py
def test_add():
    assert add(1, 2) == 3

def test_divide():
    assert divide(10, 2) == 5
```

### Fixture

```python
import pytest

@pytest.fixture
def sample_data():
    return [1, 2, 3, 4, 5]

def test_sum(sample_data):
    assert sum(sample_data) == 15
```

### 参数化测试

```python
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
```

### 异常测试

```python
def test_divide_by_zero():
    with pytest.raises(ZeroDivisionError):
        divide(1, 0)
```

## Mock 对象

### unittest.mock

```python
from unittest.mock import Mock, patch

def get_user_data(api):
    return api.fetch_user(123)

def test_get_user_data():
    mock_api = Mock()
    mock_api.fetch_user.return_value = {"name": "Alice"}
    
    result = get_user_data(mock_api)
    assert result["name"] == "Alice"
    mock_api.fetch_user.assert_called_once_with(123)
```

### patch 装饰器

```python
@patch('requests.get')
def test_api_call(mock_get):
    mock_get.return_value.json.return_value = {"status": "ok"}
    result = fetch_data()
    assert result["status"] == "ok"
```

## 测试覆盖率

```bash
# 安装
pip install pytest-cov

# 运行
pytest --cov=mymodule tests/
```

## 使用场景

### 场景 1：TDD 开发
先写测试，再写实现。

### 场景 2：回归测试
确保新代码不破坏旧功能。

### 场景 3：重构
安全地重构代码。

### 场景 4：CI/CD
自动化测试流程。

## 易错点

### 易错点 1：测试间共享状态导致"看顺序跑"才有问题

❌ **错误示例**：
```python
class TestCart(unittest.TestCase):
    cart = []  # 类变量，所有测试方法共享

    def test_add_item(self):
        self.cart.append('apple')
        self.assertEqual(len(self.cart), 1)

    def test_add_another(self):
        self.cart.append('banana')
        self.assertEqual(len(self.cart), 1)  # 如果上一个先跑，长度是 2，测试失败

# 测试结果取决于运行顺序！
```

✅ **正确做法**：
```python
class TestCart(unittest.TestCase):
    def setUp(self):
        self.cart = []   # 每个测试前都重新初始化

    def test_add_item(self):
        self.cart.append('apple')
        self.assertEqual(len(self.cart), 1)

    def test_add_two(self):
        self.cart.extend(['apple', 'banana'])
        self.assertEqual(len(self.cart), 2)
```

**说明**：单元测试必须**互相独立**。`setUp` 在每个 `test_xxx` 之前都跑一遍，是隔离测试状态的标准位置。pytest 用 fixture（每次调用都创建新实例）也能达到同样效果。共享可变状态是测试不稳定（flaky test）的首要原因。

### 易错点 2：`assertRaises` 用上下文管理器 vs 直接调用的差异

❌ **错误示例**：
```python
import unittest

class TestDivide(unittest.TestCase):
    def test_divide_by_zero(self):
        # 错：先调用了 divide，已经抛错了
        self.assertRaises(ZeroDivisionError, divide(1, 0))
        # 等价于：result = divide(1, 0) 先抛错，再 assertRaises 检查不到
```

✅ **正确做法**：
```python
class TestDivide(unittest.TestCase):
    def test_divide_by_zero(self):
        # 方法 1：传函数对象 + 参数（推荐用 with 形式）
        self.assertRaises(ZeroDivisionError, divide, 1, 0)

    def test_divide_by_zero_context(self):
        # 方法 2：上下文管理器（最清晰）
        with self.assertRaises(ZeroDivisionError):
            divide(1, 0)

# pytest 版本
import pytest

def test_divide_by_zero():
    with pytest.raises(ZeroDivisionError):
        divide(1, 0)
```

**说明**：`assertRaises` 的"位置参数形式"要求传**函数对象**（不是函数调用结果），让框架自己调用。否则 Python 在 `assertRaises(...)` 之前就先求值 `divide(1, 0)` 抛错，测试会因 `Error` 而不是断言失败。上下文管理器形式（`with ... :`）更直观、更不易错。

### 易错点 3：Mock 没还原，污染了其他测试

❌ **错误示例**：
```python
from unittest import mock

def test_fetch_data():
    patcher = mock.patch('requests.get')
    mock_get = patcher.start()
    mock_get.return_value.json.return_value = {"ok": True}
    # 忘了 patcher.stop()
    # 下一个测试中 requests.get 仍是 mock，看似正常但行为不对
    assert fetch_data() == {"ok": True}

def test_other():
    # requests.get 还是 mock，其他依赖 requests 的测试全坏
    ...
```

✅ **正确做法**：
```python
# 方法 1：用 patch 装饰器，自动 start/stop
@mock.patch('requests.get')
def test_fetch_data(mock_get):
    mock_get.return_value.json.return_value = {"ok": True}
    assert fetch_data() == {"ok": True}

# 方法 2：上下文管理器
def test_fetch_data():
    with mock.patch('requests.get') as mock_get:
        mock_get.return_value.json.return_value = {"ok": True}
        assert fetch_data() == {"ok": True}

# 方法 3：try/finally
def test_fetch_data():
    patcher = mock.patch('requests.get')
    mock_get = patcher.start()
    try:
        mock_get.return_value.json.return_value = {"ok": True}
        assert fetch_data() == {"ok": True}
    finally:
        patcher.stop()
```

**说明**：`mock.patch` 必须在测试结束时还原（`stop`），否则被 patch 的对象一直是 mock，污染后续测试。装饰器和上下文管理器会自动 `stop`，是首选。手动 `start()` 必须配 `try/finally` 或 `addCleanup`。

## 练习题

### 基础练习

**题目 1**：为计算器函数编写测试（加减乘除）。

<details>
<summary>💡 查看答案</summary>

```python
import unittest

class TestCalculator(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)
    
    def test_subtract(self):
        self.assertEqual(subtract(5, 3), 2)
    
    def test_multiply(self):
        self.assertEqual(multiply(2, 3), 6)
    
    def test_divide(self):
        self.assertEqual(divide(6, 3), 2)
    
    def test_divide_by_zero(self):
        with self.assertRaises(ZeroDivisionError):
            divide(1, 0)
```
</details>

### 进阶练习

**题目 2**：使用 Mock 测试 HTTP API 调用。

### 挑战练习

**题目 3**：为数据库操作类编写完整的测试套件。

## 费曼学习法检验

1. **这是什么**：单元测试和集成测试有什么区别？

2. **为什么需要**：测试覆盖率 100% 就安全吗？

3. **怎么用**：向新手解释 Mock 的作用？

4. **注意事项**：过度测试有什么问题？

::: tip 学习建议
测试是代码质量的保障！养成写测试的习惯。
:::
