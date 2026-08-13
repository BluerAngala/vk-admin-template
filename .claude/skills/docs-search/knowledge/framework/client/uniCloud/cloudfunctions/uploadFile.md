---
sidebarDepth: 0
---

# 云端文件上传

> vk-unicloud 版本需 ≥ 2.18.6

注意：前端文件上传文档 [https://vkdoc.fsq.pub/client/pages/uploadFile.html](https://vkdoc.fsq.pub/client/pages/uploadFile.html)

## 接口名：vk.uploadFile

## 请求参数

| 参数        | 说明                           | 类型    | 默认值 | 可选值 |
| ----------- | ------------------------------ | ------- | ------ | ------ |
| provider    | [查看 provider](#provider)     | string  | -      | -      |
| cloudPath   | 云端文件路径                   | string  | -      | -      |
| fileContent | buffer 或要上传的文件可读流    | -       | -      | -      |
| isPrivate   | 是否是私有文件，仅扩展存储有效 | boolean | -      | -      |

## 返回值

|  参数名   |  类型   |                  说明                  |
| :-------: | :-----: | :------------------------------------: |
| provider  | string  |          本次上传的存储供应商          |
| cloudPath | string  |              云端文件路径              |
|  fileID   | string  |              云端文件 ID               |
|  fileURL  | string  |              云端文件 URL              |
|    url    | string  |     云端文件 URL，与 fileURL 一致      |
| isPrivate | boolean | 是否是私有文件，仅扩展存储会返回此字段 |

## provider

`provider` 可指定云存储供应商，若 `provider` 不传，则自动从云端配置 `uni-config-center/vk-unicloud/index.js` 中获取 `vk.service.cloudStorage.defaultProvider` 的值

| 可选项     | 说明         |
| ---------- | ------------ |
| unicloud   | 空间内置存储 |
| extStorage | 扩展存储     |

## 上传文件示例代码

```js
// 模拟一个1KB的文件
const buffer = Buffer.alloc(1024); // 创建一个1KB的Buffer
let uploadFileRes = await vk.uploadFile({
  cloudPath: 'public/test.txt',
  fileContent: buffer,
});
console.log('uploadFileRes: ', uploadFileRes);
```

## 配置默认云存储供应商

### 默认上传至 unicloud 空间内置存储

在 `uni-config-center/vk-unicloud/index.js` 中配置 `vk.service.cloudStorage.defaultProvider` 值为 `unicloud`

```js
"service": {
  // 云储存相关配置
  "cloudStorage": {
    /**
     * vk.uploadFile 接口默认使用哪个存储
     * unicloud 空间内置存储（默认）
     * extStorage 扩展存储
     */
    "defaultProvider": "unicloud", // 这里若设置 extStorage 则 vk.uploadFile默认会上传至 扩展存储
  }
},
```

### 默认上传至扩展存储

**配置步骤**

1. 打开文件 `cloudfunctions/common/uni-config-center/vk-unicloud/index.js`，修改 `vk.service.cloudStorage.defaultProvider` 值为 `extStorage`，再修改 `domain` 为你开通扩展存储时绑定的域名，如下图所示

![](https://cdn.fsq.pub/vkdoc/vk-client/1e8b5e37-9edb-452f-ac2c-149e10ecebfa.png)

**具体配置如下**

修改后需要重新上传 `uni-config-center` 公共模块才会生效

```js
// 第三方服务配置
"service": {
  // 云储存相关配置
  "cloudStorage": {
  	/**
  	 * vk.uploadFile 接口默认使用哪个存储
  	 * unicloud 空间内置存储（默认）
  	 * extStorage 扩展存储
  	 */
  	"defaultProvider": "extStorage",
  	// 扩展存储配置
  	"extStorage": {
  		"provider": "qiniu", // qiniu: 扩展存储-七牛云
  		"domain": "", // 自定义域名，如：cdn.example.com（填你在扩展存储绑定的域名）
  		"bucketName": "", // 存储空间名称，可不填，不填则使用当前空间绑定的存储空间
  		"bucketSecret": "", // 存储空间密钥，可不填，不填则使用当前空间绑定的存储空间
  		"endpoint": {
  			"upload": "", // 上传接口的代理地址，在国内上传无需填写
  		}
  	}
  }
},
```

2. 打开文件 `项目根目录/app.config.js`，修改 `service.cloudStorage.defaultProvider` 值为 `extStorage`，再修改 `domain` 为你开通扩展存储时绑定的域名，如下图所示

![](https://cdn.fsq.pub/vkdoc/vk-client/0f8e0706-d731-491c-a5b0-0b09000f188b.png)

**具体配置如下**

```js
// 第三方服务配置
service: {
	// 云储存相关配置
	cloudStorage: {
		/**
		 * vk.uploadFile 接口默认使用哪个存储
		 * unicloud 空间内置存储（默认）
		 * extStorage 扩展存储
		 */
		defaultProvider: "extStorage",
		// 扩展存储配置
		extStorage: {
			provider: "qiniu", // qiniu: 扩展存储-七牛云
			// 根目录名称（如果改了这里的dirname，则云函数user/pub/getUploadFileOptionsForExtStorage内判断的目录权限也要改，否则无法上传）
			dirname: "public",
			// 用于鉴权的云函数地址（一般不需要改这个参数）
			authAction: "user/pub/getUploadFileOptionsForExtStorage",
			// 自定义域名，如：cdn.example.com（填你在扩展存储绑定的域名，若云端已设置 uni-config-center/vk-unicloud/index.js 内的 vk.service.cloudStorage.extStorage.domain 则此处可不填）
			domain: "",
			// 上传时，是否按用户id进行分组储存
			groupUserId: false,
		}
	}
},
```

## 完整配置

**云端配置**

文件 `项目根目录/app.config.js`

节点 `service.cloudStorage`

```js
"service": {
	// 云储存相关配置
	"cloudStorage": {
		/**
		 * vk.uploadFile 接口默认使用哪个存储
		 * unicloud 空间内置存储（默认）
		 * extStorage 扩展存储
		 */
		"defaultProvider": "unicloud",
		// 空间内置存储
		"unicloud": {
			// 暂无配置项
		},
		// 扩展存储配置
		"extStorage": {
			"provider": "qiniu", // qiniu: 扩展存储-七牛云
			"domain": "", // 自定义域名，如：cdn.example.com（填你在扩展存储绑定的域名）
			"bucketName": "", // 存储空间名称，可不填，不填则使用当前空间绑定的存储空间
			"bucketSecret": "", // 存储空间密钥，可不填，不填则使用当前空间绑定的存储空间
			"endpoint": {
				"upload": "", // 上传接口的代理地址，在国内上传无需填写
			}
		}
	}
},
```

**前端配置**

文件 `cloudfunctions/common/uni-config-center/vk-unicloud/index.js`

节点 `vk.service.cloudStorage`

```js
// 第三方服务配置
service: {
	// 云储存相关配置
	cloudStorage: {
		/**
		 * vk.uploadFile 接口默认使用哪个存储
		 * unicloud 空间内置存储（默认）
		 * extStorage 扩展存储
		 * aliyun 阿里云oss
		 */
		defaultProvider: "unicloud",
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
			// 自定义域名，如：cdn.example.com（填你在扩展存储绑定的域名，若云端已设置 uni-config-center/vk-unicloud/index.js 内的 vk.service.cloudStorage.extStorage.domain 则此处可不填）
			domain: "",
			// 上传时，是否按用户id进行分组储存
			groupUserId: false,
		}
	}
},
```

## 公共 API

### vk.getTempFileURL（获取临时下载链接）

**示例代码**

```js
vk.getTempFileURL({
  fileList: ['https://www.xxx.com/test.jpg'], // 文件地址列表
});
```

**请求参数**

| 参数     | 说明                       | 类型   | 默认值 | 可选值 |
| -------- | -------------------------- | ------ | ------ | ------ |
| provider | [查看 provider](#provider) | string | -      | -      |
| fileList | 云端文件列表               | Array  | -      | -      |

**返回值**

|  参数名  | 类型  |         说明         |
| :------: | :---: | :------------------: |
| fileList | Array | 存储下载链接的数组。 |

### vk.downloadFile（下载文件）

**示例代码**

```js
vk.downloadFile({
  fileID: 'https://www.xxx.com/test.jpg',
});
```

**请求参数**

| 参数     | 说明                       | 类型   | 默认值 | 可选值 |
| -------- | -------------------------- | ------ | ------ | ------ |
| provider | [查看 provider](#provider) | string | -      | -      |
| fileID   | 待下载的文件               | string | -      | -      |

**返回值**

|   参数名    |  类型  |        说明        |
| :---------: | :----: | :----------------: |
| fileContent | Buffer | 下载的文件的内容。 |

### vk.deleteFile（删除文件）

**示例代码**

```js
vk.deleteFile({
  fileList: ['https://www.xxx.com/test.jpg'], // 文件地址列表
});
```

**请求参数**

| 参数     | 说明                       | 类型   | 默认值 | 可选值 |
| -------- | -------------------------- | ------ | ------ | ------ |
| provider | [查看 provider](#provider) | string | -      | -      |
| fileList | 云端文件列表               | Array  | -      | -      |

**返回值**

|  参数名  | 类型  |         说明         |
| :------: | :---: | :------------------: |
| fileList | Array | 删除结果组成的数组。 |

## 扩展存储专属 API

### 获取扩展存储管理对象

扩展存储相比内置存储具有更多的云端 API，在调用这些云端 API 前，需要先通过 `vk.getExtStorageManager` 获取 `extStorageManager` 对象实例，然后再通过 `extStorageManager.xxx` 调用对应的 API

**云端代码**

```js
// 获取扩展存储管理对象
const extStorageManager = vk.getExtStorageManager();
```

**请求参数**

`vk.getExtStorageManager` 若不传参数，则会自动从 `uni-config-center/vk-unicloud/index.js` 中获取配置 `vk.service.cloudStorage.extStorage`

若传了参数，则 `provider` 和 `domain` 为必填参数

|    参数名    |  类型  | 必填 | 默认值 | 说明                                                                                     |
| :----------: | :----: | :--: | :----: | :--------------------------------------------------------------------------------------- |
|   provider   | String |  否  |   -    | 必填，扩展存储供应商，可选<br/>qiniu 七牛云                                              |
|    domain    | String |  否  |   -    | 必填，扩展储存域名（域名地址）如：example.com                                            |
|  bucketName  | String |  否  |   -    | 选填，扩展储存的 bucket 名称，不填会自动从绑定的空间中获取（此参数当前仅云端运行时生效） |
| bucketSecret | String |  否  |   -    | 选填，扩展储存的 bucket 密钥，不填会自动从绑定的空间中获取（此参数当前仅云端运行时生效） |

### 修改文件状态

接口名：updateFileStatus

可以将指定文件设置为私有权限或公共权限

默认上传的文件都是公共权限，如果需要将文件设置为私有权限，则可调用此接口

**云端代码**

```js
// 获取扩展存储管理对象
const extStorageManager = vk.getExtStorageManager();
// 修改文件状态
let updateFileStatus = await extStorageManager.updateFileStatus({
  fileID: 'qiniu://test.jpg', // 待修改的文件
  isPrivate: true, // true 私有 false 公共
});
console.log('updateFileStatus: ', updateFileStatus);
```

**请求参数**

|  参数名   |  类型   | 必填 | 默认值 | 说明                                                                                                                                                |
| :-------: | :-----: | :--: | :----: | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
|  fileID   | String  |  是  |   -    | 待修改的文件，该字段支持的值类型：fileID、cloudPath、fileURL <br/>如："qiniu://test.jpg" "test.jpg" "https://example.com/test.jpg" 均表示同一个文件 |
| isPrivate | Boolean |  是  |   -    | true 设为私有权限 false 设为公共读权限                                                                                                              |

**响应参数**

|  字段   |  类型  | 说明                |
| :-----: | :----: | :------------------ |
| errCode | Number | 0 成功 其他均为失败 |
| errMsg  | String | 失败描述            |

### 获取域名列表

接口名：getDomains

注意：获取的域名列表是账号绑定的所有域名

**云端代码**

```js
// 获取扩展存储管理对象
const extStorageManager = vk.getExtStorageManager();
// 获取域名列表
let { domains = [] } = await extStorageManager.getDomains();
console.log('域名列表: ', domains);
```

**响应参数**

|  字段   | 类型  | 说明     |
| :-----: | :---: | :------- |
| domains | Array | 域名列表 |

### 获取 TOP100 统计数据

接口名：getCdnTop

注意：获取的域名列表是账号绑定的所有域名

**云端代码**

```js
// 获取扩展存储管理对象
const extStorageManager = vk.getExtStorageManager();
// 获取域名列表
let { domains = [] } = await extStorageManager.getDomains();
// 查询 2024-05-12 日的TOP100统计数据
let startDate = '2024-05-12';
let endDate = '2024-05-12';
// 获取TOP100统计数据
let getCdnTopRes = await extStorageManager.getCdnTop({
  type: 2, // 1 topURL 2 topIP
  domains,
  startDate,
  endDate,
});
console.log('TOP100统计数据: ', getCdnTopRes.data);
```

**请求参数**

|  参数名   |  类型  | 必填 | 默认值 | 说明                                                         |
| :-------: | :----: | :--: | :----: | :----------------------------------------------------------- |
|   type    | Number |  是  |   -    | 必填，查询类型，值为 1 代表查询 topURL 值为 2 代表查询 topIP |
|  domains  | Array  |  是  |   -    | 必填，域名列表，总数不超过 100 条                            |
| startDate | String |  是  |   -    | 必填，开始时间，格式为：2006-01-02。起止最大间隔为 31 天     |
|  endDate  | String |  是  |   -    | 必填，结束时间，格式为：2006-01-02。起止最大间隔为 31 天     |

**响应参数**

| 字段 | 类型  | 说明            |
| :--: | :---: | :-------------- |
| data | Array | TOP100 统计数据 |

### 图片处理

图片处理请参考[uniCloud 官方文档](https://doc.dcloud.net.cn/uniCloud/ext-storage/dev.html#imageshandle)
