# API 参考（vk-unicloud-admin）

## vk-unicloud 核心 API

### vk.callFunction()

调用云函数（router）的统一方法：

```js
vk.callFunction({
  url: 'admin/system/user/sys/getList',  // 必填，service 文件路径
  data: { pageIndex: 1, pageSize: 20 },  // 请求参数
  loading: true,                         // 是否显示 loading
  title: '加载中...',                    // loading 文字
  success: (data) => {},                 // 成功回调
  fail: (err) => {},                     // 失败回调
  complete: () => {}                     // 完成回调（无论成功失败）
});
```

### vk.userCenter

用户认证相关：

```js
// 登录
vk.userCenter.login({
  data: { username, password, captcha },
  success: (data) => {
    // data.token, data.userInfo
  }
});

// 注册
vk.userCenter.register({
  data: { username, password, email, captcha },
  success: (data) => {}
});

// 退出登录
vk.userCenter.logout({
  success: () => {}
});

// 检查 Token
vk.userCenter.checkToken({
  loading: true,
  success: (data) => {
    // data.userInfo
  }
});

// 获取用户信息
vk.userCenter.getUserInfo({
  success: (data) => {
    // data.userInfo
  }
});
```

### vk 导航

```js
// 跳转页面
vk.navigateTo({ url: '/pages/xxx' });

// 返回上一页
vk.navigateBack();

// 重定向
vk.redirectTo({ url: '/pages/xxx' });

// 重启应用（清空页面栈）
vk.reLaunch({ url: '/pages/index/index' });

// 跳转到首页
vk.navigateToHome();
```

### Vuex 操作

```js
// 读取
vk.getVuex('$user.userInfo');
vk.getVuex('$app.navMenu');

// 写入（支持点号路径）
vk.setVuex('$user.userInfo.avatar', url);
vk.setVuex('$app.inited', false);
```

### 提示框

```js
// 轻提示
vk.toast('操作成功', 'success');
vk.toast('请输入名称', 'none');
vk.toast('加载中', 'loading');

// 确认框
vk.confirm('确认删除？', () => {
  // 确认回调
}, () => {
  // 取消回调（可选）
});

// 弹窗
vk.alert('提示信息', () => {
  // 确认回调
});
```

### Token 管理

```js
// 检查本地 Token 是否存在
vk.checkToken(); // 返回 true/false

// 获取 Token
vk.getToken();

// 设置 Token
vk.setToken(token);

// 删除 Token
vk.removeToken();
```

## uni-app API

### 路由

```js
uni.navigateTo({ url: '/pages/xxx?id=123' });
uni.redirectTo({ url: '/pages/xxx' });
uni.switchTab({ url: '/pages/index/index' });  // tabBar 页面
uni.navigateBack({ delta: 1 });
uni.reLaunch({ url: '/pages/xxx' });
```

### 存储

```js
// 同步
uni.setStorageSync('key', value);
uni.getStorageSync('key');
uni.removeStorageSync('key');
uni.clearStorageSync();

// 异步
uni.setStorage({ key, data, success() {} });
uni.getStorage({ key, success(res) { res.data } });
```

### 网络

```js
uni.request({
  url: 'https://api.example.com',
  method: 'GET',
  data: {},
  header: {},
  success(res) { res.data }
});
```

### 交互

```js
// 消息提示
uni.showToast({ title: '提示', icon: 'success' });
uni.showLoading({ title: '加载中' });
uni.hideLoading();

// 模态框
uni.showModal({
  title: '提示',
  content: '确认？',
  success(res) {
    if (res.confirm) {} 
    else if (res.cancel) {}
  }
});

// 操作菜单
uni.showActionSheet({
  itemList: ['选项1', '选项2'],
  success(res) {
    console.log(res.tapIndex);
  }
});
```

### 图片

```js
// 选择图片
uni.chooseImage({
  count: 1,
  success(res) {
    res.tempFilePaths[0]
  }
});

// 预览图片
uni.previewImage({
  urls: ['https://...'],
  current: 'https://...'
});
```

## vk-unicloud 组件

### vk-data-table

万能表格组件：

```vue
<vk-data-table 
  :data="list" 
  :columns="columns"
  :loading="loading"
  @edit="onEdit"
  @delete="onDelete"
/>
```

**columns 配置：**

```js
columns: [
  { field: 'username', label: '用户名', width: 120 },
  { field: 'status', label: '状态', type: 'tag', 
    map: { 1: { text: '启用', type: 'success' }, 0: { text: '禁用', type: 'danger' } }
  },
  { field: 'create_date', label: '创建时间', type: 'date' },
  { field: '操作', label: '操作', type: 'operate', buttons: ['edit', 'delete'] }
]
```

### vk-data-table-query

表格查询组件：

```vue
<vk-data-table-query 
  v-model="queryForm" 
  :columns="queryColumns"
  @query="onQuery"
/>
```

**queryColumns 配置：**

```js
queryColumns: [
  { field: 'username', label: '用户名', type: 'input' },
  { field: 'status', label: '状态', type: 'select', 
    data: [{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]
  },
  { field: 'create_date', label: '创建时间', type: 'daterange' }
]
```

### vk-data-form

万能表单组件：

```vue
<vk-data-form 
  v-model="formData" 
  :columns="formColumns"
  :rules="rules"
/>
```

### uni-captcha

图形验证码组件：

```vue
<uni-captcha scene="login" v-model="form.captcha"></uni-captcha>
```

**scene 值：**
- `login` — 登录验证码
- `register` — 注册验证码
- `sendSmsCode` — 发送短信验证码

## 后端 API（vk.baseDao）

### 查询

```js
// 查询单条（按 ID）
await vk.baseDao.findById({ dbName, id, fieldJson });

// 查询单条（按条件）
await vk.baseDao.findByWhereJson({ dbName, whereJson, fieldJson });

// 查询列表
await vk.baseDao.select({ 
  dbName, whereJson, fieldJson, 
  pageIndex, pageSize, sortArr 
});

// 计数
await vk.baseDao.count({ dbName, whereJson });
```

### 写入

```js
// 新增
await vk.baseDao.add({ dbName, dataJson });

// 修改（按 ID）
await vk.baseDao.updateById({ dbName, id, dataJson });

// 修改（按条件）
await vk.baseDao.update({ dbName, whereJson, dataJson });

// 删除（按 ID）
await vk.baseDao.deleteById({ dbName, id });

// 删除（按条件）
await vk.baseDao.delete({ dbName, whereJson });
```

### 聚合

```js
// 分组统计
await vk.baseDao.group({
  dbName,
  groupJson: { status: "$status" },
  sortArr: [{ name: "count", order: "desc" }]
});
```

## uni-id API

```js
// 登录
await uniID.login({ username, password, needPermission });

// 注册
await uniID.register({ username, password, needPermission });

// 检查 Token
await uniID.checkToken({ needPermission, needUserInfo });

// 发送验证码
await uniID.sendSmsCode({ mobile, code, type, expiresIn });

// 验证码验证
await uniID.verifyCode({ mobile, code, type });

// 重置密码
await uniID.resetPwd({ uid, password });

// 设置验证码
await uniID.setVerifyCode({ mobile, code, expiresIn, type });
```

## 工具函数

### vk.pubfn

```js
// 判断是否为空
vk.pubfn.isNull(value);

// 随机数
vk.pubfn.random(length, chars);

// 正则校验
vk.pubfn.test(value, type); // type: mobile, email, pwd, url, ...

// 表单校验
vk.pubfn.formValidate({ data, rules });

// 获取嵌套值
vk.pubfn.getData(obj, path);

// 日期格式化
vk.pubfn.formatDate(date, format);

// 获取当天起止时间
vk.pubfn.getDayOffsetStartAndEnd(offset, date);
```

## 参考链接

- [vk-unicloud 官方文档](https://vkdoc.fsq.pub/)
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [uniCloud 官方文档](https://uniapp.dcloud.net.cn/uniCloud/)
- [uni-id 官方文档](https://uniapp.dcloud.net.cn/uniCloud/uni-id)
