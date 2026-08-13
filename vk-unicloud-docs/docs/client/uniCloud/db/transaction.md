---
sidebarDepth: 0
---

# 使用事务

数据库事务是一组数据库操作的集合,这些操作要么全部成功,要么全部失败回滚。事务主要用于保证数据的一致性,特别是在涉及多个相关联的数据库操作时(如转账等场景)。

## 注意事项

**使用事务前请注意以下内容:**

1. 事务自带锁,因此需要注意事务操作时会对行进行锁定。
2. 事务开始后到提交或回滚之间的时间不能超过 10 秒,否则会报错。
3. 如果事务异常后没有执行回滚操作,虽然数据依然不会被改变,但这会导致这些行记录被锁定,大概会锁 1 分钟左右。
4. 带有事务的 vk.baseDao.add 方法不会执行自动建表操作。当在事务中操作不存在的表时,会直接抛出异常,必须确保表在事务开始前已存在。

**暂只有以下 API 支持事务**

1. vk.baseDao.add
2. vk.baseDao.findById
3. vk.baseDao.updateById
4. vk.baseDao.deleteById
5. vk.baseDao.updateAndReturn
6. vk.baseDao.setById

**提示**:若使用[扩展数据库](https://doc.dcloud.net.cn/uniCloud/ext-mongodb/intro.html),则全部数据库 API 都能支持事务,包含批量新增、批量修改、批量删除都能支持事务。

**事务隔离级别:**

- 读:ReadConcern.SNAPSHOT
- 写:WriteConcern.MAJORITY

[传送门 - MongoDB 事务隔离级别详细介绍](https://blog.csdn.net/zxwjx/article/details/106069585)

## 示例

### 两个账户之间进行转账的简易示例

```js
let { data = {}, userInfo, util, originalParam } = event;
let { customUtil, config, pubFun, vk, db, _ } = util;
let res = { code: 0, msg: '' };
// 业务逻辑开始-----------------------------------------------------------

// 开启事务
const transaction = await vk.baseDao.startTransaction();
try {
  let dbName = 'uni-id-users';
  let money = 100;

  // 先查询用户001的余额
  const user001 = await vk.baseDao.findById({
    db: transaction, // 本次数据库语句带上事务对象（重要，必须带上）
    dbName,
    id: '001',
  });

  // 检查余额是否足够
  if (user001.account_balance < money) {
    // 事务回滚
    return await vk.baseDao.rollbackTransaction({
      db: transaction,
      err: {
        code: -1,
        msg: '用户001账户余额不足',
        currentBalance: user001.account_balance,
      },
    });
  }

  // 给用户001减100余额
  let update1Res = await vk.baseDao.updateById({
    db: transaction, // 本次数据库语句带上事务对象（重要，必须带上）
    dbName,
    id: '001',
    dataJson: {
      account_balance: _.inc(money * -1),
    },
  });

  // 给用户002加100余额
  let update2Res = await vk.baseDao.updateById({
    db: transaction, // 本次数据库语句带上事务对象（重要，必须带上）
    dbName,
    id: '002',
    dataJson: {
      account_balance: _.inc(money),
    },
  });

  // 提交事务
  await transaction.commit();
  console.log(`transaction succeeded`);

  return {
    code: 0,
    msg: '转账成功',
  };
} catch (err) {
  // 事务回滚
  return await vk.baseDao.rollbackTransaction({
    db: transaction,
    err,
  });
}
// 业务逻辑结束-----------------------------------------------------------
```

### 简易模板

```js
// 开启事务
const transaction = await vk.baseDao.startTransaction();
try {
  // 这里写数据库语句

  // 提交事务
  await transaction.commit();
  console.log(`transaction succeeded`);
} catch (err) {
  // 事务回滚
  return await vk.baseDao.rollbackTransaction({
    db: transaction,
    err,
  });
}
```
