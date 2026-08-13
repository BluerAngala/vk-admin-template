# uni-app 开发规范

## 与 Vue Web 的关键区别

**uni-app ≠ Vue Web**，以下写法会报错或显示异常：

### 标签替换

| ❌ 错误（Web） | ✅ 正确（uni-app） |
|---|---|
| `<div>` | `<view>` |
| `<span>`、`<p>`、`<h1>` | `<text>` |
| `<img>` | `<image>` |
| `<a href>` | `<view @click="navigateTo">` |
| `<input type="checkbox">` | `<checkbox-group>` + `<checkbox>` |
| `<input type="radio">` | `<radio-group>` + `<radio>` |
| `<select>` | `<picker>` |
| `<div style="overflow:auto">` | `<scroll-view scroll-y>` |

### 导航

```js
// ❌ 错误：vue-router
this.$router.push({ path: '/user', query: { id: '123' } })
this.$route.query.id

// ✅ 正确：uni-app
uni.navigateTo({ url: '/pages/user?id=123' })
```

### 存储

```js
// ❌ 错误：localStorage
localStorage.setItem('key', value)
localStorage.getItem('key')

// ✅ 正确：uni-app
uni.setStorageSync('key', value)
uni.getStorageSync('key')
```

### 生命周期

```js
// ❌ 错误：Vue 生命周期
export default {
  created() {},
  mounted() {}
}

// ✅ 正确：uni-app 页面生命周期
export default {
  onLoad(options) {
    // 页面加载，路由参数在这里
    const id = options.id
  },
  onShow() {
    // 页面显示
  },
  onReady() {
    // 首次渲染完成
  }
}
```

### CSS 单位

```css
/* ❌ 错误 */
.container { width: 100vw; font-size: 1rem; }

/* ✅ 正确 */
.container { width: 750rpx; font-size: 28rpx; }
```

### 样式

```scss
/* ❌ 错误：CSS 变量 */
.container {
  background: var(--primary-color);
}

/* ✅ 正确：固定值 */
.container {
  background: #0891B2;
}
```

## 模板示例

### ❌ 错误写法

```vue
<template>
  <div class="container">
    <h1>标题</h1>
    <p>内容</p>
    <img src="logo.png" />
    <button @click="submit">提交</button>
    <input type="checkbox" v-model="checked" />
  </div>
</template>
```

### ✅ 正确写法

```vue
<template>
  <view class="container">
    <text class="title">标题</text>
    <text class="content">内容</text>
    <image src="logo.png"></image>
    <view class="btn" @click="submit">
      <text>提交</text>
    </view>
    <checkbox-group @change="onCheck">
      <checkbox value="agree" :checked="checked" />
    </checkbox-group>
  </view>
</template>
```

## 平台差异处理

```vue
<!-- H5 独有 -->
<!-- #ifdef H5 -->
<div>H5 only</div>
<!-- #endif -->

<!-- 小程序独有 -->
<!-- #ifdef MP-WEIXIN -->
<view>微信小程序 only</view>
<!-- #endif -->

<!-- APP 独有 -->
<!-- #ifdef APP-PLUS -->
<view>APP only</view>
<!-- #endif -->
```

## 常见错误清单

开发前检查：
- [ ] 是否使用了 `<div>`、`<span>`、`<img>` 等原生标签？
- [ ] 是否使用了 CSS 变量 `var()`？
- [ ] 是否使用了 vue-router？
- [ ] 是否使用了 localStorage？
- [ ] 生命周期是否用了 `created`/`mounted`？
- [ ] CSS 单位是否用了 `rem`/`vh`/`vw`？

## 参考

- [uni-app 组件规范](https://uniapp.dcloud.net.cn/component/)
- [uni-app 生命周期](https://uniapp.dcloud.net.cn/tutorial/page.html#lifecycle)
