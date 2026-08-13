# 抽奖活动小助手

## 介绍@introduce

### 什么是抽奖活动小助手？@what

抽奖活动小助手是一款任何人都可以免费自助发起抽奖活动的工具型软件，无需开发，可直接使用。

**详见**

- [抽奖形式](#mode)
- [抽奖活动小助手使用教程](#use-help)

### 抽奖体验@demo

打开微信扫一扫下方小程序码即可体验

![](https://cdn.fsq.pub/vkdoc/vk-lucky-draw/qrcode/demo.jpg)

## 抽奖形式@mode

### 定时开奖@mode-1

**机制 ​​**

- 设定固定开奖时间，到期后系统自动从参与者中随机抽取中奖者

**特点**

- 营造开奖期待感
- 所有奖品统一时间一起开奖，不会因高价值奖品被提前抽中而导致后续参与者力度减少
- 如果参与人数 ≥ 奖品数量，则奖品一定能全部发完
- 如果参与人数 ≤ 奖品数量，则参与人 100%中奖
- 自动推送中奖通知

**适用场景，包括但不限于：**

- 节日庆典活动（如元旦/春节抽奖）
  - 春节抽奖活动（1.20-2.10 参与，除夕夜 20:00 开奖）
  - 双十一狂欢抽奖（11.1-11.10 参与，11.11 00:00 开奖）
  - 公司周年庆（员工当天晚饭时参与，当天晚上吃完饭开奖）
- 新品发布会预热
  - 手机预售抽免单资格（提前 7 天参与，发布会结束开奖）
  - 汽车盲订活动（预售期参与，上市日 12:00 自动开奖）
  - 游戏公测资格抽取（预约阶段参与，开服前 1 小时开奖）
- 定期会员福利活动
  - 每月 15 日会员日（当月 1-14 日参与，15 日 0 点开奖）
- 微信群内抽奖
  - 社群活跃抽奖（定期发布抽奖活动，当天晚 20:00 开奖）
- ​​ 赛事/活动联动 ​
  - 电竞比赛（赛前参与抽奖，比赛结束自动开奖）
  - 马拉松赛事（报名参与，比赛结束自动开奖）
  - 亲子活动（报名参与，活动结束自动开奖）
- 教育学习激励 ​
  - 暑期阅读挑战（7-8 月参与，9 月 1 日开学开奖）
  - 在线课程结业（报名参与，课程结束自动开奖）

### 人数达标自动开奖@mode-2

**机制**​​

设定目标参与人数，达标后系统立即自动开奖

**特点**

- 人数不达标不会开奖，激发用户转发分享
- 如果参与人数 ≥ 奖品数量，则奖品一定能全部发完
- 如果参与人数 ≤ 奖品数量，则参与人 100%中奖
- 自动推送中奖通知

**适用场景，包括但不限于：**

- 社群裂变传播
  - 微信群爆破："满 200 人抽价值 5000 元手机"
- 电商转化场景
  - 预售蓄水："万人预约解锁专享价"（如手机厂商：预约满 10000 人抽 100 台 1 元购资格）
  - 清库存活动："千人参与即打折"（服装品牌：羊毛大衣库存清仓，达标自动开 5 折券）

### 大转盘实时抽奖@mode-3

**机制**​​

用户点击即实时抽奖，转盘动画+即时结果显示

**特点**

- 实时开奖
- 可设置分享增加转盘次数

​​**适用场景 ​​，包括但不限于：**

- 线下活动互动（展会/门店）
  - 展会扫码参与转盘抽奖，现场领取小礼品
  - 门店到店消费满 100 元，现场扫码参与转盘抽奖，现场领取小礼品
  - 新品体验会现场注册用户，现场扫码参与转盘抽奖，现场领取小礼品
- 裂变邀请奖励 ​（分享可增加抽奖次数）
  - 每成功邀请 1 位好友，主客各得 1 次转盘抽奖机会
- ​ 教育激励场景 ​
  - 学员完成课程章节后弹出转盘抽奖激励
  - 在线答题全对，转盘抽奖
  - 提交作业后老师发放转盘奖励机会
- ​​ 电商促销组合 ​
  - 转盘抽奖领取实物奖励或优惠券
  - 订单满 3 件商品解锁免单转盘机会
- ​​ 用户生命周期运营 ​
  - 新用户注册完成立即弹出新人专属转盘
  - 连续签到第 7 天触发幸运星转盘
  - 流失用户回归时推送老友专属转盘

## 使用教程@use-help

### 创建抽奖活动@add-activity

扫一扫下方小程序码即可创建抽奖活动

![](https://cdn.fsq.pub/vkdoc/vk-lucky-draw/qrcode/add.png)

### 更多使用教程@more-help

扫一扫下方小程序码即可查看更多使用教程

![](https://cdn.fsq.pub/vkdoc/vk-lucky-draw/qrcode/help.png)

## API 对接@api

抽奖活动小助手提供了 API 对接的方式，如果你的系统需要集成抽奖功能，且抽奖功能可以和你系统完全解耦，则通过对接抽奖活动小助手是最佳解决方案。

### 具体实施步骤@use-step

1. **创建抽奖活动**：在抽奖活动小助手中 [创建抽奖活动](#add-activity)
2. **获取活动 id**：进入活动详情页 →【复制活动 id】，[获取活动 id](#get-activity-id)
3. **打开抽奖页面**：在你的前端系统添加抽奖按钮，点击时调用 [打开抽奖页面 API](#page-activity-detail)
4. **用户参与抽奖**：用户在打开的抽奖活动页点击"立即抽奖"即可参与

用户中奖后，支持回跳到你的小程序领奖（暂只支持跳转到小程序，后续会支持跳转到 H5 和 App）

### 获取 activity_id（活动 id）@get-activity-id

- 方法一：可直接进入抽奖活动小助手内的活动详情页，点击复制活动 id，如下图所示

![](https://cdn.fsq.pub/vkdoc/vk-lucky-draw/image/a5148a4e-e21a-4662-8641-9225ce4ffcba.png)

- 方法二：通过[云端 API](#api-cloud)来获取活动 id

### 获取 API Key@get-api-key

扫一扫下方小程序码即可创建 API Key

![](https://cdn.fsq.pub/vkdoc/vk-lucky-draw/qrcode/apikey.png)

### 客户端 API@api-client

:::warning 注意

vk-unicloud 版本需 ≥ 2.19.9

:::

接口名：`vk.navigateToLuckyDraw`

注意：仅支持在微信小程序、微信公众号、App、浏览器（若是 PC 浏览器需先登录 PC 版微信）中使用，其他平台暂不支持。

[查看活动 id 获取教程](#get-activity-id)

#### 打开抽奖页面@page-activity-detail

```js
let activity_id = '685b95a6e9f982fde4835c85'; // 活动id
vk.navigateToLuckyDraw({
  path: `pages/activity/detail/detail?_id=${activity_id}`,
});
```

#### 查看指定活动的参与人员列表@page-activity-user-list

```js
let activity_id = '685b95a6e9f982fde4835c85'; // 活动id
vk.navigateToLuckyDraw({
  path: `pages/activity/user-list/user-list?_id=${activity_id}`,
});
```

#### 查看指定活动的中奖人员列表@page-activity-win-user-list

```js
let activity_id = '685b95a6e9f982fde4835c85'; // 活动id
vk.navigateToLuckyDraw({
  path: `pages/activity/win-user-list/win-user-list?_id=${activity_id}`,
});
```

#### 生成指定活动分享海报@page-activity-share

```js
let activity_id = '685b95a6e9f982fde4835c85'; // 活动id
vk.navigateToLuckyDraw({
  path: `pages/activity/share/share?_id=${activity_id}`,
});
```

#### 创建抽奖@page-add

```js
vk.navigateToLuckyDraw({
  path: 'pages/index/add',
});
```

#### 查看我创建的抽奖@page-user-my-add

```js
vk.navigateToLuckyDraw({
  path: 'pages/user/my-add/list',
});
```

#### 查看我参与的抽奖@page-user-my-in

```js
vk.navigateToLuckyDraw({
  path: 'pages/user/my-in/list',
});
```

#### 查看我的中奖记录@page-user-my-win

```js
vk.navigateToLuckyDraw({
  path: 'pages/user/my-win/list',
});
```

#### 前往会员中心@page-mys

```js
vk.navigateToLuckyDraw({
  path: 'pages/index/mys',
});
```

#### 前往首页@page-index

```js
vk.navigateToLuckyDraw({
  path: 'pages/index/index',
});
```

#### 前往帮助中心@page-help

```js
vk.navigateToLuckyDraw({
  path: 'pages/pub/help/index',
});
```

#### 前往生成 API key 页面@page-user-api-key

生成的 API Key 主要用于在 vk-admin 中进行活动管理

```js
vk.navigateToLuckyDraw({
  path: 'pages/user/api-key/list',
});
```

### 云端 API@api-cloud

云端 API 已集成到 [vk-admin 框架](https://ext.dcloud.net.cn/plugin?id=5043) 中（vk-admin 的版本需 ≥ 1.21.0），打开页面 `/pages_plugs/system-uni/lucky-draw/list.vue` 体验

如果未使用 vk-admin，也可以通过 http 接口对接，[http 接口文档](https://osxlqv0f4c.apifox.cn/314777965e0)

## 常见问题？@q

### 使用要收费吗？@q1

软件可免费使用，不收费。

### 通过 API 对接要收费吗？@q2

免费使用，不收费。
