'use strict';
module.exports = {
  /**
   * 获取邀请链接
   * @url user/pub/getInviteLink 前端调用的url参数地址
   * @description 获取用户的邀请链接、邀请码和统计信息
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
        my_invite_code: true,
        invite_count: true,
        invite_total_consume: true  // 被邀请人累计消费积分
      }
    });
    
    if (!user) {
      return { code: -1, msg: '用户不存在' };
    }
    
    let inviteCode = user.my_invite_code;
    
    // 如果用户没有邀请码，自动生成
    if (!inviteCode) {
      const generateInviteCode = vk.require('service/invite/util/generateInviteCode');
      try {
        inviteCode = await generateInviteCode.generate(util);
        // 保存邀请码
        await vk.baseDao.updateById({
          dbName: 'uni-id-users',
          id: uid,
          dataJson: { my_invite_code: inviteCode }
        });
      } catch (err) {
        return { code: -1, msg: err.message || '邀请码生成失败' };
      }
    }
    
    // 获取邀请人数和累计消费积分
    const inviteCount = user.invite_count || 0;
    const totalConsumePoints = user.invite_total_consume || 0;
    
    // 获取返利阶梯配置
    const calculateRebateTier = vk.require('service/invite/util/calculateRebateTier');
    const config = await calculateRebateTier.getConfig(util);
    const tiers = config.tiers || calculateRebateTier.getDefaultTiers();
    
    // 计算当前阶梯和下一阶梯（按累计消费积分）
    const currentTier = calculateRebateTier.getTier(totalConsumePoints, tiers);
    const nextTier = calculateRebateTier.getNextTier(totalConsumePoints, tiers);
    
    // 生成邀请链接（只返回 hash 路由部分，前端根据当前入口拼接完整 URL）
    // 形如：#/pages/login/index?inviteCode=XXXXXX&tab=register
    const inviteLink = `#/pages/login/index?inviteCode=${inviteCode}&tab=register`;
    
    res.data = {
      inviteCode,
      inviteLink,
      inviteeCount: inviteCount,
      totalConsumePoints,  // 累计消费积分
      currentTier,
      nextTier
    };
    
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  }
};
