# 快速上手 - 安装步骤

## 安装

- 1、右键云函数，选择 `管理公共模块依赖` 菜单，打勾 `uni-cloud-redis` 模块
- 2、安装完成。就是这么简单。

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/438.png)

## 尝试运行第一个 Redis API

**方式一**

```js
const redis = vk.redis();
await redis.set('a', '我是a的值');
let redisRes = await redis.get('a');
```

**方式二**

```js
const redis = uniCloud.redis();
await redis.set('a', '我是a的值');
let redisRes = await redis.get('a');
```

**特别注意：**

- 使用腾讯云 node12 和 redis，务必仔细阅读此文档：[keepRunningAfterReturn](https://uniapp.dcloud.net.cn/uniCloud/cf-functions.html#keep-running)
