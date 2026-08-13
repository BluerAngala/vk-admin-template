---
sidebarDepth: 0
---

# 前端选择文件并上传

## 接口名：vk.chooseAndUploadFile@chooseAndUploadFile

> vk-unicloud 核心库版本 ≥ 2.25.1

通过 UI 界面选择文件（图片/视频/任意文件）并直接上传到云存储。

同时提供了选择回调事件 `onChooseFile`，方便对选择后的文件进行压缩、裁剪等二次处理，然后再上传。

内部基于 [vk.uploadFile](https://vkdoc.fsq.pub/client/pages/uploadFile.html) 实现，因此支持 `vk.uploadFile` 的全部上传能力（云存储供应商、云端目录、素材库保存等）。

## 平台兼容性@platform

**选择图片，type:'image'** 与 **选择视频，type:'video'**：全平台支持（App、H5、各家小程序）

**选择任意文件，type:'all'**：仅 H5 和微信小程序支持（微信小程序仅支持选择聊天文件），其余平台会直接走 fail 回调

## 请求参数@parame

### 选择相关参数

| 参数        | 说明                                                                                 | 类型     | 默认值                    | 可选值           |
| ----------- | ------------------------------------------------------------------------------------ | -------- | ------------------------- | ---------------- |
| type        | 文件类型（必填）                                                                     | String   | -                         | image、video、all |
| count       | 最多可选择的文件数量（type 为 video 时无效，视频一次只能选 1 个）                    | Number   | image 时 9，all 时 100    | -                |
| extension   | 文件后缀过滤（部分平台支持）                                                         | Array    | -                         | -                |
| sizeType    | original 原图，compressed 压缩图，默认二者都有（仅 type 为 image 时生效）            | Array    | ['original','compressed'] | -                |
| sourceType  | album 从相册选图，camera 使用相机，默认二者都有（type 为 image、video 时生效）       | Array    | ['album','camera']        | -                |
| compressed  | 是否压缩所选的视频源文件（仅 type 为 video 时生效）                                  | Boolean  | true                      | false            |
| camera      | 摄像切换，front（前置摄像头）、back（后置摄像头）（仅 type 为 video 时生效）         | String   | back                      | front            |
| maxDuration | 拍摄视频最长拍摄时间，单位秒（仅 type 为 video 时生效）                              | Number   | 60                        | -                |

**说明**

- 选择视频时没有 count 参数，表现为一次仅能选择一个
- count 值在 H5 平台的表现基于浏览器本身的规范，只能限制单选/多选，并不能限制数量

### 上传相关参数（透传给 vk.uploadFile）

| 参数                   | 说明                                                                                                           | 类型    | 默认值 | 可选值 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | ------- | ------ | ------ |
| title                  | 上传时的 loading 提示语（多文件上传时全程只显示一次 loading）                                                  | String  | -      | -      |
| provider               | 云存储供应商，可选：<br/>unicloud 上传至空间内置存储<br/>extStorage 上传至扩展存储<br/>aliyun 上传至阿里云 oss | String  | -      | 见说明 |
| cloudDirectory         | 指定上传后的云端目录                                                                                           | String  | -      | -      |
| needSave               | 是否需要将文件信息保存到 admin 素材库                                                                          | Boolean | false  | true   |
| category_id            | 素材库分类 id，当 needSave 为 true 时生效                                                                      | String  | -      | -      |
| uniCloud               | 上传到其他空间时使用，uniCloud 和 env 二选一即可                                                               | cloud   | -      | -      |
| env                    | 上传到其他空间时使用，uniCloud 和 env 二选一即可                                                               | String  | -      | -      |
| cloudPathAsRealPath    | 阿里云目录支持，需 HBX3.8.5 以上版本才支持                                                                     | Boolean | true   | false  |
| cloudPathRemoveChinese | 删除文件名中的中文                                                                                             | Boolean | true   | false  |
| errorToast             | 异常时是否用 toast 代替 alert                                                                                  | Boolean | false  | true   |
| needAlert              | 异常时是否需要 alert                                                                                           | Boolean | false  | true   |

**注意：不支持顶层 cloudPath 参数**（多文件上传时同一个 cloudPath 会互相覆盖）。如需为文件指定云端路径，有两种方式：

1. 目录级：使用 `cloudDirectory` 参数（文件名自动生成）
2. 文件级：在 `onChooseFile` 回调中为每个 tempFile 单独设置 `cloudPath` 属性（见下方示例）

### 回调参数

| 参数             | 说明                                                     | 类型     | 默认值 | 可选值 |
| ---------------- | -------------------------------------------------------- | -------- | ------ | ------ |
| onChooseFile     | 选择文件后、上传前的回调，可对文件进行二次处理（见下方） | Function | -      | -      |
| onUploadProgress | 上传进度回调（见下方）                                   | Function | -      | -      |
| success          | 全部文件上传成功时，执行的回调函数                       | Function | -      | -      |
| fail             | 任一文件上传失败时，执行的回调函数                       | Function | -      | -      |
| complete         | 无论上传成功与否，都会执行的回调函数                     | Function | -      | -      |

## 回调方法@callback

### onChooseFile(res)

选择文件后的回调事件，方便对选择后的文件进行压缩、裁剪等二次处理，然后再上传。

res 结构如下

```js
{
  errMsg: 'chooseAndUploadFile:ok',
  tempFilePaths: [], // 临时文件路径数组
  tempFiles: [] // 临时文件组成的数组，每项含 path、name、size、fileType 等属性
}
```

如果 `onChooseFile` 回调有返回值（返回值不为 undefined），此返回值会用来替换实际选择的文件用以上传。可以在此回调内返回一个 Promise 来阻塞上传，在此期间对文件进行额外处理（如压缩、裁剪）。

替换后的 `tempFiles` 每项支持以下属性：

| 属性      | 说明                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| path      | 本地文件路径（必填）                                                                                             |
| cloudPath | 指定该文件上传后的云端路径（不指定会自动生成）                                                                   |
| fileType  | 文件类型 image/video/other。仅体现在返回结果的 tempFiles 项上，不影响上传行为（上传时框架始终按文件后缀自动推断） |
| name      | 文件名（用于生成云端文件名及素材库记录）                                                                         |

### onUploadProgress(res)

上传进度的回调，res 结构如下

```js
{
  index: 0, // 触发此回调的文件序号（从0开始）
  loaded: 256, // 已上传大小
  total: 1024, // 总大小
  progress: 25, // 上传进度百分比（0-100）
  tempFilePath: '', // 本地临时文件路径
  tempFile: {} // 本地文件对象
}
```

## 返回值@return

成功回调（success / then）内的响应参数形式如下

```js
{
  errMsg: 'chooseAndUploadFile:ok',
  tempFilePaths: [], // 本地临时文件路径组成的数组
  tempFiles: [] // 文件对象数组，每项上都被追加了上传结果字段
}
```

`tempFiles` 每项在原有属性（path、name、size、fileType 等）基础上追加以下上传结果字段：

|  参数名   |  类型  |             说明              |
| :-------: | :----: | :---------------------------: |
|    url    | string | 云端文件 URL，与 fileURL 一致 |
|  fileID   | string |          云端文件 ID          |
|  fileURL  | string |         云端文件 URL          |
| cloudPath | string |         云端文件路径          |
| provider  | string |     本次上传的存储供应商      |

## 上传行为说明@behavior

- **顺序上传**：多个文件按选择顺序逐个上传（与 `uniCloud.chooseAndUploadFile` 的并发上传不同），控制台日志按文件依次输出，进度回调按 index 递进
- **失败即中断**：任一文件上传失败时，中断后续文件的上传，整体走 fail 回调（reject）。err 对象上附加了以下字段，调用方可自行处理部分成功的文件：

```js
{
  // ...vk.uploadFile 的原始错误信息
  index: 1, // 失败文件的序号
  tempFilePath: '', // 失败文件的本地路径
  tempFile: {}, // 失败文件对象
  tempFiles: [] // 全部文件数组（序号小于 index 的文件已上传成功，其上有 url 等上传结果字段）
}
```

- **取消选择**：用户取消选择文件时，直接走 fail 回调（errMsg 中含 cancel），不会弹出任何提示

## 示例@demo

### 基础用法

```js
// promise方式
vk.chooseAndUploadFile({
  type: 'image',
  count: 3,
  title: '上传中...',
}).then((res) => {
  console.log(res);
  let urls = res.tempFiles.map((item) => item.url);
});

// callback方式，与promise方式二选一
vk.chooseAndUploadFile({
  type: 'image',
  count: 3,
  title: '上传中...',
  success: (res) => {
    let urls = res.tempFiles.map((item) => item.url);
  },
  fail: (err) => {},
  complete: () => {},
});
```

### 选择视频并上传

```js
vk.chooseAndUploadFile({
  type: 'video',
  title: '上传中...',
  success: (res) => {
    let url = res.tempFiles[0].url;
  },
});
```

### 选择任意文件并上传（仅 H5 和微信小程序）

```js
vk.chooseAndUploadFile({
  type: 'all',
  count: 2,
  title: '上传中...',
  success: (res) => {
    let urls = res.tempFiles.map((item) => item.url);
  },
});
```

### 上传至指定云端目录 + 保存到素材库

```js
vk.chooseAndUploadFile({
  type: 'image',
  count: 9,
  title: '上传中...',
  cloudDirectory: 'user-avatar', // 云端目录
  needSave: true, // 保存到admin素材库
  success: (res) => {},
});
```

### onChooseFile 二次处理（过滤文件 + 指定 cloudPath）

```js
vk.chooseAndUploadFile({
  type: 'image',
  count: 9,
  title: '上传中...',
  onChooseFile: (res) => {
    // 只保留第一个文件，并为其指定云端路径
    let tempFiles = res.tempFiles.slice(0, 1);
    tempFiles[0].cloudPath = `xx/test-${Date.now()}.png`;
    // 支持返回Promise以阻塞上传（可在Promise内对图片进行压缩、裁剪等处理）
    return {
      tempFilePaths: res.tempFilePaths.slice(0, 1),
      tempFiles,
    };
  },
  success: (res) => {},
});
```

### 监听上传进度

```js
vk.chooseAndUploadFile({
  type: 'image',
  count: 3,
  onUploadProgress: (res) => {
    let { index, progress } = res;
    console.log(`第${index + 1}个文件当前进度：${progress}%`);
  },
  success: (res) => {},
});
```

## 常见问题@q

### 如何配置默认云存储供应商？@q1

与 `vk.uploadFile` 一致，在 `app.config.js` 中配置 `service.cloudStorage.defaultProvider` [点击查看](https://vkdoc.fsq.pub/client/pages/uploadFile.html#default)

### 小程序上传提示域名不在白名单？@q2

小程序需要配置上传域名白名单 [点击查看](https://vkdoc.fsq.pub/client/pages/uploadFile.html#whitelist)
