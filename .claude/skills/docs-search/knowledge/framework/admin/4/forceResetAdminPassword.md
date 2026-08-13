---
sidebarDepth: 0
---

# 3、强制重置 admin 账号密码

### 如何强制重置 admin 账号密码？

- 1、在`uniCloud/cloudfunctions/router/service/user/pub/`目录新建 `forceResetAdminPassword.js` 文件

- 将下方的代码全部复制到新建的文件内

```js
module.exports = {
  /**
   * 强制重置admin密码
   * @url user/pub/forceResetAdminPassword 前端调用的url参数地址
   */
  main: async (event) => {
    let { data = {}, util, filterResponse, originalParam } = event;
    let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
    let { uid } = data;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    let params = {
      username: 'admin',
      password: '123456',
    };
    let userInfo = await vk.baseDao.findByWhereJson({
      dbName: 'uni-id-users',
      whereJson: {
        username: params.username,
      },
    });
    if (!userInfo) {
      return { code: -1, msg: `${params.username}账号未注册` };
    }
    // 重置密码
    res = await uniID.resetPwd({
      uid: userInfo._id,
      password: params.password,
    });
    await vk.baseDao.updateById({
      dbName: 'uni-id-users',
      id: userInfo._id,
      dataJson: {
        login_ip_limit: _.remove(),
      },
    });
    if (res.code === 0) {
      res.msg = `密码已重置为：${params.password}`;
    }
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
};
```

- 2、将下方的代码全部复制到`uniCloud/cloudfunctions/router/router.param.json`文件内（如果没有此文件则新建）

```js
{
  "uni_id_token":"",
  "$url":"user/pub/forceResetAdminPassword",
  "data":{

  }
}
```

- 3、右键`uniCloud/cloudfunctions/router`目录，点击本地运行云函数

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/fa4f4355-21d1-49c7-b97a-0d74f02a6715.png)

- 4、当看到控制显示密码已重置为`123456`时，则代表重置成功。

- 5、重置成功后，请立即删除刚刚创建的 `uniCloud/cloudfunctions/router/service/user/pub/forceResetAdminPassword.js` 文件（如不删除，会有安全隐患）

```js
其中 `uniCloud/cloudfunctions/router/router.param.json` 这个文件没有必要删除。
```
