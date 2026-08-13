# 发行 App

## 发行前要做的事情

1. Ios 去苹果开放平台申请账号（每年 99 美元）
2. Android 去各大应用市场申请账号（当然安卓直接发编译后的 APK 给用户也能安装，上架插件市场则显的更正规）
3. 设置 APP 权限

App 在发行前需要在 `manifest.json` App 模块设置勾选参考以下 App 模块（根据你自己业务情况勾选）

- Barcode（扫码）
- Camera&Gallery（相机和相册）
- Geolocation（定位）
  - 勾选系统定位
  - 高德定位
- Maps（地图）
  - 高德地图
- OAuth（登录鉴权）
  - 一键登录（可选）
  - 苹果登录
  - 微信登录
- Payment（支付）
  - 支付宝支付
  - 微信支付
- Share（分享）
  - 微信分享

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/bc114333-1128-43e3-9790-67af92291212.png)

## HBX 编译代码

勾选好 App 模块后，点击 HBX 上方菜单【发行】-【原生 App-云打包】

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/5542fa0e-cece-434e-a762-b0c3d85b779d.png)

填写包名密钥等参数，最后点击打包，然后等待 10-60 分钟左右，打包完成。

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/404f2c43-a107-4041-b13e-b09c1bc92201.png)

**如何申请证书**

[android 证书申请指南](https://ask.dcloud.net.cn/article/35777)

[ios 证书申请指南](https://ask.dcloud.net.cn/article/152)
