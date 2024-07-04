# 布局构建


## 介绍

Admin 在完成页面渲染的期间，进行了很多的逻辑处理，那么如果要想二次开发 Admin，则必须了解 Admin 的构建流程，这样才能根据需求切入源码，进行二次开发。

## 布局路由

Admin 除了有路由的初始化构建流程，还有布局的构建流程，布局的构建流程是以静态路由开始。

布局路由是 Admin 的核心路由，它不需要进行权限管控，所以放在了静态路由里：

```typescript
export const constantRoutes: RouterConfigRaw[] = [
  {
    path: "/",
    name: "Layout",
    component: () => import("@/layout/index.vue"),
    redirect: HOME_URL,
    meta: { hideInMenu: true, hideInBread: true },
    children: [],
  },
]
```

constantRoutes 里的路由将随着 `main.ts` 初始化而初始化，优先级高于路由的 beforeEach，也就是布局构建的初始化快于路由构建的初始化，这也就是为什么路由构建的初始化里能看到权限路由都注册到布局路由的子路由。

## 布局组件

在上面的 [布局路由](#布局路由) 知道布局组件的入口组件是 `src/layout/index.vue`，所以这是入口组件，该文件内容：

```vue
<template>
  <component :is="LayoutComponents[layoutMode]" />
</template>

<script setup lang="ts" name="Layout">
import LayoutVertical from "./LayoutVertical/index.vue";
import LayoutClassic from "./LayoutClassic/index.vue";
import LayoutTransverse from "./LayoutTransverse/index.vue";
import LayoutColumns from "./LayoutColumns/index.vue";
import LayoutMixins from "./LayoutMixins/index.vue";
import LayoutSubsystem from "./LayoutSubsystem/index.vue";
import { useSettingsStore } from "@/stores/settings";
  
const LayoutComponents: { [key: string]: Component } = {
  vertical: LayoutVertical,
  classic: LayoutClassic,
  transverse: LayoutTransverse,
  columns: LayoutColumns,
  mixins: LayoutMixins,
  subsystem: LayoutSubsystem,
};
  
const settingsStore = useSettingsStore();
const layoutMode = computed(() => settingsStore.layoutMode);
```

可以看到，入口组件引用了 6 种布局，分别为

- 纵向布局：`src/layout/LayoutVertical` 
- 经典布局：`src/layout/LayoutClassic`
- 横向布局：`src/layout/LayoutTransverse`
- 分栏布局：`src/layout/LayoutColumns`
- 混合布局：`src/layout/LayoutMixins`
- 子系统布局：`src/layout/LayoutSubsystem`

通过 `component` 来动态切换对应的布局。

任意一个布局都有顶栏、侧边菜单栏、标签栏、内容区，位于 `src/layout` 下，分别位为 components 目录的 Header、Menu、TabsNav、MainContent 下。

所以进入任意一个布局都可以看到这些局部的布局组件。

如果你需要修改源码，自行去对应的布局组件修改即可。

下面是完整的布局组件目录

```markdown
├─ layout # 页面布局
│  ├─ components # 布局组件
│  │  ├─ CommonIcon # 通用图标
│  │  ├─ FrameLayout # IFrame 嵌入
│  │  ├─ Header # 头部
│  │  ├─ Loading # 项目加载 Loading 
│  │  ├─ MainContent # 内容区
│  │  ├─ Menu # 菜单
│  │  ├─ TabsNav # 标签页
│  │  └─ ThemeDrawer 框架设置
│  ├─ LayoutClassic # 经典布局
│  ├─ LayoutColumns # 分栏布局
│  ├─ LayoutMixins # 混入布局
│  ├─ LayoutSubsystem # 子系统布局
│  ├─ LayoutTransverse # 横向布局
│  └─ LayoutVertical # 纵向布局
```

