#  预构建



## 介绍

Admin 内置预构建功能，在第一次构建的时候进行缓存，从而加快在下一次构建的时间。

预构建的依赖需要进行配置，Admin 默认只将布局用到的依赖进行缓存，所以开发者自行配置自己的依赖缓存。

在 `build/optimize.ts` 文件里，`include` 数组里添加预构建模块，`exclude` 数组排除与构建模块。

## include

`include` 配置为需要预构建的模块。`vite` 启动时会将 `include` 里的模块，编译成 `esm` 格式并缓存到 `node_modules/.vite` 文件夹，页面加载到对应模块时如果浏览器有缓存就读取浏览器缓存，如果没有会读取本地缓存并按需加载。

下面是精简版 `include` 配置，将 `package.json` 的 `dependencies` 大部分未全局安装的模块都配置进来，当然如果模块里面的东西很少，也就是里面方法不多，可以不用配置进来直接让浏览器加载即可（您自己安装的模块也是参考该配置）

```typescript
const include = [
  "qs",
  "mitt",
  "axios",
  "pinia",
  "vue-i18n",
  "sortablejs",
  "@vueuse/core",
  "path-to-regexp",
  "pinia-plugin-persistedstate",
];
```

::: tip

提示

1. 尤其当您禁用浏览器缓存时（这种情况只应该发生在调试阶段）必须将对应模块加入到 `include` 里，否则会遇到开发环境切换页面卡顿的问题（`vite` 会认为它是一个新的依赖包会重新加载并强制刷新页面），因为它既无法使用浏览器缓存，又没有在本地 `node_modules/.vite` 里缓存
2. 如果您使用的第三方库是全局引入，也就是引入到 `src/main.ts` 文件里，就不需要再添加到 `include` 里了，因为 `vite` 会自动将它们缓存到 `node_modules/.vite`

:::

## exclude

`exclude ` 配置为排除预构建的模块。
