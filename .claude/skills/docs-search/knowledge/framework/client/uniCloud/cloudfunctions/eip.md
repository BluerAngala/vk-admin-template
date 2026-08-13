---
sidebarDepth: 0
---

# 固定出口 IP

### 支付宝云空间

直接把下面的 ip 都加进去即可。

**固定出口 IP 列表**

```js
47.97.38.108
112.124.10.115
```

注意：上面的 IP 是云端运行时的 IP，若是本地运行云函数，则需要把自己电脑的外网 IP 加进去

### 腾讯云空间

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/0c2634e7-b26a-4e6f-ae8b-ecdeed0772d2.png)

### 阿里云空间

**阿里云必须使用 uniCloud.httpProxyForEip 发送请求才会固定出口 ip**，其原理是通过代理请求获得固定出口 IP 的能力。IP 为轮转不固定，因此三方服务要求使用白名单时开发者需要将代理服务器可能的 IP 均加入到白名单中，见下方代理服务器列表。此外对于代理的域名有限制，当前仅持`weixin.qq.com`泛域名。若开发者有其他域名代理需求，发送邮件到service@dcloud.io申请，邮件模板参考：[申请解除限制邮件模板](https://doc.dcloud.net.cn/uniCloud/price.html#apply-email-template)。

**代理服务器 IP 列表**

```js
47.92.132.2
47.92.152.34
47.92.87.58
47.92.207.183
8.142.185.204
```

如需在获取微信公众号 access_token 场景使用，请将上述 ip 配置到`微信公众平台 -> 基本配置 -> IP白名单`内，相关链接：[微信公众平台](https://mp.weixin.qq.com/)

#### 阿里云发送 Get 请求

**用法**

```js
uniCloud.httpProxyForEip.get(url: String, params?: Object)
```

**示例**

```js
await uniCloud.httpProxyForEip.get('https://api.weixin.qq.com/cgi-bin/token', {
  grant_type: 'client_credential',
  appid: 'xxxx',
  secret: 'xxxx',
});
```

#### 阿里云发送 POST 请求携带表单数据

注意，此接口以`application/x-www-form-urlencoded`格式发送数据而不是`multipart/form-data`

**用法**

```js
uniCloud.httpProxyForEip.postForm(url: String, data?: Object, headers?: Object)
```

**示例**

```js
uniCloud.httpProxyForEip.postForm('https://www.example.com/search', {
  q: 'nodejs',
  cat: '1001',
});
```

#### 阿里云发送 POST 请求携带 JSON 数据

以`application/json`格式 post 数据

**用法**

```js
uniCloud.httpProxyForEip.postJson(url: String, json?: Object, headers?: Object)
```

**示例**

```js
uniCloud.httpProxyForEip.postJson('https://www.example.com/search', {
  q: 'nodejs',
  cat: '1001',
});
```

#### 阿里云 POST 通用数据

**用法**

```js
uniCloud.httpProxyForEip.post(url: String, text?: String, headers?: Object)
```

**示例**

```js
uniCloud.httpProxyForEip.post('https://www.example.com/search', 'abcdefg', {
  'Content-Type': 'text/plain',
});
```

**注意**

- 不支持发送 multipart 格式的内容
- 代理请求超时时间为 5 秒
- 上述接口支持本地运行
