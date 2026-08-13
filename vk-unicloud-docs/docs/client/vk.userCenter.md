# vk.userCenter 用户中心 API

**该 API 仅适用于前端使用，无法在云函数中使用。**

**注意事项**

- 对于 `nvue` 页面、`支付宝小程序`、`百度小程序`，需要在 `js` 中使用 `uni.vk` 替代 `vk`，或者在页面 `<script>` 标签的第一行增加代码 `var vk = uni.vk;`

```vue
<script>
  let vk = uni.vk;
  export default {
    data() {
      // 页面数据变量
      return {};
    },
    // 其他代码
  };
</script>
```

## 公共请求参数@publicparame

|   参数    |                                                                                           说明                                                                                            |      类型       |
| :-------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------: | ---- | --- |
|   data    |                                                                                  发送到云函数的参数数据                                                                                   |     Object      |
|   title   |                                                                                    遮罩层提示语的文本                                                                                     |     String      |
|  loading  |                                                           自定义 loading，设置为 false 则关闭遮罩层提示语 [查看详情](#loading)                                                            | Boolean、Object |
| needAlert |                                                                             请求错误时是否弹窗提示，默认 true                                                                             |     Boolean     |
|    env    |             请求多服务空间的环境 [查看详情](https://vkdoc.fsq.pub/client/question/q9.html#%E5%89%8D%E7%AB%AF%E8%AF%B7%E6%B1%82%E5%A4%9A%E6%9C%8D%E5%8A%A1%E7%A9%BA%E9%97%B4)              |     String      | -    | -   |
|  encrypt  | 是否加密通信（可以不开启安全网络实现加密通信） [查看详情](https://vkdoc.fsq.pub/client/pages/callFunction.html#encrypt-vk%E7%89%88%E5%8F%8C%E5%90%91%E5%8A%A0%E5%AF%86%E9%80%9A%E4%BF%A1) |     Boolean     | none | -   |
|  success  |                                                                                   请求成功时的回调函数                                                                                    |    Function     |
|   fail    |                                                                                   请求失败时的回调函数                                                                                    |    Function     |
| complete  |                                                                                   请求完成时的回调函数                                                                                    |    Function     |

### loading

loading 参数详细说明

- 若 `loading` 的值为 `false`，则不显示默认遮罩层提示语

- 若 `loading` 的值为 `true` ，则不显示默认遮罩层提示语，同时在请求时，会自动设置页面变量 `loading=true` ，请求完成时，自动设置页面变量 `loading=false`

- 若 `loading` 的值类型为 `Object`，如下方代码效果是：请求时，会自动执行 `this.loading2=true` ，请求完成时，会自动执行 `this.loading2=false`

```js
loading: { that: this, name: "loading2" }
```

- name 属性支持使用 `.` 表示嵌套变量，如下方代码效果是：请求时，会自动执行 `this.page.loading=true` ，请求完成时，会自动执行 `this.page.loading=false`

```js
loading: { that: this, name: "page.loading" }
```

**Vue3 setup 用法示例**

因为 Vue3 的 setup 模式下没有 this，但 that 属性的本质其实就是一个对象，因此我们直接传一个对象给 Ta 就可以了，代码如下

```vue
<template>
  <view class="app">
    {{ loading }}
  </view>
</template>

<script setup>
  import { onLoad } from '@dcloudio/uni-app';
  import { ref, reactive } from 'vue';

  const vk = uni.vk;

  const loading = reactive({
    a: false,
    b: false,
  });

  onLoad((options) => {
    vk.callFunction({
      url: 'template/pub.test.test500',
      loading: { that: loading, name: 'a' },
      data: {},
      success: (data) => {},
    });
  });
</script>
```

## 公共返回信息@publicreturn

| 参数 | 说明     | 类型   |
| ---- | -------- | ------ |
| code | 错误码   | Number |
| msg  | 错误提示 | String |

## 监听@watch

### vk.onRefreshToken（监听 token 更新事件）@onRefreshToken

**在 App.vue 里全局监听示例：**

```js
onLaunch: function() {
  // 监听token的更新
  uni.vk.onRefreshToken((data)=>{
    if (data.token) {
      // 有新的token
      console.log('token更新监听：', data);
    } else {
      // token失效或过期
      console.log('token失效监听：', data);
    }
  });
},

```

**在某个页面里局部监听示例：**

在 `onLoad` 时写监听，在 `onUnload` 时移除监听，在 `methods` 内写监听的回调函数。

```js
export default {
  // 监听 - 页面每次【加载时】执行(如：前进)
  onLoad(options = {}) {
    // 监听token的更新
    uni.vk.onRefreshToken(this.onRefreshToken);
  },
  // 监听 - 页面每次【卸载时】（一般用于取消页面上的监听器）
  onUnload() {
    // 页面卸载时需要手动移除监听
    uni.vk.offRefreshToken(this.onRefreshToken);
  },
  // 函数
  methods: {
    onRefreshToken(data) {
      if (data.token) {
        // 有新的token
        console.log('token更新监听：', data);
      } else {
        // token失效或过期
        console.log('token失效监听：', data);
      }
    },
  },
};
```

### vk.offRefreshToken（移除监听 token 更新事件）@offRefreshToken

**一般只有在某个页面里局部监听时才需要用到**

在 `onLoad` 时写监听，在 `onUnload` 时移除监听，在 `methods` 内写监听的回调函数。

```js
export default {
  // 监听 - 页面每次【加载时】执行(如：前进)
  onLoad(options = {}) {
    // 监听token的更新
    uni.vk.onRefreshToken(this.onRefreshToken);
  },
  // 监听 - 页面每次【卸载时】（一般用于取消页面上的监听器）
  onUnload() {
    // 页面卸载时需要手动移除监听
    uni.vk.offRefreshToken(this.onRefreshToken);
  },
  // 函数
  methods: {
    onRefreshToken(data) {
      if (data.token) {
        // 有新的token
        console.log('token更新监听：', data);
      } else {
        // token失效或过期
        console.log('token失效监听：', data);
      }
    },
  },
};
```

## 通用@common

### vk.userCenter.register（注册）@register

通过用户名+密码方式进行注册，注册成功则自动登录。

**_框架会自动保存 `token`，无需你再手动去保存。_**

[查看 token 介绍](#token介绍)

```js
/**
 * 用户注册(用户名+密码)
 * @param {Object} data 请求参数
 * @param {String} data.username 用户名
 * @param {String} data.password 密码
 * @param {Function} success 成功回调函数，参数为请求成功后的数据
 * @param {Function} fail 失败回调函数，参数为请求失败后的错误信息
 * @param {Function} complete 无论请求成功与否，都会执行的回调函数
 * @returns 返回参数说明
 * @returns {String} token 注册完成自动登录之后返回的token信息
 * @returns {String} tokenExpired token过期时间
 * @returns {Object} userInfo 用户信息
 * @returns {String} uid 用户ID
 */
vk.userCenter.register({
  data: {
    username: '',
    password: '',
  },
  success: (data) => {
    // 注册成功后的逻辑
  },
});
```

### vk.userCenter.login（登录）@login

用户名+密码

**_框架会自动保存 `token`，无需你再手动去保存。_**

[查看 token 介绍](#token介绍)

```js
/**
 * 用户登录(用户名+密码)
 * data 请求参数 说明
 * @param {String} username 用户名
 * @param {String} password 密码
 * res 返回参数说明
 * @param {String} token 注册完成自动登录之后返回的token信息
 * @param {String} tokenExpired token过期时间
 * @param {Object} userInfo 用户信息
 * @param {String} uid 用户ID
 */
vk.userCenter.login({
  data: {
    username: '',
    password: '',
  },
  success: (data) => {
    // 登录成功后的逻辑
  },
});
```

### vk.userCenter.updatePwd（修改密码）@updatePwd

```js
/**
 * 修改密码
 * @description 修改成功后，需要重新登录获取新的token
 * data 请求参数 说明
 * @param {String} oldPassword 旧密码
 * @param {String} newPassword 新密码
 */
vk.userCenter.updatePwd({
  data: {
    oldPassword: '123456',
    newPassword: '654321',
    password_confirmation: '654321',
  },
  success: (data) => {
    // 修改成功后的逻辑
  },
});
```

### vk.userCenter.logout（登出）@logout

```js
/**
 * 登出(退出)
 */
vk.userCenter.logout({
  success: (data) => {
    // 退出登录成功后的逻辑
  },
});
```

### vk.userCenter.resetPwd（重置密码）@resetPwd

```js
/**
 * 重置密码
 * data 请求参数 说明
 * @param {String} password 重置后的密码
 */
vk.userCenter.resetPwd({
  data: {
    password: '123456',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.setAvatar（设置头像）@setAvatar

```js
/**
 * 设置头像
 * data 请求参数 说明
 * @param {String} avatar 头像地址
 * @param {Boolean} deleteOldFile 是否同时删除云储存内的旧头像文件
 */
vk.userCenter.setAvatar({
  data: {
    avatar: 'https://www.aa.com/1.jpg',
    deleteOldFile: false, // 是否同时删除云储存内的旧头像文件，true代表是
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.updateUser（设置昵称等）@updateUser

```js
/**
 * 设置昵称等用户展示的个人信息
 * data 请求参数 说明
 * @param {String} nickname 昵称
 * @param {String} avatar 头像
 * @param {Number} gender 性别
 */
vk.userCenter.updateUser({
  data: {
    nickname: '剑圣李白',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.getCurrentUserInfo（取用户信息）@getCurrentUserInfo

调用此接口会自动更新本地 vuex 里的用户信息

```js
/**
 * 获取用户最新信息
 * res 返回参数说明
 * @param {Object} userInfo 用户信息
 */
vk.userCenter.getCurrentUserInfo({
  loading: false,
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.loginByToken（刷新 token）@loginByToken

> vk-unicloud 版本需 ≥ 2.18.7

当 token 有效期大于 1 天时，做用户每日登录统计时就会有问题，因为用户可能好几天只需要登录一次，但此用户可能每天都在线，导致每日登录用户数量不准确，因此可以在 App.vue 的 onLaunch 函数中执行 vk.userCenter.loginByToken()

作用：调用此接口后，会使用当前 token 进行登录（token 需在有效期内），并获得新的 token，同时增加登录日志，方便做每日登录统计。

注意：此接口一天内重复调用多次时，只有每日的第一次调用生效。

```js
vk.userCenter.loginByToken();
```

### vk.userCenter.checkToken（token 云端校验）@checkTokenforcloud

**注意：实际开发过程中，无需你主动执行这个 api 来判断用户 token 是否有效**

[查看 token 介绍](#token介绍)

```js
/**
 * token校验
 * res 返回参数说明
 * @param {String} uid 当前token对应的用户uid
 * @param {Object} userInfo 当前用户信息
 * @param {Array} role 当前用户角色
 * @param {Array} permission 当前用户权限
 */
vk.userCenter.checkToken({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.checkToken（token 本地校验，前端判断登录，是否登录）@checkToken

**此 api 无网络请求，无延迟**

前端校验原理（宽松模式）：只判断 token 是否存在，且未过期（不解密 token 内容）（对前端来说，token 存在且未过期，就代表用户已经登录）

云端校验原理（严格模式）：解密 token 内容，判断 token 真实性，获得 uid，并判断是否过期

**你无需担心本地校验用户会伪造的可能，因为用户只要请求云函数，云端最终还会再校验一遍的**

[查看 token 介绍](#token介绍)

**示例一**

```js
if (!vk.checkToken()) {
  // token无效（未登录）
} else {
  // token有效（已登录）
}
```

**示例二**

```js
if (vk.checkToken()) {
  // token有效（已登录）
}
```

**示例三**

```js
if (!vk.checkToken()) {
  // token无效（未登录）
  return false;
}
// token有效（已登录）
```

### vk.getToken（获取本地 token）@getToken

注意：token 会自动传给云函数，云函数也会自动解析 token，故一般情况下，无需调用此 api，如真需要，可使用此 api 获取。

[查看 token 介绍](#token介绍)

```js
let token = vk.getToken();
```

### vk.saveToken（保存本地 token）@saveToken

将新的 token 及过期时间写入本地缓存，并触发 token 刷新事件。若传入的 token 与当前已保存的 token 相同，则不会更新。

**参数**

| 参数名               | 类型   | 必填 | 说明                                         |
| -------------------- | ------ | ---- | -------------------------------------------- |
| options              | Object | 是   | 要保存的 token 信息                          |
| options.token        | String | 是   | 登录凭证 token                               |
| options.tokenExpired | Number | 否   | token 过期时间戳（毫秒），不传则依赖业务默认 |

注意：tokenExpired 值仅作为本地判断 token 有效期时使用，最终 token 的过期时间是以云端解密 token 内容后得到的过期时间为准。

**返回值**

- `true`：已更新本地 token
- `false`：传入的 token 与当前一致，未更新

**监听 token 变更**

可在页面中监听 token 变化（如用于同步登录态、刷新界面等）：

```js
vk.$on('onRefreshToken', (data) => {
  console.log('token 已更新：', data);
});
```

**示例**

```js
vk.saveToken({
  token: 'xxx',
  tokenExpired: tokenExpired,
});
```

### vk.deleteToken（删除本地 token）@deleteToken

清除本地保存的 token、token 过期时间以及当前用户信息缓存，并触发 token 刷新事件。常用于退出登录。

注意：`vk.deleteToken` 不会删除云端 token，故应使用 `vk.userCenter.logout` 函数来实现登出功能（`vk.userCenter.logout` 会同时删除本地和云端 token，无需你手动执行 `vk.deleteToken`）

**无参数**

**示例**

```js
// 退出登录时调用
vk.deleteToken();
```

### vk.handleAutoLoginToken（自动登录）@handleAutoLoginToken

**介绍**

该函数用于接收页面 URL 查询参数中携带的登录 token，自动保存 token 并完成自动登录初始化，通常用于**跨应用跳转无感登录**场景。

**使用要求**

必须书写在 `App.vue` 的 `onLaunch` 生命周期函数的第一行（确保优先执行）

**代码示例**

```js
// App.vue 中的配置
export default {
  onLaunch: function (options) {
    // 接收页面token参数，用于实现自动登录（优先执行，放置在第一行）
    uni.vk.handleAutoLoginToken(options);

    // 后续其他业务逻辑（示例）
    console.log('App 已启动');
  },
};
```

**效果说明**

- 当 App 从携带 token 参数的 URL 跳转启动时，会自动提取并保存 token，完成无感自动登录。
- 后续接口请求可直接使用已保存的 token 进行身份验证。
- 若 URL 未携带 token 参数，该函数不执行任何操作，不会影响其他业务流程。

### vk.userCenter.closeAccount（账号注销）@closeAccount

> vk-unicloud 版本需 ≥ 2.20.0

**注意：**

1. 每个账号首次请求注销接口后，会有 7 天注销冷静期，此时账号状态已经变更为已注销状态，但用户可以执行[恢复账号](#openaccount)API 来恢复账号。
2. 当已过注销冷静期时，通过再次调用账号注销接口后，账号将会真正注销，此时用户可以重新注册新账号

框架已内置完整的注销账号、恢复账号、冷静期显示等功能的页面：`/pages_template/uni-id/closeAccount/closeAccount`

```js
vk.userCenter.closeAccount({
  success: (res) => {},
});
```

### vk.userCenter.openAccount（恢复账号）@openAccount

> vk-unicloud 版本需 ≥ 2.20.0

**注意：**

1. 无论账号是否已过注销冷静期，只要未二次执行[账号注销](#closeaccount)API，都可以通过恢复账号 API 来恢复账号。

框架已内置完整的注销账号、恢复账号、冷静期显示等功能的页面：`/pages_template/uni-id/closeAccount/closeAccount`

```js
vk.userCenter.openAccount({
  success: (res) => {},
});
```

### vk.userCenter.getCoolingStatus（获取注销冷静期状态）@getCoolingStatus

> vk-unicloud 版本需 ≥ 2.20.0

当用户申请注销后，可调用此接口获取冷静期剩余时长等信息

框架已内置完整的注销账号、恢复账号、冷静期显示等功能的页面：`/pages_template/uni-id/closeAccount/closeAccount`

```js
vk.userCenter.getCoolingStatus({
  success: (res) => {
    console.log('status', res.status); // 当前账号状态，4代表已注销（也包含在冷静期），其他均为未注销
    console.log('nickname', res.nickname); // 昵称
    console.log('avatar', res.avatar); // 头像
    if (res.close_account) {
      console.log('confirmed', res.close_account.confirmed); // 是否已二次确认注销
      console.log('apply_time', res.close_account.apply_time); // 注销申请时间
      console.log('close_time', res.close_account.close_time); // 注销冷静期最后时间
      console.log('reason', res.close_account.reason); // 注销原因
      console.log('duration', res.duration); // 注销冷静期剩余时长（单位：ms）
    }
  },
});
```

## 手机号@mobile

### vk.userCenter.bindMobile（绑定手机）@bindMobile

```js
/**
 * 绑定手机号
 * data 请求参数 说明
 * @param {String} mobile 手机号
 * @param {String} code 手机收到的验证码
 */
vk.userCenter.bindMobile({
  data: {
    mobile: '',
    code: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.unbindMobile（解绑手机）@unbindMobile

```js
/**
 * 解绑手机号
 * data 请求参数 说明
 * @param {String} mobile 手机号
 * @param {String} code 手机收到的验证码
 */
vk.userCenter.unbindMobile({
  data: {
    mobile: '',
    code: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.bindNewMobile（换绑手机号）@bindNewMobile

```js
/**
 * 绑定新的手机号（换绑手机号）
 * data 请求参数 说明
 * @param {String} oldMobile 旧手机号码
 * @param {String} oldMobileCode 旧手机收到的验证码
 * @param {String} mobile 新手机号码
 * @param {String} code 新手机收到的验证码
 * res 返回参数说明
 * @param {Number} code 错误码，0表示成功
 * @param {String} msg 详细信息
 */
vk.userCenter.bindNewMobile({
  data: {
    oldMobile: '',
    oldMobileCode: '',
    mobile: '',
    code: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.loginBySms（手机号登录）@loginBySms

**_框架会自动保存 `token`，无需你再手动去保存。_**

[查看 token 介绍](#token介绍)

```js
/**
 * 手机号登录（手机号+手机验证码）
 * data 请求参数 说明
 * @param {String} mobile 手机号（必填）
 * @param {String} code 验证码（必填）
 * @param {String} type 指定操作类型，不传：存在则登录不存在则注册 login：只能登录 register：只能注册
 * @param {String} password 密码，当前用户为新注册时生效
 * @param {String} inviteCode 邀请人的邀请码，当前用户为新注册时生效
 * @param {String} myInviteCode 设置当前注册用户自己的邀请码，当前用户为新注册时生效（不传会自动生成）
 * @param {Boolean} needPermission 设置为true时会在checkToken时返回用户权限（permission），如果是在admin端，需传true
 * @param {Array} role 设定用户角色，当前用户为新注册时生效
 * res 返回参数说明
 * @param {String} token 注册完成自动登录之后返回的token信息
 * @param {String} tokenExpired token过期时间
 */
vk.userCenter.loginBySms({
  data: {
    mobile: '',
    code: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.sendSmsCode（发送验证码）@sendSmsCode

```js
/**
 * 发送手机号验证码
 * data 请求参数 说明
 * @param {String} mobile 手机号
 * @param {String} type 验证码类型，用于防止不同功能的验证码混用，目前支持的类型login登录、register注册、bind绑定手机、unbind解绑手机、reset-pwd重置密码
 * @param {Boolean|String} checkUserExist 是否需要检测手机号对应的账号是否存在或不存在，默认不检测，若为exists代表手机号必须已注册，若为!exists代表手机号必须未注册
 * res 返回参数说明
 * @param {Object} requestRes 原始返回数据
 * @param {Object} requestParam 包含服务供应商和发送的手机号
 */
vk.userCenter.sendSmsCode({
  data: {
    mobile: '',
    type: 'login',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.resetPasswordByMobile（根据手机验证码重置账号密码）@resetPasswordByMobile

```js
/**
 * 根据手机验证码重置账号密码
 * data 请求参数 说明
 * @param {String} password 重置后的密码
 * @param {String} code 验证码
 * @param {String} mobile 手机号
 */
vk.userCenter.resetPasswordByMobile({
  data: {
    password: '123456',
    code: '',
    mobile: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

**注意**

- 对应发送短信验证码接口 `type` 为 `reset-pwd`

### vk.userCenter.loginByUniverify（手机一键登录）@loginByUniverify

只有 `APP` 端可以用

**_框架会自动保存 `token`，无需你再手动去保存。_**

[查看 token 介绍](#token介绍)

```js
/**
 * APP端 手机一键登录
 * data 请求参数 说明
 * @param {String} type 							指定操作类型，可选值为login、register，不传此参数时表现为手机号已注册则登录，手机号未注册则进行注册
 * @param {String} password 					密码，type为register时生效
 * @param {String} inviteCode 				邀请人的邀请码，type为register时生效
 * @param {String} access_token 			uni.login登录成功后，返回的access_token参数（此参数自动获取，无需填写）
 * @param {String} openid 						uni.login登录成功后，返回的openid参数（此参数自动获取，无需填写）
 * @param {String} myInviteCode 			设置当前注册用户自己的邀请码，type为register时生效（此参数自动生成，无需填写）
 * res 返回参数说明
 * @param {Number} code			错误码，0表示成功
 * @param {String} msg			详细信息
 * @param {String} uid 			当前token对应的用户uid
 * @param {String} type			操作类型，login为登录、register为注册
 * @param {String} mobile		登录者手机号
 * @param {String} userInfo	用户全部信息
 * @param {String} token			登录成功之后返回的token信息
 * @param {String} tokenExpired		token过期时间
 */
vk.userCenter.loginByUniverify({
  // 更多配置请查看 https://uniapp.dcloud.io/univerify
  univerifyStyle: {
    fullScreen: true, // 是否全屏显示(hbx3.1.5起支持全屏)，true表示全屏模式，false表示非全屏模式，默认值为false。
    backgroundColor: '#f5f5f5', // 授权页面背景颜色，默认值：#ffffff
    authButton: {
      normalColor: '#19be6b', // 授权按钮正常状态背景颜色 默认值：#3479f5
      highlightColor: '#18b566', // 授权按钮按下状态背景颜色 默认值：#2861c5（仅ios支持）
      disabledColor: '#71d5a1', // 授权按钮不可点击时背景颜色 默认值：#73aaf5（仅ios支持）
      textColor: '#ffffff', // 授权按钮文字颜色 默认值：#ffffff
      title: '本机号码一键登录', // 授权按钮文案 默认值：“本机号码一键登录”
    },
    privacyTerms: {
      suffix: '使用本机号码登录', // 条款后的文案 默认值：“并使用本机号码登录”
      termsColor: '#555555',
    },
  },
  data: {},
  success: (data) => {
    uni.closeAuthView();
    setTimeout(() => {
      vk.alert(data.msg);
    }, 300);
  },
  fail: (res) => {
    uni.closeAuthView();
  },
});
```

## 邮箱@email

### vk.userCenter.bindEmail（绑定邮箱）@bindEmail

```js
/**
 * 绑定邮箱
 * data 请求参数 说明
 * @param {String} email 邮箱
 * @param {String} code  邮箱收到的验证码
 */
vk.userCenter.bindEmail({
  data: {
    email: '',
    code: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.unbindEmail（解绑邮箱）@unbindEmail

```js
/**
 * 解绑邮箱
 * @param {String} email 邮箱
 * @param {String} code  邮箱收到的验证码
 */
vk.userCenter.unbindEmail({
  data: {
    email: '',
    code: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.bindNewEmail（换绑邮箱）@bindNewEmail

```js
/**
 * 绑定新的邮箱（换绑邮箱）
 * @param {String} oldEmail 旧邮箱
 * @param {String} oldEmailCode 旧邮箱收到的验证码
 * @param {String} email 新邮箱
 * @param {String} code 新邮箱收到的验证码
 */
vk.userCenter.bindNewEmail({
  data: {
    oldEmail: '',
    oldEmailCode: '',
    email: '',
    code: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.loginByEmail（邮箱登录）@loginByEmail

**_框架会自动保存 `token`，无需你再手动去保存。_**

[查看 token 介绍](#token介绍)

```js
/**
 * 邮箱登录（邮箱+邮箱验证码）
 * data 请求参数 说明
 * @param {String} email 邮箱
 * @param {String} code  邮箱收到的验证码
 * @param {String} type 指定操作类型，不传：存在则登录不存在则注册 login：只能登录 register：只能注册
 * @param {String} password 密码，当前用户为新注册时生效
 * @param {String} myInviteCode 设置当前注册用户自己的邀请码，当前用户为新注册时生效（不传会自动生成）
 * @param {Boolean} needPermission 设置为true时会在checkToken时返回用户权限（permission），如果是在admin端，需传true
 * @param {Array} role 设定用户角色，当前用户为新注册时生效
 * res 返回参数说明
 * @param {String} token 注册完成自动登录之后返回的token信息
 * @param {String} tokenExpired token过期时间
 */
vk.userCenter.loginByEmail({
  data: {
    email: '',
    code: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.sendEmailCode（发送验证码）@sendEmailCode

```js
/**
 * 发送邮件验证码
 * data 请求参数 说明
 * @param {String} email 邮箱
 * @param {String} type  验证码类型，用于防止不同功能的验证码混用，目前支持的类型login登录、register注册、bind绑定邮箱、unbind解绑邮箱、reset-pwd重置密码
 * @param {String} serviceType 邮件服务类型，默认为qq，可自定义，与uni-config-center/vk-unicloud/index.js内配置的一致即可。
 * @param {Boolean|String} checkUserExist 是否需要检测邮箱对应的账号是否存在或不存在，默认不检测，若为exists代表邮箱必须已注册，若为!exists代表邮箱必须未注册
 * res 返回参数说明
 * @param {String} email 邮箱
 * @param {String} verifyCode 验证码
 */
vk.userCenter.sendEmailCode({
  data: {
    email: '',
    type: 'login',
    serviceType: 'qq',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.resetPasswordByEmail（根据邮箱验证码重置账号密码）@resetPasswordByEmail

```js
/**
 * 根据邮箱验证码重置账号密码
 * data 请求参数 说明
 * @param {String} password 重置后的密码
 * @param {String} code 验证码
 * @param {String} email 邮箱号码
 */
vk.userCenter.resetPasswordByEmail({
  data: {
    password: '123456',
    code: '',
    email: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

**注意**

- 对应发送邮件验证码接口 `type` 为 `reset-pwd`

## 微信@weixin

### vk.userCenter.loginByWeixin（微信登录）@loginByWeixin

**_框架会自动保存 `token`，无需你再手动去保存。_**

[查看 token 介绍](#token介绍)

#### 微信小程序登录@loginByWeixinMp

- 配置 `common/uni-config-center/uni-id/config.json` 内 `mp-weixin` 的 `appid` 和 `appsecret`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/abf6f55a-7262-47d7-91ef-9a8958b9aeb0.png)

**注意每次修改 uni-config-center 后都要右键上传此公共模块才会生效**

- 在 `manifest.json` 内配置微信小程序的 `appid`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/3f52a650-759d-4c21-a526-7041d4bcbca7.png)

#### 微信 APP 登录@loginByWeixinApp

- 在 `manifest.json` 的 APP 模块配置微信登录用 `appid`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/65e17cdf-006e-462e-b471-cee8df59d11c.png)

- 打包并使用自定义基座（注意一定要在 `manifest.json` 填写微信 `appid` 后再制作自定义基座）[自定义基座使用说明](https://ask.dcloud.net.cn/article/35115)
- 配置 `common/uni-config-center/uni-id/config.json` 内 `app-plus.oauth.weixin` 的 `appid` 和 `appsecret`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/9464eee0-cfd8-4517-acbd-dfa07763aef0.png)

**注意每次修改 uni-config-center 后都要右键上传此公共模块才会生效**

#### 微信公众号登录@loginByWeixinH5

- 配置 `common/uni-config-center/uni-id/config.json` 内 `h5-weixin` 的 `appid` 和 `appsecret`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/1944c923-65d7-47ed-a34c-0f8862225ac3.png)

**注意每次修改 uni-config-center 后都要右键上传此公共模块才会生效**

**注意 1：h5 的路由模式必须配置为 `history`，因为微信公众号登录的回调地址不支持 `hash` 模式。注意支付宝云不支持 `history`**

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/c3b343cd-0058-46db-86f4-64ae46fdf2fb.png)

**注意 2：你的前端托管那需要设置 404 指向的页面为 index.html**

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/0a79aeb8-33d6-4c7e-bc08-f0aa7d7ab4fd.png)

**注意 3：网页授权时拼接的 scope 参数的值必须是 snsapi_userinfo，同时再绑定开放平台，才能获取到 unionid**

**注意 4：还需要去微信公众号后台配置下网页授权域名，如下图所示。**

![](https://cdn.fsq.pub/vkdoc/vk-client/2ba5566f-744b-4d05-a3f4-f538b1a9d4e9.png)

#### 微信 PC 网站扫码登录@loginByWeixinPC

- 配置 `common/uni-config-center/uni-id/config.json` 内 `h5` 的 `appid` 和 `appsecret`

![](https://cdn.fsq.pub/vkdoc/vk-client/0dcff7ef-e503-4941-8f2c-19c1c0ca01fb.png)

**注意每次修改 uni-config-center 后都要右键上传此公共模块才会生效**

1. 需要前往微信开放平台申请，类型为网站应用
2. 先拼接微信扫码授权的 url，然后跳转，进入微信的扫码授权页面，扫码完成后会自动跳转到你指定的 redirect_uri 页面，然后页面 onLoad 内获得 code 参数，再调用 vk.userCenter.loginByWeixin 登录
3. redirect_uri 必须是线上域名，且是网站应用绑定的域名

具体代码如下

```vue
<template>
  <view class="content">
    <button type="default" @click="getWeixinCode()">扫码授权获取code</button>
    <button type="default" @click="loginByWeixin()">微信登录(不存在自动注册)</button>
  </view>
</template>

<script>
  let vk = uni.vk;
  export default {
    data() {
      return {
        options: {},
      };
    },
    onLoad(options) {
      vk = uni.vk;
      this.options = options || {};
      this.init(options);
    },
    methods: {
      // 初始化
      init(options) {
        if (this.options.code) {
          vk.toast('已获取到code，请点击相应操作。');
          return false;
        }
      },
      getWeixinCode() {
        let appid = ''; // 填写公众号的appid
        let redirect_uri = window.location.href.split('?')[0];
        let url = `https://open.weixin.qq.com/connect/qrconnect?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`;
        window.location.href = url;
      },
      // 微信登录
      loginByWeixin(type) {
        if (!this.options.code) {
          vk.toast('请先获取code');
          return false;
        }
        vk.userCenter.loginByWeixin({
          data: {
            code: this.options.code,
            state: this.options.state,
            type,
          },
          success: (data) => {
            vk.alert(data.msg);
            this.data = data;
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .content {
    padding: 30rpx;
  }

  .content button {
    margin-bottom: 30rpx;
  }

  .tips {
    font-size: 28rpx;
    color: #999999;
    margin-bottom: 32rpx;
  }
</style>
```

**注意**

自 2.11.0（2022-08-22）版本起，不再返回 sessionKey 和 accessToken 取而代之的是返回 `encryptedKey`（加密后的数据，云函数解密后可获得 `sessionKey`）

不要将 sessionKey 和 accessToken 暴露给前端，否则会有安全隐患

```js
/**
 * 用户登录(微信授权)
 * @description 用户登录(微信授权)
 * data 请求参数 说明
 * @param {String} type 可传login或register，若为login：则不存在不会自动注册，若为register，则用户存在会报错，不传，则存在自动登录，不存在，则注册。
 * @param {String} nickname 用户昵称（仅注册时生效）
 * @param {String} avatar 用户头像（仅注册时生效）其他参数需要在修改云函数 user/pub/loginByDouyin 内的 customData 字段
 * res 返回参数说明
 * @param {String} token 登录成功之后返回的token信息
 * @param {String} tokenExpired token过期时间
 */
vk.userCenter.loginByWeixin({
  data: {
    type: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

云函数端解密 `encryptedKey`

```js
// 解密 sessionKey 示例
let decryptedRes = vk.crypto.aes.decrypt({
  data: encryptedKey, // 待解密的原文
});
let sessionKey = decryptedRes.sessionKey;
```

### vk.userCenter.loginByWeixinPhoneNumber（微信手机号授权登录）@loginByWeixinPhoneNumber

注意事项：

1. 此接口需要 `隐私条款` 中包含获取用户手机号
2. 需要已微信认证的企业小程序（含个体户）

```vue
<button type="default" open-type="getPhoneNumber" @getphonenumber="loginByWeixinPhoneNumber">使用微信绑定的手机号登录/注册</button>
```

```js
// 需要先在onLoad内执行此函数
vk.userCenter.code2SessionWeixin({
  data: {
    needCache: true,
  },
  success: (data) => {
    this.encryptedKey = data.encryptedKey;
  },
});
```

```js
// 使用微信绑定的手机号登录/注册
loginByWeixinPhoneNumber(e) {
  let { encryptedData, iv } = e.detail;
  if (!encryptedData || !iv) {
    return false;
  }
  vk.userCenter.loginByWeixinPhoneNumber({
    data: {
      encryptedData,
      iv,
      encryptedKey: this.encryptedKey
    },
    success: (data) => {
      // 成功后的逻辑

    }
  });
},
```

### vk.userCenter.getPhoneNumber（获取微信绑定的手机号）@getPhoneNumberByWeixin

注意事项：

1. 此接口需要 `隐私条款` 中包含获取用户手机号
2. 需要已微信认证的企业小程序（含个体户）

```vue
<button type="default" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">获取微信绑定的手机号</button>
```

```js
// 需要先在onLoad内执行此函数
vk.userCenter.code2SessionWeixin({
  data: {
    needCache: true,
  },
  success: (data) => {
    this.encryptedKey = data.encryptedKey;
  },
});
```

```js
// 获取微信绑定的手机号码
getPhoneNumber(e) {
  let { encryptedData, iv } = e.detail;
  if (!encryptedData || !iv) {
    return false;
  }
  vk.userCenter.getPhoneNumber({
    data: {
      encryptedData,
      iv,
      encryptedKey: this.encryptedKey
    },
    success: (data) => {
      vk.alert("手机号:" + data.mobile);
    }
  });
},
```

### vk.userCenter.bindWeixin（绑定微信）@bindWeixin

```js
/**
 * 绑定微信
 */
vk.userCenter.bindWeixin({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.unbindWeixin（解绑微信）@unbindWeixin

```js
/**
 * 解绑微信
 */
vk.userCenter.unbindWeixin({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.code2SessionWeixin（获取微信 openid）@code2SessionWeixin

注意：自 2.11.0（2022-08-22）版本起，不再返回 sessionKey 和 accessToken 取而代之的是返回 `encryptedKey`（加密后的数据，云函数解密后可获得 `sessionKey`）

不要将 sessionKey 和 accessToken 暴露给前端，否则会有安全隐患

```js
/**
 * 获取微信openid
 * res 返回参数说明
 * @param {String} openid 用户openid
 * @param {String} unionid 用户unionid，可以取到此值时返回
 * @param {String} encryptedKey 密钥的加密数据
 *
 */
vk.userCenter.code2SessionWeixin({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

云函数端解密 `encryptedKey`

```js
// 解密 sessionKey 示例
let decryptedRes = vk.crypto.aes.decrypt({
  data: encryptedKey, // 待解密的原文
});
let sessionKey = decryptedRes.sessionKey;
```

### vk.userCenter.getWeixinMPqrcode（生成微信小程序码）@getWeixinMPqrcode

```js
/**
 * 生成微信小程序码
 * @param {String} scene        自定义参数最大32个可见字符 只支持数字，大小写英文以及部分特殊字符：!#$&'()*+,/:;=?@-._~
 * @param {String} page         必须是已经发布的小程序存在的页面（否则报错），例如 pages/index/index, 根路径前不要填加 /,不能携带参数（参数请放在scene字段里），如果不填写这个字段，默认跳主页面
 * @param {boolean} check_path  默认是true，检查page 是否存在，为 true 时 page 必须是已经发布的小程序存在的页面（否则报错）；为 false 时允许小程序未发布或者 page 不存在， 但page 有数量上限（60000个）请勿滥用。
 * @param {String} env_version  要打开的小程序版本。正式版为 "release"，体验版为 "trial"，开发版为 "develop"。默认是正式版。
 * @param {number} width        二维码的宽度，单位 px，最小 280px，最大 1280px
 * @param {boolean} auto_color  自动配置线条颜色，如果颜色依然是黑色，则说明不建议配置主色调，默认 false
 * @param {Object} line_color   auto_color 为 false 时生效，使用 rgb 设置颜色 例如 {"r":"xxx","g":"xxx","b":"xxx"} 十进制表示
 * @param {boolean} is_hyaline  是否需要透明底色，为 true 时，生成透明底色的小程序
 */
vk.userCenter.getWeixinMPqrcode({
  data: {
    page: 'pages/index/index',
    scene: 'a=1&b=2',
    check_path: false,
    env_version: 'release', // 默认值"release"。要打开的小程序版本。正式版为 "release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。
  },
  success: (data) => {
    console.log('imageUrl', data.base64);
  },
});
```

### vk.userCenter.getWeixinMPscheme（生成微信小程序 scheme 码）@getWeixinMPscheme

```js
/**
 * 生成微信小程序scheme码
 * data 请求参数 说明
 * @param {String} path    小程序页面路径
 * @param {String} query   小程序页面参数
 */
vk.userCenter.getWeixinMPscheme({
  data: {
    query: 'a=1&b=2',
    path: 'pages/index/index',
    env_version: 'release', // 默认值"release"。要打开的小程序版本。正式版为 "release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。
  },
  success: (data) => {
    console.log('url', data.openlink);
  },
});
```

### vk.userCenter.getWeixinMPurl（生成微信小程序 url 链接）@getWeixinMPurl

```js
/**
 * 生成微信小程序scheme码
 * data 请求参数 说明
 * @param {String} path    小程序页面路径
 * @param {String} query   小程序页面参数
 */
vk.userCenter.getWeixinMPurl({
  data: {
    path: 'pages/index/index',
    query: 'a=1&b=2',
    env_version: 'release', // 默认值"release"。要打开的小程序版本。正式版为 "release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。
  },
  success: (data) => {
    console.log('url', data.url_link);
  },
});
```

## 支付宝@alipay

### vk.userCenter.loginByAlipay（支付宝登录）@loginByAlipay

**_框架会自动保存 `token`，无需你再手动去保存。_**

[查看 token 介绍](#token介绍)

注意：

- 需要在 `common/uni-config-center/uni-id/config.json` 内支付宝平台下配置 `appid`和 `privateKey`（应用私钥）

**注意每次修改 uni-config-center 后都要右键上传此公共模块才会生效**

#### 支付宝小程序登录@loginByAlipayMp

- 配置 `common/uni-config-center/uni-id/config.json` 内 `mp-alipay` 的 `appid` 和 `privateKey`

**特别注意**

需要前往支付宝开放平台，小程序应用-开发设置-openid 配置管理-设置-申诉为 userid 模式，操作步骤如下，操作完后需等待支付宝审核通过，并点击切换到 uid 作为用户标识后才能正常使用。

![](https://cdn.fsq.pub/vkdoc/vk-client/4ea34ab1-a274-4a11-8f07-b14c7e46365f.png)

![](https://cdn.fsq.pub/vkdoc/vk-client/20f0215c-8462-4dc0-8e4f-58fbb3a8503b.png)

![](https://cdn.fsq.pub/vkdoc/vk-client/6237e551-7e95-4d4e-8f08-807837392788.png)

申诉通过后，还需要再次点下-开发设置-openid 配置管理-设置-切换到 uid 作为用户标识

![](https://cdn.fsq.pub/vkdoc/vk-client/8a6fdf61-0b34-4a12-b3aa-8bdb646f035a.png)

![](https://cdn.fsq.pub/vkdoc/vk-client/b3ca531f-0ec3-4051-98d4-6ab1faa8f732.png)

![](https://cdn.fsq.pub/vkdoc/vk-client/379a5b81-3479-469c-9d3b-266a5c650692.png)

```js
/**
 * 支付宝登录
 * data 请求参数 说明
 * @param {String} type 可传login或register，若为login：则不存在不会自动注册，若为register，则用户存在会报错，不传，则存在自动登录，不存在，则注册。
 * res 返回参数说明
 * @param {String} token 登录成功之后返回的token信息
 * @param {String} tokenExpired token过期时间
 */
vk.userCenter.loginByAlipay({
  data: {
    type: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

云函数端解密 `encryptedKey`

```js
// 解密 sessionKey 示例
let decryptedRes = vk.crypto.aes.decrypt({
  data: encryptedKey, // 待解密的原文
});
let sessionKey = decryptedRes.sessionKey;
```

### vk.userCenter.bindAlipay（绑定支付宝）@bindAlipay

```js
/**
 * 绑定支付宝
 */
vk.userCenter.bindAlipay({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.unbindAlipay（解绑支付宝）@unbindAlipay

```js
/**
 * 解绑支付宝
 */
vk.userCenter.unbindAlipay({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.code2SessionAlipay（获取支付宝 openid）@code2SessionAlipay

注意：自 2.11.0（2022-08-22）版本起，不再返回 sessionKey 和 accessToken 取而代之的是返回 `encryptedKey`（加密后的数据，云函数解密后可获得 `sessionKey`）

不要将 sessionKey 和 accessToken 暴露给前端，否则会有安全隐患

```js
/**
 * 获取支付宝openid
 * res 返回参数说明
 * @param {String} openid 用户openid
 * @param {String} accessToken 客户端为APP时返回
 * @param {String} expiresIn 客户端为APP时返回，accessToken 接口调用凭证超时时间，单位（秒）
 * @param {String} refreshToken 客户端为APP时返回，用于刷新accessToken
 * @param {String} reExpiresIn refreshToken超时时间，单位（秒）
 */
vk.userCenter.code2SessionAlipay({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

云函数端解密 `encryptedKey`

```js
// 解密 sessionKey 示例
let decryptedRes = vk.crypto.aes.decrypt({
  data: encryptedKey, // 待解密的原文
});
let sessionKey = decryptedRes.sessionKey;
```

## QQ

### vk.userCenter.loginByQQ（QQ 登录）@loginByQQ

目前仅支持 app 和小程序的 qq 登录

**_框架会自动保存 `token`，无需你再手动去保存。_**

[查看 token 介绍](#token介绍)

注意：

QQ 小程序登录配置

- 配置 `common/uni-config-center/uni-id/config.json` 内 `mp-qq` 的 `appid` 和 `appsecret`
- 在 `manifest.json` 内配置 QQ 小程序的 `appid`

**注意每次修改 uni-config-center 后都要右键上传此公共模块才会生效**

APP 登录配置

- 在 `manifest.json` 的 APP 模块配置 QQ 登录用 `appid`
- 打包并使用自定义基座（注意一定要在 `manifest.json` 填写 QQ `appid` 后再制作自定义基座）[自定义基座使用说明](https://ask.dcloud.net.cn/article/35115)
- 配置 `common/uni-config-center/uni-id/config.json` 内 `app-plus.oauth.qq` 的 `appid` 和 `appsecret`

**注意每次修改 uni-config-center 后都要右键上传此公共模块才会生效**

```js
/**
 * QQ登录
 * data 请求参数 说明
 * @param {String} type 可传login或register，若为login：则不存在不会自动注册，若为register，则用户存在会报错，不传，则存在自动登录，不存在，则注册。
 * res 返回参数说明
 * @param {String} token 登录成功之后返回的token信息
 * @param {String} tokenExpired token过期时间
 */
vk.userCenter.loginByQQ({
  data: {
    type: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.bindQQ（绑定 QQ）@bindQQ

```js
/**
 * 绑定QQ
 */
vk.userCenter.bindQQ({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.unbindQQ（解绑 QQ）@unbindQQ

```js
/**
 * 解绑QQ
 */
vk.userCenter.unbindQQ({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

## 抖音@douyin

### vk.userCenter.loginByDouyin（抖音登录）@loginByDouyin

> vk-unicloud 版本需 ≥ 2.18.8

目前仅支持抖音小程序登录

**_框架会自动保存 `token`，无需你再手动去保存。_**

[查看 token 介绍](#token介绍)

注意：

抖音小程序登录配置

- 配置 `common/uni-config-center/uni-id/config.json` 内 `mp-toutiao` 的 `appid` 和 `appsecret`
- 在 `manifest.json` 内配置抖音小程序的 `appid`

**注意每次修改 uni-config-center 后都要右键上传此公共模块才会生效**

```js
/**
 * 抖音登录
 * data 请求参数 说明
 * @param {String} type 可传login或register，若为login：则不存在不会自动注册，若为register，则用户存在会报错，不传，则存在自动登录，不存在，则注册。
 * @param {String} nickname 用户昵称（仅注册时生效）
 * @param {String} avatar 用户头像（仅注册时生效）其他参数需要在修改云函数 user/pub/loginByDouyin 内的 customData 字段
 * res 返回参数说明
 * @param {String} token 登录成功之后返回的token信息
 * @param {String} tokenExpired token过期时间
 */
vk.userCenter.loginByDouyin({
  data: {
    type: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.loginByDouyinPhoneNumber（抖音手机号授权登录）@loginByDouyinPhoneNumber

> vk-unicloud 版本需 ≥ 2.18.8

注意事项：

1. 此接口需要 `隐私条款` 中包含获取用户手机号
2. 需要单独申请接口权限 [申请教程](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/operation/management/specification/account-login-standard)

```vue
<button type="default" open-type="getPhoneNumber" @getphonenumber="loginByDouyinPhoneNumber">使用抖音绑定的手机号登录/注册</button>
```

```js
// 需要先在onLoad内执行此函数
vk.userCenter.code2SessionDouyin({
  data: {
    needCache: true,
  },
  success: (data) => {
    this.encryptedKey = data.encryptedKey;
  },
});
```

```js
// 使用抖音绑定的手机号登录/注册
loginByDouyinPhoneNumber(e) {
  let { encryptedData, iv } = e.detail;
  if (!encryptedData || !iv) {
    return false;
  }
  vk.userCenter.loginByDouyinPhoneNumber({
    data: {
      encryptedData,
      iv,
      encryptedKey: this.encryptedKey
    },
    success: (data) => {
      // 成功后的逻辑

    }
  });
},
```

### vk.userCenter.getPhoneNumber（获取抖音绑定的手机号）@getPhoneNumberByDouyin

> vk-unicloud 版本需 ≥ 2.18.8

注意事项：

1. 此接口需要 `隐私条款` 中包含获取用户手机号
2. 需要单独申请接口权限 [申请教程](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/operation/management/specification/account-login-standard)

```vue
<button type="default" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">获取抖音绑定的手机号</button>
```

```js
// 需要先在onLoad内执行此函数
vk.userCenter.code2SessionDouyin({
  data: {
    needCache: true,
  },
  success: (data) => {
    this.encryptedKey = data.encryptedKey;
  },
});
```

```js
// 获取抖音绑定的手机号码
getPhoneNumber(e) {
  let { encryptedData, iv } = e.detail;
  if (!encryptedData || !iv) {
    return false;
  }
  vk.userCenter.getPhoneNumber({
    data: {
      encryptedData,
      iv,
      encryptedKey: this.encryptedKey
    },
    success: (data) => {
      vk.alert("手机号:" + data.mobile);
    }
  });
},
```

### vk.userCenter.bindDouyin（绑定抖音）@bindDouyin

> vk-unicloud 版本需 ≥ 2.18.8

```js
/**
 * 绑定抖音
 */
vk.userCenter.bindDouyin({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.unbindDouyin（解绑抖音）@unbindDouyin

> vk-unicloud 版本需 ≥ 2.18.8

```js
/**
 * 解绑抖音
 */
vk.userCenter.unbindDouyin({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

云函数端解密 `encryptedKey` 可获得 `sessionKey` 等信息

```js
// 解密 sessionKey 示例
let decryptedRes = vk.crypto.aes.decrypt({
  data: encryptedKey, // 待解密的原文
});
let sessionKey = decryptedRes.sessionKey;
```

### vk.userCenter.code2SessionDouyin（获取抖音 openid）@code2SessionDouyin

> vk-unicloud 版本需 ≥ 2.18.8

```js
/**
 * 获取抖音openid
 * res 返回参数说明
 * @param {String} openid 用户openid
 * @param {String} unionid 用户unionid，可以取到此值时返回
 * @param {String} encryptedKey 加密信息
 */
vk.userCenter.code2SessionDouyin({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

## 华为鸿蒙@huawei

### vk.userCenter.loginByHuawei（华为登录）@loginByHuawei

> vk-unicloud 版本需 ≥ 2.19.0

**_框架会自动保存 `token`，无需你再手动去保存。_**

[查看 token 介绍](#token介绍)

注意：

1. 此接口需要去华为开放平台申请（申请秒通过），申请地址：[点击查看](https://developer.huawei.com/consumer/cn/console/api/scopeManage)

![](https://cdn.fsq.pub/vkdoc/vk-client/b1a0fbcf-3594-4966-8e43-79eac8300599.png)

2. 鸿蒙 App 内使用华为登录的配置

- 配置 `common/uni-config-center/uni-id/config.json` 内 `app-plus.oauth.huawei` 的 `clientId` 和 `clientSecret`（注意 clientId 是鸿蒙应用的 clientId 而非鸿蒙项目的 clientId，clientSecret 同理）
- 在 `manifest.json` 内配置鸿蒙 App 的 `包名`

3. 鸿蒙元服务内使用华为登录的配置

- 配置 `common/uni-config-center/uni-id/config.json` 内 `mp-harmony.oauth.huawei` 的 `clientId` 和 `clientSecret`（注意 clientId 是鸿蒙应用的 clientId 而非鸿蒙项目的 clientId，clientSecret 同理）
- 在 `manifest.json` 内配置鸿蒙元服务的 `包名`

**注意每次修改 uni-config-center 后都要右键上传此公共模块才会生效**

```js
/**
 * 华为账号登录
 * data 请求参数 说明
 * @param {String} type 可传login或register，若为login：则不存在不会自动注册，若为register，则用户存在会报错，不传，则存在自动登录，不存在，则注册。
 * @param {String} nickname 用户昵称（仅注册时生效）
 * @param {String} avatar 用户头像（仅注册时生效）其他参数需要在修改云函数 user/pub/loginByDouyin 内的 customData 字段
 * res 返回参数说明
 * @param {String} token 登录成功之后返回的token信息
 * @param {String} tokenExpired token过期时间
 */
vk.userCenter.loginByHuawei({
  data: {
    type: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.loginByHuaweiPhoneNumber（华为手机号授权登录）@loginByHuaweiPhoneNumber

> vk-unicloud 版本需 ≥ 2.19.0

注意事项：

1. 此接口需要去华为开放平台申请（需要审核的，个人认证的账号大概率审核不通过），申请地址：[点击查看](https://developer.huawei.com/consumer/cn/console/api/scopeManage)

![](https://cdn.fsq.pub/vkdoc/vk-client/9bb19f46-e608-4fae-992a-c932965762b5.png)

2. 鸿蒙 App 端的 button 组件不支持 getPhoneNumber，需要下载安装插件：[鸿蒙 App 实现华为账号一键登录](https://ext.dcloud.net.cn/plugin?id=26106)

**鸿蒙 App**

通过设置 `:need-user-info="true"` 可实现同时获取昵称和头像

注意：鸿蒙 App 下按钮名称固定是华为账号一键登录，不可修改

```vue
<vk-get-phone-number :need-user-info="true" @getphonenumber="loginByHuaweiPhoneNumber" />
```

**元服务**

```vue
<button type="default" open-type="getPhoneNumber" @getphonenumber="loginByHuaweiPhoneNumber">华为账号一键登录</button>
```

```js
// 使用华为账号绑定的手机号登录/注册
loginByHuaweiPhoneNumber(e) {
  // 仅鸿蒙App可获取到nickname和avatar
  let { code, nickname, avatar } = e.detail;
  if (!code) {
    return false;
  }
  vk.userCenter.loginByHuaweiPhoneNumber({
    data: {
      code,
      nickname,
      avatar
    },
    success: (data) => {
      // 成功后的逻辑

    }
  });
},
```

### vk.userCenter.getPhoneNumber（获取华为账号绑定的手机号）@getPhoneNumberByHuawei

> vk-unicloud 版本需 ≥ 2.19.0

注意事项：

1. 此接口需要去华为开放平台申请（需要审核的，个人认证的账号大概率审核不通过）

**鸿蒙 App**

注意：鸿蒙 App 下按钮名称固定是华为账号一键登录，不可修改

```vue
<vk-get-phone-number @getphonenumber="getPhoneNumber" />
```

**元服务**

```vue
<button type="default" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">获取华为账号绑定的手机号</button>
```

```js
// 获取华为账号绑定的手机号
getPhoneNumber(e) {
  let { code } = e.detail;
  if (!code) {
    return false;
  }
  vk.userCenter.getPhoneNumber({
    data: {
      code,
    },
    success: (data) => {
      vk.alert("手机号:" + data.mobile);
    }
  });
},
```

### vk.userCenter.bindHuawei（绑定华为账号）@bindHuawei

> vk-unicloud 版本需 ≥ 2.19.0

```js
/**
 * 绑定华为账号
 */
vk.userCenter.bindHuawei({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.unbindHuawei（解绑华为账号）@unbindHuawei

> vk-unicloud 版本需 ≥ 2.19.0

```js
/**
 * 解绑华为账号
 */
vk.userCenter.unbindHuawei({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.code2SessionHuawei（获取华为 openid）@code2SessionHuawei

> vk-unicloud 版本需 ≥ 2.19.0

```js
/**
 * 获取华为openid
 * res 返回参数说明
 * @param {String} openid 用户openid
 * @param {String} unionid 用户unionid，可以取到此值时返回
 * @param {String} encryptedKey 加密信息
 */
vk.userCenter.code2SessionHuawei({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

## 苹果@apple

### vk.userCenter.loginByApple（苹果登录）@loginByApple

> vk-unicloud 版本需 ≥ 2.19.2

**_框架会自动保存 `token`，无需你再手动去保存。_**

[查看 token 介绍](#token介绍)

注意：

- 配置 `common/uni-config-center/uni-id/config.json` 内 `app-plus.oauth.apple` 的 `bundleId` 即你苹果应用的包名
- 需要打自定义基座，包名必须和 uni-id 配置内的 `bundleId` 一致

**注意每次修改 uni-config-center 后都要右键上传此公共模块才会生效**

```js
/**
 * 苹果账号登录
 * data 请求参数 说明
 * @param {String} type 可传login或register，若为login：则不存在不会自动注册，若为register，则用户存在会报错，不传，则存在自动登录，不存在，则注册。
 * @param {String} nickname 用户昵称（仅注册时生效）
 * res 返回参数说明
 * @param {String} token 登录成功之后返回的token信息
 * @param {String} tokenExpired token过期时间
 */
vk.userCenter.loginByApple({
  data: {
    type: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

## 裂变分销@distribution

### vk.userCenter.setUserInviteCode（设置邀请码）@setUserInviteCode

```js
/**
 * 设置用户邀请码(自动生成)
 * @description 针对未生成邀请码的用户使用此方法生成邀请码(自动生成)
 * res 返回参数说明
 * @param {String} myInviteCode 最终设置的邀请码
 */
vk.userCenter.setUserInviteCode({
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.acceptInvite（用户接受邀请）@acceptInvite

```js
/**
 * 用户接受邀请
 * @description 此接口用于在注册之后再填写邀请码的场景
 * data 请求参数 说明
 * @param {String} inviteCode 邀请人的邀请码
 */
vk.userCenter.acceptInvite({
  data: {
    inviteCode: '',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### vk.userCenter.getInvitedUser（获取接受邀请的用户列表）@getInvitedUser

```js
/**
 * 获取接受邀请的用户清单
 * data 请求参数 说明
 * @param {Number}         pageIndex 当前页码
 * @param {Number}         pageSize  每页显示数量
 * @param {Array<Object>}  sortRule  排序规则
 * @param {object}         formData  查询条件数据源
 * @param {Array<Object>}  columns   查询条件规则
 */
vk.userCenter.getInvitedUser({
  data: {
    pageIndex: 1,
    pageSize: 100,
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

### token 介绍@token

以下仅为介绍 `token`，实际开发过程中，即使你不了解 `token` 的实现逻辑，也不影响你开发项目（框架已经处理完 `token` 的逻辑）。

- `token` 是云函数用来识别用户身份的令牌。

- 用户登录成功后，云函数会返回 `token` 给前端，前端会自动将 `token` 保存到本地缓存。

- 在客户端，`token` 的值存在 `localStorage` 的 `uni_id_token` 键值中，`token` 的过期时间存在 `uni_id_token_expired` 键值中。

- 在云函数端，`token` 存在 `uni-id-users` 表的 `token` 字段中，云函数端解密 `token` 可以获得用户 ID 和过期时间

- 当你访问需要登录的云函数时，框架会自动检测 `token` 是否有效，有效则放行，无效则拦截，无需手动传递和验证 `token`

- `uni-id` 配置中， `tokenExpiresIn` 参数代表新生成的 `token` 有效期，单位为秒

- `uni-id` 配置中，`tokenExpiresThreshold` 参数代表 `token` 在满足条件的情况下会自动续期，前端也会自动更新 `token` 到本地缓存。

- `uni-id` 配置中，`tokenMaxLimit` 参数代表单一用户最大 `token` 数量。当该用户 `token` 数量达到此值时，会淘汰旧的 `token`，即使未过期也会淘汰。
