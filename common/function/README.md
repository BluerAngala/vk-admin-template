# common/function — 自定义公共函数

项目自定义的全局公共函数，通过 `vk.myfn.xxx()` 调用。

## 文件说明

| 文件 | 作用 |
|---|---|
| `myPubFunction.js` | 自定义公共函数入口，导出的对象可通过 `vk.myfn` 访问 |

## 使用方式

在 `app.config.js` 中引入：

```js
import myPubFunction from '@/common/function/myPubFunction.js'
export default {
  myfn: myPubFunction,
  // ...
}
```

在任意页面中调用：

```js
vk.myfn.test1({ key: 'value' })
```

## 添加新函数

在 `myPubFunction.js` 中添加：

```js
var myfn = {};

// 已有函数
myfn.test1 = function(obj = {}) {
  // ...
};

// 新增函数
myfn.myNewFunction = function(params) {
  // 业务逻辑
  return result;
};

export default myfn;
```

## 注意事项

- 函数内通过 `uni.vk` 获取 vk 实例
- 函数命名使用驼峰式（camelCase）
- 复杂业务逻辑建议拆分到独立文件，再在 `myPubFunction.js` 中统一导出
