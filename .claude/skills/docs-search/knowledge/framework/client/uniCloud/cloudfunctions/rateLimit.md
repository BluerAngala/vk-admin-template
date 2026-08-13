---
sidebarDepth: 0
---

# 请求限流

:::warning 注意

vk-unicloud 版本需 ≥ 2.19.9

:::

## 介绍

本限流方案主要用于**业务层面的限流控制**，例如限制某个业务接口（如抢红包、抽奖等）每秒最多可被调用几次等。它适合用于限制用户操作频率，防止用户高频请求某个接口。

vk-unicloud 提供了灵活的限流管理机制，支持多种存储模式（如 MongoDB 和 Redis），可实现精确的请求速率控制和黑名单管理，非常适合 API 接口、用户操作等场景下的限流需求。

**主要特性**

- 支持多种存储模式：可选择基于 Redis 或 MongoDB，推荐使用 Redis，性能更高且限流更精准
- 支持“令牌桶”算法：通过设置桶容量和恢复速率，实现灵活的限流策略
- 多 ID 独立限流：可针对不同的用户 ID、IP 或其他唯一标识做独立限流
- 黑名单机制：支持黑名单功能，对超限用户自动拉黑一段时间，防止短时间内持续恶意请求

**注意事项**

- 推荐使用 Redis 模式进行限流，MongoDB(db)模式性能较低，不适合高并发场景
- 黑名单机制能有效约束恶意用户，但参数设置过严可能影响正常用户体验，请根据实际场景调整配置
- 本限流方案在使用 Redis 时，有一定程度的防御攻击能力，但因限流后，请求依然会先进云函数，所以防御攻击建议使用支付宝云空间提供的网关层面的 IP 防刷

## 示例代码

下方代码只能在云函数或云对象中执行

```js
let bucket_id = '001'; // 桶的id，可以是用户id也可以是ip等

// 获取限流管理对象
// 下方实际功能是：3 秒内请求超过 3 次，则封禁10秒，10秒后自动解除封禁
const rateLimitManage = vk.getRateLimitManage({
  mode: 'redis', //  db：MongoDB数据库 redis：Redis数据库（不推荐用db做限流，推荐使用redis，性能高，限流精准）
  id: bucket_id, // 桶的id，不同的id独立计算限流次数
  maxBucket: 3, // 桶的最大容量（最大令牌数）
  duration: 3, // 恢复满桶需要多少秒
  enableBlackList: true, // 是否启用黑名单机制
  blackListDuration: 10, // 超限后拉黑多少秒
});
// 申请令牌
let rateLimitInfo = await rateLimitManage.acquire();
console.log('rateLimitInfo: ', rateLimitInfo);
if (!rateLimitInfo.allowed) {
  if (rateLimitInfo.isBlackListed) {
    return { code: -1, msg: '请求被限流（在黑名单中）' };
  }
  return { code: -1, msg: '请求被限流' };
}

// 这里写自己的业务

return {
  code: 0,
  msg: '请求成功',
};
```

**前端模拟并发测试**

```js
// 模拟3个并发请求
for (let i = 0; i < 5; i++) {
  vk.callFunction({
    url: '你的云函数地址',
    title: '请求中...',
    data: {
      index: i,
    },
    success: (data) => {},
    fail: (err) => {},
  });
}
```

**最终效果**

![](https://cdn.fsq.pub/vkdoc/vk-client/0ced4e4b-8f8f-430c-bd33-e309cfc19195.png)
