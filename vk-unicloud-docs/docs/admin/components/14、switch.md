# 14、switch 开关

### 万能表单使用方式@form

#### 常规模式@demo1

```js
{ key: "switch", title: "switch类型", type: "switch", activeValue: true, inactiveValue: false },
```

#### 显示文字（左右两侧）@demo2

```js
{ key: "switch", title: "switch类型", type: "switch", activeValue: true, inactiveValue: false, activeText: "开启", inactiveText: "关闭" },
```

#### 显示文字（在开关内）@demo3

```js
{ key: "switch", title: "switch类型", type: "switch", activeValue: true, inactiveValue: false, activeText: "开启", inactiveText: "关闭", inlinePrompt: true },
```

#### 多选框形式@demo4

注意：多选框形式下，`activeValue` 和 `inactiveValue` 只能是 `number` 或 `string`，不可以是 `boolean`

```js
{ key: "switch", title: "switch类型", type: "switch", activeValue: 1, inactiveValue: 0, switchType: "checkbox", label: "允许为空" },
```

### API

### 公共属性@public

[点击查看『公共属性』](https://vkdoc.fsq.pub/admin/components/0%E3%80%81public.html)

### 组件属性@props

| 参数                   | 说明                                                   | 类型                  | 默认值 | 可选值            |
| ---------------------- | ------------------------------------------------------ | --------------------- | ------ | ----------------- |
| activeText             | switch - 打开时的文字描述                              | String                | -      | -                 |
| inactiveText           | switch - 关闭时的文字描述                              | String                | -      | -                 |
| activeValue            | switch 打开时或 checkbox 选中时的值                    | Boolean/Number/String | true   | -                 |
| inactiveValue          | switch 关闭时或 checkbox 未选中时的值                  | Boolean/Number/String | false  | -                 |
| activeColor            | switch - 打开时的背景色                                | String                | -      | -                 |
| inactiveColor          | switch - 关闭时的背景色                                | String                | -      | -                 |
| validateEvent          | switch - 状态改变时是否触发表单的校验                  | Boolean               | true   | false             |
| switchType             | 开关的类型，设置成 checkbox 可以将开关显示成多选框形式 | String                | -      | switch 、checkbox |
| label                  | checkbox - 多选框的 label                              | String                | -      | -                 |
| inlinePrompt（1.21.7） | 文字是否显示在按钮内部（仅限 1-2 个字）                | Boolean               | false  | true              |

### 万能表格使用方式@table

```js
{ key: "switch", title: "switch类型", type: "switch", activeValue: true, inactiveValue: false, width: 100 },
```

### 表格行内动态编辑模式

```js
{
  key: "is_on_sale", title: "是否上架", type: "switch",
  activeValue: true,
  inactiveValue: false,
  width: 80,
  watch: (res) => {
    let { value, row, change } = res;
    vk.callFunction({
      url: "上架的云函数地址",
      title: value ? "上架中..." : "下架中...",
      data: {
        _id: row._id,
        is_on_sale: value
      },
      success: data => {
        change(value); // 这一步是让表格行内的开关改变显示状态
      }
    });
  }
},
```

### template 使用方式@template

#### 开关形式

```vue
<vk-data-input-switch v-model="switch" :active-value="1" :inactive-value="0"></vk-data-input-switch>
```

#### 多选框形式

注意：多选框形式下，`activeValue` 和 `inactiveValue` 只能是 `number` 或 `string`，不可以是 `boolean`

```vue
<vk-data-input-switch v-model="switch" switch-type="checkbox" :true-label="1" :false-label="0">允许为空</vk-data-input-switch>
```
