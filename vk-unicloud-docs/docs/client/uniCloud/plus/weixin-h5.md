---
sidebarDepth: 0
---

# 微信公众号 API

:::warning 注意

此非前端 API，请在云函数内调用。
:::

必须是已认证的微信服务号，服务号只有企业才可以认证

## 配置文件@config

打开 `uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json` 文件，配置里面的

"h5-weixin" 微信公众号

```js
"h5-weixin": {
  "oauth": {
    "weixin": {
      "appid": "",
      "appsecret": ""
    }
  }
},
```

配置完需要上传 `uni-config-center` 这个公共模块才会生效

## 微信公众号万能 API 调用接口@generalapi

**特别注意**

微信公众号调用 api 需要白名单授权，[传送门](https://mp.weixin.qq.com/)

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/20c44c60-7794-4edd-a1ef-957004458afb.png)

[如何获取我本地电脑的 IP](https://www.baidu.com/s?wd=%E6%88%91%E7%9A%84ip)

[unicloud 如何获取固定 IP](#获取固定IP)

```js
let requestRes = await vk.openapi.weixin.h5.request({
  method: 'GET',
  url: 'wxaapi/newtmpl/gettemplate',
  data: {},
});
```

**请求参数**

| 参数      | 说明                                                              | 类型   | 默认值 | 可选值 |
| --------- | ----------------------------------------------------------------- | ------ | ------ | ------ |
| method    | 请求模式，分为 GET 和 POST（不区分大小写）                        | String | POST   | GET    |
| url       | 微信接口路径                                                      | String | -      | -      |
| data      | 请求数据                                                          | Object | -      | -      |
| appid     | 可不填，不填会自动从 uni-id 配置的 h5-weixin 节点里获取 appid     | String | -      | -      |
| appsecret | 可不填，不填会自动从 uni-id 配置的 h5-weixin 节点里获取 appsecret | String | -      | -      |

**url 参数详解**

以 `生成带参数的二维码` 为例

**请求地址**

`POST` https://api.weixin.qq.com/`cgi-bin/qrcode/create`?access_token=TOKEN

`method` 为 `POST`

`url` 为 `cgi-bin/qrcode/create`

**最终代码**

```js
let requestRes = await vk.openapi.weixin.h5.request({
  method: 'POST',
  url: 'cgi-bin/qrcode/create',
  data: {
    expire_seconds: 604800, // 单位秒，最大2592000秒
    action_name: 'QR_STR_SCENE',
    action_info: {
      scene: {
        scene_str: '001', // 注意，这里只能是字符串，且只有scene_str一个参数
      },
    },
  },
});
```

**公共返回参数**

| 参数 | 说明                     | 类型   |
| ---- | ------------------------ | ------ |
| code | 0 代表成功，其他均为失败 | Number |
| msg  | 失败时的提示内容         | String |

其他返回参数参考微信公众号服务端 API 文档 [传送门](https://developers.weixin.qq.com/doc/offiaccount/Account_Management/Generating_a_Parametric_QR_Code.html)

## 获取固定 IP@ip

**unicloud 如何获取固定 IP？**

### 腾讯云空间@ip-tcb

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/0c2634e7-b26a-4e6f-ae8b-ecdeed0772d2.png)

### 阿里云空间@ip-aliyun

直接把下面的 ip 都加进去即可。

**代理服务器 IP 列表**

```js
47.92.132.2
47.92.152.34
47.92.87.58
47.92.207.183
8.142.185.204
```

### 支付宝云空间@ip-alipay

直接把下面的 ip 都加进去即可。

**固定出口 IP 列表**

```js
47.97.38.108
112.124.10.115
```

注意：上面的 IP 是云端运行时的 IP，若是本地运行云函数，则需要把自己电脑的外网 IP 加进去

## 常见问题@question

### 如何调用上传临时素材接口?@q1

上传素材接口与其他接口不一样，因为涉及到 formData 格式的参数

**代码块**

```js
let {
  base64, //前端通过vk.pubfn.fileToBase64将图片转为base64
} = data;

if (!base64) return { code: -1, msg: 'base64不能为空' };

let base64Str = 'base64,';
let base64Index = base64.indexOf(base64Str);
if (base64Index > -1) base64 = base64.substring(base64Index + base64Str.length);
let dataBuffer = new Buffer(base64, 'base64');

let formData = new vk.formDataUtil.FormData();
formData.append('media', dataBuffer, {
  filename: `${Date.now()}.png`,
  contentType: 'image/png',
});

let type = 'image';
let requestRes = await vk.openapi.weixin.h5.request({
  method: 'POST',
  url: `cgi-bin/media/upload?type=${type}`,
  content: formData.getBuffer(),
  headers: formData.getHeaders(),
  useContent: false,
});

console.log('requestRes: ', requestRes);
```

### 如何回复消息？@q2

因微信公众号回复消息需要返回 xml 格式，因此我们需要使用[返回集成响应](https://uniapp.dcloud.net.cn/uniCloud/http.html#integrationresponse)

**代码示例**

```js
let params = {
  ToUserName: '', // 用户openid
  FromUserName: '', // 微信公众号原始id（gh_开头的那个）
  CreateTime: parseInt(Date.now() / 1000), // 时间戳（到秒）
  MsgType: 'text', // 消息类型
  Content: '你好', // 消息内容
};
let xml = `
<xml>
  <ToUserName><![CDATA[${params.ToUserName}]]></ToUserName>
  <FromUserName><![CDATA[${params.FromUserName}]]></FromUserName>
  <CreateTime>${params.CreateTime}</CreateTime>
  <MsgType><![CDATA[${params.MsgType}]]></MsgType>
  <Content><![CDATA[${params.Content}]]></Content>
</xml>
`;
return {
  mpserverlessComposedResponse: true, // 强制字字段为true
  statusCode: 200, // 返回200状态码
  headers: {
    'content-type': 'application/xml', // 返回xml格式
  },
  body: xml, // xml内容
};
```
