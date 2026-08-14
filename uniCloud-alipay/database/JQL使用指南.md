# JQL 数据库操作指南

> 本文档用于 HBuilderX 中快速查阅 JQL 语法，方便数据迁移和调试。
>
> **重要**：数据迁移优先使用云函数（见 `cloudfunctions/migration/`），JQL 仅用于临时调试。
>
> 官方文档：
> - [JQL 语法总览](https://doc.dcloud.net.cn/uniCloud/jql.html)
> - [JQL 调试器（JQL Runner）](https://doc.dcloud.net.cn/uniCloud/jql-runner.html)
> - [JQL 常用运算方法](https://doc.dcloud.net.cn/uniCloud/jql-operator-example.html)

---

## 一、JQL Runner 使用方法

在 HBuilderX 中直接执行数据库语句，无需写云函数。

### 操作步骤

1. 在项目 `uniCloud-alipay/database/` 目录下右键 → **新建 JQL 数据库管理**（或直接用已有的 `.jql` 文件）
2. 写入 JQL 语句
3. 选中要执行的语句，按 **F5** 或 **Ctrl+R** 运行

### 注意事项

- JQL 文件**必须放在 `database/` 根目录下**，子目录中的 `.jql` 文件不会被 HBuilderX 识别
- 可以全部运行，也可以**选中部分代码运行**
- 如果文件中有多条 JQL 语句，**只有最后一条生效**（选中多条时同理）
- 此处运行**不受 DB Schema 权限控制**，移植到实际业务时需在 schema 中配好 permission
- 不支持 clientDB 的 action
- 查询有最大返回条数限制（默认 1000 条）

---

## 二、查询数据

### 基础查询

```javascript
// 查询所有记录
db.collection("vk-products").get()

// 查询单条记录（按 _id）
db.collection("vk-products").doc("记录ID").get()

// 按条件查询
db.collection("vk-products")
  .where({ status: 1 })
  .get()

// 模糊查询（包含关键词）
db.collection("vk-products")
  .where(new RegExp("AI").test("product_name"))
  .get()
```

### 条件查询（where）

```javascript
// 等于
.where({ status: 1 })

// 不等于（用 db.command）
const _ = db.command
.where({ status: _.neq(0) })

// 大于 / 小于
const _ = db.command
.where({ price_points: _.gt(10) })
.where({ sort: _.lte(100) })

// 多条件 AND（对象多个 key）
.where({ status: 1, product_type: "software" })

// 多条件 OR
const _ = db.command
.where(_.or([
  { status: 0 },
  { status: 1 }
]))

// IN 查询（值在数组中）
const _ = db.command
.where({ product_type: _.in(["software", "plugin"]) })

// 字段存在且数组非空
const _ = db.command
.where({ version_logs: _.exists(true) })
```

### 排序、分页、限制

```javascript
// 排序（asc 升序，desc 降序）
db.collection("vk-products")
  .orderBy("sort", "asc")
  .orderBy("_add_time", "desc")
  .get()

// 分页（skip 跳过，limit 限制）
db.collection("vk-products")
  .skip(0)
  .limit(20)
  .get()

// 只返回指定字段
db.collection("vk-products")
  .field("product_id, product_name, product_type, status")
  .get()

// 只返回一条
db.collection("vk-products")
  .where({ product_id: "ai-script" })
  .getOne()
```

### 统计

```javascript
// 计数
db.collection("vk-products")
  .where({ status: 1 })
  .count()

// 求和（需用聚合）
db.collection("vk-user-points")
  .aggregate()
  .group({
    _id: "$user_id",
    totalPoints: $.sum("$points")
  })
  .end()
```

---

## 三、新增数据

```javascript
// 新增单条
db.collection("vk-product-categories").add({
  value: "template",
  label: "模板",
  icon: "el-icon-document",
  sort: 40,
  enable: true,
  _add_time: Date.now()
})

// 新增多条
db.collection("vk-product-categories").add([
  { value: "template", label: "模板", sort: 40, enable: true },
  { value: "service", label: "服务", sort: 50, enable: true }
])
```

---

## 四、更新数据

```javascript
// 按 _id 更新
db.collection("opendb-admin-menus")
  .doc("记录ID")
  .update({
    name: "销售统计",
    parent_id: "system-uni-product-center"
  })

// 按条件更新（where 传对象）
db.collection("opendb-admin-menus")
  .where({ _id: "system-uni-product-manage" })
  .update({
    parent_id: "system-uni-product-center",
    sort: 0
  })

// 更新多条
db.collection("vk-products")
  .where({ product_type: "old_type" })
  .update({
    product_type: "new_type"
  })
```

---

## 五、删除数据

```javascript
// 按 _id 删除
db.collection("vk-product-categories")
  .doc("记录ID")
  .remove()

// 按条件删除
db.collection("vk-product-categories")
  .where({ enable: false })
  .remove()
```

---

## 六、常用运算方法

> 完整列表见 [JQL 常用运算方法](https://doc.dcloud.net.cn/uniCloud/jql-operator-example.html)

### 字段拼接与格式化

```javascript
// 字符串拼接
db.collection("vk-products")
  .field('concat(product_name, " - ", product_type) as display_name')
  .get()

// 日期格式化（时间戳转日期字符串）
db.collection("vk-points-log")
  .field('dateToString(add(new Date(0), _add_time), "%Y-%m-%d %H:%M", "+0800") as add_time_str')
  .get()
```

### 数组操作

```javascript
// 数组长度
db.collection("vk-products")
  .field('size(custom_user_ids) as user_count')
  .get()

// 数组包含判断（使用 db.command）
const _ = db.command
db.collection("vk-products")
  .where({ custom_user_ids: _.elemMatch(_.eq("user123")) })
  .get()
```

### 分组统计

```javascript
// 按产品类型统计数量
db.collection("vk-products")
  .groupBy("product_type")
  .groupField("count(*) as total")
  .get()

// 按日期统计（时间戳转日期后分组）
db.collection("vk-points-log")
  .groupBy('dateToString(add(new Date(0), _add_time), "%Y-%m-%d", "+0800") as date')
  .groupField("count(*) as total, sum(points) as total_points")
  .get()
```

---

## 七、本项目常用表

| 表名 | 说明 |
|---|---|
| `vk-products` | 产品表 |
| `vk-product-categories` | 产品分类表 |
| `vk-display-config` | 展示配置表 |
| `vk-card-key` | 卡密表 |
| `vk-user-points` | 用户积分表 |
| `vk-points-log` | 积分流水表 |
| `vk-user-products` | 用户产品关联表 |
| `vk-tickets` | 工单表 |
| `vk-ticket-replies` | 工单回复表 |
| `vk-invite-rebate-log` | 邀请返利记录表 |
| `vk-pay-orders` | 支付订单表 |
| `vk-recharge-orders` | 充值订单表 |
| `vk-blacklist` | 黑名单表 |
| `opendb-admin-menus` | 后台菜单表 |
| `uni-id-users` | 用户表 |

---

## 八、迁移脚本编写规范

**推荐方式**：在 `cloudfunctions/migration/` 云函数中编写迁移逻辑，通过 `callFunction({ name: 'migration', data: { action: 'all' } })` 调用，支持幂等和错误处理。

**JQL 方式**（仅用于临时调试）：

编写数据迁移脚本时，遵循以下规范：

1. **文件位置**：必须放在 `database/` 根目录，HBuilderX 不识别子目录中的 `.jql` 文件
2. **文件命名**：数字前缀 + 中文描述 + `.jql` 后缀，如 `1-新增产品中心父菜单.jql`
2. **逐条执行**：每条语句独立可执行，不依赖执行顺序时用空行分隔
3. **加注释**：每条语句上方写明用途
4. **幂等性**：尽量使用 `where + update` 而非 `add`，避免重复执行产生脏数据
5. **先查后改**：不确定数据状态时，先用 `get()` 确认再执行修改

### 示例：安全的迁移脚本

```javascript
// 检查是否已存在（避免重复插入）
// 如果返回 0 条，再执行 add

// 1. 新增菜单（如已存在会报主键冲突，可忽略）
db.collection("opendb-admin-menus").add({
  "menu_id": "system-uni-product-center",
  "name": "产品中心",
  "icon": "el-icon-s-goods",
  "sort": -1,
  "parent_id": "system-uni",
  "enable": true
});

// 2. 更新已有记录（where + update，可重复执行）
db.collection("opendb-admin-menus")
  .where({ _id: "system-uni-product-manage" })
  .update({
    "parent_id": "system-uni-product-center",
    "sort": 0
  });
```
