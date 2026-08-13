---
sidebarDepth: 0
---

# vuex 持久化（新版）

## 介绍

**什么是 vuex?**

`vuex` 可以用来做全局状态（数据）的管理。

**什么是持久化 vuex**

`持久化vuex` 是 `VK框架 `在 `vuex` 的基础上进行的深度封装，使 `vuex` 具有 `持久化储存`，需要先[配置 vuex](#vuex配置)

## vuex 配置

`vuex配置文件` 在根目录的 `store/modules` 目录下，每一个 `.js` 文件都是一个 `vuex模块`，如 `$user.js` 代表用户模块

文件内 `state` 下的属性就是该模块的变量

**注意：所有变量名必须提前声明，这样才能持久化储存。**

以 `$user.js` 模块为例，该模块声明下两个变量，分别是 `userInfo` 和 `permission`

```js
/**
 * vuex 用户状态管理模块
 */
let lifeData = uni.getStorageSync('lifeData') || {};

let $user = lifeData.$user || {};

export default {
  // 通过添加 namespaced: true 的方式使其成为带命名空间的模块
  namespaced: true,
  /**
   * vuex的基本数据，用来存储变量
   */
  state: {
    userInfo: $user.userInfo || {},
    permission: $user.permission || [],
  },
};
```

访问 userInfo 的代码为：`vk.getVuex('$user.userInfo')`

修改 userInfo 的代码为：`vk.setVuex('$user.userInfo', userInfo)`

修改 userInfo 的 avatar 的代码为：`vk.setVuex('$user.userInfo.avatar', avatar)`

目前有 2 种方式操作 vuex 数据

## 使用

### 方式一

如果只是获取或更新 Vuex 数据，推荐方式一的写法

```js
// 获取 Vuex 数据：
vk.getVuex('$user.userInfo');

// 更新 Vuex 数据：
vk.setVuex('$user.userInfo.avatar', avatar);
```

### 方式二

如果需要用到 `getters` `commit` `dispatch`，则用方式二写法（可以与方式一混用）

```js
// 获取 Vuex 数据：
vk.vuex.get('$user.userInfo');

// 更新 Vuex 数据：
vk.vuex.set('$user.userInfo.avatar', avatar);

// 获取 Vuex getters 数据：
vk.vuex.getters('$user/getUserInfo');

// 获取 Vuex getters 数据（带参数）：
vk.vuex.getters('$user/getUserInfo', data);

// 提交 Vuex mutations：
vk.vuex.commit('$user/addFootprint', data);

// 触发 Vuex actions：
vk.vuex.dispatch('$user/addFootprint', data);
```

**特殊说明**

`vk.getVuex('$user.userInfo.avatar')` 和 `vk.vuex.get('$user.userInfo.avatar')` 比 `vuex` 原生写法 `this.$store.state.$user.userInfo.avatar` 的优势

**优势一:**

原生写法当 `$user` 或 `$user.userInfo` 为 `undefined` 时，js 会报异常，从而会导致页面加载失败。

而使用 `vk.getVuex(key)` 或 `vk.vuex.get(key)`时，当某一级属性为`undefined`时，不会报异常，会直接返回空。（所以可以大胆这样写而不需要进行判断前面一级是否有值）

**优势二:**

原生写法获取到的值如果在外部赋值，严格模式下控制台会有黄色警告。

而使用 `vk.getVuex(key)` 或 `vk.vuex.get(key)`时则不会有警告。

## 常见问题

### vuex 模块文件地址保存在哪里？

/store/modules/

### 演示 vuex 功能示例页面：

/pages_template/vk-vuex/vk-vuex.vue

### 为什么新版本去除了全局混入的方式？

此处需重点说明

全局混入的方式虽然使用起来更加方便，但是会严重影响小程序端的渲染性能。

经过极端测试，若 1 个页面有 1000 个自定义组件（比如 1000 个 `u-button` 组件）

此时若 `vuex` 内的数据有 20kb，则这个页面的渲染数据达 1000\*20KB 接近 20MB，测试下来，渲染时间要 5 秒左右，严重影响小程序页面加载时间。

而使用新方案，则不会影响页面加载时间。

### 如何在 vue 页面监听 vuex 内的数据变化

代码示例

```js
watch: {
  "$store.state.$user.xxx": {
    deep: true, // 如果是对象，需要深度监听设置为 true
    handler: function(newVal, oldVal) {
      console.log(`数据发生变化啦，值从 ${oldVal} 变为 ${newVal}`);
    }
  }
},
```

完整示例代码

```vue
<template>
  <view class="app">
    <view>
      注意：需要先在/store/modules/$user.js文件的state内声明test变量，如:
      <text space="ensp">{{ tips }}</text>
    </view>
    <view style="margin-top: 10px;">
      <text>当前的 $user.test 值：</text>
      <text>{{ vk.getVuex('$user.test') }}</text>
    </view>
    <view>
      <button @click="vk.setVuex('$user.test', 1)">设置值为1</button>
      <button @click="vk.setVuex('$user.test', 2)">设置值为2</button>
      <button @click="vk.setVuex('$user.test', 3)">设置值为3</button>
    </view>
    <view v-if="watchStr" style="margin-top: 10px;">
      <text space="ensp">{{ watchStr }}</text>
    </view>
  </view>
</template>

<script>
  let vk = uni.vk;
  export default {
    data() {
      return {
        tips: `
				state: {
				  test: $user.test || ""
				}
			`,
        watchStr: '',
      };
    },
    onLoad(options) {
      vk = uni.vk;
    },
    methods: {},
    // 监听器
    watch: {
      '$store.state.$user.test': {
        deep: true, // 如果是对象，需要深度监听设置为 true
        handler: function (newVal, oldVal) {
          this.watchStr = `数据发生变化啦，值从 ${oldVal} 变为 ${newVal}`;
          console.log(this.watchStr);
        },
      },
    },
    // 计算属性
    computed: {},
  };
</script>

<style lang="scss" scoped>
  .app {
    padding: 15px;
    button {
      margin-top: 10px;
    }
  }
</style>
```

### 老版本 vuex 如何升级新版本 vuex

vuex 非框架必须集成，若你的 vuex 有很多页面在使用，可能升级起来比较复杂，也可选择不升级。

```js
`main.js`中

老版本
import storeUtil from './store/lib/index'
Vue.prototype.vk.init({
  Vue,               // Vue实例
  config,	     // 配置
  store : storeUtil, // vuex简写法则
});

新版本
Vue.prototype.vk.init({
  Vue,               // Vue实例
  config,	     // 配置
});

```

文件变动

```js
删除 /store/lib 目录
删除 /store/mixin 目录
```

代码变动

```js
vk.state('$user').userInfo.avatar;
改成
vk.getVuex('$user.userInfo.avatar'); 或 vk.vuex.get('$user.userInfo');

vk.vuex('$user.userInfo.avatar', avatar);
改成
vk.setVuex('$user.userInfo.avatar', avatar); 或 vk.vuex.set('$user.userInfo.avatar', avatar);

{{ $user.userInfo.avatar }}
改成
{{ vk.getVuex('$user.userInfo.avatar') }} 或 {{ vk.vuex.get('$user.userInfo.avatar') }}

```

### getters 内的属性如何带参数？

```js
getters: {
	getUserInfo: (state) => (a, b) => {
		console.log("参数", a, b);
		return state.userInfo;
	}
},
```

**template 内访问**

```vue
<text>{{ vk.vuex.getters('$user/getUserInfo', 1, 2) }}</text>
```

**js 内访问**

```js
vk.vuex.getters('$user/getUserInfo', 1, 2);
```
