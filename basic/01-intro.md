# Python 简介与环境搭建

## 核心概念

Python 是一种高级编程语言。它的语法接近日常英语，适合初学者入门，也能用于真实项目开发。

学习 Python 前，先分清三个概念：

- **Python 语言**：一套写代码的规则，比如 `print("Hello")` 表示输出文本。
- **Python 解释器**：负责运行 Python 代码的程序。
- **`.py` 文件**：保存 Python 代码的文本文件，例如 `hello.py`。

当你运行一个 `.py` 文件时，Python 解释器会从上到下读取代码，并执行每一行。

## Python 版本

- **Python 2.x**：已经在 2020 年停止维护，不建议学习。
- **Python 3.x**：当前主流版本，本笔记以 **Python 3.14** 为目标。

如果刚开始学习，直接安装 Python 3 的最新稳定版本即可。

## 安装 Python

### Windows

1. 打开 [Python 下载页面](https://www.python.org/downloads/)。
2. 下载 Python 3 安装包。
3. 安装时勾选 `Add Python to PATH`。
4. 安装完成后打开命令行，输入：

```bash
python --version
```

如果 Windows 上 `python` 命令不可用，可以尝试：

```bash
py --version
```

### macOS

```bash
brew install python3
python3 --version
```

### Linux

```bash
sudo apt update
sudo apt install python3
python3 --version
```

## 开发环境

初学阶段不需要复杂工具，能写代码、能运行代码即可。

### IDLE

Python 自带的简易开发环境，适合快速试一两行代码。

### VS Code

轻量、常用，推荐安装 Python 插件。

### PyCharm

功能完整，适合后续做较大的 Python 项目。

## 第一个程序

创建文件 `hello.py`，写入：

```python
print("Hello, World!")
```

在命令行进入文件所在目录，运行：

```bash
python hello.py
```

如果你的系统只提供 `python3` 或 `py` 命令，可以改用：

```bash
python3 hello.py
```

或：

```bash
py hello.py
```

如果看到 `Hello, World!`，说明 Python 已经可以正常运行。

## 使用场景

### 场景 1：学习编程

Python 语法简洁，适合用来理解变量、条件、循环、函数等编程基础。

### 场景 2：自动化办公

可以批量处理文件、整理表格、生成报告，减少重复操作。

### 场景 3：数据分析

Python 生态中有大量数据处理和可视化工具，适合分析表格、日志和业务数据。

### 场景 4：Web 开发

可以用 Flask、Django、FastAPI 等框架开发网站和接口服务。

### 场景 5：人工智能

很多机器学习和深度学习工具都优先支持 Python。

## 易错点

### 易错点 1：安装时忘记勾选 "Add Python to PATH"

❌ **错误现象**：
```bash
python --version
# 'python' 不是内部或外部命令
```

✅ **解决方法**：
- 重新安装 Python，确保勾选 `Add Python to PATH`
- 或者手动将 Python 安装目录添加到系统环境变量

**说明**：PATH 是系统查找可执行程序的路径列表。如果不添加到 PATH，命令行找不到 `python` 命令。

### 易错点 2：混淆 Python 2 和 Python 3

❌ **错误示例**：
```python
# Python 2 语法
print "Hello"  # Python 3 会报错
```

✅ **正确示例**：
```python
# Python 3 语法
print("Hello")
```

**说明**：Python 2 已停止维护，本教程所有代码都基于 Python 3。如果系统同时安装了两个版本，使用 `python3` 命令明确调用 Python 3。

### 易错点 3：使用文本编辑器的"智能引号"

❌ **错误示例**：
```python
print("Hello")  # 引号是中文的或智能引号，会报错
```

✅ **正确示例**：
```python
print("Hello")  # 使用英文半角引号
```

**说明**：代码必须使用英文半角符号。Word 或部分编辑器会自动替换引号，建议使用专门的代码编辑器。

## 练习题

### 基础练习

**题目 1**：在命令行查看 Python 版本，确认当前安装的是 Python 3。

<details>
<summary>💡 查看答案</summary>

Windows 常用命令：

```bash
python --version
```

如果不可用，尝试：

```bash
py --version
```

macOS/Linux 常用命令：

```bash
python3 --version
```

只要输出中包含 `Python 3.x.x`，就说明版本正确。
</details>

**题目 2**：创建文件 `hello.py`，输出你的名字。

<details>
<summary>💡 查看答案</summary>

```python
print("我叫小明")
```

运行：

```bash
python hello.py
```
</details>

### 进阶练习

**题目 3**：修改 `hello.py`，让它分两行输出你的名字和一句学习目标。

<details>
<summary>💡 查看答案</summary>

```python
print("我叫小明")
print("我要学会用 Python 写程序")
```
</details>

### 挑战练习

**题目 4**：用自己的话解释：命令行里直接输入 `python` 和运行 `python hello.py` 有什么区别？

<details>
<summary>💡 查看参考答案</summary>

直接输入 `python` 会进入交互式环境，适合临时试代码。运行 `python hello.py` 会执行文件中的代码，适合保存和反复运行一个完整程序。
</details>

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：Python 语言、Python 解释器、`.py` 文件分别是什么？
2. **为什么需要**：为什么学习前要先确认 Python 版本？
3. **怎么用**：如何从创建文件到运行第一个 Python 程序？
4. **注意事项**：如果命令行提示找不到 `python`，可以先检查什么？

::: tip 学习建议
第一章的重点不是记住很多概念，而是成功运行第一个 `.py` 文件。能运行，后面才有练习的基础。
:::
