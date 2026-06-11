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
    // 顶部导航栏 —— 这就是四个 tab，点击切换分区
    nav: [
      { text: '基础', link: '/basic/', activeMatch: '/basic/' },
      { text: '进阶', link: '/advanced/', activeMatch: '/advanced/' },
      { text: '数据库', link: '/database/', activeMatch: '/database/' },
      { text: 'Web 框架', link: '/web/', activeMatch: '/web/' },
      { text: '部署', link: '/deployment/', activeMatch: '/deployment/' },
    ],

    // 每个 tab 对应一套侧边栏。后续加文章时，在对应分区的 items 里加一行即可。
    sidebar: {
      '/basic/': [
        {
          text: '基础',
          items: [
            { text: '简介', link: '/basic/' },
            // 示例：新增一篇笔记
            // { text: '变量与数据类型', link: '/basic/variables' },
          ],
        },
      ],
      '/advanced/': [
        {
          text: '进阶',
          items: [
            { text: '简介', link: '/advanced/' },
          ],
        },
      ],
      '/database/': [
        {
          text: '数据库',
          items: [
            { text: '简介', link: '/database/' },
          ],
        },
      ],
      '/web/': [
        {
          text: 'Web 框架',
          items: [
            { text: '简介', link: '/web/' },
          ],
        },
      ],
      '/deployment/': [
        {
          text: '部署',
          items: [
            { text: '简介', link: '/deployment/' },
            { text: 'GitHub 项目部署', link: '/deployment/github-pages' },
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
