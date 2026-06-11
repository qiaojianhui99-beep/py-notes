# AGENTS.md

本文件为 AI 编码助手提供在本仓库工作的指引。这是一个基于 **VitePress** 的 Python 学习笔记站点。

## 环境与命令

- 包管理器:**pnpm**(不要用 npm / yarn)。
- Node.js 18+(推荐 20+)。

| 命令 | 作用 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm docs:dev` | 启动开发服务器(http://localhost:5173,热更新) |
| `pnpm docs:build` | 生产构建到 `.vitepress/dist` |
| `pnpm docs:preview` | 预览构建产物 |

**改动后用 `pnpm docs:build` 验证**:VitePress 的死链检查会让构建失败(exit code 1),这是发现断链的主要手段。

## Git 分支管理

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

## 目录结构

```
py-notes/
├── .vitepress/config.mts   # 站点配置:nav(顶部 tab)、sidebar、搜索、中文化
├── index.md                # 首页(layout: home)
├── basic/                  # 基础
├── advanced/               # 进阶
├── database/               # 数据库
└── web/                    # Web 框架
```

四个分区与顶部导航 tab 一一对应:`/basic/`、`/advanced/`、`/database/`、`/web/`。

## 关键约定(务必遵守)

1. **新增文章必须同步登记侧边栏**。仅创建 `.md` 文件不够,还要在 `.vitepress/config.mts` 对应分区的 `sidebar['/<区>/'].items` 里加一条链接,否则侧边栏不显示。
   ```ts
   // 例:在 sidebar['/basic/'] 中
   { text: '变量与数据类型', link: '/basic/variables' },
   ```

2. **Python 示例代码以 Python 3.9 为目标**。禁止使用 3.10+ 语法:
   - 不用 `match`/`case` 结构化模式匹配;
   - 类型标注不用 `X | Y`,改用 `typing.Optional` / `typing.Union`;
   - 不用 3.10+ 才有的标准库特性。

3. **链接规范**:站内链接用 `cleanUrls` 风格,不带 `.html` 后缀(如 `/basic/variables`)。

4. **正文里不要写裸 URL**。VitePress 会自动把裸 URL 转成链接并做死链检查,本地地址(如 `http://localhost:5173`)会导致构建失败。需要展示这类地址时,用行内代码包裹:`` `http://localhost:5173` ``。

5. **`README.md` 已通过 `srcExclude` 排除**,它只是仓库说明文档,不会被构建成站点页面;不要把它当作内容页处理。

6. **界面文案保持中文**。新增的主题相关文案(如侧边栏分组标题)统一用中文,与现有 `themeConfig` 一致。

## 验证清单

改动后请确认:

- [ ] `pnpm docs:build` 通过,无死链报错;
- [ ] 新文章已在 `sidebar` 登记且能在侧边栏点开;
- [ ] 示例代码符合 Python 3.9 语法。
