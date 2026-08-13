---
sidebarDepth: 0
---

# 连表返回单条记录

- 主表：uni-id-users （用户表）
- 副表：order （用户订单表）
- 副表：vip （会员卡表）
- 以下代码作用是：用一条聚合查询语句，查询前用户 ID 为 001 的用户信息，并查询他们的最新 10 个订单记录表，再查询他们的 VIP 信息

**_通过 `getOne:true` 设置只返回第一条数据，且是对象形式返回_**

**_通过 `getMain:true` 直接返回数据库查询到的数据（不带 code,rows 等参数）_**

```js
let info = await vk.baseDao.selects({
  dbName: 'uni-id-users',
  getOne: true, // 只返回第一条数据
  getMain: true, // 直接返回数据库查询到的数据（不带code,rows等参数）
  // 主表where条件
  whereJson: {
    _id: '001',
  },
  // 主表字段显示规则
  fieldJson: {
    token: false,
    password: false,
  },
  // 副表列表
  foreignDB: [
    {
      dbName: 'order',
      localKey: '_id',
      foreignKey: 'user_id',
      as: 'orderList',
      limit: 10,
      // 副表where条件
      whereJson: {},
      // 副表字段显示规则
      fieldJson: {},
      // 副表排序规则
      sortArr: [{ name: 'time', type: 'desc' }],
    },
    {
      dbName: 'vip',
      localKey: '_id',
      foreignKey: 'user_id',
      as: 'vipInfo',
      limit: 1, // 当limit = 1时，以对象形式返回，否则以数组形式返回
    },
  ],
});
```
