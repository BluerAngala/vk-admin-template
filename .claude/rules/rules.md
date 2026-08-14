# 补充规则

主规则见 `AGENTS.md`，以下为补充。

## 代码规范

### 变量命名规范

- 普通变量命名使用驼峰命名法（如：userInfo）
- 数据库表的字段名使用全小写蛇形（下划线命名法）（如：user_id）
- 数据库表名使用 kebab-case（中划线命名法）（如：uni-id-users）

## 代码质量要求

### VK 框架响应结构

`vk.callFunction` 配合 `vk.baseDao.getTableData` 返回的数据**直接在顶层**，不在 `res.data` 里：

```javascript
// ❌ 错误
success: (res) => {
  if (res.data && res.data.rows) { ... }
}

// ✅ 正确（兼容两种结构）
success: (res) => {
  const rows = res.rows || (res.data && res.data.rows) || [];
}
```

VK 内部日志显示的结构即为 `success` 回调收到的结构：`{ code, rows, total, pagination, ... }`

### 安全性

- 表单验证（前端）
- 接口接收参数验证（后端）
