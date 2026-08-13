---
sidebarDepth: 0
---

# Dao 层（2.0 版本）

:::warning 注意

vk-unicloud 版本需 ≥ 2.22.0，低版本请查看 [老版本文档](./dao1.md)

:::

## 概述

Dao 2.0 采用**类继承**方式：每个 Dao 继承 `BaseDao`，在构造函数中指定表名即可获得完整的 CRUD 及聚合能力。基本方法由基类实现，无需重复编写；仅在有特殊业务时再重写或新增方法。

## 注意事项

- Dao 层代码默认写在 `router/dao/modules/` 目录下
- 文件名必须以 `xxxDao.js` 结尾
- Dao 2.0 最终调用代码和 Dao 1.0 是完全一致的，均通过 `await vk.daoCenter.xxxDao.xxx()` 调用
- 尽量只写与数据库交互的代码，业务逻辑放在 service 层
- 新建 Dao 后若提示不存在，重新运行项目即可

## 表名配置

表名统一在 `dao/config.js` 中配置，通过 `Tables` 引用：

```js
// dao/config.js
module.exports = {
  test: 'vk-test',
  user: 'uni-id-users',
  // ...
};
```

在 Dao 中从 `base.js` 引入：

```js
const { BaseDao, Tables } = require('../base.js');
```

## 编写一个 Dao

1. 引入 `BaseDao` 和 `Tables`
2. 声明类并继承 `BaseDao`
3. 在 `constructor` 里调用 `super(obj)` 并设置 `this.tableName`

示例：

```js
const { BaseDao, Tables } = require('../base.js');

class DemoDao extends BaseDao {
  constructor(obj) {
    super(obj);
    this.tableName = Tables.test; // 指定当前 Dao 操作的表
  }
}

module.exports = DemoDao;
```

保存为 `router/dao/modules/demoDao.js` 后，即可通过 `vk.daoCenter.demoDao` 调用下方所有方法。

## BaseDao 提供的方法

以下方法均由 BaseDao 实现，子类无需重写即可使用。多数接口支持**简易调用**（直接传业务参数）和**完整调用**（传入 `db` 等以支持事务）。

### 查询单条

**findById** — 按 ID 查单条

```js
// 简易版
let info = await vk.daoCenter.demoDao.findById(id);

// 完整版（支持事务、指定字段）
let info = await vk.daoCenter.demoDao.findById({
  db,
  id: id,
  fieldJson: {
    name: 1,
    status: 1,
  },
});
```

**findByWhereJson** — 按条件查单条

```js
// 简易版
let info = await vk.daoCenter.demoDao.findByWhereJson({ status: 1 });

// 完整版
let info = await vk.daoCenter.demoDao.findByWhereJson({
  db,
  whereJson: {
    status: 1,
  },
  fieldJson: {
    name: 1,
  },
});
```

### 新增

**add** — 新增一条

```js
// 简易版
let res = await vk.daoCenter.demoDao.add({ name: '测试', status: 1 });

// 支持事务：第二参数传 db，或使用对象形式
let res = await vk.daoCenter.demoDao.add({ name: '测试' }, db);
let res = await vk.daoCenter.demoDao.add({
  db,
  dataJson: {
    name: '测试',
    status: 1,
  },
});
```

**adds** — 批量新增

```js
// 简易版
let res = await vk.daoCenter.demoDao.adds([
  { name: '测试1', status: 1 },
  { name: '测试2', status: 1 },
]);

// 完整版
let res = await vk.daoCenter.demoDao.adds({
  db,
  dataJson: [{ name: '测试1' }, { name: '测试2' }],
});
```

### 修改

**updateById** — 按 ID 更新

```js
let res = await vk.daoCenter.demoDao.updateById({
  id: id,
  dataJson: {
    name: '新名称',
  },
});

// 支持事务
let res = await vk.daoCenter.demoDao.updateById({
  db,
  id: id,
  dataJson: {
    name: '新名称',
  },
});
```

**update** — 按条件批量更新

```js
let res = await vk.daoCenter.demoDao.update({
  whereJson: {
    status: 1,
  },
  dataJson: {
    status: 2,
  },
});
```

**updateAndReturn** — 更新并返回更新后的那条数据（只更新匹配的第一条）

```js
let res = await vk.daoCenter.demoDao.updateAndReturn({
  whereJson: {
    status: 0,
  },
  dataJson: {
    status: 1,
  },
});

// 支持事务
let res = await vk.daoCenter.demoDao.updateAndReturn({
  db,
  whereJson: {
    status: 0,
  },
  dataJson: {
    status: 1,
  },
});
```

**setById** — 有则更新，无则插入（以 dataJson 中的 \_id 或传入的 id 为准）

```js
let res = await vk.daoCenter.demoDao.setById({
  dataJson: {
    _id: 'xxx',
    name: 'test',
  },
});

// 支持事务
let res = await vk.daoCenter.demoDao.setById({
  db,
  dataJson: {
    _id: 'xxx',
    name: 'test',
  },
});
```

### 删除

**deleteById** — 按 ID 删一条

```js
let res = await vk.daoCenter.demoDao.deleteById(id);
// 支持事务
let res = await vk.daoCenter.demoDao.deleteById(id, db);
```

**del** — 按条件删多条

```js
let res = await vk.daoCenter.demoDao.del(whereJson);
let res = await vk.daoCenter.demoDao.del(whereJson, db);
```

### 统计与聚合

**count** — 条件计数

```js
let count = await vk.daoCenter.demoDao.count(whereJson);
let count = await vk.daoCenter.demoDao.count(whereJson, db);
```

**sum / max / min / avg** — 求和、最大值、最小值、平均值

```js
let sum = await vk.daoCenter.demoDao.sum({
  fieldName: 'amount',
  whereJson: { status: 1 },
});
let max = await vk.daoCenter.demoDao.max({
  fieldName: 'amount',
  whereJson: { status: 1 },
});
let min = await vk.daoCenter.demoDao.min({
  fieldName: 'amount',
  whereJson: { status: 1 },
});
let avg = await vk.daoCenter.demoDao.avg({
  fieldName: 'amount',
  whereJson: { status: 1 },
});
```

均支持在参数中传入 `db` 以配合事务。

### 列表查询

**select** — 分页列表（不联表，性能更好）

```js
let res = await vk.daoCenter.demoDao.select({
  pageIndex: 1,
  pageSize: 20,
  getCount: true,
  whereJson: { status: 1 },
  fieldJson: { name: 1, status: 1 },
  sortArr: [{ name: "_id", type: "desc" ]
});
// res.rows / res.total / res.hasMore / res.pagination 等
```

**selects** — 分页列表（支持联表）

```js
let res = await vk.daoCenter.demoDao.selects({
  pageIndex: 1,
  pageSize: 20,
  getCount: true,
  whereJson: { status: 1 },
  fieldJson: { name: 1, status: 1 },
  sortArr: [{ name: '_id', type: 'desc' }],
  foreignDB: [
    {
      dbName: 'vk-test-2', // 副表表名
      localKey: 'user_id', // 主表外键
      foreignKey: '_id', // 副表外键
      as: 'userInfo', // 连表结果别名
      limit: 1, // 1 条则以对象返回，否则数组
      whereJson: { deleted: false },
      fieldJson: { name: 1, age: 1 },
    },
  ],
});
```

**foreignDB** 支持多级嵌套

**getTableData** — 表格数据（参数同 selects，默认 `getCount: true`）

```js
let res = await vk.daoCenter.demoDao.getTableData({
  data, // vk-admin 万能表格传入的 data
});

// 强制追加 where 条件
let res = await vk.daoCenter.demoDao.getTableData({
  data,
  whereJson: { status: 1 },
});
```

## 自定义与重写

- **只加表名**：只写 `constructor` + `this.tableName`，即可使用上述全部方法。
- **重写方法**：在子类中写同名方法，实现自定义。
- **新增方法**：在子类中直接写新方法，需要时使用 `this.collection` 或调用 `this.findByWhereJson`、`this.dao.xxx` 等。

### 重写示例

```js
/**
 * 获取用户信息（重写父类方法，增加默认字段过滤）
 * 调用示例
 * await vk.daoCenter.userDao.findById(user_id);
 * data 请求参数说明
 * @param {String|Object} condition - 用户ID或包含db、id、fieldJson的对象
 * @param {Object} [fieldJson] - 字段显示规则，默认不显示 token 和 password
 * @returns {Promise<Object>} 返回用户信息对象，默认不包含 token 和 password 字段
 */
async findById(condition, fieldJson = userFieldJson) {
	let res = {};
	// 数据库操作开始-----------------------------------------------------------
	if (typeof condition === "object") {
		// 支持事务和指定db对象（此处要用 this.dao.findById，等价于 vk.baseDao.findById）
		res = await this.dao.findById({
			...condition,
			dbName: this.tableName,
			fieldJson: condition.fieldJson || fieldJson
		});
	} else {
		// 不支持事务（此处要用 this.dao.findById，等价于 vk.baseDao.findById）
		res = await this.dao.findById({
			dbName: this.tableName,
			id: condition,
			fieldJson
		});
	}
	// 数据库操作结束-----------------------------------------------------------
	return res;
}
```

### 自定义示例

```js
/**
 * 获取一个未被使用的7位数分享码（此函数请勿删除）
 * @param {Object} [data={}] 参数对象
 * @param {String} [data.my_invite_code] 自定义邀请码（可选）
 * @returns {Promise<String>} 返回一个未被使用的7位数邀请码字符串
 * 调用示例
await vk.daoCenter.userDao.getValidInviteCode();
 */
async getValidInviteCode(data = {}) {
	// 数据库操作开始-----------------------------------------------------------
	let {
		my_invite_code
	} = data;
	if (my_invite_code) {
		// 如果用户传了自定义的分享码，也需要判断下是否存在
		let num = await this.count({
			my_invite_code
		});
		if (num === 0) {
			return my_invite_code;
		}
	}
	let inviteCode = await this.vk.pubfn.randomAsync(7, "23456789ABCDEFGHJKLMNPQRSTUVWXYZ", async (val) => {
		let num = await this.count({
			my_invite_code: val
		});
		return num === 0 ? true : false;
	}, 10); // 最大重试10次
	// 数据库操作结束-----------------------------------------------------------
	return inviteCode;
}
```

### 使用传统语句示例

```js
/**
 * 对记录进行分组
 * 调用示例，将 [0, 50) 分为一组，[50, 100) 分为一组，其他分为一组
await vk.daoCenter.userDao.getPriceBucket([0, 50, 100]);
 */
async getPriceBucket(boundaries) {
  const { _, $ } = this;
  let { data: list } = await this.collection(this.tableName).aggregate()
    .bucket({
      groupBy: '$price',
      boundaries: boundaries,
      default: 'other',
      output: {
        count: $.sum(1),
        ids: $.push('$_id')
      }
    })
    .end();
  return list;
}
```

## 与 BaseDao 的关系

- **BaseDao**：通用底层封装，不绑定具体表，需要每次传入 `dbName`。
- **Dao 2.0**：继承 BaseDao，在子类中绑定 `this.tableName`，调用时不再传表名，代码更简洁、表名集中配置，便于维护。

表名统一在 `dao/config.js` 维护
