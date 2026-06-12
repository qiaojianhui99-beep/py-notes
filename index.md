---
layout: home

hero:
  name: Python 笔记
  text: 从入门到实战的系统化学习
  tagline: 涵盖基础语法、进阶主题、数据库操作、Web 开发与项目部署 —— 循序渐进掌握 Python，边学边记，构建完整的知识体系。
  image:
    src: /python.svg
    alt: Python
  actions:
    - theme: brand
      text: 开始学习
      link: /basic/
    - theme: alt
      text: 进阶主题
      link: /advanced/

features:
  - icon: 🐍
    title: 基础语法
    details: 变量类型、控制流、循环、函数、模块、文件操作与面向对象，打牢 Python 编程基础。
    link: /basic/
    linkText: 进入学习
  - icon: 🚀
    title: 进阶主题
    details: 装饰器、生成器、上下文管理器、元类、并发编程、异步 IO 与性能优化。
    link: /advanced/
    linkText: 进入学习
  - icon: 🗄️
    title: 数据库操作
    details: SQLite、MySQL、PostgreSQL、Redis、MongoDB 与 SQLAlchemy ORM 实战。
    link: /database/
    linkText: 进入学习
  - icon: 🌐
    title: Web 框架
    details: Flask、Django、FastAPI 等主流 Web 框架的开发实践与最佳实践。
    link: /web/
    linkText: 进入学习
  - icon: 🚢
    title: 项目部署
    details: GitHub Pages、服务器部署、Docker 容器化与 CI/CD 自动化流程。
    link: /deployment/
    linkText: 进入学习
---

## 🧭 如何使用这份笔记

- **顺序学习**：从「基础语法」开始，按章节逐步推进，循序渐进掌握 Python 核心知识。
- **按需查阅**：通过顶部导航栏或侧边栏快速定位，也可使用搜索功能精准查找。
- **动手实践**：每个章节配有示例代码，建议边学边练，将理论转化为实际能力。

## 🛠️ 本地运行

```bash
pnpm install   # 安装依赖
pnpm dev       # 启动本地预览
pnpm build     # 构建静态站点
```
