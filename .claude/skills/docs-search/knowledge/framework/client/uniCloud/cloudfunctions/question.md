---
sidebarDepth: 0
---

# 云端操作常见问题

[点击查看更多问题解答](https://vkdoc.fsq.pub/client/question/question.html)

## 如何在云函数中访问 http 服务@cloud1

[传送门](https://vkdoc.fsq.pub/client/jsapi.html#vk-request-%E4%BA%91%E7%AB%AF%E8%B0%83%E7%94%A8)

## 请求云函数报 403 错误@cloud2

```js
code=403 为权限不足，通常是因为你写的云函数没有放在`pub`或`kh`目录下导致的
pub目录：任何人都可以请求的云函数
kh目录：只有登录用户才可以请求的云函数
sys目录：登录且拥有对应权限的用户才可以请求的云函数
```

## 云函数中时区问题导致获取到的本月起始时间和截止时间不准确@cloud3

```js
// 使用以下api可以解决时区问题：
let commonTime = vk.pubfn.getCommonTime(new Date());
```

## 云函数中如何使用缓存@cloud4

[传送门](https://vkdoc.fsq.pub/client/uniCloud/cache/cache.html)

## 云函数中如何将网络图片上传到云储存@cloud5

[传送门](https://vkdoc.fsq.pub/client/question/question.html#%E4%BA%91%E5%87%BD%E6%95%B0%E4%B8%AD%E5%A6%82%E4%BD%95%E5%B0%86%E7%BD%91%E7%BB%9C%E5%9B%BE%E7%89%87%E4%B8%8A%E4%BC%A0%E5%88%B0%E4%BA%91%E5%82%A8%E5%AD%98)

## 云函数中如何将网络图片转成 base64@cloud6

[传送门](https://vkdoc.fsq.pub/client/question/question.html#%E4%BA%91%E5%87%BD%E6%95%B0%E4%B8%AD%E5%A6%82%E4%BD%95%E5%B0%86%E7%BD%91%E7%BB%9C%E5%9B%BE%E7%89%87%E8%BD%AC%E6%88%90base64)

## 云函数中如何调用另一个云函数@cloud7

#### 方式一（推荐，vk-unicloud 版本需>=2.9.0）

**注意：方式一只支持符合 VK 框架路由规则的云函数或云对象**

优势：完美契合 VK 框架，且拥有继承当前用户 token、ip 等功能。

```js
// 云函数内调用其他云函数或云对象内的函数，在同一个router大函数下，name参数可不传
let callRes = await vk.callFunction({
  name: 'router',
  url: 'client/user/pub/test',
  event,
  data: {
    a: 1,
  },
});
console.log(callRes);

// 云对象内调用其他云函数或云对象内的函数，在同一个router大函数下，name参数可不传
let callRes = await vk.callFunction({
  name: 'router',
  url: 'client/user.test',
  clientInfo: this.getClientInfo(),
  data: {
    a: 1,
  },
});
console.log(callRes);
```

#### 方式二（此方式适用任何场景）

优势：可以请求不是 vk 框架下的云函数

```js
let callFunctionRes = await uniCloud.callFunction({
  name: 'router',
  data: {
    $url: 'client/user/pub/test',
    data: {
      a: 1,
      b: 2,
    },
  },
});
console.log(callFunctionRes.result);
```

#### 方式三 （此方式需要单独写成公共函数，如 `service/user/util/login_log.js`）

优势：减少一次网络请求，性能高

```js
// 下方代码是演示调用 service/user/util/login_log 文件内的 add函数
let loginLogService = vk.require('service/user/util/login_log');
await loginLogService.add(
  {
    type: 'login',
    login_type: 'univerify',
    user_id: res.uid,
    context: originalParam.context,
  },
  util
);
```

[点击查看更多问题解答](https://vkdoc.fsq.pub/client/question/question.html)
