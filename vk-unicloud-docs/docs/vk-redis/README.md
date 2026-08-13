---
sidebarDepth: 0
---

# 什么是 Redis?

Redis 是现在最受欢迎的 NoSQL 数据库之一，Redis 是一个使用 ANSI C 编写的开源、包含多种数据结构、支持网络、基于内存、可选持久性的键值对存储数据库，其具备如下

### 特性

- 基于内存运行，性能高效
- 支持分布式，理论上可以无限扩展
- key-value 存储系统
- 开源的使用 ANSI C 语言编写、遵守 BSD 协议、支持网络、可基于内存亦可持久化的日志型、Key-Value 数据库，并提供多种语言的 API

### 特点

相比于其他数据库类型，Redis 具备的特点是：

- C/S 通讯模型
- 单进程单线程模型
- 丰富的数据类型
- 操作具有原子性
- 持久化
- 高并发读写
- 支持 lua 脚本

### 性能

下面是官方的 bench-mark 数据：

测试完成了 50 个并发执行 100000 个请求。

设置和获取的值是一个 256 字节字符串。

Linux box 是运行 Linux 2.6,这是 X3320 Xeon 2.5 ghz。

文本执行使用 loopback 接口(127.0.0.1)。

结果:读的速度是 110000 次/s,写的速度是 81000 次/s 。

### uniCloud 的 Redis 和 MongoDB 的比较

- 读写速度：MongoDB 数据存储在磁盘里，读写语法复杂，速度较慢。redis 在内存中读写，只根据 key 访问数据，速度快很多。
- 并发能力：MongoDB 并发能力有限。redis 几乎没有限制，更多取决于云函数的并发限制。
- 查询能力：MongoDB 支持所有查询语法，各种 where、联表。redis 只能根据 key 和有限语法操作数据。
- 计费：MongoDB 按读写次数收费。redis 虽然也收费，但无论写多少次读多少次，费用固定，在超过一定量的情况下，使用 redis 会大大降低成本，同时还能提升性能。

### redis 主要用来做什么?

- 云端全局缓存

- IP 白名单机制

- 秒杀活动记录库存

- 其他涉及高并发的场景

### 注意

- 使用腾讯云 node12 和 redis，务必仔细阅读此文档：[keepRunningAfterReturn](https://uniapp.dcloud.net.cn/uniCloud/cf-functions.html#keep-running)

### Q 群：22466457
