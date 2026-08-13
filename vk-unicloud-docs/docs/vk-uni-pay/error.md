---
sidebarDepth: 0
---

# 全局错误码

| 错误模块   | 错误码 | 说明                                                                                     |
| ---------- | ------ | ---------------------------------------------------------------------------------------- |
| vk-uni-pay | 101    | 请先配置正确的异步回调 URL，参考[配置文档](https://vkdoc.fsq.pub/vk-uni-pay/config.html) |
| vk-uni-pay | 1001   | out_trade_no 必须是 string 类型，且不能为空                                              |
| vk-uni-pay | 1002   | type 必须是 string 类型，且不能为空，如设置为 goods 代表商品订单                         |
| vk-uni-pay | 1003   | total_fee 必须为正整数（>0 的整数）（注意：100=1 元）                                    |
| vk-uni-pay | 1004   | subject 必须是 string 类型，且不能为空                                                   |
| vk-uni-pay | 1005   | provider 必须是 string 类型，且不能为空                                                  |
| vk-uni-pay | 1006   | 用户 openid 不能为空                                                                     |
| vk-uni-pay | 1007   | amount 必须是数字类型                                                                    |
| vk-uni-pay | 1008   | amount 必须大于 0，注意：100=1 元（单位分）                                              |
| vk-uni-pay | 1009   | account 不能为空                                                                         |
| vk-uni-pay | 1010   | real_name 不能为空                                                                       |
| vk-uni-pay | 1011   | platform 不能为空                                                                        |
| vk-uni-pay | 1012   | 转账接收者的 openid 不能为空                                                             |
| vk-uni-pay | 1013   | code 不能为空                                                                            |
| vk-uni-pay | 1014   | transaction_receipt 必须是 string 类型，且不能为空                                       |
| vk-uni-pay | 1015   | transaction_identifier 必须是 string 类型，且不能为空                                    |
| vk-uni-pay | 1016   | ios 内购凭据校验不通过                                                                   |
| vk-uni-pay | 1017   | 微信小程序虚拟支付：wxpay_virtual 不能为空                                               |
| vk-uni-pay | 1018   | 微信小程序虚拟支付：buy_quantity 必须为正整数（>0 的整数）                               |
| vk-uni-pay | 1019   | 微信小程序虚拟支付：参数 mode 错误                                                       |
| vk-uni-pay | 2001   | 订单不存在                                                                               |
| vk-uni-pay | 2002   | 订单未支付                                                                               |
| vk-uni-pay | 2003   | 订单未退款                                                                               |
| vk-uni-pay | 2004   | 该订单暂无法退款，请等 1 分钟后再试                                                      |
| vk-uni-pay | 3001   | 获取支付信息失败，请稍后再试                                                             |
