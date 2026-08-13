---
sidebarDepth: 0
---

# 响应体规范

## 失败返回值

只要 `code` 不为 0，都属于失败，前端 `vk.callFunction` 会走 `fail` 回调，并自动执行 `vk.alert(msg);`

```json
{
  "code": -1,
  "msg": "兑换失败，积分不足"
}
```

## 成功返回值

只有 `code` 为 0，才代表成功，前端 `vk.callFunction` 才会走 `success` 回调

```json
{
  "code": 0,
  "msg": "兑换成功"
}
```

## 特殊意义的返回值

### 自动更新 vuex 内的 userInfo 缓存

当 `needUpdateUserInfo` 为 true，同时 `userInfo` 不为空，则自动更新 vuex 内的 userInfo 缓存

```json
{
  "code": 0,
  "msg": "兑换成功",
  "needUpdateUserInfo": true,
  "userInfo":{
    ...最新的用户信息
  }
}
```

### 自动更新前端 token

当 `vk_uni_token` 有值，且满足以下格式时，自动更新前端 token

```json
{
  "code": 0,
  "vk_uni_token": {
    "token": "xxxxxx", // token的值
    "tokenExpired": 1681818627000 // token的过期时间（时间戳）
  }
}
```
