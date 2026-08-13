# 代码规范

## 命名规范

### 代码命名

| 类型 | 规范 | 示例 |
|---|---|---|
| 变量 | camelCase | `userInfo`、`createTime` |
| 数据库字段 | snake_case | `user_id`、`create_time` |
| 数据库表名 | kebab-case | `uni-id-users`、`order-detail` |
| Vuex 模块 | `$` 前缀 | `$app`、`$user`、`$error` |
| 组件 | 前缀区分 | `vk-data-*`（框架）、`custom-*`（自定义） |

### 文件 / 目录命名

| 类型 | 规范 | 示例 |
|---|---|---|
| 页面目录 | kebab-case | `pages/my-products/`、`pages/card-manage/` |
| 通用组件目录 | kebab-case | `components/service-qrcode/`、`components/product-card/` |
| 页面子组件文件 | PascalCase | `pages/my-products/components/ProductCard.vue` |
| 组件入口文件 | index.vue | `components/service-qrcode/index.vue` |
| 组件文件名 | PascalCase | `ProductCard.vue`、`ServiceQrcode.vue` |
| 静态资源 | kebab-case | `static/service-qrcode.png` |
| 云函数目录 | kebab-case | `uniCloud-alipay/cloudfunctions/` |
| 配置文件 | camelCase 或 kebab-case | `app.config.js`、`pages.json` |

**规则总结**：
- 目录一律 kebab-case（`my-products`、`service-qrcode`）
- `.vue` 文件一律 PascalCase（`ProductCard.vue`）
- 模板中使用 kebab-case 引用（`<product-card>`、`<service-qrcode>`）

## 前端常用代码

```js
let vk = uni.vk;                          // 全局 vk 实例

// Vuex 操作
vk.getVuex('$user.userInfo')              // 读 Vuex
vk.setVuex('$user.userInfo.avatar', url)  // 写 Vuex（支持点号路径）

// 云函数调用
vk.callFunction({ url: '...', data: {} }) // 调云函数

// 权限检查
$hasRole('admin')                         // 角色检查
$hasPermission('user-add')                // 权限检查

// 导航
vk.navigateTo({ url: '/pages/xxx' })
vk.navigateBack()
vk.redirectTo({ url: '/pages/xxx' })
vk.reLaunch({ url: '/pages/index/index' })
vk.navigateToHome()

// 提示
vk.toast('操作成功', 'success')
vk.confirm('确认删除？', () => {})
vk.alert('提示信息')

// Token
vk.checkToken()                          // 检查本地 Token
vk.getToken()
vk.setToken(token)
vk.removeToken()
```

## Admin CRUD 页面模板

```vue
<template>
  <view class="page-body">
    <!-- 查询条件 -->
    <vk-data-table-query v-model="queryForm" :columns="queryColumns" @query="onQuery" />
    
    <!-- 数据表格 -->
    <vk-data-table 
      :data="list" 
      :columns="columns" 
      :loading="loading"
      @edit="onEdit"
      @delete="onDelete"
    />
    
    <!-- 新增按钮 -->
    <view class="btn-add" @click="onAdd">
      <text>新增</text>
    </view>
  </view>
</template>
```

## 格式化（Prettier）

```json
{
  "printWidth": 180,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "vueIndentScriptAndStyle": true
}
```

**特殊规则**：`config.js` 和 `uni-config-center/**/*.js` 用双引号（overrides）。

## 开发方式

| 操作 | 方法 |
|---|---|
| 运行 | HBuilderX → 运行到 Chrome（H5） |
| 构建 | HBuilderX → 发行到 Web |
| 上传云函数 | HBuilderX → 上传 uniCloud 云函数 |
| 格式化 | `prettier --write .` |

**无 CLI 构建脚本**，纯 HBuilderX 项目。

## 后端 Service 格式

### 旧版格式（admin/system/ 主要用）

```js
module.exports = {
  main: async (event) => {
    let { data = {}, userInfo, util, originalParam } = event;
    let { uniID, config, pubFun, vk, db, _ } = util;
    let res = { code: -1, msg: '' };
    
    // 业务逻辑开始-----------------------------------------------------------
    // ...
    // 业务逻辑结束-----------------------------------------------------------
    
    return res;
  }
}
```

### Cloud Object 格式（新服务用）

```js
module.exports = {
  isCloudObject: true,
  _before: async function() {
    // 前置钩子
  },
  main: async (event) => {
    // 业务逻辑
  },
  _after: async function(err, result) {
    // 后置钩子
  }
}
```

**响应规范**：
- 成功：`{ code: 0, msg: '', data: {} }`
- 失败：`{ code: -1, msg: '错误描述' }`
- 列表：`{ code: 0, msg: '', rows: [], total: 0 }`

## 安全规则

- 前端表单校验 + 后端参数校验必须做
- 敏感操作需要权限检查
- 大改动先说明方案，等用户确认后再执行
