#  主题样式



## 介绍

Admin 内置了主题色、暗黑模式、灰色模式、色弱模式等主题配置。

Admin 的样式相关代码在 `src/styles` 目录下。

```markdown
├── styles
    ├─ element-dark.scss # 自定义 element 暗黑模式样式
    ├─ index.scss # 自定义全局元素样式
    ├─ normalize.css # 默认的基本元素样式
    ├─ transition.scss # 自定义全局动画样式
    ├─ variables.module.scss # 布局主题样式
    ├─ variables.module.scss.d.ts # 布局主题样式 TS 提示
    ├─ variables.scss # 自定义全局变量，文件里填写的变量在编译的时候内置到系统
```

## 主题色

Admin 点击右上角头像，然后点击我的设置，就可以看到全局主题颜色选择器，有如下预定义主题颜色：

```typescript
// 预定义主题颜色
const colorList = [
  "#168BF7", 
  "#DAA96E",
  "#0C819F",
  "#409EFF",
  "#27ae60",
  "#ff5c93",
  "#e74c3c",
  "#fd726d",
  "#f39c12",
  "#9b59b6",
];
```

当你希望更改这些预定义主题颜色的时候，前往 `src/layout/components/ThemeDrawer/index.vue` 的 304 行左右找到上面的代码进行修改。

## 暗黑模式

Admin 适配了 Element Plus 的暗黑模式，可以在「右上角头像 - 我的设置 - 暗黑模式」进行切换暗黑模式。

Admin 默认不开启暗黑模式，如果希望默认开启暗黑模式，则在 `src/config/settings` 将 isDark 改为 true。

### 适配

如果在暗黑模式下，自己写的组件没有适配样式，则在 `src/styles/element-dark.scss` 里进行适配：

```scss
html.dark {
  // 适配样式
}
```

### 组件切换

暗黑模式除了通过我的设置来切换，也可以通过页面的按钮来切换，Admin 封装了暗黑模式切换的组件，在 `/src/components/SwitchDark` 下，是一个 Switch 开关。

## 灰色模式、色弱模式

Admin 适配了灰色模式、色弱模式，可以在「右上角头像 - 我的设置 - 灰色模式、色弱模式」进行切换灰色模式、色弱模式。

Admin 默认不开启灰色模式、色弱模式，如果希望默认开启灰色模式、色弱模式，则在 `src/config/settings` 将 isWeak、isGrey 改为 true。

灰色模式、色弱模式 采用了 CSS3 的 `filter` 属性来全局设置，俗称 **滤镜**，如果你想自定义更多类似的全局颜色模式，可以学习 `filter` 的其他用法。

灰色模式、色弱模式只是 `filter` 属性的其中两个应用。

## 源码

主题色、暗黑模式、灰色模式、色弱模式等主题的功能在 `src/hooks/useTheme.ts` 里看到代码逻辑。
