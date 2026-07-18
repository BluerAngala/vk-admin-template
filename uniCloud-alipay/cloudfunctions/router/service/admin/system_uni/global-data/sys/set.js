'use strict';
/**
 * 设置全局数据（管理员接口）
 */
module.exports = {
  /**
   * 此函数名称
   * @url admin/system_uni/global-data/sys/set 前端调用的url参数地址
   */
  main: async (event) => {
    let { data = {}, util } = event;
    let { db, vk } = util;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    let { key, value } = data;
    if (!key) {
      return { code: -1, msg: 'key不能为空' };
    }
    // 查询是否存在
    let existRes = await db.collection('vk-global-data').where({ key }).get();
    if (existRes.data && existRes.data.length > 0) {
      // 存在则更新
      await db.collection('vk-global-data').where({ key }).update({
        value: value,
        _add_time: Date.now()
      });
    } else {
      // 不存在则插入
      await db.collection('vk-global-data').add({
        key: key,
        value: value,
        _add_time: Date.now()
      });
    }
    res.msg = '保存成功';
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  }
}
