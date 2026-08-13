# 17、color 颜色选择

### 万能表单使用方式@form

```js
{ key: "color", title: "颜色", type: "color" },
```

### API

### 公共属性@public

[点击查看『公共属性』](https://vkdoc.fsq.pub/admin/components/0%E3%80%81public.html)

### 组件属性@props

| 参数         | 说明                               | 类型            | 默认值                                                | 可选值          |
| ------------ | ---------------------------------- | --------------- | ----------------------------------------------------- | --------------- |
| showAlpha    | 是否支持透明度选择                 | Boolean         | false                                                 | true            |
| colorFormat  | 写入 v-model 的颜色的格式          | String          | hex（show-alpha 为 false）/ rgb（show-alpha 为 true） | hsl / hex / rgb |
| predefine    | 预定义颜色                         | Array           | -                                                     | -               |
| activeChange | 面板中当前显示的颜色发生改变时触发 | function(value) | -                                                     | -               |

**colorFormat 介绍**

colorFormat 的作用是将你选择的颜色以什么样的字符串存到 v-model 绑定的变量中。

如你选的是白色，则

hsl：hsl(0, 0%, 100%) [关于 hsl 的介绍](https://www.w3school.com.cn/css/css_colors_hsl.asp)

hex：#FFFFFF [关于 hex 的介绍](https://www.w3school.com.cn/css/css_colors_hex.asp)

rgb：不带透明度 rgb(255,255,255) 带透明度 rgba(255,255,255,0.8) [关于 rgb 的介绍](https://www.w3school.com.cn/css/css_colors_rgb.asp)

**_通常我们常用的表示颜色的方式是 hex：#FFFFFF，如果带透明度，则用 rgb：rgba(255,255,255,0.8)_**

### 万能表格使用方式@table

```js
{ key: "color", title: "颜色", type: "color" },
```

### template 使用方式@template

```vue
<el-color-picker v-model="color"></el-color-picker>
```
