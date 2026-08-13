# 24、array 可变数组子表单

**该组件可以很方便的操作数组字段的增删改查**

### 万能表单使用方式@form

#### 数组<对象>类型

应用场景：数组内的元素是对象类型。如`[{ a:1, b:true },{ a:2, b:false }]`

**效果图**

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/67cda695-e3f9-469f-9870-9f248b415400.png)

**代码**

```js
{
  key: "array", title: "数组<对象>类型", type: "array<object>", itemWidth: 260,
  showAdd: true,
  showClear: true,
  showSort: true,
  // 新增一行时,该行的默认值
  defaultValue: {
    switch: true,
    text1: ""
  },
  rightBtns: ['copy', 'delete'],
  // 每行每个字段对应的渲染规则
  columns: [{
      key: "text1",
      title: "昵称",
      type: "text",
      isUnique: true,
      rules: [
        { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
        { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: ["change", "blur"] }
      ]
    },
    {
      key: "number1",
      title: "数字",
      type: "number",
      rules: [
        { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
      ]
    },
    {
      key: "select1",
      title: "select类型",
      type: "select",
      data: [
        { value: 1, label: "选项1" },
        { value: 2, label: "选项2" }
      ],
      rules: [
        { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
      ],
      watch: ({ column, formData: row, index, value, $set }) => {
        // 此处演示根据选择的值动态改变text1的值
        $set("text1", `昵称${value}`);
      }
    },
    { key: "switch", title: "switch类型", type: "switch", width: 160 },
  ]
},
```

##### 删除前拦截@beforeremove

通过 `beforeRemove` 属性来控制删除前拦截

```js
{
  key: "array", title: "数组<对象>类型", type: "array<object>", itemWidth: 260,
  showAdd: true,
  showClear: false,
  showSort: true,
  // 新增一行时,该行的默认值
  defaultValue: {

  },
  rightBtns: ['copy', 'delete'],
  beforeRemove: ({ row, index, remove }) => {
    // 方式一
    this.$confirm('确认删除？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      remove();
    }).catch(() => {
      console.log("取消删除");
    });
    return false;

    // 方式二
    return new Promise((resolve, reject) => {
      this.$confirm('确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resolve(true);
      }).catch(() => {
        resolve(false);
      });
    });
  },
  // 每行每个字段对应的渲染规则
  columns: [{
      key: "text1",
      title: "昵称",
      type: "text",
      isUnique: true,
      rules: [
        { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
        { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: ["change", "blur"] }
      ]
    },
    {
      key: "number1",
      title: "数字",
      type: "number",
      rules: [
        { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
      ]
    }
  ]
},
```

#### 数组<字符串>类型

应用场景：数组内的元素是字符串类型，如`["1","2","3"]`

**效果图**

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/b63d52ba-cf9c-4053-ba2d-1a772118a526.png)

**代码**

```js
{ key: "array1", title: "数组<字符串>类型", type: "array<string>" },
```

#### 数组<数字>类型

应用场景：数组内的元素是字符串类型，如`[1,2,3]`

**效果图**

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/e0664a4e-16ea-453c-839b-89992d6fe90e.png)

**代码**

```js
{ key: "array2", title: "数组<数字>类型", type: "array<number>" },
```

#### array 嵌套 array

应用场景：该字段本身是对象数组字段，然后该数组内的对象内的字段还有数组字段时使用。

**效果图**

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/2b2f8736-254e-43fd-a403-9e5e91efabe3.png)

**代码**

```js
{
  key: "array", title: "数组<对象>类型", type: "array<object>", itemWidth: 260,
  showAdd: true,
  showClear: true,
  showSort: true,
  // 新增一行时,该行的默认值
  defaultValue: {
    switch: true,
    array: []
  },
  rightBtns: ['copy', 'delete'],
  // 每行每个字段对应的渲染规则
  columns: [
    {
      key: "text1", title: "昵称", type: "text",
      isUnique: true,
      rules: [
        { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
      ]
    },
    {
      key: "number1", title: "数字", type: "number",
      rules: [
        { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
      ]
    },
    { key: "switch", title: "switch类型", type: "switch", width: 160 },
    {
      key: "array", title: "数组<对象>类型", type: "array<object>",
      buttonText: "设置",
      dialog: true,
      width: 140,
      dialogWidth: 1000,
      showAdd: true,
      showClear: true,
      showSort: true,
      // 新增一行时,该行的默认值
      defaultValue: {

      },
      rightBtns: ['delete'],
      // 每行每个字段对应的渲染规则
      columns: [
        {
          key: "text1", title: "昵称", type: "text", minWidth: 160,
          isUnique: true,
          rules: [
            { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
          ]
        },
        {
          key: "number1", title: "数字", type: "number", minWidth: 160,
          rules: [
            { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
          ]
        }
      ]
    },
  ]
},
```

### API

### 公共属性@public

[点击查看『公共属性』](https://vkdoc.fsq.pub/admin/components/0%E3%80%81public.html)

### 组件属性@props

| 参数                   | 说明                                                     | 类型             | 默认值   | 可选值                                   |
| ---------------------- | -------------------------------------------------------- | ---------------- | -------- | ---------------------------------------- |
| columns                | 同万能表单                                               | Array            | -        | 和万能表单一致，同时多了一些参数，见下方 |
| itemWidth              | 每一项的固定宽度                                         | Number           | -        | -                                        |
| itemMinWidth           | 每一项的最小宽度                                         | Number           | -        | -                                        |
| addButtonText          | 添加按钮的文字                                           | String           | 新增     | -                                        |
| clearButtonText        | 清除按钮的文字                                           | String           | 清空     | -                                        |
| showAdd                | 是否显示添加按钮                                         | Boolean          | true     | false                                    |
| showClear              | 是否显示清除按钮                                         | Boolean          | true     | false                                    |
| showSort               | 是否显示排序按钮                                         | Boolean          | false    | true                                     |
| showDelete             | 是否显示删除按钮,array object 不支持,请用 rightBtns 控制 | Boolean          | true     | false                                    |
| emptyText              | 没有数据时显示的文字                                     | String           | 暂无数据 | -                                        |
| defaultValue           | 每一项的默认值                                           | Object、Function | -        | -                                        |
| rowKey                 | 每一项唯一索引值                                         | String           | \_index  | -                                        |
| columnIndexMethod      | 序号格式化方法                                           | String、Function | -        | -                                        |
| columnIndexWidth       | 序号显示的宽度                                           | Number           | 80       | -                                        |
| columnIndexLabel       | 序号显示的标题                                           | String           | #        | -                                        |
| rightBtns              | 右侧按钮显示列表                                         | Array            | -        | ['copy','delete']                        |
| leftFixed              | 序号、多选框是否固定在左侧                               | Boolean          | true     | false                                    |
| rightFixed             | 操作按钮是否固定在右侧                                   | Boolean          | true     | false                                    |
| maxlength              | 控制最大可添加的数量                                     | Number           | -        | -                                        |
| beforeRemove（1.21.0） | 删除前拦截，仅数组对象类型时生效 [传送门](#beforeremove) | Function         | -        | -                                        |

### columns 比万能表单新增的参数

| 参数         | 说明                                                                                                     | 类型                              | 默认值 | 可选值 |
| ------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------- | ------ | ------ |
| isUnique     | 是否在数组中唯一                                                                                         | Boolean                           | false  | true   |
| incMode      | 每行数据递增规则（只对数值类型有效）0 无规则 1 必须递增[>] 2 必须递增[>=] -1 必须递减[<] -2 必须递减[<=] | Number                            | -      | -      |
| allowRepeat  | 唯一值需要排除的，如[""] 排除空值                                                                        | Array                             | -      | -      |
| rules        | 该项的表单验证规则                                                                                       | Array                             | -      | -      |
| defaultValue | 该项的默认值                                                                                             | any                               | -      | -      |
| onChange     | 监听如 select 选项改变时触发的函数，部分组件不支持，推荐使用 watch 代替                                  | function(val, row, column, index) | -      | -      |
| watch        | 监听值改变时触发的函数                                                                                   | function(res)                     | -      | -      |

#### watch

```js
{
  key: "select1", title: "select类型", type: "select",
  data: [
    { value: 1, label: "选项1" },
    { value: 2, label: "选项2" }
  ],
  watch: ({ value, formData, column, index, $set }) => {
    // 此处演示根据选择的值动态改变text1的值
    $set("text1", `昵称${value}`);
  }
},
```

#### incMode

每行数据递增规则（只对数值类型有效）0 无规则 1 递增[>] 2 递增[>=] -1 递减[<] -2 递减[<=]

**效果图**

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/0751635c-5909-4003-8f66-158555114bfd.png)

**代码**

```js
{
  key: "array2", title: "数组<对象>类型", type: "array<object>", itemWidth: 260,
  showAdd: true,
  showClear: true,
  showSort: true,
  // 新增一行时,该行的默认值
  defaultValue: {
    switch: true,
    text1: ""
  },
  rightBtns: ['copy', 'delete'],
  // 每行每个字段对应的渲染规则
  columns: [
    {
      key: "number1", title: "递增[>]", type: "number", placeholder: "输入数字",
      incMode: 1, // 1必须递增[>] 2 必须递增[>=] -1 必须递减[<]  -2 必须递减[<=]
      rules: [
        { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
      ]
    },
    {
      key: "number2", title: "递增[>=]", type: "number", placeholder: "输入数字",
      incMode: 2, // 1必须递增[>] 2 必须递增[>=] -1 必须递减[<]  -2 必须递减[<=]
      rules: [
        { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
      ]
    },
    {
      key: "number3", title: "递减[<]", type: "number", placeholder: "输入数字",
      incMode: -1, // 1必须递增[>] 2 必须递增[>=] -1 必须递减[<]  -2 必须递减[<=]
      rules: [
        { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
      ]
    },
    {
      key: "number4", title: "递减[<=]", type: "number", placeholder: "输入数字",
      incMode: -2, // 1必须递增[>] 2 必须递增[>=] -1 必须递减[<]  -2 必须递减[<=]
      rules: [
        { required: true, message: "该项不能为空", trigger: ["change", "blur"] },
      ]
    },
  ]
},
```

#### 右侧按钮显示规则

可以动态控制右侧 【复制】【删除】按钮的显示和隐藏

**代码**

**一直显示**

```js
rightBtns: ['copy', 'delete'];
```

**动态显示和隐藏**

```js
rightBtns: [
  {
    mode: 'copy',
    title: '复制',
    show: (item, index) => {
      // 第一1个不显示
      return index > 0;
    },
  },
  {
    mode: 'delete',
    title: '删除',
    show: (item, index) => {
      // 第一1个不显示
      return index > 0;
    },
  },
];
```

### 万能表格使用方式@table

### 不支持

### template 使用方式@template

### 不支持
