
import { defineConfig } from 'vitepress'
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar'

const indexList = [{
  first: 'advanced',
  list: ["basic", "advanced"],
},{
  first: 'guide-build.md',
  list: ["guide-introduce.md",
    "guide-quick-start.md",
    "guide-directory.md",
    "guide-configuration.md",
    "guide-layout.md",
    "guide-route.md",
    "guide-request.md",
    "guide-build.md",
    "guide-directives.md",
    "guide-icon.md"],
},{
  first: 'advanced-auth.md',
  list: ["advanced-i18n.md",
    "advanced-theme.md",
    "advanced-auth.md",
    "advanced-typescript.md",
    "advanced-pre-build.md",
    "advanced-vite-config.md"],
}]

function getSortList(array1, array2 ){
  // 创建一个映射，用于快速查找元素在array2中的索引
  let map = new Map(array2.map((item, index) => [item, index]));

// 自定义排序函数
  array1.sort((a, b) => {
    // 如果两个元素都在array2中，则按照array2的顺序排序
    if (map.has(a) && map.has(b)) {
      return map.get(a) - map.get(b);
    }
    // 如果只有a在array2中，则a排在前面
    if (map.has(a)) {
      return -1;
    }
    // 如果只有b在array2中，则b排在前面
    if (map.has(b)) {
      return 1;
    }
    // 如果两个元素都不在array2中，则保持原始顺序（这里使用stable sort的特性，如果JavaScript的sort不保证stable，则可能需要其他方法）
    return 0;
  });
  return array1;
}

// @ts-ignore
export default defineConfig({
  title: "Base Admin",
  description: "基于 Vue3.2、TypeScript、Vite4、Pinia、Element-Plus",
  base: '/base-admin-doc/',
  vite: {
    plugins: [
      AutoSidebar({
        path: 'doc',
        ignoreIndexItem: true,
        titleFromFile: true,
        beforeCreateSideBarItems: (data: string[]) => {
          if(data.length > 0) {
            let findItem = indexList.find((item)=>{
              return item.first === data[0]
            })
            if(typeof findItem !== 'undefined'){
              return getSortList(data,findItem.list)
            }else {
              return data;
            }
          }else {
            return data;
          }
        }
      })
    ]
  },
  themeConfig: {
    nav: [
      { text: '指南', link: '/guild' },
      { text: '构建', link: '/structure' }
    ],
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
            },
          },
        },
      },
    },
    footer: {
      message: '基于 MIT 许可发布',
      copyright: `版权所有 © 2019-${new Date().getFullYear()} 尤雨溪`
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },
    lastUpdated: {
      text: '最后更新于',
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  }
})



