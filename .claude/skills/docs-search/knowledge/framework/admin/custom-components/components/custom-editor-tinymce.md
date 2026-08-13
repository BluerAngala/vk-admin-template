---
sidebarDepth: 0
---

# custom-editor-tinymce 多功能富文本编辑器

## 介绍

custom-editor-tinymce 是基于 tinymce 实现的多功能富文本编辑器组件，仅支持 PC 端

作者：VK

**特点**

1. 支持插入视频
2. 支持插入文件下载链接
3. 支持复制本地电脑的图片直接粘贴到编辑器，并自动上传到存储
4. 支持微信截图直接粘贴到编辑器，并自动上传到存储
5. 支持从素材库选择图片、视频、文件
6. 图片支持拖拽调整大小
7. 支持常用软件 word 的一些基础功能，如字体大小颜色等
8. 支持插入 Emojis 表情
9. 支持源码编辑
10. 支持插入代码块
11. 支持全屏
12. 支持国际化
13. 支持自定义拓展按钮

[源码仓库](https://gitee.com/vk-uni/vk-unicloud-admin/tree/master/components/custom-editor-tinymce)

## 使用示例

### 万能表单使用方式

```js
{ key:"editor", title:"多功能富文本组件", type:"custom", component:"custom-editor-tinymce", width: 750, height: 500, placeholder: "开始输入..." },
```

**特别注意**

`万能表单` 与 `弹窗组件` 搭配使用时，弹窗组件需要设置属性 `:destroy-on-close="true"` 才能正常使用此富文本编辑器

### template 使用方式

```vue
<custom-editor-tinymce ref="editorTinymce1" v-model="content" scene="form" placeholder="开始输入..." width="100%" :height="500"></custom-editor-tinymce>
```

### 万能表格使用方式@table

show:["detail"] 是为了控制只在点击详情时显示

方案一：使用 html 直接渲染

```js
{ key: "editor", title: "富文本", type: "html", show:["detail"] },
```

方案二：使用组件渲染

```js
{ key: "editor", title: "富文本", type:"custom", component:"custom-editor-tinymce", show:["detail"] },
```

## 公共属性

[点击查看『公共属性』](https://vkdoc.fsq.pub/admin/components/0%E3%80%81public.html)

## 组件属性

| 参数                   | 说明                                                                                         | 类型           | 默认值      | 可选值               |
| ---------------------- | -------------------------------------------------------------------------------------------- | -------------- | ----------- | -------------------- |
| id                     | 编辑器 id，默认自动生成                                                                      | String         | -           | -                    |
| placeholder            | 输入前的提示，默认为"开始输入..."                                                            | String         | 开始输入... | -                    |
| toolbar                | 工具栏 [详细配置](https://www.tiny.cloud/docs/tinymce/latest/toolbar-configuration-options/) | Array          | -           | -                    |
| menubar                | 菜单栏 [详细配置](https://www.tiny.cloud/docs/tinymce/latest/menus-configuration-options/)   | String         | -           | -                    |
| width                  | 宽度，值为数字时单位是 px                                                                    | Number、String | -           | -                    |
| height                 | 高度，值为数字时单位是 px                                                                    | Number、String | -           | -                    |
| editorConfig           | 编辑器其他透传配置 [详细配置](https://www.tiny.cloud/docs/tinymce/latest/basic-setup/)       | Object         | -           | -                    |
| language               | 国际化多语言 <br/>zh-Hans 中文简体 <br/>zh-Hant 中文繁体 <br/>en 英文                        | String         | zh-Hans     | zh-Hans、zh-Hant、en |
| disabled               | 是否禁止编辑，默认为 false                                                                   | Boolean        | false       | true、false          |
| needSave               | 上传的图片是否需要保存到素材库，默认为 false                                                 | Boolean        | false       | true、false          |
| category_id            | 当 needSave 为 true 时，上传的分类 id                                                        | String         | -           | -                    |
| cloudDirectory         | 上传的目录                                                                                   | String         | -           | -                    |
| env                    | 上传文件使用的 uniCloud 环境                                                                 | String         | -           | -                    |
| cloudPathRemoveChinese | 上传后的文件名是否需要删除中文                                                               | Boolean        | false       | true、false          |
| showLoading            | 初始化时是否显示 loading，默认为 true                                                        |

## 组件方法

组件方法只有 template 使用方式 才能调用

**通过 this.$refs.editorTinymce1.xxx(); 方式调用**

| 方法名       | 说明           |
| ------------ | -------------- |
| getEditor    | 获得编辑器实例 |
| getContent   | 获取编辑器内容 |
| setContent   | 设置编辑器内容 |
| save         | 保存草稿       |
| restore      | 从草稿恢复     |
| clean        | 清空内容       |
| insertImage  | 插入单张图片   |
| insertImages | 插入多张图片   |
| insertVideo  | 插入单个视频   |
| insertVideos | 插入多个视频   |

### getEditor 获得编辑器实例

```js
let editor = this.$refs.editorTinymce1.getEditor();
```

### getContent 获取编辑器内容

```js
let content = this.$refs.editorTinymce1.getContent();
```

### setContent 设置编辑器内容

```js
this.$refs.editorTinymce1.setContent('<p>123</p>');
```

### save 保存草稿

```js
this.$refs.editorTinymce1.save();
```

### restore 从草稿恢复

```js
this.$refs.editorTinymce1.restore();
```

### clean 清空内容

```js
this.$refs.editorTinymce1.clean();
```

### insertImage 插入单张图片

```js
this.$refs.editorTinymce1.insertImage({
  url: '图片地址.jpg',
});
```

### insertImages 插入多张图片

```js
this.$refs.editorTinymce1.insertImages([
  {
    url: '图片地址1.jpg',
  },
  {
    url: '图片地址2.jpg',
  },
]);
```

### insertVideo 插入单个视频

```js
this.$refs.editorTinymce1.insertVideo({
  width: 600,
  height: 300,
  url: '视频地址.mp4',
  type: 'video/mp4',
});
```

### insertVideos 插入多个视频

```js
this.$refs.editorTinymce1.insertVideos([
  {
    width: 600,
    height: 300,
    url: '视频地址1.mp4',
    type: 'video/mp4',
  },
  {
    width: 600,
    height: 300,
    url: '视频地址2.mp4',
    type: 'video/mp4',
  },
]);
```

## 常见问题

### 组件无法正常显示?

需要满足以下条件

1. vk-admin 框架版本 ≥ 1.19.0
2. vk-unicloud-admin-ui 的 npm 包 ≥ 1.19.0
3. PC 端打开，移动端部分浏览器不支持（已知手机微信、手机 QQ 不支持）

### 组件在弹窗时无法正常显示?

在 `vk-data-dialog` 组件上需要设置属性 `:destroy-on-close="true"` 才能正常使用此富文本编辑器

注意：该属性是加在 `vk-data-dialog` 组件上，而非 `vk-data-form` 组件上

```vue
<vk-data-dialog ...弹窗组件其他属性 :destroy-on-close="true">
  <vk-data-form
    ...表单组件其他属性
  ></vk-data-form>
</vk-data-dialog>
```
