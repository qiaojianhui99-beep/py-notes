# 包管理与虚拟环境

pip 和虚拟环境是 Python 开发的基础工具。

## pip 包管理器

### 安装包

```bash
# 安装最新版本
pip install requests

# 安装指定版本
pip install requests==2.28.0

# 安装最小版本
pip install requests>=2.28.0

# 从 requirements.txt 安装
pip install -r requirements.txt
```

### 卸载和升级

```bash
# 卸载
pip uninstall requests

# 升级
pip install --upgrade requests

# 升级 pip 自身
pip install --upgrade pip
```

### 查看已安装包

```bash
# 列出所有包
pip list

# 查看包详情
pip show requests

# 导出依赖
pip freeze > requirements.txt
```

## 虚拟环境（venv）

### 创建虚拟环境

```bash
# Python 3.3+
python -m venv myenv

# 激活（Windows）
myenv\Scripts\activate

# 激活（Linux/Mac）
source myenv/bin/activate

# 退出
deactivate
```

### 为什么需要虚拟环境

```bash
# 项目 A 需要 Django 3.2
# 项目 B 需要 Django 4.0
# 虚拟环境隔离依赖，互不影响
```

## requirements.txt

### 基本格式

```txt
requests==2.28.0
flask>=2.0.0
pandas<2.0.0
pytest
```

### 生成和使用

```bash
# 导出当前环境
pip freeze > requirements.txt

# 安装依赖
pip install -r requirements.txt
```

## pyproject.toml

Python 3.11+ 推荐的现代配置格式。

```toml
[project]
name = "myproject"
version = "0.1.0"
dependencies = [
    "requests>=2.28.0",
    "flask>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "black>=22.0.0",
]
```

## 使用场景

### 场景 1：新项目开发
创建虚拟环境，隔离依赖。

### 场景 2：团队协作
使用 requirements.txt 同步依赖。

### 场景 3：部署应用
使用虚拟环境确保依赖一致。

### 场景 4：测试不同版本
多个虚拟环境测试兼容性。

## 练习题

### 基础练习

**题目 1**：创建虚拟环境，安装 requests 和 flask，导出 requirements.txt。

<details>
<summary>💡 查看答案</summary>

```bash
# 创建虚拟环境
python -m venv myenv

# 激活
source myenv/bin/activate  # Linux/Mac
# 或 myenv\Scripts\activate  # Windows

# 安装包
pip install requests flask

# 导出
pip freeze > requirements.txt

# 查看
cat requirements.txt
```
</details>

### 进阶练习

**题目 2**：编写脚本，自动创建虚拟环境并安装依赖。

### 挑战练习

**题目 3**：研究 poetry 或 pipenv 等现代包管理工具。

## 费曼学习法检验

1. **这是什么**：为什么需要虚拟环境？全局安装有什么问题？

2. **为什么需要**：pip freeze 和手写 requirements.txt 有什么区别？

3. **怎么用**：向新手解释如何在新电脑上恢复项目环境？

4. **注意事项**：虚拟环境需要提交到 Git 吗？

::: tip 学习建议
虚拟环境是 Python 开发的标准实践！每个项目都应该有独立的虚拟环境。
:::
