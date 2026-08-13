---
sidebarDepth: 0
---

# 2、代码块快捷提示

### 效果

#### 在 `script` 内输入 vk

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/3d2824ab-d034-48be-9fff-f49edde50921.png)

#### 在 `云函数` 内输入 dao.

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/fe965ad9-e9ed-44fc-ad0b-5bc286988e09.png)

#### 在 `template` 内输入 vk

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/7a8db184-f842-4576-baa5-bbae0f5cb52f.png)

### 安装代码快捷提示步骤

- 1、将下方代码 复制到 hbx 工具 - 代码块设置 - javascript 代码块

```js
// 将下方代码复制到 hbx 工具 - 代码块设置 - javascript代码块
{
  "发起云函数请求(常用形式)": {
   "prefix": "vk.callFunction",
   "body": [
       "vk.callFunction({",
       "\turl: '云函数路径',",
       "\ttitle:'请求中...',",
       "\tdata:{",
       "\t\t",
       "\t},",
       "\tsuccess:(data) => {",
       "\t\t$0",
       "\t}",
       "});"
    ],
    "triggerAssist": false,
    "description": "发起一个云函数请求"
  },
  "发起云函数请求(promise形式)": {
   "prefix": "vk.callFunction",
   "body": [
       "vk.callFunction({",
       "\turl: '云函数路径',",
       "\ttitle:'请求中...',",
       "\tdata:{",
       "\t\t",
       "\t},",
       "}).then((data) => {",
       "\t\t$0",
       "});"
    ],
    "triggerAssist": false,
    "description": "发起一个云函数请求"
  },
  "发起云函数请求(async/await形式)": {
   "prefix": "vk.callFunction",
   "body": [
       "let data = await vk.callFunction({",
       "\turl: '云函数路径',",
       "\ttitle:'请求中...',",
       "\tdata:{",
       "\t\t",
       "\t},",
       "});"
    ],
    "triggerAssist": false,
    "description": "发起一个云函数请求"
  },
  "vk.alert": {
   "prefix": "vk.alert",
   "body": [
      "vk.alert('$0');"
    ],
    "triggerAssist": false,
    "description": "弹出提示框"
  },
  "vk.confirm": {
   "prefix": "k.confirm",
   "body": [
      "vk.confirm('内容','提示','确定','取消',function(res){",
      "\tif(res.confirm){",
      "\t\t$0",
      "\t}",
      "});"
    ],
    "triggerAssist": false,
    "description": "弹出二次确认框"
  },
  "vk.toast": {
   "prefix": "vk.toast",
   "body": [
      "vk.toast('$0','none');"
    ],
    "triggerAssist": false,
    "description": "弹出toast提示"
  },
  "vk.navigateTo": {
   "prefix": "vk.navigateTo",
   "body": [
      "vk.navigateTo('$0');"
    ],
    "triggerAssist": false,
    "description": "页面跳转"
  },
  "vk.navigateBack": {
   "prefix": "vk.navigateBack",
   "body": [
      "vk.navigateBack();"
    ],
    "triggerAssist": false,
    "description": "页面返回"
  },
  "vk.reLaunch": {
   "prefix": "vk.reLaunch",
   "body": [
      "vk.reLaunch('$0');"
    ],
    "triggerAssist": false,
    "description": "关闭所有页面，打开到应用内的某个页面。"
  },
  "vk.getStorageSync": {
   "prefix": "vk.getStorageSync",
   "body": [
      "vk.getStorageSync(key$0);"
    ],
    "triggerAssist": false,
    "description": "获取前端本地缓存"
  },
  "vk.setStorageSync": {
   "prefix": "vk.setStorageSync",
   "body": [
      "vk.setStorageSync(key,data);"
    ],
    "triggerAssist": false,
    "description": "保存前端本地缓存"
  },
  "vk.removeStorageSync": {
   "prefix": "vk.removeStorageSync",
   "body": [
      "vk.removeStorageSync($0);"
    ],
    "triggerAssist": false,
    "description": "删除前端本地缓存"
  },
  "vk.clearStorageSync": {
   "prefix": "vk.clearStorageSync",
   "body": [
      "vk.clearStorageSync();"
    ],
    "triggerAssist": false,
    "description": "清空前端本地缓存"
  },
  "vk.getStorageInfoSync": {
   "prefix": "vk.getStorageInfoSync",
   "body": [
      "vk.getStorageInfoSync();"
    ],
    "triggerAssist": false,
    "description": "获取前端本地缓存信息"
  },
  "vk.globalDataCache.get": {
   "prefix": "vk.globalDataCache.get",
   "body": [
      "await vk.globalDataCache.get($0);"
    ],
    "triggerAssist": false,
    "description": "获取云函数全局缓存"
  },
  "vk.globalDataCache.set": {
   "prefix": "vk.globalDataCache.set",
   "body": [
      "await vk.globalDataCache.set(key$0, value, second);"
    ],
    "triggerAssist": false,
    "description": "设置云函数全局缓存"
  },
  "vk.globalDataCache.del": {
   "prefix": "vk.globalDataCache.del",
   "body": [
      "await vk.globalDataCache.del($0);"
    ],
    "triggerAssist": false,
    "description": "删除云函数全局缓存"
  },
  "vk.globalDataCache.clear": {
   "prefix": "k.globalDataCache.clear",
   "body": [
      "await vk.globalDataCache.clear($0);"
    ],
    "triggerAssist": false,
    "description": "清空云函数全局缓存"
  },
  "vk.globalDataCache.count": {
   "prefix": "vk.globalDataCache.count",
   "body": [
      "await vk.globalDataCache.count({$0});"
    ],
    "triggerAssist": false,
    "description": "获取云函数全局缓存总数"
  },
  "vk.pubfn.objectAssign": {
   "prefix": "vk.pubfn.objectAssign",
   "body": [
      "vk.pubfn.objectAssign(obj1, obj2);"
    ],
    "triggerAssist": false,
    "description": "将obj2的属性赋值给obj1"
  },
  "vk.pubfn.copyObject": {
   "prefix": "vk.pubfn.copyObject",
   "body": [
      "vk.pubfn.copyObject($0);"
    ],
    "triggerAssist": false,
    "description": "复制一份对象-解除对象映射关系（不支持克隆函数）"
  },
  "vk.pubfn.deepClone": {
   "prefix": "vk.pubfn.deepClone",
   "body": [
      "vk.pubfn.deepClone($0);"
    ],
    "triggerAssist": false,
    "description": "复制一份对象-解除对象映射关系（支持克隆函数）"
  },
  "vk.pubfn.arrayObjectGetArray": {
   "prefix": "vk.pubfn.arrayObjectGetArray",
   "body": [
      "vk.pubfn.arrayObjectGetArray($0);"
    ],
    "triggerAssist": false,
    "description": "从数组中提取指定字段形式成为新的数组"
  },
  "vk.pubfn.getCommonTime": {
   "prefix": "vk.pubfn.getCommonTime",
   "body": [
      "$0vk.pubfn.getCommonTime();"
    ],
    "triggerAssist": false,
    "description": "获取时间范围"
  },
  "vk.pubfn.getData": {
   "prefix": "vk.pubfn.getData",
   "body": [
      "vk.pubfn.getData(dataObj, name);$0"
    ],
    "triggerAssist": false,
    "description": "自动根据字符串路径获取对象中的值支持.和[] , 且任意一个值为undefined时,不会报错,会直接返回undefined"
  },
  "vk.pubfn.isNull": {
   "prefix": "vk.pubfn.isNull",
   "body": [
      "vk.pubfn.isNull($0)"
    ],
    "triggerAssist": false,
    "description": "检测参数是否为空"
  },
  "vk.pubfn.isNotNull": {
   "prefix": "vk.pubfn.isNotNull",
   "body": [
      "vk.pubfn.isNotNull($0)"
    ],
    "triggerAssist": false,
    "description": "检测参数是否不为空"
  },
  "vk.pubfn.isNullOne": {
   "prefix": "vk.pubfn.isNullOne",
   "body": [
      "vk.pubfn.isNullOne($0)"
    ],
    "triggerAssist": false,
    "description": "检测所有参数 - 是否至少有一个为空"
  },
  "vk.pubfn.isNullOneByObject": {
   "prefix": "vk.pubfn.isNullOneByObject",
   "body": [
      "vk.pubfn.isNullOneByObject($0);"
    ],
    "triggerAssist": false,
    "description": "检测整个对象是否没有一个属性是空值,如果有空值,则返回首个是空值的属性名"
  },
  "参数一个都不能为空检测": {
   "prefix": "qq.",
   "body": [
      "// 参数非空检测",
      "let nullKey = vk.pubfn.isNullOneByObject({ params1$0, params2 });",
      "if(nullKey) return { code:-1, msg:'参数 '+nullKey+' 不能为空' };"
    ],
    "triggerAssist": false,
    "description": "检测整个对象是否没有一个属性是空值,如果有空值,则返回首个是空值的属性名"
  },
  "vk.pubfn.isNullAll": {
   "prefix": "vk.pubfn.isNullAll",
   "body": [
      "vk.pubfn.isNullAll($0)"
    ],
    "triggerAssist": false,
    "description": "检测所有参数 - 是否全部为空"
  },
  "vk.pubfn.isNotNullAll": {
   "prefix": "vk.pubfn.isNotNullAll",
   "body": [
      "vk.pubfn.isNotNullAll($0)"
    ],
    "triggerAssist": false,
    "description": "检测所有参数 - 是否全部都不为空"
  },
  "vk.pubfn.isArray": {
   "prefix": "vk.pubfn.isArray",
   "body": [
      "vk.pubfn.isArray($0)"
    ],
    "triggerAssist": false,
    "description": "检测变量是否是数组类型"
  },
  "vk.pubfn.isObject": {
   "prefix": "vk.pubfn.isObject",
   "body": [
      "vk.pubfn.isObject($0)"
    ],
    "triggerAssist": false,
    "description": "检测变量是否是对象类型"
  },
  "vk.pubfn.getListItem": {
   "prefix": "vk.pubfn.getListItem",
   "body": [
      "vk.pubfn.getListItem(list, key, value);"
    ],
    "triggerAssist": false,
    "description": "获取对象数组中的某一个item,根据指定的键名和键值"
  },
  "vk.pubfn.getListIndex": {
   "prefix": "vk.pubfn.getListIndex",
   "body": [
      "vk.pubfn.getListIndex(list, key, value);"
    ],
    "triggerAssist": false,
    "description": "获取对象数组中某个元素的index,根据指定的键名和键值"
  },
  "vk.pubfn.getListItemIndex": {
   "prefix": "vk.pubfn.getListItemIndex",
   "body": [
      "vk.pubfn.getListItemIndex(list, key, value);"
    ],
    "triggerAssist": false,
    "description": "获取对象数组中某个元素的item和index,根据指定的键名和键值"
  },
  "vk.pubfn.arrayToJson": {
   "prefix": "vk.pubfn.arrayToJson",
   "body": [
      "vk.pubfn.arrayToJson(list, key);"
    ],
    "triggerAssist": false,
    "description": "数组转对象 - 将对象数组转成json"
  },
  "vk.pubfn.random": {
   "prefix": "vk.pubfn.random",
   "body": [
      "vk.pubfn.random($0);"
    ],
    "triggerAssist": false,
    "description": "产生指定位数的随机数(支持任意字符,默认纯数字)"
  },
  "vk.pubfn.hidden": {
   "prefix": "vk.pubfn.hidden",
   "body": [
      "vk.pubfn.hidden(str, first, last);"
    ],
    "triggerAssist": false,
    "description": "将手机号,账号等隐藏中间字段"
  },
  "vk.pubfn.checkArrayIntersection": {
   "prefix": "vk.pubfn.checkArrayIntersection",
   "body": [
      "vk.pubfn.checkArrayIntersection(arr1, arr2);"
    ],
    "triggerAssist": false,
    "description": "判断常量数组A是否至少有一个元素在常量数组B中存在(两数组有交集)"
  },
  "vk.pubfn.arrayToTree": {
   "prefix": "vk.pubfn.arrayToTree",
   "body": [
      "vk.pubfn.arrayToTree(treeData, treeProps);"
    ],
    "triggerAssist": false,
    "description": "数组结构转树形结构"
  },
  "vk.pubfn.treeToArray": {
   "prefix": "vk.pubfn.treeToArray",
   "body": [
      "vk.pubfn.treeToArray(treeData, treeProps);"
    ],
    "triggerAssist": false,
    "description": "树形结构转数组结构"
  },
  "vk.pubfn.createOrderNo": {
   "prefix": "vk.pubfn.createOrderNo",
   "body": [
      "vk.pubfn.createOrderNo();"
    ],
    "triggerAssist": false,
    "description": "产生订单号，不依赖数据库，高并发时性能高（理论上会重复，但概率非常非常低）"
  },
  "vk.pubfn.getCurrentPage": {
   "prefix": "vk.pubfn.getCurrentPage",
   "body": [
      "vk.pubfn.getCurrentPage();"
    ],
    "triggerAssist": false,
    "description": "获取当前页面实例"
  },
  "vk.pubfn.openForm": {
   "prefix": "vk.pubfn.openForm",
   "body": [
      "vk.pubfn.openForm('弹窗名',{ item })"
    ],
    "triggerAssist": false,
    "description": "打开弹窗"
  },
  "userDao.findById": {
   "prefix": "dao.",
   "body": [
      "await vk.daoCenter.userDao.findById(user_id$0);"
    ],
    "triggerAssist": false,
    "description": "获取用户信息"
  },

  "setTimeout": {
   "prefix": "qq.",
   "body": [
      "setTimeout(() => {",
      "\t$0",
      "}, 1000);"
    ],
    "triggerAssist": false,
    "description": "延迟执行"
  },
  "for循环": {
   "prefix": "qq.",
   "body": [
      "for(let i=0; i<list.length; i++){",
      "\tlet item = list[i];",
      "\t$0",
      "}"
    ],
    "triggerAssist": false,
    "description": "for循环"
  },
  "Array.map": {
   "prefix": "qq.",
   "body": [
      "list.map((item, index) => {",
      "\t$0",
      "});"
    ],
    "triggerAssist": false,
    "description": "数组遍历"
  },
  "splice": {
   "prefix": "qq.",
   "body": [
      "list.splice(index,1);"
    ],
    "triggerAssist": false,
    "description": "数组删除"
  },
  "try{...} catch(err){...}": {
   "prefix": "try",
   "body": [
      "try {",
      "\t$0",
      "}catch(err){",
      "\t",
      "}"
    ],
    "triggerAssist": false,
    "description": "try-catch"
  },
  "vk.baseDao.findById": {
   "prefix": "baseDao.findById",
   "body": [
      "let info = await vk.baseDao.findById({",
      "\tdbName:\"$0\",",
      "\tid:id,",
      "\tfieldJson:{}",
      "});"
    ],
    "triggerAssist": false,
    "description": "根据ID获取一条数据库数据"
  },
  "vk.baseDao.findByWhereJson": {
   "prefix": "baseDao.findByWhereJson",
   "body": [
      "let info = await vk.baseDao.findByWhereJson({",
      "\tdbName:\"$0\",",
      "\twhereJson:{",
      "\t\t",
      "\t},",
      "\tfieldJson:{}",
      "});"
    ],
    "triggerAssist": false,
    "description": "根据whereJson获取一条数据库数据"
  },
  "vk.baseDao.count": {
   "prefix": "baseDao.count",
   "body": [
      "res.num = await vk.baseDao.count({",
      "\tdbName:\"$0\",",
      "\twhereJson:{",
      "\t\t",
      "\t}",
      "});"
    ],
    "triggerAssist": false,
    "description": "count满足条件的数据库条数"
  },
  "vk.baseDao.update": {
   "prefix": "baseDao.update",
   "body": [
      "res.num = await vk.baseDao.update({",
      "\tdbName:\"$0\",",
      "\twhereJson:{",
      "\t\t",
      "\t},",
      "\tdataJson:{",
      "\t\t",
      "\t}",
      "});"
    ],
    "triggerAssist": false,
    "description": "修改满足条件的数据库数据"
  },
  "vk.baseDao.updateById": {
   "prefix": "baseDao.updateById",
   "body": [
      "let num = await vk.baseDao.updateById({",
      "\tdbName:\"$0\",",
      "\tid:_id,",
      "\tdataJson:{",
      "\t\t",
      "\t},",
      "\tgetUpdateData:false",
      "});"
    ],
    "triggerAssist": false,
    "description": "根据id修改数据库数据"
  },
  "vk.baseDao.select": {
   "prefix": "baseDao.select",
   "body": [
      "res = await vk.baseDao.select({",
      "\tdbName:\"$0\",",
      "\tpageIndex:1,",
      "\tpageSize:20,",
      "\twhereJson:{",
      "\t\t",
      "\t},",
      "\tfieldJson:{},",
      "\tsortArr:[{ \"name\":\"_id\", \"type\":\"desc\" }],",
      "});"
    ],
    "triggerAssist": false,
    "description": "根据条件获取数据库数据"
  },
  "vk.baseDao.selects(连表查询)": {
   "prefix": "baseDao.selects",
   "body": [
      "res = await vk.baseDao.selects({",
      "\tdbName:\"$0\",",
      "\tgetCount:false,",
      "\tpageIndex:1,",
      "\tpageSize:20,",
      "\t// 主表where条件",
      "\twhereJson:{",
      "\t\t",
      "\t},",
      "\t// 主表字段显示规则",
      "\tfieldJson:{},",
      "\t// 主表排序规则",
      "\tsortArr:[{ \"name\":\"_id\", \"type\":\"desc\" }],",
      "\t// 副表列表",
      "\tforeignDB:[",
      "\t\t{",
      "\t\t\tdbName:\"副表表名\",",
      "\t\t\tlocalKey:\"主表外键名\",",
      "\t\t\tforeignKey:\"副表外键名\",",
      "\t\t\tas:\"副表as字段\",",
      "\t\t\tlimit:1",
      "\t\t}",
      "\t]",
      "});"
    ],
    "triggerAssist": false,
    "description": "根据条件获取数据库数据(连表查询)"
  },
  "vk.baseDao.del": {
   "prefix": "baseDao.del",
   "body": [
      "let num = await vk.baseDao.del({",
      "\tdbName:\"$0\",",
      "\twhereJson:{",
      "\t\t",
      "\t}",
      "});"
    ],
    "triggerAssist": false,
    "description": "删除满足条件的数据库数据"
  },
  "vk.baseDao.deleteById": {
   "prefix": "baseDao.deleteById",
   "body": [
      "let num = await vk.baseDao.deleteById({",
      "\tdbName:\"$0\",",
      "\tid:_id",
      "});"
    ],
    "triggerAssist": false,
    "description": "根据ID删除数据库数据"
  },
  "vk.baseDao.add": {
   "prefix": "baseDao.add",
   "body": [
      "let num = await vk.baseDao.add({",
      "\tdbName:\"$0\",",
      "\tdataJson:{",
      "\t\t",
      "\t}",
      "});"
    ],
    "triggerAssist": false,
    "description": "添加数据库数据"
  },
  "vk.baseDao.adds": {
   "prefix": "baseDao.adds",
   "body": [
      "let num = await vk.baseDao.adds({",
      "\tdbName:\"$0\",",
      "\tdataJson:[",
      "\t\t",
      "\t]",
      "});"
    ],
    "triggerAssist": false,
    "description": "批量添加数据库数据"
  },
  "vk.baseDao.sample": {
   "prefix": "baseDao.sample",
   "body": [
      "let num = await vk.baseDao.sample({",
      "\tdbName:\"$0\",",
      "\tsize:1,",
      "\twhereJson:{",
      "\t\t",
      "\t}",
      "});"
    ],
    "triggerAssist": false,
    "description": "随机获取数据库数据"
  },
  "vk.baseDao.selects(树状结构)": {
   "prefix": "baseDao.selects(tree)",
   "body": [
      "res = await vk.baseDao.selects({",
      "\tdbName: \"opendb-admin-menus$0\",",
      "\tpageIndex: 1,",
      "\tpageSize: 500,",
      "\twhereJson:{",
      "\t\tenable: true,",
      "\t\tparent_id: null",
      "\t},",
      "\tsortArr: [{ name: \"sort\", type: \"asc\" }],",
      "\t// 树状结构参数",
      "\ttreeProps: {",
      "\t\tid: \"menu_id\",",          // 唯一标识字段，默认为 _id
      "\t\tparent_id: \"parent_id\",", // 父级标识字段，默认为 parent_id
      "\t\tchildren: \"children\",",   // 自定义返回的下级字段名，默认为 children
      "\t\tlevel: 3,",               // 查询返回的树的最大层级。超过设定层级的节点不会返回。默认10级，最大15，最小1
      "\t\tlimit: 500,",            // 每一级最大返回的数据。
      "\t\twhereJson: {",
      "\t\t\tenable: true",
      "\t\t}",
      "\t}",
      "});"
    ],
    "triggerAssist": false,
    "description": "获取数据并返回树状结构"
  },
  "vk.baseDao.selects(分组统计查询)": {
   "prefix": "baseDao.selects",
   "body": [
      "res = await vk.baseDao.selects({",
      "\tdbName: \"表名${0}\",",
      "\tpageIndex: 1,",
      "\tpageSize: 10,",
      "\t// 主表where条件",
      "\twhereJson: {",
      "\t\t",
      "\t},",
      "\tgroupJson: {",
      "\t\t_id: \"$\", // _id是分组id， $ 后面接字段名，如user_id字段进行分组",
      "\t\tuser_id: _.$.first(\"$\"), // $ 后面接字段名，如把user_id原样输出",
      "\t\tmoney: _.$.sum(\"$\"), // $ 后面接字段名，sum求和该字段",
      "\t},",
      "\tsortArr: [{ name: \"money\",type: \"desc\" }], // 对分组后的结果进行排序",
      "\t// 副表列表",
      "\tforeignDB: [{",
      "\t\tdbName: \"uni-id-users\",",
      "\t\tlocalKey: \"user_id\",",
      "\t\tforeignKey: \"_id\",",
      "\t\tas: \"userInfo\",",
      "\t\tlimit: 1",
      "\t\tfieldJson:{ token:false, password:false },",
      "\t}]",
      "});"
    ],
    "triggerAssist": false,
    "description": "分组统计查询"
  }
}

```

- 2、将下方代码 复制到 hbx 工具 - 代码块设置 - vue 代码块

```js
// 将下方代码复制到 hbx 工具 - 代码块设置 - vue代码块
{
  "$getData(data,key,defaultValue)": {
   "prefix": "$getData",
   "body": [
      "$getData(data, 'aa.aa', defaultValue)"
    ],
    "triggerAssist": false,
    "description": "智能获取对象属性数据"
  },
  "vk-data-table（万能表格）": {
    "body": [
      "<!-- 表格组件开始 -->",
      "<vk-data-table",
      "\tref=\"table1\"",
      "\t:action=\"table1.action\"",
      "\t:columns=\"table1.columns\"",
      "\t:query-form-param=\"queryForm1\"",
      "\t:right-btns=\"['detail_auto','update','delete']\"",
      "\t:selection=\"true\"",
      "\t:row-no=\"true\"",
      "\t:pagination=\"true\"",
      "\t@update=\"updateBtn\"",
      "\t@delete=\"deleteBtn\"",
      "\t@current-change=\"currentChange\"",
      "\t@selection-change=\"selectionChange\"",
      "></vk-data-table>",
      "<!-- 表格组件结束 -->"
    ],
    "prefix": "vk-data-table",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-dialog（弹窗表单）": {
    "body": [
      "<!-- 弹窗开始 -->",
      "<vk-data-dialog",
      "\tv-model=\"form1.props.show\"",
      "\ttitle=\"表单标题\"",
      "\twidth=\"600px\"",
      "\tmode=\"form\"",
      ">",
      "\t<vk-data-form",
      "\t\tref=\"form1\"",
      "\t\tv-model=\"form1.data\"",
      "\t\t:action=\"form1.props.action\"",
      "\t\t:columns=\"form1.props.columns\"",
      "\t\t:rules=\"form1.props.rules\"",
      "\t\t:form-type=\"form1.props.formType\"",
      "\t\t:loading.sync=\"form1.props.loading\"",
      "\t\t:auto-close=\"true\"",
      "\t\tlabel-width=\"140px\"",
      "\t\t@success=\"onFormSuccess\"",
      "\t></vk-data-form>",
      "</vk-data-dialog>",
      "<!-- 弹窗结束 -->"
    ],
    "prefix": "vk-data-dialog",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-dialog（普通弹窗）": {
    "body": [
      "<!-- 弹窗开始 -->",
      "<vk-data-dialog",
      "\tv-model=\"dialog.show\"",
      "\ttitle=\"标题\"",
      "\twidth=\"500px\"",
      "\ttop=\"14vh\"",
      "\t:close-on-click-modal=\"true\"",
      ">",
      "\t这里是自定义内容${0}",
      "\t<template v-slot:footer=\"{ close }\">",
      "\t\t<el-button @click=\"close\">取 消</el-button>",
      "\t\t<el-button type=\"primary\" @click=\"close\">确 定</el-button>",
      "\t</template>",
      "</vk-data-dialog>",
      "<!-- 弹窗结束 -->"
    ],
    "prefix": "vk-data-dialog",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-icon（图标）": {
    "body": [
      "<vk-data-icon name=\"${0}vk-icon-text\" size=\"30\"></vk-data-icon>"
    ],
    "prefix": "vk-data-icon",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-input（数字输入框）": {
    "body": [
      "<vk-data-input type=\"number\" v-model=\"form1.value\" width=\"300px\" placeholder=\"请输入数字\" :precision=\"0\"></vk-data-input>"
    ],
    "prefix": "vk-data-input",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-input（金额输入框）": {
    "body": [
      "<vk-data-input type=\"money\" v-model=\"form1.value\" width=\"300px\" placeholder=\"请输入金额\" :precision=\"2\"></vk-data-input>"
    ],
    "prefix": "vk-data-input",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-input（百分比输入框）": {
    "body": [
      "<vk-data-input type=\"percentage\" v-model=\"form1.value\" width=\"300px\" placeholder=\"请输入\" :precision=\"0\"></vk-data-input>"
    ],
    "prefix": "vk-data-input",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-input（折扣输入框）": {
    "body": [
      "<vk-data-input type=\"discount\" v-model=\"form1.value\" width=\"300px\" placeholder=\"请输入\" :precision=\"0\"></vk-data-input>"
    ],
    "prefix": "vk-data-input",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-input（步进器）": {
    "body": [
      "<vk-data-input type=\"number-box\" v-model=\"form1.value\" width=\"300px\" placeholder=\"请输入\" :precision=\"0\"></vk-data-input>"
    ],
    "prefix": "vk-data-input",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-input（多行文本）": {
    "body": [
      "<vk-data-input type=\"textarea\" v-model=\"form1.value\" width=\"300px\" placeholder=\"请输入\"></vk-data-input>"
    ],
    "prefix": "vk-data-input",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-input（单行文本）": {
    "body": [
      "<vk-data-input type=\"text\" v-model=\"form1.value\" width=\"300px\" placeholder=\"请输入\"></vk-data-input>"
    ],
    "prefix": "vk-data-input",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-input-address（地址）": {
    "body": [
      "<vk-data-input-address v-model=\"form1.address1\" placeholder=\"请选择省市区\" :level=\"3\"></vk-data-input-address>"
    ],
    "prefix": "vk-data-input-address",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-input-select（下拉选择）": {
    "body": [
      "<vk-data-input-select",
      "\tv-model=\"form1.value\"",
      "\t:localdata='[",
      "\t\t{ value:1, label:\"选项1\" },",
      "\t\t{ value:2, label:\"选项2\" }",
      "\t]'",
      "\tsize=\"small\"",
      "\tclearable",
      "\tplaceholder=\"请选择\"",
      "></vk-data-input-select>"
    ],
    "prefix": "vk-data-input-select",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-input-remote-select（远程选择）": {
    "body": [
      "<vk-data-input-remote-select",
      "\tv-model=\"form1.user_id\"",
      "\tplaceholder=\"请输入用户名\"",
      "\taction=\"admin/select/kh/user\"",
      "\twidth=\"300px\"",
      "></vk-data-input-remote-select>"
    ],
    "prefix": "vk-data-input-remote-select",
    "project": "uni-app",
    "scope": "source.vue.html"
  },
  "vk-data-upload（图片上传）": {
    "body": [
      "<vk-data-upload v-model=\"form1.images\" :limit=\"6\"></vk-data-upload>"
    ],
    "prefix": "vk-data-upload",
    "project": "uni-app",
    "scope": "source.vue.html"
  }

}

```
