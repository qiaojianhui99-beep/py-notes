# 包管理与虚拟环境

## 核心概念

pip 和虚拟环境是 Python 开发的基础工具。

- **pip**：安装、卸载、升级第三方包。
- **虚拟环境**：为每个项目创建独立的 Python 依赖环境。
- **requirements.txt**：记录项目依赖，方便别人恢复环境。

## pip 包管理器

### 安装包

```bash
# 安装最新版本
pip install requests

# 安装指定版本
pip install requests==2.28.0

# 安装最小版本
pip install "requests>=2.28.0"

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

# 激活（Linux/macOS）
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

现代 Python 项目常用 `pyproject.toml` 保存项目元数据、依赖和工具配置。

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

## 易错点

### 易错点 1：全局安装导致版本冲突

❌ **错误做法**：
```bash
# 全局安装，项目 A 需要 Django 2.2
pip install Django==2.2

# 项目 B 需要 Django 4.0，覆盖了之前的版本
pip install Django==4.0

# 项目 A 无法运行了
```

✅ **正确做法**：
```bash
# 为每个项目创建独立虚拟环境
# 项目 A
python -m venv venv_a
source venv_a/bin/activate  # Windows: venv_a\Scripts\activate
pip install Django==2.2

# 项目 B
python -m venv venv_b
source venv_b/bin/activate
pip install Django==4.0
```

**说明**：全局安装会导致不同项目的依赖冲突。每个项目应该有独立的虚拟环境。

### 易错点 2：忘记激活虚拟环境

❌ **错误现象**：
```bash
# 创建虚拟环境
python -m venv venv

# 忘记激活，直接安装
pip install requests  # 安装到全局环境

# 激活后发现没有 requests
source venv/bin/activate
python -c "import requests"  # ModuleNotFoundError
```

✅ **正确流程**：
```bash
# 1. 创建虚拟环境
python -m venv venv

# 2. 激活虚拟环境
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 安装包（会安装到虚拟环境）
pip install requests

# 4. 验证
python -c "import requests"
```

**说明**：安装包前必须先激活虚拟环境，否则会安装到全局。检查提示符是否有 `(venv)` 前缀。

### 易错点 3：虚拟环境目录提交到版本控制

❌ **错误做法**：
```bash
git add venv/  # 不应该提交虚拟环境
git commit -m "Add venv"
```

✅ **正确做法**：
```bash
# .gitignore
venv/
.venv/
env/
ENV/

# 只提交 requirements.txt
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Add dependencies"
```

**说明**：虚拟环境包含大量文件且与平台相关，不应提交到版本控制。应该提交 `requirements.txt`，让其他人自己创建环境。

## 练习题

### 基础练习

**题目 1**：创建虚拟环境，安装 requests 和 flask，导出 requirements.txt。

<details>
<summary>💡 查看答案</summary>

```bash
# 创建虚拟环境
python -m venv myenv

# 激活
source myenv/bin/activate  # Linux/macOS
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

**题目 2**：写出在一台新电脑上恢复项目环境的命令顺序。

<details>
<summary>💡 查看答案</summary>

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
```

如果项目没有 `requirements.txt`，需要先确认依赖来源，不能盲目安装。
</details>

### 挑战练习

**题目 3**：比较 `pip freeze > requirements.txt` 和手写 `requirements.txt` 的区别。

<details>
<summary>💡 查看参考答案</summary>

`pip freeze` 会导出当前环境中的所有包，适合记录完整环境，但可能包含项目并不直接依赖的包。手写 `requirements.txt` 更简洁，通常只写项目直接依赖，但需要开发者自己维护版本范围。
</details>

## 费曼学习法检验

1. **这是什么**：为什么需要虚拟环境？全局安装有什么问题？

2. **为什么需要**：pip freeze 和手写 requirements.txt 有什么区别？

3. **怎么用**：向新手解释如何在新电脑上恢复项目环境？

4. **注意事项**：虚拟环境需要提交到 Git 吗？

::: tip 学习建议
虚拟环境是 Python 开发的标准实践！每个项目都应该有独立的虚拟环境。
:::
