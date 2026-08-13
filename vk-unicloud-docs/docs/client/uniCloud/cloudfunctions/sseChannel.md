---
sidebarDepth: 0
---

# 云端请求中的中间状态通知通道

> 新增于 HBuilderX 3.8.0

云函数在执行长时间任务时客户端无法获取云端任务执行状态，用户无法确定云函数是否还在正常执行，有些用户可能直接放弃等待刷新页面重新执行，从而导致浪费了更多的云函数资源。因此在此场景下需要一个云函数通知客户端发送执行状态或中间结果的通道。

在常规 web 开发时可以使用 server sent event 将结果分段返回，客户端自行组装最终结果。但是小程序端并不支持 server sent event，因此 uniCloud 基于 uni-push 实现了这个替代方案。

使用此功能前需要先开通 uni-push 2.0，参考文档：[uni-push 2.0](https://uniapp.dcloud.net.cn/unipush-v2.html#%E7%AC%AC%E4%B8%80%E6%AD%A5-%E5%BC%80%E9%80%9A)

## 客户端 API

[查看完整示例](#完整示例)

### 创建通道

```js
const channel = uniCloud.SSEChannel();
```

### 开启通道

用于开启消息通道。

用法：

```js
await channel.open();
```

注意通道一定要在 open 之后再传给云函数

此方法在 HBuilderX 3.7.10 版本及 3.8.0 版本使用时 vue3 版本发行时会报错`uni[e] is not a function`，如遇到此问题请升级 HBuilderX 版本

### 关闭通道

用于关闭消息通道，关闭后将不会收到 message 和 end 事件（在接收到 end 事件后会自动关闭，无需手动执行 close）

用法：

```js
channel.close();
```

### 通道开启事件

用法：

```js
// 监听message事件
channel.on('open', () => {
  console.log('消息通道开启了');
});
```

### 通道消息事件

用法：

```js
// 监听message事件
channel.on('message', (message) => {
  console.log('on message', message);
});
```

### 通道消息结束事件

用法：

```js
// 监听end事件，如果云端执行end时传了message，会在客户端end事件内收到传递的消息
channel.on('end', (message) => {
  console.log('on end', message);
});
```

### 通道错误事件

用法：

```js
// 监听error事件
channel.on('error', (err) => {
  console.error('on error 收到错误：', err);
});
```

### 通道关闭事件

在收到消息结束事件、错误事件及开发者主动调用 close 方法后会触发 close 事件

用法：

```js
// 监听close事件，在收到消息结束事件、错误事件及开发者主动调用close方法后会触发close事件
channel.on('close', () => {
  console.log('on close 消息通道关闭');
});
```

### 事件监听与移除监听

事件监听可以通过 `on` 或 `addListener` 方法，事件移除需要使用 `off` 或 `removeListener` 方法。另外还有 `removeAllListener` 方法用于移除指定事件的所有监听器。

```js
function onMessage(message) {
  console.log('收到消息：', message);
}
channel.on('message', onMessage); // 为message事件增加监听器
channel.addListener('message', onMessage); // 为message事件增加监听器
channel.off('message', onMessage); // 移除message事件指定监听器
channel.removeListener('message', onMessage); // 移除message事件指定监听器
channel.removeAllListener('message'); // 移除message事件的所有监听器
```

注意：监听事件和移除事件传入的方法必须是同一个才可以移除指定的监听器，以下为一个正确示例和一个错误示例

```js
// 可以正常移除监听的示例
function onMessage(message) {
  console.log('收到消息：', message);
}
channel.on('message', onMessage);
channel.off('message', onMessage);
```

```js
// 无法正常移除监听的示例
channel.on('message', function (message) {
  console.log('收到消息：', message);
});
channel.off('message', function (message) {
  console.log('收到消息：', message);
});
```

## 云函数 API

[查看完整示例](#完整示例)

### 反序列化消息通道

用法：

```js
const channel = uniCloud.deserializeSSEChannel(data.channel);
```

参数中的 `data.channel` 是客户端在 `callFunction` 时传递的消息通道对象

### 写入消息

用法：

```js
await channel.write(message);
```

### 结束消息通道

用法：

```js
await channel.end(message);
```

注意：message 可以不传

## 完整示例

### 客户端代码示例

```js
// 客户端代码
export default {
  data() {},
  onLoad() {},
  methods: {
    async testSSE() {
      // 创建消息通道
      const channel = new uniCloud.SSEChannel();
      // 监听message事件
      channel.on('message', (message) => {
        console.log('on message', message);
      });
      // 监听end事件，如果云端执行end时传了message，会在客户端end事件内收到传递的消息
      channel.on('end', (message) => {
        console.log('on end', message);
      });
      // 等待通道开启
      await channel.open();
      // 发送请求
      let res = await vk.callFunction({
        name: 'router',
        url: '云函数地址或云对象地址',
        title: '请求中...',
        data: {
          channel: channel,
        },
      });
      console.log('res: ', res);
    },
  },
};
```

### 云函数代码示例

```js
'use strict';
module.exports = {
  /**
   * 测试SSE
   * @url template/test/pub/testSSE 前端调用的url参数地址
   * data 请求参数
   * @param {String} params1  参数1
   */
  main: async (event) => {
    let { data = {}, userInfo, util, originalParam } = event;
    let { config, pubFun, vk, db, _ } = util;
    let { uid } = data;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------

    const channel = uniCloud.deserializeSSEChannel(data.channel);

    await channel.write({
      a: 1,
    });
    await channel.write({
      a: 2,
    });
    await channel.write({
      a: 3,
    });
    await channel.write({
      a: 4,
    });
    await channel.end({
      a: 5,
    });

    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
};
```

### 云对象代码示例

```js
'use strict';
var cloudObject = {
  isCloudObject: true, // 标记为云对象模式
  /**
   * 测试testSSE
   * @url template/pub.test.testSSE 前端调用的url参数地址
   */
  testSSE: async function (data) {
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    const channel = uniCloud.deserializeSSEChannel(data.channel);

    await channel.write({
      a: 1,
    });
    await channel.write({
      a: 2,
    });
    await channel.write({
      a: 3,
    });
    await channel.write({
      a: 4,
    });
    await channel.end({
      a: 5,
    });

    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
};

module.exports = cloudObject;
```

上述云函数/云对象示例客户端会依次收到 message 事件和 end 事件，客户端打印日志如下

```text
on message {a: 1}
on message {a: 2}
on message {a: 3}
on message {a: 4}
on end {a: 5}
```

## 注意事项

> 云函数向客户端发送消息时会使用 push 发送如下格式数据，如果项目中有监听 push 消息请勿错误的处理此类消息。相关文档请参考：[客户端监听推送消息](https://uniapp.dcloud.net.cn/unipush-v2.html#listener)

```js
{
  channel: 'UNI_CLOUD_SSE',
  action: 'message' | 'end',
  seqId: number,
  messageId: number,
  message: any
}
```

开发者使用 push 时可以忽略此类型消息

```js
uni.onPushMessage((res) => {
  const payload = res && res.data && res.data.payload;
  if (typeof payload === 'object' && payload.channel === 'UNI_CLOUD_SSE') {
    // 收到云函数请求中的中间状态通知通道消息，忽略处理此类消息
    return;
  }
});
```
