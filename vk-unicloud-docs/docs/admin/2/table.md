---
sidebarDepth: 1
---

# 万能表格

## 组件名：vk-data-table@vk-data-table

**核心思想：通过 JSON 配置渲染规则**

## 基础用法@base

```vue
<vk-data-table :data="table1.data" :columns="table1.columns"></vk-data-table>
```

```js
export default {
  data() {
    // 页面数据变量
    return {
      table1: {
        // 表格数据
        data: [],
        // 表格字段显示规则
        columns: [
          { key: '_id', title: '用户ID', type: 'text', width: 200 },
          { key: 'username', title: '用户名', type: 'text', width: 200 },
          { key: 'nickname', title: '用户昵称', type: 'text', width: 200 },
          { key: 'mobile', title: '手机号', type: 'text', width: 200 },
          { key: 'comment', title: '备注', type: 'text', minWidth: 200 },
        ],
      },
    };
  },
};
```

## 进阶用法@pro

请直接看示例文件 `/pages_template/components/table/table-easy`

## 属性@props

| 参数                     | 说明                                                                                                                                                                | 类型                | 默认值                                             | 可选值                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------- | --------------------- |
| action                   | 动态模式 - 支持：<br/>1、vk 框架下的云函数地址 <br/>2、http 请求地址<br/>3、[自定义 function 请求模式](#function)                                                   | String、Function    | 无                                                 | -                     |
| auto-action              | 动态模式 - 是否组件加载完毕后自动运行 action                                                                                                                        | Boolean             | 无                                                 | -                     |
| query-form-param         | 动态模式 - 请求参数（表格查询参数）                                                                                                                                 | Object              | {}                                                 | -                     |
| data-preprocess          | 动态模式 - 云函数返回的数据进行预处理 [查看数据预处理](#data-preprocess)                                                                                            | function(list)      | -                                                  | -                     |
| is-request               | 动态模式 - 是否是 http 请求模式 [查看 http 请求模式](#http)                                                                                                         | Boolean             | false                                              | true                  |
| request-header           | 动态模式 - http 请求头                                                                                                                                              | Object              | -                                                  | -                     |
| props                    | 动态模式 - 渲染数据的配置选项 [查看 http 请求模式](#http)                                                                                                           | Object              | -                                                  | -                     |
| retry-count              | 动态模式 - 请求最大重试次数 [查看异常重试机制](#retry-count)                                                                                                        | Number              | 0                                                  | -                     |
| retry-interval           | 动态模式 - 每次重试间隔，单位毫秒                                                                                                                                   | Number              | 0                                                  | -                     |
| data                     | 静态模式 - 列表数据                                                                                                                                                 | Array               | 无                                                 | -                     |
| total                    | 静态模式 - 总记录数                                                                                                                                                 | Number              | 无                                                 | -                     |
| columns                  | 通用 - 字段显示规则 [查看 columns](#columns)                                                                                                                        | Array               | []                                                 | -                     |
| height                   | 通用 - table 的高度                                                                                                                                                 | Number              | 无                                                 | -                     |
| max-height               | 通用 - table 的最大高度                                                                                                                                             | Number              | 无                                                 | -                     |
| row-height               | 通用 - 行高                                                                                                                                                         | Number              | 无                                                 | -                     |
| row-key                  | 通用 - 行数据的 Key （重要：值必须唯一，默认是\_id）                                                                                                                | String              | "\_id"                                             | -                     |
| top                      | 通用 - margin-top 的高度                                                                                                                                            | Number              | 10                                                 | -                     |
| selection                | 通用 - 显示多选框                                                                                                                                                   | Boolean             | false                                              | true                  |
| selectable               | 通用 - 搭配 `:selection=true` 时使用，返回值用来决定这一行的 CheckBox 是否可以勾选 [查看用法](#selection)                                                           | Function(row,index) | -                                                  | -                     |
| rowNo                    | 通用 - 显示序号                                                                                                                                                     | Boolean             | false                                              | true                  |
| pagination               | 通用 - 显示分页器                                                                                                                                                   | Boolean             | false                                              | true                  |
| page-size                | 通用 - 每页显示数量                                                                                                                                                 | Number              | 10                                                 | -                     |
| page-sizes               | 通用 - 每页显示数量选择列表                                                                                                                                         | Array               | [1, 5, 10, 20, 50, 100, 1000]                      | -                     |
| get-count                | [1.18.0 新增] 通用 - 执行 count 请求的模式 <br/>与 vk.baseDao.getTableData 配合使用才有效果，可选<br/>auto：自动判断<br/>true：总是执行<br/>false：从不执行         | String、Boolean     | auto                                               | auto、true、false     |
| max-page-count           | [1.18.0 新增] 通用 - 最大可显示的页数                                                                                                                               | Number              | -                                                  | -                     |
| right-btns               | 通用 - 右侧显示的按钮列表 [查看 right-btns](#right-btns)                                                                                                            | Array               | []                                                 | -                     |
| right-btns-type          | 通用 - 右侧显示的按钮类型                                                                                                                                           | String              | button                                             | text                  |
| right-btns-align         | 通用 - 右侧显示的按钮对齐方式                                                                                                                                       | String              | center                                             | left right            |
| right-btns-more          | 通用 - 右侧更多按钮 [查看 right-btns-more](#right-btns-more)                                                                                                        | Array               | []                                                 | -                     |
| right-btns-width         | 通用 - 右侧按钮宽度，单位 px，通常不需要传，不传会根据按钮数量自动计算宽度                                                                                          | Number              | -                                                  | -                     |
| custom-right-btns        | 通用 - 自定义右侧按钮 [查看 custom-right-btns](#custom-right-btns)                                                                                                  | Array               | []                                                 | -                     |
| batch-btns               | [1.24.1 新增] 通用 - 底部批量操作按钮列表，需搭配 `:selection=true` 时使用 [查看 batch-btns](#batch-btns)                                                           | Array               | []                                                 | -                     |
| pagination-placement     | [1.24.1 新增] 通用 - 分页器位置（当 batchBtns 有值时固定为 right）自 1.24.1 起，分页器位置默认在右下角                                                              | String              | right                                              | left、center、right   |
| fullscreen               | [1.24.1 新增] 通用 - 为 true 时表格高度撑满到屏幕底部（全屏模式）自 1.24.1 起，表格不再默认全屏（高度撑满到屏幕底部），需要手动设置 `:fullscreen="true"` 才会全屏。 | Boolean             | false                                              | true                  |
| empty-text               | 通用 - 空数据时显示的文本内容                                                                                                                                       | String              | "暂无数据"                                         | -                     |
| default-expand-all       | 通用 - 是否默认展开所有行，当 Table 包含展开行存在或者为树形表格时有效                                                                                              | Boolean             | false                                              | true                  |
| tree-props               | 通用 - 渲染嵌套数据的配置选项                                                                                                                                       | Object              | {children: 'children', hasChildren: 'hasChildren'} | -                     |
| border                   | 通用 - 是否带有纵向边框，设置为 true 后列可以通过拖动改变宽度                                                                                                       | Boolean             | false                                              | true                  |
| stripe                   | 通用 - 是否为斑马纹                                                                                                                                                 | Boolean             | false                                              | true                  |
| size                     | 通用 - Table 的尺寸                                                                                                                                                 | String              | 无                                                 | medium / small / mini |
| show-header              | 通用 - 是否显示表头                                                                                                                                                 | Boolean             | true                                               | false                 |
| highlight-current-row    | 通用 - 是否要高亮当前行 [查看高亮行处理](#highlight-current-row)                                                                                                    | Boolean             | true                                               | false                 |
| detail-dialog-width      | 通用 - 详情弹窗的宽度                                                                                                                                               | Number,String       | "830px"                                            | -                     |
| multiple                 | 通用 - 可多选                                                                                                                                                       | Boolean             | true                                               | false                 |
| default-sort             | 默认排序规则 [查看 default-sort](#default-sort)                                                                                                                     | Object              | -                                                  | -                     |
| show-summary             | 通用 - 是否需要显示合计行                                                                                                                                           | Boolean             | false                                              | true                  |
| summary-method           | 通用 - 自定义合计的计算函数（详情见下方） [查看 summary-method](#summary-method)                                                                                    | Function            | -                                                  | -                     |
| total-option             | 通用 - 需要自动统计的行（详情见下方）                                                                                                                               | Array               | -                                                  | -                     |
| expand                   | 通用 - 是否开启点击可以展开行 [查看展开行](#expand)                                                                                                                 | Boolean             | false                                              | true                  |
| left-fixed               | 通用 - 序号、多选框是否固定在左侧                                                                                                                                   | Boolean             | true                                               | false                 |
| right-fixed              | 通用 - 操作按钮是否固定在右侧                                                                                                                                       | Boolean             | true                                               | false                 |
| searched-clean-selection | 通用 - 表格搜索后是否清空多选框选中的值                                                                                                                             | Boolean             | true                                               | false                 |
| need-alert               | 通用 - 表格请求失败后，是否自动 alert 弹窗（若设为 false，则可以通过监听 fail 事件自己处理错误）                                                                    | Boolean             | true                                               | false                 |
| encrypt-action           | 是否加密请求 [查看 encrypt](https://vkdoc.fsq.pub/client/pages/callFunction.html#encrypt)                                                                           | Boolean             | false                                              | true                  |
| show-export              | 通用 - 是否显示内置导出按钮（仅 PC 端生效）                                                                                                                         | Boolean             | false                                              | true                  |
| export-options           | 通用 - 导出弹窗配置项 [查看 export-options](#export-options)                                                                                                        | Object              | {}                                                 | -                     |

### columns（字段列表）@columns

columns 是一个数组，数组内每个元素有以下属性

| 参数         | 说明                                          | 类型                              | 默认值                    | 可选值                             |
| ------------ | --------------------------------------------- | --------------------------------- | ------------------------- | ---------------------------------- |
| key          | 键名                                          | String                            | 无                        | -                                  |
| title        | 标题                                          | String                            | 无                        | -                                  |
| type         | 类型                                          | String                            | 无                        | [查看 type](#columns-type)         |
| width        | 宽度                                          | Number                            | 无                        | -                                  |
| minWidth     | 最小宽度（设置此值会自动填充宽度）            | Number                            | 无                        | -                                  |
| align        | 对其方式                                      | String                            | center                    | left 、right                       |
| headerAlign  | 表头对其方式                                  | String                            | center                    | left 、right                       |
| sortable     | 是否是排序字段                                | String                            | custom                    | true 、false                       |
| fixed        | 列是否固定在左侧或者右侧，true 表示固定在左侧 | string, boolean                   | 无                        | true、left、right                  |
| show         | 显示规则，[查看 show](#columns-show)          | string 、 array                   | ["detail","row","expand"] | "detail"、"row"、"expand"、 "none" |
| defaultValue | 默认值                                        | String                            | 无                        | -                                  |
| formatter    | 自定义格式化函数                              | function(val, row, column, index) | -                         | -                                  |
| buttons      | 扩展按钮列表 [查看 buttons](#columns-buttons) | Array                             | -                         | -                                  |

#### show（字段显示规则）@columns-show

show 是一个字符串数组，columns 数组内每一个元素都可以单独设置 show

- 如果 columns 的某元素中不存在 show 参数，则代表全部显示（行内、详情弹窗、行展开时）

- 如果数组中有包含 "detail" ，则代表会在详情弹窗时显示

- 如果数组中有包含 "row" ，则代表会在表格行内显示

- 如果数组中有包含 "expand" ，则代表会在表格行展开时显示

- 如果数组只有 ["none"] ，则代表都不显示

**举例**

**只在详情弹窗时显示**

```js
{ key: "nickname", title: "昵称", type: "text",  show: ["detail"] },
```

**只在表格行内显示**

```js
{ key: "nickname", title: "昵称", type: "text",  show: ["row"] },
```

**都不显示**

```js
{ key: "nickname", title: "昵称", type: "text",  show: ["none"] },
```

#### 动态控制字段显示和隐藏@dynamic-show-hide

```js
// 隐藏第1个字段
this.$set(this.table1.columns[0], 'show', ['none']);
// 显示第1个字段
this.$set(this.table1.columns[0], 'show', ['detail', 'row', 'expand']);

// 隐藏第3个字段
this.$set(this.table1.columns[2], 'show', ['none']);
// 显示第3个字段
this.$set(this.table1.columns[2], 'show', ['detail', 'row', 'expand']);
```

[返回展开行](#expand)

#### type（字段类型）@columns-type

```js
table1: {
  columns: [
    {
      key: 'nickname',
      title: '昵称',
      type: 'text',
      width: 120,
      defaultValue: '未设置昵称',
    },
    {
      key: 'avatar',
      title: '头像',
      type: 'avatar',
      width: 80,
      imageWidth: 40,
      shape: 'circle',
    }, // circle 圆形 square 方形
    { key: 'images', title: '图片', type: 'image', width: 120, imageWidth: 60 },
    { key: 'rate', title: '评分', type: 'rate', width: 120 },
    {
      key: 'switch',
      title: '开关',
      type: 'switch',
      width: 120,
      activeValue: true,
      inactiveValue: false,
    },
    { key: 'icon1', title: '图标', type: 'icon', width: 120 },
    {
      key: 'icon2',
      title: '图标',
      type: 'icon',
      width: 120,
      // 当 icon2 值为1时，显示vk-icon-activityfill图标，2时，显示vk-icon-crownfill图标
      data: [
        { value: 1, icon: 'vk-icon-activityfill' },
        { value: 2, icon: 'vk-icon-crownfill' },
      ],
    },
    {
      key: 'type',
      title: '类型',
      type: 'tag',
      width: 120,
      size: 'small',
      data: [
        { value: 1, label: '收入', tagType: 'success' },
        { value: 2, label: '支出', tagType: 'danger' },
      ],
    },
    {
      key: '_add_time',
      title: '添加时间',
      type: 'time',
      width: 160,
      valueFormat: 'yyyy-MM-dd hh:mm:ss',
    },
    { key: '_add_time', title: '距离现在', type: 'dateDiff', width: 120 },
    {
      key: 'exp_time',
      title: '到期剩',
      type: 'dateDiff2',
      endText: '已到期',
      width: 80,
      defaultValue: '永久',
      sortable: 'custom',
    },
    {
      key: 'nickname',
      title: 'html渲染',
      type: 'html',
      formatter: (val, row, column, index) => {
        let str = `<text>${val}</text>（审核通过）`;
        return str;
      },
    },
    { key: 'balance', title: '余额', type: 'money', width: 120 },
    { key: 'percentage', title: '占比', type: 'percentage', width: 120 },
    { key: 'address', title: '地址', type: 'address', width: 120 },
    // 方便连表查询时快速将userInfo的头像和昵称展示出来（值需有avatar和nickname字段）
    { key: 'userInfo', title: '用户', type: 'userInfo', width: 120 },
    // group 是将多个字段显示在一个单元格内
    {
      key: '',
      title: '分组显示',
      type: 'group',
      minWidth: 290,
      align: 'left',
      columns: [
        { key: '_id', title: 'ID', type: 'text' },
        { key: 'avatar', title: '头像', type: 'avatar' },
        { key: 'nickname', title: '昵称', type: 'text' },
      ],
    },
    // object 是解析对象类型的字段
    {
      key: 'object1',
      title: '对象字段',
      type: 'object',
      width: 180,
      align: 'left',
      columns: [
        { key: 'key1', title: '对象内字段1', type: 'text' },
        { key: 'key2', title: '对象内字段2', type: 'text' },
      ],
    },
    // table 是解析对象数组类型的字段，建议只在详情页内展示.
    {
      key: 'arr1',
      title: '对象数组字段',
      type: 'table',
      width: 200,
      show: ['detail'],
      rowHeight: 50, // 行高
      columns: [
        { key: 'key1', title: '对象的字段1', type: 'text', width: 120 },
        { key: 'key2', title: '对象内字段2', type: 'text', width: 120 },
      ],
    },
    {
      key: 'gender',
      title: '性别',
      type: 'radio',
      width: 120,
      defaultValue: 0,
      data: [
        { value: 1, label: '男' },
        { value: 2, label: '女' },
        { value: 0, label: '保密' },
      ],
    },
    {
      key: 'gender',
      title: '性别',
      type: 'select',
      width: 120,
      defaultValue: 0,
      data: [
        { value: 1, label: '男' },
        { value: 2, label: '女' },
        { value: 0, label: '保密' },
      ],
    },
    {
      key: 'checkbox',
      title: '多选字段',
      type: 'checkbox',
      width: 120,
      defaultValue: 1,
      data: [
        { value: 1, label: '选项一' },
        { value: 2, label: '选项二' },
      ],
    },
    {
      key: 'json',
      title: 'json字段',
      type: 'json',
      width: 120,
      maxHeight: 300,
    },
  ];
}
```

#### buttons（字段扩展按钮列表）@columns-buttons

每个字段的扩展按钮列表（支持每行记录显示不同的按钮）

效果图：（此效果图为场景 1 的样式）

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/ff651c6a-5478-4479-859f-0cb6898a14bd.png)

主要使用场景：

- 1、点击修改该字段（如修改商品名称，点击后自动在字段右侧显示修改商品名称的弹窗，输入新商品名称，点击确定，自动修改）;
- 2、点击后查看字段扩展信息（如：审核未通过旁边加个 `原因` 按钮，点击后查看未通过的审核的原因）;
- 3、余额字段，点击后给用户加余额;
- 4、点击后给待发货的订单发货;
- 5、等等;

原先我们实现此功能需要使用插槽来写，而现在只需要写一个 `buttons` 属性即可

特别注意：使用 `buttons` 的 `key` 的值不支持 `a.b` 这样的路径（即不支持带.）

**_如果扩展按钮列表无法满足你的需求，则可以用插槽来完全自定义该字段的实现。_** [查看插槽](#slot)

**单个修改按钮示例**

```js
{
  key: "key1",
  title: "标题",
  type: "text",
  width: 200,
  buttonsPosition: "right", // 支持 left right bottom top
  buttons: [
    {
      title: "修改",
      type: "text", // 文字形式按钮 可选：primary / success / warning / danger / info / text
      mode: "update", // 模式 可选：update（通用修改模式） / default（自定义模式）
      show: ["row"], // 在哪些场景显示按钮 多选：row（在行内显示） / detail（在详情页显示）
      showRule: (formData) => {
        // 此为演示只有字段 key2 不等于 1时，才会显示此按钮。
        return (formData.key2 != 1) ? true : false;
      },
      click: (options) => {
        console.log(1, options.value, options.formData);
        vk.callFunction({
          url: 'template/test/pub/test',
          data: options.formData,
          success: (data) => {
            // 通知组件操作成功（否则组件按钮会一直处于loading状态）
            options.success({
              msg: "修改成功"
            });
          }
        });
      }
    }
  ]
},
```

**复制文本按钮示例**

```js
{
  key: "key1",
  title: "标题",
  type: "text",
  width: 200,
  buttonsPosition: "right", // 支持 left right bottom top
  buttons: [
    {
      title: "复制",
      type: "text", // 文字形式按钮 可选：primary / success / warning / danger / info / text
      mode: "default", // 模式 可选：update（通用修改模式） / default（自定义模式）
      show: ["row", "detail"], // 在哪些场景显示按钮 多选：row（在行内显示） / detail（在详情页显示）
      click: (options) => {
        uni.setClipboardData({
          data: options.value,
          success: () => {
            vk.toast("复制成功");
          }
        });
      }
    }
  ]
},
```

**多个修改按钮示例**

```js
{
  key: "key1", title: "标题", type: "text", width: 200,
  buttonsPosition:"right", // 支持 left right bottom top
  buttons: [
    {
      title: "修改",
      type: "text", // 文字形式按钮 可选：primary / success / warning / danger / info / text
      mode: "update", // 模式 可选：update（通用修改模式） / default（自定义模式）
      show: ["row"], // 在哪些场景显示按钮 多选：row（在行内显示） / detail（在详情页显示）
      showRule: (formData) => {
        // 此为演示只有字段 key2 不等于 1时，才会显示此按钮。
        return (formData.key2 != 1) ? true : false;
      },
      click: (options) => {
        console.log(1, options.value, options.formData);
        vk.callFunction({
          url: 'template/test/pub/test',
          data: options.formData,
          success: (data) => {
            // 通知组件操作成功（否则组件按钮会一直处于loading状态）
            options.success({
              msg: "修改成功"
            });
          }
        });
      }
    },
    {
      title: "查看",
      type: "text",
      show: ["detail", "row"],
      click: (options) => {
        console.log(2, options.value, options.formData);
        uni.vk.toast("你点击了查看");
      }
    }
  ]
},
```

#### filter（本地数据过滤器）@columns-filter

```js
{
  key: "remark", title: "备注", type: "text", width: 200,
  // 本地数据过滤器
  filter: {
    data: [
      { text: '备注1', value: '备注1' },
      { text: '备注2', value: '备注2' },
    ],
    multiple: true, // 是否可多选
    method: (value, row, column) => {
      return value === row.remark;
    },
    defaultValue: [], // 过滤器默认值 如：["备注1"]
  }
},
```

#### formatter（自定义格式化渲染）@columns-formatter

一般用于 `type` 为 `html` 或 `text` 时使用，最终显示的结果时 `formatter` 函数 `return` 的值

```js
{
  key: "nickname", title: "text", type: "text",
  formatter: (val, row, column, index) => {
    let str = `${val}（审核通过）`;
    return str;
  }
},
```

```js
{
  key: "nickname", title: "html", type: "html",
  formatter: (val, row, column, index) => {
    let str = `<text>${val}</text>（审核通过）`;
    return str;
  }
},
```

### default-sort（默认排序）@default-sort

| 参数 | 说明             | 类型   | 默认值      | 可选值       |
| ---- | ---------------- | ------ | ----------- | ------------ |
| name | 需要排序的字段名 | String | -           | -            |
| type | 排序类型         | String | asc（升序） | desc（降序） |

如默认按排序值从小到大排序

```vue
<vk-data-table :default-sort="{ name: 'sort', type: 'asc' }"></vk-data-table>
```

**注意**

你填的 `name的值` 必须在 `columns` 的数组中存在对应的 `key`，即不可以对一个没有在 `columns` 内声明的字段进行排序。

**推荐写法**

```vue
<vk-data-table :default-sort="{ name: '_add_time', type: 'asc' }"></vk-data-table>
```

`columns` 中的 `key` 也要写 `_add_time`，同时加上属性 `sortable:"custom"`

```js
columns: [
  { key: "_add_time", title: "添加时间", type: "time", width: 160, sortable: "custom" },
],
```

### right-btns（右侧固定按钮列表）@right-btns

**高效用法**

效果图

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/bb64b55a-9f94-4b40-a1d5-d4ad93513e83.png)

```vue
<vk-data-table :right-btns="['detail_auto', 'update', 'delete', 'more']"></vk-data-table>
```

**自定义显示规则用法**

效果图

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/97b70681-214b-49bb-a96c-835f8876aec7.png)

```vue
<vk-data-table :right-btns="table1.rightBtns" right-btns-align="right"></vk-data-table>
```

```js
data() {
  return {
    table1: {

      rightBtns: [
        'detail_auto',
        {
          mode: 'update',
          title: '编辑',
          plain: true,
          round: true,
          disabled: (item) => {
            return item._id == '002'
          }
        },
        {
          mode: 'delete',
          title: '删除',
          show: (item) => {
            return item._id != '002'
          }
        },
        'more'
      ],

    }
  }
}
```

##### right-btns 根据当前用户角色或权限控制是否显示、隐藏、禁用@right-btns-permission

```vue
<vk-data-table :right-btns="table1.rightBtns" right-btns-align="right"></vk-data-table>
```

```js
data() {
  return {
    table1: {

      rightBtns: [
        'detail_auto',
        {
          mode: 'update',
          title: '编辑',
          disabled: (item) => {
            return !this.$hasRole("admin") && !this.$hasPermission("user-delete"); // 代表不是admin角色也没有user-delete权限的用户则按钮置灰禁用
          }
        },
        {
          mode: 'delete',
          title: '删除',
          show: (item) => {
            return this.$hasRole("admin") || this.$hasPermission("user-delete"); // 代表只有admin角色或拥有user-delete权限的用户才能看到删除按钮
          }
        },
        'more'
      ],

    }
  }
}
```

##### right-btns 数组内的可选值有@right-btns-options

| 可选值      | 说明                      |
| ----------- | ------------------------- |
| detail      | 点击后触发 detail 事件    |
| detail_auto | 点击后自动弹出详情页      |
| update      | 点击后触发 update 事件    |
| delete      | 点击后触发 delete 事件    |
| more        | 与 rightBtnsMore 搭配使用 |

### right-btns-more（更多按钮列表）@right-btns-more

right-btns-more（右侧更多按钮点击后显示的按钮列表）

**效果图**

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/04d7bad0-87d3-4e54-b275-3c89cb833d11.png)

```vue
<vk-data-table :right-btns="['detail_auto', 'update', 'delete', 'more']" :right-btns-more="table1.rightBtnsMore"></vk-data-table>
```

```js
data() {
  return {
    table1: {

      rightBtnsMore: [
        {
          title: '按钮1',
          disabled: (item) => {
            return item._id == '002'
          },
          onClick: (item) => {
            vk.toast(`${item._id}-按钮1`);
          }
        },
        {
          title: '按钮2',
          show: (item) => {
            return item._id != '002'
          },
          onClick: (item) => {
            vk.toast(`${item._id}-按钮2`);
          }
        },
        {
          title: '按钮3',
          disabled: '_id==002',
          onClick: (item) => {
            vk.toast(`${item._id}-按钮3`);
          }
        },
        {
          title: '按钮4',
          disabled: '_id!=002',
          onClick: (item) => {
            vk.toast(`${item._id}-按钮4`);
          }
        }
      ]

    }
  }
}
```

##### right-btns-more 根据当前用户角色或权限控制是否显示、隐藏、禁用@right-btns-more-permission

```vue
<vk-data-table :right-btns="['detail_auto', 'update', 'delete', 'more']" :right-btns-more="table1.rightBtnsMore"></vk-data-table>
```

```js
data() {
  return {
    table1: {

      rightBtnsMore: [
        {
          title: '按钮1',
          disabled: (item) => {
            return !this.$hasRole("admin") && !this.$hasPermission("user-delete"); // 代表不是admin角色也没有user-delete权限的用户则按钮置灰禁用
          },
          onClick: (item) => {
            vk.toast(`${item._id}-按钮1`);
          }
        },
        {
          title: '按钮2',
          show: (item) => {
            return this.$hasRole("admin") || this.$hasPermission("user-delete"); // 代表只有admin角色或拥有user-delete权限的用户才能看到删除按钮
          },
          onClick: (item) => {
            vk.toast(`${item._id}-按钮2`);
          }
        }
      ]

    }
  }
}
```

### custom-right-btns（自定义右侧固定按钮）@custom-right-btns

**效果图**

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/3d559376-73af-4749-9516-f9c33149d74f.png)

```vue
<vk-data-table :custom-right-btns="table1.customRightBtns" right-btns-align="right"></vk-data-table>
```

```js
data() {
  return {
    table1: {

      customRightBtns: [
        {
          title: '按钮1', type: 'primary', icon: 'el-icon-edit',
          disabled: (item) => {
            return item._id == '002'
          },
          onClick: (item) => {
            vk.toast(`${item._id}-按钮1`);
          }
        },
        {
          title: '按钮2', type: 'success', icon: 'el-icon-edit',
          show: (item) => {
            return item._id != '002'
          },
          onClick: (item) => {
            vk.toast(`${item._id}-按钮2`);
          }
        },
        {
          title: '按钮3', type: 'warning', icon: 'el-icon-edit',
          disabled: '_id==002',
          onClick: (item) => {
            vk.toast(`${item._id}-按钮3`);
          }
        },
        {
          title: '按钮4', type: 'danger', icon: 'el-icon-edit',
          disabled: '_id!=002',
          onClick: (item) => {
            vk.toast(`${item._id}-按钮4`);
          }
        }
      ],

    }
  }
}
```

#### 根据当前用户角色或权限控制是否显示、隐藏、禁用@permission-control

`right-btns` `right-btns-more` `custom-right-btns` 均支持

```vue
<vk-data-table :custom-right-btns="table1.customRightBtns" right-btns-align="right"></vk-data-table>
```

```js
data() {
  return {
    table1: {

      customRightBtns: [
        {
          title: '按钮1', type: 'primary', icon: 'el-icon-edit',
          disabled: (item) => {
            return !this.$hasRole("admin") && !this.$hasPermission("user-delete"); // 代表不是admin角色也没有user-delete权限的用户则按钮置灰禁用
          },
          onClick: (item) => {
            vk.toast(`${item._id}-按钮1`);
          }
        },
        {
          title: '按钮2', type: 'success', icon: 'el-icon-edit',
          show: (item) => {
            return this.$hasRole("admin") || this.$hasPermission("user-delete"); // 代表只有admin角色或拥有user-delete权限的用户才能看到删除按钮
          },
          onClick: (item) => {
            vk.toast(`${item._id}-按钮2`);
          }
        }
      ],

    }
  }
}
```

### batch-btns（底部批量操作按钮列表）@batch-btns

> vk-unicloud-admin-ui 的 npm 依赖版本需 >= 1.24.1

底部批量操作按钮，显示在分页器同行左侧，需配合 `:selection="true"` 使用。支持两种模式：

- **独立按钮**：直接点击触发事件
- **下拉聚合按钮**：配置 `btns` 属性，渲染为 `el-dropdown`

**batch-btns 内每个元素的属性**

| 参数     | 说明                                                                                        | 类型                             | 默认值  | 可选值                                        |
| -------- | ------------------------------------------------------------------------------------------- | -------------------------------- | ------- | --------------------------------------------- |
| title    | 按钮文本                                                                                    | String                           | -       | -                                             |
| type     | 按钮类型                                                                                    | String                           | default | primary、success、warning、danger、info、text |
| icon     | 按钮图标                                                                                    | String                           | -       | -                                             |
| onClick  | 点击回调，参数 items 为当前多选框选中的行数据                                               | Function(items)                  | -       | -                                             |
| confirm  | 点击时是否需要二次确认，传对象可自定义确认弹窗参数 [查看 confirm 配置](#batch-btns-confirm) | Boolean、Object                  | false   | true                                          |
| show     | 是否显示按钮，参数 items 为当前多选框选中的行数据                                           | Function(items)                  | -       | -                                             |
| disabled | 是否禁用按钮，参数 items 为当前多选框选中的行数据                                           | Function(items)                  | -       | -                                             |
| btns     | 子按钮列表（配置后渲染为下拉聚合按钮）                                                      | Array（子项同上，无 btns、icon） | -       | -                                             |

**基础用法 - 独立按钮**

```vue
<vk-data-table :selection="true" :batch-btns="table1.batchBtns"></vk-data-table>
```

```js
data() {
  return {
    table1: {

      batchBtns: [
        {
          title: '批量删除',
          type: 'danger',
          icon: 'el-icon-delete',
          confirm: true,
          onClick: (items) => {
            let ids = items.map(item => item._id);
            console.log('选中行：', items, ids);
          }
        }
      ]

    }
  }
}
```

> **注意**：`batchBtns` 的 `onClick`、`show`、`disabled` 等回调必须使用**箭头函数**，不能使用普通 `function`。原因是：使用箭头函数可以正确捕获 `this` 指向当前 Vue 实例，而普通 `function` 的 `this` 在被组件调用时可能不指向 Vue 实例。同理，`rightBtnsMore` 中的 `onClick` 也应使用箭头函数。

**下拉聚合按钮**

```js
batchBtns: [
  {
    title: '批量操作',
    type: 'default',
    btns: [
      {
        title: '批量冻结',
        onClick: (items) => {
          let ids = items.map((item) => item._id);
          console.log('冻结：', items, ids);
        },
      },
      {
        title: '批量解冻',
        onClick: (items) => {
          let ids = items.map((item) => item._id);
          console.log('解冻：', items, ids);
        },
      },
    ],
  },
];
```

**混合使用**

```js
batchBtns: [
  {
    title: '批量操作',
    type: 'default',
    btns: [
      {
        title: '批量冻结',
        onClick: (items) => {
          let ids = items.map((item) => item._id);
          console.log('冻结：', items, ids);
        },
      },
      {
        title: '批量解冻',
        onClick: (items) => {
          let ids = items.map((item) => item._id);
          console.log('解冻：', items, ids);
        },
      },
    ],
  },
  {
    title: '批量删除',
    type: 'danger',
    icon: 'el-icon-delete',
    confirm: true,
    onClick: (items) => {
      let ids = items.map((item) => item._id);
      console.log('批量删除：', items, ids);
    },
  },
];
```

**show 和 disabled 示例**

```js
batchBtns: [
  {
    title: '批量审核',
    type: 'success',
    // 只有选中的行全部是"待审核"状态时才显示
    show: (items) => items.every((row) => row.status === 2),
    onClick: (items) => {
      let ids = items.map((item) => item._id);
      console.log('批量审核：', items, ids);
    },
  },
  {
    title: '批量删除',
    type: 'danger',
    confirm: true,
    // 选中超过50条时禁用
    disabled: (items) => items.length > 50,
    onClick: (items) => {
      let ids = items.map((item) => item._id);
      console.log('批量删除：', items, ids);
    },
  },
];
```

##### batch-btns 根据当前用户角色或权限控制是否显示、隐藏、禁用@batch-btns-permission

```vue
<vk-data-table :selection="true" :batch-btns="table1.batchBtns"></vk-data-table>
```

```js
data() {
  return {
    table1: {

      batchBtns: [
        {
          title: '批量审核',
          type: 'success',
          show: (items) => {
            // 只有admin角色或拥有batch-audit权限的用户才能看到批量审核按钮
            return this.$hasRole("admin") || this.$hasPermission("batch-audit");
          },
          onClick: (items) => {
            let ids = items.map((item) => item._id);
            console.log('批量审核：', items, ids);
          },
        },
        {
          title: '批量删除',
          type: 'danger',
          confirm: true,
          disabled: (items) => {
            // 代表不是admin角色也没有batch-delete权限的用户则按钮置灰禁用
            return !this.$hasRole("admin") && !this.$hasPermission("batch-delete");
          },
          onClick: (items) => {
            let ids = items.map((item) => item._id);
            console.log('批量删除：', items, ids);
          },
        },
      ],

    }
  }
}
```

**confirm 对象配置@batch-btns-confirm**

`confirm` 除了支持 `Boolean`，还支持传入对象来自定义 `$confirm` 弹窗的参数。对象中的属性会与默认配置合并（传入的值优先）。

| 参数              | 说明                                                      | 类型   | 默认值                  |
| ----------------- | --------------------------------------------------------- | ------ | ----------------------- |
| title             | 弹窗标题                                                  | String | 二次确认                |
| message           | 弹窗消息内容，支持 `%title%` 占位符（替换为按钮的 title） | String | 确定执行【%title%】吗？ |
| confirmButtonText | 确认按钮文本                                              | String | 确定                    |
| cancelButtonText  | 取消按钮文本                                              | String | 取消                    |
| type              | 弹窗图标类型                                              | String | warning                 |

> 除以上字段外，还支持 Element UI `$confirm` 的其他参数（如 `closeOnClickModal`、`closeOnPressEscape` 等）

```js
batchBtns: [
  {
    title: '批量删除',
    type: 'danger',
    icon: 'el-icon-delete',
    confirm: {
      title: '危险操作',
      message: '此操作将永久删除选中的 %count% 条数据，是否继续？',
      confirmButtonText: '确认删除',
      cancelButtonText: '我再想想',
      type: 'error',
    },
    onClick: (items) => {
      let ids = items.map((item) => item._id);
      console.log('批量删除：', items, ids);
    },
  },
];
```

### 默认最大高度计算规则@max-height-calc

**自 1.24.1 起**，当未显式设置 `max-height` 且非全屏模式时，表格会自动计算最大高度，规则如下：

**计算逻辑：**

1. **移动端（非 PC 端）**：不设置最大高度，高度由内容撑开
2. **PC 端**：
   - 基础高度 = 屏幕可用高度（减去顶部工具栏、分页器等区域）
   - 最小高度兜底：若计算高度 < 5 行高度（`行高 × 5 + 50`），则返回默认最大高度 **1000px**
   - 全屏模式下跳过最小高度检查，直接使用计算高度

**这样做的好处：**

1. **避免表格过矮**：当页面空间有限或数据行数较少时，表格不会被压缩到难以使用的高度
2. **保证基本可用性**：至少能显示 5 行数据，确保用户有足够的可视区域进行操作
3. **自适应体验**：在大屏设备上充分利用屏幕空间，在小屏设备上保持合理高度
4. **减少手动配置**：开发者无需为不同屏幕尺寸手动设置 `max-height`，框架自动处理

### 行高对不齐处理@row-height-align

**原因**

如果每一行的行高是不固定的，就一定会对不齐（因为使用了虚拟表格来提升性能，因此滚动条的高度等都是根据第一行的行高计算出来的）

**解决方案**

方案一：设置一下固定的行高，此方案只适用最大行高是已知的情况

```vue
<vk-data-table :row-height="100"></vk-data-table>
```

方案二：去掉左右两侧浮动的效果，此方案万能，但缺点是没有浮动了

```vue
<vk-data-table :left-fixed="false" :right-fixed="false"></vk-data-table>
```

### 高亮行处理@highlight-current-row

通过设置

```vue
:highlight-current-row = "false"
```

可以关闭 `点击` 某行时的高亮，若想要关闭 `hover` 某行时的高亮，可以通过以下 css 样式覆盖达到效果。(将下方 css 写在需要生效的页面的 style 标签内)

```css
::v-deep .plTableBox .el-table__body tr.hover-row.current-row > td,
::v-deep .plTableBox .el-table__body tr.hover-row.el-table__row--striped.current-row > td,
::v-deep .plTableBox .el-table__body tr.hover-row.el-table__row--striped > td,
::v-deep .plTableBox .el-table__body tr.hover-row > td {
  background-color: #ffffff !important;
}
```

### http 请求模式@http

**props 对象属性**

| 参数      | 说明                     | 类型   | 默认值    | 可选值 |
| --------- | ------------------------ | ------ | --------- | ------ |
| rows      | 表格数据源的键名         | String | rows      | -      |
| total     | 总记录条数的键名         | String | total     | -      |
| pageIndex | 查询时当前第几页的键名   | String | pageIndex | -      |
| pageSize  | 查询时每页显示几条的键名 | String | pageSize  | -      |
| formData  | 查询表单的数据源的键名   | String | formData  | -      |

**示例代码**

```vue
<vk-data-table
  ref="table1"
  action="https://www.xxx.com/xxx/xxx"
  :is-request="true"
  :props="{ rows: 'rows', total: 'total', pageIndex: 'pageIndex', pageSize: 'pageSize', formData: 'formData' }"
  :columns="table1.columns"
  :query-form-param="queryForm1"
></vk-data-table>
```

### 自定义 function 请求模式@function

> vk-unicloud-admin-ui 的 npm 依赖版本需 >= 1.17.0

此方式同样支持 http，且更自由化，比如可以在发起请求前处理请求参数，在请求成功后，处理返回参数等等。

优势：更自由化、基本可以满足所有需求场景

劣势：代码量较多

#### 自定义 function-http 请求模式示例@function-http

```vue
<vk-data-table ref="table1" :action="table1.action"></vk-data-table>
```

```js
export default {
  data() {
    return {
      table1: {
        action: (obj = {}) => {
          let {
            data, // 请求数据
            success, // 成功回调
            fail, // 失败回调
            complete, // 完成回调
          } = obj;
          // 发起http请求
          vk.request({
            url: `https://www.xxx.com/api/list`,
            method: 'POST',
            header: {
              'content-type': 'application/json; charset=utf-8',
            },
            data: data,
            success: (res) => {
              if (typeof success === 'function') {
                success({
                  rows: res.rows, // 列表数据
                  total: res.total, // 总记录数（如果没有总记录数，则需要返回getCount和hasMore）
                  getCount: res.getCount, // 是否执行了count请求，当total的值不是总记录数时需要返回 getCount: false
                  hasMore: res.hasMore, // 是否还有下一页，当total的值不是总记录数时需要返回是否还有下一页
                });
              }
            },
            fail: (res) => {
              if (typeof fail === 'function') fail(res);
            },
            complete: (res) => {
              if (typeof complete === 'function') complete(res);
            },
          });
        },
      },
    };
  },
};
```

#### 自定义 function-云函数请求示例@function-cloud

```vue
<vk-data-table ref="table1" :action="table1.action" ...其他属性></vk-data-table>
```

```js
export default {
  data() {
    return {
      table1: {
        action: (obj = {}) => {
          let {
            data, // 请求数据
            success, // 成功回调
            fail, // 失败回调
            complete, // 完成回调
          } = obj;
          // 发起http请求
          vk.callFunction({
            url: `云函数或云对象路径`,
            data: data,
            success: (res) => {
              if (typeof success === 'function') {
                success({
                  rows: res.rows, // 列表数据
                  total: res.total, // 总记录数（如果没有总记录数，则需要返回getCount和hasMore）
                  getCount: res.getCount, // 是否执行了count请求，当total的值不是总记录数时需要返回 getCount: false
                  hasMore: res.hasMore, // 是否还有下一页，当total的值不是总记录数时需要返回是否还有下一页
                });
              }
            },
            fail: (res) => {
              if (typeof fail === 'function') fail(res);
            },
            complete: (res) => {
              if (typeof complete === 'function') complete(res);
            },
          });
        },
      },
    };
  },
};
```

### 数据预处理@data-preprocess

```vue
<vk-data-table :data-preprocess="table1.dataPreprocess"></vk-data-table>
```

```js
export default {
  data() {
    return {
      table1: {
        dataPreprocess: (list) => {
          // 这里写自己的处理逻辑，最终返回处理完的list即可。
          list.map((item, index) => {
            item.a = 1;
          });
          return list;
        },
      },
    };
  },
};
```

### 展开行@expand

当行内容过多并且不想显示横向滚动条时，可以使用 Table 展开行功能。

```vue
<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1" :expand="true"></vk-data-table>
```

可以配合 show 选择展开后显示的哪些字段 [查看 show](#columns-show)

同时还可以通过插槽编写展开后的样式 [查看插槽](#slot-demo-2)

### 表格自带的多选框禁用规则@selection

```vue
<vk-data-table :selection="true" :selectable="table1.selectable"></vk-data-table>
```

```js
export default {
  data() {
    return {
      table1: {
        selectable: (row, index) => {
          // 返回true,代表可以多选,返回false代表该行的多选框禁用。
          if (index == 1) {
            return false;
          } else {
            return true;
          }
        },
      },
    };
  },
};
```

### 异常重试机制@retry-count

`retry-count` 属性异常重试机制可以有效解决当前阿里云空间偶尔会出现数据库连接超时导致的异常没有获取到数据的问题。

同时可以通过设置 `retry-interval` 属性，可以控制每次重试的间隔（单位为毫秒）

```vue
<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1" :retry-count="3"></vk-data-table>
```

注意：并非所有异常都会重试，框架会合理判断。（目前此判断逻辑也还在不断优化中）

### 列支持拖动改变宽度@border

设置 border 为 true 即可

```vue
<vk-data-table ref="table1" :border="true"></vk-data-table>
```

## 分页@pagination

以下是与分页相关的属性

| 参数           | 说明                                                                                                                                                        | 类型            | 默认值                        | 可选值            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------- | ----------------- |
| pagination     | 通用 - 显示分页器                                                                                                                                           | Boolean         | false                         | true              |
| page-size      | 通用 - 每页显示数量                                                                                                                                         | Number          | 10                            | -                 |
| page-sizes     | 通用 - 每页显示数量选择列表                                                                                                                                 | Array           | [1, 5, 10, 20, 50, 100, 1000] | -                 |
| get-count      | [1.18.0 新增] 通用 - 执行 count 请求的模式 <br/>与 vk.baseDao.getTableData 配合使用才有效果，可选<br/>auto：自动判断<br/>true：总是执行<br/>false：从不执行 | String、Boolean | auto                          | auto、true、false |
| max-page-count | [1.18.0 新增] 通用 - 最大可显示的页数                                                                                                                       | Number          | -                             | -                 |

当设置 pagination 为 true 时，表格会开启分页功能

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/0500/505.png)

在 `vk-unicloud-admin-ui` ≥ `1.18.0` 后，新增了 `getCount` 参数，该参数与云端 `vk.baseDao.getTableData` 配合使用可以达到节省 count 请求次数，提升查询性能的效果，具体可以实现以下几种分页效果：

### 分页方案一（传统分页）@pagination-1

描述：传统分页方案，每次请求同时查询 rows（当前页数据） 和 total（总记录条数），前端显示当前页数据以及分页器，分页器支持直接跳到任意页面

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/0500/506.png)

**优势**

1. 能显示总记录条数
2. 可以跳转到指定的页码
3. 实现起来最简单方便

**劣势**

1. 每次查询都会进行 count 请求，有点浪费性能（带条件的 count 在数据越多的时候性能越差）
2. 性能在翻页过程中有衰减，如翻到第 10 万页时，性能明显降低，可以通过设置 max-page-count 来限制最大页数

**适用场景**

非大表

**使用方法**

万能表格组件设置属性 `:getCount="true"`

```vue
<vk-data-table :getCount="true"></vk-data-table>
```

### 分页方案二（智能分页）@pagination-2

大部分情况下都推荐使用此方案，此方案也是目前万能表格的默认方案

描述：在方案一的基础上，进行了优化，在查询条件没变的情况下，翻页时不进行 count 请求（即缓存首次查询时的总记录条数）

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/0500/507.png)

**优势**

1. 能显示总记录条数
2. 可以跳转到指定的页码
3. 翻页的时候可以节省一次 count 请求

**劣势**

1. 性能在翻页过程中有衰减，如翻到第 10 万页时，性能明显降低，可以通过设置 max-page-count 来限制最大页数

**适用场景**

1. 非大表
2. 想节省 count 请求

**使用方法**

万能表格组件设置属性 `getCount="auto"` 如不设置，默认也是 auto

```vue
<vk-data-table getCount="auto"></vk-data-table>
```

### 分页方案三（滚动分页）@pagination-3

描述：从不执行 count 请求，但翻页只能下一页或上一页，且不显示总记录条数

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/0500/502.png)

**优势**

1. 高性能

**劣势**

1. 不显示总记录条数
2. 翻页只能下一页或上一页，不能跳转到指定的页码
3. 性能在翻页过程中有衰减，如翻到第 10 万页时，性能明显降低（但因为不能跳转到指定的页码，所以一般用户翻不到 10 万页）

**适用场景**

大表

**使用方法**

万能表格组件设置属性 `:getCount="false"`

```vue
<vk-data-table :getCount="false"></vk-data-table>
```

### 分页方案四（游标分页）@pagination-4

描述：上面 3 个方案的翻页都是通过数据库的 `skip+limit` 组合使用实现的，这种方式当 `skip` 的值越大，性能越差

游标分页不使用 `skip` 而是使用一个游标（通常是记录的唯一标识符，比如 `_id`）来确定从哪里开始获取下一页的数据。客户端通过向服务器传递上一页最后一条记录的游标来获取下一页数据。

前端展示的效果与分页方案三（滚动分页）一致

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/0500/502.png)

以 实现 \_id 升序排序为例

实现下一页通过 where \_id > 本页的最后一条记录，且 \_id 是升序排序，这样查询到的就是下一页的数据

实现上一页通过 where id < 本页的第一条记录，且 \_id 降序排序，这样查到的就是上一页数据

以 实现 \_id 降序排序为例

实现下一页通过 where \_id < 本页的最后一条记录，且 \_id 是降序排序，这样查询到的就是下一页的数据

实现上一页通过 where id > 本页的第一条记录，且 \_id 是升序排序，这样查到的就是上一页数据

**优势**

1. 高性能
2. 性能在翻页过程中无衰减，无论翻多少页，基本都一样快
3. 能完整遍历完表内所有数据（不管表格里有多少数据）

**劣势**

1. 不显示总记录条数
2. 翻页只能下一页或上一页，不能跳转到指定的页码
3. 必须依赖唯一索引排序，不可按其他字段排序，限制较多

**适用场景**

大表

**使用方法**

此方案暂未封装到组件中

### getCount 处理逻辑@getCount

1. 前端 getCount 为 auto 时，前端加载第一页时 getCount 视为 true 分页加载非第一页时，getCount 视为 false
2. 前端 getCount 为 true 时，前端每次查询 getCount 均视为 true
3. 前端 getCount 为 false 时，前端每次查询 getCount 均视为 false
4. 云端 `vk.baseDao.getTableData` 不指定 getCount 时，若查询语句含有 `lastWhereJson` 或 `lastSortArr` 则 getCount 视为 false，不含则视为 true
5. 云端 `vk.baseDao.getTableData` 指定 getCount 时，按指定的值决定

因为云端也可能会直接指定 getCount，故当云端的 getCount 和前端 getCount 不一致时的策略：

1. 云端 true 前端 true 最终 getCount 视为 true
2. 云端 true 前端 false 最终 getCount 视为 false
3. 云端 false 前端不管 true 还是 false 最终 getCount 均视为 false

## 事件@event

| 事件名             | 说明                                                                                 | 回调参数                                  |
| ------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------- |
| table-mounted      | 表格组件挂载完毕时（此时还没有数据）                                                 | -                                         |
| success            | 表格数据查询成功时                                                                   | { data(请求返回的原始数据), list, total } |
| fail               | 表格数据查询失败时                                                                   | err                                       |
| complete           | 表格数据查询无论成功和失败都会触发                                                   | res                                       |
| detail             | 点击详情按钮（手动版）时 item 和 row 值一样，区别在于修改 row 的值会影响表格实际显示 | { item, row, open }                       |
| update             | 点击修改按钮时 item 和 row 值一样，区别在于修改 row 的值会影响表格实际显示           | { item, row }                             |
| delete             | 点击删除按钮时                                                                       | { item, deleteFn }                        |
| custom-right-btns  | 自定义右侧按钮点击事件                                                               | column, event                             |
| right-btns-more    | 自定义右侧更多按钮点击事件                                                           | res, item                                 |
| current-change     | 点击(高亮)某一行                                                                     | row                                       |
| row-click          | 单击某一行                                                                           | row, column, event                        |
| row-dblclick       | 双击某一行                                                                           | row, column, event                        |
| row-contextmenu    | 鼠标右键某一行                                                                       | row, column, event                        |
| cell-mouse-enter   | 当单元格 hover 进入时会触发该事件                                                    | row, column, cell, eventt                 |
| cell-mouse-leave   | 当单元格 hover 退出时会触发该事件                                                    | row, column, cell, eventt                 |
| cell-click         | 单击某一个单元格                                                                     | row, column, cell, event                  |
| cell-dblclick      | 双击某一个单元格                                                                     | row, column, cell, event                  |
| header-click       | 某一列的表头被点击时                                                                 | column, event                             |
| header-contextmenu | 某一列的表头被鼠标右键点击时                                                         | row, btn                                  |
| header-dragend     | 当拖动表头改变了列的宽度的时候会触发该事件                                           | newWidth, oldWidth, column, event         |
| pagination-change  | 点击分页按钮事件（手动模式下使用）                                                   | paginationData                            |
| select             | 当用户手动勾选数据行的 Checkbox 时触发的事件                                         | selection, row                            |
| select-all         | 当用户手动勾选全选的 Checkbox 时触发的事件                                           | selection                                 |
| selection-change   | 多选框状态发生变化时                                                                 | rows                                      |
| 其他               | 其他 element 自带的事件大部分也支持                                                  | -                                         |

## 方法@methods

**通过 this.$refs.table1.xxx(); 方式调用**

| 方法名                | 说明                                                |
| --------------------- | --------------------------------------------------- |
| refresh               | 刷新                                                |
| search                | 查询（搜索）                                        |
| getCurrentRow         | 获取当前选中的行的数据                              |
| getTableData          | 获取整个表格数据                                    |
| getTableFormatterData | 获取整个表格数据（格式化后的数据）                  |
| getMultipleSelection  | 获取多选框的数据                                    |
| showDetail            | 显示详情页                                          |
| closeDetail           | 关闭详情页                                          |
| exportExcel           | 导出 xls 表格文件                                   |
| deleteRows            | 删除指定的行（不删数据库数据）                      |
| updateRows            | 更新指定的行数据（不更新据库数据）                  |
| setTableData          | 手动给表格重新赋值数据                              |
| toggleRowSelection    | 批量修改表格内的多选框选中状态                      |
| getRowIndex           | 获取指定行所在的 index （新增于 1.17.39）           |
| doLayout              | 对 Table 进行重新布局（当表格高度有变化时可以调用） |

### showDetail（显示详情页）@show-detail

```js
this.$refs.table1.showDetail(item); // item是该条记录的数据源
```

### 删除指定的行（不删数据库数据）@delete-rows

```js
this.$refs.table1.deleteRows({
  ids: ['60acf6248a69dc00018d8520'],
  success: () => {},
});
```

### 更新指定行数据（不更新据库）@update-rows

```js
this.$refs.table1.updateRows({
  mode: 'update', // update 局部字段更新 set 覆盖字段更新
  rows: [{ _id: '60acf6248a69dc00018d8520', remark: '被修改了', money: 10000 }],
  success: () => {},
});
```

### 导出表格数据@export-excel

#### 导出当前页的数据（含序号）@export-excel-1

```js
this.$refs.table1.exportExcel();
```

#### 导出当前页的数据（不含序号）@export-excel-2

```js
this.$refs.table1.exportExcel({
  showNo: false,
});
```

#### 表格文件首行锁定+可筛选@export-excel-3

```js
this.$refs.table1.exportExcel({
  freezeHeader: true,
  autoFilter: true,
});
```

#### 自定义导出表格数据@export-excel-4

```js
this.$refs.table1.exportExcel({
  fileName: '表格数据',
  original: false,
  columns: [
    { key: '_id', title: 'id', type: 'text' },
    { key: 'money', title: '金额', type: 'money' },
  ],
});
```

#### 导出满足表格查询条件的数据库内所有数据@export-excel-5

```js
this.$refs.table1.exportExcel({
  fileName: '表格全部数据',
  title: '正在导出数据...',
  pageIndex: 1,
  pageSize: -1, // 此值为-1，代表导出所有数据
});
```

#### 导出自定义数据@export-excel-6

```js
this.$refs.table1.exportExcel({
  fileName: '文件名称',
  data: [
    { a: 1, b: 2 },
    { a: 11, b: 22 },
  ],
  columns: [
    { key: 'a', title: '标题a', type: 'text' },
    { key: 'b', title: '标题b', type: 'text' },
  ],
});
```

#### 弹出列选择器后导出@export-excel-7

设置 `showColumnSelector: true` 后，调用 `exportExcel` 会先弹出列选择器弹窗，用户选择要导出的列并确认后才会执行导出。其余参数（如 `showNo`、`freezeHeader` 等）会作为弹窗的默认值。

```js
this.$refs.table1.exportExcel({
  showColumnSelector: true,
  showNo: false, // 列选择器弹窗中"含序号"默认关闭
  freezeHeader: true, // 列选择器弹窗中"首行锁定"默认开启
});
```

### 导出弹窗配置项@export-options

通过 `export-options` 属性可以配置导出 Excel 弹窗的默认值和控制各项配置是否显示。

```vue
<vk-data-table :show-export="true" :export-options="table1.exportOptions"></vk-data-table>
```

```js
data() {
  return {
    table1: {
      exportOptions: {
        // 默认值配置
        scope: 'page',        // 默认数据源：'page'（本页数据）或 'all'（全部数据）
        fileName: '表格数据',   // 默认文件名（不含扩展名）
        showNo: true,          // 默认是否含序号
        freezeHeader: true,    // 默认是否首行锁定
        autoFilter: true,      // 默认是否可筛选
        original: false,       // 默认是否导出原始数据

        // 显示/隐藏配置项（设为 false 则隐藏对应配置项，默认全部显示）
        showScope: true,           // 是否显示数据源选择
        showFileName: true,        // 是否显示文件名输入框
        showShowNo: true,          // 是否显示"含序号"开关
        showFreezeHeader: true,    // 是否显示"首行锁定"开关
        showAutoFilter: true,      // 是否显示"可筛选"开关
        showOriginal: true,        // 是否显示"导出原始数据"开关
      },
    },
  };
},
```

**export-options 属性说明**

| 参数             | 说明                                            | 类型    | 默认值 | 可选值      |
| ---------------- | ----------------------------------------------- | ------- | ------ | ----------- |
| scope            | 默认数据源                                      | String  | page   | page、all   |
| fileName         | 默认文件名（不含 .xlsx 扩展名）                 | String  | -      | -           |
| showNo           | 默认是否含序号                                  | Boolean | true   | true、false |
| freezeHeader     | 默认是否首行锁定（需引入 ExcelJS）              | Boolean | true   | true、false |
| autoFilter       | 默认是否可筛选（需引入 ExcelJS）                | Boolean | true   | true、false |
| original         | 默认是否导出原始数据（未经过 formatter 格式化） | Boolean | false  | true、false |
| showScope        | 是否显示数据源选择                              | Boolean | true   | true、false |
| showFileName     | 是否显示文件名输入框                            | Boolean | true   | true、false |
| showShowNo       | 是否显示"含序号"开关                            | Boolean | true   | true、false |
| showFreezeHeader | 是否显示"首行锁定"开关                          | Boolean | true   | true、false |
| showAutoFilter   | 是否显示"可筛选"开关                            | Boolean | true   | true、false |
| showOriginal     | 是否显示"导出原始数据"开关                      | Boolean | true   | true、false |

**仅导出本页数据、隐藏数据源选择的示例**

```js
exportOptions: {
  scope: 'page',
  showScope: false,  // 隐藏数据源选择，用户只能导出本页数据
}
```

**简化导出弹窗，只保留文件名和序号配置**

```js
exportOptions: {
  showScope: false,
  showFreezeHeader: false,
  showAutoFilter: false,
  showOriginal: false,
}
```

### 获取选中行数据（原始数据）@getCurrent-row-1

如果此时修改 info 变量的值会改变表格数据

```js
let info = this.$refs.table1.getCurrentRow(true);
console.log(info);
```

### 获取选中行数据（原始数据副本）@getCurrent-row-2

如果此时修改 info 变量的值不会改变表格数据

```js
let info = this.$refs.table1.getCurrentRow();
console.log(info);
```

### 设置整个表格数据@set-table-data

```js
let list = [{ _id: '001', name: '测试' }];
this.$refs.table1.setTableData(list);
```

### 获取整个表格数据（原始数据）@get-table-data-1

如果此时修改 info 变量的值会改变表格数据

```js
let info = this.$refs.table1.getTableData();
console.log(info);
```

### 获取整个表格数据（数据副本）@get-table-data-2

如果此时修改 info 变量的值不会改变表格数据

```js
let info = vk.pubfn.copyObject(this.$refs.table1.getTableData());
console.log(info);
```

### 获取整个表格数据（格式化数据）@get-table-formatter-data-1

```js
let info = this.$refs.table1.getTableFormatterData();
console.log(info);
```

### 获取整个表格数据（格式化数据,key 为中文）@get-table-formatter-data-2

```js
let info = this.$refs.table1.getTableFormatterData({
  key: 'title',
});
console.log(info);
```

### 批量修改表格内的多选框选中状态@toggle-row-selection

```js
let arr = [];
let uTreeData = this.$refs.table1.getUTreeData(); // 这一步很重要，row只接收 uTreeData 内的元素
arr.push({
  row: uTreeData[0],
  selected: true,
});
arr.push({
  row: uTreeData[1],
  selected: false,
});
this.$refs.table1.toggleRowSelection(arr);
```

### getRowIndex（获取指定行所在的 index）@get-row-index

> 新增于 1.17.39

```js
let index = this.$refs.table1.getRowIndex(item); // item是该条记录的数据源
```

### doLayout（重新布局）@do-layout

对 Table 进行重新布局。当 Table 或其祖先元素由隐藏切换为显示时，可能需要调用此方法来修正表格的列宽和滚动条。

```js
this.$refs.table1.doLayout();
```

**典型使用场景**

在标签页（Tab）切换、抽屉（Drawer）弹出等涉及表格可见性变化的场景中，表格可能出现列宽异常或滚动条错位的问题，此时调用 `doLayout` 即可修复。

```js
// 例如：标签页切换后重新布局表格
onTabChange() {
  this.$nextTick(() => {
    this.$refs.table1.doLayout();
  });
}
```

## 插槽@slot

### columns 中每一个 key 都是插槽名称@columns-slot

### 重写`gender`字段的渲染示例@slot-demo-1

- 注意: 只需要把下方`<template></template>`标签和标签内的代码复制到你页面上的`<vk-data-table></vk-data-table>`标签内即可

```vue
<vk-data-table>
  <!-- v-slot:gender 中的 gender 对应 columns中的 key, row对应 这一行的数据源 -->
  <template v-slot:gender="{ row, column, index }">
    <view>我是插槽：{{ row.gender }}</view>
  </template>
</vk-data-table>
```

### 展开行插槽示例@slot-demo-2

```vue
<vk-data-table>
  <!-- v-slot:tableExpand 是固定的 row 是该行的数据源-->
  <template v-slot:tableExpand="{ row }">
    <view>我是插槽：{{ row._id }}</view>
  </template>
</vk-data-table>
```

[返回展开行](#expand)

### 表头插槽@slot-demo-3

每个字段的表头插槽名：`v-slot:header_字段名`

下发代码中实现了表头使用 input 输入框代替实现自定义搜索功能

其中 `v-model="queryForm1.formData.nickname"` 表示双向绑定 `nickname` 字段

`@keyup.enter.native="search"` 表示当按下回车时执行搜索

代码示例

```vue
<template>
  <vk-data-table>
    <!-- v-slot:header_nickname 中的 header_nickname 对应 columns中的 "header_" + key -->
    <template v-slot:header_nickname="{ column, index }">
      <el-input v-model="queryForm1.formData.nickname" size="mini" placeholder="输入关键字搜索" @keyup.enter.native="search"></el-input>
    </template>
  </vk-data-table>
</template>
<script>
  export default {
    data() {
      // 页面数据变量
      return {
        // 查询表单开始
        queryForm1: {
          // 查询表单数据源，可在此设置默认值
          formData: {
            nickname: '',
          },
          columns: [
            // 实现昵称模糊查询
            {
              key: 'nickname',
              title: '昵称',
              type: 'text',
              width: 160,
              mode: '%%',
            },
          ],
        },
        // 查询表单结束 -----------------------------------------------------------
      };
    },
  };
</script>
```

右侧操作按钮的表头插槽

代码示例

```vue
<template>
  <vk-data-table>
    <!-- v-slot:header___operation 中的 header___operation 是固定的-->
    <template v-slot:header___operation="{ column, index }">
      <el-input v-model="queryForm1.formData.nickname" size="mini" placeholder="输入关键字搜索" @keyup.enter.native="search"></el-input>
    </template>
  </vk-data-table>
</template>
<script>
  export default {
    data() {
      // 页面数据变量
      return {
        // 查询表单开始
        queryForm1: {
          // 查询表单数据源，可在此设置默认值
          formData: {
            nickname: '',
          },
          columns: [
            // 实现昵称模糊查询
            {
              key: 'nickname',
              title: '昵称',
              type: 'text',
              width: 160,
              mode: '%%',
            },
          ],
        },
        // 查询表单结束 -----------------------------------------------------------
      };
    },
  };
</script>
```

## 万能表格搜索组件 @query

```vue
<!-- 表格搜索组件开始 -->
<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns" @search="search"></vk-data-table-query>
<!-- 表格搜索组件结束 -->

<!-- 表格组件开始 -->
<vk-data-table ...其他参数 :query-form-param="queryForm1" ...其他参数></vk-data-table>
<!-- 表格组件结束 -->
```

折叠抽屉弹窗模式

```vue
<vk-data-table-query ref="tableQuery1" v-model="queryForm1.formData" :columns="queryForm1.columns" :main-columns="['user_id', '_add_time']" @search="search"></vk-data-table-query>
```

```js
queryForm1: {
  // 查询表单数据源，可在此设置默认值
  formData: {

  },
  // 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
  columns: [
    { key: "nickname", title: "昵称", type: "text", width: 160, mode: "%%" },
    { key: "_add_time", title: "添加时间", type: "datetimerange", width: 400, mode: "[]" },
  ]
}
```

**搜索区域折叠**

当搜索字段较多时，可使用 `collapse-rows` 指定显示的行数，超出部分自动折叠，用户点击"展开/收起"按钮切换显示。

```vue
<vk-data-table-query
  v-model="queryForm1.formData"
  :columns="queryForm1.columns"
  :span="3"
  :collapse-rows="1"
  :collapse-default-expand="true"
  @search="search"
></vk-data-table-query>
```

```js
queryForm1: {
  formData: {},
  columns: [
    { key: 'nickname', title: '昵称', type: 'text', mode: '%%' },
    { key: 'status', title: '状态', type: 'select', mode: '=', data: [] },
    { key: '_add_time', title: '添加时间', type: 'datetimerange', span: 8, mode: '[]' },
  ]
}
```

**columns 中使用 span**

可在单个字段上设置 `span` 属性，控制该字段占多少栏（共 24 栏），优先级高于组件级 `span`。适合让时间范围等宽字段占据更多空间。

```js
columns: [
  { key: 'appid', title: 'AppID', type: 'text', mode: '%%' },
  { key: 'name', title: '应用名称', type: 'text', mode: '%%' },
  { key: '_add_time', title: '添加时间', type: 'datetimerange', span: 8, mode: '[]' },
];
```

### 组件属性@props@query-props

| 参数                    | 说明                                                                    | 类型               | 默认值   | 可选值                   |
| ----------------------- | ----------------------------------------------------------------------- | ------------------ | -------- | ------------------------ |
| v-model                 | 绑定查询表单数据源                                                      | Object             | -        | -                        |
| columns                 | 字段渲染规则                                                            | Array              | -        | [查看 columns](#columns) |
| size                    | 表单组件尺寸（继承自 element 的 size）                                  | String             | -        | medium / small / mini    |
| span                    | [1.24.1 新增] 字段栅格占位数（共 24 栏），列级未设置 span 时生效        | Number,String      | -        | 1-24                     |
| min-width               | [1.24.1 新增] 组件级字段最小宽度（单位 px），列级未设置 minWidth 时生效 | Number,String      | 200      | -                        |
| label-width             | 表单标签宽度，未设置时根据 span 自动计算标签宽度                        | Number,String      | -        | -                        |
| label-position          | 表单标签位置                                                            | String             | right    | left / right / top       |
| collapse-rows           | [1.24.1 新增] 搜索区域可折叠的行数阈值，超过此行数时显示展开/收起按钮   | Number,String      | -        | -                        |
| collapse-default-expand | [1.24.1 新增] 配合 `collapse-rows` 使用，是否默认展开                   | Boolean            | false    | true                     |
| show-reset              | 是否显示重置按钮                                                        | Boolean,String     | auto     | true / false / auto      |
| main-columns            | 在页面上直接显示的字段名数组，此值若不为空，则会显示高级搜索按钮        | Array              | -        | -                        |
| drawer                  | 高级搜索的抽屉弹窗的属性（详情见 element 的 drawer 文档）               | Object             | -        |
| search-text             | 搜索按钮的文本                                                          | String             | 搜索     | -                        |
| senior-search-text      | 高级搜索按钮的文本                                                      | String             | 高级搜索 | -                        |
| auto-search             | 选择型组件触发 change 时是否自动搜索                                    | Boolean            | true     | false                    |
| @search                 | 搜索按钮事件                                                            | Function           | -        | -                        |
| @reset                  | 重置按钮事件                                                            | Function           | -        | -                        |
| @collapse-change        | 搜索区域展开/收起状态变化时触发                                         | Function(expanded) | -        | -                        |

### columns@query-columns

queryForm1.columns 参数说明
columns 属性的写法与万能表单相似(但部分表单组件搜索不支持)

[万能表单文档](https://vkdoc.fsq.pub/admin/3/form.html)

| 参数          | 说明                                                            | 类型          | 默认值   | 可选值                   |
| ------------- | --------------------------------------------------------------- | ------------- | -------- | ------------------------ |
| key           | 键名                                                            | String        | 无       | -                        |
| title         | 标题                                                            | String        | 无       | -                        |
| type          | 组件类型                                                        | String        | 无       | -                        |
| width         | 组件宽度                                                        | Number        | 无       | -                        |
| minWidth      | [1.24.1 新增] 组件最小宽度（仅设置了 span 后才生效）            | Number        | 无       | -                        |
| span          | [1.24.1 新增] 字段栅格占位数（共 24 栏），优先级高于组件级 span | Number,String | 无       | 1-24                     |
| placeholder   | 输入前的提示                                                    | String        | -        | -                        |
| mode          | 查询模式                                                        | String        | =        | [查看 mode](#query-mode) |
| fieldName     | 数据库字段名称，默认=key 的值                                   | String        | key 的值 | -                        |
| lastWhereJson | 是否是连表后的 where 条件                                       | Boolean       | false    | true                     |
| hidden        | 是否隐藏该字段（规则依然生效，但不在页面中渲染此组件）          | Boolean       | false    | true                     |
| show          | 显示规则,page 代表显示在页面上，drawer 代表显示在高级搜索中     | Array         | ["page"] | ["page","drawer"]        |
| autoSearch    | 选择型组件触发 change 时是否自动搜索                            | Boolean       | true     | false                    |

### 自定义字段插槽@query-slot

每个搜索字段都支持自定义插槽，可以通过插槽完全自定义某个字段的渲染方式。

**插槽语法**

```vue
<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns" @search="search">
  <template v-slot:字段key="{ form, keyName }">
    <!-- 自定义组件 -->
  </template>
</vk-data-table-query>
```

**作用域参数**

| 参数    | 说明               | 类型   |
| ------- | ------------------ | ------ |
| form    | 整个表单数据源对象 | Object |
| keyName | 当前字段名         | String |

**使用示例**

```vue
<template>
  <vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns" @search="search">
    <!-- 自定义 nickname 字段的搜索组件 -->
    <template v-slot:nickname="{ form, keyName }">
      <el-input v-model="form[keyName]" placeholder="自定义搜索框" @keyup.enter.native="search"></el-input>
    </template>
  </vk-data-table-query>
</template>

<script>
  export default {
    data() {
      return {
        queryForm1: {
          formData: {},
          columns: [{ key: 'nickname', title: '昵称', type: 'text', mode: '%%' }],
        },
      };
    },
  };
</script>
```

### fieldName 参数的用处@query-fieldname

##### 如余额按金额范围查询@balance-range-query

```js
columns: [
  {
    key: 'balance1',
    title: '金额范围',
    type: 'money',
    width: 160,
    placeholder: '请输入最小金额',
    mode: '>=',
    fieldName: 'balance',
  },
  {
    key: 'balance2',
    title: '-',
    type: 'money',
    width: 160,
    placeholder: '请输入最大金额',
    mode: '<=',
    fieldName: 'balance',
  },
];
```

### lastWhereJson 参数的用处@query-lastWhereJson

**如 userInfo 是连表字段的 as 的值，想要根据 userInfo.mobile 进行查询**

```js
columns: [
  {
    key: 'mobile',
    title: '手机号',
    type: 'text',
    width: 160,
    mode: '=',
    fieldName: 'userInfo.mobile',
    lastWhereJson: true,
  },
];
```

### mode@query-mode

queryForm1.columns 中 mode 参数详情

| 值     | 说明                            |
| ------ | ------------------------------- |
| =      | 完全匹配                        |
| !=     | 不等于                          |
| %%     | 模糊匹配                        |
| %\*    | 以 xxx 开头                     |
| \*%    | 以 xxx 结尾                     |
| >      | 大于                            |
| >=     | 大于等于                        |
| <      | 小于                            |
| <=     | 小于等于                        |
| in     | 在数组里                        |
| nin    | 不在数组里                      |
| []     | 范围 arr[0] <= x <= arr[1]      |
| [)     | 范围 arr[0] <= x < arr[1]       |
| (]     | 范围 arr[0] < x <= arr[1]       |
| ()     | 范围 arr[0] < x < arr[1]        |
| custom | 声明此字段不自动参与 where 条件 |

### 特殊说明@special-notes

当 value 为以下值时，会有特殊效果。

| value 值             | 说明       |
| -------------------- | ---------- |
| `___empty-array___`  | 匹配空数组 |
| `___empty-object___` | 匹配空对象 |
| `___non-existent___` | 字段不存在 |
| `___existent___`     | 字段存在   |

**\_tips: 左右各 3 个下划线\_\_**

## 内置样式@builtin-styles

表格页面的主卡片样式，可直接使用以下 CSS 类名：

其中 `var(--border-radius)` 定义在 `/common/css/app.scss` 中

```css
/* 表格页面的主卡片 - 开始 */
.vk-page-card {
  background-color: #ffffff;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 15px;
  margin-bottom: 10px;
}

.vk-page-card:last-of-type {
  margin-bottom: 0;
}

.vk-page-search-card {
  padding-bottom: 5px;
}

.vk-page-card-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

/* 工具栏 */
.vk-page-card-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  justify-content: space-between;
}

/* 表格区域 */
.vk-page-card-table {
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  overflow: hidden;
}
/* 表格页面的主卡片 - 结束 */
```

**使用示例**

```vue
<view class="vk-page-card">
  <view class="vk-page-card-toolbar">
  <view class="vk-page-card-title">用户列表</view>
  <view class="vk-page-card-actions">
    <el-button type="primary" size="small" icon="el-icon-plus">添加用户</el-button>
    <el-button size="small" icon="el-icon-download">导出Excel</el-button>
  </view>
</view>
  <view class="vk-page-card-table">
    <vk-data-table :action="table1.action" :columns="table1.columns"></vk-data-table>
  </view>
</view>
```

## vk.baseDao.getTableData@query-getTableData

用法与 `vk.baseDao.selects` 基本相似，除了以下区别

1. 多了一个 data 参数 [data 参数介绍](#data-intro)
2. 有默认排序规则，默认以 `_add_time` 降序 [设置全局默认排序规则](#global-sort)
3. 参数 `getCount` 的值在无 `lastWhere` 或 `lastSortArr` 时，默认为 true，否则，默认为 false（兼顾性能和实用性）[getCount 说明](https://vkdoc.fsq.pub/client/uniCloud/db/selects.html#getcount)

[vk.baseDao.selects 万能连表文档](https://vkdoc.fsq.pub/client/uniCloud/db/selects.html)

### data 参数介绍@data-intro

`data` 参数的作用是让前端可以直接传查询条件和排序条件。同时为了控制安全性，`getTableData` 的 `whereJson` 参数可以设置强制 where 条件

**Ta 的优势是：**

- 1、条件查询很方便，且减少了很多代码量。
- 2、在云函数端写强制条件，不用担心用户看到不该看的数据。
- 3、代码结构比较清晰，容易阅读与理解。

| 参数      | 说明             | 类型   | 默认值 | 可选值 |
| --------- | ---------------- | ------ | ------ | ------ |
| pageIndex | 第几页           | Number | 1      | -      |
| pageSize  | 每页查询数量     | Number | -      | -      |
| formData  | 查询条件数据源   | Object | -      | -      |
| columns   | 查询条件字段规则 | Array  | -      | -      |
| sortRule  | 排序规则         | Array  | -      | -      |

### 云函数代码示例@cloud-function-example

```js
// 通常data是前端传过来的数据
let data = {
  pageIndex: 1,
  pageSize: 20,
  formData: {
    nickname: '张飞',
  },
  columns: [
    { key: 'nickname', title: '昵称', type: 'text', width: 160, mode: '%%' },
    {
      key: '_add_time',
      title: '添加时间',
      type: 'datetimerange',
      width: 400,
      mode: '[]',
    },
  ],
  sortRule: [{ name: '_add_time', type: 'desc' }],
};
// 上面的formData.nickname = "张飞"，且columns中的nickname的 mode为 "%%"，代表模糊搜索nickname字段包含张飞的数据

let dbName = '表名';
vk.baseDao.getTableData({
  dbName,
  data,
  // 强制where条件，比如这里设置了只能查询当前登录用户的数据
  whereJson: {
    user_id: uid,
  },
  // 强制字段显示规则
  fieldJson: {},
  // 默认排序规则
  sortArr: [],
  // 副表列表
  foreignDB: [],
  // 聚合结束后的where条件
  lastWhereJson: {},
});
```

### 设置全局默认排序规则@global-sort

在 `common/uni-config-center/vk-unicloud/index.js` 中

配置 `vk.db.unicloud.getTableData.sortArr`，可以设置 `vk.baseDao.getTableData` 全局默认排序规则

```js
"vk": {
  "db": {
    "unicloud": {
      "getTableData": {
        // vk.baseDao.getTableData 默认排序规则
        "sortArr": [
          { "name": "_add_time", "type": "desc" }
        ]
      }
    }
  }
}
```

sortArr 是一个数组，支持多个排序条件

sortArr 参数说明

| 参数 | 说明             | 类型   | 默认值      | 可选值       |
| ---- | ---------------- | ------ | ----------- | ------------ |
| name | 需要排序的字段名 | String | -           | -            |
| type | 排序类型         | String | asc（升序） | desc（降序） |

## 万能表格合计列的示例@show-summary

### 简单模式@simple-mode

```vue
<vk-data-table
  ...其他属性
  :show-summary="true"
  :total-option="[
    { key: '（此为table1.columns中key的值）', unit: '单位', type: 'number', precision: 2 },
    { key: 'balance', unit: '元', type: 'money', precision: 2 },
  ]"
></vk-data-table>
```

#### summary-method@summary-method

### 自定义模式@custom-mode

**自定义函数方法，如果想要自定义合计规则和样式，则需要使用 summary-method 属性进行自定义，代码如下**

```vue
<vk-data-table ...其他属性 :show-summary="true" :summary-method="summaryMethod"></vk-data-table>
```

```js
summaryMethod({ columns, data }) {
  const means = ['']; // 合计
  // 需要进行合计的字段
  let totalOption = [
    { key: 'money', 'unit': '元', type: "money" },
  ];
  for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
    let column = columns[columnIndex];
    if (columnIndex === 0) {
      means.push('合计');
    } else {
      let columnItem = vk.pubfn.getListItem(totalOption, "key", column.property);
      if (!columnItem) {
        continue;
      }
      let {
        precision = 2
      } = columnItem;
      const values = data.map(dataItem => Number(dataItem[column.property]));
      // 合计
      if (!values.every(value => isNaN(value))) {
        means[columnIndex] = values.reduce((prev, curr) => {
          const value = Number(curr);
          if (!isNaN(value)) {
            return prev + curr;
          } else {
            return prev;
          }
        }, 0);
        means[columnIndex] = vk.pubfn.toDecimal(means[columnIndex], precision);
        if (columnItem.type === "money") {
          // 金额字段的特殊处理
          let money = vk.pubfn.priceFilter(means[columnIndex]);
          means[columnIndex] = `<span style="color: red">${money}${columnItem.unit}</span>`;
        } else {
          means[columnIndex] = `<span style="color: red">${means[columnIndex]}${columnItem.unit}</span>`;
        }
      } else {
        // 如果不是数字类型,则直接为空
        means[columnIndex] = "";
      }
    }
  }
  return [means];
}
```

## 完整 CRUD 页面组装示例@full-crud-example

以下是一个完整的管理后台 CRUD 页面，展示 `vk-data-table` + `vk-data-table-query` + 统计卡片 + 自定义按钮的配置驱动模式。

### 页面结构

```vue
<template>
  <view class="page-body">
    <!-- 1. 统计卡片（可选） -->
    <stats-cards :items="statsItems" :stats="stats" />

    <!-- 2. 搜索区域 -->
    <vk-data-table-query
      v-model="queryForm1.formData"
      :columns="queryForm1.columns"
      @search="search"
    >
      <!-- 自定义插槽（可选） -->
      <template v-slot:time_filter>
        <!-- 自定义时间筛选 -->
      </template>
      <!-- 右侧按钮插槽（可选） -->
      <template slot="right-btns">
        <el-button type="success" size="small" icon="el-icon-plus">添加</el-button>
      </template>
    </vk-data-table-query>

    <!-- 3. 数据表格 -->
    <vk-data-table
      ref="table1"
      :action="table1.action"
      :columns="table1.columns"
      :query-form-param="queryForm1"
      :right-btns="['delete']"
      :custom-right-btns="table1.customRightBtns"
      :row-no="true"
      :pagination="true"
      :selection="true"
      @delete="deleteBtn"
      @selection-change="selectionChange"
    >
      <!-- 自定义列插槽 -->
      <template v-slot:status_text="{ row }">
        <el-tag :type="row.status_color || 'info'" size="small">
          {{ row.status_text || '未知' }}
        </el-tag>
      </template>
    </vk-data-table>
  </view>
</template>
```

### 数据配置

```js
export default {
  data() {
    return {
      // 统计数据
      stats: { total: 0, unused: 0, used: 0, expired: 0 },
      // 统计卡片配置
      statsItems: [
        { key: "total", label: "总数", color: "#303133" },
        { key: "unused", label: "未使用", color: "#67C23A" },
        { key: "used", label: "已使用", color: "#909399" },
        { key: "expired", label: "已过期", color: "#F56C6C" },
      ],
      // 表格配置
      table1: {
        // 云函数接口地址（动态模式）
        action: "admin/card/kh/getList",
        // 列配置
        columns: [
          // 基础文本列
          { key: "product_name", title: "产品名称", type: "text", width: 150 },
          // 自定义插槽列（slot: true）
          { key: "status_text", title: "状态", type: "text", width: 100, slot: true },
          // 时间列
          { key: "_add_time", title: "购买时间", type: "time", width: 180 },
          // 带默认值的列
          { key: "remark", title: "备注", type: "text", width: 200, defaultValue: "-" },
        ],
        // 自定义行操作按钮
        customRightBtns: [
          {
            title: "编辑",
            icon: "el-icon-edit",
            type: "primary",
            onClick: (item) => this.editBtn({ item }),
            show: () => true,
          },
          {
            title: "续费",
            icon: "el-icon-refresh",
            type: "warning",
            onClick: (item) => this.renewBtn({ item }),
            show: (item) => item.status === "active",
          },
        ],
      },
      // 搜索表单配置
      queryForm1: {
        formData: {},
        columns: [
          // 文本模糊搜索
          { key: "card_code", type: "text", title: "卡密", placeholder: "请输入卡密", mode: "%%", col: { span: 5 } },
          // 下拉精确搜索
          { key: "status_text", type: "select", title: "状态", placeholder: "选择状态", mode: "=",
            data: [
              { value: "未激活", label: "未激活" },
              { value: "使用中", label: "使用中" },
              { value: "已过期", label: "已过期" },
            ],
            col: { span: 2 },
          },
          // 自定义插槽搜索
          { key: "time_filter", type: "slot", title: "时间筛选", col: { span: 8 } },
        ],
      },
    };
  },
};
```

### 配置驱动的数据流

```
┌─────────────────────────────────────────────────────┐
│                    JSON 配置                         │
│                                                     │
│  table1.action     → 云函数地址                      │
│  table1.columns    → 表格列定义                      │
│  queryForm1.columns → 搜索表单定义                   │
│  statsItems        → 统计卡片定义                    │
│  customRightBtns   → 行操作按钮定义                  │
└────────────────────┬────────────────────────────────┘
                     │ 传入组件 props
                     ▼
┌─────────────────────────────────────────────────────┐
│  vk-data-table / vk-data-table-query                │
│                                                     │
│  action + formData + columns → 自动调云函数          │
│  columns 配置 → 自动渲染列（type/width/defaultValue）│
│  slot: true   → 走模板插槽自定义渲染                 │
│  mode         → 自动生成 where 查询条件              │
│  customRightBtns → 渲染行操作按钮                    │
└─────────────────────────────────────────────────────┘
```

### columns 配置速查

| 场景 | 配置 |
|---|---|
| 普通文本 | `{ key: "name", title: "名称", type: "text", width: 150 }` |
| 时间格式化 | `{ key: "_add_time", title: "时间", type: "time", width: 180 }` |
| 空值占位 | `{ key: "remark", title: "备注", type: "text", defaultValue: "-" }` |
| 自定义渲染 | `{ key: "status", title: "状态", type: "text", slot: true }` |
| 最小宽度自适应 | `{ key: "content", title: "内容", type: "text", minWidth: 200 }` |

### queryForm columns 配置速查

| 场景 | 配置 |
|---|---|
| 模糊搜索 | `{ key: "name", type: "text", title: "名称", mode: "%%" }` |
| 精确匹配 | `{ key: "status", type: "select", title: "状态", mode: "=", data: [...] }` |
| 时间范围 | `{ key: "_add_time", type: "datetimerange", title: "时间", mode: "[]" }` |
| 大于等于 | `{ key: "price", type: "money", title: "价格", mode: ">=" }` |
| 自定义插槽 | `{ key: "my_filter", type: "slot", title: "自定义" }` |
| 指定数据库字段 | `{ key: "mobile", type: "text", fieldName: "userInfo.mobile", mode: "=" }` |
| 栅格宽度 | `{ key: "name", type: "text", col: { span: 5 } }` |

### 字段顺序持久化

支持用户自定义列顺序并持久化到 localStorage：

```js
methods: {
  // 加载保存的字段顺序
  loadColumnOrder() {
    const savedOrder = uni.getStorageSync('table_columns_order');
    if (savedOrder && Array.isArray(savedOrder) && savedOrder.length > 0) {
      const currentColumns = this.table1.columns || [];
      const columnMap = {};
      currentColumns.forEach(col => { columnMap[col.key] = col; });

      const orderedColumns = [];
      savedOrder.forEach(key => {
        if (columnMap[key]) orderedColumns.push(columnMap[key]);
      });
      // 添加未在保存顺序中的新字段
      currentColumns.forEach(col => {
        if (!savedOrder.includes(col.key)) orderedColumns.push(col);
      });
      this.table1.columns = orderedColumns;
    }
  },
  // 保存字段顺序（在列拖拽排序回调中调用）
  saveColumnOrder() {
    const order = this.table1.columns.map(col => col.key);
    uni.setStorageSync('table_columns_order', order);
  },
}
```
