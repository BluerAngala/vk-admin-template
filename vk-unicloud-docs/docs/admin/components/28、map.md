# 28、map 地图选址选择

### 万能表单使用方式@form

```js
{ key: "position", title: "地图位置", type: "map", width: 600, height: 300, defaultLocation: { latitude: 30.224781, longitude: 120.12438 } },
```

**启用手动输入经纬度功能**

```js
{ key: "position", title: "地图位置", type: "map", width: 600, height: 300, defaultLocation: { latitude: 30.224781, longitude: 120.12438 }, manualInput: true },
```

**启用手动输入经纬度功能 + 要求必须配置地图 Key**

```js
{ key: "position", title: "地图位置", type: "map", width: 600, height: 300, defaultLocation: { latitude: 30.224781, longitude: 120.12438 }, manualInput: true, requireMapKey: true },
```

**注意**

H5 需要设置 `manifest.json` - `H5配置` - `腾讯地图和高德地图二选一` - 填写 key

key 的申请地址：[腾讯地图](https://lbs.qq.com) [高德](https://lbs.amap.com)

### API

### 公共属性@public

[点击查看『公共属性』](https://vkdoc.fsq.pub/admin/components/0%E3%80%81public.html)

### 组件属性@props

| 参数            | 说明                                        | 类型    | 默认值 | 可选值 |
| --------------- | ------------------------------------------- | ------- | ------ | ------ |
| width           | 当有值时，地图显示的宽度，单位 px           | Number  | 600    | -      |
| height          | 当有值时，地图显示的高度，单位 px           | Number  | 300    | -      |
| defaultLocation | 当无值的情况下，打开地图时默认显示的位置    | Object  | -      | -      |
| mode            | 模式 edit 编辑模式 preview 预览模式         | String  | -      | -      |
| manualInput     | 是否启用手动输入经纬度功能                  | Boolean | false  | -      |
| requireMapKey   | 是否要求必须配置地图 Key 才显示地图选择按钮 | Boolean | false  | -      |

#### requireMapKey 功能说明

当设置 `requireMapKey: true` 时，组件会检查是否配置了地图 Key（`qqMapKey` 或 `aMapKey`）。只有在配置了地图 Key 的情况下，才会显示以下内容：

- 地图选择按钮（点击打开地图选择器）
- 地图显示区域（展示已选位置的地图）

**使用场景：**

- 应用未配置地图 Key，但需要使用地图选址功能
- 希望在未配置地图 Key 时隐藏地图相关 UI，避免用户看到无法使用的功能
- 配合 `manualInput: true` 使用，允许用户在没有地图 Key 的情况下通过手动输入经纬度和地址

**行为说明：**

| requireMapKey | 是否配置地图 Key | 地图选择按钮 | 地图显示区域 | 手动输入（如开启） |
| ------------- | ---------------- | ------------ | ------------ | ------------------ |
| false         | 是               | 显示         | 显示         | 显示               |
| false         | 否               | 显示         | 显示         | 显示               |
| true          | 是               | 显示         | 显示         | 显示               |
| true          | 否               | 隐藏         | 隐藏         | 显示               |

#### 手动输入功能说明

当设置 `manualInput: true` 时，组件会在地图下方显示一个手动输入表单，允许用户不通过地图选择器直接输入经纬度和地址信息。

**功能特性：**

- 支持手动输入经度和纬度（带格式验证）
- 支持选择省市区（使用 address 地址选择组件）
- 支持输入详细地址和地点名称
- 输入完成后点击「应用手动输入」按钮即可生效
- 仅在编辑模式（`mode: 'edit'`）下显示

**验证规则：**

| 字段     | 验证规则                         |
| -------- | -------------------------------- |
| 经度     | 必填，数字格式，范围 -180 到 180 |
| 纬度     | 必填，数字格式，范围 -90 到 90   |
| 省市区   | 必填                             |
| 详细地址 | 必填                             |
| 地点名称 | 选填                             |

#### defaultLocation

| 参数      | 说明 | 类型   | 默认值 | 可选值 |
| --------- | ---- | ------ | ------ | ------ |
| latitude  | 纬度 | Number | -      | -      |
| longitude | 经度 | Number | -      | -      |

#### onChange 使用示例

```js
{
  key: "position", title: "地图位置", type: "map",
  width: 600,
  height: 300,
  onChange: (val, formData, column, index) => {
    /**
     * val 双向绑定的表单值
     * formData 双向绑定的整个表单数据源
     */
    console.log(1, val, formData, column, index);
  }
},
```

**推荐使用 `watch` 代替 `onChange`** [传送门 - watch](https://vkdoc.fsq.pub/admin/components/0%E3%80%81public.html#watch-%E7%9B%91%E5%90%AC)

### 万能表格使用方式@table

```js
{ key: "position", title: "地图位置", type: "map", width: 400 },
```

### template 使用方式@template

```vue
<vk-data-input-map v-model="value" placeholder="请选择地图" :width="600" :height="300"></vk-data-input-map>
```

**启用手动输入功能**

```vue
<vk-data-input-map v-model="value" placeholder="请选择地图" :width="600" :height="300" :manual-input="true"></vk-data-input-map>
```

**启用手动输入功能 + 要求必须配置地图 Key**

```vue
<vk-data-input-map v-model="value" placeholder="请选择地图" :width="600" :height="300" :manual-input="true" :require-map-key="true"></vk-data-input-map>
```

### 组件双向绑定的值格式

建议直接将整个数据存数据库，方便组件的编辑和显示。

**示例**

```json
{
  "name": "西湖风景名胜区",
  "address": "龙井路1号",
  "latitude": 30.224781,
  "longitude": 120.12438,
  "formatted_address": "浙江省杭州市西湖区龙井路1号",
  "province": {
    "code": "330000",
    "name": "浙江省"
  },
  "city": {
    "code": "330100",
    "name": "杭州市"
  },
  "area": {
    "code": "330106",
    "name": "西湖区"
  }
}
```

| 参数              | 说明                                        | 类型                                       |
| ----------------- | ------------------------------------------- | ------------------------------------------ |
| name              | 地图上的名称，如：西湖风景名胜区            | String                                     |
| address           | 街道地址，如：龙井路 1 号                   | String                                     |
| latitude          | 纬度，如：30.224781                         | Number                                     |
| longitude         | 经度，如：120.12438                         | Number                                     |
| formatted_address | 完整地址，如：浙江省杭州市西湖区龙井路 1 号 | String                                     |
| province          | 省份                                        | Object {"code": "330000","name": "浙江省"} |
| city              | 地级市                                      | Object {"code": "330100","name": "杭州市"} |
| area              | 县级市                                      | Object {"code": "330106","name": "西湖区"} |
