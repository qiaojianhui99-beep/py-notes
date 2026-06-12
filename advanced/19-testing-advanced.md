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

## 下一步

- **[CI/CD 自动化](../deployment/04-cicd.md)** - 自动化测试流程
- **[Flask 进阶](../web/03-flask-advanced.md)** - Flask 测试实践
- **[Django 进阶](../web/06-django-advanced.md)** - Django 测试实践
