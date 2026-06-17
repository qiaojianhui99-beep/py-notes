# 单元测试进阶

深入 Python 单元测试，掌握 Mock、参数化、覆盖率分析等高级技巧。

## pytest 进阶

### 参数化测试

```python
import pytest

# 基础参数化
@pytest.mark.parametrize("input,expected", [
    (1, 2),
    (2, 3),
    (3, 4),
])
def test_increment(input, expected):
    assert input + 1 == expected

# 多参数
@pytest.mark.parametrize("a,b,result", [
    (2, 3, 5),
    (10, 5, 15),
    (-1, 1, 0),
])
def test_add(a, b, result):
    assert a + b == result

# 参数化组合
@pytest.mark.parametrize("x", [0, 1, 2])
@pytest.mark.parametrize("y", [3, 4])
def test_multiply(x, y):
    assert x * y == y * x
```

### Fixture 进阶

```python
import pytest

# 作用域
@pytest.fixture(scope="session")
def db_connection():
    conn = create_db_connection()
    yield conn
    conn.close()

@pytest.fixture(scope="module")
def api_client():
    client = APIClient()
    yield client
    client.cleanup()

# 参数化 Fixture
@pytest.fixture(params=['sqlite', 'mysql', 'postgres'])
def database(request):
    db = setup_database(request.param)
    yield db
    teardown_database(db)

def test_query(database):
    result = database.query("SELECT 1")
    assert result is not None

# Fixture 依赖
@pytest.fixture
def user(db_connection):
    user = User.create(username="test")
    yield user
    user.delete()

@pytest.fixture
def post(user):
    post = Post.create(author=user, title="Test")
    yield post
    post.delete()

def test_post_author(post):
    assert post.author.username == "test"
```

### Marker 标记

```python
import pytest

@pytest.mark.slow
def test_long_running():
    # 慢测试
    pass

@pytest.mark.integration
def test_api_integration():
    # 集成测试
    pass

@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature():
    pass

@pytest.mark.skipif(sys.version_info < (3, 10), reason="Requires Python 3.10+")
def test_python310_feature():
    pass

@pytest.mark.xfail(reason="Known bug")
def test_known_issue():
    assert False
```

运行特定标记：

```bash
# 跳过慢测试
pytest -m "not slow"

# 只运行集成测试
pytest -m integration

# 运行多个标记
pytest -m "slow or integration"
```

### 异常测试

```python
import pytest

def test_exception():
    with pytest.raises(ValueError):
        int("invalid")

def test_exception_message():
    with pytest.raises(ValueError, match=r"invalid literal"):
        int("abc")

def test_exception_context():
    with pytest.raises(ZeroDivisionError) as excinfo:
        1 / 0
    assert "division by zero" in str(excinfo.value)
```

## Mock 与 Patch

### 基础 Mock

```python
from unittest.mock import Mock, MagicMock

# 创建 Mock
mock_func = Mock(return_value=42)
assert mock_func() == 42

# 验证调用
mock_func.assert_called_once()
mock_func.assert_called_with()

# 配置多次返回值
mock = Mock(side_effect=[1, 2, 3])
assert mock() == 1
assert mock() == 2
assert mock() == 3

# 抛出异常
mock = Mock(side_effect=ValueError("Error"))
with pytest.raises(ValueError):
    mock()
```

### Patch 装饰器

```python
from unittest.mock import patch

# 模块级别 patch
@patch('requests.get')
def test_api_call(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {'data': 'test'}
    
    response = fetch_data()
    assert response['data'] == 'test'
    mock_get.assert_called_once()

# 多个 patch
@patch('module.function2')
@patch('module.function1')
def test_multiple(mock1, mock2):
    # 注意顺序：从下往上
    pass

# 对象方法 patch
@patch.object(MyClass, 'method')
def test_method(mock_method):
    mock_method.return_value = 'mocked'
    obj = MyClass()
    assert obj.method() == 'mocked'
```

### 上下文管理器

```python
from unittest.mock import patch

def test_with_patch():
    with patch('os.path.exists') as mock_exists:
        mock_exists.return_value = True
        assert os.path.exists('/fake/path')
    
    # patch 已失效
    assert not os.path.exists('/fake/path')
```

### 实战：Mock 数据库

```python
from unittest.mock import Mock, patch
import pytest

@pytest.fixture
def mock_db():
    db = Mock()
    db.query.return_value = [
        {'id': 1, 'name': 'Alice'},
        {'id': 2, 'name': 'Bob'}
    ]
    db.execute.return_value = True
    return db

def test_get_users(mock_db):
    users = get_users(mock_db)
    assert len(users) == 2
    assert users[0]['name'] == 'Alice'
    mock_db.query.assert_called_once()

@patch('myapp.database.connect')
def test_database_connection(mock_connect):
    mock_connect.return_value = Mock()
    db = create_connection()
    assert db is not None
    mock_connect.assert_called()
```

### 实战：Mock HTTP 请求

```python
import requests
from unittest.mock import Mock, patch

@patch('requests.get')
def test_fetch_user(mock_get):
    # 模拟响应
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'id': 123,
        'username': 'alice'
    }
    mock_get.return_value = mock_response
    
    # 测试
    user = fetch_user(123)
    assert user['username'] == 'alice'
    mock_get.assert_called_with('https://api.example.com/users/123')

# 使用 responses 库（推荐）
import responses

@responses.activate
def test_api_call():
    responses.add(
        responses.GET,
        'https://api.example.com/users/123',
        json={'id': 123, 'username': 'alice'},
        status=200
    )
    
    user = fetch_user(123)
    assert user['username'] == 'alice'
```

### 实战：Mock 文件操作

```python
from unittest.mock import mock_open, patch

@patch('builtins.open', mock_open(read_data='file content'))
def test_read_file():
    content = read_config('config.txt')
    assert content == 'file content'

@patch('builtins.open', mock_open())
def test_write_file(mock_file):
    write_log('test.log', 'log message')
    mock_file.assert_called_once_with('test.log', 'w')
    mock_file().write.assert_called_once_with('log message')
```

## 测试覆盖率

### 使用 pytest-cov

```bash
pip install pytest-cov
```

```bash
# 运行测试并生成覆盖率报告
pytest --cov=myapp tests/

# 生成 HTML 报告
pytest --cov=myapp --cov-report=html tests/

# 显示缺失的行
pytest --cov=myapp --cov-report=term-missing tests/

# 设置最低覆盖率
pytest --cov=myapp --cov-fail-under=80 tests/
```

### 配置文件

`.coveragerc`：

```ini
[run]
source = myapp
omit = 
    */tests/*
    */venv/*
    */__pycache__/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:
    @abstract
```

### 排除代码

```python
def debug_function():  # pragma: no cover
    print("Debug info")

if TYPE_CHECKING:  # pragma: no cover
    from typing import Optional
```

## 数据库测试

### SQLite 内存数据库

```python
import pytest
from sqlalchemy import create_engine
from myapp.models import Base, User

@pytest.fixture
def db_session():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    yield session
    
    session.close()

def test_create_user(db_session):
    user = User(username='test', email='test@example.com')
    db_session.add(user)
    db_session.commit()
    
    assert user.id is not None
    assert db_session.query(User).count() == 1
```

### 事务回滚

```python
@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()
```

## Flask 测试

```python
import pytest
from myapp import create_app

@pytest.fixture
def app():
    app = create_app('testing')
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

def test_home_page(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'Welcome' in response.data

def test_create_post(client):
    response = client.post('/posts', json={
        'title': 'Test Post',
        'content': 'Test Content'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['title'] == 'Test Post'

def test_login(client):
    response = client.post('/login', data={
        'username': 'test',
        'password': 'password'
    }, follow_redirects=True)
    assert response.status_code == 200
```

## FastAPI 测试

```python
from fastapi.testclient import TestClient
from myapp import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_create_user():
    response = client.post("/users", json={
        "username": "test",
        "email": "test@example.com"
    })
    assert response.status_code == 201
    assert response.json()["username"] == "test"

@pytest.mark.asyncio
async def test_async_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/async")
    assert response.status_code == 200
```

## 异步测试

```python
import pytest
import asyncio

@pytest.mark.asyncio
async def test_async_function():
    result = await async_fetch_data()
    assert result == 'data'

@pytest.fixture
async def async_client():
    client = AsyncHTTPClient()
    yield client
    await client.close()

@pytest.mark.asyncio
async def test_with_fixture(async_client):
    response = await async_client.get('https://api.example.com')
    assert response.status_code == 200
```

## 性能测试

### 使用 pytest-benchmark

```bash
pip install pytest-benchmark
```

```python
def test_performance(benchmark):
    result = benchmark(expensive_function, arg1, arg2)
    assert result == expected

def test_with_setup(benchmark):
    def setup():
        return [1, 2, 3], {}
    
    result = benchmark.pedantic(
        expensive_function,
        setup=setup,
        rounds=100,
        iterations=10
    )
```

## 测试组织

### 目录结构

```
project/
├── myapp/
│   ├── __init__.py
│   ├── models.py
│   └── views.py
└── tests/
    ├── conftest.py          # 共享 fixtures
    ├── test_models.py
    ├── test_views.py
    └── integration/
        └── test_api.py
```

### conftest.py

```python
import pytest
from myapp import create_app, db

@pytest.fixture(scope='session')
def app():
    app = create_app('testing')
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def db_session(app):
    with app.app_context():
        connection = db.engine.connect()
        transaction = connection.begin()
        session = db.create_scoped_session(
            options={"bind": connection}
        )
        db.session = session
        
        yield session
        
        transaction.rollback()
        connection.close()
        session.remove()
```

## 持续集成

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.13'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: pytest --cov=myapp --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage.xml
```

## 最佳实践

### 1. 测试命名

```python
# ✅ 清晰的命名
def test_user_creation_with_valid_email():
    pass

def test_login_fails_with_invalid_password():
    pass

# ❌ 不清晰
def test1():
    pass

def test_user():
    pass
```

### 2. 测试隔离

```python
# ✅ 每个测试独立
def test_create_user(db_session):
    user = User(username='test')
    db_session.add(user)
    db_session.commit()

# ❌ 依赖全局状态
global_user = None

def test_create():
    global global_user
    global_user = User(username='test')
```

### 3. 断言清晰

```python
# ✅ 明确的断言
assert user.username == 'alice'
assert response.status_code == 200
assert 'error' not in response.json()

# ❌ 模糊的断言
assert user
assert response
```

### 4. 使用辅助函数

```python
# ✅ 提取公共逻辑
def create_test_user(**kwargs):
    defaults = {'username': 'test', 'email': 'test@example.com'}
    defaults.update(kwargs)
    return User(**defaults)

def test_user_creation():
    user = create_test_user(username='alice')
    assert user.username == 'alice'
```

::: tip 最佳实践
1. 保持测试快速（< 1秒）
2. 每个测试只验证一个行为
3. 使用有意义的测试名称
4. Mock 外部依赖（数据库、API、文件系统）
5. 追求高覆盖率但不要盲目追求 100%
6. 定期运行测试并修复失败的测试
:::

## 使用场景

### 场景 1：参数化大批量数据驱动测试

同一个验证逻辑要覆盖几十组输入输出时，写几十个 `test_xxx` 函数会让测试文件臃肿。用 `@pytest.mark.parametrize` 把"输入/期望"抽成数据表，一处逻辑、N 组数据。

```python
@pytest.mark.parametrize("email,expected", [
    ("alice@example.com", True),
    ("bob@", False),
    ("", False),
    ("a@b.c", True),
])
def test_is_valid_email(email, expected):
    assert is_valid_email(email) is expected
```

### 场景 2：替换慢依赖做"快测试"

数据库、外部 API、文件系统都是测试里的"慢源"。用 fixture + Mock 把它们换成内存版本，单测速度从秒级降到毫秒级。

```python
@pytest.fixture
def mock_db():
    return Mock()

def test_create_user(mock_db):
    service = UserService(mock_db)
    service.create("Alice")
    mock_db.insert.assert_called_once()
```

### 场景 3：分层 fixture 复用环境

复杂测试常需要"数据库连接 + 已登录用户 + 测试数据"三层准备。Fixture 可以互相依赖，pytest 自动按依赖顺序创建并缓存。

```python
@pytest.fixture(scope="session")
def db(): ...                    # 整个 session 复用一个连接

@pytest.fixture
def user(db): ...                # 每个测试用 db 创建一个用户

def test_login(user):             # pytest 自动注入 db 和 user
    ...
```

### 场景 4：CI 卡片化（标记分类运行）

把"慢测试"和"集成测试"用 marker 标出来，CI 默认只跑快测试， nightly 跑全部。

```bash
pytest -m "not slow"           # 日常：跳过 slow
pytest -m integration          # 集成环境：只跑 integration
```

## 易错点

### 易错点 1：Mock 替换路径错——补丁打在"使用方"而非"定义方"

❌ **错误示例**：
```python
# myapp/services.py
import requests
def fetch(url):
    return requests.get(url).json()

# myapp/views.py
from myapp.services import fetch
def view():
    return fetch("http://x")

# 测试
@patch('myapp.services.requests.get')
def test_view(mock_get):           # 补丁打在 services 里
    mock_get.return_value.json.return_value = {"ok": True}
    result = view()                # views.py 里 fetch() 还会真的发 HTTP 请求！
```

✅ **正确做法**：
```python
# 方法 1：补丁打在"被使用的位置"——即 views 里的 fetch 符号
@patch('myapp.views.fetch')
def test_view(mock_fetch):
    mock_fetch.return_value = {"ok": True}
    result = view()

# 方法 2：补丁打在最底层 requests.get（在 services 模块里）
@patch('myapp.services.requests.get')
def test_fetch(mock_get):
    mock_get.return_value.json.return_value = {"ok": True}
    assert fetch("http://x") == {"ok": True}
```

**说明**：`mock.patch` 替换的是"那个名字在哪个命名空间里的引用"。`from x import y` 把 `y` 复制到当前模块后，补丁 `x.y` 不会影响当前模块的 `y`。原则：**补丁打在被测代码"实际去取这个名字"的位置**。混淆是测试 Mock 失效的首要原因。

### 易错点 2：参数化测试数据太多导致报告爆炸

❌ **错误示例**：
```python
@pytest.mark.parametrize("n", list(range(100)))
def test_many(n):
    assert n >= 0

# pytest 报告里会有 100 行，CI 日志被淹没
```

✅ **正确做法**：
```python
# 方法 1：相同性质的数据合并到一个测试
@pytest.mark.parametrize("group", [
    pytest.param([1, 2, 3], id="positive"),
    pytest.param([-1, -2, -3], id="negative"),
    pytest.param([0, 0, 0], id="zero"),
])
def test_signs(group):
    for n in group:
        ...

# 方法 2：用 pytest.param 给每个用例命名，方便定位
@pytest.mark.parametrize("n", [
    pytest.param(1, id="one"),
    pytest.param(100, id="hundred"),
])
def test_x(n): ...
```

**说明**：参数化是双刃剑——数据驱动很爽，但 100 组数据会让 CI 报告冗长、失败定位变难。**同性质的边界值合并、特殊值用 `pytest.param(id=...)` 命名**，能让报告精简且失败时一眼定位。

### 易错点 3：覆盖率 100% 但代码依然有 bug

❌ **错误理解**：
```python
def divide(a, b):
    return a / b

# 测试只覆盖了"成功路径"
def test_divide():
    assert divide(10, 2) == 5   # 行覆盖率 100%，但没测 b=0
```

✅ **正确理解**：
```python
def divide(a, b):
    if b == 0:
        raise ValueError("不能除零")
    return a / b

# 覆盖率只是"被执行过"，不代表"被验证过"
def test_divide():
    assert divide(10, 2) == 5

def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(10, 0)
```

**说明**：覆盖率工具只看"某行被跑过没有"，**不验证它是否被正确断言**。一个 `assert x == y` 都没写的测试也能刷出 100% 覆盖率。覆盖率是"必要不充分条件"——必须配合**有意义的断言 + 边界场景**才有价值。

## 练习题

### 基础练习

**题目 1**：用 `@pytest.mark.parametrize` 测试一个判断质数的函数，覆盖正数、负数、0、1、大质数等至少 5 种情况。

<details>
<summary>💡 查看答案</summary>

```python
import pytest

def is_prime(n: int) -> bool:
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

@pytest.mark.parametrize("n,expected", [
    pytest.param(-5, False, id="负数"),
    pytest.param(0, False, id="零"),
    pytest.param(1, False, id="一"),
    pytest.param(2, True, id="最小的质数"),
    pytest.param(7, True, id="普通质数"),
    pytest.param(9, False, id="合数"),
    pytest.param(97, True, id="大质数"),
])
def test_is_prime(n, expected):
    assert is_prime(n) is expected
```

**解析**：`pytest.param(..., id="...")` 给每组数据起名字，失败时直接看到是哪组挂了。
</details>

**题目 2**：写一个 fixture `db_session`，scope 设为 `function`，每个测试前后自动 commit/rollback。

<details>
<summary>💡 查看答案</summary>

```python
import pytest

@pytest.fixture
def db_session():
    session = create_session()
    session.begin()
    yield session
    session.rollback()
    session.close()

def test_create_user(db_session):
    db_session.add(User(name="Alice"))
    db_session.flush()   # 不 commit，让 teardown 时整体回滚
    assert db_session.query(User).count() == 1
```

**解析**：scope="function" + yield 后 rollback，让每个测试在干净的数据库状态跑，避免互相污染。
</details>

### 进阶练习

**题目 3**：用 Mock 替换 `requests.get` 测试一个调用外部 API 的函数，并断言：① 返回值正确 ② 调用次数和参数正确 ③ 发生异常时函数有合理降级。

<details>
<summary>💡 查看答案</summary>

```python
from unittest.mock import patch
import pytest

def fetch_user(uid):
    resp = requests.get(f"https://api.example.com/users/{uid}")
    if resp.status_code != 200:
        return None
    return resp.json()

@patch("myapp.requests.get")
def test_fetch_user_success(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"id": 1, "name": "Alice"}

    result = fetch_user(1)

    assert result == {"id": 1, "name": "Alice"}
    mock_get.assert_called_once_with("https://api.example.com/users/1")

@patch("myapp.requests.get")
def test_fetch_user_returns_none_on_error(mock_get):
    mock_get.return_value.status_code = 500
    assert fetch_user(1) is None
```

**解析**：补丁打在 `myapp.requests.get`（被测代码实际取这个名字的位置）。三组断言：返回值、调用次数+参数、异常降级——三个角度覆盖，缺一不可。
</details>

### 挑战练习

**题目 4**：为一段已有业务代码（如订单处理流程）补一套测试，要求：① 覆盖率 ≥ 90% ② 包含 Mock、fixture、参数化 ③ 至少一组集成测试（用 marker 标记，可单独跳过）。

**提示**：先跑 `pytest --cov` 看缺哪些分支；为每个分支设计一条测试；外部依赖（数据库、HTTP）用 Mock + 集成测试 marker 分两层处理。

## 费曼学习法检验

用自己的话回答以下问题（不要看上面的内容）：

1. **这是什么**：pytest 的 fixture 和 unittest 的 setUp/tearDown 有什么本质区别？

2. **为什么需要**：Mock 一个 API 调用时，为什么补丁路径打在 `myapp.views.fetch` 而不是 `services.fetch`？

3. **怎么用**：
   - 向新手解释 `scope="session"` 和 `scope="function"` 的差异。
   - 参数化测试数据太多时怎么让 CI 报告不那么冗长？

4. **注意事项**：
   - 覆盖率 100% 真的代表"测试充分"吗？为什么？
   - 什么时候应该写集成测试，什么时候应该写单元测试？

::: tip 学习建议
进阶测试的核心是**隔离 + 数据驱动**：用 fixture 隔离环境、用 parametrize 把"逻辑"和"数据"分离、用 Mock 把"自己代码"和"外部世界"切开。先把这三个工具用熟，大部分测试痛点都能解决。
:::

## 下一步

- **[CI/CD 自动化](../deployment/04-cicd.md)** - 自动化测试流程
- **[Flask 进阶](../web/03-flask-advanced.md)** - Flask 测试实践
- **[Django 进阶](../web/06-django-advanced.md)** - Django 测试实践
