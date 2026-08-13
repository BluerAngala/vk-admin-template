# 样式开发指南（vk-unicloud-admin）

## 基础规范

### 单位选择

```scss
/* rpx：响应式单位，750rpx = 屏幕宽度 */
.container {
  width: 750rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

/* px：固定单位，H5 环境使用 */
.container {
  width: 100%;
  padding: 20px;
  font-size: 14px;
}
```

**推荐**：管理后台使用 `px`，移动端页面使用 `rpx`。

### 样式隔离

```vue
<style lang="scss" scoped>
/* scoped 样式只作用于当前组件 */
.container {
  padding: 20px;
}
</style>
```

### 覆盖子组件样式

```vue
<style lang="scss" scoped>
/* 使用深度选择器 */
.parent ::v-deep .child-component {
  background: #fff;
}
</style>
```

## 颜色系统

### 主题色

```scss
/* 主色 */
$primary: #0891B2;
$primary-light: #ECFEFF;
$primary-dark: #0E7490;

/* 功能色 */
$success: #22C55E;
$warning: #F59E0B;
$danger: #EF4444;
$info: #3B82F6;

/* 中性色 */
$text-primary: #0F172A;
$text-regular: #334155;
$text-secondary: #64748B;
$text-placeholder: #94A3B8;

$border-color: #E2E8F0;
$background-color: #F8FAFC;
```

### 使用 CSS 变量（主题切换）

```scss
/* 定义变量 */
:root {
  --primary-color: #0891B2;
  --text-color: #0F172A;
  --bg-color: #F8FAFC;
}

/* 使用变量 */
.container {
  color: var(--text-color);
  background: var(--bg-color);
}
```

## 布局

### Flex 布局

```scss
/* 水平居中 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 两端对齐 */
.between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 等分布局 */
.equal {
  display: flex;
  
  .item {
    flex: 1;
  }
}
```

### 响应式布局

```scss
.container {
  padding: 24px;
}

@media screen and (max-width: 768px) {
  .container {
    padding: 16px;
  }
}

@media screen and (max-width: 480px) {
  .container {
    padding: 12px;
  }
}
```

## 表单样式

### 输入框

```scss
.input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  color: #0F172A;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  outline: none;
  
  &:focus {
    border-color: #0891B2;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
  }
  
  &::placeholder {
    color: #94A3B8;
  }
}
```

### 标签 + 输入框（左右布局）

```scss
.form-field {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  .label {
    width: 80px;
    text-align: right;
    margin-right: 12px;
    font-size: 14px;
    color: #334155;
  }
  
  .input {
    flex: 1;
  }
}
```

### 按钮

```scss
.btn-primary {
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #0891B2;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    background: #0E7490;
  }
  
  &:disabled {
    background: #CBD5E1;
    cursor: not-allowed;
  }
}

.btn-default {
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  color: #334155;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    border-color: #0891B2;
    color: #0891B2;
  }
}
```

## 表格样式

```scss
.table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
  }
  
  th {
    font-size: 13px;
    font-weight: 600;
    color: #64748B;
    background: #F8FAFC;
  }
  
  td {
    font-size: 14px;
    color: #334155;
  }
  
  tr:hover td {
    background: #F8FAFC;
  }
}
```

## 卡片样式

```scss
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #E2E8F0;
  }
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #0F172A;
  }
}
```

## 登录页面样式

```scss
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #F1F5F9;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}
```

## 动画

### 淡入动画

```scss
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease;
}
```

### 过渡效果

```scss
/* 颜色过渡 */
.btn {
  transition: all 0.2s ease;
}

/* 位移过渡 */
.slide-up {
  transform: translateY(0);
  transition: transform 0.3s ease;
  
  &.hidden {
    transform: translateY(-100%);
  }
}
```

## 常见问题

### 1. 样式不生效

检查：
- 是否使用了 `scoped` 但选择器不够具体
- 是否需要使用 `::v-deep` 深度选择器
- uni-app 组件样式是否被默认样式覆盖

### 2. 布局错乱

检查：
- 是否使用了不支持的 CSS 属性
- 是否混用了 `rpx` 和 `px`
- 是否考虑了安全区域

### 3. 主题切换失效

检查：
- CSS 变量是否正确定义
- 是否在正确的元素上设置变量
- 是否在 `App.vue` 中初始化主题
