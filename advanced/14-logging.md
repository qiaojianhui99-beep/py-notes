# 日志系统

日志是程序运行状态的记录，是调试和监控的基础。

## logging 模块

### 基本使用

```python
import logging

logging.basicConfig(level=logging.INFO)

logging.debug("调试信息")
logging.info("一般信息")
logging.warning("警告信息")
logging.error("错误信息")
logging.critical("严重错误")
```

### 日志级别

```python
CRITICAL = 50
ERROR    = 40
WARNING  = 30
INFO     = 20
DEBUG    = 10
NOTSET   = 0
```

## Logger 对象

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# 创建 Handler
handler = logging.FileHandler('app.log')
handler.setLevel(logging.INFO)

# 创建 Formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
handler.setFormatter(formatter)

logger.addHandler(handler)

logger.info("应用启动")
```

## Handler 类型

### FileHandler

```python
file_handler = logging.FileHandler('app.log')
```

### RotatingFileHandler

```python
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    'app.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)
```

### TimedRotatingFileHandler

```python
from logging.handlers import TimedRotatingFileHandler

handler = TimedRotatingFileHandler(
    'app.log',
    when='midnight',
    interval=1,
    backupCount=7
)
```

### StreamHandler

```python
stream_handler = logging.StreamHandler()
```

## 日志配置

### 字典配置

```python
import logging.config

LOGGING_CONFIG = {
    'version': 1,
    'formatters': {
        'default': {
            'format': '%(asctime)s - %(levelname)s - %(message)s',
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'default',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'app.log',
            'formatter': 'default',
        }
    },
    'root': {
        'level': 'INFO',
        'handlers': ['console', 'file']
    }
}

logging.config.dictConfig(LOGGING_CONFIG)
```

## 使用场景

### 场景 1：应用监控
记录关键操作和异常。

```python
logger.info(f"用户 {user_id} 登录")
logger.error(f"支付失败: {error}", exc_info=True)
```

### 场景 2：调试
定位问题。

```python
logger.debug(f"变量值: {data}")
```

### 场景 3：审计
记录敏感操作。

```python
logger.warning(f"权限不足: {user_id}")
```

## 易错点

### 易错点 1：在模块顶层用 `logging.basicConfig` 多次调用只生效一次

❌ **错误示例**：
```python
import logging

# 模块 A 里
logging.basicConfig(level=logging.DEBUG)

# 模块 B 里又想覆盖配置
logging.basicConfig(level=logging.WARNING, format='%(message)s')
# basicConfig 默认行为：只有第一次（root logger 没 handler 时）才生效
# 第二次调用毫无效果
```

✅ **正确做法**：
```python
import logging

# 方法 1：程序入口（main）配置一次，其他模块只 getLogger
def setup_logging():
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s %(levelname)s %(message)s',
    )

if __name__ == "__main__":
    setup_logging()
    # 业务逻辑

# 方法 2：强制重新配置（force=True，Python 3.8+）
logging.basicConfig(level=logging.WARNING, force=True)

# 方法 3：用 dictConfig / 文件配置，显式覆盖
import logging.config
logging.config.dictConfig({...})
```

**说明**：`basicConfig` 设计上是"幂等"的——只有 root logger 没有 handler 时才会真的配置。在生产代码里应**只在主入口配置一次**，库代码用 `logging.getLogger(__name__)` 拿 logger 即可，让应用决定日志格式。要在运行时改配置，用 `force=True`（3.8+）或 `dictConfig`。

### 易错点 2：日志里 `f-string` 让格式串失去延迟求值

❌ **错误示例**：
```python
import logging

logger = logging.getLogger(__name__)

# 即使级别是 WARNING，DEBUG 字符串也会先拼接
def process(data):
    logger.debug(f"处理数据: {json.dumps(data)}")   # 拼接先发生
    # 如果 level=WARNING，DEBUG 不输出，但 f-string 还是计算了
```

✅ **正确做法**：
```python
# 方法 1：用 %-style，参数延迟到确实要输出时才格式化
logger.debug("处理数据: %s", data)   # data 的 repr 只在真的输出时才求值

# 方法 2：先判级别，避免昂贵格式化
if logger.isEnabledFor(logging.DEBUG):
    logger.debug(f"处理数据: {json.dumps(data)}")
```

**说明**：`logger.debug(f"...")` 会**先**把 f-string 求值（即使最终不输出），对昂贵对象（`json.dumps`、大字典、数据库查询）来说会浪费 CPU。传统 `%s, %d` 占位符是延迟到确定输出时才调 `__repr__`/`__str__`，性能好得多。

### 易错点 3：库代码直接用 root logger 导致日志格式被应用接管

❌ **错误示例**：
```python
# my_library.py
import logging
logging.info("库初始化")  # 用了 root logger，污染应用日志

# app.py
logging.basicConfig(level=logging.WARNING)  # 只想看 WARNING
import my_library
# 库里调的 logging.info() 被 root 接收，但 level=WARNING 过滤掉了
# 或者反过来：库给 root 加了 handler，应用的格式被改了
```

✅ **正确做法**：
```python
# my_library.py
import logging

logger = logging.getLogger(__name__)   # 每个模块独立 logger
logger.addHandler(logging.NullHandler())  # 默认没有输出，避免"未配置时打印到 stderr"

logger.info("库初始化")

# app.py
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
import my_library  # 应用决定如何处理库的日志
```

**说明**：库代码应该 `logging.getLogger(__name__)` 拿自己模块路径的 logger，并加 `NullHandler` 避免"用户没配置时打印到 stderr"。是否输出、输出到哪里、什么格式，全部交给应用的入口配置。

## 练习题

### 基础练习

**题目 1**：配置日志同时输出到控制台和文件。

<details>
<summary>💡 查看答案</summary>

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# 控制台 Handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# 文件 Handler
file_handler = logging.FileHandler('app.log')
file_handler.setLevel(logging.DEBUG)

# Formatter
formatter = logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s'
)
console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

logger.addHandler(console_handler)
logger.addHandler(file_handler)
```
</details>

### 进阶练习

**题目 2**：实现日志轮转，每天一个日志文件，保留 7 天。

### 挑战练习

**题目 3**：实现自定义 Handler，将日志发送到远程服务器。

## 费曼学习法检验

1. **这是什么**：Logger、Handler、Formatter 的关系？

2. **为什么需要**：为什么不用 print() 调试？

3. **怎么用**：向新手解释日志级别的使用场景？

4. **注意事项**：日志文件如何避免占满磁盘？

::: tip 学习建议
日志是运维必备！合理的日志能快速定位问题。
:::
