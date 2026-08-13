# Redis 开发文档

## 获取 redis 对象

- 调用示例

```js
const redis = vk.redis();
```

也可以通过 `uniCloud.redis()` 获得 redis 实例

```js
const redis = uniCloud.redis();
```

## 字符串类型（String）

### get

用于获取字符串类型的数据

- 调用示例

```js
await redis.get(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### set

用于设置字符串类型数据，新增、修改均可

- 调用示例

```js
await redis.set(key, value);
await redis.set(key, value, flag);
await redis.set(key, value, mode, duration);
await redis.set(key, value, mode, duration, flag);
```

```js
await redis.set('key', 1); // redis内存储为字符串"1"
await redis.set('key', '1', 'NX'); // key不存在时设置为1
await redis.set('key', '1', 'EX', 100); // key 100秒后过期
await redis.set('key', '1', 'EX', 100, 'NX'); // key不存在时设置为1，过期时间设置为100秒
```

- 参数说明

| 参数     | 说明                                                 | 类型   | 必填                        | 说明                     |
| -------- | ---------------------------------------------------- | ------ | --------------------------- | ------------------------ |
| key      | 键名                                                 | String | 是                          | -                        |
| value    | 值                                                   | String | 是                          | -                        |
| flag     | 区分状态进行 SET NX：不存在时才设置 XX：存在时才设置 | String | 否                          | -                        |
| mode     | 标识 duration 的单位                                 | String | 否（duration 不为空时必填） | EX：单位秒，PX：单位毫秒 |
| duration | 过期时间，到期后自动删除                             | Number | 否                          | -                        |

### getrange

返回 key 中字符串值的子字符(类似 substring)

- 调用示例

```js
await redis.getrange(key, start, end);
```

- 参数说明

| 参数  | 说明     | 类型   | 必填 | 说明                                                           |
| ----- | -------- | ------ | ---- | -------------------------------------------------------------- |
| key   | 键名     | String | 是   | -                                                              |
| start | 起始位置 | Number | 是   | (0 代表第一个字符,-1 代表最后 1 个字符,-2 代表最后第 2 个字符) |
| end   | 结束位置 | Number | 是   | (0 代表第一个字符,-1 代表最后 1 个字符,-2 代表最后第 2 个字符) |

### getset

将给定 key 的值设为 value ，并返回 key 的旧值(old value)。

- 调用示例

```js
await redis.getset(key, value);
```

- 参数说明

| 参数  | 说明 | 类型   | 必填 | 说明 |
| ----- | ---- | ------ | ---- | ---- |
| key   | 键名 | String | 是   | -    |
| value | 值   | String | 是   | -    |

### mget

批量获取指定键的值

- 调用示例

```js
await redis.mget(key1, key2, ...);
```

### setex

将值 value 关联到 key ，并将 key 的过期时间设为 seconds (以秒为单位)。

- 调用示例

```js
await redis.setex(key, seconds, value);
```

- 参数说明

| 参数    | 说明 | 类型   | 必填 | 说明     |
| ------- | ---- | ------ | ---- | -------- |
| key     | 键名 | String | 是   | -        |
| seconds | 值   | Number | 是   | 单位为秒 |
| value   | 值   | String | 是   | -        |

### setnx

只有在 key 不存在时才设置 key 的值。

- 调用示例

```js
await redis.setnx(key, value);
```

- 参数说明

| 参数  | 说明 | 类型   | 必填 | 说明 |
| ----- | ---- | ------ | ---- | ---- |
| key   | 键名 | String | 是   | -    |
| value | 值   | String | 是   | -    |

### strlen

返回 key 所储存的字符串值的长度。

- 调用示例

```js
await redis.strlen(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### mset

批量设置键值

- 调用示例

```js
await redis.mset(key1, value1, key2, value2);
```

### msetnx

批量设置键值，当且仅当所有给定 key 都不存在。

- 调用示例

```js
await redis.msetnx(key1, value1, key2, value2);
```

### psetex

这个命令和 setex 命令相似，但它以毫秒为单位设置 key 的生存时间，而不是像 setex 命令那样，以秒为单位。

- 调用示例

```js
await redis.psetex(key, milliseconds, value);
```

- 参数说明

| 参数         | 说明 | 类型   | 必填 | 说明       |
| ------------ | ---- | ------ | ---- | ---------- |
| key          | 键名 | String | 是   | -          |
| milliseconds | 值   | Number | 是   | 单位为毫秒 |
| value        | 值   | String | 是   | -          |

### incr

对指定的键执行加 1 操作，并返回加 1 后的值

- 调用示例

```js
await redis.incr(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### incrby

在指定的键上加一个整数，并返回更新后的值

- 调用示例

```js
await redis.incrby(key, increment);
```

- 参数说明

| 参数      | 说明                          | 类型   | 必填 | 说明 |
| --------- | ----------------------------- | ------ | ---- | ---- |
| key       | 键名                          | String | 是   | -    |
| increment | 整数，>0 代表增加 <0 代表减少 | Number | 是   | -    |

### incrbyfloat

在指定的键上加一个浮点数，并返回更新后的值

- 调用示例

```js
await redis.incrbyfloat(key, increment);
```

- 参数说明

| 参数      | 说明                            | 类型   | 必填 | 说明 |
| --------- | ------------------------------- | ------ | ---- | ---- |
| key       | 键名                            | String | 是   | -    |
| increment | 浮点数，>0 代表增加 <0 代表减少 | Number | 是   | -    |

### decrby

在指定的键上减一个整数，并返回更新后的值

- 调用示例

```js
await redis.decrby(key, increment);
```

- 参数说明

| 参数      | 说明                          | 类型   | 必填 | 说明 |
| --------- | ----------------------------- | ------ | ---- | ---- |
| key       | 键名                          | String | 是   | -    |
| increment | 整数，>0 代表减少 <0 代表增加 | Number | 是   | -    |

### append

如果 key 已经存在并且是一个字符串， APPEND 命令将指定的 value 追加到该 key 原来值（value）的末尾。

- 调用示例

```js
await redis.append(key, value);
```

- 参数说明

| 参数  | 说明         | 类型   | 必填 | 说明 |
| ----- | ------------ | ------ | ---- | ---- |
| key   | 键名         | String | 是   | -    |
| value | 需要追加的值 | String | 是   | -    |

## 键（key）

### del

用于删除执行的键

- 调用示例

```js
await redis.del(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### dump

用于序列化给定 key ，并返回被序列化的值。

- 调用示例

```js
await redis.dump(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### exists

判断一个键是否存在

- 调用示例

```js
await redis.exists(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### expire

设置一个键的过期时间

- 调用示例

```js
await redis.expire(key, seconds);
```

- 参数说明

| 参数    | 说明     | 类型   | 必填 | 说明              |
| ------- | -------- | ------ | ---- | ----------------- |
| key     | 键名     | String | 是   | -                 |
| seconds | 过期时间 | Number | 是   | 单位秒,只能是整数 |

### expireat

EXPIREAT 的作用和 EXPIRE 类似，都用于为 key 设置过期时间。 不同在于 EXPIREAT 命令接受的时间参数是 UNIX 时间戳(unix timestamp)。

- 调用示例

```js
await redis.expireat(key, timestamp);
```

- 参数说明

| 参数      | 说明   | 类型   | 必填 | 说明                 |
| --------- | ------ | ------ | ---- | -------------------- |
| key       | 键名   | String | 是   | -                    |
| timestamp | 时间戳 | Number | 是   | 注意此时间戳不含毫秒 |

### pexpire

设置 key 的过期时间以毫秒计。

- 调用示例

```js
await redis.pexpire(key, milliseconds);
```

- 参数说明

| 参数         | 说明     | 类型   | 必填 | 说明     |
| ------------ | -------- | ------ | ---- | -------- |
| key          | 键名     | String | 是   | -        |
| milliseconds | 过期时间 | Number | 是   | 单位毫秒 |

### pexpireat

设置 key 过期时间的时间戳(unix timestamp) 以毫秒计

- 调用示例

```js
await redis.pexpireat(key, timestamp);
```

- 参数说明

| 参数      | 说明   | 类型   | 必填 | 说明               |
| --------- | ------ | ------ | ---- | ------------------ |
| key       | 键名   | String | 是   | -                  |
| timestamp | 时间戳 | Number | 是   | 注意此时间戳含毫秒 |

### keys

查找所有符合给定模式( pattern)的 key 。如查询 a 开头的 key

- 调用示例

```js
await redis.keys(patten: string)
await redis.keys("a*");
```

- 参数说明

| 参数    | 说明   | 类型   | 必填 | 说明 |
| ------- | ------ | ------ | ---- | ---- |
| pattern | 表达式 | String | 是   | -    |

### move

将当前数据库的 key 移动到给定的数据库 db 当中。

- 调用示例

```js
await redis.move(key, db);
```

- 参数说明

| 参数 | 说明             | 类型   | 必填 | 说明 |
| ---- | ---------------- | ------ | ---- | ---- |
| key  | 键名             | String | 是   | -    |
| db   | redis 的 dbIndex | String | 是   | -    |

### persist

移除 key 的过期时间，key 将持久保持。

- 调用示例

```js
await redis.persist(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### pttl

获取过期时间剩余多少毫秒

- 调用示例

```js
await redis.pttl(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### ttl

获取过期时间剩余多少秒

- 调用示例

```js
await redis.ttl(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### randomkey

从当前数据库中随机返回一个 key 。

- 调用示例

```js
await redis.randomkey();
```

### rename

修改 key 的名称

- 调用示例

```js
await redis.rename(key, newkey);
```

- 参数说明

| 参数   | 说明     | 类型   | 必填 | 说明 |
| ------ | -------- | ------ | ---- | ---- |
| key    | 键名     | String | 是   | -    |
| newkey | 新的键名 | String | 是   | -    |

### renamenx

仅当 newkey 不存在时，将 key 改名为 newkey 。

- 调用示例

```js
await redis.renamenx(key, newkey);
```

- 参数说明

| 参数   | 说明     | 类型   | 必填 | 说明 |
| ------ | -------- | ------ | ---- | ---- |
| key    | 键名     | String | 是   | -    |
| newkey | 新的键名 | String | 是   | -    |

### scan

迭代数据库中的数据库键。

- 调用示例

```js
await redis.scan(cursor);
await redis.scan(0, 'match', 'a*');
```

- 参数说明

| 参数   | 说明 | 类型   | 必填 | 说明 |
| ------ | ---- | ------ | ---- | ---- |
| cursor | 游标 | String | 是   | -    |

### type

返回 key 所储存的值的类型。

- 调用示例

```js
await redis.type(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

## 列表类型（List）

### rpush

在 List 类型数据结尾追加数据

- 调用示例

```js
await redis.rpush(key, value);
```

- 参数说明

| 参数  | 说明 | 类型   | 必填 | 说明 |
| ----- | ---- | ------ | ---- | ---- |
| key   | 键名 | String | 是   | -    |
| value | 值   | String | 是   | -    |

### rpushx

用法同 rpush，仅在 list 存在时才在 List 结尾追加数据

- 调用示例

```js
await redis.rpushx(key, value);
```

- 参数说明

| 参数  | 说明 | 类型   | 必填 | 说明 |
| ----- | ---- | ------ | ---- | ---- |
| key   | 键名 | String | 是   | -    |
| value | 值   | String | 是   | -    |

### rpop

从 List 类型数据结尾删除一条数据，并返回删除的值

- 调用示例

```js
await redis.rpop(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### rpoplpush

移除列表的最后一个元素，并将该元素添加到另一个列表并返回。

- 调用示例

```js
await redis.rpoplpush(key1, key2);
```

- 参数说明

| 参数 | 说明         | 类型   | 必填 | 说明 |
| ---- | ------------ | ------ | ---- | ---- |
| key1 | 键名         | String | 是   | -    |
| key2 | 另一个的键名 | String | 是   | -    |

### lpush

在 List 类型数据开头追加数据

- 调用示例

```js
await redis.lpush(key, value);
```

- 参数说明

| 参数  | 说明 | 类型   | 必填 | 说明 |
| ----- | ---- | ------ | ---- | ---- |
| key   | 键名 | String | 是   | -    |
| value | 值   | String | 是   | -    |

### lpushx

用法同 lpush，仅在 list 存在时才在 List 开头追加数据

- 调用示例

```js
await redis.lpushx(key, value);
```

- 参数说明

| 参数  | 说明 | 类型   | 必填 | 说明 |
| ----- | ---- | ------ | ---- | ---- |
| key   | 键名 | String | 是   | -    |
| value | 值   | String | 是   | -    |

### lpop

从 List 类型数据开头删除一条数据，并返回删除的值

- 调用示例

```js
await redis.lpop(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### linsert

在 List 内指定元素位置前或后插入元素，未匹配到指定元素时不插入

- 调用示例

```js
await redis.linsert(key, dir, pivot, value);
```

- 参数说明

| 参数  | 说明                    | 类型   | 必填 | 说明 |
| ----- | ----------------------- | ------ | ---- | ---- |
| key   | 键名                    | String | 是   | -    |
| dir   | BEFORE:之前 AFTER :之后 | String | 是   | -    |
| pivot | 数组的 index            | String | 是   | -    |
| value | 要插入的值              | String | 是   | -    |

### lindex

获取 List 内指定下标的元素

- 调用示例

```js
await redis.lindex(key, index);
```

- 参数说明

| 参数  | 说明     | 类型   | 必填 | 说明 |
| ----- | -------- | ------ | ---- | ---- |
| key   | 键名     | String | 是   | -    |
| index | 数组下标 | Number | 是   | -    |

### llen

返回 List 的长度

- 调用示例

```js
await redis.llen(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### lrange

返回列表中指定区间内的元素，区间以偏移量 START 和 END 指定。
其中 0 表示列表的第一个元素， 1 表示列表的第二个元素，以此类推。 你也可以使用负数下标，以 -1 表示列表的最后一个元素， -2 表示列表的倒数第二个元素，以此类推。

- 调用示例

```js
await redis.lrange(key, start, end);
```

- 参数说明

| 参数  | 说明     | 类型   | 必填 | 说明 |
| ----- | -------- | ------ | ---- | ---- |
| key   | 键名     | String | 是   | -    |
| start | 起始下标 | Number | 是   | -    |
| end   | 结束下标 | Number | 是   | -    |

### lrem

根据参数 COUNT 的值，移除列表中与参数 VALUE 相等的元素。返回移除的数量

- COUNT 的值可以是以下几种：
- count > 0 : 从表头开始向表尾搜索，移除与 VALUE 相等的元素，数量为 COUNT 。
- count < 0 : 从表尾开始向表头搜索，移除与 VALUE 相等的元素，数量为 COUNT 的绝对值。
- count = 0 : 移除表中所有与 VALUE 相等的值。

* 调用示例

```js
await redis.lrem(key, count, value);
```

- 参数说明

| 参数  | 说明              | 类型   | 必填 | 说明 |
| ----- | ----------------- | ------ | ---- | ---- |
| key   | 键名              | String | 是   | -    |
| count | 见上方 count 说明 | Number | 是   | -    |
| value | 值                | String | 是   | -    |

### lset

通过索引来设置元素的值。成功返回 OK

当索引参数超出范围，或对一个空列表进行 LSET 时，返回一个错误。

- 调用示例

```js
await redis.lset(key, index, value);
```

- 参数说明

| 参数  | 说明       | 类型   | 必填 | 说明 |
| ----- | ---------- | ------ | ---- | ---- |
| key   | 键名       | String | 是   | -    |
| index | 数组的下标 | Number | 是   | -    |
| value | 值         | String | 是   | -    |

### ltrim

对一个列表进行修剪(trim)，就是说，让列表只保留指定区间内的元素，不在指定区间之内的元素都将被删除。

下标 0 表示列表的第一个元素，以 1 表示列表的第二个元素，以此类推。 你也可以使用负数下标，以 -1 表示列表的最后一个元素， -2 表示列表的倒数第二个元素，以此类推。

- 调用示例

```js
await redis.ltrim(key, start, end);
```

- 参数说明

| 参数  | 说明     | 类型   | 必填 | 说明 |
| ----- | -------- | ------ | ---- | ---- |
| key   | 键名     | String | 是   | -    |
| start | 起始下标 | Number | 是   | -    |
| end   | 结束下标 | Number | 是   | -    |

### blpop

移出并获取列表的第一个元素， 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。

如果列表为空，返回一个 nil 。 否则，返回一个含有两个元素的列表，第一个元素是被弹出元素所属的 key ，第二个元素是被弹出元素的值。

- 调用示例

```js
await redis.blpop(key, seconds);
```

- 参数说明

| 参数    | 说明           | 类型   | 必填 | 说明 |
| ------- | -------------- | ------ | ---- | ---- |
| key     | 键名           | String | 是   | -    |
| seconds | 最多等待多时秒 | Number | 是   | -    |

### brpop

移出并获取列表的最后一个元素， 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。

假如在指定时间内没有任何元素被弹出，则返回一个 nil 和等待时长。 反之，返回一个含有两个元素的列表，第一个元素是被弹出元素所属的 key ，第二个元素是被弹出元素的值。

- 调用示例

```js
await redis.brpop(key, seconds);
```

- 参数说明

| 参数    | 说明           | 类型   | 必填 | 说明 |
| ------- | -------------- | ------ | ---- | ---- |
| key     | 键名           | String | 是   | -    |
| seconds | 最多等待多时秒 | Number | 是   | -    |

### brpoplpush

从列表中取出最后一个元素，并插入到另外一个列表的头部； 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。

假如在指定时间内没有任何元素被弹出，则返回一个 nil 和等待时长。 反之，返回一个含有两个元素的列表，第一个元素是被弹出元素的值，第二个元素是等待时长。

- 调用示例

```js
await redis.brpoplpush(key1, key2, seconds);
```

- 参数说明

| 参数    | 说明           | 类型   | 必填 | 说明 |
| ------- | -------------- | ------ | ---- | ---- |
| key1    | 键名           | String | 是   | -    |
| key2    | 键名           | String | 是   | -    |
| seconds | 最多等待多时秒 | Number | 是   | -    |

## hash（类似 json)

类似 json，但键和值必须是 String

### hget

获取 hash 对象中某个键的值

- 调用示例

```js
await redis.hget(key, name);
```

- 参数说明

| 参数 | 说明              | 类型   | 必填 | 说明 |
| ---- | ----------------- | ------ | ---- | ---- |
| key  | redis 键名        | String | 是   | -    |
| name | hash 对象中的键名 | String | 是   | -    |

### hset

设置 hash 对象

- 调用示例

```js
await redis.hset(key, json);
await redis.hset(key, name, value);
```

- 参数说明

| 参数  | 说明                                      | 类型   | 必填 | 说明 |
| ----- | ----------------------------------------- | ------ | ---- | ---- |
| key   | redis 键名                                | String | 是   | -    |
| name  | hash 对象中的键名                         | String | 是   | -    |
| json  | 在 name 不传的情况下，可以直接传整个 json | String | 是   | -    |
| value | hash 对象中的键名对应的值                 | String | 是   | -    |

### hmget

获取多个 hash 的值

- 调用示例

```js
 await redis.hmget(key, name1, name2, ...);
```

- 参数说明

| 参数  | 说明              | 类型   | 必填 | 说明 |
| ----- | ----------------- | ------ | ---- | ---- |
| key   | redis 键名        | String | 是   | -    |
| name1 | hash 对象中的键名 | String | 是   | -    |
| name2 | hash 对象中的键名 | String | 是   | -    |

### hgetall

获取整个 hash 对象

- 调用示例

```js
await redis.hgetall(key);
```

- 参数说明

| 参数 | 说明       | 类型   | 必填 | 说明 |
| ---- | ---------- | ------ | ---- | ---- |
| key  | redis 键名 | String | 是   | -    |

### hdel

删除一个或多个哈希表字段

- 调用示例

```js
await redis.hdel(key, name1, name2);
```

- 参数说明

| 参数  | 说明              | 类型   | 必填 | 说明 |
| ----- | ----------------- | ------ | ---- | ---- |
| key   | redis 键名        | String | 是   | -    |
| name1 | hash 对象中的键名 | String | 是   | -    |
| name2 | hash 对象中的键名 | String | 是   | -    |

### hexists

查看哈希表 key 中，指定的字段是否存在。

- 调用示例

```js
await redis.hexists(key, name);
```

- 参数说明

| 参数 | 说明              | 类型   | 必填 | 说明 |
| ---- | ----------------- | ------ | ---- | ---- |
| key  | redis 键名        | String | 是   | -    |
| name | hash 对象中的键名 | String | 是   | -    |

### hincrby

为哈希表 key 中的指定字段的整数值加上增量 increment 。

- 调用示例

```js
await redis.hincrby(key, name, increment);
```

- 参数说明

| 参数      | 说明              | 类型   | 必填 | 说明 |
| --------- | ----------------- | ------ | ---- | ---- |
| key       | redis 键名        | String | 是   | -    |
| name      | hash 对象中的键名 | String | 是   | -    |
| increment | 增量 increment    | Number | 是   | -    |

### hincrbyfloat

为哈希表 key 中的指定字段的浮点数值加上增量 increment 。

- 调用示例

```js
await redis.hincrbyfloat(key, name, increment);
```

- 参数说明

| 参数      | 说明              | 类型   | 必填 | 说明 |
| --------- | ----------------- | ------ | ---- | ---- |
| key       | redis 键名        | String | 是   | -    |
| name      | hash 对象中的键名 | String | 是   | -    |
| increment | 增量 increment    | Number | 是   | -    |

### hkeys

获取所有哈希表中的字段

- 调用示例

```js
await redis.hkeys(key);
```

- 参数说明

| 参数 | 说明       | 类型   | 必填 | 说明 |
| ---- | ---------- | ------ | ---- | ---- |
| key  | redis 键名 | String | 是   | -    |

### hlen

获取哈希表中字段的数量

- 调用示例

```js
await redis.hlen(key);
```

- 参数说明

| 参数 | 说明       | 类型   | 必填 | 说明 |
| ---- | ---------- | ------ | ---- | ---- |
| key  | redis 键名 | String | 是   | -    |

### hsetnx

只有在字段 field 不存在时，设置哈希表字段的值。

- 调用示例

```js
await redis.hset(key, json);
await redis.hset(key, name, value);
```

- 参数说明

| 参数  | 说明                                      | 类型   | 必填 | 说明 |
| ----- | ----------------------------------------- | ------ | ---- | ---- |
| key   | redis 键名                                | String | 是   | -    |
| name  | hash 对象中的键名                         | String | 是   | -    |
| json  | 在 name 不传的情况下，可以直接传整个 json | String | 是   | -    |
| value | hash 对象中的键名对应的值                 | String | 是   | -    |

### hvals

获取哈希表中所有值。

- 调用示例

```js
await redis.hvals(key);
```

- 参数说明

| 参数 | 说明       | 类型   | 必填 | 说明 |
| ---- | ---------- | ------ | ---- | ---- |
| key  | redis 键名 | String | 是   | -    |

### hscan

迭代集合中的元素

- 调用示例

```js
await redis.hscan(key, cursor);
await redis.hscan(key, 0, 'match', 'a*');
```

- 参数说明

| 参数   | 说明 | 类型   | 必填 | 说明 |
| ------ | ---- | ------ | ---- | ---- |
| key    | 键名 | String | 是   | -    |
| cursor | 游标 | Number | 是   | -    |

## 集合（set）

set 类似 不可重复的 字符串数组

### sadd

向集合添加一个或多个成员

- 调用示例

```js
await redis.sadd(key, value1, value2);
```

- 参数说明

| 参数   | 说明 | 类型   | 必填 | 说明 |
| ------ | ---- | ------ | ---- | ---- |
| key    | 键名 | String | 是   | -    |
| value1 | 值   | String | 是   | -    |
| value2 | 值   | String | 是   | -    |

### scard

获取集合的成员数量（length）

- 调用示例

```js
await redis.scard(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### sdiff

返回第一个集合与其他集合之间的差异。(key1 有,key2 没有的值)

- 调用示例

```js
await redis.sdiff(key1, key2);
```

- 参数说明

| 参数 | 说明   | 类型   | 必填 | 说明 |
| ---- | ------ | ------ | ---- | ---- |
| key1 | 键名 1 | String | 是   | -    |
| key2 | 键名 2 | String | 是   | -    |

### sdiffstore

返回给定所有集合的差集并存储在 destination 中

- 调用示例

```js
await redis.sdiffstore(destination, key1, key2);
```

- 参数说明

| 参数        | 说明           | 类型   | 必填 | 说明 |
| ----------- | -------------- | ------ | ---- | ---- |
| destination | 需要存储的键名 | String | 是   | -    |
| key1        | 键名 1         | String | 是   | -    |
| key2        | 键名 2         | String | 是   | -    |

### sinter

返回给定所有集合的交集(key1 和 key2 都有的值)

- 调用示例

```js
await redis.sinter(key1, key2);
```

- 参数说明

| 参数 | 说明   | 类型   | 必填 | 说明 |
| ---- | ------ | ------ | ---- | ---- |
| key1 | 键名 1 | String | 是   | -    |
| key2 | 键名 2 | String | 是   | -    |

### sinterstore

返回给定所有集合的交集并存储在 destination 中

- 调用示例

```js
await redis.sinterstore(destination, key1, key2);
```

- 参数说明

| 参数        | 说明           | 类型   | 必填 | 说明 |
| ----------- | -------------- | ------ | ---- | ---- |
| destination | 需要存储的键名 | String | 是   | -    |
| key1        | 键名 1         | String | 是   | -    |
| key2        | 键名 2         | String | 是   | -    |

### sismember

判断 member 元素是否是集合 key 的成员 是返回 1 不是返回 0

- 调用示例

```js
await redis.sismember(key, member);
```

- 参数说明

| 参数   | 说明   | 类型   | 必填 | 说明 |
| ------ | ------ | ------ | ---- | ---- |
| key    | 键名   | String | 是   | -    |
| member | 元素值 | String | 是   | -    |

### smembers

返回集合中的所有成员

- 调用示例

```js
await redis.smembers(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### smove

将 member 元素从 source 集合移动到 destination 集合

- 调用示例

```js
await redis.smove(source, destination, member);
```

- 参数说明

| 参数        | 说明               | 类型   | 必填 | 说明 |
| ----------- | ------------------ | ------ | ---- | ---- |
| source      | 被移动的集合键名   | String | 是   | -    |
| destination | 移动到目标集合键名 | String | 是   | -    |
| member      | 元素的值           | String | 是   | -    |

### spop

移除并返回集合中的一个随机元素

- 调用示例

```js
await redis.spop(key, count);
```

- 参数说明

| 参数  | 说明       | 类型   | 必填 | 说明 |
| ----- | ---------- | ------ | ---- | ---- |
| key   | 键名       | String | 是   | -    |
| count | 移除的数量 | Number | 否   | -    |

### srandmember

返回集合中一个或多个随机数

- 调用示例

```js
await redis.srandmember(key, count);
```

- 参数说明

| 参数  | 说明 | 类型   | 必填 | 说明 |
| ----- | ---- | ------ | ---- | ---- |
| key   | 键名 | String | 是   | -    |
| count | 数量 | Number | 否   | -    |

### srem

移除集合中一个或多个成员

- 调用示例

```js
await redis.srem(key, member1, member2);
```

- 参数说明

| 参数    | 说明     | 类型   | 必填 | 说明 |
| ------- | -------- | ------ | ---- | ---- |
| key     | 键名     | String | 是   | -    |
| member1 | 成员的值 | String | 是   | -    |
| member2 | 成员的值 | String | 否   | -    |

### sunion

返回所有给定集合的并集

- 调用示例

```js
await redis.sunion(key1, key2, key3, ...);
```

- 参数说明

| 参数 | 说明   | 类型   | 必填 | 说明 |
| ---- | ------ | ------ | ---- | ---- |
| key1 | 键名 1 | String | 是   | -    |
| key2 | 键名 2 | String | 是   | -    |
| key3 | 键名 3 | String | 否   | -    |

### sunionstore

所有给定集合的并集存储在 destination 集合中

- 调用示例

```js
await redis.sunionstore(destination, key1, key2, key3);
```

- 参数说明

| 参数        | 说明     | 类型   | 必填 | 说明 |
| ----------- | -------- | ------ | ---- | ---- |
| destination | 目标键名 | String | 是   | -    |
| key1        | 键名 1   | String | 是   | -    |
| key2        | 键名 2   | String | 是   | -    |
| key3        | 键名 3   | String | 否   | -    |

### sscan

迭代集合中的元素

- 调用示例

```js
await redis.sscan(key, cursor);
await redis.sscan(key, 0, 'match', 'a*');
```

- 参数说明

| 参数   | 说明 | 类型   | 必填 | 说明 |
| ------ | ---- | ------ | ---- | ---- |
| key    | 键名 | String | 是   | -    |
| cursor | 游标 | Number | 是   | -    |

## 有序集合（zset）

### zadd

向集合添加一个或多个成员

- 调用示例

```js
await redis.zadd(key, score1, value1, score2, value2);
```

- 参数说明

| 参数   | 说明 | 类型   | 必填 | 说明 |
| ------ | ---- | ------ | ---- | ---- |
| key    | 键名 | String | 是   | -    |
| score1 | 分值 | Number | 是   | -    |
| value1 | 键值 | String | 是   | -    |
| score2 | 分值 | Number | 否   | -    |
| value2 | 键值 | String | 否   | -    |

### zcard

获取集合的成员数量

- 调用示例

```js
await redis.zcard(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### zcount

获取集合的成员数量根据分值

- 调用示例

```js
await redis.zcount(key, min, max);
```

- 参数说明

| 参数 | 说明     | 类型   | 必填 | 说明 |
| ---- | -------- | ------ | ---- | ---- |
| key  | 键名     | String | 是   | -    |
| min  | 最小分值 | Number | 是   | -    |
| max  | 最大分值 | Number | 是   | -    |

### zincrby

有序集合中对指定成员的分数加上增量 increment，并返回更新后的分值

可以通过传递一个负数值 increment ，让分数减去相应的值，比如 ZINCRBY key -5 member ，就是让 member 的 score 值减去 5 。

- 调用示例

```js
await redis.zincrby(key, increment, member);
```

- 参数说明

| 参数      | 说明 | 类型   | 必填 | 说明 |
| --------- | ---- | ------ | ---- | ---- |
| key       | 键名 | String | 是   | -    |
| increment | 分值 | Number | 是   | -    |
| member    | 成员 | String | 是   | -    |

### zinterstore

计算给定的一个或多个有序集的交集并将结果集存储在新的有序集合 destination 中

- 调用示例

```js
await redis.zinterstore(destination, numkeys, key1, key2);
await redis.zinterstore('newZSet', 2, 'oldZset1', 'oldZset2');
```

- 参数说明

| 参数        | 说明     | 类型   | 必填 | 说明 |
| ----------- | -------- | ------ | ---- | ---- |
| destination | 目标键名 | String | 是   | -    |
| numkeys     | 集合数量 | Number | 是   | -    |
| key1        | 集合键名 | String | 是   | -    |
| key2        | 集合键名 | String | 是   | -    |

### zlexcount

在有序集合中计算指定字典区间内成员数量

- 调用示例

```js
await redis.zlexcount(key, min, max);
```

- 参数说明

| 参数 | 说明     | 类型   | 必填 | 说明 |
| ---- | -------- | ------ | ---- | ---- |
| key  | 键名     | String | 是   | -    |
| min  | 最小分值 | Number | 是   | -    |
| max  | 最大分值 | Number | 是   | -    |

### zrange

通过索引区间返回有序集合指定区间内的成员（集合按照分值从小到大排序）

- 调用示例

```js
await redis.zrange(key, start, end);
```

- 参数说明

| 参数  | 说明     | 类型   | 必填 | 说明 |
| ----- | -------- | ------ | ---- | ---- |
| key   | 键名     | String | 是   | -    |
| start | 开始下标 | Number | 是   | -    |
| end   | 结束下标 | Number | 是   | -    |

### zrangebylex

通过字典区间返回有序集合的成员（具有分页功能）（集合按照分值从小到大排序）

- 调用示例

```js
await redis.zrangebylex(key, min, max);
await redis.zrangebylex('zset', '-', '+', 'limit', 0, 3);
await redis.zrangebylex('zset', '[2', '[3', 'limit', 0, 3);
```

- 参数说明

| 参数   | 说明                                                               | 类型   | 必填 | 说明 |
| ------ | ------------------------------------------------------------------ | ------ | ---- | ---- |
| key    | 键名                                                               | String | 是   | -    |
| min    | 字典中排序位置较小的成员,必须以”[“开头,或者以”(“开头,可使用”-“代替 | String | 是   | -    |
| max    | 字典中排序位置较大的成员,必须以”[“开头,或者以”(“开头,可使用”+”代替 | String | 是   | -    |
| limit  | 返回结果是否分页,指令中包含 LIMIT 后 offset、count 必须输入        | String | 否   | -    |
| offset | 返回结果起始位置                                                   | String | 否   | -    |
| count  | 返回结果数量                                                       | String | 否   | -    |

### zrank

返回有序集合中指定成员的索引

- 调用示例

```js
await redis.zrank(key, member);
```

- 参数说明

| 参数   | 说明 | 类型   | 必填 | 说明 |
| ------ | ---- | ------ | ---- | ---- |
| key    | 键名 | String | 是   | -    |
| member | 成员 | String | 是   | -    |

### zrem

移除有序集合中的一个或多个成员

- 调用示例

```js
await redis.zrem(key, member1, member2);
```

- 参数说明

| 参数    | 说明 | 类型   | 必填 | 说明 |
| ------- | ---- | ------ | ---- | ---- |
| key     | 键名 | String | 是   | -    |
| member1 | 成员 | String | 是   | -    |
| member2 | 成员 | String | 是   | -    |

### zremrangebylex

移除有序集合中给定的字典区间的所有成员

- 调用示例

```js
await redis.zremrangebylex(key, min, max);
```

- 参数说明

| 参数 | 说明                                                               | 类型   | 必填 | 说明 |
| ---- | ------------------------------------------------------------------ | ------ | ---- | ---- |
| key  | 键名                                                               | String | 是   | -    |
| min  | 字典中排序位置较小的成员,必须以”[“开头,或者以”(“开头,可使用”-“代替 | String | 是   | -    |
| max  | 字典中排序位置较大的成员,必须以”[“开头,或者以”(“开头,可使用”+”代替 | String | 是   | -    |

### zrevrange

返回有序集中指定区间内的成员，通过索引，分数从高到低

- 调用示例

```js
await redis.zrevrange(key, start, stop);
```

- 参数说明

| 参数  | 说明       | 类型   | 必填 | 说明 |
| ----- | ---------- | ------ | ---- | ---- |
| key   | 键名       | String | 是   | -    |
| start | 开始的下标 | Number | 是   | -    |
| stop  | 结束的下标 | Number | 是   | -    |

### zrevrangebyscore

通过字典区间返回有序集合的成员（具有分页功能）（集合按照分值从小到大排序）

- 调用示例

```js
await redis.zrevrangebyscore(key, min, max);
await redis.zrevrangebyscore('zset', '-', '+', 'limit', 0, 3);
await redis.zrevrangebyscore('zset', '[2', '[3', 'limit', 0, 3);
```

- 参数说明

| 参数   | 说明                                                               | 类型   | 必填 | 说明 |
| ------ | ------------------------------------------------------------------ | ------ | ---- | ---- |
| key    | 键名                                                               | String | 是   | -    |
| min    | 字典中排序位置较小的成员,必须以”[“开头,或者以”(“开头,可使用”-“代替 | String | 是   | -    |
| max    | 字典中排序位置较大的成员,必须以”[“开头,或者以”(“开头,可使用”+”代替 | String | 是   | -    |
| limit  | 返回结果是否分页,指令中包含 LIMIT 后 offset、count 必须输入        | String | 否   | -    |
| offset | 返回结果起始位置                                                   | String | 否   | -    |
| count  | 返回结果数量                                                       | String | 否   | -    |

### srandmember

返回集合中一个或多个随机数

- 调用示例

```js
await redis.srandmember(key, count);
```

- 参数说明

| 参数  | 说明 | 类型   | 必填 | 说明 |
| ----- | ---- | ------ | ---- | ---- |
| key   | 键名 | String | 是   | -    |
| count | 数量 | Number | 是   | -    |

### zrevrank

移返回有序集合中指定成员的排名，有序集成员按分数值递减(从大到小)排序

- 调用示例

```js
await redis.zrevrank(key, member);
```

- 参数说明

| 参数   | 说明 | 类型   | 必填 | 说明 |
| ------ | ---- | ------ | ---- | ---- |
| key    | 键名 | String | 是   | -    |
| member | 成员 | String | 是   | -    |

### zscore

返回有序集中，成员的分数值

- 调用示例

```js
await redis.zscore(key, member);
```

- 参数说明

| 参数   | 说明 | 类型   | 必填 | 说明 |
| ------ | ---- | ------ | ---- | ---- |
| key    | 键名 | String | 是   | -    |
| member | 成员 | String | 是   | -    |

### zunionstore

计算给定的一个或多个有序集的并集，并存储在新的 key 中

- 调用示例

```js
await redis.zunionstore(destination, numkeys, key1, key2);
await redis.zunionstore('newZset', 2, 'oldZset1', 'oldZset2');
```

- 参数说明

| 参数        | 说明     | 类型   | 必填 | 说明 |
| ----------- | -------- | ------ | ---- | ---- |
| destination | 目标键名 | String | 是   | -    |
| numkeys     | 集合数量 | Number | 是   | -    |
| key1        | 集合键名 | String | 是   | -    |
| key2        | 集合键名 | String | 是   | -    |

### zscan

迭代有序集合中的元素（包括元素成员和元素分值）

- 调用示例

```js
await redis.zscan(key, cursor);
await redis.zscan('zset', 0, 'match', 'a*');
```

- 参数说明

| 参数   | 说明 | 类型   | 必填 | 说明 |
| ------ | ---- | ------ | ---- | ---- |
| key    | 键名 | String | 是   | -    |
| cursor | 游标 | Number | 是   | -    |

## HyperLogLog

### pfadd

添加指定元素到 HyperLogLog 中。

- 调用示例

```js
await redis.pfadd(key, element1, element2);
```

- 参数说明

| 参数     | 说明   | 类型   | 必填 | 说明 |
| -------- | ------ | ------ | ---- | ---- |
| key      | 键名   | String | 是   | -    |
| element1 | 元素 1 | Number | 是   | -    |
| element2 | 元素 2 | Number | 是   | -    |

### pfcount

返回给定 HyperLogLog 的基数估算值。

- 调用示例

```js
await redis.pfcount(key);
```

- 参数说明

| 参数 | 说明 | 类型   | 必填 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| key  | 键名 | String | 是   | -    |

### pfmerge

将多个 HyperLogLog 合并为一个 HyperLogLog

- 调用示例

```js
await redis.pfmerge(destkey, key1, key2);
```

- 参数说明

| 参数    | 说明     | 类型   | 必填 | 说明 |
| ------- | -------- | ------ | ---- | ---- |
| destkey | 目标键名 | String | 是   | -    |
| key1    | 键名     | String | 是   | -    |
| key2    | 键名     | String | 是   | -    |

## 发布订阅

### psubscribe

订阅一个或多个符合给定模式的频道。

- 调用示例

```js
await redis.psubscribe(pattern);
```

- 参数说明

| 参数    | 说明 | 类型   | 必填 | 说明 |
| ------- | ---- | ------ | ---- | ---- |
| pattern | 频道 | String | 是   | -    |

### pubsub

查看订阅与发布系统状态。

- 调用示例

```js
await redis.pubsub();
```

### publish

将信息发送到指定的频道。

- 调用示例

```js
await redis.publish(channel, message);
```

- 参数说明

| 参数    | 说明 | 类型   | 必填 | 说明 |
| ------- | ---- | ------ | ---- | ---- |
| channel | 频道 | String | 是   | -    |
| message | 消息 | String | 是   | -    |

### punsubscribe

退订所有给定模式的频道。

- 调用示例

```js
await redis.punsubscribe(pattern1, pattern2);
```

- 参数说明

| 参数     | 说明 | 类型   | 必填 | 说明 |
| -------- | ---- | ------ | ---- | ---- |
| pattern1 | 频道 | String | 是   | -    |
| pattern2 | 频道 | String | 是   | -    |

### subscribe

订阅给定的一个或多个频道的信息。

- 调用示例

```js
await redis.subscribe(channel1, channel2);
```

- 参数说明

| 参数     | 说明 | 类型   | 必填 | 说明 |
| -------- | ---- | ------ | ---- | ---- |
| channel1 | 频道 | String | 是   | -    |
| channel2 | 频道 | String | 是   | -    |

### unsubscribe

指退订给定的频道。

- 调用示例

```js
await redis.unsubscribe(channel);
```

- 参数说明

| 参数    | 说明 | 类型   | 必填 | 说明 |
| ------- | ---- | ------ | ---- | ---- |
| channel | 频道 | String | 是   | -    |

## 事务

### 完整示例

```js
const multi = await redis.multi();

multi.set('key1', 'value1');
multi.set('key2', 'value2');
multi.set('key3', 'value3');

let execRes = await multi.exec();
```

### multi

标记一个事务块的开始。将多条指令作为一个原子执行。

- 调用示例

```js
await redis.multi();
```

### exec

执行所有事务块内的命令。

- 调用示例

```js
await multi.exec();
```

### discard

取消事务，放弃执行事务块内的所有命令。

- 调用示例

```js
await multi.discard();
```

### watch

监视一个(或多个) key ，如果在事务执行之前这个(或这些) key 被其他命令所改动，那么事务将被打断。

- 调用示例

```js
redis.watch(key1, key2);
```

### unwatch

取消 WATCH 命令对所有 key 的监视。

- 调用示例

```js
redis.unwatch();
```

## 位图（bitMap）

### getbit

获取指定位的值 值只有 0 或 1

- 调用示例

```js
await redis.getbit(key, offset);
```

- 参数说明

| 参数   | 说明 | 类型   | 必填 | 说明 |
| ------ | ---- | ------ | ---- | ---- |
| key    | 键名 | String | 是   | -    |
| offset | 位   | Number | 是   | -    |

### setbit

设置指定位的值 value 只能是 0 或 1 并返回旧值

- 调用示例

```js
await redis.setbit(key, offset, value);
```

- 参数说明

| 参数   | 说明   | 类型   | 必填 | 说明          |
| ------ | ------ | ------ | ---- | ------------- |
| key    | 键名   | String | 是   | -             |
| offset | 位     | Number | 是   | -             |
| value  | 位的值 | Number | 是   | 只能是 0 或 1 |

### bitcount

计算给定字符串中，被设置为 1 的比特位的数量。

- 调用示例

```js
await redis.bitcount(key, start, end);
```

- 参数说明

| 参数  | 说明   | 类型   | 必填 | 说明 |
| ----- | ------ | ------ | ---- | ---- |
| key   | 键名   | String | 是   | -    |
| start | 开始位 | Number | 是   | -    |
| end   | 结束位 | Number | 是   | -    |

### bitop

- 对一个或多个保存二进制位的字符串 key 进行位元操作，并将结果保存到 destkey 上。
- operation 可以是 AND、OR、NOT、XOR 这四种操作中的任意一种。
- bitop AND destkey key [key ...] ，对一个或多个 key 求逻辑并，并将结果保存到 destkey
- bitop OR destkey key [key ...] ，对一个或多个 key 求逻辑或，并将结果保存到 destkey
- bitop XOR destkey key [key ...] ，对一个或多个 key 求逻辑异或，并将结果保存到 destkey
- bitop NOT destkey key ，对给定 key 求逻辑非，并将结果保存到 destkey
- 除了 NOT 操作外，其他操作都可以接受一个或多个 key 作为输入
- 当 bitop 处理不同长度的字符串时，较短的那个字符串所缺少的部分会被看做 0
- 空的 key 也被看作是包含 0 的字符串序列

* 调用示例

```js
await redis.bitop('AND', 'active', 'active_20170708', 'active_20170709');
```

### bitpos

返回位图中第一个值为 bit 的二进制位的位置

在默认情况下,命令将检测到的整个位图,但用户也可以通过可选的 start 参数和 end 参数指定要检测的范围

- 调用示例

```js
await redis.bitpos(key, value start, end);
```

- 参数说明

| 参数  | 说明                       | 类型   | 必填 | 说明          |
| ----- | -------------------------- | ------ | ---- | ------------- |
| key   | 键名                       | String | 是   | -             |
| value | 值                         | Number | 是   | 只能是 0 或 1 |
| start | 开始字节，注意 1 字节=8 位 | Number | 是   | -             |
| end   | 结束字节，注意 1 字节=8 位 | Number | 是   | -             |

## 执行 lua 脚本

某些情况下需要使用复杂的原子操作以避免高并发下数据修改混乱的问题，这种需求一般可通过执行 lua 脚本实现。如以下示例，判断 redis 中不存在 key-test 时，将其值设置为 1；存在且小于 10 时进行加一操作；大于等于 10 时不进行操作直接返回。

- 调用示例

```js
const [operationType, currentValue] = await redis.eval(
  `
    local val = redis.call('get','key-test')
    local valNum = tonumber(val)
    if (valNum == nil) then
        redis.call('set', 'key-test', 1)
        return {0, 1}
    end
    if (valNum < 10) then
        redis.call('incrby', 'key-test', 1)
        return {1, valNum + 1}
    else
        return {2, valNum}
    end
    `,
  0
);
```
