# 创建我的第一个带 CRUD 的页面

建议：你自己业务的页面全部创建在 `pages` 目录下

此处我们已创建自己业务的用户管理为例。

## 1、写云函数

- 1、在目录`uniCloud/cloudfunctions/router/service/admin/`下创建新的目录 `user`

- 2、复制`router/service/admin/kong/sys/` 目录到 刚刚新建的`user`目录（包含 sys 文件夹）

- 3、将 4 个云函数中的参数`dbName`的值改为 `uni-id-users`

- 4、正确编写 add、update 中的请求参数和可操作的字段名称

### 增：`add.js`

```js
module.exports = {
  /**
   * 添加
   * @url admin/user/sys/add 前端调用的url参数地址
   * data 请求参数 说明
   * @params {String} username    用户名
   */
  main: async (event) => {
    let { data = {}, userInfo, util, filterResponse, originalParam } = event;
    let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
    let { uid } = data;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    let { username, nickname, gender = 0, mobile, comment } = data;
    // 此处应该还需要判断下mobile和username是否已存在等参数校验逻辑和
    let register_date = new Date().getTime();
    res.id = await vk.baseDao.add({
      dbName: 'uni-id-users',
      dataJson: {
        username,
        nickname,
        gender,
        mobile,
        comment,
        register_date,
      },
    });
    return res;
  },
};
```

实际开发用户管理时，接口可以参考`admin/system/user/sys/add`内的更详细的写法。（这里是为了演示常规页面的 CRUD）

### 删：delete.js

```js
module.exports = {
  /**
   * 删除
   * @url admin/user/sys/delete 前端调用的url参数地址
   * data 请求参数 说明
   * @params {String} _id    用户ID
   */
  main: async (event) => {
    let { data = {}, userInfo, util, filterResponse, originalParam } = event;
    let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
    let { uid } = data;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    let { _id } = data;
    if (vk.pubfn.isNullOne(_id)) {
      return { code: -1, msg: '_id不能为空' };
    }
    if (uid === _id) {
      return { code: -1, msg: '请勿删除当前登录账户!' };
    }
    // 执行数据库API请求
    res.num = await vk.baseDao.deleteById({
      dbName: 'uni-id-users',
      id: _id,
    });
    return res;
  },
};
```

### 查：getList.js （只改 dbName 即可）

全部代码如下：

```js
module.exports = {
  /**
   * 查询多条记录 分页
   * @url admin/kong/sys/getList 前端调用的url参数地址
   * data 请求参数 说明
   * @params {Number}         pageIndex 当前页码
   * @params {Number}         pageSize  每页显示数量
   * @params {Array<Object>}  sortRule  排序规则
   * @params {object}         formData  查询条件数据源
   * @params {Array<Object>}  columns   查询条件规则
   */
  main: async (event) => {
    let { data = {}, userInfo, util, filterResponse, originalParam } = event;
    let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
    let { uid } = data;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    let dbName = 'uni-id-users';
    res = await vk.baseDao.getTableData({
      dbName,
      data,
    });
    return res;
  },
};
```

### 改：update.js

```js
module.exports = {
  /**
   * 修改
   * @url admin/user/sys/update 前端调用的url参数地址
   * data 请求参数 说明
   * @params {String} _id    用户ID
   */
  main: async (event) => {
    let { data = {}, userInfo, util, filterResponse, originalParam } = event;
    let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
    let { uid } = data;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    let { _id, nickname, gender = 0, mobile, comment } = data;
    if (vk.pubfn.isNullOne(_id)) {
      return { code: -1, msg: '_id不能为空' };
    }
    // 此处还应该还需要判断下mobile和username是否已存在等参数校验逻辑和
    // 执行数据库API请求
    res.id = await vk.baseDao.updateById({
      dbName: 'uni-id-users',
      id: _id,
      dataJson: {
        nickname,
        gender,
        mobile,
        comment,
      },
    });
    return res;
  },
};
```

实际开发用户管理时，接口可以参考`admin/system/user/sys/update`内的更详细的写法。（这里是为了演示常规页面的 CRUD）

- 5、上传云函数`router`

## 2、写页面

- 1、在目录 `pages` 下创建新的目录 `user`（只建目录，无需建页面）

- 2、复制 `pages_template/kong/list.vue` 文件到 刚刚新建的`pages/user`目录

- 3、修改变量`table1.action `值 `template/db_api/sys/getList` 为 `admin/user/sys/getList`

- 4、修改变量`addBtn ` 函数中的 action `template/db_api/sys/add` 为 `admin/user/sys/add`

- 5、修改变量`updateBtn ` 函数中的 action `template/db_api/sys/update` 为 `admin/user/sys/update`

- 6、修改变量`deleteBtn ` 函数中的 action `template/db_api/sys/delete` 为 `admin/user/sys/delete`

- 7、修改变量 `table1.columns`

```js
table1:{
  // 表格数据请求地址
  action:"admin/user/sys/getList",
  // 表格字段显示规则
  columns:[
    { key:"_id", title:"id", type:"text", width:200 },
    { key:"avatar", title:"头像", type:"avatar", width:80 },
    { key:"username", title:"用户名", type:"text", defaultValue:'未设置' },
    { key:"nickname", title:"昵称", type:"text", defaultValue:'未设置' },
    { key:"comment", title:"备注", type:"text" },
    { key:"mobile", title:"手机号", type:"text", width:120, defaultValue:"未绑定" },
    { key:"gender", title:"性别", type:"radio", width:80, defaultValue:0,
      data:[
        { value:1, label:"男"},
        { value:2, label:"女"},
        { value:0, label:"保密"}
      ]
    },
    { key:"status", title:"账户状态", type:"tag", width:120, defaultValue:0,
      data:[
        { value:1, label:"冻结", tagType:"danger" },
        { value:0, label:"正常", tagType:"success" }
      ]
    },
    { key:"register_date", title:"注册时间", type:"time", width:160, sortable:"custom" },
    { key:"last_login_date", title:"最后登录时间", type:"dateDiff", width:130, defaultValue:'从未登录过', sortable:"custom" },
    { key:"last_login_ip", title:"最后登录ip", type:"text", width:120, defaultValue:'从未登录过' },
    { key:"role", title:"角色", type:"text", width:120, defaultValue:'无' },
    { key:"allow_login_background", title:"允许登录后台", type:"tag", width: 120, defaultValue:false,
      data:[
        { value:true, label:"允许", tagType:"success" },
        { value:false, label:"禁止", tagType:"danger" }
      ]
    }
  ],
  // 多选框选中的值
  multipleSelection:[],
  // 当前高亮的记录
  selectItem:""
},
```

- 8、修改变量 `queryForm1.columns`

```js
queryForm1:{
  // 查询表单数据源，可在此设置默认值
  formData:{

  },
  // 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
  columns:[
    { key:"_id", title:"ID", type:"text", width:140, mode:"=" },
    { key:"username", title:"用户名", type:"text", width:140, mode:"%%" },
    { key:"nickname", title:"昵称", type:"text", width:140, mode:"%%" },
    { key:"mobile", title:"手机号", type:"text", width:140, mode:"%%" },
    { key:"register_date", title:"注册时间", type:"datetimerange", width:400, mode:"[]" },
    { key:"allow_login_background", hidden:true, mode:"=" },
  ]
},
```

- 9、修改变量 `form1.props`

```js
form1: {
  // 表单请求数据，此处可以设置默认值
  data: {

  },
  // 表单属性
  props: {
    // 表单请求地址
    action:"",
    // 表单字段显示规则
    columns:[
      { key:"username", title:"用户名", type:"text", show:["add"] },
      { key:"nickname", title:"昵称", type:"text" },
      { key:"gender", title:"性别", type:"radio",
        data: [
          { value:1, label:"男"},
          { value:2, label:"女"},
          { value:0, label:"保密"}
        ]
      },
      { key:"mobile", title:"手机号", type:"text" },
      { key:"comment", title:"备注", type:"textarea",
        maxlength:"99", showWordLimit:true, autosize:{ minRows: 2, maxRows: 10 } ,
      },
    ],
    // 表单对应的验证规则
    rules:{
      username:[
        {
          required: true,
          validator:vk.pubfn.validator("username"),
          message: '用户名以字母开头，长度在3~32之间，只能包含字母、数字和下划线',
         trigger: ['blur','change']
        }
      ],
      nickname: [
        { required:true, message:'昵称为必填字段', trigger:'blur' },
        { min:2, max:20, message:'昵称长度在 2 到 20 个字符', trigger:'blur' }
      ],
      mobile:[
        { validator:vk.pubfn.validator("mobile"), message: '手机号格式错误', trigger: 'blur' }
      ]
    },
    // add 代表添加 update 代表修改
    formType:'',
    // 是否显示表单1 的弹窗
    show: false,
  }
},
```

- 10、在 `pages.json` 的 `Pages`中配置页面路由

```js
"pages": [
  ...其他页面
  { "path": "pages/user/list" }
],
```

- 11、在 `static_menu/menu.json` 添加静态菜单（或者去菜单管理中添加动态菜单）

```js
{
  "menu_id": "my_system",
  "name": "你的系统名",
  "icon": "el-icon-s-tools",
  "sort": 1,
  "children": [{
      "menu_id": "my_system-user",
      "name": "用户管理",
      "icon": "",
      "url": "/pages/user/list"
    }
  ]
}
```

**参数**

```js
menu_id : 菜单唯一标识
name : 菜单名称
icon : 菜单图标
sort : 菜单排序（从小到大排序）
children : 子菜单列表
```

- 12、完成
