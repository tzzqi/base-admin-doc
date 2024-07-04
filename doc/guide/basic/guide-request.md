#  请求



## 介绍

Admin 基于 Axios 封装了一套开箱即用的 http 请求。包括请求 Loading、错误处理、取消请求等功能，在 `src/config/request` 目录下。

### 中文文档

[点击查看 Axios 中文文档](https://www.axios-http.cn/)

## 配置

你需要手动配置你的 `baseURL`，`baseURL` 默认读取环境变量文件 `.env.xxx` 的 `VITE_API_URL`：

```typescript
const config = {
  // 默认地址请求地址，可在 .env.*** 文件中修改
  baseURL: import.meta.env.VITE_API_URL,
  // 设置超时时间（10s）
  timeout: ResultEnum.TIMEOUT as number,
};
```

::: tip

`baseURL` 是通过环境变量加载的。你应该去项目根目录下的 `.env.***` 文件中修改 `VITE_API_URL`，而不是在此处直接修改。

:::

## 基本使用

Admin 封装了六种方法，基本满足请求的场景。

### get

```typescript
get<T>(url: string, params?: object, _object = {}): Promise<T> {
  return this.service.get(url, { params, ..._object });
}
```

使用：

```typescript
import http from "@/config/request";

http.get("url", "参数", "其他信息")
```

添加数据的 TS 返回类型：

```typescript
import http from "@/config/request";

interface User {
  name: string;
  age: number;
}

http.get<User>("url", "参数", "其他信息")
```

### 其他

Admin 还支持 post、put、delete、download 请求，用法和 get 一样。

### 完整写法

```typescript
request<T, R = any>(config: AxiosRequestConfigProp<R>): Promise<T> {
  return this.service(config) as unknown as Promise<T>;
}
```

Admin 还兼容 Axios 的完整写法：

```typescript
import http from "@/config/request";

http.request({
  url: "/test",
  method: "post",
  data: {
    name: "可乐",
    age: 18
  }
})
```

添加数据的 TS 返回类型：

```typescript
import http from "@/config/request";

interface User {
  name: string;
  age: number;
}

http.request<User>({
  url: "/test",
  method: "post",
  data: {
    name: "可乐",
    age: 18
  }
})
```

## ContentType 封装

Admin 对 ContentType 进行了一些封装，提供了关键词 `_type` 来快速修改 ContentType，在 params 下添加了一个关键词 `_type`（仅支持 `post` 请求），该关键词目前接收 5 个参数：

- `form`：请求头为 `application/x-www-form-urlencoded`
- `file`：请求头为 `application/form-data`
- `json`：请求头为 `application/json`
- `info`：请求头为 `multipart/form-data`
- `multi`：代表发送的参数有数组，会自动处理成 `key=value&key=value` 形式，具体看数组封装

如果不填写 `_type`，则默认是 json。

```typescript {10-12}
import http from "@/config/request";

http.request({
  url: "/test",
  method: "post",
  data: {
    name: "可乐",
    age: 18
  },
  params: {
    _type: "form"
  }
})
```

## 数组封装

Admin 经历过这样一个场景，那就是后台不接受数组作为参数，而是需要在 URL 后面进行拼接来形成数组，如不接受

```typescript
import http from "@/config/request";

http.request({
  url: "/test",
  method: "get",
  params: {
    arr: [1, 2, 3]
  }
})
```

只接收：

```typescript
import http from "@/config/request";

http.request({
  url: "https://youngkbt.cn/test?arr=1&arr=2&arr=3",
  method: "get",
})
```

那么 Admin 基于 URL 的数组进行了封装，满足开发人员传递的 **依然是数组**，而在 Axios 调用接口前，进行数组的抽取，拼到 URL 后面。

这依赖一个在 params 的关键词：`_type: multi`，代表发送的参数有数组，会自动处理成 `key=value&key=value` 形式，具体看数组封装。

```typescript
import http from "@/config/request";

http.request({
  url: "https://youngkbt.cn/test",
  method: "get",
  params: {
    arr: [1, 2, 3],
    _type: multi
  }
})
```

这样在最终发送的链接就是 `https://youngkbt.cn/test?arr=1&arr=2&arr=3`。

## Loading 封装

如果发送请求时，需要显示全局 loading 加载，在 api 服务中通过指定: `{ headers: { loading: true } }` 来控制显示 loading

```typescript
import http from "@/config/request";

export const api = () => {
  http.request({
    url: "/generic/api",
    // ...
    headers: {
      loading: true,
    },
  });
};
```

这样当请求 api 的时候，将全屏显示 Loading，直到请求结束。

## 映射封装

当项目变得复杂时，那么获取资源的 `https://ip:port` 必然有很多个，可以在接口的 header 使用 mapping 来开启多个 baseURL 功能：

```typescript
import http from "@/config/request";

export const api = () => {
  http.request({
    url: "/generic/api",
    // ...
    headers: {
      mapping: true,
    },
  });
};
```

当开启 mapping 后，打开 `src/config/request/index.ts` 文件，然后在 mappingUrl 变量里添加一个键值对：

```typescript
const mappingUrl: { [key: string]: string } = {
  default: import.meta.env.VITE_API_URL,
  test: "https://youngkbt.cn",
};
```

default 是默认的 baseURL，**请不要删除或者更改**，当不开启 mapping 或者开启后无法匹配键值对，则走 default 对应的 URL。

当配置了一个键值对，如上面的 test，则在请求的时候，url 前缀携带 test，如（第五行）：

```typescript
import http from "@/config/request";

export const api = () => {
  http.request({
    url: "/test/generic/api",
    // ...
    headers: {
      mapping: true,
    },
  });
};
```

当触发该接口到后台时，`/test` 将会被替换成 `https://youngkbt.cn`，变成 `https://youngkbt.cn/generic/api`。

如果在 headers 开启了 mapping，但是 URL 没有在 mappingUrl 里配置，则依然走 default 的 URL。

在不使用该功能时，不建议打开 mapping，因为这将进行一轮 mapping 匹配扫描，耗费些许时间。

## 请求异常封装

Admin 针对 Axios 发生的请求异常进行捕获并在页面上提示，如果开启了错误日志，则将异常存放到错误日志。

```typescript
async (error: AxiosError) => {
  // 异常存放到错误日志
  const errorStore = useErrorLogStore();
  // 关闭全局 Loading
  if (error.config?.headers?.loading) tryHideFullScreenLoading();
  // 请求结束，移除请求的缓存
  else axiosCanceler.removePendingRequest(error.config || {});
  
  if (error.message === "身份异常") return message.error("身份异常");
  else if (error.message.indexOf("timeout") !== -1) message.error("请求超时！请您稍后重试");
  else if (error.message.indexOf("Network Error") !== -1) message.error("网络错误！请您稍后重试");
  // 根据响应的错误状态码，做不同的处理
  if (error.response) checkStatus(error.response.status);
  // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
  if (!window.navigator.onLine) router.replace("/500");
  const e = processError(error);
  e && errorStore.addErrorLog(e);
  return Promise.reject(error);
}

export const checkStatus = (status: number): void => {
  switch (status) {
    case 400:
      message.error("请求失败！请您稍后重试");
      break;
    case 401:
      message.error("登录失效！请您重新登录");
      break;
    case 403:
      message.error("当前账号无权限访问！");
      break;
    case 404:
      message.error("你所访问的资源不存在！");
      break;
    case 405:
      message.error("请求方式错误！请您稍后重试");
      break;
    case 408:
      message.error("请求超时！请您稍后重试");
      break;
    case 500:
      message.error("服务异常！");
      break;
    case 502:
      message.error("网关错误！");
      break;
    case 503:
      message.error("服务不可用！");
      break;
    case 504:
      message.error("网关超时！");
      break;
    default:
      message.error("请求失败！");
  }
};


/**
 * Axios 的错误提示和持久化处理
 * @param error Axios 错误
 * @returns 持久化数据
 */
function processError(error: AxiosError) {
  const e = JSON.parse(JSON.stringify(error));
  if (Object.keys(e).includes("baseURL")) {
    const {
      config: { baseURL, url, params, method, data },
    } = JSON.parse(e);
    const requestURL = isExternal(baseURL) ? baseURL + url : url;
    let { message } = error;
    message = message + "，token 不存在或者失效了";
    let stack = "您发送的请求为 " + method.toUpperCase() + "，您请求的地址为 " + requestURL;
    if (params) stack = stack + "，请求携带的 params 为 " + JSON.stringify(params);
    if (data) stack = stack + "，请求携带的 data 为 " + JSON.stringify(data);
    error.stack = stack;
    error.message = message;
    // 添加异常
    return {
      error,
      vm: null,
      info: "axios 请求错误",
      url: window.location.href,
      hasRead: false,
    };
  }
}
```

