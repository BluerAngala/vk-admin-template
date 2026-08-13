# 扩展教程

## 介绍

此功能可以让你开发自定义的 `万能表格` 或 `万能表单` 组件，给你最高的自由度，发挥你的能量，创造无限可能。

如果你愿意分享你的组件，你可以将你认为比较好的组件上传到你的 `Gitee` 或 `GitHub`，同时在这里添加一段你的组件的仓库链接和描述，方便大家使用你的组件，你的头像会显示在文档仓库中，成为 `vk-admin` 框架贡献者之一。

[组件提交地址](https://gitee.com/vk-uni/vk-unicloud-docs/edit/master/docs/admin/custom-components/custom-components-list.md)

## 步骤

假设我们需要创建的组件名为 `aaa`，则只需要在项目根目录的的 `components` 目录下创建 `custom-aaa/custom-aaa.vue` 文件即可

## 组件模板示例

```vue
<template>
  <!-- 万能表单 -->
  <view v-if="scene === 'form'">
    <el-input :value="value" @input="_input"></el-input>
  </view>
  <!-- 万能表格 -->
  <view v-else-if="scene === 'table'">
    <text>{{ value }}</text>
  </view>
  <!-- 万能表格详情 -->
  <view v-else-if="scene === 'detail'">
    <text>{{ value }}</text>
  </view>
</template>

<script>
  export default {
    props: {
      // 双向绑定的值
      value: {
        type: String,
        default: '',
      },
      // 字段规则
      column: {
        type: Object,
        default: function () {
          return {};
        },
      },
      // 当前场景 form 万能表单 table 万能表格 detail 表格详情页
      scene: {
        type: String,
        default: 'form',
      },
    },
    data() {
      return {};
    },
    // 组件加载完成时触发
    mounted() {},
    // 组件函数
    methods: {
      _input(value) {
        // 固定顺序，先input，再change
        this.$emit('input', value);
        this.$emit('change', value);
      },
    },
    // 监听器
    watch: {},
    // 计算属性
    computed: {},
  };
</script>

<style lang="scss" scoped></style>
```

## 使用方式

在万能表格或万能表单中，按如下规则使用

`{ key:"key1", title:"我是自定义组件", type:"custom", component:"custom-组件名" }`

如

```js
{ key:"key1", title:"我是自定义aaa组件", type:"custom", component:"custom-aaa" },
```

## 开发

### 开发万能表单

在万能表单场景下，组件需要提供 2 个事件，分别为

1. input（表单双向绑定需要）
2. change（watch 需要）

注意：事件触发顺序必须是先 `input` 再 `change`

### 开发万能表格和详情

正常组件开发即可，即只需要开发此组件在万能表格中是如何展示的，一般情况下，直接根据组件属性 `value` 的值进行渲染即可。
