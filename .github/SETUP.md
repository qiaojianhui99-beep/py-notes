# GitHub 仓库设置指南

按照以下步骤完善 GitHub 仓库的右侧信息栏。

## 1. 设置仓库描述和网站

访问仓库页面，点击右上角的 **⚙️ Settings**，然后：

### Description（描述）
```
📚 完整的 Python 学习笔记 | 基于 VitePress 构建，涵盖基础、进阶、数据库、Web 框架、部署五大模块 | Complete Python Learning Notes
```

### Website（网站）
```
https://qiaojianhui99-beep.github.io/py-notes/
```

勾选 "Use your GitHub Pages website"

## 2. 添加 Topics（标签）

在仓库首页的 **About** 部分，点击 **⚙️ 图标** 添加以下 topics：

```
python
vitepress
documentation
learning-notes
tutorial
python3
educational
chinese
markdown
static-site
```

## 3. 完善其他信息

### 启用 Discussions（可选）
Settings → General → Features → 勾选 **Discussions**

### 设置 Issues 模板（可选）
Settings → Features → Issues → Set up templates

### 社交预览图（可选）
Settings → General → Social preview → Upload image (建议尺寸：1280x640px)

## 4. 提交新增文件

```bash
git add LICENSE CONTRIBUTING.md
git commit -m "docs: Add LICENSE and CONTRIBUTING guide"
git push origin main
```

## 完成后的效果

右侧信息栏将显示：

- ✅ **About**: 项目描述和网站链接
- ✅ **Topics**: 10 个相关标签
- ✅ **Readme**: 带徽章的完整 README
- ✅ **License**: MIT License
- ✅ **Contributing**: 贡献指南
- ✅ **Releases**: 可在稳定版本时创建 release
- ✅ **Packages**: N/A（本项目无需）
- ✅ **Deployments**: GitHub Pages 部署状态
- ✅ **Languages**: 自动统计（TypeScript + Markdown）
