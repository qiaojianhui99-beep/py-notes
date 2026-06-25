# Alembic 数据库迁移

Alembic 是 SQLAlchemy 作者开发的**数据库迁移工具**，用于管理数据库结构（schema）的版本变化。它能像 Git 管理代码一样，记录每一次表结构的修改，并支持升级（upgrade）和回滚（downgrade）。

## 核心概念

### 为什么需要数据库迁移？

开发过程中，数据库结构会不断变化：新增一张表、给已有表加一列、修改字段类型、建立索引……如果手动改库，会遇到这些问题：

- 团队成员的数据库结构不一致，「在我机器上是好的」
- 生产环境改库没有记录，出错难以回滚
- 无法追溯「这张表的某一列是什么时候、为什么加的」

**迁移（Migration）** 把每一次结构变化写成一个带版本号的脚本，纳入版本控制。任何人、任何环境只要执行迁移，就能得到一致的数据库结构。

```python
# 模型变化前
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

# 模型变化后：新增了 email 列
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    email: Mapped[str | None]  # 新增字段
```

直接改模型并不会改动已存在的数据库表，Alembic 的作用就是把这种「模型差异」生成可执行、可回滚的 SQL 脚本。

### 安装与初始化

```bash
# 安装（通常随 SQLAlchemy 一起使用）
pip install alembic

# 在项目根目录初始化，生成 alembic/ 目录和 alembic.ini
alembic init alembic
```

初始化后的目录结构：

```
项目根/
├── alembic.ini              # 配置文件：数据库连接、日志等
└── alembic/
    ├── env.py               # 迁移运行环境（关键，需要配置 target_metadata）
    ├── script.py.mako       # 迁移脚本模板
    └── versions/            # 所有迁移脚本存放处
```

### 配置数据库连接与模型元数据

迁移要工作，必须告诉 Alembic 两件事：**连接哪个数据库**、**对比哪份模型定义**。

1. 在 `alembic.ini` 中配置连接串：

```ini
# alembic.ini
sqlalchemy.url = mysql+pymysql://user:password@localhost/mydb
```

::: warning 安全提示
不要把生产环境密码写进提交到仓库的 `alembic.ini`。推荐在 `env.py` 中从环境变量读取，下面有示例。
:::

2. 在 `alembic/env.py` 中绑定模型的 `metadata`，这是**自动生成迁移**的前提：

```python
# alembic/env.py（节选）
import os
from myapp.models import Base  # 你的声明式基类

# 让 --autogenerate 能对比模型与数据库的差异
target_metadata = Base.metadata

# 从环境变量读取连接串，覆盖 alembic.ini 中的明文配置
config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])
```

### 创建与执行迁移

```bash
# 1. 自动生成迁移脚本（对比模型与当前数据库的差异）
alembic revision --autogenerate -m "创建用户表"

# 2. 升级到最新版本（执行所有未应用的迁移）
alembic upgrade head

# 3. 回滚一个版本
alembic downgrade -1

# 4. 回滚到最初（撤销所有迁移）
alembic downgrade base
```

::: tip --autogenerate 不是万能的
自动生成能识别：新增/删除表、新增/删除列、索引、唯一约束等。但**无法可靠识别**：列改名（会被当成「删一列 + 加一列」，导致数据丢失）、字段类型的细微变化、某些约束。生成后**务必人工检查脚本**再执行。
:::

### 迁移脚本的结构

每个生成的脚本都包含一对函数：

```python
"""创建用户表

Revision ID: a1b2c3d4e5f6
Revises: (上一个版本号)
Create Date: 2026-06-25 10:30:00
"""
from alembic import op
import sqlalchemy as sa

# 版本标识，构成一条有向链表
revision = "a1b2c3d4e5f6"
down_revision = None  # 上一个版本，None 表示这是第一个

def upgrade() -> None:
    """升级：描述「如何应用这次变更」"""
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(50), nullable=False),
    )

def downgrade() -> None:
    """回滚：描述「如何撤销这次变更」，应与 upgrade 严格对称"""
    op.drop_table("users")
```

**关键点**：`revision` 和 `down_revision` 把所有脚本串成一条链，Alembic 据此知道迁移的先后顺序；`upgrade` 与 `downgrade` 必须是互逆操作。

### 常用 op 操作

```python
from alembic import op
import sqlalchemy as sa

# 新增列
op.add_column("users", sa.Column("email", sa.String(120), nullable=True))

# 删除列
op.drop_column("users", "email")

# 修改列（类型、是否可空等）
op.alter_column("users", "name",
                existing_type=sa.String(50),
                type_=sa.String(100),
                nullable=False)

# 创建/删除索引
op.create_index("ix_users_email", "users", ["email"], unique=True)
op.drop_index("ix_users_email", table_name="users")

# 执行任意 SQL（数据迁移常用）
op.execute("UPDATE users SET email = name || '@example.com' WHERE email IS NULL")
```

## 使用场景

### 场景 1：团队协作统一数据库结构

多人开发同一项目时，A 加了一张订单表、B 给用户表加了手机号列。各自生成迁移脚本提交到 Git 后，其他人只需 `git pull` 再 `alembic upgrade head`，本地数据库就和最新模型保持一致，避免「结构对不上」的扯皮。

### 场景 2：生产环境安全发布与回滚

上线新版本时，部署脚本里执行 `alembic upgrade head` 自动应用结构变更。一旦新版本出问题，`alembic downgrade -1` 即可回到上一个结构版本，配合代码回滚实现快速止损。

### 场景 3：数据迁移（不只是改结构）

需要把旧字段的数据搬到新字段时，可在迁移脚本里用 `op.execute()` 写 SQL，或用 `op.bulk_insert()` 批量插数据。例如把 `full_name` 拆成 `first_name` / `last_name`，在同一个迁移里先建列、再迁移数据、最后删旧列。

### 场景 4：多环境/多数据库管理

测试库、预发库、生产库结构需要一致。通过环境变量切换 `DATABASE_URL`，同一套迁移脚本可在不同环境重复执行，保证三套环境结构同步。

### 场景 5：审计与追溯

`versions/` 目录就是一部「数据库结构演变史」。每个脚本的 message 和 Create Date 记录了「什么时候、为什么改了结构」，排查历史问题时非常有用。

## 练习题

### 基础练习

**题目 1**：你已经写好了 SQLAlchemy 模型并配置好 `alembic/env.py` 的 `target_metadata`。请写出「自动生成一个名为 *add posts table* 的迁移，然后应用到数据库」所需的两条命令。

<details>
<summary>💡 查看答案</summary>

```bash
# 1. 自动生成迁移脚本
alembic revision --autogenerate -m "add posts table"

# 2. 应用到最新版本
alembic upgrade head
```

**解析**：`--autogenerate` 让 Alembic 对比模型 `metadata` 与当前数据库的差异并生成脚本；`upgrade head` 执行所有尚未应用的迁移直到最新。生成后应先打开 `versions/` 下的新脚本检查内容再 upgrade。
</details>

### 基础练习

**题目 2**：手写一个迁移脚本的 `upgrade` 和 `downgrade`，要求给已存在的 `users` 表新增一个可空的 `age`（整数）列，并保证可以正确回滚。

<details>
<summary>💡 查看答案</summary>

```python
from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    op.add_column("users", sa.Column("age", sa.Integer, nullable=True))

def downgrade() -> None:
    op.drop_column("users", "age")
```

**解析**：`upgrade` 加列，`downgrade` 必须是其逆操作即删列，两者对称才能安全回滚。新增列设为 `nullable=True`，否则已有数据行无法满足非空约束会导致迁移失败。
</details>

### 进阶练习

**题目 3**：需要把 `users` 表的 `name` 列拆分逻辑——先新增一个非空的 `username` 列，但表里已有数据。直接加非空列会失败，请设计一个迁移分三步完成（提示：用到 `op.add_column`、`op.execute`、`op.alter_column`）。

<details>
<summary>💡 查看答案</summary>

```python
from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    # 第 1 步：先加可空列，避免已有数据违反非空约束
    op.add_column("users", sa.Column("username", sa.String(50), nullable=True))
    # 第 2 步：用已有数据回填新列
    op.execute("UPDATE users SET username = name WHERE username IS NULL")
    # 第 3 步：回填完成后再改为非空
    op.alter_column("users", "username",
                    existing_type=sa.String(50), nullable=False)

def downgrade() -> None:
    op.drop_column("users", "username")
```

**解析**：给已有数据的表加非空列，必须「先加可空列 → 回填数据 → 再设非空」，否则数据库会因为旧行的新列为 NULL 而拒绝。这是生产环境最常见的迁移模式。
</details>

### 挑战练习

**题目 4**：你的团队两个分支各自生成了一个迁移脚本，合并后 `alembic upgrade head` 报错说出现了「multiple heads（多个头）」。请解释为什么会这样，并说明如何用 Alembic 命令解决。

<details>
<summary>💡 查看答案</summary>

```bash
# 查看当前有哪些 head
alembic heads

# 生成一个合并迁移，把多个 head 汇合成一个
alembic merge -m "merge branches" <head1> <head2>

# 之后正常升级
alembic upgrade head
```

**解析**：迁移脚本通过 `down_revision` 构成链表。两个分支都基于同一个父版本各加了一个脚本，就出现了两个没有后继的 head，Alembic 不知道该按哪条走。`alembic merge` 会创建一个新脚本，其 `down_revision` 同时指向这两个 head，把分叉重新合并成一条线。这是多人协作下的典型问题，理解 revision 链表结构是关键。
</details>

## 费曼学习法检验

用自己的话回答以下问题（不要看上面的内容）：

1. **这是什么**：用一句话解释 Alembic 是做什么的。
2. **为什么需要**：如果不用迁移工具、直接手动改数据库，会遇到哪些问题？
3. **怎么用**：给一个完全不懂编程的人解释——「迁移脚本」为什么要同时写 upgrade 和 downgrade 两段？
4. **注意事项**：为什么 `--autogenerate` 生成的脚本不能不看就直接执行？列改名时它会怎么误判？

::: tip 学习建议
如果上面 4 个问题你都能流畅回答，说明你已经真正掌握了本章内容！
:::

**下一步学习：**
- [SQLAlchemy ORM](./04-sqlalchemy) - 模型定义与查询
- [最佳实践](./08-best-practices) - 数据库设计与团队协作规范
- [实战项目](./09-project) - 完整项目中的迁移管理
