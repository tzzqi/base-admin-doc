#  布局



## 布局

Admin 的布局组件有顶栏、侧边菜单栏、标签栏、内容区，位于 `src/layout` 下，分别位为 components 目录的 Header、Menu、TabsNav、MainContent 下。

内容区（MainContent）根据路由进行组件的跳转，可视化页面的组件在 `src/views` 下。

布局支持 6 种形式动态切换，分别为

- 纵向布局：`src/layout/LayoutVertical` 
- 经典布局：`src/layout/LayoutClassic`
- 横向布局：`src/layout/LayoutTransverse`
- 分栏布局：`src/layout/LayoutColumns`
- 混合布局：`src/layout/LayoutMixins`
- 子系统布局：`src/layout/LayoutSubsystem`

所以使用了 `<compoment is=""></component>` 内置组件来动态切换，具体请看 `src/layout/index.vue` 内容。

> 默认布局

可在 `src/config/settins` 的 themeSettings 配置默认布局：

```typescript
const themeSettings: Partial<Settings> = {
  layoutMode: LayoutModeType.Vertical,
};
```

> 页面切换

在页面的右上角，点击「头像」，然后点击「我的设置」，即可看到五个布局的预览图，点击即可切换布局。

Admin 内置设置缓存功能，所以下次进来的布局会是切换后的布局。

## 标签栏

标签页支持两种形式，一种是保留了 [Vue2 Admin](https://vue2-admin.youngkbt.cn/) 的经典版，另一种是使用了 `Element Plus` 提供的 `el-tabs` 组件。

标签栏采用了 `components` 内置组件来动态切换，具体请看 `src/layout/components/TabsNav` 内容。

> 默认布局

可在 `src/config/settins` 的 themeSettings 配置默认标签栏：

```typescript
const themeSettings: Partial<Settings> = {
  tabsNavMode: TabsNavModeType.Classic,
};
```

> 页面切换

在页面的右上角，点击「头像」，然后点击「我的设置」，即可看到两个标签栏的预览图，点击即可切换标签栏。

Admin 内置设置缓存功能，所以下次进来的标签栏会是切换后的标签栏。

## 页面刷新

### 方法一

如果您想在执行完某些操作（增删改）之后刷新页面，Admin 已经通过 provide 往 views 目录下的组件注入一个函数，您只需要通过 inject 接收，然后调用即可。

相关代码：`layout/components/MainContent/index.vue`

```typescript
export type RefreshFunction = (value?: boolean) => boolean;

const refreshCurrentPage: RefreshFunction = (value?: boolean) => {
  // ...
};

provide("refresh", refreshCurrentPage);
```

使用的方式有两种：

> 传入参数

接收的是一个函数，如果您调用该函数时，可以传入参数，参数类型为 boolean 值

```typescript
import type { RefreshFunction } from "@/layout/components/MainContent/index.vue";

const refreshCurrentPage = inject("refresh") as RefreshFunction;
refreshCurrentPage(false);
nextTick(() => {
  refreshCurrentPage(true);
});
```

先传入 false，在 nextTick 生命周期再传入 true 来实现刷新

> 不传参数

您可以直接调用该函数，如果不传入参数，则函数内部自动实现刷新功能

```typescript
import type { RefreshFunction } from "@/layout/components/MainContent/index.vue";

const refreshCurrentPage = inject("refresh") as RefreshFunction;
refreshCurrentPage();
```

传入参数的方式适用于您想在刷新前做些事情，在您没有第二次传入 true 时，页面是不会刷新的。

### 方法二

Template 内置重定向组件 `redirect.vue`，位于 `/src/layout/redirect.vue` 下，并且该组件已经在 constantRoutes 进行加载注入，所以你只需要了解如何使用该组件跳转即可。

方法非常简单，利用编程式路由跳转：

```typescript
const router = useRouter();

router.push("/redirect/home");
// or
router.replace("/redirect/home");
```

这样将会跳转到 `/home` 的路由，因此您要了解的是，`/redirect` 是必须的前缀，后面携带的地址就是路由对应的 path。

所以实现页面刷新，只需要在重定向到自己的 path。

```typescript
const router = useRouter();
const route = useRoute();

router.push("/redirect" + route.path);
// or
router.replace("/redirect" + route.path);
```

具体是 `route.path` 还是 `route.fullPath`，根据你的需求来实现，最终都会刷新当前页面。

### 状态管理 Pinia

状态管理文件既有组件需要的数据、方法、也有用户信息、路由权限等的初始化方法，配合路由守卫进行初始化，位于 `src/store/modules` 下。

- `errorLog.ts`：错误日志 store
- `layout.ts`：布局信息 store
- `permission.ts`：路由权限 store
- `settings.ts`：项目客制化 store
- `user.ts`：用户信息 store

### 事件总栈

Vue3 已经把事件总栈去掉了，所以原生 Vue3 我们无法使用事件总栈来给不同组件传递事件。

Admin 使用了 mittBus 实现事件总栈。

注册一个事件到事件总栈：

```typescript
import mittBus from "@/utils/mittBus";

mittBus.on("openThemeDrawer", (value: boolean) => (drawerVisible.value = value));
```

事件总栈触发该事件：

```typescript
import mittBus from "@/utils/mittBus";

const openSettingsDrawer = () => {
  mittBus.emit("openThemeDrawer", true);
};
```

### 错误日志

Admin 内置错误日志，当项目抛出 Error 的时候，Admin 会将其捕获，然后放到日志组件里，您可以在页面的右上角看到一个「虫子」的图标，点击后会跳转到日志页面，查看错误的信息。

「虫子」的图标只有在出现抛出至少 1 个 Error 的时候才会出现，默认是不出现的，如果你想直接访问，则访问项目根路径 + `/error-log` 即可。

Admin 默认只在生产环境捕获错误并持久化，在本地环境和测试环境该功能是关闭的，如果你想在本地环境或者测试环境开启，又或者在生产环境关闭，则在 `src/config/settings.ts` 文件的 layoutSettings 里，对 `errorLog` 进行配置：

```typescript
const layoutSettings: Partial<Settings> = {
  errorLog: {
    showInHeader: true, // 错误日志是否在顶部出现图标，提供可点击进入的入口
    env: ["development", "test", "production"], // 错误日志触发的环境，这里依次对应 本地环境、测试环境、生产环境
  },
};
```

::: tip

`errorLog.env` 配置了错误日志功能触发的环境后，当 Admin 出现 Error 时，该功能将 Error 进行捕获并持久化，所以开发者在浏览器开发者工具的 console 控制台无法看到错误信息。

这是因为 Admin 在 Error 显示到 console 控制台之前进行捕获。

:::

错误日志功能的出现是为了让用户更直观的看到错误，从而快速截图，告知相关开发者解决问题。

如果不开启错误日志功能，则用户使用过程中出现的 Error，用户是不知道在哪里查看 Error 信息，而开发者只能根据用户提供的步骤进行复现，或者远程操控用户电脑看 console 控制台的错误，这是非常不方便的。

### 工具

Admin 常用的函数位于 `src/utils` 下，实现复用性，有数据深克隆、URL 参数值截取、展示 title 等功能函数。

Admin 继承了 Vue3 的核心思想：hooks 函数，位于 `src/hooks` 下。

## 进度条

Admin 使用 nprogress 依赖来实现页面加载过程的进度条显示进度，如果你不喜欢 Admin 默认的进度条，则可以在 `src/config/nprogress.ts` 文件里进行修改。

下面是 Admin 默认的 nprogress 配置内容：

```typescript
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  easing: "ease", // 动画方式
  speed: 500, // 递增进度条的速度
  showSpinner: true, // 是否显示加载 ico
  trickleSpeed: 200, // 自动递增间隔
  minimum: 0.3, // 初始化时的最小百分比
});

export default NProgress;
```

## 版本号缓存

Admin 内置一些布局的缓存功能：

```typescript
interface Settings {
  settingCacheKey: string; // 缓存配置的 key，缓存项目的配置
  layoutCacheKey: string; // 缓存布局的 key，缓存项目的布局
  tabsNavCacheKey: string; // 缓存标签页的 key，缓存标签页内容
  versionCacheKey: string; // 缓存版本号的 key，缓存版本号
}
```

这些缓存会存在 `localstorage` 里，因此缓存是否被清除取决于用户的操作。

Admin 经历过很多这些缓存导致问题的场景，比如 Admin 发布了一个新版，修改了内容是配置、项目，但是因为用户的浏览器已经缓存了这些旧版内容，而新版用旧版的缓存导致出现了很多问题，因此 Admin 内置版本号缓存功能。

版本号缓存功能：当你发布一个版本的时候，Admin 首先会清除上一个版本（如果存在）的缓存，然后再缓存这个版本相关的配置、布局、标签页内容。

那么如何让 Admin 知道你更新了一个新版呢？

这是版本号缓存功能的原理：读取 `package.json` 的 `version`：

```json {2}
{
  "name": "kbt-vue3-admin",
  "version": "0.0.1",
  "private": true,
  "scripts": {},
  "dependencies": {}
}
```

根据上面的 version，Admin 会缓存 0.0.1 版本的配置、布局、标签页内容，当你将 version 变成 0.0.1，则 Admin 将 0.0.1 的缓存清除，然后再缓存 0.0.2 的配置、布局、标签页内容。

因此你只需要修改 version 即可重新触发版本号缓存功能。
