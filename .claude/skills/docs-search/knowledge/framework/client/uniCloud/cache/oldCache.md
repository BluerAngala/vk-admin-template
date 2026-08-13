---
sidebarDepth: 0
---

# 云端数据缓存（旧版）

> 此为旧版文档，推荐使用[新版云端数据缓存](https://vkdoc.fsq.pub/client/uniCloud/cache/cache.html)

## 介绍

云端数据缓存是通过`key`，`value`键值对的形式进行数据的储存，通过`key`对数据进行读取

`vk.globalDataCache` 有以下 API

## API

### get（获取方式一）

```js
/**
 * 缓存 - 获取 （方式一）
 * @param {String} key 缓存键值
 */
await vk.globalDataCache.get(key);
```

### get（获取方式二）

```js
/**
 * 缓存 - 获取 （方式二）
 * 如果缓存有值，则读取缓存，如果缓存无值，则执行函数，并将函数return的结果保存到缓存
 * @param {String} key      缓存键值
 * @param {number} second   过期时间(单位:秒) 0或不传代表不自动过期
 * @param {function} fn     缓存无值执行的函数
 */
let requestRes = await vk.globalDataCache.get(key, second, async function () {
  // 若无缓存时，发起http请求，这里也可以写查数据库等操作
  return await vk.request({
    url: `xxxxxxxxx`,
    method: 'GET',
    data: {},
  });
});
```

### set（保存）

```js
/**
 * 缓存 - 保存
 * @param {String} key      缓存键值
 * @param {any} value       缓存内容
 * @param {number} second   过期时间(单位:秒) 0或不传代表不自动过期
 */
await vk.globalDataCache.set(key, value, second);
```

### del（删除）

```js
/**
 * 缓存 - 删除
 * @param {String} key  缓存键值
 */
await vk.globalDataCache.del(key);
```

### clear（清空）

```js
/**
 * 缓存 - 清空
 * @param {String} key key是筛选条件
 */
await vk.globalDataCache.clear(key);
```

### list（获取所有缓存）

```js
/**
 * 缓存 - 获取所有缓存
 * @param {number} pageIndex 页码
 * @param {number} pageSize  每页获取记录数量
 * @param {object} whereJson 查询条件
 * @param {array}  sortArr   排序规则
 */
await vk.globalDataCache.list({
  pageIndex: pageIndex,
  pageSize: pageSize,
  whereJson: whereJson,
  sortArr: sortArr,
});
```

### count（记录总数）

```js
/**
 * 缓存 - 记录总数
 * @param {object} whereJson 查询条件
 */
await vk.globalDataCache.count(whereJson);
```

### deleteExpired（删除过期缓存）

```js
/**
 * 缓存 - 删除已过期的缓存
 */
await vk.globalDataCache.deleteExpired();
```

**注意：目前数据是储存在数据库中的**

## 数据库

### 表名：vk-global-data

| 字段名     | 字段类型 | 必填 | 默认值 | 说明                           |
| ---------- | -------- | ---- | ------ | ------------------------------ |
| \_id       | string   | 是   | -      | 记录 ID，同时=键名 key         |
| \_add_time | time     | 是   | -      | 本条记录添加时间（时间戳形式） |
| key        | string   | 是   | -      | 键名，和\_id 保持一致          |
| value      | any      | 是   | -      | 键值                           |
| comment    | string   |      | -      | 备注                           |
| expired_at | time     |      | -      | 过期时间（0 代表永不过期）     |
