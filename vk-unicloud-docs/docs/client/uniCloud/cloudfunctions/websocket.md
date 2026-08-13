---
sidebarDepth: 0
---

# WebSocket

> vk-unicloud 版本 ≥ 2.18.13
>
> 仅支付宝云（云端）支持
>
> 不支持本地调试
>
> Nodejs 版本 ≥ 18
>
> WebSocket VK 版目前只支持在云对象中使用

## 介绍@introduce

WebSocket 是一种协议，可通过单个 TCP 连接在网络客户端与网络服务器之间提供全双工通信通道。

原本的 callFunction 是一个 http 请求，Ta 只能客户端发给服务端（云端），然后服务端再返回一个响应结果给客户端，但如果客户端不发请求，则服务端无法主动通知客户端，而 WebSocket 不仅客户端能通知服务端，服务端也能主动通知客户端。

云对象 WebSocket 运行原理为客户端请求 WebSocket 网关，由 WebSocket 网关处理连接后转发给指定的云对象，调用云对象内不同的 WebSocket 事件完成事件触发与执行。

**使用场景**

1. 聊天软件
2. 游戏
3. 股票金融交易
4. 其他需要实时交互的场景

**VK 版 WebSocket 优势**

1. 双向加密通信，密文传输数据（注意：此加密通信只能相对安全，无法绝对安全）
2. 适配 VK 框架，支持通过 user_id 发送消息，支持强制用户断开连接，强制用户退出登录等
3. 可以查看在线（与 WebSocket 建立连接未断开）的用户

## 云端 router 添加 WebSocket 依赖代码@router

打开 `router/index.js` 文件，替换代码如下

```js
'use strict';
// 注意：此为云函数路由入口文件，请勿修改此文件代码，你自己的云函数逻辑应写在service目录下
const vkCloud = require('vk-unicloud'); // 引入 vk-unicloud
const vk = vkCloud.createInstance(require('./config.js')); // 通过 vkCloud.createInstance 创建 vk 实例
exports.main = async (event, context) => {
  return await vk.router({ event, context, vk });
};

// router接入webSocket的依赖代码（当前仅支付宝云空间支持）
const ws = vk.getWebSocketManage();
exports.onWebsocketConnection = ws.onWebsocketConnection;
exports.onWebsocketMessage = ws.onWebsocketMessage;
exports.onWebsocketDisConnection = ws.onWebsocketDisConnection;
exports.onWebsocketError = ws.onWebsocketError;
```

## 云端（云对象） WebSocket 事件@cloud-event

### onWebsocketConnection（连接时触发）@onWebsocketConnection

> 当有客户端进行连接时触发

**云对象实现**

函数名：`onWebsocketConnection`

```javascript
module.exports = {
  // 当有客户端进行连接时触发
  onWebsocketConnection: async function (data) {
    console.log('onWebsocketConnection', data);
    let { uid, cid } = this.getClientInfo();
    let userInfo = await this.getUserInfo();
  },
};
```

**入参参数**

data 为前端执行 [vk.connectWebSocket](#vk-connectwebsocket-建立连接) 时传的 data

### onWebsocketMessage（收到消息时触发）@onWebsocketMessage

> 接收到客户端消息时触发

**云对象实现**

函数名：`onWebsocketMessage`

```javascript
module.exports = {
  // 当有客户端发送时触发
  onWebsocketMessage: async function (data) {
    console.log('onWebsocketMessage', data);
    let { uid, cid } = this.getClientInfo();
    let userInfo = await this.getUserInfo();
  },
};
```

**入参参数**

data：值为 [webSocket.send](#websocket-send-发送消息) 发送的 data 的值

### onWebsocketDisConnection（连接断开时触发）@onWebsocketDisConnection

> 连接断开时触发

**云对象实现**

```javascript
module.exports = {
  // 当有客户端断开连接时触发
  onWebsocketDisConnection: async function (data) {
    console.log('onWebsocketDisConnection', data);
    let { uid, cid } = this.getClientInfo();
  },
};
```

**入参参数**

**data**

| 参数 | 类型   | 说明    |
| ---- | ------ | ------- |
| cid  | String | 连接 ID |

### onWebsocketError（连接错误时触发）@onWebsocketError

> 触发其他事件时失败后触发

**云对象实现**

函数名：`onWebsocketError`

```javascript
module.exports = {
  // 当有客户端连接出错时触发
  onWebsocketError: async function (data) {
    console.log('onWebsocketError', data);
    let { uid, cid } = this.getClientInfo();
  },
};
```

**入参参数**

**data**

| 参数   | 类型   | 说明     |
| ------ | ------ | -------- |
| cid    | String | 连接 ID  |
| errMsg | String | 错误信息 |

## 云端（云对象） API@cloud-api

用法：`const ws = this.getWebSocketManage()`

返回值: `WebSocket` 对象实例

### ws.send（发送消息）@cloud-send

> 从云对象中向客户端发送消息

```javascript
const ws = this.getWebSocketManage();
await ws.send({
  encrypt: true,
  user_id: [uid],
  data: {
    a: 1,
    b: '2',
  },
});
```

**参数说明**

| 参数    | 类型          | 说明                                                        |
| ------- | ------------- | ----------------------------------------------------------- |
| data    | Object        | 【必填】发送给客户端的 json 数据                            |
| encrypt | Boolean       | 【选填】是否加密发送                                        |
| cid     | String、Array | 【选填】连接 id, 支持批量向客户端发送消息                   |
| user_id | String、Array | 【选填】用户 id, 支持批量向客户端发送消息                   |
| url     | String        | 【选填】云对象 url 路径，默认不需要传，会自动使用当前云对象 |
| appid   | String、Array | 【选填】dcloud_appid                                        |
| channel | String、Array | 【选填】渠道                                                |

**云对象示例**

```javascript
module.exports = {

  sendTest: async function(data) {
    let { uid } = this.getClientInfo();
    const ws = this.getWebSocketManage();

    // 指定cid发送给单个客户端
    await ws.send({
      encrypt: true,
      cid: [cid],
      data: {
        a: 1,
        b: "2"
      }
    });

    // 指定cid发送给多个客户端
    await ws.send({
      encrypt: true,
      cid: [cid1, cid2, ...],
      data: {
        a: 1,
        b: "2"
      }
    });

    // 指定user_id发送给单个用户（1个用户如果登录多台设备，每台设备都能收到相同消息）
    await ws.send({
      encrypt: true,
      user_id: [uid],
      data: {
        a: 1,
        b: "2"
      }
    });

    // 指定user_id发送给多个用户（1个用户如果登录多台设备，每台设备都能收到相同消息）
    await ws.send({
      encrypt: true,
      user_id: [uid1, uid2, ...],
      data: {
        a: 1,
        b: "2"
      }
    });

    // 发送给客户端二进制数据
    await ws.send({
      encrypt: true,
      user_id: [uid],
      data: Buffer.from(`我是二进制数据`)
    });

    // 发送给客户端二进制数据和其他数据
    await ws.send({
      encrypt: true,
      user_id: [uid],
      data: {
        a: Buffer.from(`我是二进制数据`),
        b: 2
      }
    });

  }
}
```

### ws.close（关闭连接）@cloud-close

> 在云对象中关闭连接

**参数说明**

| 参数    | 类型          | 说明                                                                           |
| ------- | ------------- | ------------------------------------------------------------------------------ |
| cid     | String、Array | 【特殊必填】连接 id, 支持批量向客户端发送消息，`cid` 和 `user_id` 二选一传即可 |
| user_id | String、Array | 【特殊必填】用户 id, 支持批量向客户端发送消息，`cid` 和 `user_id` 二选一传即可 |
| url     | String        | 【选填】云对象 url 路径，默认不需要传，会自动使用当前云对象                    |
| appid   | String、Array | 【选填】dcloud_appid                                                           |
| channel | String、Array | 【选填】渠道                                                                   |

**云对象示例**

```javascript
module.exports = {

  closeTest: async function(data) {
    const ws = this.getWebSocketManage();

    // 根据cid关闭单个连接
    res.url = await ws.close({
    	cid: [cid],
    });

    // 根据cid关闭多个连接
    res.url = await ws.close({
    	cid: [cid1, cid2, ...],
    });

    // 根据user_id来关闭单个连接（1个用户如果登录多台设备，每台设备的连接都断开）
    res.url = await ws.close({
    	user_id: [uid],
    });

    // 根据user_id来关闭多个连接（1个用户如果登录多台设备，每台设备的连接都断开）
    res.url = await ws.close({
    	user_id: [uid1, uid2, ...],
    });

  }
}
```

### ws.isAlive（检测连接是否存活）@cloud-is-alive

> vk-unicloud 版本 ≥ 2.22.0
>
> 在云对象中检测指定连接是否仍处于连接状态

**参数说明**

| 参数    | 类型          | 说明                                                                     |
| ------- | ------------- | ------------------------------------------------------------------------ |
| cid     | String、Array | 【特殊必填】连接 id，支持单个或批量检测，`cid` 和 `user_id` 二选一传即可 |
| user_id | String、Array | 【特殊必填】用户 id，支持单个或批量检测，`cid` 和 `user_id` 二选一传即可 |
| url     | String        | 【选填】云对象 url 路径，默认不需要传，会自动使用当前云对象              |
| appid   | String、Array | 【选填】dcloud_appid                                                     |
| channel | String、Array | 【选填】渠道                                                             |

**说明**

- `cid` 和 `user_id` 不能均为空，二选一传即可
- 通过 `user_id` 查询时会根据该用户当前存在的连接进行存活检测

**云对象示例**

```javascript
module.exports = {
  checkAlive: async function (data) {
    const ws = this.getWebSocketManage();

    // 根据 cid 检测单个连接是否存活
    let res = await ws.isAlive({
      cid: cid,
    });

    // 根据 cid 检测多个连接是否存活
    res = await ws.isAlive({
      cid: [cid1, cid2],
    });

    // 根据 user_id 检测单个用户连接是否存活
    res = await ws.isAlive({
      user_id: uid,
    });

    // 根据 user_id 检测多个用户连接是否存活
    res = await ws.isAlive({
      user_id: [uid1, uid2],
    });

    return res;
  },
};
```

**返回值**

**单个连接检测结果**

| 参数      | 类型    | 说明     |
| --------- | ------- | -------- |
| isAlive   | Boolean | 是否存活 |
| requestID | String  | 请求 ID  |

**批量连接检测结果**

| 参数         | 类型   | 说明               |
| ------------ | ------ | ------------------ |
| aliveCount   | Number | 存活连接数         |
| allCount     | Number | 检测连接总数       |
| aliveConnIds | Array  | 存活连接 ID 列表   |
| deadConnIds  | Array  | 不存活连接 ID 列表 |
| requestID    | String | 请求 ID            |

### ws.signedURL（生成外部连接地址）@cloud-signed-url

> 在云对象中生成 WebSocket 连接地址（可以给其他非 uniapp 客户端连接）

在客户端没有使用 uniCloud SDK 时，可以通过 URL 化在云端生成 WebSocket 连接地址。

```javascript
const ws = this.getWebSocketManage();
res.url = await ws.signedURL();
```

**参数说明**

| 参数  | 类型   | 说明                                                     |
| ----- | ------ | -------------------------------------------------------- |
| name  | String | WebSocket 云函数/云对象名称                              |
| query | Object | 建立连接时需要传递的参数, 仅在 `connection` 事件中接收到 |

**返回值**

WebSocket 连接地址

**示例**

```javascript
module.exports = {
  /**
   * 生成适合与任何客户端连接的签名URL（可在非uniapp项目中连接WebSocket）
   */
  signedURL: async function (data) {
    let res = { code: 0, msg: '' };
    let { uid } = this.getClientInfo(); // 获取客户端信息
    // 业务逻辑开始-----------------------------------------------------------
    const ws = this.getWebSocketManage();
    res.url = await ws.signedURL();
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
};
```

### ws.forceLogout（强制用户退出登录）@cloud-force-logout

> 在云端强制通知客户端退出登录

先在云端执行 ws.forceLogout，然后在前端监听 onVkMessage 事件，执行退出登录逻辑

**云端代码**

```javascript
const ws = this.getWebSocketManage();
await ws.forceLogout({
  user_id: '用户id',
  data: {
    msg: '您已掉线，请重新登录',
  },
});
```

**参数说明**

| 参数    | 类型          | 说明                                                                           |
| ------- | ------------- | ------------------------------------------------------------------------------ |
| cid     | String、Array | 【特殊必填】连接 id, 支持批量向客户端发送消息，`cid` 和 `user_id` 二选一传即可 |
| user_id | String、Array | 【特殊必填】用户 id, 支持批量向客户端发送消息，`cid` 和 `user_id` 二选一传即可 |
| url     | String        | 【选填】云对象 url 路径，默认不需要传，会自动使用当前云对象                    |
| appid   | String、Array | 【选填】dcloud_appid                                                           |
| channel | String、Array | 【选填】渠道                                                                   |

**返回值**

WebSocket 连接地址

**前端代码**

`this.webSocket` 通过执行 [vk.connectWebSocket](#vk-connectwebsocket-建立连接) 获得

```javascript
// 监听vk框架事件
this.webSocket.onVkMessage((data) => {
  console.log('WebSocket:onVkMessage', data);
  // 在连接非pub云对象时，token过期框架会主动断开连接，data.close为true代表已断开连接
  if (data.type === 'forceLogout') {
    // 退出登录
    vk.userCenter.logout({
      success: (data) => {
        // 并跳登录页面
        vk.navigateToLogin();
      },
    });
  }
});
```

## 前端（客户端） API@client-api

:::warning uni-app-x 连接 WebSocket 说明

uni-app-x WebSocket API 暂未实现，仅影响客户端无法生成 WebSocket 连接地址，
可以通过云端 API -> [signedURL](#ws-signedurl-生成外部连接地址) 生成连接地址后，使用 [uni.connectSocket](https://uniapp.dcloud.net.cn/api/request/websocket.html) 连接到 WebSocket 服务

:::

### vk.connectWebSocket（建立连接）@client-connectWebSocket

快速连接 WebSocket 服务

```javascript
const webSocket = await vk.connectWebSocket({
  url: 'template/web-socket/web-socket', // 云对象地址
  encrypt: true, // 是否加密通信
  title: '连接中...',
  data: {},
});
```

**参数说明**

| 参数    | 类型    | 说明                           |
| ------- | ------- | ------------------------------ |
| url     | String  | 【必填】云对象 url 路径        |
| encrypt | Boolean | 【选填】是否加密通信           |
| title   | String  | 【选填】连接时的遮罩 title     |
| data    | Object  | 【选填】发送给云端的 json 数据 |
| channel | String  | 【选填】渠道                   |

**返回值**

WebSocket 对象实例

**示例**

```javascript
// 监听 - 页面每次【加载时】执行(如：前进)
onLoad(options = {}) {
	this.webSocket = await vk.connectWebSocket({
		url: "template/web-socket/web-socket",
		encrypt: true, // 是否加密通信
		title: "连接中...",
		data: {

		}
	});

	// 连接成功时触发
	this.webSocket.onOpen(data => {
		console.log("WebSocket:open", data);

	});

	// 收到数据时触发
	this.webSocket.onMessage(data => {
		console.log("WebSocket:message", data);

	});

	// 监听vk框架事件
	this.webSocket.onVkMessage(data => {
		console.log("WebSocket:onVkMessage", data);
		// 在连接非pub云对象时，token过期框架会主动断开连接，data.close为true代表已断开连接
		if (data.type === "invalidToken") {
			// 主动关闭
			this.webSocket.close({
				code: 1000, // 这里固定1000，表示正常关闭
				reason: data.err.msg
			});
		}
	});

	// 连接被关闭时触发
	this.webSocket.onClose(data => {
		console.log("WebSocket:close", data);

	});

	// 连接因错误而关闭时触发
	this.webSocket.onError(data => {
		console.log("WebSocket:error", data);

	});
},
```

### webSocket.send（发送消息）@client-send

`this.webSocket` 通过执行 [vk.connectWebSocket](#vk-connectwebsocket-建立连接) 获得

```js
this.webSocket.send({
  data: {
    a: 1,
    b: '2',
  },
});
```

### webSocket.close（关闭连接）@client-close

`this.webSocket` 通过执行 [vk.connectWebSocket](#vk-connectwebsocket-建立连接) 获得

```js
this.webSocket.close({
  code: 1000, // 这里固定1000，表示正常关闭
  reason: data.err.msg,
});
```

## 关联的数据表@db

### vk-ws-connection

**在线连接表**

该表保存了当前在线的连接

| 字段名称    | 字段类型 | 必填 | 默认值 | 说明                  |
| ----------- | :------: | :--: | :----: | --------------------- |
| \_id        |  string  |  是  |        | 连接 id，即 cid       |
| `_add_time` |   time   |  是  |        | 创建时间              |
| url         |  string  |  是  |        | 连接的云对象 url 地址 |
| user_id     |  string  |  否  |        | 用户 id               |
| device_id   |  string  |  否  |        | 设备 id               |
| appid       |  string  |  否  |        | dcloud_appid          |

**表初始化索引文件**

在 database 目录新建文件 `vk-ws-connection.index.json`，内容如下

```json
[
  {
    "IndexName": "_add_time",
    "MgoKeySchema": {
      "MgoIndexKeys": [
        {
          "Name": "_add_time",
          "Direction": "1"
        }
      ],
      "MgoIsUnique": false
    }
  },
  {
    "IndexName": "user_id",
    "MgoKeySchema": {
      "MgoIndexKeys": [
        {
          "Name": "user_id",
          "Direction": "1"
        }
      ],
      "MgoIsUnique": false
    }
  },
  {
    "IndexName": "device_id",
    "MgoKeySchema": {
      "MgoIndexKeys": [
        {
          "Name": "device_id",
          "Direction": "1"
        }
      ],
      "MgoIsUnique": false
    }
  }
]
```

再右键 database 目录，初始化数据库，出现弹窗后，所有已存在的表都不要打勾，直接点覆盖选中的表（因为没打勾，只会初始化不存在的表）

## 完整示例@demo

### 云端代码@cloud-demo

```js
'use strict';
let vk = uniCloud.vk; // 全局vk实例
// 涉及的表名
const dbName = {
  //test: "vk-test", // 测试表
};

const db = uniCloud.database(); // 全局数据库引用
const _ = db.command; // 数据库操作符
const $ = _.aggregate; // 聚合查询操作符

/**
 * 权限注意：访问以下链接查看
 * 文档地址：https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html#内置权限
 */
const cloudObject = {
  isCloudObject: true, // 标记为云对象模式
  /**
   * 请求前处理，主要用于调用方法之前进行预处理，一般用于拦截器、统一的身份验证、参数校验、定义全局对象等。
   * 文档地址：https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html#before-预处理
   */
  _before: async function () {
    // let { customUtil, uniID, config, pubFun } = this.getUtil(); // 获取工具包
  },
  /**
   * 请求后处理，主要用于处理本次调用方法的返回结果或者抛出的错误
   * 文档地址：https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html#after-后处理
   */
  _after: async function (options) {
    let { err, res } = options;
    if (err) {
      return; // 如果方法抛出错误，直接return;不处理
    }
    return res;
  },
  // 当有客户端进行连接时触发
  onWebsocketConnection: async function (data) {
    console.log('onWebsocketConnection', data);
    let { uid, cid } = this.getClientInfo(); // 获取客户端信息
    let userInfo = await this.getUserInfo();
  },
  // 当有客户端发送时触发
  onWebsocketMessage: async function (data) {
    console.log('onWebsocketMessage', data);
    let { uid, cid } = this.getClientInfo(); // 获取客户端信息
    let userInfo = await this.getUserInfo();

    const ws = this.getWebSocketManage();
    await ws.send({
      //user_id: [uid], // 消息接收者的uid，不传则发送给所有在线用户
      channel: 'default', // 只发给默认渠道
      encrypt: true,
      data: {
        groupId: data.groupId, // 群ID
        author: {
          _id: uid, // 本条消息的原发送者
          nickname: userInfo.nickname || userInfo.username,
        },
        content: data.content,
      },
    });
  },
  // 当有客户端断开连接时触发
  onWebsocketDisConnection: async function (data) {
    console.log('onWebsocketDisConnection', data);
    let { uid, cid } = this.getClientInfo(); // 获取客户端信息
  },
  // 当有客户端连接出错时触发
  onWebsocketError: async function (data) {
    console.log('onWebsocketError', data);
    let { uid, cid } = this.getClientInfo(); // 获取客户端信息
  },
  /**
   * 模拟云端发送消息
   * @url template/web-socket/web-socket.send 前端调用的url参数地址
   */
  send: async function (data) {
    let res = { code: 0, msg: '' };
    let { uid } = this.getClientInfo(); // 获取客户端信息
    // 业务逻辑开始-----------------------------------------------------------
    const ws = this.getWebSocketManage();
    await ws.send({
      encrypt: true,
      user_id: [uid],
      channel: 'default', // 只发给默认渠道
      data: {
        author: {
          _id: null, // 本条消息的原发送者
          nickname: '系统',
        },
        groupId: data.groupId, // 群ID
        content: `这是只给你发的消息-${Date.now().toString(16)}`,
      },
    });
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
  /**
   * 生成适合与任何客户端连接的签名URL（可在非uniapp项目中连接WebSocket）
   * @url template/web-socket/web-socket.signedURL 前端调用的url参数地址
   */
  signedURL: async function (data) {
    let res = { code: 0, msg: '' };
    let { uid } = this.getClientInfo(); // 获取客户端信息
    // 业务逻辑开始-----------------------------------------------------------
    const ws = this.getWebSocketManage();
    res.url = await ws.signedURL();
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
  /**
   * 云端关闭连接
   * @url template/web-socket/web-socket.close 前端调用的url参数地址
   */
  close: async function (data) {
    let res = { code: 0, msg: '' };
    let { uid } = this.getClientInfo(); // 获取客户端信息
    // 业务逻辑开始-----------------------------------------------------------
    let { cid } = data;
    const ws = this.getWebSocketManage();
    await ws.close({
      user_id: uid, // 关闭该用户所有的连接（这会导致用户的所有设备都会断开连接）
    });
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
  /**
   * 强制退出登录
   * @url template/web-socket/web-socket.forceLogout 前端调用的url参数地址
   */
  forceLogout: async function (data) {
    let res = { code: 0, msg: '' };
    let { uid } = this.getClientInfo(); // 获取客户端信息
    // 业务逻辑开始-----------------------------------------------------------
    let { cid, user_id } = data;

    const ws = this.getWebSocketManage();
    await ws.forceLogout({
      cid,
      user_id,
      data: {
        msg: '您已掉线，请重新登录',
      },
    });

    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
  /**
   * 模板函数
   * @url template/web-socket/web-socket.test 前端调用的url参数地址
   */
  test: async function (data) {
    let res = { code: 0, msg: '' };
    let { uid } = this.getClientInfo(); // 获取客户端信息
    // 业务逻辑开始-----------------------------------------------------------

    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
};

module.exports = cloudObject;
```

### 前端代码@client-demo

注意下方的代码需要改下这 2 个变量的值为你的

```js
cloudObjectUrl: "template/web-socket/web-socket", // 云对象地址
userList: [
  { username: 'test1', password: '123456' }, // 请自己先注册2个账号并添加到这里
  { username: 'test2', password: '123456' }, // 请自己先注册2个账号并添加到这里
],
```

```vue
<template>
  <view class="app">
    <!-- 页面内容开始 -->
    <view class="tips">注意：请用2个浏览器测试，在同一个浏览器无法同时登录2个账号</view>
    <view class="title">切换账号</view>
    <view style="display: flex;">
      <button class="button" @click="login(0)">登录账号1</button>
      <button class="button" @click="login(1)">登录账号2</button>
    </view>
    <view class="title">切换群</view>
    <view style="display: flex;">
      <button class="button" @click="groupId = '001'">切换群1</button>
      <button class="button" @click="groupId = '002'">切换群2</button>
    </view>
    <view class="title">操作</view>
    <!-- 	<button class="button" @click="connectWebSocket()">建立连接</button> -->
    <template v-if="!cid">
      <button class="button" @click="connectWebSocket()">建立连接</button>
      <button class="button" @click="signedURL">建立连接（signedURL方式）</button>
      <button class="button" @click="connectWebSocket2()">模拟测试建立多个连接</button>
    </template>
    <template v-else>
      <view style="display: flex;">
        <button class="button" @click="send">发送一条消息给云端</button>
        <button class="button" @click="receive">云端下发一条消息</button>
      </view>
      <view style="display: flex;">
        <button class="button" @click="closeWebSocket()">客户端断开连接</button>
        <button class="button" @click="closeCloudWebSocket()">云端断开连接</button>
      </view>
      <view style="display: flex;">
        <button class="button" @click="forceLogout({ cid })">强制设备退出登录</button>
        <button class="button" @click="forceLogout({ user_id: vk.getVuex('$user.userInfo._id') })">强制用户退出登录</button>
      </view>
    </template>

    <view class="console-box">
      <view>当前群号：{{ groupId }}</view>
      <view v-for="(item, index) in messageListCom" :key="index">
        <view v-if="vk.pubfn.getData(item, 'author._id') === vk.getVuex('$user.userInfo._id')" class="right"> 我：{{ JSON.stringify(item.content) }} </view>
        <view v-else> {{ vk.pubfn.getData(item, 'author.nickname') }}：{{ JSON.stringify(item.content) }} </view>
      </view>
    </view>

    <!-- 页面内容结束 -->
  </view>
</template>

<script>
  var vk = uni.vk;

  export default {
    data() {
      // 页面数据变量
      return {
        cloudObjectUrl: 'template/web-socket/web-socket', // 云对象地址
        userList: [
          { username: 'test1', password: '123456' }, // 请自己先注册2个账号并添加到这里
          { username: 'test2', password: '123456' }, // 请自己先注册2个账号并添加到这里
        ],

        webSocket: null, // webSocket对象
        cid: '', // 连接id
        messageList: [], // 接收到的消息列表
        groupId: '001', // 默认群id
      };
    },
    // 监听 - 页面每次【加载时】执行(如：前进)
    onLoad(options = {}) {
      vk = uni.vk;
      this.options = options;
      this.init(options);
    },
    // 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
    async onReady() {},
    // 监听 - 页面每次【显示时】执行（如：前进和返回）（页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面）
    onShow() {},
    // 监听 - 页面每次【隐藏时】执行（如：返回）
    onHide() {},
    // 监听 - 页面每次【卸载时】（一般用于取消页面上的监听器）
    onUnload() {
      // 页面卸载时需要关闭 WebSocket 连接
      this.closeWebSocket({
        code: 1000,
        reason: '页面关闭',
      });
    },
    // 监听 - 页面下拉刷新
    onPullDownRefresh() {
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 1000);
    },
    /**
     * 监听 - 点击右上角转发时 文档 https://uniapp.dcloud.io/api/plugins/share?id=onshareappmessage
     * 如果删除onShareAppMessage函数，则微信小程序右上角转发按钮会自动变灰
     */
    onShareAppMessage(options) {},
    // 函数
    methods: {
      // 页面数据初始化函数
      init(options = {}) {
        console.log('init: ', options);
      },
      login(index) {
        let user = this.userList[index];
        vk.userCenter.login({
          data: user,
          success: (data) => {
            vk.toast(`已切换账号${index + 1}`);
            // 主动关闭
            if (this.webSocket) {
              this.webSocket.close({
                code: 1000, // 这里固定1000，表示正常关闭
                reason: '主动关闭',
              });
            }
            // 连接
            this.connectWebSocket();
          },
        });
      },
      async connectWebSocket(obj = {}) {
        this.webSocket = await vk.connectWebSocket({
          url: this.cloudObjectUrl,
          encrypt: true, // 是否加密通信
          title: '连接中...',
          data: {},
          ...obj,
        });
        // 连接成功时触发
        this.webSocket.onOpen((data) => {
          console.log('WebSocket:open', data);
          this.cid = data.cid;
        });

        // 收到数据时触发
        this.webSocket.onMessage((data) => {
          // 正常收到消息
          console.log('WebSocket:message', data);
          this.messageList.push(data);
        });

        // 监听vk框架事件
        this.webSocket.onVkMessage((event) => {
          console.log('WebSocket:onVkMessage', event);
          let { type, data, err } = event;
          // 在连接非pub云对象时，token过期会报错，在这里可以拦截到错误信息
          // 定义跳登录页面，登录成功后再跳回来的函数
          const navigateToLogin = () => {
            let { fullPath } = vk.pubfn.getCurrentPage();
            vk.navigateToLogin({
              redirectUrl: fullPath,
            });
          };
          if (type === 'invalidToken') {
            // 监听token失效事件
            // 关闭连接
            this.closeWebSocket({
              code: 1000, // 这里固定1000，表示正常关闭
              reason: err.msg,
            });
            // 跳登录页面，登录成功后再跳回来
            navigateToLogin();
          } else if (type === 'forceLogout') {
            // 监听强制退出登录事件
            // 退出登录
            vk.userCenter.logout({
              success: (data) => {
                // 跳登录页面，登录成功后再跳回来
                navigateToLogin();
              },
            });
          } else if (type === 'error') {
            // 错误事件
            console.log('err', err);
          }
        });

        // 连接被关闭时触发
        this.webSocket.onClose((data) => {
          console.log('WebSocket:close', data);
          this.webSocket = null;
          this.cid = '';
        });

        // 连接因错误而关闭时触发
        this.webSocket.onError((data) => {
          console.log('WebSocket:error', data);
          this.webSocket = null;
          this.cid = '';
        });
      },
      // 重复连接测试
      connectWebSocket2() {
        // 重复连接相同云对象时，可以通过设置不同的channel来创建新的连接
        this.connectWebSocket({
          channel: 'default',
        });
        // 不同的channel会创建新的连接
        this.connectWebSocket({
          channel: 'test',
        });
        // 重复的channel会复用之前的cid
        this.connectWebSocket({
          channel: 'test',
        });
      },
      // 客户端发送消息给云端
      send() {
        this.webSocket.send({
          data: {
            groupId: this.groupId,
            content: `你好-${Date.now().toString(16)}`,
          },
        });
      },
      // 模拟让云端发送消息给客户端
      receive() {
        vk.callFunction({
          url: `${this.cloudObjectUrl}.send`,
          data: {
            groupId: this.groupId,
          },
          success: (data) => {},
        });
      },
      // 客户端主动关闭连接
      closeWebSocket(data = { code: 1000, reason: '主动关闭' }) {
        if (this.webSocket) {
          this.webSocket.close(data);
          this.webSocket = null;
          this.cid = '';
        }
      },
      // 获取webSocket的已签名的连接地址
      signedURL() {
        vk.callFunction({
          url: `${this.cloudObjectUrl}.signedURL`,
          title: '请求中...',
          data: {},
          success: (data) => {
            this.connectWebSocket({
              url: data.url,
            });
          },
        });
      },
      closeCloudWebSocket() {
        vk.callFunction({
          url: `${this.cloudObjectUrl}.close`,
          title: '请求中...',
          data: {
            cid: this.cid,
          },
          success: (data) => {},
        });
      },
      forceLogout(data) {
        vk.callFunction({
          url: `${this.cloudObjectUrl}.forceLogout`,
          title: '请求中...',
          data,
          success: (data) => {},
        });
      },
    },
    // 监听器
    watch: {},
    // 计算属性
    computed: {
      messageListCom() {
        // 根据群获取消息列表
        let list = this.messageList.filter((item) => item.groupId === this.groupId);
        return list;
      },
    },
  };
</script>
<style lang="scss" scoped>
  .app {
    display: flex;
    flex-direction: column;

    .tips {
      font-size: 12px;
      color: #e43d33;
      padding: 5px 10px;
    }

    .title {
      font-size: 16px;
      font-weight: bold;
      padding: 5px 10px;
    }

    .button {
      margin: 5px;
      font-size: 16px;
      flex: 1;
    }

    .console-box {
      padding: 10px;
      font-size: 12px;
      font-family: monospace;
      .right {
        text-align: right;
      }
    }
  }
</style>
```

## 注意事项@q

### 数据库报表 vk-ws-connection 不存在@q1

请在 `database` 目录新建索引文件 `vk-ws-connection.index.json`，文件内容如下

```json
[
  {
    "IndexName": "_add_time",
    "MgoKeySchema": {
      "MgoIndexKeys": [
        {
          "Name": "_add_time",
          "Direction": "1"
        }
      ],
      "MgoIsUnique": false
    }
  },
  {
    "IndexName": "user_id",
    "MgoKeySchema": {
      "MgoIndexKeys": [
        {
          "Name": "user_id",
          "Direction": "1"
        }
      ],
      "MgoIsUnique": false
    }
  },
  {
    "IndexName": "device_id",
    "MgoKeySchema": {
      "MgoIndexKeys": [
        {
          "Name": "device_id",
          "Direction": "1"
        }
      ],
      "MgoIsUnique": false
    }
  }
]
```

然后右键 `database` 目录，初始化数据库，即可自动创建表和索引（注意：如果弹窗问你是否需要覆盖之前老的表的数据，千万别把老的表打勾）

### 报错，类型错误：Invalid URL@q2

WebSocket 目前只能连接云端运行，无法本地运行。

### 报错，权限不足？@q3

连接 WebSocket 的时候，`onWebsocketConnection`、`onWebsocketMessage`、`onWebsocketDisConnection`、`onWebsocketError` 这 4 个触发事件同样也会经过中间件过滤，如内置的 pub、kh、sys 这 3 个过滤器

### 非 uniapp 客户端连接 websocket 注意事项@q4

通过 [ws.signedURL](#cloud-signed-url) 得到连接地址，并通过 websocket 连接后，需要马上发送一次消息，消息的格式固定如下

```json
{
  "deviceId": "17401305494337804487",
  "data": {
    "url": "template/web-socket/pub.web-socket",
    "channel": "default",
    "uniIdToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwMDEiLCJyb2xlIjpbImFkbWluIl0sInBlcm1pc3Npb24iOltdLCJpYXQiOjE3NDAzODkyMzQsImV4cCI6MTc0MDk5NDAzNH0.wmW5tWfOhznFbGDZGlbZJwtwRXEtwJcqOhZZ1t2U3jY",
    "clientInfo": {
      "deviceId": "17401305494337804487",
      "appid": "__UNI__1333698",
      "platform": "web",
      "locale": "zh-CN",
      "os": "ios",
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
    },
    "data": {
      "vkWebSocket": {
        "type": "connect",
        "data": {}
      }
    }
  }
}
```

下面是各参数介绍

```json
{
  "deviceId": "17401305494337804487", // 设备id，一般情况下与下面的clientInfo.deviceId一致即可（必填）
  "data": {
    "url": "template/web-socket/pub.web-socket", // websocket 云对象地址（必填）
    "channel": "default", // 消息渠道，可自定义任意字符串（选填）
    // 用户的token，如果云对象不是pub类型，就需要带上这个参数（选填）
    "uniIdToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwMDEiLCJyb2xlIjpbImFkbWluIl0sInBlcm1pc3Npb24iOltdLCJpYXQiOjE3NDAzODkyMzQsImV4cCI6MTc0MDk5NDAzNH0.wmW5tWfOhznFbGDZGlbZJwtwRXEtwJcqOhZZ1t2U3jY",
    // 客户端信息
    "clientInfo": {
      "deviceId": "17401305494337804487", // 设备id（必填）
      "appid": "__UNI__1333698", // DCloud应用的appid（必填）
      "platform": "web", // 条件编译的平台，如 web、mp-weixin、mp-alipay、app等（选填）
      "locale": "zh-CN", // 语言（选填）
      "os": "ios", // 操作系统，ios android 等（选填）
      // 浏览器UA（选填）
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
    },
    // 下面是固定的值（必填）
    "data": {
      "vkWebSocket": {
        "type": "connect",
        "data": {
          // 这里可以自定义任意参数
        }
      }
    }
  }
}
```

成功发送这条消息后，vk 框架才能识别为连接成功。

连接成功后，给云对象发送消息的格式如下

```js
{
  "deviceId": "17401305494337804487",
  "data": {
    "url": "template/web-socket/pub.web-socket",
    "channel": "default",
    "uniIdToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwMDEiLCJyb2xlIjpbImFkbWluIl0sInBlcm1pc3Npb24iOltdLCJpYXQiOjE3NDAzODkyMzQsImV4cCI6MTc0MDk5NDAzNH0.wmW5tWfOhznFbGDZGlbZJwtwRXEtwJcqOhZZ1t2U3jY",
    "clientInfo": {
      "deviceId": "17401305494337804487",
      "appid": "__UNI__1333698",
      "platform": "web",
      "locale": "zh-CN",
      "os": "ios",
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
    },
    "data": {
      "a": 1,
      "b": "222",
      "c": {
        "a": 1
      }
    }
  }
}
```

下面是各参数介绍

```js
{
  "deviceId": "17401305494337804487", // 设备id，一般情况下与下面的clientInfo.deviceId一致即可（必填）
  "data": {
    "url": "template/web-socket/pub.web-socket", // websocket 云对象地址（必填）
    "channel": "default", // 消息渠道，可自定义任意字符串（选填）
    // 用户的token，如果云对象不是pub类型，就需要带上这个参数（选填）
    "uniIdToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwMDEiLCJyb2xlIjpbImFkbWluIl0sInBlcm1pc3Npb24iOltdLCJpYXQiOjE3NDAzODkyMzQsImV4cCI6MTc0MDk5NDAzNH0.wmW5tWfOhznFbGDZGlbZJwtwRXEtwJcqOhZZ1t2U3jY",
    // 客户端信息
    "clientInfo": {
      "deviceId": "17401305494337804487", // 设备id（必填）
      "appid": "__UNI__1333698", // DCloud应用的appid（必填）
      "platform": "web", // 条件编译的平台，如 web、mp-weixin、mp-alipay、app等（选填）
      "locale": "zh-CN", // 语言（选填）
      "os": "ios", // 操作系统，ios android 等（选填）
      // 浏览器UA（选填）
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
    },
    // 此data内的数据是你实际要发的数据（必填）
    "data": {
      "a": 1,
      "b": "222",
      "c": {
        "a": 1
      }
    }
  }
}
```
