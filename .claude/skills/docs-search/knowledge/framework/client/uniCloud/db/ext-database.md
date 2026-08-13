---
sidebarDepth: 0
---

# 关于扩展数据库的说明

## 说明@intro

vk 框架已支持扩展数据库，且不需要改动代码，只需要右键 router 云函数，添加管理依赖，勾选扩展数据库的扩展库即可。[传送门 - 在项目中启用扩展数据库](https://doc.dcloud.net.cn/uniCloud/ext-mongodb/dev.html#switch-database)

**相关文档**

- [产品介绍](https://doc.dcloud.net.cn/uniCloud/ext-mongodb/intro.html)
- [开通教程](https://doc.dcloud.net.cn/uniCloud/ext-mongodb/service.html)
- [费用说明](https://doc.dcloud.net.cn/uniCloud/ext-mongodb/price.html)
- [数据库可视化管理工具](https://doc.dcloud.net.cn/uniCloud/ext-mongodb/mongodb-compass.html)
- [开发文档](https://doc.dcloud.net.cn/uniCloud/ext-mongodb/dev.html)
- [控制台地址](https://unicloud.dcloud.net.cn/pages/ext-mongodb/home)

## API

### 切换数据库实例@switch-database-instance

**注意：需要先在扩展数据库控制台授权空间后，此空间才能使用**

```js
// 返回的newDb对象就是连接指定数据库实例的db对象
const newDb = uniCloud.database({
  id: '数据库实例ID',
});

let info = await vk.baseDao.findById({
  db: newDb, // 这里多加一个参数db即可
  dbName: 'vk-test',
  id: '5f3a125b3d11c6000106d338',
});
```

### 切换数据库@switch-database

```js
// 返回的newDb对象就是连接指定库名的db对象
const newDb = uniCloud.database({
  database: '数据库实例下的数据库名称',
});
let info = await vk.baseDao.findById({
  db: newDb, // 这里多加一个参数db即可
  dbName: 'vk-test',
  id: '5f3a125b3d11c6000106d338',
});
```

### 切换数据库实例和库@switch-database-instance-and-database

```js
// 返回的newDb对象就是连接指定数据库实例且指定了库名的db对象
const newDb = uniCloud.database({
  id: '数据库实例ID',
  database: '数据库实例下的数据库名称',
});
let info = await vk.baseDao.findById({
  db: newDb, // 这里多加一个参数db即可
  dbName: 'vk-test',
  id: '5f3a125b3d11c6000106d338',
});
```
