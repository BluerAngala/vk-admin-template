/**
 * 检查用户积分脚本
 * 用户ID: 6917fe40a6c61b2206102a4a
 * 
 * 使用方法：
 * 1. 在 HBuilderX 中打开此文件
 * 2. 右键选择"运行云函数本地调试"或在 uniCloud 控制台执行
 * 
 * 或者直接在 uniCloud 控制台的"云数据库"中执行以下查询：
 */

const userId = '6917fe40a6c61b2206102a4a';

// ============ 在 uniCloud 控制台执行的查询语句 ============

// 1. 查询用户积分账户（vk-user-points 表）
const query1 = `
db.collection('vk-user-points')
  .where({ user_id: '${userId}' })
  .get()
`;

// 2. 查询用户积分流水记录（vk-points-log 表）- 按时间倒序
const query2 = `
db.collection('vk-points-log')
  .where({ user_id: '${userId}' })
  .orderBy('_add_time', 'desc')
  .limit(50)
  .get()
`;

// 3. 查询用户充值记录（只看 recharge 类型）
const query3 = `
db.collection('vk-points-log')
  .where({ 
    user_id: '${userId}',
    source: 'recharge'
  })
  .orderBy('_add_time', 'desc')
  .get()
`;

// 4. 统计用户积分收支汇总
const query4 = `
db.collection('vk-points-log')
  .aggregate()
  .match({ user_id: '${userId}' })
  .group({
    _id: '$type',
    total: $.sum('$amount'),
    count: $.sum(1)
  })
  .end()
`;

// 5. 查询用户基本信息（uni-id-users 表）
const query5 = `
db.collection('uni-id-users')
  .doc('${userId}')
  .field({ username: 1, nickname: 1, mobile: 1, score: 1, _add_time: 1 })
  .get()
`;

console.log('=== 请在 uniCloud 控制台依次执行以下查询 ===\n');
console.log('1. 查询用户积分账户：');
console.log(query1);
console.log('\n2. 查询积分流水记录：');
console.log(query2);
console.log('\n3. 查询充值记录：');
console.log(query3);
console.log('\n4. 统计收支汇总：');
console.log(query4);
console.log('\n5. 查询用户基本信息：');
console.log(query5);

module.exports = { userId, query1, query2, query3, query4, query5 };
