# AGENTS.md

本文件为 AI 编码助手提供在本仓库工作的指引。本仓库是一个基于 **VitePress** 的 Python 学习笔记站点。

## 环境与命令

- 包管理器：**pnpm**（不要用 npm / yarn）。
- Node.js 18+（推荐 20+）。

| 命令 | 作用 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm docs:dev` | 启动开发服务器（`http://localhost:5173`，热更新） |
| `pnpm docs:build` | 生产构建到 `.vitepress/dist` |
| `pnpm docs:preview` | 预览构建产物 |

**改动后必须用 `pnpm docs:build` 验证**：VitePress 的死链检查会让构建失败（exit code 1），这是发现断链的主要手段。

## 推送代码前的检查流程

**务必遵守**：推送到远程 main 分支前，先在本地构建验证，避免线上构建失败。

### 标准流程

```bash
# 1. 本地构建检查
pnpm docs:build

# 2. 检查待提交文件，避免误提交临时目录或构建产物
git status --short
git add <明确需要提交的文件>
git commit -m "your message"
git push origin main
```

这样可以：
- 提前发现死链、语法错误等构建问题
- 保持 main 分支稳定，避免 GitHub Actions 失败
- 节省调试时间

## Git 分支与工作区管理

开始新任务前，先确认当前分支和远程 main 状态：

```bash
git status -sb
git fetch origin main --prune
git rev-list --left-right --count main...origin/main
```

如果本地 main 落后远程，先拉取更新；如果工作区有未提交改动，先确认这些改动是否属于当前任务，避免覆盖或混入无关内容。

每次新建临时分支完成工作后，按以下流程操作：

1. 确保所有更改已提交
2. 切换到 main 分支：`git checkout main`
3. 合并临时分支：`git merge <临时分支名>`
4. 删除临时分支：`git branch -d <临时分支名>`
5. 推送到远程：`git push origin main`

**示例**：
```bash
git checkout main
git merge claude/feature-branch
git branch -d claude/feature-branch
git push origin main
```

### 临时 worktree

`.claude/worktrees/` 是 Claude/Codex 等工具创建的临时 Git worktree 目录，用来隔离并行任务。默认不要提交这些目录。

- 已登记的 worktree 使用 `git worktree list` 查看
- 清理已登记 worktree 时，使用 `git worktree remove <路径>`
- 空的残留目录确认无内容后再删除
- 提交前用 `git status --short` 确认没有把 `.claude/worktrees/`、`.vitepress/dist/`、`.vitepress/cache/` 或 `node_modules/` 加入提交

## 目录结构

```
py-notes/
├── .vitepress/config.mts   # 站点配置：nav（顶部 tab）、sidebar、搜索、中文化
├── index.md                # 首页（layout: home）
├── basic/                  # 基础
├── advanced/               # 进阶
├── database/               # 数据库
├── web/                    # Web 框架
├── deployment/             # 部署
├── data-science/           # 数据科学
└── scraping/               # 爬虫
```

七个内容分区与顶部导航 tab 一一对应：`/basic/`、`/advanced/`、`/database/`、`/web/`、`/deployment/`、`/data-science/`、`/scraping/`。

## 关键约定（务必遵守）

1. **新增文章必须同步登记侧边栏**。仅创建 `.md` 文件不够，还要在 `.vitepress/config.mts` 对应分区的 `sidebar['/<区>/'].items` 里加一条链接，否则侧边栏不显示。
   ```ts
   // 例：在 sidebar['/basic/'] 中
   { text: '变量与数据类型', link: '/basic/variables' },
   ```

   推荐流程：
   1. 在对应分区创建 `.md` 文件
   2. 在 `.vitepress/config.mts` 的对应 `sidebar` 分组登记链接
   3. 检查正文中的站内链接是否使用 `cleanUrls` 风格
   4. 运行 `pnpm docs:build` 验证

2. **Python 示例代码以 Python 3.14 为目标**。推荐使用现代 Python 语法：
   - 类型标注使用 `X | Y`（不用 `Union`）
   - 可以使用 `match`/`case` 模式匹配（3.10+）
   - 在语法差异处标注旧版本（3.9-）写法对比

3. **链接规范**：站内链接用 `cleanUrls` 风格，不带 `.html` 后缀（如 `/basic/variables`）。

4. **正文里不要写裸 URL**。VitePress 会自动把裸 URL 转成链接并做死链检查，本地地址（如 `http://localhost:5173`）会导致构建失败。需要展示这类地址时，用行内代码包裹：`` `http://localhost:5173` ``。

5. **`README.md` 和 `AGENTS.md` 已通过 `srcExclude` 排除**。它们只是仓库说明文档，不会被构建成站点页面；不要把它们当作内容页处理。

6. **界面文案保持中文**。新增的主题相关文案（如侧边栏分组标题）统一用中文，与现有 `themeConfig` 一致。

## 写作规范

### 文章结构要求

每篇笔记必须包含以下四个部分：

1. **核心概念讲解**：清晰的概念定义和代码示例
2. **使用场景**：3-5 个实际应用场景，说明何时使用该知识点
3. **练习题**：3-5 道由浅入深的练习题，包含：
   - 基础题：直接应用所学知识
   - 进阶题：需要组合多个知识点
   - 挑战题：开放性问题或实际项目场景
4. **费曼学习法检验**：3-4 个自我检验问题，帮助读者确保真正理解

### 费曼学习法说明

费曼学习法是一种高效学习方法，通过「教」来检验是否真正理解：

1. **选择概念**：从章节中选择一个核心概念
2. **简化解释**：用最简单的语言解释给「完全不懂编程的人」
3. **发现盲点**：找出自己解释不清楚的地方
4. **重新学习**：回到文档查漏补缺，直到能流畅解释

### 写作模板

```markdown
# 标题

## 核心概念

[讲解内容和代码示例]

## 使用场景

### 场景 1：具体场景名称
描述该场景的应用，举例说明。

### 场景 2：具体场景名称
描述该场景的应用，举例说明。

### 场景 3：具体场景名称
描述该场景的应用，举例说明。

## 练习题

### 基础练习

**题目 1**：题目描述

<details>
<summary>💡 查看答案</summary>

\`\`\`python
# 答案代码
\`\`\`

**解析**：解题思路说明
</details>

### 进阶练习

**题目 2**：题目描述（提示：需要用到知识点 A 和 B）

### 挑战练习

**题目 3**：开放性题目，模拟实际项目场景

## 费曼学习法检验

用自己的话回答以下问题（不要看上面的内容）：

1. **这是什么**：用一句话解释这个知识点
2. **为什么需要**：它解决了什么问题？
3. **怎么用**：给一个完全不懂编程的人解释怎么使用
4. **注意事项**：新手容易犯什么错误？

::: tip 学习建议
如果上面 4 个问题你都能流畅回答，说明你已经真正掌握了本章内容！
:::
```

## 验证清单

改动后请确认：

- [ ] `pnpm docs:build` 通过，无死链报错
- [ ] 新文章已在 `sidebar` 登记，且能在侧边栏点开
- [ ] 示例代码符合 Python 3.14 语法
- [ ] 文章包含：使用场景、练习题、费曼学习法检验
- [ ] `git status --short` 中没有误加入 `.claude/worktrees/`、构建产物或依赖目录
