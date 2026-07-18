/**
 * 排查充值但积分未到账问题
 * 订单号: LD2601196MSIER, LD260119TPT0X4
 * 用户ID: 6917fe40a6c61b2206102a4a
 * 
 * 在 uniCloud 控制台执行以下查询
 */

const userId = '6917fe40a6c61b2206102a4a';
const orderIds = ['LD2601196MSIER', 'LD260119TPT0X4'];

console.log('=== 排查充值但积分未到账问题 ===\n');

// 1. 查询充值订单表（vk-recharge-orders）
console.log('1. 查询充值订单记录：');
orderIds.forEach(orderId => {
  console.log(`
db.collection('vk-recharge-orders')
  .where({ trade_no: '${orderId}' })
  .get()
  `);
});

// 2. 查询积分流水表（vk-points-log）
console.log('\n2. 查询积分流水记录：');
orderIds.forEach(orderId => {
  console.log(`
db.collection('vk-points-log')
  .where({ order_id: '${orderId}' })
  .get()
  `);
});

// 3. 查询用户当前积分
console.log('\n3. 查询用户当前积分：');
console.log(`
db.collection('vk-user-points')
  .where({ user_id: '${userId}' })
  .get()
`);

// 4. 查询该用户所有充值记录
console.log('\n4. 查询该用户所有充值记录：');
console.log(`
db.collection('vk-points-log')
  .where({ 
    user_id: '${userId}',
    source: 'recharge'
  })
  .orderBy('_add_time', 'desc')
  .get()
`);

// 5. 查询该用户最近的所有积分流水
console.log('\n5. 查询该用户最近的所有积分流水：');
console.log(`
db.collection('vk-points-log')
  .where({ user_id: '${userId}' })
  .orderBy('_add_time', 'desc')
  .limit(20)
  .get()
`);

// 6. 检查订单是否存在但状态异常
console.log('\n6. 检查这两个订单的详细状态：');
console.log(`
db.collection('vk-recharge-orders')
  .where({ 
    trade_no: db.command.in(['${orderIds.join("', '")}'])
  })
  .get()
`);

// 7. 查询云函数日志（需要在云函数日志中搜索）
console.log('\n7. 在云函数日志中搜索关键词：');
orderIds.forEach(orderId => {
  console.log(`- ${orderId}`);
});
console.log('- checkPayment');
console.log('- addPoints');

console.log('\n8. 可能的问题场景：');
console.log('- 订单不存在：用户可能没有成功创建订单');
console.log('- 订单存在但状态为 failed：充值过程中出现错误');
console.log('- 订单存在但状态为 pending：支付查询失败或未完成');
console.log('- 流水不存在：addPoints 函数未被调用或调用失败');

module.exports = { userId, orderIds };

