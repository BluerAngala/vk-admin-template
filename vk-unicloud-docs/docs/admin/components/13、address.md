# 13、address 地址选择（省市区选择）

### 万能表单使用方式@form

```js
{ key: "address", title: "address类型", type: "address" },
```

### API

### 公共属性@public

[点击查看『公共属性』](https://vkdoc.fsq.pub/admin/components/0%E3%80%81public.html)

### 组件属性@props

| 参数      | 说明                      | 类型    | 默认值 | 可选值 |
| --------- | ------------------------- | ------- | ------ | ------ |
| level     | 层级（最大 3 级，省市区） | Number  | 3      | 1 、 2 |
| clearable | 是否可以清空选项          | Boolean | true   | false  |

### 万能表格使用方式@table

```js
{ key: "address", title: "地址", type: "address", width: 120 },
```

### template 使用方式@template

```vue
<vk-data-input-address v-model="address" placeholder="请选择省市区" :level="3"></vk-data-input-address>
```

### 常见问题@q

#### 如何获取省市区的数据?@q1

**获取省数据**

```js
vk.addressUtil.getProvinces();
```

**获取市数据**

```js
vk.addressUtil.getCitys();
```

**获取区数据**

```js
vk.addressUtil.getAreas();
```

**获取省市区三级联动数据**

```js
vk.addressUtil.getPcaCode();
```

**获取省市二级联动数据**

```js
vk.addressUtil.getPcCode();
```

#### 省市区如何多选?

内置 address 组件不支持多选，如果你需要多选，可以通过[级联组件](./11、cascader.md)，并结合上面提供的[省市区数据源](#q1)自己实现。
