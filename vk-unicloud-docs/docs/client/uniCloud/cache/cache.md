---
sidebarDepth: 0
---

# 云端数据缓存（新版）

:::warning 注意

vk-unicloud 版本需 ≥ 2.18.1，低版本请查看 [老版本文档](./oldCache.md)

:::

## 介绍@intro

云端数据缓存是通过 `key`，`value` 键值对的形式进行数据的储存，通过 `key` 对数据进行读取

新版云端数据缓存同时支持 `空间内置数据库` 和 `redis数据库`，且可以自由切换

**新版主要特性**

1. **兼容性**：新版云端数据缓存同时支持空间内置数据库和 Redis 数据库，用户可以根据需求选择合适的存储方式。
2. **分布式缓存**：同一个云空间下的不同云函数可以共享同一个缓存，便于数据管理和维护。
3. **有效期设置**：用户可以为缓存数据设置一个有效期。如果超过这个时间，缓存数据将自动删除。也可以选择设置数据永久有效。
4. **初始化灵活性**：在调用 API 前，需要初始化实例。用户可以根据需求指定存储模式，如使用空间内置数据库或 Redis 数据库。
5. **配置文件支持**：用户可以在配置文件中设置缓存模式，便于统一管理和切换。
6. **丰富的 API 功能**：提供包括获取缓存（get）、设置缓存（set）、不存在才设置（setnx）、删除缓存（del）、清空缓存（clear）、获取缓存数量（count）、判断缓存是否存在（exists）、修改缓存过期时间（expire）、获取过期时间剩余秒数（ttl）和毫秒数（pttl）等 API，满足不同场景下的需求。

这些特性为用户提供了灵活、高效、可管理的云端数据缓存解决方案，适用于各种复杂的业务场景。

## 初始化实例@init

在调用 API 前，需要先初始化实例

注意：以下 API 均只能在云端运行，前端的本地缓存请查看 [本地持久化缓存](https://vkdoc.fsq.pub/client/pages/localStorage.html) 或 [vuex](https://vkdoc.fsq.pub/client/pages/vuex.html)

```js
const cacheManage = vk.getCacheManage();
```

**指定存储模式**

```js
const cacheManage = vk.getCacheManage({
  mode: 'db',
});
```

**参数**

| 参数 |  类型  | 必填 | 说明                                                                                                               |
| :--: | :----: | :--: | :----------------------------------------------------------------------------------------------------------------- |
| mode | String |  否  | 存储模式，如不填，则自动从配置中获取，可选<br/>db：使用空间内置数据库作为缓存<br/>redis：使用 Redis 数据库作为缓存 |

**配置文件**

配置文件在 `uni-config-center/vk-unicloud/index.js` 下的 `cacheManage` 节点

```js
"cacheManage": {
	/**
	 * 可选 db、redis
	 * db 使用空间内置数据库作为缓存
	 * redis 使用Redis数据库作为缓存
	 */
	"mode": "db",
},
```

## API

### get（获取缓存）@get

```js
let value = await cacheManage.get(key);
```

**参数**

| 参数 |  类型  | 必填 |    说明    |
| :--: | :----: | :--: | :--------: |
| key  | string |  是  | 缓存的键名 |

**返回值**

缓存内容

### set（设置缓存）@set

```js
await cacheManage.set(key, value, second);
```

**参数**

|  参数  |  类型  | 必填 |                 说明                 |
| :----: | :----: | :--: | :----------------------------------: |
|  key   | string |  是  |              缓存的键名              |
| value  |  any   |  是  |               缓存的值               |
| second | number |  否  | 缓存过期时间，单位秒，0 代表永不过期 |

**返回值**

| 参数 |  类型  |           说明           |
| :--: | :----: | :----------------------: |
| code | number | 0 代表成功，其他均为失败 |
| msg  | string |         失败原因         |
| mode | string |   add 添加 update 修改   |
| key  | string |        缓存的键名        |

### setnx（不存在才设置）@setnx

只有在 key 不存在时才设置 key 的值。

```js
let setnxRes = await cacheManage.setnx(key, value, second);
```

**参数**

|  参数  |  类型  | 必填 |                 说明                 |
| :----: | :----: | :--: | :----------------------------------: |
|  key   | string |  是  |              缓存的键名              |
| value  |  any   |  是  |               缓存的值               |
| second | number |  否  | 缓存过期时间，单位秒，0 代表永不过期 |

**返回值**

| 参数 |  类型  |           说明           |
| :--: | :----: | :----------------------: |
| code | number | 0 代表成功，其他均为失败 |
| msg  | string |         失败原因         |
| key  | string |        缓存的键名        |

### del（删除缓存）@del

```js
await cacheManage.del(key);
```

**参数**

| 参数 |  类型  | 必填 |    说明    |
| :--: | :----: | :--: | :--------: |
| key  | string |  是  | 缓存的键名 |

**返回值**

受影响的记录数

### clear（清空缓存）@clear

```js
await cacheManage.clear(prefix);
```

**参数**

|  参数  |  类型  | 必填 |      说明      |
| :----: | :----: | :--: | :------------: |
| prefix | string |  是  | 缓存的键名前缀 |

**返回值**

受影响的记录数

### count（获取缓存数量）@count

```js
await cacheManage.count(prefix);
```

**参数**

|  参数  |  类型  | 必填 |      说明      |
| :----: | :----: | :--: | :------------: |
| prefix | string |  是  | 缓存的键名前缀 |

**返回值**

记录数

### exists（判断缓存是否存在）@exists

```js
await cacheManage.exists(key);
```

**参数**

| 参数 |  类型  | 必填 |    说明    |
| :--: | :----: | :--: | :--------: |
| key  | string |  是  | 缓存的键名 |

**返回值**

1：存在 0：不存在

### expire（修改缓存过期时间）@expire

```js
await cacheManage.expire(key, seconds);
```

**参数**

|  参数  |  类型  | 必填 |                     说明                      |
| :----: | :----: | :--: | :-------------------------------------------: |
|  key   | string |  是  |                  缓存的键名                   |
| second | number |  否  | 缓存过期时间，单位秒，不填或填 0 代表永不过期 |

**返回值**

1：成功 0：失败

### ttl（获取过期时间剩余多少秒）@ttl

```js
await cacheManage.ttl(key);
```

**参数**

| 参数 |  类型  | 必填 |    说明    |
| :--: | :----: | :--: | :--------: |
| key  | string |  是  | 缓存的键名 |

**返回值**

秒数

### pttl（获取过期时间剩余多少毫秒）@pttl

```js
await cacheManage.pttl(key);
```

**参数**

| 参数 |  类型  | 必填 |    说明    |
| :--: | :----: | :--: | :--------: |
| key  | string |  是  | 缓存的键名 |

**返回值**

毫秒数
