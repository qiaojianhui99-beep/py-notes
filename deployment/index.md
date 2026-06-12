# 项目部署

Python 项目部署与运维笔记，从静态站点到生产环境的完整部署方案。

## 学习路线

```
GitHub Pages → Linux 服务器 → Docker 容器化 → CI/CD 自动化 → 监控与日志
```

## 章节概览

### 静态站点部署

- **[GitHub Pages 部署](github-pages.md)** - 零成本托管文档站点，GitHub Actions 自动化部署

### 服务器部署

- **Linux 服务器部署** - 购买云服务器、SSH 连接、环境配置
- **WSGI 服务器** - Gunicorn、uWSGI 配置与优化
- **Nginx 反向代理** - 负载均衡、静态文件服务、SSL 证书
- **域名与 DNS** - 域名购买、DNS 解析、HTTPS 配置

### 容器化部署

- **Docker 基础** - 镜像构建、容器运行、数据卷管理
- **Docker Compose** - 多容器编排、环境变量管理
- **容器优化** - 镜像瘦身、多阶段构建、安全最佳实践

### 自动化部署

- **GitHub Actions** - CI/CD 工作流、自动测试与部署
- **GitLab CI/CD** - 私有化 CI/CD 方案
- **部署策略** - 蓝绿部署、滚动更新、金丝雀发布

### 运维监控

- **日志管理** - 日志收集、分析、告警
- **性能监控** - CPU/内存监控、APM 工具
- **备份策略** - 数据库备份、文件备份、灾难恢复

## 部署方案选型

| 项目类型 | 推荐方案 |
|---------|---------|
| 文档站点 | GitHub Pages + Actions |
| 小型应用 | 云服务器 + Nginx + Gunicorn |
| 中大型项目 | Docker + Kubernetes |
| 微服务架构 | Docker Compose / K8s |
| 个人项目 | Vercel / Railway / Render |

::: tip 学习建议
1. 从 GitHub Pages 开始，理解自动化部署流程
2. 掌握 Linux 基础命令和服务器操作
3. 学习 Docker，理解容器化优势
4. 实践 CI/CD，实现代码提交自动部署
:::

## 前置知识

- ✅ 基础 Linux 命令
- ✅ Git 版本控制
- ✅ 了解 HTTP 协议
- ✅ 基础网络知识（IP、端口、DNS）
