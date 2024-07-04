# 路由构建

## 介绍

Admin 在完成页面渲染的期间，进行了很多的逻辑处理，那么如果要想二次开发 Admin，则必须了解 Admin 的构建流程，这样才能根据需求切入源码，进行二次开发。



## 入口文件

Admin 的入口和所有的 Vue 项目一样，都是 `main.ts` 文件，这个文件引用并注册了全局的依赖：

- Pinia
- Element Plus
- router
- directives
- i18n
- svg icon
- error handler
- Auth
- Role
- App.vue

这些都是 Admin 的全局依赖，也是 Admin 运行的基础环境。

## 路由

在入口文件初始化后，就开启了路由功能，因此就会先走路由的前置拦截器 beforeEach，在 `src/router/index.ts` 里。

在 beforeEach 中，先引入了部分变量

```typescript
// 用户相关信息
const userStore = useUserStore();
// 权限相关信息
const permissionStore = usePermissionStore();
// 初始化动态路由函数
const { initDynamicRouters } = useRoutes();
// 认证 token
const token = userStore.token;
```

然后开启了 NProgress 进度条

```typescript
NProgress.start();
```

接下来进行一系列的链接、白名单、token 判断：

```typescript
// 判断是访问登陆页，有 Token 就在当前页面，没有 Token 重置路由并放行到登陆页
if (to.path === "/login") {
  if (token) return next(from.fullPath);
  resetRouter();
  return next();
}

// 判断访问页面是否在路由白名单地址中，如果存在直接放行
if (whiteList.includes("*")) {
  if (!permissionStore.loadedRouteList.length) {
    // 初始化路由流程函数
    await initDynamicRouters(["*"]);
    // 初始化结束后才放行
    return next({ ...to, replace: true });
  }
  return next();
} else if (whiteList.includes("next") || whiteList.includes(to.path)) return next();

// 判断是否有 Token，没有重定向到 login
  if (!token) return next({ path: "/login", replace: true });
```

如果都通过了判断，代表权限已经满足访问条件，那么此时面临两个选择：

- 如果路由已经初始化，即已经进入了页面，因为此时是切换路由，则直接放行
- 如果路由没有初始化，则需要初始化路由，因此下面的流程都是进入 [初始化路由流程](#初始化路由流程) 里进行分析

```typescript {5}
// 判断是否存在角色或加载过路由，如果不存在，则加载路由
if (!permissionStore.loadedRouteList.length) {
  try {
    // 初始化路由流程函数
    await initDynamicRouters();
    // 初始化结束后才放行
    return next({ ...to, replace: true });
  } catch (error) {
    // 出现异常，则重置 token，并跳转登录页面
    userStore.resetToken();
    router.replace(LOGIN_URL);
    return Promise.reject(error);
  }
}
// 已经加载过路由，则直接放行
next();
```

最后在 `afterEach` 关闭进度条：

```typescript
NProgress.done();
```

如果出现异常，则捕获并关闭进度条：

```typescript
/**
 * @description 路由跳转错误
 **/
router.onError(error => {
  NProgress.done();
  console.warn("路由错误", error.message);
});
```

## 初始化路由流程

初始化路由流程是 `src/router/index.ts` 的 `router.beforeEach` 里触发 `initDynamicRouters` 函数，因此走进 `initDynamicRouters` 函数，位于 `src/hooks/useRoutes.ts` 文件下，这个文件是路由初始化、操作的核心 hooks 文件，里面包含项目路由操作的各个封装函数。

### initDynamicRouters

`initDynamicRouters` 函数主要是对路由进行初始化的入口，接收两个参数：

- 第一个是角色，用来筛选角色路由
- 第二个参数是 api，如果传了 api，则调用 api 去后台获取动态路由

第一次进来该函数将面临两个选择：

- 如果缓存功能开启，则去 localstorage 里获取缓存的路由，如果存在则直接初始化
- 如果缓存不存在或者缓存功能不开启，则取后台 / 静态文件获取路由，然后再根据是否开启缓存功能进行缓存，最终初始化获取的路由

```typescript
const initDynamicRouters = async (roles?: string[], api?: () => Promise<BackstageMenuList[]>) => {
  const { cacheDynamicRoutes, cacheDynamicRoutesKey } = settings;
  let routeList: RouterConfigRaw[] = [];
  let isCacheDynamicRoutes = false;
  // 先从缓存拿后台路由
  let cacheRoutes = localStorage.getItem(cacheDynamicRoutesKey);
  // 如果不开启缓存，但缓存路由存在，则清掉缓存里的路由和拿到的缓存路由
  if (!cacheDynamicRoutes && cacheRoutes) {
    localStorage.removeItem(cacheDynamicRoutesKey);
    cacheRoutes = "";
  }
  if (cacheRoutes) {
    routeList = JSON.parse(cacheRoutes);
    isCacheDynamicRoutes = true;
  } else if (api) routeList = getDynamicRouters(await api());
  else routeList = rolesRoutes;
  // else routeList = getDynamicRouters(await getMenuList()); // 请求后台拿到菜单，并处理成路由

  // 缓存后台路由
  if (cacheDynamicRoutes && !isCacheDynamicRoutes) {
    localStorage.setItem(cacheDynamicRoutesKey, JSON.stringify(routeList));
  }

  if (!routeList.length) {
    ElNotification({
      title: "无权限访问",
      message: "当前账号无任何菜单权限，请联系系统管理员！",
      type: "warning",
      duration: 3000,
    });
    userStore.resetToken();
    router.replace(LOGIN_URL);
    return Promise.reject("No permission");
  }

  if (!roles || !roles.length) roles = await userStore.getUserInfo();
  loadDynamicRouters(routeList, roles || settings.whiteList);
};
```

至于是去后台还是静态文件获取路由，则取决于自己的业务，可以二选一，也可以都选，最终 Admin 只接收一个 router 数组，都选的话则需要需要组装成一个数组。

如果是后台获取路由，如果后台返回的路由规则和官方需要的不一致，则 Admin 提供了 `getDynamicRouters` 函数进行转换。

#### getDynamicRouters

getDynamicRouters 函数处理后台返回的路由，当然如果你后台返回的路由规则和官方需要的一致，则无需该函数进行转换。

假设后台返回的路由形式是：

```json
[
  {
    menuUrl: "/components",
    menuCode: "Components",
    menuName: "组件",
    parentMenuCode: "", // 代表一级菜单
    imageIcon: "Opportunity",
    sel: 1
  },
  {
    menuUrl: "message",
    menuCode: "MessageDemo",
    pagePath: "/components/message/index",
    menuName: "消息组件",
    parentMenuCode: "Components", // 和上面的 menuCode 关联
    imageIcon: "StarFilled",
    sel: 2
  },
]
```

则我们需要转换成：

```json
{
  path: "/components",
  name: "Components",
  meta: { title: "组件", icon: "Opportunity", rank: 1 },
  children: [
    {
      path: "message",
      name: "MessageDemo",
      component: "/components/message/index",
      meta: { title: "消息组件", icon: "StarFilled", rank: 2 },
    },
  ]
}
```

那么 getDynamicRouters 函数的内容是：

```typescript
const getDynamicRouters = (routerList: BackstageMenuList[], menuCode = "") => {
  const dynamicRouterList: RouterConfigRaw[] = [];
  routerList.forEach(item => {
    if (item.parentMenuCode === menuCode) {
      const children = getDynamicRouters(
        routerList.filter(v => v.menuCode !== menuCode),
        item.menuCode
      );
      const menu = {
        path: item.menuUrl,
        name: item.menuName,
        component: item.pagePath,
        meta: {
          title: item.menuName,
          icon: item.imageIcon,
          rank: item.seq,
        },
      };
      if (children.length) dynamicRouterList.push({ ...menu, children });
      else dynamicRouterList.push({ ...menu });
    }
  });
  return dynamicRouterList;
};
```

后台返回的路由规则 Admin 无法统一，所以 getDynamicRouters 提供转换方式也需要根据自己的场景进行修改。

### loadDynamicRouters

在 `initDynamicRouters` 函数里，我们进行了缓存功能的操作、路由的获取，那么最终调用 `loadDynamicRouters` 方法，将获取到的路由和角色权限传进去。

```typescript
loadDynamicRouters(routeList, roles || settings.whiteList);
```

`loadDynamicRouters` 函数将执行动态加载路由，但是在执行动态加载路由的前面，会执行四个函数来进行路由的处理，最后将处理后的路由进行动态加载：

```typescript
const loadDynamicRouters = (routers: RouterConfigRaw[], roles: string[], r = router) => {
  // 权限路由筛选
  const onlyRolesRoutes = filterOnlyRolesRoutes(routers, roles);
  // 路由元数据处理
  const resolveRouters = processDynamicRoutes(processRouteMeta(onlyRolesRoutes));
  // 传到 permissionStore 持久化，并拿到扁平化的路由数组（所有二级以上的路由拍成一级，keep-alive 只支持到二级缓存（Layout 默认是一级，加起来就是二级））
  const flatRouteList = permissionStore.loadPermissionRoutes(resolveRouters);
  // ...
};
```

因此这四个函数是：

- filterOnlyRolesRoutes：根据传来的 roles 对路由进行角色路由筛选，筛选出只有该 roles 才能看到的路由
- processRouteMeta：对路由的配置项进行处理，专门处理 meta 的配置项
- processDynamicRoutes：对路由的元数据进行处理，如 redirect、name，如果开发者没有填写这些配置，则自动按照 Admin 规则生成
- loadPermissionRoutes：将处理后的动态路由持久化到 Pinia，并返回一个扁平化的路由

::: tip

什么是扁平化路由，就是将所有二级以上的路由拍成一级路由。

:::

最后将扁平化的路由进行动态加载：

```typescript
// ...
flatRouteList.forEach(flatRoute => {
  const item = { ...flatRoute }; // 解除响应式
  item.children ? (item.children = []) : ""; // 防止加载 children 而不加载提取出来变成的一级路由
  item.path = (item.meta._fullPath as string) || item.path; // 加载动态路由时，子路由的 path 可能不带 /，这样会依赖父路由来拼接（vue-route 规则），但是 template 实现多级路由缓存，所以都拍成二级路由，则 path 加载时要求是完整的，不再放到父路由的 children 里
  if (!item.name || !r.hasRoute(item.name)) {
    if (item.meta?.isFull) r.addRoute(item as RouteRecordRaw);
    else r.addRoute("Layout", item as RouteRecordRaw);
  }
});
// 最后添加 notFoundRouter
router.addRoute(notFoundRouter);
```

动态加载路由有两个选择：

- 如果路由已经存在则不加载
- 如果路由不存在：
  - 如果路由配置了全屏 `isFull`，则将路由作为一级路由进行注册
  - 如果路由没有配置全屏 `isFull`，则将路由动态加载 Layout 路由下，也就是 Layout 是一级路由，扁平化的路由是二级路由、三级路由

Layout 路由是布局路由，如顶部、标签栏、左侧菜单栏等都是布局内容，二级路由则在 MainContent 内容区里。

最后添加错误路由，这是 404 路由。

#### filterOnlyRolesRoutes

onlyRolesRoutes 函数是来过滤出当前系统角色的路由权限，因此需要接收两个参数，第一个参数是路由表，第二个参数是 roles 角色。

过滤出权限路由，取决于路由表的 `meta.roles` 配置，如果配置了 `meta.roles`，则与第二个参数 roles 比对，如果存在则通过，反之则去掉。如果没有配置 `meta.roles`，则默认通过。

因为路由表存在多级路由，所以采用递归形式遍历每个路由。

```typescript
const filterOnlyRolesRoutes = (routers: RouterConfigRaw[], roles: string[]) => {
  const rolesRoutes: RouterConfigRaw[] = [];
  routers.forEach(router => {
    const r = { ...router };
    if (hasPermission(r, roles)) {
      if (r.children && r.children.length) r.children = filterOnlyRolesRoutes(r.children, roles);
      rolesRoutes.push(r);
    }
  });
  return rolesRoutes;
};
/**
   * @description 该系统角色是否有权限访问当前路由
   * roles 带有 * 的代表所有路由都能访问
   */
const hasPermission = (router: RouterConfigRaw, roles: string[]) => {
  if (roles.includes("*")) return true;
  if (router.meta && router.meta.roles) return roles.some(role => router.meta && router.meta?.roles?.includes(role));
  else return true; // 没有添加权限验证
};
```

最终返回 `meta.roles` 存在第二个参数 roles 的路由或者没有配置 `meta.roles` 的路由。

如：

```typescript {7}
const permissionRoutes = {
  path: "/role",
  component: () => import("@/views/permission/rolePermission.vue"),
  name: "RolePermission",
  meta: {
    title: "权限编辑",
    roles: ["admin"],
    icon: "StarFilled",
  },
},
```

当第二个参数 roles 也有 admin 的时候，则该路由允许加载到 Admin 里。

#### processRouteMeta

processRouteMeta 函数处理路由的 meta：拼接每个路由的完整路径 fullPath，处理国际化 title 显示，判断是否使用国际化等等，总之该函数是处理 meta 的配置项，这些配置项是 Admin 项目需要，并非官方的配置。

```typescript
const processRouteMeta = (routers: RouterConfigRaw[], basePath = "/") => {
  routers.forEach(router => {
    const fullPath = router.path.startsWith("/") ? router.path : (basePath + "/" + router.path).replace(/\/+/g, "/");
    // 处理成后面布局要用到的 title。title 如果为函数，则涉及到当前路由，所以这里无法处理
    if (router.meta) {
      const { useI18n, isKeepAlive, isFull, useTooltip } = router.meta;
      const { routeUseI18n, isKeepAlive: keepAlive, isFull: full, routeUseTooltip } = settings;
      router.meta._fullPath = fullPath;
      // 这两个顺序不能互换，因为 getLayoutTitle 函数需要 useI18n
      if (useI18n === undefined && routeUseI18n !== undefined) router.meta.useI18n = routeUseI18n;
      router.meta.title = getLayoutTitle(router as RouteConfig);
      if (isKeepAlive === undefined && keepAlive !== undefined) router.meta.isKeepAlive = keepAlive;
      if (isFull === undefined && full !== undefined) router.meta.isFull = full;
      if (useTooltip === undefined && routeUseTooltip !== undefined) router.meta.useTooltip = routeUseTooltip;
    }
    if (router.children && router.children.length) {
      if (isExternal(fullPath)) router.children = processRouteMeta(router.children, "");
      else router.children = processRouteMeta(router.children, fullPath);
    }
  });
  return routers;
};
```

该函数将会和 `src/config/setttings` 文件里的配置进行比较，`src/config/setttings` 里的配置是全局配置，这些配置包括了一些路由的配置，因此有两种情况发生：

- 如果 meta 没有使用某个配置项，但是 settings 文件有使用该配置项，则将 settings 的配置项放到 meta 里
- 如果 meta 使用了某个配置项，则不管 settings 文件有没有配置，都已 meta 已经存在的配置项为主

除了和 settings 文件配置项进行比较，该函数还处理一个非常重要的配置项：`_fullPath`。

`_fullPath` 记录当前路由的完整路径，如：

```typescript
const tableRoutes: RouterConfigRaw = {
  path: "/table",
  name: "Table",
  meta: { title: "表格", icon: "Grid", },
  children: [
    {
      path: "drag-table",
      name: "DragTable",
      component: () => import("@/views/table/dragTable/index.vue"),
      meta: { title: "表格拖拽", icon: "StarFilled" },
    }
  ],
};
```

那么 children path 为 `drag-table` 的完整路径应该是 `/table/drag-table`，即拼上父级的 path，这是 Route 官方的规则。

因此开发者在项目开发的过程，可以使用 `route.meta._fullPath` 来获取该路由的完整路径。

#### processDynamicRoutes

processDynamicRoutes 函数用来过滤动态路由，重新生成规范路由，这里的规范路由是指帮助开发者自动生成没有使用的路由官方配置项。

```typescript
const processDynamicRoutes = (routers: RouterConfigRaw[]) => {
  if (!routers || !routers.length) return [];
  routers.forEach(r => {
    // 将 dynamic 属性加入 meta，标识此路由为后端返回路由
    r.meta && ((r.meta._dynamic as boolean) = true);
    if (r?.children && r.children.length) {
      // 父级的 redirect 属性取值：如果子级存在且父级的 redirect 属性不存在，默认取第一个子级的 path；如果子级存在且父级的 redirect 属性存在，取存在的 redirect 属性，会覆盖默认值
      if (!r.redirect) r.redirect = (r.children[0].meta?._fullPath as string) || r.children[0].path;
      // 父级的 name 属性取值：如果子级存在且父级的 name 属性不存在，默认取第一个子级的 name；如果子级存在且父级的 name 属性存在，取存在的 name 属性，会覆盖默认值（注意：测试中发现父级的 name 不能和子级 name 重复，如果重复会造成重定向无效（跳转 404），所以这里给父级的name起名的时候后面会自动加上 `Parent`，避免重复）
      if (!r.name) r.name = (r.children[0].name as string) + "Parent";
    }

    if (r.meta?.frameOpen && r.meta?.frameSrc && isExternal(r.meta?.frameSrc)) {
      r.path = r.meta?.frameSrc;
    } else {
      if (r.meta?.frameKeepAlive) r.component = FrameBlank;
      else if (!r.meta?.frameKeepAlive && r.meta?.frameSrc) r.component = FrameView;
      else {
        // 如果动态路由的 component 存在且为 string，则必须是 views 下的目录，以 / 分割，如果/home/index，则是 views/home/index.vue 组件，如果不存在 component，则读取 path 来获取 component
        if (r.component) {
          if (isType(r.component) === "string") r.component = modules["/src/views" + r.component + ".vue"];
        } else r.component = modules["/src/views" + r.path + ".vue"];
      }
    }
    if (r?.children && r.children.length) processDynamicRoutes(r.children);
  });
  return routers;
};
```

- 如 name，如果有二级路由，且一级路由没有填写 name，则该函数自动在已经路由生成 name，name 值是二级路由的第一个 children 的 name + Parent
- 如 redirect，如果有二级路由，且一级路由没有填写 redirect，则该函数自动在一级路由生成 redirect，指向二级路由的第一个 children 的完整路径

如：

```typescript
const tableRoutes: RouterConfigRaw = {
  path: "/table",
  meta: { title: "表格", icon: "Grid", },
  children: [
    {
      path: "drag-table",
      name: "DragTable",
      component: () => import("@/views/table/dragTable/index.vue"),
      meta: { title: "表格拖拽", icon: "StarFilled" },
    }
  ],
};
```

则最终生成：

```typescript
const tableRoutes: RouterConfigRaw = {
  // ...
  name: "DragTableParant"
  redirect: "/table/drag-table",
  // ...
};
```
该函数还有一个主要的功能，如果你看过 [`指南 `- 路由](/guide/basic/guide-route)，就知道路由有三种方式读取组件：

- 官方形式：`component: () => import("@/views/xx/index.vue")`
- 字符串形式：`component: () => xx/index`
- path 形式：`path: () => xx/index`

后两种形式是该函数处理后变成官方形式的：

```typescript
if (r.component) {
  if (isType(r.component) === "string") r.component = modules["/src/views" + r.component + ".vue"];
} else r.component = modules["/src/views" + r.path + ".vue"];
```

#### loadPermissionRoutes

loadPermissionRoutes 函数不在 useRoute.ts 文件里，而是在 `src/stores/permission.ts` 文件里。

```typescript {9-13}
export const usePermissionStore = defineStore("permissionStore", () => {
  const loadedRouteList = ref<RouterConfig[]>([]);
  const flatRouteList = ref<RouterConfig[]>([]);

  const { processRouteMeta, findRouteByName, filterFlatRoutes, ascending } = useRoutes();
  
  // ...

  const loadPermissionRoutes = (routers: RouterConfigRaw[]) => {
    loadedRouteList.value = ascending(processRouteMeta(constantRoutes).concat(routers)) as RouterConfig[];
    flatRouteList.value = filterFlatRoutes(routers) as RouterConfig[];
    return flatRouteList.value;
  };
  
	// ...
});
```

将上面最终处理完的路由传入 loadPermissionRoutes，让该函数先将静态路由和传过来的路径进行处理：

- processRouteMeta 处理 constantRoutes 的 meta，该函数在 `src/hooks/useRoutes.ts` 文件下
- ascending 处理排序路由的顺序，取决于 `meta.rank` 的数字大小，数字越小越靠前，该函数在 `src/hooks/useRoutes.ts` 文件下
- 最后赋值给 loadedRouteList，这样 Admin 随时使用 loadedRouteList 来获取最终 Admin 需要的路由表信息

ascending 函数按照路由中 meta 下的 rank 等级升序来排序路由（仅处理以及一级路由）：

```typescript
/**
 * @description 按照路由中 meta 下的 rank 等级升序来排序路由（仅处理以及一级路由）
 */
const ascending = (routeList: any[]) => {
  routeList.forEach((r, index) => {
    if (!r.meta) r.meta = {};
    // 当 rank 不存在时，根据顺序自动创建，首页路由永远在第一位
    if (r.name === HOME_NAME && !r.meta?.rank) r.meta.rank = 0;
    else if (handRank(r)) r.meta.rank = index + 2;
  });
  return routeList.sort((a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
    return a?.meta.rank - b?.meta.rank;
  });
};
/**
 * @description 过滤不需要的排序的路由
 */
const handRank = (route: RouterConfig) => {
  const { name, path, meta } = route;
  if (!meta?.rank || (meta?.rank === 0 && name !== HOME_NAME && path !== "/")) return true;
  return false;
};
```

filterFlatRoutes 是处理路由扁平化的函数

```typescript
const filterFlatRoutes = (routeList: RouterConfigRaw[]) => {
  return routeList.reduce((pre: RouterConfigRaw[], current: RouterConfigRaw) => {
    let flatArr = [...pre, current];
    if (current.children) flatArr = [...flatArr, ...filterFlatRoutes(current.children)];
    return flatArr;
  }, []);
};
```

#### findRouteByName

在路由初始化的时候，Admin 需要获取首页的路由，这在面包屑功能需要，因此在 `src/stores/permission.ts` 文件有这段代码：

```typescript
// 路由里首页的 name 值，必须填且正确，默认为 Home
const homeRoute = computed(() => findRouteByName(loadedRouteList.value, HOME_NAME)); 
```

HOME_NAME 是一个变量，确保这里和首页路由使用的是这个变量，这样已修改 HOME_NAME 的值，则首页都能扫描到。

findRouteByName 是一个路由工具函数，功能是查找 name 对应的路由信息，在 `src/hooks/useRoutes.ts` 文件下：

```typescript
/**
   * @description 查找 name 对应的路由信息
   * @param routes 路由表
   * @param name 查找的 name
   */
const findRouteByName = (routes: RouterConfig[], name: string): RouterConfig | null => {
  let res = routes.find(item => item.name === name) || null;
  if (res) return isProxy(res) ? toRaw(res) : res;
  else {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].children instanceof Array && routes[i].children?.length) {
        res = findRouteByName(routes[i].children || [], name);
        if (res) return isProxy(res) ? toRaw(res) : res;
      }
    }
    return null;
  }
};
```

## 总结

如果你没有二次开发的想法，可以不需要了解整个初始化流程，上面的流程并不需要你去做任何操作，你只需要和正常开发一样，在 view 下面写业务组件，然后里配置该路由，就可以在页面看到效果了，上面的流程在你配好路由自动执行。

大致总结下上面的流程，其中第一条是你需要操作，其他都是自动执行：

- 写好自己的路由表（开发人员需要自己操作）
- 路由 beforeEach 执行初始化流程 initDynamicRouters 函数
- 判断是否有缓存，有则读取缓存的路由执行初始化
- 初始化之前先进行路由权限的扫描，在 filterOnlyRolesRoutes 函数中执行，只获取满足 roles 的路由，其他路由去掉
- 处理路由的 meta 配置项，在 processRouteMeta 函数中执行
- 处理路由的元数据，在 processDynamicRoutes 函数中执行
- 存储到 Pinia，并处理成扁平化路由，在 loadPermissionRoutes 函数中执行
- 将扁平化路由初始化加载 addRoute 到 Layout 布局路由下作为二级路由，如果存在 `meta.isFull`，则 addRoute 到一级路由下，最后并加载 404 路由
