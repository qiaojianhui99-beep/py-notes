# 进阶

深入 Python 高级特性，掌握并发编程、性能优化、元编程等核心技能。

## 学习路线

```
垃圾回收 → 装饰器/生成器 → 并发编程（多线程/进程/异步）→ 测试与日志 → 性能优化
```

## 章节概览

### 核心机制

- **[垃圾回收机制](01-garbage-collection.md)** - 引用计数、循环引用、gc 模块
- **[装饰器进阶](02-decorator-advanced.md)** - 带参数装饰器、类装饰器、functools.wraps
- **[生成器与迭代器](03-generator-iterator.md)** - yield、生成器表达式、迭代器协议
- **[上下文管理器](04-context-manager.md)** - with 语句、contextlib、自定义上下文
- **[元类](05-metaclass.md)** - type、__new__、__init__、元类应用
- **[描述符](06-descriptor.md)** - __get__、__set__、property 原理

### 并发编程

- **[多线程编程](07-multithreading.md)** - threading、Lock、GIL、线程池
- **[多进程编程](08-multiprocessing.md)** - multiprocessing、进程池、进程通信
- **[异步编程基础](09-asyncio-basics.md)** - asyncio、async/await、协程
- **[异步编程进阶](10-asyncio-advanced.md)** - aiohttp、异步上下文、事件循环
- **[Concurrent.futures](18-concurrent-futures.md)** - 线程池/进程池统一接口

### 文件与正则

- **[文件操作进阶](11-file-advanced.md)** - pathlib、二进制文件、大文件处理
- **[正则表达式](12-regular-expression.md)** - re 模块、常用模式、性能优化

### 测试与日志

- **[单元测试](13-testing.md)** - unittest、pytest、mock、覆盖率
- **[日志系统](14-logging.md)** - logging 模块、日志配置、最佳实践

### 性能与类型

- **[性能优化](15-performance.md)** - timeit、cProfile、内存优化、算法优化
- **[Dataclass](16-dataclass.md)** - @dataclass、字段定义、不可变类
- **[类型注解进阶](17-typing-advanced.md)** - 泛型、Protocol、TypeVar、mypy

## 学习建议

::: tip 前置要求
学习进阶内容前，请确保已掌握：
- ✅ 基础章节（01-21 章）
- ✅ 面向对象编程
- ✅ 函数式编程基础
:::

::: warning 难度说明
进阶章节涉及 Python 底层机制和高级特性：
- **中等难度**：01-04、11-14、16
- **较高难度**：05-06、09-10、15、17
- **高难度**：07-08、18（并发编程需要操作系统基础）
:::

## 推荐学习顺序

### 路线 1：全栈开发方向
```
01 垃圾回收 → 02-04 装饰器/生成器/上下文 
    ↓
09-10 异步编程 → 11 文件进阶 → 12 正则表达式
    ↓
13-14 测试与日志 → 15 性能优化
```

### 路线 2：数据科学方向
```
01 垃圾回收 → 07-08 多线程/进程
    ↓
15 性能优化 → 11 文件进阶 → 16 Dataclass
```

### 路线 3：系统编程方向
```
01 垃圾回收 → 05-06 元类/描述符
    ↓
07-08 多线程/进程 → 09-10 异步编程 → 18 Concurrent.futures
    ↓
13-14 测试与日志 → 15 性能优化
```

## 实战建议

1. **垃圾回收**：分析内存泄漏场景
2. **装饰器**：实现缓存、日志、权限控制
3. **异步编程**：构建高性能 Web 爬虫
4. **测试**：为现有项目添加单元测试
5. **性能优化**：优化慢查询和计算密集任务

## 扩展阅读

- 《流畅的 Python》（第 2 版）
- 《Python Cookbook》（第 3 版）
- [Real Python](https://realpython.com) - 高质量进阶教程
- [PEP 索引](https://www.python.org/dev/peps/) - Python 增强提案
