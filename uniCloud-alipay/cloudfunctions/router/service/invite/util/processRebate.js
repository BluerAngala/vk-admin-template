'use strict';
/**
 * 邀请返利处理工具函数（内部调用）
 * 仅供服务端内部调用，不对外暴露
 */
module.exports = {
  /**
   * 处理邀请返利
   * @param {Object} params - 参数对象
   * @param {String} params.inviteeId - 被邀请人ID（消费用户）
   * @param {String} params.orderId - 订单ID
   * @param {Number} params.payAmount - 消费积分数量
   * @param {Object} util - 工具对象
   * @returns {Promise<Object>} 处理结果
   */
  process: async (params, util) => {
    const { vk, db, _ } = util;
    const { inviteeId, orderId, payAmount } = params;
    
    // 参数校验
    if (!inviteeId || !orderId || !payAmount) {
      return { code: -1, msg: '参数不完整' };
    }
    
    if (payAmount <= 0) {
      return { code: -1, msg: '消费积分无效' };
    }
    
    // 获取被邀请人信息
    const invitee = await vk.baseDao.findById({
      dbName: 'uni-id-users',
      id: inviteeId,
      fieldJson: {
        _id: true,
        nickname: true,
        inviter_uid: true
      }
    });
    
    if (!invitee) {
      return { code: -1, msg: '用户不存在' };
    }
    
    // 检查是否有邀请人
    if (!invitee.inviter_uid || invitee.inviter_uid.length === 0) {
      return { code: 0, msg: '该用户无邀请人，跳过返利' };
    }
    
    // 获取直接邀请人ID（第一个）
    const inviterId = invitee.inviter_uid[0];
    
    // 获取邀请人信息
    const inviter = await vk.baseDao.findById({
      dbName: 'uni-id-users',
      id: inviterId,
      fieldJson: {
        _id: true,
        invite_count: true,
        invite_total_consume: true
      }
    });
    
    if (!inviter) {
      return { code: -1, msg: '邀请人不存在' };
    }
    
    // 获取返利配置
    const calculateRebateTier = vk.require('service/invite/util/calculateRebateTier');
    const config = await calculateRebateTier.getConfig(util);
    
    // 检查返利功能是否启用
    if (!config.enabled) {
      return { code: 0, msg: '返利功能未启用' };
    }
    
    const tiers = config.tiers || calculateRebateTier.getDefaultTiers();
    // 使用累计消费积分来确定阶梯（包含本次消费）
    const previousConsumePoints = inviter.invite_total_consume || 0;
    const newTotalConsumePoints = previousConsumePoints + payAmount;
    
    // 确定返利阶梯（用累加后的积分计算）
    const currentTier = calculateRebateTier.getTier(newTotalConsumePoints, tiers);
    
    if (!currentTier) {
      // 即使不返利，也要更新累计消费积分
      await db.collection('uni-id-users').doc(inviterId).update({
        invite_total_consume: _.inc(payAmount)
      });
      return { code: 0, msg: '累计消费积分未达到返利门槛' };
    }
    
    // 计算返利积分
    const rebatePoints = calculateRebateTier.calculateRebatePoints(payAmount, currentTier.rate);
    
    if (rebatePoints <= 0) {
      // 更新累计消费积分
      await db.collection('uni-id-users').doc(inviterId).update({
        invite_total_consume: _.inc(payAmount)
      });
      return { code: 0, msg: '返利积分为0，跳过' };
    }
    
    // 检查是否已经处理过该订单的返利（事务外检查，快速返回）
    const existRebate = await vk.baseDao.findByWhereJson({
      dbName: 'vk-invite-rebate-log',
      whereJson: { order_id: orderId }
    });
    
    if (existRebate) {
      return { code: 0, msg: '该订单已处理过返利' };
    }
    
    // 开始事务处理
    const transaction = await db.startTransaction();
    
    try {
      // 在事务中再次检查（防止并发重复处理）
      const existRebateInTx = await transaction.collection('vk-invite-rebate-log')
        .where({ order_id: orderId })
        .get();
      
      if (existRebateInTx.data && existRebateInTx.data.length > 0) {
        await transaction.rollback();
        return { code: 0, msg: '该订单已处理过返利（并发检测）' };
      }
      // 1. 给邀请人增加积分
      const pointsCollection = transaction.collection('vk-user-points');
      const userPointsDoc = await pointsCollection.where({ user_id: inviterId }).get();
      
      let previousBalance = 0;
      if (userPointsDoc.data && userPointsDoc.data.length > 0) {
        previousBalance = userPointsDoc.data[0].available_points || 0;
        await pointsCollection.where({ user_id: inviterId }).update({
          available_points: _.inc(rebatePoints)
        });
      } else {
        await pointsCollection.add({
          user_id: inviterId,
          available_points: rebatePoints,
          frozen_points: 0,
          total_points: rebatePoints,
          _add_time: Date.now()
        });
      }
      
      const newBalance = previousBalance + rebatePoints;
      
      // 2. 创建积分日志
      await transaction.collection('vk-points-log').add({
        user_id: inviterId,
        type: 'income',
        amount: rebatePoints,
        balance: newBalance,
        source: 'invite_rebate',
        order_id: orderId,
        remark: `邀请返利：${invitee.nickname || inviteeId} 消费 ${payAmount} 积分`,
        _add_time: Date.now()
      });
      
      // 3. 创建返利记录
      await transaction.collection('vk-invite-rebate-log').add({
        inviter_id: inviterId,
        invitee_id: inviteeId,
        invitee_nickname: invitee.nickname || '',
        order_id: orderId,
        pay_amount: payAmount,
        rebate_tier: currentTier.level,
        rebate_rate: currentTier.rate,
        rebate_points: rebatePoints,
        inviter_total_consume: newTotalConsumePoints,
        _add_time: Date.now()
      });
      
      // 4. 更新邀请人的累计消费积分
      await transaction.collection('uni-id-users').doc(inviterId).update({
        invite_total_consume: _.inc(payAmount)
      });
      
      // 提交事务
      await transaction.commit();
      
      return {
        code: 0,
        msg: '返利处理成功',
        data: {
          inviterId,
          rebatePoints,
          rebateTier: currentTier.level,
          rebateRate: currentTier.rate
        }
      };
      
    } catch (err) {
      await transaction.rollback();
      console.error('返利处理失败:', err);
      return { code: -1, msg: '返利处理失败：' + (err.message || '未知错误') };
    }
  }
};
