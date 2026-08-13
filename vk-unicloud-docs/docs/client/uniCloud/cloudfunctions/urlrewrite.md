---
sidebarDepth: 0
---

# URL 化之 URL 重写

URL 重写的作用很简单：

1. 把外部 URL 改得更短、更好记。
2. 隐藏内部真实路径。
3. 支持把 query 参数改成路径参数。
4. 支持把云对象的 `.` 改成 `/`。

例如：

```text
外部访问: https://xxx.bspapp.com/http/router/goods/getList
实际执行: client/goods/pub/getList
```

效果：隐藏了 `client` 和 `pub` 目录

如果你还没有配置 URL 化，可以先查看 [使用 axios 等工具请求云函数或云对象](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudfunctionsForHttp.html)。

## 快速开始

新建或编辑 `router/util/urlrewrite.js`

```js
module.exports = {
  rule: {
    '^goods/getList$': 'client/goods/pub/getList',
  },
  config: {
    // true: 只允许访问下面 rule 中声明的地址
    // false: 未声明的真实地址也可以直接访问
    accessOnlyInRule: false,
  },
};
```

修改后重新上传 `router` 云函数即可生效。

## 规则说明

```js
'^goods/getList$': 'client/goods/pub/getList',
```

含义：

1. 当访问 `goods/getList` 时，会命中这条规则。
2. `^` 表示以 `goods/getList` 开头，`$` 表示以 `goods/getList` 结尾。
3. 因为没有使用 `(.+)` 这类捕获参数，所以这条规则是精确匹配。
4. 命中后会转发到 `client/goods/pub/getList` 执行。
5. 这样对外访问地址中就隐藏了内部的 `client` 和 `pub` 目录。

## 常用示例

注意：以下 `外部访问` 地址均要拼接 `云函数URL化地址`，如` https://xxx.bspapp.com/http/router`

### 缩短 URL

```js
module.exports = {
  rule: {
    '^findGoodsList$': 'client/user/pub/findGoodsList',
  },
};
```

```text
外部访问: /findGoodsList
实际执行: client/user/pub/findGoodsList
```

### 云对象 `.` 改 `/`

```js
module.exports = {
  rule: {
    '^client/user/(.+)$': 'client/user.$1',
  },
};
```

```text
外部访问: /client/user/getInfo
实际执行: client/user.getInfo
```

### 隐藏 `pub`

```js
module.exports = {
  rule: {
    '^goods/list$': 'client/goods/pub/list',
    '^user/(.+)': 'client/user/pub/$1',
  },
};
```

```text
外部访问: /goods/list
实际执行: client/goods/pub/list

外部访问: /user/xxx
实际执行: client/user/pub/xxx
```

### 隐藏 `kh`

```js
module.exports = {
  rule: {
    '^user/profile$': 'client/user/kh/getProfile',
  },
};
```

```text
外部访问: /user/profile
实际执行: client/user/kh/getProfile
```

说明：去掉 `kh` 只是隐藏路径，登录校验仍然存在。

### 隐藏 `sys`

```js
module.exports = {
  rule: {
    '^admin/order/refund$': 'admin/order/sys/refund',
  },
};
```

```text
外部访问: /admin/order/refund
实际执行: admin/order/sys/refund
```

说明：去掉 `sys` 只是隐藏路径，后台权限校验仍然存在。

### 统一 API 前缀

```js
module.exports = {
  rule: {
    '^api/goods/list$': 'client/goods/pub/list',
    '^api/goods/detail/(.+)$': 'client/goods/pub/detail?id=$1',
    '^api/goods/category/list$': 'client/goods/pub/getCategoryList',
  },
};
```

适合开放 API、第三方对接、Webhook 等场景。

## 使用建议

1. 对外公开的地址，尽量不要直接带 `pub` `kh` `sys`。
2. 公开接口建议统一前缀，例如 `/api/`、`/open/`。
3. 具体规则写前面，通用规则写后面。
4. 不要一开始就写过宽的正则。
5. URL 重写只是美化请求地址，不是权限系统。

## 相关文档

1. [使用 axios 等工具请求云函数或云对象](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudfunctionsForHttp.html)
2. [云函数](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudFunctions.html)
3. [云对象 URL 化之 URL 重写](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html#urlrewrite)
