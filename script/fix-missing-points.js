/**
 * 修复充值但积分未到账的问题
 * 
 * 使用方法：
 * 1. 在 uniCloud 控制台的云函数中创建一个临时云函数
 * 2. 复制此代码到云函数中
 * 3. 执行云函数，传入参数 { "action": "check" } 或 { "action": "fix" }
 */

'use strict';

exports.main = async (event, context) => {
  const db = uniCloud.database();
  const _ = db.command;
  
  const action = event.action || 'check'; // check 或 fix
  
  // 问题订单
  const problemOrders = [
    { trade_no: 'LD2601196MSIER', user_id: '6917fe40a6c61b2206102a4a' },
    { trade_no: 'LD260119TPT0X4', user_id: '6917fe40a6c61b2206102a4a' }
  ];
  
  const results = [];
  
  for (const order of problemOrders) {
    const { trade_no, user_id } = order;
    
    console.log(`\n=== ${action === 'fix' ? '修复' : '检查'}订单 ${trade_no} ===`);
    
    try {
      // 1. 查询充值订单信息
      const orderRes = await db.collection('vk-recharge-orders')
        .where({ trade_no })
        .get();
      
      const orderExists = orderRes.data && orderRes.data.length > 0;
      const orderInfo = orderExists ? orderRes.data[0] : null;
      
      // 2. 查询积分流水
      const logRes = await db.collection('vk-points-log')
        .where({ order_id: trade_no })
        .get();
      
      const logExists = logRes.data && logRes.data.length > 0;
      
      // 3. 查询用户当前积分
      const pointsRes = await db.collection('vk-user-points')
        .where({ user_id })
        .get();
      
      const pointsExists = pointsRes.data && pointsRes.data.length > 0;
      const userPoints = pointsExists ? pointsRes.data[0] : null;
      
      // 4. 查询支付状态（从第三方支付平台）
      let paymentStatus = null;
      try {
        // 注意：这里需要 vk 对象，在云函数中可能需要手动初始化
        // 暂时跳过，仅检查数据库状态
        paymentStatus = '无法查询（需要 vk 对象）';
      } catch (err) {
        paymentStatus = '查询失败: ' + err.message;
      }
      
      // 收集诊断信息
      const diagnosis = {
        trade_no,
        user_id,
        order_exists: orderExists,
        order_status: orderInfo ? orderInfo.status : null,
        order_points: orderInfo ? orderInfo.points : null,
        order_bonus: orderInfo ? orderInfo.bonus : null,
        order_package_name: orderInfo ? orderInfo.package_name : null,
        log_exists: logExists,
        log_count: logRes.data ? logRes.data.length : 0,
        points_account_exists: pointsExists,
        current_balance: userPoints ? userPoints.available_points : null,
        payment_status: paymentStatus
      };
      
      console.log('诊断信息:', JSON.stringify(diagnosis, null, 2));
      
      // 判断问题类型
      if (!orderExists) {
        results.push({
          ...diagnosis,
          problem: '订单记录不存在',
          can_fix: false,
          message: '无法修复：订单记录不存在，可能从未创建订单'
        });
        continue;
      }
      
      if (!pointsExists) {
        results.push({
          ...diagnosis,
          problem: '用户积分账户不存在',
          can_fix: false,
          message: '无法修复：用户积分账户不存在'
        });
        continue;
      }
      
      if (logExists) {
        results.push({
          ...diagnosis,
          problem: '无问题',
          can_fix: false,
          message: '积分流水已存在，订单已正常处理'
        });
        continue;
      }
      
      // 需要修复的情况：订单存在，积分账户存在，但流水不存在
      const points = orderInfo.points || 0;
      const bonus = orderInfo.bonus || 0;
      const totalPoints = points + bonus;
      
      if (totalPoints <= 0) {
        results.push({
          ...diagnosis,
          problem: '订单积分数量无效',
          can_fix: false,
          message: `无法修复：订单积分为 ${totalPoints}`
        });
        continue;
      }
      
      // 如果是检查模式，只报告问题
      if (action === 'check') {
        results.push({
          ...diagnosis,
          problem: '积分流水缺失',
          can_fix: true,
          message: `需要补充 ${totalPoints} 积分（基础${points} + 赠送${bonus}）`,
          fix_action: '执行 action=fix 进行修复'
        });
        continue;
      }
      
      // 修复模式：补充积分
      console.log(`准备补充积分: ${totalPoints} (基础${points} + 赠送${bonus})`);
      
      const transaction = await db.startTransaction();
      
      try {
        // 再次检查是否已有流水（防止并发）
        const recheckLog = await transaction.collection('vk-points-log')
          .where({ order_id: trade_no })
          .get();
        
        if (recheckLog.data && recheckLog.data.length > 0) {
          await transaction.rollback();
          results.push({
            ...diagnosis,
            status: 'skip',
            message: '并发检测：积分流水已存在'
          });
          continue;
        }
        
        // 计算新积分
        const newTotalPoints = userPoints.total_points + totalPoints;
        const newAvailablePoints = userPoints.available_points + totalPoints;
        
        // 插入积分流水
        let remark = `购买${orderInfo.package_name || '积分套餐'}`;
        if (bonus > 0) {
          remark += `，获得${totalPoints}积分（基础${points}+赠送${bonus}）`;
        } else {
          remark += `，获得${totalPoints}积分`;
        }
        remark += ' [系统补充]';
        
        await transaction.collection('vk-points-log').add({
          user_id,
          type: 'income',
          amount: totalPoints,
          balance: newAvailablePoints,
          source: 'recharge',
          order_id: trade_no,
          remark,
          _add_time: Date.now()
        });
        
        // 更新用户积分
        await transaction.collection('vk-user-points')
          .doc(userPoints._id)
          .update({
            total_points: newTotalPoints,
            available_points: newAvailablePoints,
            _update_time: Date.now()
          });
        
        // 更新订单状态
        await transaction.collection('vk-recharge-orders')
          .where({ trade_no })
          .update({
            status: 'success',
            _update_time: Date.now()
          });
        
        // 提交事务
        await transaction.commit();
        
        results.push({
          ...diagnosis,
          status: 'success',
          message: '积分补充成功',
          fixed_points: totalPoints,
          old_balance: userPoints.available_points,
          new_balance: newAvailablePoints
        });
        
        console.log(`✅ 订单 ${trade_no} 修复成功`);
        
      } catch (txErr) {
        await transaction.rollback();
        console.error(`订单 ${trade_no} 修复失败:`, txErr);
        results.push({
          ...diagnosis,
          status: 'error',
          message: '修复失败: ' + txErr.message
        });
      }
      
    } catch (err) {
      console.error(`处理订单 ${trade_no} 时出错:`, err);
      results.push({
        trade_no,
        status: 'error',
        message: err.message
      });
    }
  }
  
  return {
    code: 0,
    action,
    message: action === 'fix' ? '修复完成' : '检查完成',
    results
  };
};
