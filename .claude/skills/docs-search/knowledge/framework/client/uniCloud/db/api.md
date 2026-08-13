---
sidebarDepth: 0
---

# 数据库 API

- **调用示例**：`router/service/db_test/pub/` 目录下
- **演示页面**：`pages/db-test/db-test`

## 增

### vk.baseDao.add（单条记录增加）@add

**接口名**

`vk.baseDao.add`

**调用示例**

```js
let id = await vk.baseDao.add({
  dbName: 'vk-test', // 表名
  dataJson: {
    // 需要新增的数据 json格式
    money: Math.floor(Math.random() * 9 + 1),
  },
});
```

**请求参数**

| 参数名           | 类型    | 必填 | 说明                                           |
| ---------------- | ------- | ---- | ---------------------------------------------- |
| dbName           | String  | 是   | 表名                                           |
| dataJson         | Object  | 是   | 需要添加的数据                                 |
| cancelAddTime    | Boolean | 否   | 取消自动生成 \_add_time 和 \_add_time_str 字段 |
| cancelAddTimeStr | Boolean | 否   | 取消自动生成 \_add_time_str 字段               |
| db               | DB      | 否   | 指定数据库实例 const db = uniCloud.database(); |

**返回值**

返回值为添加数据的\_id，添加失败，则返回 null

### vk.baseDao.adds（批量增加）@adds

**接口名**

`vk.baseDao.adds`

**调用示例**

```js
let ids = await vk.baseDao.adds({
  dbName: 'vk-test', // 表名
  dataJson: [{ money: Math.floor(Math.random() * 9 + 1) }, { money: Math.floor(Math.random() * 9 + 1) }],
});
```

**请求参数**

| 参数名           | 类型    | 必填 | 说明                                                                                                            |
| ---------------- | ------- | ---- | --------------------------------------------------------------------------------------------------------------- |
| dbName           | String  | 是   | 表名                                                                                                            |
| dataJson         | Array   | 是   | 需要批量添加的数据                                                                                              |
| cancelAddTime    | Boolean | 否   | 取消自动生成 \_add_time 和 \_add_time_str 字段                                                                  |
| cancelAddTimeStr | Boolean | 否   | 取消自动生成 \_add_time_str 字段                                                                                |
| needReturnIds    | Boolean | 否   | 是否需要返回 ids 数组数据，默认 dataJson 的长度 `≤10万` 则 true，`＞10万` 则 false，false 时返回的 ids 是空数组 |
| db               | DB      | 否   | 指定数据库实例 const db = uniCloud.database();                                                                  |

**返回值**

返回值为添加数据的\_id 数组，添加失败，则返回 null

1. 若 `needReturnIds` 为 false，则返回的是空数组，设置为 false 可以减少内存占用，提升性能
2. 若 `needReturnIds` 为 true，则返回的所有添加数据的\_id

> **注意：** `add` 和 `adds` 默认会自动加上 `_add_time` 字段，该字段表示该条记录的添加时间。

可以通过参数 `cancelAddTime:true` 来取消 `_add_time` 字段的添加，如下

```js
let id = await vk.baseDao.add({
  dbName: 'vk-test',
  cancelAddTime: true, // 通过设置 cancelAddTime:true 可以取消 _add_time 字段的添加
  dataJson: {
    money: Math.floor(Math.random() * 9 + 1),
  },
});
```

也可以通过配置 `/common/uni-config-center/vk-unicloud/index.js` 内的 `vk.db.unicloud.cancelAddTime = true` 来全局取消

提示：正常情况下，没有必要特意取消该字段，该字段记录了本条记录的实际添加时间，且该字段可以用于按时间排序（默认 `vk.baseDao.getTableData` 的排序规则就是按 `_add_time` 降序。）

## 删

### vk.baseDao.del（批量删除）@del

**接口名**

`vk.baseDao.del`

批量删除 对应的传统 sql 语句: `delete from vk-test where money = 1`

**调用示例**

```js
// 返回被删除的记录条数
await vk.baseDao.del({
  dbName: 'vk-test',
  whereJson: {
    money: 1,
  },
});
```

**请求参数**

| 参数名    | 类型   | 必填 | 说明                                           |
| --------- | ------ | ---- | ---------------------------------------------- |
| dbName    | String | 是   | 表名                                           |
| whereJson | Object | 是   | where 条件                                     |
| db        | DB     | 否   | 指定数据库实例 const db = uniCloud.database(); |

**返回值**

返回值是删除的记录数量

**如果你想要删除此表全部数据，可以这样写**

```js
await vk.baseDao.del({
  dbName: 'vk-test',
  whereJson: {
    _id: _.exists(true),
  },
});
```

### vk.baseDao.deleteById（根据 ID 删除数据 ）@deleteById

**接口名**

`vk.baseDao.deleteById`

根据 ID 删除数据 对应的传统 sql 语句: `delete from vk-test where _id = 1`

**调用示例**

```js
// 返回被删除的记录条数
await vk.baseDao.deleteById({
  dbName: 'vk-test',
  id: 1,
});
```

**请求参数**

| 参数名 | 类型   | 必填 | 说明                                           |
| ------ | ------ | ---- | ---------------------------------------------- |
| dbName | String | 是   | 表名                                           |
| id     | String | 是   | 记录的\_id                                     |
| db     | DB     | 否   | 指定数据库实例 const db = uniCloud.database(); |

**返回值**

返回值是删除的记录数量

## 改

### vk.baseDao.update（批量修改）@update

**接口名**

`vk.baseDao.update`

批量修改 对应的传统 sql 语句: `update vk-test set money = money-100 where _id="5f3a14823d11c6000106ff5c" and money >= 100`

**调用示例**

```js
// 返回被修改的记录条数
let num = await vk.baseDao.update({
  dbName: 'vk-test', // 表名
  whereJson: {
    // 条件
    _id: '5f3a14823d11c6000106ff5c',
    money: _.gte(100),
  },
  dataJson: {
    // 需要修改的数据
    money: _.inc(-100),
  },
});
```

**请求参数**

| 参数名    | 类型   | 必填 | 说明                                           |
| --------- | ------ | ---- | ---------------------------------------------- |
| dbName    | String | 是   | 表名                                           |
| whereJson | Object | 是   | where 条件                                     |
| dataJson  | Object | 是   | 需要修改的数据                                 |
| db        | DB     | 否   | 指定数据库实例 const db = uniCloud.database(); |

**返回值**

返回值是受影响的行数

**如果你想要修改此表全部数据，可以这样写**

```js
let num = await vk.baseDao.update({
  dbName: 'vk-test', // 表名
  whereJson: {
    // 条件
    _id: _.exists(true),
  },
  dataJson: {
    // 需要修改的数据
    money: _.inc(-1),
  },
});
```

### vk.baseDao.updateById（根据 ID 修改数据）@updateById

**接口名**

`vk.baseDao.updateById`

**调用示例**

```js
let newInfo = await vk.baseDao.updateById({
  dbName: 'vk-test',
  id: _id,
  dataJson: {
    money: 1,
  },
  getUpdateData: true, // 不传或设为 false 时不返回修改后的数据对象
});
```

**请求参数**

| 参数名        | 类型    | 必填 | 说明                                           |
| ------------- | ------- | ---- | ---------------------------------------------- |
| dbName        | String  | 是   | 表名                                           |
| id            | String  | 是   | 记录的\_id                                     |
| dataJson      | Object  | 是   | 需要修改的数据                                 |
| getUpdateData | Boolean | 否   | 是否需要返回修改后的数据                       |
| db            | DB      | 否   | 指定数据库实例 const db = uniCloud.database(); |

**返回值**

默认返回值是受影响的行数，如果 getUpdateData 为 true，则返回修改后的数据对象

### vk.baseDao.updateAndReturn（更新并返回更新后的数据，原子操作）@updateAndReturn

**接口名**

`vk.baseDao.updateAndReturn`

优势：此为原子操作，并不是先判断是否存在，再进行修改或新增。只计一次写操作。（原子操作）（支持事务）

**调用示例**

注意：whereJson 条件不管写什么，只会修改满足条件的第一条记录，且不支持排序

```js
let newInfo = await vk.baseDao.updateAndReturn({
  dbName: 'vk-test',
  whereJson: {
    _id: _id,
  },
  dataJson: {
    money: _.inc(1),
  },
});
```

如上代码运行后，`newInfo.money` 的值就会自增 1，且不会受到并发影响

**请求参数**

| 参数名    | 类型   | 必填 | 说明                                           |
| --------- | ------ | ---- | ---------------------------------------------- |
| dbName    | String | 是   | 表名                                           |
| whereJson | Object | 是   | where 条件                                     |
| dataJson  | Object | 是   | 需要修改的数据                                 |
| db        | DB     | 否   | 指定数据库实例 const db = uniCloud.database(); |

**返回值**

默认返回值是修改后的数据对象

`vk.baseDao.updateAndReturn` 和 `vk.baseDao.updateById + getUpdateData:true` 的区别？

- vk.baseDao.updateAndReturn 是原子操作，而后者不是原子操作（后者是先修改再查询）

vk.baseDao.updateAndReturn 可以实现什么功能？

- 1、实现 id 自增
- 2、实现阅读数自增（同时返回自增后的商品或文章详细信息等）
- 3、实现跟数值有关的自增和自减（同时需要实时获取自增或自减后的值）

### vk.baseDao.setById（根据 ID 判断存在则替换，不存在则添加）@setById

**接口名**

`vk.baseDao.setById`

优势：此为原子操作，并不是先判断是否存在，再进行替换或新增。只计一次写操作。（原子操作）（支持事务）

注意：若 id 存在，则会用传的数据进行替换，即未写在 dataJson 内的字段会被删除

> VK 框架核心库版本需 >= 2.15.1

**调用示例**

```js
let setRes = await vk.baseDao.setById({
  dbName: 'vk-test',
  dataJson: {
    _id: '666',
    money: 1,
  },
});
```

**请求参数**

| 参数名   | 类型   | 必填 | 说明                                                                  |
| -------- | ------ | ---- | --------------------------------------------------------------------- |
| dbName   | String | 是   | 表名                                                                  |
| dataJson | Object | 是   | 需要替换或新增的完整数据（必须包含\_id）                              |
| id       | String | 否   | 如果传了 id 参数，则会与 dataJson 中的\_id 判断是否一致，不一致会报错 |
| db       | DB     | 否   | 指定数据库实例 const db = uniCloud.database();                        |

**返回值**

| 返回值字段 | 类型   | 说明                              |
| ---------- | ------ | --------------------------------- |
| type       | String | add 添加；update 修改（替换）     |
| id         | String | 当 type=add 时返回新增记录的 \_id |

## 查

### vk.baseDao.findById（根据 id 获取单条记录）@findById

**接口名**

`vk.baseDao.findById`

根据 id 获取单条记录 对应的传统 sql 语句: `select * from vk-test where _id = "5f3a125b3d11c6000106d338"`

**调用示例**

```js
let info = await vk.baseDao.findById({
  dbName: 'vk-test',
  id: '5f3a125b3d11c6000106d338',
});
```

**请求参数**

| 参数名    | 类型   | 必填 | 说明                                                   |
| --------- | ------ | ---- | ------------------------------------------------------ |
| dbName    | String | 是   | 表名                                                   |
| id        | String | 是   | 记录的\_id                                             |
| fieldJson | Object | 否   | 字段显示规则（用来控制只显示哪些字段或不显示哪些字段） |
| db        | DB     | 否   | 指定数据库实例 const db = uniCloud.database();         |

**返回值**

返回值是该条记录数据

### vk.baseDao.findByWhereJson（根据条件获取单条记录）@findByWhereJson

**接口名**

`vk.baseDao.findByWhereJson`

根据条件获取单条记录（支持任意 where 条件及排序，取满足条件的第一条）。等价 SQL：`select * from vk-test where money >= 100 limit 1`

**调用示例**

```js
let info = await vk.baseDao.findByWhereJson({
  dbName: 'vk-test',
  whereJson: {
    money: _.gte(100), // 金额大于等于 100 的第一条
  },
  sortArr: [{ name: '_id', type: 'desc' }],
});
```

**请求参数**

| 参数名    | 类型   | 必填 | 说明                                                   |
| --------- | ------ | ---- | ------------------------------------------------------ |
| dbName    | String | 是   | 表名                                                   |
| whereJson | Object | 是   | where 条件                                             |
| fieldJson | Object | 否   | 字段显示规则（用来控制只显示哪些字段或不显示哪些字段） |
| sortArr   | Array  | 否   | 排序规则                                               |
| db        | DB     | 否   | 指定数据库实例 const db = uniCloud.database();         |

**返回值**

返回值是该条记录数据（只返回第一条数据的内容）

### vk.baseDao.select（查多条记录，具有分页功能）@select

**接口名**

`vk.baseDao.select`

查多条记录（具有分页功能） 对应的传统 sql 语句: `select * from vk-test where money>=0 limit 1,20`

云开发数据库最大支持查询 1000 条数据，而此 API 可以达到 1 万条数据，通过设置 `pageSize: 10000`，最大极限要看你返回的数据量大小。（建议控制在 1 万以内）

特别注意：此分页功能会随着 `pageIndex` 的值越大，效率越低（传统 mysql 也有此问题），pageIndex \* pageSize 的值最好不要超过 300 万（如每页显示 10 条，则建议最多让用户查看到第 30 万页）

`vk-admin` 的 `万能表格` 针对分页进行了优化，有多种方案可选 [传送门](https://vkdoc.fsq.pub/admin/2/table.html#%E5%88%86%E9%A1%B5)

**调用示例**

```js
let res = await vk.baseDao.select({
  dbName: 'vk-test', // 表名
  getCount: false, // 是否返回满足条件的记录总数，默认 false
  getMain: false, // 是否只返回rows数据，默认false
  pageIndex: 1, // 当前第几页
  pageSize: 20, // 每页条数
  whereJson: {
    // 条件
    money: _.gte(0), // 金额大于0
  },
  // 代表只显示_id和money字段
  fieldJson: {
    _id: true,
    money: true,
  },
  // 按_id降序 asc 升序 desc 降序
  sortArr: [{ name: '_id', type: 'desc' }],
});
```

**pageSize 介绍**

1. 由于云厂商限制云数据库最大每次只能查 1000 条数据，因此 VK 框架针对 select 的 pageSize 进行了特殊处理，可以"突破"云厂商限制，达到 1 万条以上
2. 联表查询（selects）时，依然为 1000 条限制
3. 若 pageSize 设置为-1，则默认查全部数据（会一直查询到云函数超时或内存爆满为止）
4. 根据第 3 条介绍，故建议 pageSize 的值尽量在 10 万以内，1 万以内更佳
5. 当 pageSize 为-1 或大于 1000 时，若未设置排序条件，或排序条件只有\_id，可以大大提升性能（会使用游标查询法遍历数据，而不是 skip+limit 方式）

**请求参数**

| 参数名    | 类型    | 必填 | 说明                                                                                                                                                        |
| --------- | ------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dbName    | String  | 是   | 表名                                                                                                                                                        |
| getCount  | Boolean | 否   | 是否返回满足条件的记录总数。默认 false [详情](https://vkdoc.fsq.pub/client/uniCloud/db/selects.html#getcount)                                               |
| hasMore   | Boolean | 否   | 是否返回精确的是否还有下一页。默认 false，若已设置 getCount 为 true，则无需设置此参数 [详情](https://vkdoc.fsq.pub/client/uniCloud/db/selects.html#hasmore) |
| getMain   | Boolean | 否   | 是否只返回 rows 数组。默认 false                                                                                                                            |
| getOne    | Boolean | 否   | 是否只返回第一条数据。默认 false                                                                                                                            |
| pageIndex | Number  | 否   | 第几页 默认 1                                                                                                                                               |
| pageSize  | Number  | 否   | 每页显示数量 默认 10                                                                                                                                        |
| whereJson | Object  | 否   | where 条件                                                                                                                                                  |
| fieldJson | Object  | 否   | 字段显示规则（用来控制只显示哪些字段或不显示哪些字段）（见上方调用示例）                                                                                    |
| sortArr   | Array   | 否   | 排序规则（见上方调用示例）                                                                                                                                  |
| db        | DB      | 否   | 指定数据库实例 const db = uniCloud.database();                                                                                                              |
| debug     | Boolean | 否   | 是否返回调试信息，设为 true 会返回数据库执行耗时，默认 false                                                                                                |

**返回值**

| 参数名     | 类型    | 说明                                                                                          |
| ---------- | ------- | --------------------------------------------------------------------------------------------- |
| rows       | Array   | 数据列表，没有数据时返回空数组                                                                |
| total      | Number  | 满足条件的记录总数（getCount 为 false 时，total = (pageIndex - 1) \* pageSize + rows.length） |
| hasMore    | Boolean | 是否还有下一页，[详情](https://vkdoc.fsq.pub/client/uniCloud/db/selects.html#hasmore)         |
| pagination | Object  | 当前分页参数                                                                                  |
| getCount   | Boolean | 是否执行过 getCount，true：有，false：无                                                      |

**pagination 对象的属性**

| 参数名    | 类型   | 说明           |
| --------- | ------ | -------------- |
| pageIndex | Number | 当前分页的页码 |
| pageSize  | Number | 每页显示的大小 |

### vk.baseDao.count（获取记录总条数）@count

**接口名**

`vk.baseDao.count`

获取记录总条数 对应的传统 sql 语句: `select count(*) from vk-test`

**调用示例**

不带条件 count

```js
let num = await vk.baseDao.count({
  dbName: 'vk-test', // 表名
});
```

带条件 count

```js
let num = await vk.baseDao.count({
  dbName: 'vk-test', // 表名
  whereJson: {
    // 条件
    money: _.gte(0), // 如：金额大于等于 0 的记录数
  },
});
```

注意：数据量很大的情况下，带条件运算 count 全表的性能会很差，尽量使用其他方式替代。比如：

1. 不加条件时 count 全表不存在性能问题
2. 新增一个字段专门用来存放总数。（如文章评论数量，可以不 count 评论记录表，而是每次评论时，该文章的评论数量字段+1，通过 `_.inc(1)` 自增 1 实现）
3. 增加缩小数据范围的必要条件，比如只查某一个月的数据，此时由于本身满足条件的数据变少了，因此性能极大提升。

**请求参数**

| 参数名        | 类型   | 必填 | 说明                                           |
| ------------- | ------ | ---- | ---------------------------------------------- |
| dbName        | String | 是   | 表名                                           |
| whereJson     | Object | 否   | where 条件                                     |
| foreignDB     | Array  | 否   | 连表规则                                       |
| groupJson     | Object | 否   | 分组规则                                       |
| lastWhereJson | Object | 否   | 连表后的 where 条件                            |
| db            | DB     | 否   | 指定数据库实例 const db = uniCloud.database(); |

**返回值**

返回值是满足条件的记录总数

**扩展示例**

判断用户名是否存在

```js
// 判断用户名是否存在
let num = await vk.baseDao.count({
  dbName: 'uni-id-users', // 表名
  whereJson: {
    // 条件
    username: 'admin',
  },
});
if (num > 0) {
  // 用户名存在
}
```

在设置了昵称唯一时，判断此昵称是否允许修改

```js
// 判断昵称是否已被其他用户使用
let uid = '当前要修改的用户的_id';
let num = await vk.baseDao.count({
  dbName: 'uni-id-users', // 表名
  whereJson: {
    // 条件
    _id: _.neq(uid), // 这里排除掉自己
    nickname: '我要修改的昵称',
  },
});
if (num > 0) {
  // 昵称已被其他用户使用
}
```

### vk.baseDao.sum（求和）@sum

**接口名**

`vk.baseDao.sum`

sum 求和 对应的传统 sql 语句: `select sum(money) from vk-test`

**调用示例**

```js
let sum = await vk.baseDao.sum({
  dbName: 'vk-test', // 表名
  fieldName: 'money', // 需要求和的字段名
  whereJson: {
    // 条件
  },
});
```

**请求参数**

| 参数名    | 类型   | 必填 | 说明                                           |
| --------- | ------ | ---- | ---------------------------------------------- |
| dbName    | String | 是   | 表名                                           |
| fieldName | String | 是   | 求和的字段名                                   |
| whereJson | Object | 否   | where 条件                                     |
| db        | DB     | 否   | 指定数据库实例 const db = uniCloud.database(); |

**返回值**

返回值是求和的值（只能针对数值类型的字段求和，且求和的所有记录中，该字段不允许有字符串）

### vk.baseDao.max（取最大值）@max

**接口名**

`vk.baseDao.max`

对应的传统 sql 语句: `select max(money) from vk-test`

**调用示例**

```js
let max = await vk.baseDao.max({
  dbName: 'vk-test', // 表名
  fieldName: 'money', // 需要取最大值的字段名
  whereJson: {
    // 条件
  },
});
```

**请求参数**

| 参数名    | 类型   | 必填 | 说明                                           |
| --------- | ------ | ---- | ---------------------------------------------- |
| dbName    | String | 是   | 表名                                           |
| fieldName | String | 是   | 求最大值的字段名                               |
| whereJson | Object | 否   | where 条件                                     |
| db        | DB     | 否   | 指定数据库实例 const db = uniCloud.database(); |

**返回值**

返回值是最大值

### vk.baseDao.min（取最小值）@min

**接口名**

`vk.baseDao.min`

对应的传统 sql 语句: `select min(money) from vk-test`

**调用示例**

```js
let min = await vk.baseDao.min({
  dbName: 'vk-test', // 表名
  fieldName: 'money', // 需要取最小值的字段名
  whereJson: {
    // 条件
  },
});
```

**请求参数**

| 参数名    | 类型   | 必填 | 说明                                           |
| --------- | ------ | ---- | ---------------------------------------------- |
| dbName    | String | 是   | 表名                                           |
| fieldName | String | 是   | 求最小值的字段名                               |
| whereJson | Object | 否   | where 条件                                     |
| db        | DB     | 否   | 指定数据库实例 const db = uniCloud.database(); |

**返回值**

返回值是最小值

### vk.baseDao.avg（取平均值）@avg

**接口名**

`vk.baseDao.avg`

对应的传统 sql 语句: `select avg(money) from vk-test`

**调用示例**

```js
let avg = await vk.baseDao.avg({
  dbName: 'vk-test', // 表名
  fieldName: 'money', // 需要取平均值的字段名
  whereJson: {
    // 条件
  },
});
```

**请求参数**

| 参数名    | 类型   | 必填 | 说明                                           |
| --------- | ------ | ---- | ---------------------------------------------- |
| dbName    | String | 是   | 表名                                           |
| fieldName | String | 是   | 求平均值的字段名                               |
| whereJson | Object | 否   | where 条件                                     |
| db        | DB     | 否   | 指定数据库实例 const db = uniCloud.database(); |

**返回值**

返回值是平均值

### vk.baseDao.sample（随机取 N 条数据）@sample

**接口名**

`vk.baseDao.sample`

随机取 N 条数据

**调用示例**

注意：不支持连表查询

```js
let list = await vk.baseDao.sample({
  dbName: 'vk-test', // 表名
  size: 1, // 随机条数
  whereJson: {
    // 条件
  },
});
```

**请求参数**

| 参数名    | 类型   | 必填 | 说明                                                   |
| --------- | ------ | ---- | ------------------------------------------------------ |
| dbName    | String | 是   | 表名                                                   |
| size      | Number | 是   | 随机获取的记录数量                                     |
| whereJson | Object | 否   | where 条件                                             |
| fieldJson | Object | 否   | 字段显示规则（用来控制只显示哪些字段或不显示哪些字段） |
| db        | DB     | 否   | 指定数据库实例 const db = uniCloud.database();         |

**返回值**

返回值是随机获取的记录数组
