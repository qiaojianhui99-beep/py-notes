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
