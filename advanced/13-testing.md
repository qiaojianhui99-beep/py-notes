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

### 易错点 1：待补充

❌ **错误示例**：
```python
# 待补充
```

✅ **正确做法**：
```python
# 待补充
```

**说明**：待补充

### 易错点 2：待补充

❌ **错误示例**：
```python
# 待补充
```

✅ **正确做法**：
```python
# 待补充
```

**说明**：待补充

### 易错点 3：待补充

❌ **错误示例**：
```python
# 待补充
```

✅ **正确做法**：
```python
# 待补充
```

**说明**：待补充

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
