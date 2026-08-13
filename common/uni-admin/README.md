# common/uni-admin — uni-admin 官方样式

uni-admin 官方模板的公共样式文件。用于兼容 uni-admin 官方插件（如升级中心）的样式。

## 目录结构

```
uni-admin/
├── 说明.md          ← 原始说明文档（含插件集成指引）
├── css/
│   ├── uni.css      ← uni-admin 公共样式（布局、表单、列表等）
│   └── uni-icons.css ← uni-admin 图标字体
```

## 引入方式

在 `App.vue` 中引入：

```html
<style lang="scss">
  @import '@/common/uni-admin/css/uni.css';
  @import '@/common/uni-admin/css/uni-icons.css';
</style>
```

当前项目已在 `App.vue` 中引入。

## 适用场景

- 集成 uni-admin 官方插件（升级中心等）时，样式错乱需要补全公共样式
- 使用 clientDB 操作数据库的官方插件

## 注意事项

- 这些样式来自 uni-admin 官方模板，非本项目自定义
- 一般不需要修改，除非集成新插件时出现样式冲突
- 官方插件通常通过 clientDB 操作数据库，需要上传对应的 `schema.json` 到 `uniCloud/database/`
- 详细插件集成步骤见 `说明.md`
