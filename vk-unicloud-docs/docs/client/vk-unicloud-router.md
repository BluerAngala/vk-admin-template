---
sidebarDepth: 0
---

# 关于 vk-unicloud-router 框架

## 什么是 vk-unicloud-router ？

- `vk-unicloud-router` 是基于 `unicloud` + `uni-id` 的一套快速（client 端）完整开发框架
- （支持 H5、APP、小程序）

## vk-unicloud-router 与官方 unicloud-router 的关系？

`vk-unicloud-router` 的出现时间比 `unicloud-router` 要早，没有太大关系，用户在此框架上的编码风格与 `unicloud-router` 差别较大。

## vk-unicloud-router 与官方 uni-starter 的区别是什么？

- `uni-starter`是官方维护的，主要使用的技术栈是 `uniapp` + `vue` + `uni-id` + `DB Schema` + `clientDB` （数据库操作主要在前端）

- `vk-unicloud-router`主要使用的技术栈是 `uniapp` + `vue` + `uni-id` + `云函数路由模式` + `vk.baseDao` (数据库操作主要在后端）

- 同时 `vk-unicloud-router` 内置大量 API 轮子（前后端都有） [点击查看](https://vkdoc.fsq.pub/client/jsapi.html)

- 函数式数据库 API（调用数据库就像在做填空题） [点击查看](https://vkdoc.fsq.pub/client/uniCloud/db/api.html)

- vuex 持久化 [点击查看](https://vkdoc.fsq.pub/client/pages/vuex.html)

- 支持上传到阿里云 OSS [点击查看](https://vkdoc.fsq.pub/client/pages/uploadFile.html)

- 内置了微信小程序 api [点击查看](https://vkdoc.fsq.pub/client/uniCloud/plus/weixin.html)

- 内置了百度开放平台 api [点击查看](https://vkdoc.fsq.pub/client/uniCloud/plus/baidu.html)

- 支持阿里云官网的短信发送 [点击查看](https://vkdoc.fsq.pub/client/uniCloud/plus/sms.html)

- 邮箱验证码 [点击查看](https://vkdoc.fsq.pub/client/uniCloud/plus/mail.html)

- 等等

- `vk-unicloud-router` 和 `vk-unicloud-admin` 大量集成了群内众多开发人员实际项目开发过程中实际需要的公共需求。（使你项目还未开始就已经完成了 50%）
