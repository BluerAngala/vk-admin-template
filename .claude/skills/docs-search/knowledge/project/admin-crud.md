# 系统管理功能开发（vk-unicloud-admin）

本文档覆盖用户/角色/权限/菜单等管理后台 CRUD 功能的开发规范。

## 核心概念

### 权限模型

```
用户 (uni-id-users)
  └─ 角色 (uni-id-roles)        ← 一个用户可有多个角色
       └─ 权限 (uni-id-permissions) ← 一个角色可有多个权限
```

- `admin` 角色跳过所有权限检查
- `$hasRole('admin')` — 检查当前用户是否有某角色
- `$hasPermission('user-add')` — 检查当前用户是否有某权限

### 菜单系统

菜单存储在 `static_menu/menu.json` + 云端动态菜单，树形结构：

```json
{
  "menu_id": "system_user",
  "name": "用户管理",
  "icon": "el-icon-user",
  "url": "/pages_plugs/system/user/list",
  "parent_id": "system",
  "sort": 1
}
```

- `leftWindow.vue` 从 Vuex 读取菜单并渲染
- 新增页面必须在 `menu.json` 或云端添加记录

### 数据库操作

**不使用 `<unicloud-db>` 组件**，使用 `vk.callFunction()` 调用 router 云函数：

```js
// 查询列表
vk.callFunction({
  url: 'admin/system/user/sys/getList',
  data: {
    pageIndex: 1,
    pageSize: 20,
    whereJson: { status: 1 }
  },
  success: (data) => {
    this.list = data.rows;
    this.total = data.total;
  }
});

// 新增
vk.callFunction({
  url: 'admin/system/user/sys/add',
  data: { username: 'test', nickname: '测试' },
  success: (data) => {
    vk.toast('添加成功');
  }
});

// 修改
vk.callFunction({
  url: 'admin/system/user/sys/update',
  data: { _id: 'xxx', nickname: '新名称' },
  success: (data) => {
    vk.toast('修改成功');
  }
});

// 删除
vk.callFunction({
  url: 'admin/system/user/sys/delete',
  data: { _id: 'xxx' },
  success: (data) => {
    vk.toast('删除成功');
  }
});
```

## CRUD 页面开发

### 列表页模板

参考 `pages_plugs/system/user/list.vue`：

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
    
    <!-- 分页 -->
    <el-pagination 
      :current-page="pageIndex" 
      :page-size="pageSize" 
      :total="total"
      @current-change="onPageChange"
    />
  </view>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      total: 0,
      pageIndex: 1,
      pageSize: 20,
      loading: false,
      queryForm: {},
      queryColumns: [
        { field: 'username', label: '用户名', type: 'input' },
        { field: 'status', label: '状态', type: 'select', data: [...] }
      ],
      columns: [
        { field: 'username', label: '用户名' },
        { field: 'nickname', label: '昵称' },
        { field: 'status', label: '状态' },
        { field: 'create_date', label: '创建时间' }
      ]
    }
  },
  onLoad() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      vk.callFunction({
        url: 'admin/system/user/sys/getList',
        data: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          whereJson: this.queryForm
        },
        success: (data) => {
          this.list = data.rows;
          this.total = data.total;
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    onQuery() {
      this.pageIndex = 1;
      this.getList();
    },
    onPageChange(page) {
      this.pageIndex = page;
      this.getList();
    },
    onEdit(row) {
      vk.navigateTo({ url: './form?id=' + row._id });
    },
    onDelete(row) {
      vk.confirm('确认删除？', () => {
        vk.callFunction({
          url: 'admin/system/user/sys/delete',
          data: { _id: row._id },
          success: () => {
            vk.toast('删除成功');
            this.getList();
          }
        });
      });
    }
  }
}
</script>
```

### 表单页模板

参考 `pages_plugs/system/user/form/index.vue`：

```vue
<template>
  <view class="page-body">
    <el-form ref="form" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="用户名" prop="username" required>
        <el-input v-model="formData.username" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname" required>
        <el-input v-model="formData.nickname" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="formData.role" multiple>
          <el-option v-for="item in roleList" :key="item._id" :label="item.role_name" :value="item.role_id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">保存</el-button>
        <el-button @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        username: '',
        nickname: '',
        role: []
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
      },
      isEdit: false,
      roleList: []
    }
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true;
      this.getDetail(options.id);
    }
    this.getRoleList();
  },
  methods: {
    getDetail(id) {
      vk.callFunction({
        url: 'admin/system/user/sys/getDetail',
        data: { _id: id },
        success: (data) => {
          this.formData = data;
        }
      });
    },
    getRoleList() {
      vk.callFunction({
        url: 'admin/system/role/sys/getList',
        data: { pageSize: 100 },
        success: (data) => {
          this.roleList = data.rows;
        }
      });
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        
        const url = this.isEdit 
          ? 'admin/system/user/sys/update' 
          : 'admin/system/user/sys/add';
        
        vk.callFunction({
          url,
          data: this.formData,
          success: () => {
            vk.toast('保存成功');
            this.goBack();
          }
        });
      });
    },
    goBack() {
      vk.navigateBack();
    }
  }
}
</script>
```

## 后端 Service 开发

### Service 文件结构

参考 `router/service/admin/system/user/sys/getList.js`：

```js
module.exports = {
  /**
   * 获取用户列表
   * @url admin/system/user/sys/getList 前端调用的url参数地址
   * data 请求参数说明
   * @param {Number} pageIndex 页码
   * @param {Number} pageSize 每页数量
   * @param {Object} whereJson 筛选条件
   */
  main: async (event) => {
    let { data = {}, userInfo, util, originalParam } = event;
    let { uniID, config, pubFun, vk, db, _ } = util;
    let { pageIndex = 1, pageSize = 20, whereJson = {} } = data;
    let res = { code: 0, msg: '', rows: [], total: 0 };
    
    // 业务逻辑开始-----------------------------------------------------------
    
    // 查询数据
    let countRes = await vk.baseDao.count({
      dbName: "uni-id-users",
      whereJson: whereJson
    });
    
    let listRes = await vk.baseDao.select({
      dbName: "uni-id-users",
      whereJson: whereJson,
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortArr: [{ name: "create_date", order: "desc" }]
    });
    
    res.rows = listRes;
    res.total = countRes;
    
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

### 常用 vk.baseDao 方法

```js
// 查询单条
let user = await vk.baseDao.findById({
  dbName: "uni-id-users",
  id: "xxx"
});

// 查询列表
let list = await vk.baseDao.select({
  dbName: "uni-id-users",
  whereJson: { status: 1 },
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

// 删除
await vk.baseDao.deleteById({
  dbName: "uni-id-users",
  id: "xxx"
});
```

## 新增管理功能 checklist

- [ ] 数据库 schema 已创建（如有新表）
- [ ] 后端 service 文件已创建（getList、getDetail、add、update、delete）
- [ ] 列表页已创建，使用 `vk-data-table` 组件
- [ ] 表单页已创建，使用 Element UI 表单组件
- [ ] `pages.json` 中已注册所有新页面路径
- [ ] `static_menu/menu.json` 中已添加菜单记录
- [ ] 权限已配置（如需要）
- [ ] 前端表单校验 + 后端参数校验已做
