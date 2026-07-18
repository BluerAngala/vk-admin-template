'use strict';
/**
 * 获取公告数据（公共接口，无需登录）
 */
module.exports = {
  /**
   * 此函数名称
   * @url client/pub/getAnnouncement 前端调用的url参数地址
   */
  main: async (event) => {
    let { util } = event;
    let { db } = util;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    // 从 vk-global-data 表获取公告数据
    let dbRes = await db.collection('vk-global-data').where({ key: 'announcement' }).get();
    if (dbRes.data && dbRes.data.length > 0) {
      res.data = dbRes.data[0].value;
    } else {
      res.data = null;
    }
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  }
}
