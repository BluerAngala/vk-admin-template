---
sidebarDepth: 0
---

# 系统操作日志

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/25dc4a77-9a04-417c-8797-d6e11ed5d311.png)

## 页面路径

- /pages_plugs/system_uni/opendb-admin-log

## 相关云函数路径

- /router/service/admin/system_uni/admin-log/

## 功能介绍

记录某些敏感操作的操作日志

## 问题

### 如何添加日志？

通过中间件 `addAdminLog` 来添加日志

中间件文件地址：`router/middleware/modules/addAdminLog.js`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/09ac0d42-4d37-4270-8d22-3a1bb89dff47.png)
