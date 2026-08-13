---
sidebarDepth: 0
---

# 查询返回树状结构

## 参数说明@params

### treeProps 参数说明

| 参数名    | 类型   | 必填 | 默认值      | 说明                                                               |
| --------- | ------ | ---- | ----------- | ------------------------------------------------------------------ |
| id        | String | 否   | `_id`       | 唯一标识字段                                                       |
| parent_id | String | 否   | `parent_id` | 父级标识字段                                                       |
| children  | String | 否   | `children`  | 自定义返回的下级字段名                                             |
| level     | Number | 否   | 10          | 查询返回的树的最大层级。超过设定层级的节点不会返回。最大 15,最小 1 |
| limit     | Number | 否   | -           | 每一级最大返回的数据量                                             |
| sortArr   | Array  | 否   | -           | 所有子节点的排序规则,格式同主查询的 sortArr                        |
| whereJson | Object | 否   | -           | 子节点的查询条件,格式同主查询的 whereJson                          |

### 注意事项

`treeProps` 内的 `whereJson` 若需要用到 `or` 和 `and` 条件时:

- `_.or` 需写成 `$.or`
- `_.and` 需写成 `$.and`
- 不支持流式语法,只支持对象语法

**变量说明:**

```javascript
const db = uniCloud.database(); // 全局数据库引用
const _ = db.command; // 数据库操作符
const $ = _.aggregate; // 聚合查询操作符
```

**提示:** 文档中出现的 `$` 在云函数若不可用,则可写成 `_.$`

## 代码示例@demo

### 树状结构@demo1

以下语句效果是：查询已启用的菜单，并自动将子菜单合并到父菜单的 children 字段下

```js
res = await vk.baseDao.selects({
  dbName: 'opendb-admin-menus',
  pageIndex: 1,
  pageSize: 500,
  whereJson: {
    enable: true,
    parent_id: _.in([null, '']),
    menu_id: _.exists(true),
  },
  sortArr: [{ name: 'sort', type: 'asc' }], // 主节点的排序规则
  // 树状结构参数
  treeProps: {
    id: 'menu_id', // 唯一标识字段，默认为 _id
    parent_id: 'parent_id', // 父级标识字段，默认为 parent_id
    children: 'children', // 自定义返回的下级字段名，默认为 children
    level: 3, // 查询返回的树的最大层级。超过设定层级的节点不会返回。默认10级，最大15，最小1
    limit: 500, // 每一级最大返回的数据。
    sortArr: [{ name: 'sort', type: 'asc' }], // 所有子节点的排序规则
    whereJson: {
      enable: true,
    },
  },
});
```

### 树状结构+or 查询条件@demo2

```js
let selectsRes = await vk.baseDao.selects({
  dbName: 'opendb-admin-menus',
  pageIndex: 1,
  pageSize: 500,
  whereJson: {
    enable: true,
    parent_id: _.in([null, '']),
    menu_id: _.exists(true),
  },
  sortArr: [{ name: 'sort', type: 'asc' }], // 主节点的排序规则
  // 树状结构参数
  treeProps: {
    id: 'menu_id', // 唯一标识字段，默认为 _id
    parent_id: 'parent_id', // 父级标识字段，默认为 parent_id
    children: 'children', // 自定义返回的下级字段名，默认为 children
    level: 3, // 查询返回的树的最大层级。超过设定层级的节点不会返回。默认10级，最大15，最小1
    limit: 500, // 每一级最大返回的数据。
    sortArr: [{ name: 'sort', type: 'asc' }], // 所有子节点的排序规则
    whereJson: $.or([
      {
        menu_id: _.eq('sys-user-manage'),
      },
      {
        menu_id: _.exists(false),
      },
    ]),
  },
});
```

### 树状结构+and+or 查询条件@demo3

```js
let selectsRes = await vk.baseDao.selects({
  dbName: 'opendb-admin-menus',
  pageIndex: 1,
  pageSize: 500,
  whereJson: {
    enable: true,
    parent_id: _.in([null, '']),
    menu_id: _.exists(true),
  },
  sortArr: [{ name: 'sort', type: 'asc' }], // 主节点的排序规则
  // 树状结构参数
  treeProps: {
    id: 'menu_id', // 唯一标识字段，默认为 _id
    parent_id: 'parent_id', // 父级标识字段，默认为 parent_id
    children: 'children', // 自定义返回的下级字段名，默认为 children
    level: 3, // 查询返回的树的最大层级。超过设定层级的节点不会返回。默认10级，最大15，最小1
    limit: 500, // 每一级最大返回的数据。
    sortArr: [{ name: 'sort', type: 'asc' }], // 所有子节点的排序规则
    whereJson: $.and([
      {
        menu_id: _.eq('sys-user-manage'),
      },
      $.or([
        {
          menu_id: _.eq('sys-user-manage2'),
        },
        {
          menu_id: _.exists(true),
        },
      ]),
    ]),
  },
});
```

### 树状结构+连表@demo4

连表时,`foreignDB` 属性只需写在主表下,无需写在 `treeProps` 内。(子表会继承主表的 `foreignDB` 属性)

```js
res = await vk.baseDao.selects({
  dbName: 'opendb-admin-menus',
  pageIndex: 1,
  pageSize: 500,
  whereJson: {
    enable: true,
    parent_id: _.in([null, '']),
    menu_id: _.exists(true),
  },
  sortArr: [{ name: 'sort', type: 'asc' }], // 主节点的排序规则
  // 树状结构参数
  treeProps: {
    id: 'menu_id', // 唯一标识字段,默认为 _id
    parent_id: 'parent_id', // 父级标识字段,默认为 parent_id
    children: 'children', // 自定义返回的下级字段名,默认为 children
    level: 3, // 查询返回的树的最大层级。超过设定层级的节点不会返回。默认10级,最大15,最小1
    limit: 500, // 每一级最大返回的数据
    sortArr: [{ name: 'sort', type: 'asc' }], // 所有子节点的排序规则
    whereJson: {
      enable: true,
    },
  },
  // 副表列表
  foreignDB: [
    {
      dbName: 'opendb-admin-roles', // 关联角色表
      localKey: 'role_id', // 菜单表的角色ID字段
      foreignKey: 'role_id', // 角色表的ID字段
      as: 'role_info', // 返回字段名
      limit: 1,
    },
    {
      dbName: 'uni-id-users', // 关联用户表
      localKey: 'create_user_id', // 菜单表的创建者ID字段
      foreignKey: '_id', // 用户表的ID字段
      as: 'create_user_info', // 返回字段名
      limit: 1,
    },
  ],
});
```

### 树状结构+推广关系@demo5

下方的代码效果是查询用户列表,并自动带出用户推广的用户列表(组成树状结构,支持带出多层)

```js
res = await vk.baseDao.selects({
  dbName: 'uni-id-users',
  pageIndex: 1,
  pageSize: 1000,
  whereJson: {
    inviter_uid: _.exists(false), // 查询顶级推广用户(没有上级的用户)
  },
  // 树状结构参数
  treeProps: {
    id: '_id',
    parent_id: $.arrayElemAt(['$inviter_uid', 0]), // 从数组中取出推广人ID
    children: 'children',
    level: 2, // 最多查2层推广关系
    limit: 1000,
    whereJson: {
      // 这里可以添加子节点的筛选条件,例如只查询已激活的用户
      // status: 1
    },
  },
});
```

## 返回数据格式示例@return

查询树状结构后,返回的数据格式如下:

```json
{
  "code": 0,
  "msg": "查询成功",
  "rows": [
    {
      "_id": "menu001",
      "menu_id": "sys-user",
      "name": "用户管理",
      "sort": 1,
      "enable": true,
      "children": [
        {
          "_id": "menu001-01",
          "menu_id": "sys-user-list",
          "parent_id": "sys-user",
          "name": "用户列表",
          "sort": 1,
          "enable": true,
          "children": []
        },
        {
          "_id": "menu001-02",
          "menu_id": "sys-user-add",
          "parent_id": "sys-user",
          "name": "新增用户",
          "sort": 2,
          "enable": true,
          "children": []
        }
      ]
    },
    {
      "_id": "menu002",
      "menu_id": "sys-role",
      "name": "角色管理",
      "sort": 2,
      "enable": true,
      "children": [
        {
          "_id": "menu002-01",
          "menu_id": "sys-role-list",
          "parent_id": "sys-role",
          "name": "角色列表",
          "sort": 1,
          "enable": true,
          "children": []
        }
      ]
    }
  ],
  "total": 2
}
```
