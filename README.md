# Python 笔记

[![GitHub Pages](https://img.shields.io/badge/docs-online-blue.svg)](https://qiaojianhui99-beep.github.io/py-notes/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![VitePress](https://img.shields.io/badge/VitePress-1.x-646CFF.svg)](https://vitepress.dev/)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB.svg?logo=python)](https://www.python.org/)

📚 完整的 Python 学习笔记，基于 [VitePress](https://vitepress.dev/) 搭建的现代化文档站点，内容分为**基础、进阶、数据库、Web 框架、部署、数据科学、爬虫**七个分区，顶部导航栏一键切换。

🌐 **在线阅读**: [https://qiaojianhui99-beep.github.io/py-notes/](https://qiaojianhui99-beep.github.io/py-notes/)

## 技术栈

- [VitePress](https://vitepress.dev/) —— 基于 Vite 的静态站点生成器
- [pnpm](https://pnpm.io/) —— 包管理工具
- Node.js 18+(推荐 20+)
- Python 3.14（示例代码目标版本）

## 目录结构

```
py-notes/
├── package.json            # 依赖与脚本
├── .vitepress/
│   └── config.mts          # 站点配置：导航 tab、侧边栏、搜索、中文化
├── index.md                # 首页
├── basic/                  # 基础
│   └── index.md
├── advanced/               # 进阶
│   └── index.md
├── database/               # 数据库
│   └── index.md
├── web/                    # Web 框架
│   └── index.md
├── deployment/             # 部署
│   ├── index.md
│   └── github-pages.md
├── data-science/           # 数据科学
│   └── index.md
└── scraping/               # 爬虫
    └── index.md
```

顶部七个 tab（**基础 / 进阶 / 数据库 / Web 框架 / 部署 / 数据科学 / 爬虫**）对应 `.vitepress/config.mts` 里的 `nav`；每个分区有独立的侧边栏 `sidebar`，用于组织该分区下的文章目录。

## 快速开始

安装依赖：

```bash
pnpm install
```

启动本地开发服务器（默认 `http://localhost:5173`，支持热更新）：

```bash
pnpm docs:dev
```

## 常用命令

| 命令 | 作用 |
|------|------|
| `pnpm docs:dev` | 启动开发服务器，实时预览 |
| `pnpm docs:build` | 生产构建，输出到 `.vitepress/dist` |
| `pnpm docs:preview` | 本地预览构建产物 |

## 如何添加内容

以在「基础」分区新增一篇《变量与数据类型》为例：

1. 新建文件 `basic/variables.md`，开头写标题并填入正文：

   ```markdown
   # 变量与数据类型

   正文内容……
   ```

2. 打开 `.vitepress/config.mts`，在 `sidebar['/basic/']` 的 `items` 中登记这篇文章：

   ```ts
   { text: '变量与数据类型', link: '/basic/variables' },
   ```

3. 保存后开发服务器会自动刷新，侧边栏即出现该条目。

其余分区（进阶 / 数据库 / Web 框架 / 部署 / 数据科学 / 爬虫）添加方式相同，只需替换对应的目录和 `sidebar` 键即可。

## 约定

- Python 示例代码以 **Python 3.14** 为目标，充分利用现代 Python 语法。
- 在语法变化处会标注旧版本（3.9-）和新版本（3.10+）的写法对比。
- 文章使用 Markdown 编写，支持 VitePress 的[扩展语法](https://vitepress.dev/guide/markdown)（代码高亮、提示容器、表格等）。
