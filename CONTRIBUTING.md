# 贡献指南

感谢你对本项目的关注！欢迎提交问题、建议或贡献内容。

## 如何贡献

### 报告问题

- 在 [Issues](https://github.com/qiaojianhui99-beep/py-notes/issues) 页面提交问题
- 清楚描述问题：标题简洁，正文详细
- 如果是内容错误，请指明具体位置

### 建议新内容

- 在 Issues 中提出你希望看到的主题
- 说明该主题的重要性和适合的分区

### 提交 Pull Request

1. Fork 本仓库
2. 创建新分支：`git checkout -b feature/your-topic`
3. 添加或修改内容（遵循下方的内容规范）
4. 提交更改：`git commit -m "Add: 你的主题"`
5. 推送到你的仓库：`git push origin feature/your-topic`
6. 创建 Pull Request

## 内容规范

### 文件组织

- 根据内容类型放入对应目录：`basic/`、`advanced/`、`database/`、`web/`、`deployment/`
- 文件名使用小写字母和连字符：`variable-types.md`
- 在 `.vitepress/config.mts` 的对应 `sidebar` 中注册新文章

### 写作风格

- 使用清晰的标题层级（`#`、`##`、`###`）
- 代码示例以 Python 3.10+ 为准，标注新旧语法差异
- 使用代码块并标明语言：` ```python `
- 适当使用 VitePress 的提示容器（`::: tip`、`::: warning`）

### 示例

```markdown
# 列表推导式

列表推导式是 Python 中创建列表的简洁方式。

## 基本语法

\`\`\`python
# 传统方式
squares = []
for x in range(10):
    squares.append(x**2)

# 列表推导式
squares = [x**2 for x in range(10)]
\`\`\`

::: tip
列表推导式通常比传统循环更快、更易读。
:::
```

## 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm docs:dev

# 构建
pnpm docs:build
```

## 行为准则

- 尊重他人，友善交流
- 专注于内容质量，避免无关讨论
- 不提交抄袭或版权受限的内容

## 许可

贡献的内容将采用 [MIT License](https://github.com/qiaojianhui99-beep/py-notes/blob/main/LICENSE) 授权。
