# 2、textarea 多行文本

### 万能表单使用方式@form

```js
{
  key: "textarea", title: "多行文本", type: "textarea",
  autosize: { minRows: 4, maxRows: 10 },
  maxlength: 200,
  showWordLimit: true,
},
```

### API

### 公共属性@public

[点击查看『公共属性』](https://vkdoc.fsq.pub/admin/components/0%E3%80%81public.html)

### 组件属性@props

| 参数               | 说明                              | 类型    | 默认值 | 可选值                |
| ------------------ | --------------------------------- | ------- | ------ | --------------------- |
| maxlength          | 最大输入长度                      | Number  | -      | -                     |
| showWordLimit      | 是否显示输入字数统计              | Boolean | false  | true                  |
| readonly           | 原生属性，是否只读                | boolean | false  | true                  |
| autosize           | 自适应内容高度                    | object  | -      | -                     |
| trimMode（1.21.0） | 空格过滤模式 [传送门](#trim-mode) | String  | trim   | trim、removeAll、none |

#### trimMode（空格过滤模式）@trim-mode

> vk-unicloud-admin-ui 的 npm 依赖版本需 >= 1.21.0

| 值        | 说明             |
| --------- | ---------------- |
| trim      | 过滤前后空格     |
| removeAll | 过滤所有空格     |
| none      | 不过滤，保持原值 |

### 万能表格使用方式@table

```js
{ key:"comment" , title:"备注" , type:"textarea" , width:200 },
```

### template 使用方式@template

**注意：此方式不支持属性 trimMode**

```vue
<el-input v-model="textarea" type="textarea" :rows="2" placeholder="请输入内容"></el-input>
```
