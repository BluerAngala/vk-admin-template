# 开发新页面（vk-unicloud-admin）

## 流程

1. 在 `pages.json` 中注册页面路径
2. 创建 `.vue` 文件
3. 使用 `vk.callFunction()` 调用后端接口
4. 如需菜单入口，在 `static_menu/menu.json` 中添加记录

## ⚠️ 必须使用 uni-app 组件

**本项目是 uni-app，不是 Vue Web，禁止使用原生 HTML 标签：**

| ❌ 错误（Web） | ✅ 正确（uni-app） |
|---|---|
| `<div>` | `<view>` |
| `<span>`、`<p>`、`<h1>` | `<text>` |
| `<img>` | `<image>` |
| `<a href>` | `<view @click="navigateTo">` |
| `<input type="checkbox">` | `<checkbox-group>` + `<checkbox>` |
| `<select>` | `<picker>` |

## 页面模板

### 管理页面（使用 vk-data-table）

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

<script>
let vk = uni.vk;

export default {
  data() {
    return {
      list: [],
      loading: false,
      queryForm: {},
      queryColumns: [
        { field: 'name', label: '名称', type: 'input' }
      ],
      columns: [
        { field: 'name', label: '名称' },
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
        url: 'your/api/getList',
        data: this.queryForm,
        success: (data) => {
          this.list = data.rows;
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    onQuery() {
      this.getList();
    },
    onAdd() {
      vk.navigateTo({ url: './form' });
    },
    onEdit(row) {
      vk.navigateTo({ url: './form?id=' + row._id });
    },
    onDelete(row) {
      vk.confirm('确认删除？', () => {
        vk.callFunction({
          url: 'your/api/delete',
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

### 表单页面

```vue
<template>
  <view class="page-body">
    <view class="form-item">
      <text class="label">名称 <text class="required">*</text></text>
      <input class="input" v-model="formData.name" placeholder="请输入名称" />
    </view>
    
    <view class="form-item">
      <text class="label">描述</text>
      <textarea class="textarea" v-model="formData.desc" placeholder="请输入描述" />
    </view>
    
    <view class="btn-group">
      <view class="btn-primary" @click="submitForm">
        <text>保存</text>
      </view>
      <view class="btn-default" @click="goBack">
        <text>返回</text>
      </view>
    </view>
  </view>
</template>

<script>
let vk = uni.vk;

export default {
  data() {
    return {
      formData: {
        name: '',
        desc: ''
      },
      isEdit: false
    }
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true;
      this.getDetail(options.id);
    }
  },
  methods: {
    getDetail(id) {
      vk.callFunction({
        url: 'your/api/getDetail',
        data: { _id: id },
        success: (data) => {
          this.formData = data;
        }
      });
    },
    submitForm() {
      if (!this.formData.name) {
        vk.toast('请输入名称', 'none');
        return;
      }
      
      const url = this.isEdit ? 'your/api/update' : 'your/api/add';
      
      vk.callFunction({
        url,
        data: this.formData,
        success: () => {
          vk.toast('保存成功');
          this.goBack();
        }
      });
    },
    goBack() {
      vk.navigateBack();
    }
  }
}
</script>

<style lang="scss" scoped>
.page-body {
  padding: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.required {
  color: #f56c6c;
}

.input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.textarea {
  width: 100%;
  height: 100px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.btn-group {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary {
  padding: 10px 24px;
  background-color: #409eff;
  color: #fff;
  border-radius: 4px;
}

.btn-default {
  padding: 10px 24px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
```

## uni-app 开发要点

### 导航

```js
// 跳转页面
vk.navigateTo({ url: '/pages/xxx' });

// 返回
vk.navigateBack();

// 重定向
vk.redirectTo({ url: '/pages/xxx' });

// 重启（清空页面栈）
vk.reLaunch({ url: '/pages/index/index' });
```

### 路由参数

```js
// 传递参数
vk.navigateTo({ url: '/pages/xxx?id=123&name=test' });

// 接收参数（在 onLoad 中）
onLoad(options) {
  const id = options.id;
  const name = options.name;
}
```

### 数据存储

```js
// 同步存储
uni.setStorageSync('key', value);
uni.getStorageSync('key');
uni.removeStorageSync('key');

// Vuex（推荐）
vk.getVuex('$user.userInfo');
vk.setVuex('$user.userInfo.avatar', url);
```

### 提示框

```js
// 轻提示
vk.toast('操作成功', 'success');
vk.toast('请输入名称', 'none');

// 确认框
vk.confirm('确认删除？', () => {
  // 确认回调
});

// 弹窗
vk.alert('提示信息');
```

### 生命周期

```js
export default {
  onLoad(options) {
    // 页面加载，路由参数在这里拿
  },
  onShow() {
    // 页面显示（从后台切回也会触发）
  },
  onReady() {
    // 首次渲染完成
  },
  onHide() {
    // 页面隐藏
  },
  onPullDownRefresh() {
    // 下拉刷新
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1000);
  }
}
```

### 样式规范

```scss
/* 使用 rpx 单位（750rpx = 屏幕宽度） */
.container {
  padding: 20rpx;
  font-size: 28rpx;
}

/* 也可以使用 px（H5 环境） */
.container {
  padding: 20px;
  font-size: 14px;
}

/* 响应式 */
@media screen and (max-width: 480px) {
  .container {
    padding: 12px;
  }
}
```

## 组件化开发

**页面应该由多个子组件拼凑，不要把所有代码写在一个文件里：**

```
pages/
├── user/
│   ├── index.vue           # 主页面（布局+编排）
│   └── components/
│       ├── user-search.vue # 搜索条件
│       ├── user-table.vue  # 表格展示
│       └── user-form.vue   # 新增/编辑表单
```

详见 [组件化开发指南](../../docs/COMPONENTS.md)

## 新页面 checklist

- [ ] `pages.json` 中已注册路径
- [ ] 标签全部是 uni-app 组件（view/text/image）
- [ ] 跳转用 `vk.navigateTo`，不用 vue-router
- [ ] 数据请求用 `vk.callFunction()`
- [ ] 生命周期用 `onLoad`/`onShow`，不用 `created`/`mounted`
- [ ] 样式使用 scoped，避免污染
- [ ] 如需菜单入口，已添加到 `static_menu/menu.json`
- [ ] 单文件不超过 300 行，超过就拆分组件
