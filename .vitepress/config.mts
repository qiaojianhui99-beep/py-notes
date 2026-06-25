import { defineConfig } from 'vitepress'

// VitePress 配置文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/py-notes/',
  lang: 'zh-CN',
  title: 'Python 笔记',
  description: 'Python 学习笔记：基础、进阶、数据库、Web 框架',
  cleanUrls: true,
  lastUpdated: true,

  // README.md / AGENTS.md 仅作仓库文档，不作为站点页面构建
  srcExclude: ['**/README.md', '**/AGENTS.md'],

  themeConfig: {
    logo: '/python.svg',

    // 顶部导航栏 —— 这就是四个 tab，点击切换分区
    nav: [
      { text: '首页', link: '/' },
      { text: '基础', link: '/basic/', activeMatch: '/basic/' },
      { text: '进阶', link: '/advanced/', activeMatch: '/advanced/' },
      { text: '数据库', link: '/database/', activeMatch: '/database/' },
      { text: 'Web 框架', link: '/web/', activeMatch: '/web/' },
      { text: '部署', link: '/deployment/', activeMatch: '/deployment/' },
      { text: '数据科学', link: '/data-science/', activeMatch: '/data-science/' },
      { text: '爬虫', link: '/scraping/', activeMatch: '/scraping/' },
    ],

    // 每个 tab 对应一套侧边栏。后续加文章时，在对应分区的 items 里加一行即可。
    sidebar: {
      '/basic/': [
        {
          text: '基础语法',
          collapsed: false,
          items: [
            { text: '简介', link: '/basic/' },
            { text: 'Python 简介与环境搭建', link: '/basic/01-intro' },
            { text: '基本语法', link: '/basic/02-syntax-basics' },
            { text: '变量与数据类型', link: '/basic/03-variables-types' },
            { text: '运算符', link: '/basic/04-operators' },
            { text: '输入输出', link: '/basic/05-input-output' },
            { text: '控制流', link: '/basic/06-control-flow' },
            { text: '循环', link: '/basic/07-loops' },
            { text: '字符串操作', link: '/basic/08-string' },
            { text: '列表', link: '/basic/09-list' },
            { text: '元组', link: '/basic/10-tuple' },
            { text: '字典', link: '/basic/11-dict' },
            { text: '集合', link: '/basic/12-set' },
            { text: '函数定义与调用', link: '/basic/13-function' },
            { text: '函数进阶', link: '/basic/14-function-advanced' },
            { text: '模块与包', link: '/basic/15-module-import' },
            { text: '文件操作', link: '/basic/16-file-io' },
            { text: '异常处理', link: '/basic/17-exception' },
            { text: '面向对象基础', link: '/basic/18-oop-basics' },
            { text: '面向对象进阶', link: '/basic/19-oop-advanced' },
            { text: '常用标准库', link: '/basic/20-stdlib' },
            { text: '版本差异对照', link: '/basic/21-version-differences' },
            { text: '包管理与虚拟环境', link: '/basic/22-pip-virtualenv' },
            { text: '调试技巧', link: '/basic/23-debugging' },
            { text: '路径操作（pathlib）', link: '/basic/24-pathlib' },
            { text: '常用内置函数与遍历技巧', link: '/basic/25-builtins-iteration' },
          ],
        },
      ],
      '/advanced/': [
        {
          text: '进阶主题',
          collapsed: false,
          items: [
            { text: '简介', link: '/advanced/' },
            { text: '垃圾回收机制', link: '/advanced/01-garbage-collection' },
            { text: '装饰器进阶', link: '/advanced/02-decorator-advanced' },
            { text: '生成器与迭代器', link: '/advanced/03-generator-iterator' },
            { text: '上下文管理器', link: '/advanced/04-context-manager' },
            { text: '元类', link: '/advanced/05-metaclass' },
            { text: '描述符', link: '/advanced/06-descriptor' },
            { text: '多线程编程', link: '/advanced/07-multithreading' },
            { text: '多进程编程', link: '/advanced/08-multiprocessing' },
            { text: '异步编程基础', link: '/advanced/09-asyncio-basics' },
            { text: '异步编程进阶', link: '/advanced/10-asyncio-advanced' },
            { text: '文件操作进阶', link: '/advanced/11-file-advanced' },
            { text: '正则表达式', link: '/advanced/12-regular-expression' },
            { text: '单元测试', link: '/advanced/13-testing' },
            { text: '日志系统', link: '/advanced/14-logging' },
            { text: '性能优化', link: '/advanced/15-performance' },
            { text: 'Dataclass', link: '/advanced/16-dataclass' },
            { text: '类型注解进阶', link: '/advanced/17-typing-advanced' },
            { text: 'Concurrent.futures', link: '/advanced/18-concurrent-futures' },
            { text: '单元测试进阶', link: '/advanced/19-testing-advanced' },
          ],
        },
      ],
      '/database/': [
        {
          text: '数据库操作',
          collapsed: false,
          items: [
            { text: '简介', link: '/database/' },
            { text: 'SQLite 基础', link: '/database/01-sqlite' },
            { text: 'MySQL 基础', link: '/database/02-mysql-basics' },
            { text: 'MySQL 进阶', link: '/database/03-mysql-advanced' },
            { text: 'SQLAlchemy ORM', link: '/database/04-sqlalchemy' },
            { text: 'Redis 缓存', link: '/database/05-redis' },
            { text: 'MongoDB 文档数据库', link: '/database/06-mongodb' },
            { text: 'PostgreSQL', link: '/database/07-postgresql' },
            { text: '最佳实践', link: '/database/08-best-practices' },
            { text: '实战项目', link: '/database/09-project' },
            { text: '常见问题', link: '/database/10-faq' },
            { text: 'Alembic 数据库迁移', link: '/database/11-alembic' },
          ],
        },
      ],
      '/web/': [
        {
          text: 'Web 框架',
          collapsed: false,
          items: [
            { text: '简介', link: '/web/' },
            { text: 'HTTP 基础', link: '/web/01-http-basics' },
            { text: 'Flask 入门', link: '/web/02-flask-basics' },
            { text: 'Flask 进阶', link: '/web/03-flask-advanced' },
            { text: 'FastAPI 入门', link: '/web/04-fastapi-basics' },
            { text: 'Django 入门', link: '/web/05-django-basics' },
            { text: 'Django 进阶', link: '/web/06-django-advanced' },
            { text: 'RESTful API 设计', link: '/web/07-restful-api' },
            { text: 'WebSocket 实时通信', link: '/web/08-websocket' },
            { text: '微服务架构', link: '/web/09-microservices' },
            { text: 'Web 认证与授权', link: '/web/10-authentication' },
          ],
        },
      ],
      '/deployment/': [
        {
          text: '项目部署',
          collapsed: false,
          items: [
            { text: '简介', link: '/deployment/' },
            { text: 'Nginx 基础配置', link: '/deployment/01-nginx-basics' },
            { text: 'GitHub Pages 部署', link: '/deployment/github-pages' },
            { text: 'Linux 服务器部署', link: '/deployment/02-linux-server' },
            { text: 'Docker 容器化', link: '/deployment/03-docker' },
            { text: 'CI/CD 自动化', link: '/deployment/04-cicd' },
            { text: '监控与日志', link: '/deployment/05-monitoring' },
            { text: 'Nginx 高级配置', link: '/deployment/06-nginx-advanced' },
            { text: 'Kubernetes 入门', link: '/deployment/07-kubernetes' },
            { text: '域名与 SSL 配置', link: '/deployment/08-domain-ssl' },
          ],
        },
      ],
      '/data-science/': [
        {
          text: '数据科学',
          collapsed: false,
          items: [
            { text: '简介', link: '/data-science/' },
            { text: 'NumPy 与 Pandas 基础', link: '/data-science/01-numpy-pandas' },
            { text: 'Matplotlib 可视化', link: '/data-science/02-matplotlib' },
            { text: 'Seaborn 高级可视化', link: '/data-science/03-seaborn' },
            { text: '数据清洗与预处理', link: '/data-science/04-data-cleaning' },
            { text: '数据分析实战案例', link: '/data-science/05-case-study' },
          ],
        },
      ],
      '/scraping/': [
        {
          text: '爬虫开发',
          collapsed: false,
          items: [
            { text: '简介', link: '/scraping/' },
            { text: 'Python 爬虫开发', link: '/scraping/01-web-scraping' },
            { text: 'Scrapy 框架', link: '/scraping/02-scrapy' },
            { text: 'Selenium 动态网页', link: '/scraping/03-selenium' },
            { text: '反爬虫策略与应对', link: '/scraping/04-anti-scraping' },
            { text: '异步爬虫', link: '/scraping/05-async-scraping' },
          ],
        },
      ],
    },

    // 本地搜索（无需第三方服务）
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '清除查询条件',
                noResultsText: '无法找到相关结果',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },

    // 界面文案中文化
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一页', next: '下一页' },
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    lastUpdated: { text: '最后更新于' },
  },
})
