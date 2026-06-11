# Python 简介与环境搭建

## Python 简介

Python 是一种解释型、面向对象、动态数据类型的高级程序设计语言。

### Python 特点

- 简单易学
- 开源免费
- 跨平台
- 丰富的库和框架

## Python 版本

- **Python 2.x**：已于 2020 年停止维护
- **Python 3.x**：当前主流版本，本笔记基于 **Python 3.14**

## 安装 Python

### Windows

1. 访问 [python.org](https://www.python.org/downloads/)
2. 下载 Python 3.14+ 安装包
3. 安装时勾选"Add Python to PATH"

### Mac

```bash
brew install python3
```

### Linux

```bash
sudo apt update
sudo apt install python3
```

## 开发环境

### 1. IDLE（自带）

Python 安装后自带的简易 IDE。

### 2. VSCode

推荐安装 Python 插件。

### 3. PyCharm

专业的 Python IDE。

## 第一个程序

```python
print("Hello, World!")
```

运行方式：
```bash
python hello.py
```

## 使用场景

### 场景 1：学习编程
Python 是最适合初学者的编程语言，语法简洁，上手快速。

### 场景 2：数据分析和科学计算
使用 pandas、numpy、matplotlib 进行数据处理和可视化。

### 场景 3：Web 开发
Django、Flask 等框架用于构建网站和 API 服务。

### 场景 4：自动化脚本
批量处理文件、自动化测试、系统管理任务。

### 场景 5：人工智能和机器学习
TensorFlow、PyTorch 等深度学习框架的首选语言。

## 练习题

### 基础练习

**题目 1**：安装 Python 后，在命令行输入 `python --version` 查看版本号，并截图。

**题目 2**：创建文件 `hello.py`，输出你的名字和年龄。

<details>
<summary>💡 查看答案</summary>

```python
print("我叫张三")
print("今年 25 岁")
```

运行：`python hello.py`
</details>

### 进阶练习

**题目 3**：编写程序，输出当前 Python 的版本信息（提示：使用 `sys` 模块）。

<details>
<summary>💡 查看答案</summary>

```python
import sys
print(f"Python 版本: {sys.version}")
print(f"版本信息: {sys.version_info}")
```

**解析**：`sys.version` 返回版本字符串，`sys.version_info` 返回详细版本元组。
</details>

### 挑战练习

**题目 4**：研究你选择的开发环境（IDLE/VSCode/PyCharm），写出至少 3 个提高编码效率的快捷键或功能。

## 费曼学习法检验

用自己的话回答以下问题：

1. **这是什么**：Python 是什么？它和其他编程语言（如 Java、C++）有什么不同？

2. **为什么需要**：为什么选择 Python 而不是其他语言？它最适合解决什么类型的问题？

3. **怎么用**：向一个完全不懂编程的人解释，如何在电脑上运行第一个 Python 程序？

4. **注意事项**：Python 2 和 Python 3 有什么区别？现在应该学哪个版本？

::: tip 学习建议
如果能用自己的话流畅回答上述问题，说明你已经理解了 Python 的基本概念。动手安装并运行第一个程序是最重要的第一步！
:::
