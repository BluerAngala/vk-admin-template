# 1、icon 图标

### template 使用方式@template

```vue
<vk-data-icon name="vk-icon-full" size="16" color="rgba(0,0,0,.7)"></vk-data-icon>
```

### API

### 属性

| 参数    | 说明           | 类型    | 默认值 | 可选值 |
| ------- | -------------- | ------- | ------ | ------ | --- |
| name    | 图标名称       | String  | -      | -      |
| color   | 图标颜色       | String  | -      | -      |
| size    | 图标大小       | String  | Number | -      | -   |
| bold    | 是否加粗       | Boolean | false  | true   |
| pointer | 是否有鼠标手指 | Boolean | false  | true   |

### 快捷使用

直接访问示例项目的链接`/pages_template/components/icons/vk-icons`，点击图标即可复制代码。

### 如何扩展图标库？

- 1、从 [https://www.iconfont.cn](https://www.iconfont.cn) 网站上生成图标库 css 文件

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/0a5b6fdc-aeb3-44e8-ab82-95bfdf052457.png)

注意看上图的命名格式

FontClass 前缀：vk-xxx-icon-

Font Family：vk-xxx-icon

你只改动 xxx，如

FontClass 前缀：vk-aaa-icon-

Font Family：vk-aaa-icon

- 2、下载至本地

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/82b89772-7a86-445a-be0f-c22af9127bdb.png)

- 3、解压下载的文件，并复制 `iconfont.css` 文件到 你项目根目录的 `static` 目录，并将 `iconfont.css` 改名为 `vk-custom-icon.css`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/682c34a8-2bc5-4a91-a17d-26247eeb9eb4.png)

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/24ee623d-fb3f-4149-9d19-7e9629c0b9a6.png)

- 4、在 `App.vue` 内引入图标

```scss
<style lang="scss">@import "@/static/vk-custom-icon.css";
</style>
```

- 5、假设你的某个图标是 `vk-custom-icon-update`

则 `vk-custom-icon-update` 就是图标的 `name`，也是图标的值

```vue
<vk-data-icon name="vk-custom-icon-update" size="16" color="#000000"></vk-data-icon>
```

#### 额外拓展 client 端

**如果你 `client端` 也需要自定义图标，也是按上面方式操作即可。操作完后，如下代码即可显示自定义图标**

```vue
<text class="vk-custom-icon vk-custom-icon-update" style=" font-size: 16px;color: #000000;"></text>
```

**如果你 `client端` 使用了 `vk-uview-ui` 组件库，则可以这样显示图标**

```vue
<u-icon name="vk-custom-icon-update" size="16" color="#000000"></u-icon>
```

### 如何在万能表单的图标选择组件中拓展图标库?

在上面的操作基础上，再进行如下操作即可。

- 1、并复制 `iconfont.json` 文件到 你项目根目录的 `static` 目录，并将 `iconfont.json` 改名为 `vk-custom-icon.json`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/28d57fe9-9552-44ac-9864-9761bfe2b12f.png)

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/85716420-a73b-431a-84e8-96eb4b035bb5.png)

- 2、在 `app.config.js` 内新增如下代码

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/09dfc10a-830a-4a34-a91d-5e4c181dae41.png)

便于复制，代码如下

```js
// 引入图标数据，主要用于图标选择组件的数据源
import myIcon from '@/static/vk-custom-icon.json';
export default {
  customIcon: myIcon,
};
```

- 3、完成
