---
sidebarDepth: 0
---

# 海外全球加速方案

> vk-unicloud 版本需 ≥ 2.18.6

## 介绍

目前云开发在海外访问会比较慢，因此需要海外全球加速，下面是目前可行的方案

> 仅只支持支付宝云、阿里云，不支持腾讯云

## 资源准备

1. 需要开通一个支付宝云或阿里云的服务空间，不支持腾讯云服务空间
2. 需要购买阿里云全球加速产品（选按量付费即可）
3. 需要购买一台阿里云 ECS（需要买在杭州可用区 H，买台便宜的即可，使用宝塔镜像搭建）
4. 一个已经在阿里云备案过的自己的域名
5. 域名有 SSL 证书
6. 开通扩展存储（如果你需要云存储也全球加速的话）

## 操作步骤

假设加速域名是 `api.example.com`

1. 进入 ECS 的宝塔页面，安装 nginx
2. 新建网站，网站域名填 `api.example.com`，并设置反向代理，如果是阿里云空间，填 `https://api.next.bspapp.com` ，如果是支付宝云空间填 `https://{spaceId}.api-hz.cloudbasefunction.cn` (其中{spaceId}替换成你的支付宝云空间 id)
3. 设置全球加速，选 https 并监听 443 端口（你的 `api.example.com` 必须要有 ssl 证书），其中后端服务选你搭建了 nginx 并反向代理的那台 ECS，加速地区选你需要加速的地区，源站区域选杭州
4. 去域名解析后台配置 cname 解析 `api.example.com` 到全球加速的 cname 地址
5. 等待 10-20 分钟，等全球加速配置全部生效后，此时访问 `api.example.com` 如果能正常访问，代表全球加速配置成功了
6. 打开项目根目录的 `app.config.js` 文件，在 `根节点` 新增以下配置

**注意，是加在 `根节点` ，而 `非service.cloudStorage.unicloud` 内**

```js
"uniCloud": {
	// 自定义默认环境（一般无需配置，除非你知道这么配置带来的意义）
	"envs": {
		// 当有设置 default 的环境时，不传env，会自动用此环境调用云函数。
		"default": {
			"provider": "", // 通用参数 支付宝云：alipay 阿里云：aliyun
			"spaceId": "", // 通用参数 从 https://unicloud.dcloud.net.cn/home 获取 对应SpaceId参数
			"clientSecret": "", // 阿里云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应ClientSecret参数
			"spaceAppId": "", // 支付宝云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应SpaceAppId参数
			"accessKey": "", // 支付宝云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应AK参数
			"secretKey": "", // 支付宝云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应SK参数
			"endpoint": "https://api.example.com" // 海外加速网关地址，仅阿里云和支付宝云支持此参数
		}
	}
}
```

7. 使用 vk.callFunction 尝试请求云函数，如果请求成功，且去浏览器网络请求中看到请求的域名变成了你自己的域名，那代表全球加速配置成功了

**注意**

上面的操作只能加速云函数和云对象，无法加速云存储，云存储需要使用扩展存储，下面是加速云存储的步骤

扩展存储绑定的域名是 `cdn.example.com`
假设加速云存储的域名是 `storage.example.com`

1. 进入 ECS 的宝塔页面，新建网站，网站域名填 `storage.example.com`，并设置反向代理到 `https://upload.qiniup.com`
2. 设置全球加速，选 https 并监听 443 端口（你的 `storage.example.com` 必须要有 ssl 证书），其中后端服务选你搭建了 nginx 并反向代理的那台 ECS，加速地区选你需要加速的地区，源站区域选杭州
3. 去域名解析后台配置 cname 解析 `storage.example.com` 到全球加速的 cname 地址
4. 等待 10-20 分钟，等全球加速配置全部生效后，此时访问 `storage.example.com` 如果显示 `{"error":"only allow POST method"}` 代表全球加速配置成功了
5. 打开项目文件 `/uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center/vk-unicloud/index.js`，在 `vk.service` 节点填写配置

```js
// 云储存相关配置
"cloudStorage": {
	/**
	 * vk.uploadFile 接口默认使用哪个存储
	 * unicloud 空间内置存储（默认）
	 * extStorage 扩展存储
	 */
	"defaultProvider": "extStorage",
	// 空间内置存储
	"unicloud": {
		// 暂无配置项
	},
	// 扩展存储配置
	"extStorage": {
		"provider": "qiniu", // qiniu: 扩展存储-七牛云
		"domain": "cdn.example.com", // 自定义域名，如：cdn.example.com（填你在扩展存储绑定的域名）
		"endpoint": {
			"upload": "https://storage.example.com", // 上传接口的代理地址，在国内上传无需填写
		}
	}
}
```

7. 打开项目文件 `app.config.js` 文件，在 `service` 节点填写配置

```js
// 云储存相关配置
cloudStorage: {
	/**
	 * vk.uploadFile 接口默认使用哪个存储
	 * unicloud 空间内置存储（默认）
	 * extStorage 扩展存储
	 */
	defaultProvider: "extStorage",
	// 空间内置存储
	unicloud: {
		// 暂无配置项
	},
	// 扩展存储配置
	extStorage: {
		provider: "qiniu", // qiniu: 扩展存储-七牛云
		// 根目录名称（如果改了这里的dirname，则云函数user/pub/getUploadFileOptionsForExtStorage内判断的目录权限也要改，否则无法上传）
		dirname: "public",
		// 用于鉴权的云函数地址（一般不需要改这个参数）
		authAction: "user/pub/getUploadFileOptionsForExtStorage",
		// 自定义域名，如：cdn.example.com（填你在扩展存储绑定的域名）
		domain: "cdn.example.com",
		// 上传时，是否按用户id进行分组储存
		groupUserId: false,
	}
}
```
