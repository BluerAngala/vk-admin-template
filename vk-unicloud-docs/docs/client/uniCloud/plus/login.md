---
sidebarDepth: 0
---

# 三方登录扩展

> 以下 API 需要 vk-unicloud 核心库版本 >= 2.18.8

以扩展抖音小程序登录为例

## 配置文件@config

打开 `uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json` 文件，配置里面的

"mp-toutiao" 抖音小程序（此值=uniapp 的条件编译的值即可）

```js
"mp-toutiao": {
  "oauth": {
    "toutiao": {
      "appid": "",
      "privateKey": ""
    }
  }
}
```

配置完需要上传 `uni-config-center` 这个公共模块才会生效

## 编写云函数 user/pub/loginByDouyin@loginByxxx

具体代码请直接查看示例项目源代码 `router/service/user/pub/loginByDouyin.js`

注意：

1. code 换取 openid 需要自己实现（框架已内置的除外）
2. 自己定义好 openid 存储的字段名

## 命中过滤器@filter

如果云函数不以 `user/pub/login` 开头，则需要额外在以下 2 个过滤器中添加 `regExp`

过滤器 1 号：`returnUserInfoFilter` 文件地址：`router/middleware/modules/returnUserInfoFilter.js`

过滤器 2 号：`registerInitFilter` 文档地址：`router/middleware/modules/registerInitFilter.js`

使当前登录的云函数 `user/pub/loginByDouyin` 满足 `regExp` 内的规则即可（默认 user/pub/login\*开头的已命中过滤器）
