# 5、percentage 百分比输入

**存储行为**：数据库中以 **小数** 形式存储（显示 10% = 存储 0.1），存储时会额外保留 2 位精度以避免浮点误差。

**注意**：`min` 属性在此模式下不生效。

### 万能表单使用方式@form

#### 基础用法@base

```js
{ key: "percentage", title: "百分比类型", type: "percentage" },
```

#### 范围输入（输入多个值）@range

> vk-unicloud-admin-ui 的 npm 依赖版本需 >= 1.24.1

```js
// 输入2个值
{ key: "percentage", title: "百分比范围", type: "percentage", range: true, placeholder: ["最低百分比", "最高百分比"] },

// 输入3个值
{ key: "percentage", title: "百分比范围", type: "percentage", range: 3, placeholder: ["百分比1", "百分比2", "百分比3"] },
```

### API

### 公共属性@public

[点击查看『公共属性』](https://vkdoc.fsq.pub/admin/components/0%E3%80%81public.html)

### 组件属性@props

| 参数           | 说明                                       | 类型            | 默认值 | 可选值            |
| -------------- | ------------------------------------------ | --------------- | ------ | ----------------- |
| placeholder    | 占位符（字符串=所有格共用；数组=每格独立） | String、Array   | -      | -                 |
| precision      | 精度（显示值的小数位数）                   | Number          | 2      | -                 |
| max            | 最大值（基于显示值）                       | Number          | -      | -                 |
| rightText      | 右侧文字后缀                               | String          | %      | -                 |
| width          | 宽度                                       | String、Number  | -      | -                 |
| disabled       | 是否禁用                                   | Boolean         | false  | true              |
| clearable      | 是否可以清空                               | Boolean         | true   | false             |
| readonly       | 是否只读                                   | Boolean         | false  | true              |
| allowNegative  | [1.24.1 新增] 是否允许输入负数             | Boolean         | false  | true              |
| showRightText  | [1.24.1 新增] 是否显示右侧后缀             | Boolean         | true   | false             |
| emptyValue     | [1.24.1 新增] 空值时实际发出的值           | String、Number  | null   | -                 |
| range          | [1.24.1 新增] 范围输入模式                 | Boolean、Number | false  | true / 数字 N(≥2) |
| rangeSeparator | [1.24.1 新增] 范围输入的分隔符             | String          | -      | -                 |

### 万能表格使用方式@table

```js
{ key: "percentage", title: "百分比类型", type: "percentage", width: 100 },
```

### template 使用方式@template

#### 基础用法@template-base

> vk-unicloud-admin-ui 的 npm 依赖版本需 >= 1.24.1

```vue
<vk-data-input-numeric mode="percentage" v-model="form1.value1" placeholder="请输入百分比" :precision="2" :max="100" width="300px"></vk-data-input-numeric>
```

#### 范围输入@template-range

> vk-unicloud-admin-ui 的 npm 依赖版本需 >= 1.24.1

```vue
<vk-data-input-numeric mode="percentage" v-model="form1.rateRange" :range="true" :max="100" placeholder="['最低百分比', '最高百分比']" width="400px"></vk-data-input-numeric>
```

### 旧组件说明

旧组件 `vk-data-input-percentage` 仍然可用，但推荐使用统一组件 `vk-data-input-numeric`（mode="percentage"）替代。

```vue
<!-- 旧写法（仍可用） -->
<vk-data-input-percentage v-model="form1.value1" placeholder="请输入百分比" :precision="2" :max="100" width="300px"></vk-data-input-percentage>
```
