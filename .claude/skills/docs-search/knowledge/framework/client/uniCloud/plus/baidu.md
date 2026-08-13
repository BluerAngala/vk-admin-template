---
sidebarDepth: 0
---

# 百度开放平台 API

## 配置文件@config

打开 `uniCloud/cloudfunctions/common/uni-config-center/vk-unicloud/index.js` 文件，配置里面的

"openapi.baidu" 百度开放平台

```js
// 开放平台api
"openapi": {
  // 百度开放平台 (主要用于身份证识别,营业执照识别等API)
  "baidu": {
    "appid": "", // 对应的API Key
    "appsecret": "" // 对应的Secret Key
  }
}
```

配置完需要上传 `uni-config-center` 这个公共模块才会生效

**API Key 申请地址：**[传送门](https://cloud.baidu.com/doc/OCR/s/rk3h7xzck)

目前百度云是有免费版本的，基本也够用了。

## 【云函数】调用百度开放平台 API

### 百度 API 通用接口（简易版）

优势：代码极简

缺点：部分接口不支持

```js
/**
 * 百度开放平台API通用接口
 * 身份证识别为例 https://aip.baidubce.com/rest/2.0/ocr/v1/idcard
 * @param {String} action 接口名 如: ocr/v1/idcard的部分
 * @param {String} actionVersion 接口版本 默认2.0
 * @param {object} header 请求头 默认 { "content-type": "application/x-www-form-urlencoded" }
 * @param {object} data 请求数据
 * 示例
 */
let requestRes = await vk.openapi.baidu.open.request({
  action: 'ocr/v1/idcard',
  actionVersion: '2.0',
  data: {
    image: base64,
  },
});
```

### 百度 API 通用接口（通用版）

优势：支持所有接口

#### 文本合成语音示例代码

```js
// 获取token
let access_token = await vk.openapi.baidu.open.auth.getAccessToken();
// 发起请求
let buffer = await vk.request({
  method: 'POST',
  url: 'https://tsn.baidu.com/text2audio', // 请求地址
  // 请求头
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
  },
  dataType: 'default', // 如果对方返回的是二进制数据，则需要传设置为default
  // 请求参数
  data: {
    tok: access_token,
    tex: '你好,我是AI小助手',
    cuid: '1',
    ctp: 1,
    lan: 'zh',
    spd: 5,
    pit: 5,
    vol: 5,
    per: 0,
    aue: 3,
  },
});
try {
  // 如果buffer的长度小于500，基本上就是报错了，转json看下错误信息
  if (buffer.length < 500) {
    let err = JSON.parse(buffer.toString('utf-8'));
    return {
      code: err.err_no,
      msg: err.err_msg,
      err: err,
    };
  }
} catch (err) {}

// 上传到云存储
let uploadFileRes = await uniCloud.uploadFile({
  cloudPath: `${Date.now()}.mp3`,
  fileContent: buffer,
});
// 获得url地址
let url = uploadFileRes.fileID;
console.log('url: ', url);
return {
  code: 0,
  url,
};
```

#### 语音解析文本示例代码

格式支持：pcm（不压缩）、wav（不压缩，pcm 编码）、amr（压缩格式）、m4a（压缩格式，仅支持极速版模型，m4a 格式输入适用于微信小程序的录音文件，详见格式说明）。推荐 pcm 采样率 ：16000 固定值。 编码：16bit 位深的单声道。

百度服务端会将非 pcm 格式，转为 pcm 格式，因此使用 wav、amr、m4a 会有额外的转换耗时。

[16k 采样率 pcm 文件样例下载](https://platform.bj.bcebos.com/sdk/asr/asr_doc/doc_download_files/16k.pcm)
[16k 采样率 wav 文件样例下载](https://platform.bj.bcebos.com/sdk/asr/asr_doc/doc_download_files/16k.wav)
[16k 采样率 amr 文件样例下载](https://platform.bj.bcebos.com/sdk/asr/asr_doc/doc_download_files/16k-23850.amr)
[16k 采样率 m4a 文件样例下载](https://platform.bj.bcebos.com/sdk/asr/asr_doc/doc_download_files/16k-48000.m4a)

注意：微信小程序的录音文件格式是 `m4a`

```js
// 解析语音
let mediaUrl = 'https://mp-70255e58-5282-4b64-941f-006c17c560c8.cdn.bspapp.com/cloudstorage/95ee5952-7aef-4bf9-8b2c-15bd43eb5b7b.pcm';

// 获取文件的后缀名
let suffixName = mediaUrl.substring(mediaUrl.lastIndexOf('.') + 1);

// 文件转buffer
let buffer = await vk.request({
  url: mediaUrl,
  method: 'GET',
  dataType: 'default',
});

// buffer转base64
let base64 = buffer.toString('base64');

// 获取token
let access_token = await vk.openapi.baidu.open.auth.getAccessToken();

// 请求接口
let requestRes = await vk.request({
  method: 'POST',
  url: 'https://vop.baidu.com/pro_api',
  headers: {
    'content-type': 'application/json',
  },
  dataType: 'json',
  data: {
    token: access_token,
    format: suffixName,
    rate: 16000,
    channel: 1,
    cuid: '001',
    dev_pid: 80001,
    speech: base64,
    len: buffer.length,
  },
});
if (requestRes.err_no !== 0) {
  // 失败直接返回
  return {
    code: requestRes.err_no,
    msg: requestRes.err_msg,
    err: requestRes,
  };
}
// 得到文件内容，注意，这是一个数组
let result = requestRes.result;
console.log('result: ', result);

return {
  code: 0,
  msg: requestRes.err_msg,
  result: requestRes.result,
};
```

## 【前端】直接调用百度开放平台 API

前端直接调用只有小程序和 APP 可以调用，H5 有跨域限制

**API 通用接口**

```js
/**
 * 百度开放平台通用请求接口
 * @param {String} action        接口名称
 * @param {String} actionVersion 接口版本名称 默认2.0
 * @param {String} title         loading文字
 * @param {object} data          请求参数
 * @param {String} success       成功回调
 * @param {String} fail          失败回调
 * @param {String} complete      完成回调
 */
vk.openapi.baidu.request({
  action: 'ocr/v1/business_license',
  actionVersion: '2.0',
  title: '识别中...',
  data: {
    image: base64,
  },
  success: (data) => {
    this.data = data;
  },
});
```

**更多接口（action 名称）请查看: ** [点击前往百度开放平台 API](https://cloud.baidu.com/doc/OCR/s/rk3h7xzck)

**注意：前端直接调用的**

**优势**

- 1、请求速度更快
- 2、使用方便
- 3、无需再写云函数
- 4、省流量（省钱）云函数是按量扣费的

**劣势**

- 1、有 token 泄露风险，但此 token 并不会造成多大的危害。

**如果是小程序，需要将以下域名加入到小程序的 request 域名白名单（去小程序后台加）**

```
https://aip.baidubce.com
```

**以下是前端使用的更快捷的 API 形式**

```js
/**
 * 营业执照识别
 * 以下data参数三选一即可
 * @param {File} file     文件对象
 * @param {String} image  图像base64编码后进行urlencode
 * @param {String} url    图片完整URL
 *
 */
vk.openapi.baidu.open.ocr.business_license({
  title: '识别中...',
  data: {
    file: res.tempFiles[0],
  },
  success: (res) => {
    this.data = res.data;
  },
});

/**
 * 身份证识别
 * 以下data参数三选一即可
 * @param {File} file     文件对象
 * @param {String} image  图像base64编码后进行urlencode
 * @param {String} url    图片完整URL
 */
vk.openapi.baidu.open.ocr.idcard({
  title: '识别中...',
  data: {
    image: base64,
  },
  success: (res) => {
    this.data = res.data;
  },
});
```
