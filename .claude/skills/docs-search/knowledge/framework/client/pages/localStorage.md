---
sidebarDepth: 0
---

# 本地持久化缓存

## 前端 js 调用示例

**储存缓存**

```js
vk.setStorageSync(key, value);
```

**获取缓存**

```js
let value = vk.getStorageSync(key);
```

**删除缓存**

```js
vk.removeStorageSync(key);
```

**清空缓存**

```js
vk.clearStorageSync();
```

**清除键值为指定字符串开头的缓存**

```js
vk.clearStorageSync(keyPrefix);
```

**获取缓存信息**

```js
let storageInfo = vk.getStorageInfoSync();
```

## 注意事项

1. H5 端为 localStorage，浏览器限制 5M 大小，是缓存概念，可能会被清理

2. App 端为原生的 plus.storage，无大小限制，不是缓存，是持久化的

3. 各个小程序端为其自带的 storage api，数据存储生命周期跟小程序本身一致，即除用户主动删除或超过一定时间被自动清理，否则数据都一直可用。

4. 微信小程序单个 key 允许存储的最大数据长度为 1MB，所有数据存储上限为 10MB。

5. 支付宝小程序单条数据转换成字符串后，字符串长度最大 200\*1024。同一个支付宝用户，同一个小程序缓存总上限为 10MB。

6. 百度小程序策略[详见](https://smartprogram.baidu.com/docs/develop/api/storage/save_process/)、抖音小程序策略[详见](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/data-caching/tt-get-storage)

7. 非 App 平台清空 Storage 会导致 uni.getSystemInfo 获取到的 deviceId 改变
