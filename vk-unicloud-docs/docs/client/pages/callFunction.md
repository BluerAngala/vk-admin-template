---
sidebarDepth: 0
---

# vk.callFunction（请求云函数）

## 说明

在前端页面需要调用云函数时，使用 `vk.callFunction` 调用，不使用 `uniCloud.callFunction`

**注意事项**

- 在页面上调用时，优先使用回调形式
- 表单提交请求必须加 `title` 或 `loading` 参数防止重复点击，如果页面上按钮支持 `loading` 和 `disabled` 属性或有 loading 遮罩组件，则优先使用 `loading` 参数控制重复点击，达到更好的交互体验（`title` 或 `loading`是二选一，请勿同时使用）
- 默认情况下，当返回结果 `code` 不为 `0` 时，会进 `fail` 回调，并自动弹窗 `err.msg`，但若写了 `fail` 回调后，则不会自动弹窗，此时如需弹窗，需手动写 `vk.alert(err.msg);`
- 如果 `fail` 回调内只写 `vk.alert(err.msg);`，没有其他逻辑，则不需要专门写 `fail` 回调，框架会自动执行 `vk.alert(err.msg);`

## 回调形式 @callback

```js
// 回调形式 success fail complete
vk.callFunction({
  url: '云函数路径',
  title: '请求中...',
  data: {},
  success: (data) => {},
  fail: (err) => {},
  complete: (res) => {},
});
```

## promise 方式@promise

```js
// promise方式
vk.callFunction({
  url: '云函数路径',
  title: '请求中...',
  data: {},
})
  .then((data) => {})
  .catch((err) => {});
```

## async/await 方式@async

注意：该方式也同时支持在云函数或云对象内使用。

```js
// async/await方式
try {
  let data = await vk.callFunction({
    url: '云函数路径',
    title: '请求中...',
    data: {},
  });
} catch (err) {
  console.log('失败', err);
}
```

## 属性@props

| 参数            | 说明                                                                                                                                                             | 类型            | 默认值 | 可选值 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------ | ------ |
| name            | 符合 VK 框架路由规则的 router 大函数名，默认为 app.config.js 内的 functionName 属性的值                                                                          | String          | router | -      |
| url             | 请求路径，该路径实为 router 大云函数的 service 目录下的路径（此时的 router 大函数=name 参数的值）                                                                | String          | -      | -      |
| data            | 请求参数                                                                                                                                                         | Object          | -      | -      |
| title           | 遮罩层提示语，为空或不传则代表不显示遮罩层。                                                                                                                     | String          | -      | -      |
| loading         | 自定义 loading [查看详情](#loading)                                                                                                                              | Boolean、Object |
| isRequest       | 是否使用云函数 url 化地址访问云函数                                                                                                                              | Boolean         | false  | true   |
| needAlert       | 为 true 代表请求错误时，会有 alert 弹窗提示                                                                                                                      | Boolean         | true   | false  |
| globalParamName | 全局请求参数的名称， 如果设置了正则规则，则不需要此参数 [查看详情](#globalparamname)                                                                             | String          | -      | -      |
| env             | 请求多服务空间的环境 [查看详情](https://vkdoc.fsq.pub/client/question/q9.html#%E5%89%8D%E7%AB%AF%E8%AF%B7%E6%B1%82%E5%A4%9A%E6%9C%8D%E5%8A%A1%E7%A9%BA%E9%97%B4) | String          | -      | -      |
| timeout         | 请求超时时间                                                                                                                                                     | Number          | -      | -      |
| retryCount      | 系统异常重试机制（表单提交时慎用，建议只用在查询请求中，即无任何数据库修改的请求中）                                                                             | Number          | 0      | -      |
| secretType      | 安全网络类型 [查看详情](#secrettype-uni官方版安全网络)                                                                                                           | String          | none   | -      |
| encrypt         | 是否加密通信（可以不开启安全网络实现加密通信） [查看详情](#encrypt-vk版双向加密通信)                                                                             | Boolean         | none   | -      |
| success         | 请求成功时，执行的回调函数                                                                                                                                       | Function        | -      | -      |
| fail            | 请求失败时，执行的回调函数                                                                                                                                       | Function        | -      | -      |
| complete        | 无论请求成功与否，都会执行的回调函数                                                                                                                             | Function        | -      | -      |

### loading

loading 参数说明

- 若 `loading` 的值为 `false`，则不显示默认遮罩层提示语

- 若 `loading` 的值为 `true` ，则不显示默认遮罩层提示语，同时在请求时，会自动设置页面变量 `this.loading=true` ，请求完成时，自动设置页面变量 `this.loading=false`

- 若 `loading` 的值类型为 `Object`，如下方代码效果是：请求时，会自动执行 `this.loading2=true` ，请求完成时，会自动执行 `this.loading2=false`

```js
loading: { that: this, name: "loading2" }
```

- name 支持. 如下方代码效果是：请求时，会自动执行 `this.page.loading=true` ，请求完成时，会自动执行 `this.page.loading=false`

```js
loading: { that: this, name: "page.loading" }
```

**Vue3 setup 用法示例**

因为 Vue3 的 setup 模式下没有 this，但 that 属性的本质其实就是一个对象，因此我们直接传一个对象给 Ta 就可以了，代码如下

```vue
<template>
  <view class="app">
    {{ loading }}
  </view>
</template>

<script setup>
  import { onLoad } from '@dcloudio/uni-app';
  import { ref, reactive } from 'vue';

  const vk = uni.vk;

  const loading = reactive({
    a: false,
    b: false,
  });

  onLoad((options) => {
    vk.callFunction({
      url: 'template/pub.test.test500',
      loading: { that: loading, name: 'a' },
      data: {},
      success: (data) => {},
    });
  });
</script>
```

### globalParamName

globalParamName 参数说明

```js
// 需要先设置globalParamName对应的数据
/**
 * 修改请求配置中的公共请求参数
 * 若把shop-manage改成*则代表全局
 */
vk.callFunctionUtil.updateRequestGlobalParam({
  'shop-manage': {
    regExp: '^xxx/kh/',
    data: {
      shop_id: shop_id,
    },
  },
});

// 此时请求若带上 globalParamName:"shop-manage" 或满足 regExp:"^xxx/kh/" 的正则规则，则请求参数会自动带上 shop_id
vk.callFunction({
  url: 'xxx/xxxxxx',
  title: '请求中...',
  globalParamName: 'shop-manage', // 如果设置了正则规则,则不需要此参数
  data: {},
  success: (data) => {},
});
```

### 请求拦截器@interceptor

`uniCloud.addInterceptor` 提供了拦截器功能，[文档传送门](https://uniapp.dcloud.net.cn/uniCloud/client-sdk.html#add-interceptor)

**示例代码**

此代码写在 `App.vue` 的 `onLaunch` 中

```js
uniCloud.addInterceptor('callFunction', {
  invoke: (res) => {
    // res格式
    // {
    // 	"name": "router",
    // 	"data": {
    // 		"$url": "template/test/pub/test",
    // 		"data": {

    // 		}
    // 	}
    // }
    console.log('interceptor-invoke: ', res);
    res.data.data.a = 1; // 新增请求参数a=1（注意：此参数不会显示在vk的请求日志中，但可在HBX控制台内可看到，即最终此参数可在云函数中取到）
    // throw new Error(`请求【${res.data.$url}】已被拦截`); // 在此抛出异常可拦截后续请求
  },
  success: (res) => {
    console.log('interceptor-success ', res);
    // 请求成功后，修改a值为1
    res.result.a = 1;
  },
  fail: (err) => {
    console.log('interceptor-fail', err);
  },
  complete: (res) => {
    console.log('interceptor-complete', res);
  },
});
```

### secretType（uni 官方版安全网络）@secretType

`vk.callFunction` 多传一个参数 `secretType: "both"` 即可开启安全网络

| secretType 值 |                        描述                        |
| :-----------: | :------------------------------------------------: |
|     none      |               上下行都不加密，默认值               |
|    request    | 只加密客户端请求时的上行数据，服务器下发数据不加密 |
|   response    |   客户端请求时不加密数据，只加密服务器下发的数据   |
|     both      |        客户端和服务器上行下行数据都加密数据        |

**注意：**

1. 建议只对真正需要防止网络窃取的保密数据才加密。
2. 只支持 APP、微信小程序，不支持 H5 和其他小程序，推荐使用 [VK 版双向加密通信](#encrypt-vk版双向加密通信) 支持全端双向通信加密。

如何开通？[传送门](https://doc.dcloud.net.cn/uniCloud/secure-network.html#%E5%A6%82%E4%BD%95%E5%BC%80%E9%80%9A)

安全网络详细文档：[传送门](https://doc.dcloud.net.cn/uniCloud/secure-network.html)

### encrypt（vk 版双向加密通信）@encrypt

> vk-unicloud 核心库版本需 >= 2.18.7

`vk版双向加密通信` 和 `uni官方版安全网络` 是 2 个不同的功能，可以一起使用，也可以单独使用

**vk 版双向加密通信特点**

1. 上手更简单
2. 全端支持（H5、APP、小程序）
3. 支持 URL 化后的加密通信（需要用 vk.request 请求）
4. 请求参数和返回值均是密文传输
5. 防重放攻击（请求的密文具有时效性，默认 10 秒过期）

**效果**

![](https://cdn.fsq.pub/vkdoc/vk-client/1718791729028adqot3kut6o.png)

**友情提示**

加密通信与安全网络一样，只能保证相对安全，无法保证绝对安全，如果你发布 APP，可以考虑再配合使用 APP 的安全加固，防止 APP 端被破解，这样加密通信起到的安全效果会更好。

#### 单独指定某个请求加密通信@encrypt-1

`vk.callFunction` 多传一个参数 `encrypt: true` 即可开启加密通信

```js
vk.callFunction({
  url: 'template/test/pub/testEncryptRequest',
  title: '请求中...',
  encrypt: true, // 是否加密通信
  data: {
    a: 1,
    b: '2',
  },
  success: (data) => {
    console.log('data: ', data.data);
  },
});
```

#### 通过配置方式实现加密通信@encrypt-2

项目根目录 app.config.js 添加以下配置

```js
// 需要检查是否哪些请求需要加密通信
checkEncryptRequest: {
	/**
	 * 如果 mode = 0 则不做处理
	 * 如果 mode = 1 则代表list内的云函数或云对象需要加密通信，不在list内的不需要加密通信
	 * 注意1: list内是正则表达式，非通配符表达式
	 * 注意2: 建议与 router/middleware/modules/encryptFilter.js 内的regExp保持一致
	 */
	mode: 1,
	list: [
		"^template/test/pub/testEncryptRequest$", // 表示 template/test/pub/testEncryptRequest 云函数需要加密通信
		"^template/encrypt/(.*)", // 表示以 template/encrypt/ 开头的云函数或云对象需要加密通信
	]
},
```

#### 强制云函数或云对象必须加密通信@encrypt-3

修改中间件 `router/middleware/modules/encryptFilter.js` 内的 `regExp` 与前端 `checkEncryptRequest.list` 保持一致（如果你没有此中间件则新建一个 encryptFilter.js 代码如下）

**效果**

在此设置的云函数或云对象如果请求参数没有加密，会报 413 错误码：请求非法，请求参数未加密，不再执行后续逻辑

```js
/**
 * 加密函数拦截器 - 前置
 * 作用：用于指定哪些函数必须加密请求
 */

module.exports = [
  {
    id: 'encryptFilter',
    // 正则匹配规则，满足以下规则的云函数会强制需要加密通信
    regExp: ['^template/test/pub/testEncryptRequest$', '^template/encrypt/(.*)'],
    description: '加密函数拦截器',
    index: 10, // 此处建议填一个很小的值，建议小于100，这是为了让该过滤器最先执行（越小越先执行）
    mode: 'onActionExecuting', // 可选 onActionExecuting onActionExecuted
    enable: true, // 通过设置enable=false可以关闭该中间件
    main: async function (event) {
      // 这里是拦截规则，可以查数据库，最终code:0 代表通过，其他均为未通过，msg是被拦截的原因
      let { data = {}, util } = event;
      let { vk } = util;
      // 如果未使用加密通信，则拦截
      if (!event.encrypt) {
        return {
          code: 413,
          msg: '请求非法，请求参数未加密',
        };
      }
      return {
        code: 0,
        msg: 'ok',
      };
    },
  },
];
```

**特别注意**

如果开启了强制加密，则云端一个云函数（或云对象）调用另外一个云函数（或云对象）时，`vk.callFunction` 必须多传一个参数 `encrypt: true` 才能正常调用

#### 设置请求参数密文有效期@encrypt-4

打开配置文件 `common/uni-config-center/vk-unicloud/index.js` 修改配置 `clientCrypto.expTime` 的值（单位秒，此值如果设置太小，可能会影响正常用户的请求）

```js
// 客户端加密通信配置
"clientCrypto": {
  "expTime": 60, // 同一个请求过期时间，单位秒（可防止重放攻击）取值范围：5 ~ 3600（特别注意：此值如果设置太小，可能会影响正常用户的请求）
},
```

**效果**

![](https://cdn.fsq.pub/vkdoc/vk-client/1718791854830p67v9fq24q8.png)
