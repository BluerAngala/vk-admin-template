'use strict';
module.exports = {
  /**
   * 获取返利历史记录
   * @url user/pub/getRebateHistory 前端调用的url参数地址
   * @description 获取用户的返利历史记录，支持分页
   * data 请求参数 说明
   * @param {Number} pageIndex 页码，默认1
   * @param {Number} pageSize 每页数量，默认10
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
    
    let { pageIndex = 1, pageSize = 10 } = data;
    
    // 参数校验
    pageIndex = Math.max(1, parseInt(pageIndex) || 1);
    pageSize = Math.min(50, Math.max(1, parseInt(pageSize) || 10));
    
    // 查询返利记录
    const result = await vk.baseDao.select({
      dbName: 'vk-invite-rebate-log',
      pageIndex,
      pageSize,
      whereJson: { inviter_id: uid },
      sortArr: [{ name: '_add_time', type: 'desc' }],
      fieldJson: {
        invitee_id: true,
        invitee_nickname: true,
        order_id: true,
        pay_amount: true,
        rebate_tier: true,
        rebate_rate: true,
        rebate_points: true,
        _add_time: true
      }
    });
    
    res.data = {
      rows: result.rows || [],
      total: result.total || 0,
      hasMore: result.hasMore || false,
      pageIndex,
      pageSize
    };
    
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  }
};
