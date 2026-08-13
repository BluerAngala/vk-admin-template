# 云函数开发（vk-unicloud-admin）

## 架构概述

本项目使用 **单云函数架构**，所有后端请求都走 `router` 云函数，通过 URL 路径路由到对应的 service 文件。

```
前端请求：vk.callFunction({ url: 'user/pub/login', data: {...} })
    ↓
router 云函数接收（main.js）
    ↓ URL 匹配
service 文件（service/user/pub/login.js）
    ↓ 执行业务逻辑
返回结果
```

## 目录结构

```
uniCloud-alipay/cloudfunctions/router/
├── main.js                # 入口，URL 路由分发
├── package.json           # 依赖声明
├── dao/                   # 数据库操作层
│   ├── config.js          # 表名常量
│   ├── base.js            # BaseDao 类
│   └── modules/           # 自动发现 *Dao.js
├── middleware/            # 中间件
│   └── modules/           # URL 正则匹配，index 排序执行
├── service/               # 业务逻辑层
│   ├── admin/system/      # 系统管理：user/、role/、menu/、permission/
│   ├── user/              # 用户中心
│   │   ├── pub/           # 公开接口（无需登录）
│   │   ├── kh/            # 自助接口（需要登录）
│   │   └── sys/           # 管理接口（需要权限）
│   └── template/          # 示例代码
└── util/
    └── formRules.js       # 表单校验类
```

## Service 文件规范

### 基本结构

```js
// service/user/pub/login.js
module.exports = {
  /**
   * 用户登录
   * @url user/pub/login 前端调用的url参数地址
   * @description 用户登录接口
   * data 请求参数说明
   * @param {String} username 用户名
   * @param {String} password 密码
   * @param {String} captcha 图形验证码
   * res 返回参数说明
   * @param {Number} code 错误码，0表示成功
   * @param {String} msg 详细信息
   * @param {String} token 登录成功返回的token
   * @param {Object} userInfo 用户信息
   */
  main: async (event) => {
    let { data = {}, userInfo, util, originalParam } = event;
    let { uniID, config, pubFun, vk, db, _ } = util;
    let { username, password, captcha } = data;
    let res = { code: -1, msg: '' };
    
    // 业务逻辑开始-----------------------------------------------------------
    
    // 参数校验
    if (!username) {
      return { code: -1, msg: '用户名不能为空' };
    }
    if (!password) {
      return { code: -1, msg: '密码不能为空' };
    }
    
    // 调用 uni-id 登录
    res = await uniID.login({
      username,
      password,
      needPermission: true
    });
    
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  }
}
```

### 响应规范

```js
// 成功
return { code: 0, msg: '', data: {} };

// 失败
return { code: -1, msg: '错误描述' };

// 列表
return { code: 0, msg: '', rows: [], total: 0 };
```

### URL 路径规则

URL 路径 = 文件路径：

| 前端 URL | 后端文件 |
|---|---|
| `user/pub/login` | `service/user/pub/login.js` |
| `admin/system/user/sys/getList` | `service/admin/system/user/sys/getList.js` |
| `admin/system/role/sys/add` | `service/admin/system/role/sys/add.js` |

### 目录命名规范

- `pub/` — 公开接口，无需登录（如登录、注册、发送验证码）
- `kh/` — 自助接口，需要登录，只能操作自己的数据
- `sys/` — 管理接口，需要权限，可以操作所有数据

## 常用 API

### 数据库操作（vk.baseDao）

```js
// 查询单条
let user = await vk.baseDao.findById({
  dbName: "uni-id-users",
  id: "xxx",
  fieldJson: { username: true, nickname: true } // 可选，指定返回字段
});

// 查询单条（条件）
let user = await vk.baseDao.findByWhereJson({
  dbName: "uni-id-users",
  whereJson: { username: "admin" }
});

// 查询列表
let list = await vk.baseDao.select({
  dbName: "uni-id-users",
  whereJson: { status: 1 },
  fieldJson: { username: true, nickname: true },
  pageIndex: 1,
  pageSize: 20,
  sortArr: [{ name: "create_date", order: "desc" }]
});

// 计数
let count = await vk.baseDao.count({
  dbName: "uni-id-users",
  whereJson: { status: 1 }
});

// 新增
let res = await vk.baseDao.add({
  dbName: "uni-id-users",
  dataJson: { username: "test", nickname: "测试" }
});

// 修改
await vk.baseDao.updateById({
  dbName: "uni-id-users",
  id: "xxx",
  dataJson: { nickname: "新名称" }
});

// 修改（条件）
await vk.baseDao.update({
  dbName: "uni-id-users",
  whereJson: { status: 0 },
  dataJson: { status: 1 }
});

// 删除
await vk.baseDao.deleteById({
  dbName: "uni-id-users",
  id: "xxx"
});

// 删除（条件）
await vk.baseDao.delete({
  dbName: "uni-id-users",
  whereJson: { status: 0 }
});
```

### 用户认证（uniID）

```js
// 登录
let res = await uniID.login({
  username,
  password,
  needPermission: true
});

// 注册
let res = await uniID.register({
  username,
  password,
  needPermission: false
});

// 检查 Token
let res = await uniID.checkToken({
  needPermission: true,
  needUserInfo: true
});

// 发送短信验证码
await uniID.sendSmsCode({
  mobile,
  code,
  type: 'login',
  expiresIn: 180
});

// 验证短信验证码
await uniID.verifyCode({
  mobile,
  code,
  type: 'login'
});

// 重置密码
await uniID.resetPwd({
  uid,
  password
});
```

### 工具函数（vk.pubfn）

```js
// 判断是否为空
vk.pubfn.isNull(value); // null、undefined、''、[]、{} 都返回 true

// 随机数
vk.pubfn.random(6, "0123456789"); // 6位数字
vk.pubfn.random(32); // 32位随机字符串

// 正则校验
vk.pubfn.test("13800138000", "mobile"); // 手机号
vk.pubfn.test("test@qq.com", "email"); // 邮箱
vk.pubfn.test("abc123", "pwd"); // 密码

// 表单校验
let res = vk.pubfn.formValidate({
  data: { username: "", password: "" },
  rules: {
    username: [{ required: true, message: "请输入用户名" }],
    password: [{ required: true, message: "请输入密码" }]
  }
});

// 获取嵌套对象值
vk.pubfn.getData({ a: { b: { c: 1 } } }, "a.b.c"); // 返回 1

// 日期格式化
vk.pubfn.formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
```

## 中间件

中间件在 `middleware/modules/` 目录下，按 `index` 排序执行：

```js
// middleware/modules/checkLogin.js
module.exports = {
  index: 100, // 执行顺序，数字越小越先执行
  main: async (event) => {
    let { url, data, userInfo, util } = event;
    let { vk } = util;
    
    // 只处理需要登录的接口
    if (url.indexOf('user/kh/') === -1) return;
    
    // 检查是否登录
    if (!userInfo || !userInfo.uid) {
      return { code: -1, msg: '请先登录' };
    }
  }
}
```

## 事务

```js
// 开启事务
const transaction = await db.startTransaction();

try {
  // 操作1
  await transaction.collection("uni-id-users").doc(uid).update({
    balance: db.command.inc(-100)
  });
  
  // 操作2
  await transaction.collection("order").add({
    data: { user_id: uid, amount: 100 }
  });
  
  // 提交事务
  await transaction.commit();
} catch (err) {
  // 回滚事务
  await transaction.rollback();
  return { code: -1, msg: '操作失败' };
}
```

## 缓存

```js
// 设置缓存（带过期时间）
await vk.globalDataCache.set("key", value, 3600); // 1小时

// 获取缓存
let value = await vk.globalDataCache.get("key");

// 删除缓存
await vk.globalDataCache.delete("key");
```

## 常见场景

### 发送邮件验证码

```js
// 引入 vk-mail
let vkmail;
try {
  vkmail = require('vk-mail');
} catch (err) {
  return { code: -1, msg: "请先添加 vk-mail 依赖" };
}

// 发送验证码
let code = vk.pubfn.random(6, "0123456789");
let emailService = vkmail.createTransport({
  service: "qq",
  host: "smtp.qq.com",
  port: 465,
  secure: true,
  auth: {
    user: "your@qq.com",
    pass: "授权码"
  }
});

await emailService.sendMail({
  from: "your@qq.com",
  to: "target@qq.com",
  subject: "验证码",
  html: `<p>您的验证码是：<strong>${code}</strong>，3分钟内有效。</p>`
});

// 保存验证码
await uniID.setVerifyCode({
  email: "target@qq.com",
  code,
  expiresIn: 180,
  type: "reset-pwd"
});
```

## 开发 checklist

- [ ] service 文件有完整的 JSDoc 注释
- [ ] 参数校验在业务逻辑开始前完成
- [ ] 敏感操作有权限检查
- [ ] 数据库操作使用事务（多表写入时）
- [ ] 响应格式符合规范（code: 0 成功，-1 失败）
- [ ] 错误信息友好，不暴露技术细节
