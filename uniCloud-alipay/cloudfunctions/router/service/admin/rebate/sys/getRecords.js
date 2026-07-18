'use strict';
module.exports = {
  /**
   * 获取返利记录列表
   * @url admin/rebate/sys/getRecords 前端调用的url参数地址
   * @description 获取返利记录列表，支持筛选和统计
   * data 请求参数 说明
   * @param {Number} pageIndex 页码，默认1
   * @param {Number} pageSize 每页数量，默认20
   * @param {String} inviter_id 邀请人ID（可选）
   * @param {String} invitee_id 被邀请人ID（可选）
   * @param {Number} start_time 开始时间戳（可选）
   * @param {Number} end_time 结束时间戳（可选）
   * @param {Number} min_amount 最小返利金额（可选）
   * @param {Number} max_amount 最大返利金额（可选）
   * res 返回参数说明
   * @param {Number} code 错误码，0表示成功
   * @param {String} msg 详细信息
   * @param {Object} data 返回数据
   */
  main: async (event) => {
    let { data = {}, userInfo, util, originalParam } = event;
    let { vk, db, _ } = util;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    
    let { 
      pageIndex = 1, 
      pageSize = 20,
      inviter_id,
      invitee_id,
      start_time,
      end_time,
      min_amount,
      max_amount
    } = data;
    
    // 参数校验
    pageIndex = Math.max(1, parseInt(pageIndex) || 1);
    pageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 20));
    
    // 构建查询条件
    let whereJson = {};
    
    if (inviter_id) {
      whereJson.inviter_id = inviter_id;
    }
    
    if (invitee_id) {
      whereJson.invitee_id = invitee_id;
    }
    
    // 时间范围筛选
    if (start_time || end_time) {
      whereJson._add_time = {};
      if (start_time) {
        whereJson._add_time = _.gte(start_time);
      }
      if (end_time) {
        if (start_time) {
          whereJson._add_time = _.and(_.gte(start_time), _.lte(end_time));
        } else {
          whereJson._add_time = _.lte(end_time);
        }
      }
    }
    
    // 返利金额范围筛选
    if (min_amount !== undefined || max_amount !== undefined) {
      if (min_amount !== undefined && max_amount !== undefined) {
        whereJson.rebate_points = _.and(_.gte(min_amount), _.lte(max_amount));
      } else if (min_amount !== undefined) {
        whereJson.rebate_points = _.gte(min_amount);
      } else {
        whereJson.rebate_points = _.lte(max_amount);
      }
    }
    
    // 查询返利记录
    const result = await vk.baseDao.select({
      dbName: 'vk-invite-rebate-log',
      pageIndex,
      pageSize,
      whereJson,
      sortArr: [{ name: '_add_time', type: 'desc' }]
    });
    
    // 统计汇总数据
    const statsResult = await db.collection('vk-invite-rebate-log')
      .aggregate()
      .match(whereJson)
      .group({
        _id: null,
        totalRebatePoints: db.command.aggregate.sum('$rebate_points'),
        totalPayAmount: db.command.aggregate.sum('$pay_amount'),
        totalCount: db.command.aggregate.sum(1)
      })
      .end();
    
    const stats = statsResult.data && statsResult.data[0] ? {
      totalRebatePoints: statsResult.data[0].totalRebatePoints || 0,
      totalPayAmount: statsResult.data[0].totalPayAmount || 0,
      totalCount: statsResult.data[0].totalCount || 0
    } : {
      totalRebatePoints: 0,
      totalPayAmount: 0,
      totalCount: 0
    };
    
    res.data = {
      rows: result.rows || [],
      total: result.total || 0,
      hasMore: result.hasMore || false,
      pageIndex,
      pageSize,
      stats
    };
    
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  }
};
