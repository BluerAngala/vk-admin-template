---
sidebarDepth: 0
---

# 本地临时会话缓存

**注意：仅 H5 端支持，其他端均不支持。**

## 前端 js 调用示例

**储存缓存**

```js
vk.setSessionStorageSync(key, value);
```

**获取缓存**

```js
let value = vk.getSessionStorageSync(key);
```

**删除缓存**

```js
vk.removeSessionStorageSync(key);
```

**清空缓存**

```js
vk.clearSessionStorageSync();
```

**清除键值为指定字符串开头的缓存**

```js
vk.clearSessionStorageSync(keyPrefix);
```

## 注意事项

1. 仅 H5 端支持，其他端均不支持

2. 同一个域名，缓存最多存储 5M

3. 不同域名，缓存隔离

4. 同一个浏览器不同的页面窗口，缓存隔离。
