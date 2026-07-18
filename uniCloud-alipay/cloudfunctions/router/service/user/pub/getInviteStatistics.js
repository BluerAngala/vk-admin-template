'use strict';
module.exports = {
  /**
   * 获取邀请统计信息
   * @url user/pub/getInviteStatistics 前端调用的url参数地址
   * @description 获取用户的邀请统计数据
   * res 返回参数说明
   * @param {Number} code 错误码，0表示成功
   * @param {String} msg 详细信息
   * @param {Object} data 返回数据
   */
  main: async (event) => {
    let { data = {}, userInfo, util, originalParam } = event;
    let { vk, db, _ } = util;
    let { uid } = data;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    
    // 需要登录
    if (!uid) {
      return { code: 401, msg: '请先登录' };
    }
    
    // 获取用户信息
    let user = await vk.baseDao.findById({
      dbName: 'uni-id-users',
      id: uid,
      fieldJson: {
        _id: true,
        invite_count: true,
        invite_total_consume: true  // 被邀请人累计消费积分
      }
    });
    
    if (!user) {
      return { code: -1, msg: '用户不存在' };
    }
    
    const inviteCount = user.invite_count || 0;
    const totalConsumePoints = user.invite_total_consume || 0;
    
    // 获取返利阶梯配置
    const calculateRebateTier = vk.require('service/invite/util/calculateRebateTier');
    const config = await calculateRebateTier.getConfig(util);
    const tiers = config.tiers || calculateRebateTier.getDefaultTiers();
    
    // 计算当前阶梯和下一阶梯（按累计消费积分）
    const currentTier = calculateRebateTier.getTier(totalConsumePoints, tiers);
    const nextTier = calculateRebateTier.getNextTier(totalConsumePoints, tiers);
    
    // 统计累计返利积分
    const totalRebateResult = await db.collection('vk-invite-rebate-log')
      .aggregate()
      .match({ inviter_id: uid })
      .group({
        _id: null,
        totalRebatePoints: db.command.aggregate.sum('$rebate_points')
      })
      .end();
    
    const totalRebatePoints = totalRebateResult.data && totalRebateResult.data[0] 
      ? totalRebateResult.data[0].totalRebatePoints 
      : 0;
    
    // 获取最近返利记录
    const recentRebates = await vk.baseDao.select({
      dbName: 'vk-invite-rebate-log',
      pageIndex: 1,
      pageSize: 5,
      whereJson: { inviter_id: uid },
      sortArr: [{ name: '_add_time', type: 'desc' }],
      fieldJson: {
        invitee_nickname: true,
        pay_amount: true,
        rebate_rate: true,
        rebate_points: true,
        _add_time: true
      }
    });
    
    res.data = {
      inviteeCount: inviteCount,
      totalRebatePoints,
      currentTier,
      nextTier,
      recentRebates: recentRebates.rows || []
    };
    
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  }
};
