# 22、editor 富文本编辑器

### 万能表单使用方式@form

```js
{ key: "editor", title: "富文本类型", type: "editor", width: 750 },
```

### API

### 公共属性@public

[点击查看『公共属性』](https://vkdoc.fsq.pub/admin/components/0%E3%80%81public.html)

### 万能表格使用方式@table

show:["detail"] 是为了控制只在点击详情时显示

```js
{ key: "editor", title: "富文本", type: "html", show:["detail"] },
```

### template 使用方式@template

```vue
<vk-data-input-editor v-model="value1" width="750px"></vk-data-input-editor>
```
