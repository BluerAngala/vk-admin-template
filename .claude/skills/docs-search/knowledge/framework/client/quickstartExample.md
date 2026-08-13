---
sidebarDepth: 0
---

# 快速上手 - 开发首个云对象接口并和前端进行交互

**_首先建议导入下 VK 框架快速开发辅助工具，Ta 能方便你很多_**

> [传送门 - VK 框架快速开发辅助工具](https://ext.dcloud.net.cn/plugin?id=6663)

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/39e8a615-c43c-421f-b848-b241970638ea.png)

**注意：后端目前分：云函数和云对象，两者都是后端，区别是云函数是 1 个文件写 1 个接口，云对象是 1 个文件写 N 个接口。**

本示例以云对象作为后端介绍整个流程，当你学会了云对象后，云函数也能轻松使用（两者其实差不多）

## 新建首个自己的云对象

**云对象必须写在 service 目录下，即这个目录下面。**

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/e0135e14-8057-4ce8-9e51-7268aa237ce4.png)

service 目录下面有几个基本目录，如下图介绍

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/862a6d33-d2b9-4bbb-ae2c-c82a13f27e9d.png)

现在我们新建一个客户端的接口，即需要写在 `client` 目录下。

- 1、在 `client` 目录右键，依次点击 vk - 新建云对象 - 输入 `pub.user` 即可创建 1 个云对象。

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/dda3de07-9b70-405a-87c2-f0c48bd5798a.png)

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/3ce96cb2-d462-4fb6-8d88-b921e99b3371.png)

**_如果不以 pub. 开头，则这个云对象内的接口前端需要先登录才能访问，加了 pub. 则未登录也能直接访问里面的接口。_**

> [传送门 - 云对象内置权限说明](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html#%E5%86%85%E7%BD%AE%E6%9D%83%E9%99%90)

在刚创建的 `pub.user` 云对象内可以看到有几个内置方法，其中 `_before` 是请求前处理的过滤器，`_after` 是请求后处理的过滤器，而下面的 `getList` 和 `test` 都是对外的接口

- 2、新建 1 个接口，名为 calc

这里演示简易加法计算接口，不涉及数据库（一般接口都会涉及到数据库，这里只是演示怎么写接口，同时给前端怎么调用）

```js
/**
 * 演示加法计算接口
 * @url client/pub.user.calc 前端调用的url参数地址
 */
calc: async function(data) {
  let res = { code: 0, msg: '' };
  // 业务逻辑开始-----------------------------------------------------------
  let {
    x,
    y
  } = data;
  if (vk.pubfn.isNull(x)) return { code:-1, msg:"x不能为空" };
  if (vk.pubfn.isNull(y)) return { code:-1, msg:"y不能为空" };

  res.z = x + y;

  // 业务逻辑结束-----------------------------------------------------------
  return res;
},
```

## 前端调用云对象内的接口

- 3、写完后，保存，然后选中 calc 接口名，右键，vk - 复制前端调用代码

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/5e1b9a53-7969-4059-a795-8d47fe66c65a.png)

- 4、去前端页面的方法里，复制即可。

如

```vue
<template>
  <view class="content">
    <button @click="test()">请求云对象的方法</button>
  </view>
</template>

<script>
  export default {
    data() {
      return {};
    },
    methods: {
      test() {
        vk.callFunction({
          url: 'client/pub.user.calc',
          title: '请求中...',
          data: {
            x: 1,
            y: 2,
          },
          success: (data) => {
            vk.alert(`云端返回的计算结果是：${data.z}`); // 结果是3
          },
        });
      },
    },
  };
</script>
```

- 5、这样前端和云端的调用就完成了

**tips**

云对象还有一种特殊的方式调用云端接口，即通过 `uni.vk.importObject` 先引入云对象，然后可以直接调用云对象内的方法。

```vue
<template>
  <view class="content">
    <button @click="test()">请求云对象的方法</button>
  </view>
</template>

<script>
  export default {
    data() {
      return {};
    },
    methods: {
      async test() {
        // 注意异步
        // 导入云对象
        const userObject = uni.vk.importObject('client/pub.user'); // 这段代码可以写在外层顶部，也可以直接写在对应函数内部。
        try {
          // 导入云对象后就可以直接调用该对象的calc方法了，注意使用异步await
          let res = await userObject.calc({
            title: '请求中...',
            data: {
              x: 1,
              y: 2,
            },
          });
          vk.alert(`云端返回的计算结果是：${data.z}`); // 结果是3
        } catch (e) {
          console.log(e);
        }
      },
    },
  };
</script>
```

**总结**

跟之前传统开发其实差不多，思路是一样的。

以 java 为例

相当于你之前是先写 `java接口`，然后 `uniapp前端` 用 `uni.request` 请求 `java接口`

而现在是，先写 `云函数或云对象接口`，然后 `uniapp前端` 用 `vk.callFunction` 请求 `云函数或云对象` 即可。

道理是一样的，无非就是从 `java语言` 变成了 `node.js语言`，而 `node.js` 基本上跟前端的`js（javascript）` 是一样的语法，因此前后端就是统一的 `js语言`，学习成本大大降低。开发效率大大提升。

## 新手必看文档

[传送门 - 云对象介绍](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html)

[传送门 - JS API 文档大全](https://vkdoc.fsq.pub/client/jsapi.html)

[传送门 - vk.userCenter 用户中心 API](https://vkdoc.fsq.pub/client/vk.userCenter.html)

[传送门 - 数据库操作 API](https://vkdoc.fsq.pub/client/uniCloud/db/api.html)

[传送门 - 数据库操作 常见问题](https://vkdoc.fsq.pub/client/uniCloud/db/question.html)

[传送门 - uni-id 配置](https://vkdoc.fsq.pub/client/uniCloud/config/uni-id.html)

## 进阶文档

建议看完【新手必看文档】并会用后，在看进阶文档

[传送门 - vuex 的使用](https://vkdoc.fsq.pub/client/pages/vuex.html)

[传送门 - 数据库万能连表](https://vkdoc.fsq.pub/client/uniCloud/db/selects.html)

[传送门 - 数据库事务](https://vkdoc.fsq.pub/client/uniCloud/db/transaction.html)

[传送门 - 全局云端数据缓存](https://vkdoc.fsq.pub/client/uniCloud/cache/cache.html)

[传送门 - 全局中间件](https://vkdoc.fsq.pub/client/uniCloud/middleware/filter.html)

[传送门 - 云函数定时任务](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/timer.html)

[传送门 - 云函数 url 化给外部系统提供 http 接口](https://vkdoc.fsq.pub/client/question/q2.html)

**当你开发过程中碰到一些问题时，可以先在文档上搜索，如果没有找到答案，再在群里提问。**

**如我小程序开发时好好的，为什么正式版就无法连接云函数了？**

则在文档搜几个关键词，如小程序就是关键词，或者搜正式版

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/100c4e98-f0e3-49ca-a61a-7ca66a40ca6f.png)

一下就搜到答案了
