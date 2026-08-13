# 3、money 金额输入

**存储行为**：数据库中以 **分** 为单位存储（显示 1 元 = 存储 100），在 js 中整数求和不会有误差，小数求和有误差。

> 如果需要大于 2 位数的小数点，建议用 `number` 类型，因为 `money` 组件以 100=1 元形式储存，小数点超过 2 位则 100=1 元无意义。

### 万能表单使用方式@form

#### 基础用法@base

```js
{ key: "price", title: "金额类型", type: "money" },
```

#### 范围输入（输入多个值）@range

> vk-unicloud-admin-ui 的 npm 依赖版本需 >= 1.24.1

```js
// 输入2个值
{ key: "price", title: "金额范围", type: "money", range: true, placeholder: ["最低金额", "最高金额"] },

// 输入3个值
{ key: "price", title: "金额范围", type: "money", range: 3, placeholder: ["最低金额", "最高金额"] },
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
| min            | 最小值（基于显示值）                       | Number          | -      | -                 |
| rightText      | 右侧文字后缀                               | String          | -      | -                 |
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
{ key: "balance", title: "金额类型", type: "money", width: 100 },
```

### template 使用方式@template

#### 基础用法@template-base

> vk-unicloud-admin-ui 的 npm 依赖版本需 >= 1.24.1

```vue
<vk-data-input-numeric mode="money" v-model="form1.balance" placeholder="请输入金额" width="300px"></vk-data-input-numeric>
```

#### 范围输入@template-range

> vk-unicloud-admin-ui 的 npm 依赖版本需 >= 1.24.1

```vue
<vk-data-input-numeric mode="money" v-model="form1.priceRange" :range="true" placeholder="['最低金额', '最高金额']" width="400px"></vk-data-input-numeric>
```

### 旧组件说明

旧组件 `vk-data-input-money` 仍然可用，但推荐使用统一组件 `vk-data-input-numeric`（mode="money"）替代。

```vue
<!-- 旧写法（仍可用） -->
<vk-data-input-money v-model="form1.balance" placeholder="请输入金额" width="300px"></vk-data-input-money>
```
