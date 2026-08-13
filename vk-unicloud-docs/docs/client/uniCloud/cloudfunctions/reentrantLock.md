---
sidebarDepth: 0
---

# 高并发分布式重入锁

> vk-unicloud 版本需 ≥ 2.18.1

## 介绍

重入锁主要用于控制多线程或多进程访问共享资源时的同步，确保同一时间只有一个线程或进程能够访问该资源。

**主要特性**

1. 可重入性：这个锁是可重入的，意味着同一个线程或进程可以多次获取同一把锁，而不会发生死锁。
2. 基于密码的锁定：锁定和解锁操作需要使用一个密码，这个密码在锁实例化时随机生成，确保只有知道密码的线程或进程才能解锁。
3. 分布式锁：这个锁可以用于分布式系统，确保跨多个服务器或实例的同步。
4. 超时机制：锁定操作有一个超时时间，如果超过这个时间，锁将自动释放，防止死锁的发生。

**注意事项**

1. 锁的唯一标识：锁的 id 参数应该确保相对唯一性，以避免不同的资源使用了相同的锁标识导致错误的同步。
2. 超时设置：合理设置超时时间，以确保在异常情况下锁能够被自动释放，同时避免过短的超时导致锁过早释放。

## 示例代码

下方代码只能在云函数或云对象中执行

```js
let lockId = '001'; // 锁的id

// 获得锁的实例
const lockManage = vk.getReentrantLockManage({
  id: lockId, // 锁的id
  timeout: 5, // 锁的超时时间，超时后强制归还锁，单位秒，0代表永不超时，默认5秒
});

// 尝试获取锁
let lock = await lockManage.lock();
if (!lock) {
  return { code: -1, msg: `${lockId}锁已被占用` };
}
// 注意必须 try 包裹，防止自己的代码出现异常，锁无法及时归还
try {
  console.log('自己的逻辑-开始');
  await vk.pubfn.sleep(1000);
  console.log('自己的逻辑-结束');
} finally {
  // 归还锁
  await lock.unlock();
}
return {
  code: 0,
  msg: '成功拿到了锁',
};
```

**前端模拟并发测试**

```js
// 模拟3个并发请求
for (let i = 0; i < 3; i++) {
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

![](https://cdn.fsq.pub/vkdoc/vk-client/529.png)
