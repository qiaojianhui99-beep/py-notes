# GitHub 项目部署（GitHub Pages + Actions）

本文以**本项目（VitePress 文档站）**为例，讲清楚如何把代码推到 GitHub 后，自动构建并发布到 GitHub Pages。每一步都标注了**易错点**与**注意事项**。

最终效果：访问 `https://<用户名>.github.io/<仓库名>/` 就能看到站点。

## 整体流程概览

```
本地改动 → git push 到 main → GitHub Actions 自动构建 → 发布到 GitHub Pages
```

整个部署由两部分组成：

1. **构建配置**：`base` 路径要和仓库名一致。
2. **自动化部署**：`.github/workflows/deploy.yml` 负责构建并发布。

## 第一步：配置 `base` 路径（最容易踩坑的一步）

GitHub Pages 项目站点的访问地址是 `https://<用户名>.github.io/<仓库名>/`，注意结尾有 `/<仓库名>/` 这一段子路径。如果不配置 `base`，所有 CSS / JS / 图片都会指向网站根目录 `/`，导致**页面加载出来但样式全丢、白屏或 404**。

在 `.vitepress/config.mts` 中设置：

```ts
export default defineConfig({
  base: '/py-notes/', // 必须与仓库名一致，且前后都带斜杠
  // ...
})
```

::: warning 易错点
- `base` 的值必须是 `/仓库名/`，**前后都要有斜杠**。写成 `py-notes` 或 `/py-notes`（缺斜杠）都会出问题。
- 如果你用的是**用户主页仓库**（仓库名形如 `<用户名>.github.io`），则站点直接挂在根路径，此时 `base` 应设为 `/`（或不设）。
- 仓库改名后，记得同步修改 `base`，否则线上资源全部 404。
:::

## 第二步：编写 GitHub Actions 工作流

在仓库根目录创建 `.github/workflows/deploy.yml`：

```yaml
# GitHub Actions 工作流配置
# 官方文档：https://docs.github.com/zh/actions/using-workflows/workflow-syntax-for-github-actions

name: Deploy to GitHub Pages  # 工作流名称，显示在 Actions 标签页

# 触发条件：何时运行此工作流
on:
  push:
    branches: [main]      # 推送到 main 分支时自动触发
  workflow_dispatch:      # 允许在 Actions 页面手动点击触发

# 权限设置：授予工作流的访问权限
# 文档：https://docs.github.com/zh/actions/using-jobs/assigning-permissions-to-jobs
permissions:
  contents: read          # 读取仓库内容（克隆代码）
  pages: write            # 写入 GitHub Pages（部署站点）
  id-token: write         # 签发 OIDC 令牌（Pages 部署认证）

# 并发控制：防止多个部署同时运行
# 文档：https://docs.github.com/zh/actions/using-jobs/using-concurrency
concurrency:
  group: pages            # 并发组名称，同组任务互斥
  cancel-in-progress: false  # 新任务不取消正在运行的任务

# 任务定义：工作流由多个 job 组成
jobs:
  # 构建任务：编译站点
  build:
    runs-on: ubuntu-latest  # 运行环境：Ubuntu 最新版
    steps:
      # 步骤 1：检出代码
      # 文档：https://github.com/actions/checkout
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # 完整克隆（含所有 commit），供 VitePress lastUpdated 功能使用

      # 步骤 2：安装 pnpm 包管理器
      # 文档：https://github.com/pnpm/action-setup
      - uses: pnpm/action-setup@v3
        with:
          version: 8       # pnpm 版本，需与本地开发环境一致

      # 步骤 3：安装 Node.js
      # 文档：https://github.com/actions/setup-node
      - uses: actions/setup-node@v4
        with:
          node-version: 20  # Node.js 版本
          cache: pnpm       # 缓存 pnpm 依赖，加速后续构建

      # 步骤 4：安装项目依赖
      - run: pnpm install

      # 步骤 5：执行构建命令，生成静态站点
      - run: pnpm docs:build

      # 步骤 6：上传构建产物为 Pages 部署格式
      # 文档：https://github.com/actions/upload-pages-artifact
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .vitepress/dist  # VitePress 默认构建输出目录

  # 部署任务：发布到 GitHub Pages
  deploy:
    needs: build            # 依赖 build 任务成功完成
    runs-on: ubuntu-latest  # 运行环境
    environment:
      name: github-pages    # 部署环境名称（在仓库 Settings 可查看）
      url: ${{ steps.deployment.outputs.page_url }}  # 部署后的站点 URL
    steps:
      # 步骤：执行 Pages 部署
      # 文档：https://github.com/actions/deploy-pages
      - id: deployment      # 步骤 ID，供 url 引用
        uses: actions/deploy-pages@v4
```

::: warning 易错点
- **`permissions` 不能少**：缺少 `pages: write` 和 `id-token: write`，`deploy-pages` 会报权限错误。
- **`path` 要对**：VitePress 的产物在 `.vitepress/dist`。若改过 `outDir`，这里要同步改，否则上传的是空目录。
- **`fetch-depth: 0`**：本项目开了 `lastUpdated`（显示最后更新时间），它依赖完整 git 历史。默认浅克隆会让时间不准或构建告警。
- **pnpm 版本对齐**：`pnpm/action-setup` 的 `version` 要和本地大版本一致，否则可能因 lockfile 格式不同导致 `pnpm install` 失败。
:::

## 第三步：在 GitHub 仓库开启 Pages

代码推上去还不够，必须在仓库设置里把 Pages 的来源切到 Actions：

1. 打开仓库页面 → **Settings**（设置）。
2. 左侧菜单找到 **Pages**。
3. 在 **Build and deployment** → **Source** 下拉框中，选择 **GitHub Actions**。

::: warning 易错点
- 这一步**最常被忘记**。Source 如果还停留在默认的 "Deploy from a branch"，那 `deploy.yml` 跑完也不会生效，页面要么 404 要么显示旧内容。
- 选 **GitHub Actions** 而不是分支模式，才能让上面的工作流接管部署。
:::

## 第四步：推送代码触发部署

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

推送后：

1. 进入仓库的 **Actions** 标签页，能看到 "Deploy to GitHub Pages" 工作流正在运行。
2. 等 `build` 和 `deploy` 两个任务都变绿（✓）。
3. 点开 `deploy` 任务，能看到发布出来的 `page_url`，点击即可访问。

::: tip 验证
本地推送前，先跑一遍 `pnpm docs:build`。VitePress 的**死链检查**会让构建失败（exit code 1），本地先发现断链，比等线上 Actions 报错快得多。
:::

## 常见问题排查

| 现象 | 可能原因 | 解决办法 |
|------|---------|---------|
| 页面白屏 / 样式全丢 | `base` 路径不对 | 检查 `base` 是否为 `/仓库名/`，前后带斜杠 |
| 资源 404（CSS/JS 加载失败） | `base` 缺斜杠或与仓库名不符 | 同上 |
| Actions 报权限错误 | 缺少 `permissions` 配置 | 补上 `pages: write`、`id-token: write` |
| 推送后页面没变化 | Pages Source 没切到 Actions | Settings → Pages → Source 选 GitHub Actions |
| 上传产物为空 / 部署空白 | `path` 目录写错 | 确认为 `.vitepress/dist` |
| `pnpm install` 失败 | pnpm 版本与 lockfile 不匹配 | 对齐 `action-setup` 的 version |
| 最后更新时间不对 | 浅克隆，缺 git 历史 | `checkout` 加 `fetch-depth: 0` |

## 小结

按重要程度排序，最容易出错的三点：

1. **`base` 路径**必须是 `/仓库名/`（前后带斜杠）——白屏问题几乎都出在这。
2. **Pages Source 要切到 GitHub Actions**——忘记这步则工作流白跑。
3. **`permissions` 三件套**——少了 Pages 部署直接报权限错。

配好之后，以后只要 `git push origin main`，站点就会自动重新部署。
