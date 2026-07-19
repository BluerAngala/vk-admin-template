/**
 * 积分系统相关函数
 */
const points = {};

/**
 * 计算购买卡密所需积分（基于产品）- 包量计费模式
 */
points.calculateProductPoints = function (
  product,
  validDays,
  count = 1,
  maxUseCount = 1,
  options = {}
) {
  if (!product || !product.base_price) {
    return 0;
  }

  let basePrice = product.base_price;

  // 特殊价格逻辑
  const { userId, totalMachines } = options;
  if (userId && totalMachines !== undefined) {
    const specialPriceUserIds = product.special_price_user_ids || [];
    const isSpecialPriceUser =
      Array.isArray(specialPriceUserIds) &&
      specialPriceUserIds.length > 0 &&
      specialPriceUserIds.includes(userId);

    if (isSpecialPriceUser && totalMachines <= 1000) {
      // 使用产品配置的特殊价格，默认为1
      basePrice = product.special_price || 1;
    }
  }

  const machinePrice = basePrice * maxUseCount;
  let months = validDays === 365 ? 12 : Math.ceil(validDays / 30);
  const totalPoints = Math.ceil(machinePrice * months * count);

  if (options.debug) {
    console.log("=== calculateProductPoints 详细计算 ===");
    console.log("产品ID:", product.product_id);
    console.log("基础价格:", basePrice, "机器数:", maxUseCount, "月数:", months);
    console.log("最终积分:", totalPoints);
  }

  return totalPoints;
};

/**
 * 获取用户绑定机器总数
 */
points.getUserTotalMachines = async function (vk, db, userId) {
  if (!userId) return 0;

  const now = Date.now();
  const cards = await db
    .collection("vk-card-key")
    .where({
      buy_user_id: userId,
      activate_time: db.command.gt(0),
    })
    .get();

  let totalMachines = 0;
  if (cards.data && cards.data.length > 0) {
    cards.data.forEach((card) => {
      const isExpired =
        (card.limit_days !== -1 && card.expire_time < now) ||
        (card.total_times !== -1 && card.remaining_times <= 0);
      if (!isExpired) {
        totalMachines += card.max_machine_count !== -1 ? card.max_machine_count : 0;
      }
    });
  }

  return totalMachines;
};

/**
 * 获取产品信息
 */
points.getProduct = async function (vk, productIdOrObj) {
  const dbName = "vk-products";
  let whereJson = { status: 1 };

  if (typeof productIdOrObj === "string") {
    whereJson.product_id = productIdOrObj;
  } else if (productIdOrObj && typeof productIdOrObj === "object") {
    if (productIdOrObj.product_id) whereJson.product_id = productIdOrObj.product_id;
    if (productIdOrObj.product_name) whereJson.product_name = productIdOrObj.product_name;
  } else {
    return null;
  }

  const res = await vk.baseDao.selects({ dbName, whereJson });

  let records = [];
  if (Array.isArray(res)) records = res;
  else if (res && res.rows) records = res.rows;
  else if (res && res.data) records = res.data;

  return records && records.length > 0 ? records[0] : null;
};

/**
 * 查询用户积分余额（如果不存在则自动创建）
 */
points.getPointsBalance = async function (vk, userId) {
  const dbName = "vk-user-points";
  const res = await vk.baseDao.selects({ dbName, whereJson: { user_id: userId } });

  let records = [];
  if (Array.isArray(res)) records = res;
  else if (res && res.rows) records = res.rows;
  else if (res && res.data) records = res.data;

  if (records && records.length > 0) {
    // 检查管理员积分
    const userRes = await vk.baseDao.selects({
      dbName: "uni-id-users",
      whereJson: { _id: userId },
    });

    let userRecords = [];
    if (Array.isArray(userRes)) userRecords = userRes;
    else if (userRes && userRes.rows) userRecords = userRes.rows;
    else if (userRes && userRes.data) userRecords = userRes.data;

    const isAdmin =
      userRecords &&
      userRecords.length > 0 &&
      userRecords[0].role &&
      Array.isArray(userRecords[0].role) &&
      userRecords[0].role.includes("admin");

    if (isAdmin && records[0].available_points < 99999999) {
      const adminPoints = 99999999;
      try {
        await vk.baseDao.update({
          dbName,
          whereJson: { user_id: userId },
          dataJson: {
            total_points: adminPoints,
            available_points: adminPoints,
            _update_time: Date.now(),
          },
        });
        return { ...records[0], total_points: adminPoints, available_points: adminPoints };
      } catch (err) {
        console.error("更新管理员积分失败：", err);
      }
    }

    return records[0];
  }

  // 创建新账户
  const userRes = await vk.baseDao.selects({
    dbName: "uni-id-users",
    whereJson: { _id: userId },
  });

  let userRecords = [];
  if (Array.isArray(userRes)) userRecords = userRes;
  else if (userRes && userRes.rows) userRecords = userRes.rows;
  else if (userRes && userRes.data) userRecords = userRes.data;

  const isAdmin =
    userRecords &&
    userRecords.length > 0 &&
    userRecords[0].role &&
    Array.isArray(userRecords[0].role) &&
    userRecords[0].role.includes("admin");

  const defaultPoints = isAdmin ? 99999999 : 0;

  const newAccount = {
    user_id: userId,
    total_points: defaultPoints,
    available_points: defaultPoints,
    frozen_points: 0,
    consumed_points: 0,
    _add_time: Date.now(),
  };

  try {
    await vk.baseDao.add({ dbName, dataJson: newAccount });
  } catch (err) {
    console.error("创建积分账户失败：", err);
  }

  return newAccount;
};

/**
 * 初始化用户积分账户
 */
points.initUserPoints = async function (vk, userId) {
  const dbName = "vk-user-points";

  const res = await vk.baseDao.selects({ dbName, whereJson: { user_id: userId } });

  let existing = [];
  if (Array.isArray(res)) existing = res;
  else if (res && res.rows) existing = res.rows;
  else if (res && res.data) existing = res.data;

  if (existing && existing.length > 0) return existing[0];

  const userRes = await vk.baseDao.selects({
    dbName: "uni-id-users",
    whereJson: { _id: userId },
  });

  let userRecords = [];
  if (Array.isArray(userRes)) userRecords = userRes;
  else if (userRes && userRes.rows) userRecords = userRes.rows;
  else if (userRes && userRes.data) userRecords = userRes.data;

  const isAdmin =
    userRecords &&
    userRecords.length > 0 &&
    userRecords[0].role &&
    Array.isArray(userRecords[0].role) &&
    userRecords[0].role.includes("admin");

  const defaultPoints = isAdmin ? 99999999 : 0;

  const addRes = await vk.baseDao.add({
    dbName,
    dataJson: {
      user_id: userId,
      total_points: defaultPoints,
      available_points: defaultPoints,
      frozen_points: 0,
      consumed_points: 0,
      _add_time: Date.now(),
      _update_time: Date.now(),
    },
  });

  return {
    _id: addRes.id,
    user_id: userId,
    total_points: defaultPoints,
    available_points: defaultPoints,
    frozen_points: 0,
    consumed_points: 0,
  };
};

/**
 * 增加用户积分
 */
points.addPoints = async function (vk, userId, amount, source, remark, orderId = "", cardId = "") {
  const dbName = "vk-user-points";
  const logDbName = "vk-points-log";
  const db = vk.database();

  // 如果有订单号，先检查是否已经处理过（防止重复充值）
  if (orderId) {
    // 全局检查:同一 order_id+source 只能上一次分(防跨用户复用)
    const globalExist = await vk.baseDao.selects({
      dbName: logDbName,
      whereJson: { order_id: orderId, source: source }
    });
    let globalRecords = [];
    if (Array.isArray(globalExist)) globalRecords = globalExist;
    else if (globalExist && globalExist.rows) globalRecords = globalExist.rows;
    else if (globalExist && globalExist.data) globalRecords = globalExist.data;

    if (globalRecords && globalRecords.length > 0) {
      // 如果是同一用户，返回幂等；如果是不同用户，拒绝
      const isSameUser = globalRecords.some(r => r.user_id === userId);
      if (isSameUser) {
        console.log(`订单 ${orderId} 已处理过，跳过重复充值`);
        const balance = await points.getPointsBalance(vk, userId);
        return { success: true, balance: balance.available_points, duplicate: true };
      } else {
        console.warn(`订单 ${orderId} 已被其他用户使用，拒绝充值`);
        return { success: false, message: "该订单已被使用" };
      }
    }
  }

  await points.initUserPoints(vk, userId);

  const selectResult = await vk.baseDao.selects({ dbName, whereJson: { user_id: userId } });

  let records = [];
  if (Array.isArray(selectResult)) records = selectResult;
  else if (selectResult && selectResult.rows) records = selectResult.rows;
  else if (selectResult && selectResult.data) records = selectResult.data;

  if (!records || records.length === 0) {
    return { success: false, message: "积分账户不存在" };
  }

  const currentRecord = records[0];
  const newTotalPoints = currentRecord.total_points + amount;
  const newAvailablePoints = currentRecord.available_points + amount;

  // 事务:日志+余额原子写入
  const transaction = await db.startTransaction();
  try {
    const logData = {
      user_id: userId,
      type: amount > 0 ? "income" : "expense",
      amount: amount,
      balance: newAvailablePoints,
      source: source,
      card_id: cardId,
      remark: remark,
      _add_time: Date.now(),
    };
    if (orderId) logData.order_id = orderId;
    await transaction.collection(logDbName).add(logData);

    const updateRes = await transaction.collection(dbName)
      .where({ user_id: userId, available_points: currentRecord.available_points })
      .update({
        total_points: newTotalPoints,
        available_points: newAvailablePoints,
        _update_time: Date.now(),
      });

    if (updateRes.updated === 0) {
      await transaction.rollback();
      return { success: false, message: "积分余额已变化，请刷新后重试" };
    }

    await transaction.commit();
    console.log(`积分充值成功：用户=${userId}, 金额=${amount}, 订单=${orderId}, 新余额=${newAvailablePoints}`);
    return { success: true, balance: newAvailablePoints };

  } catch (err) {
    await transaction.rollback();
    console.error(`积分充值失败：用户=${userId}, 金额=${amount}, 订单=${orderId}`, err);
    return { success: false, message: err.message || "积分充值失败" };
  }
};

/**
 * 扣除用户积分
 */
points.consumePoints = async function (vk, userId, amount, source, remark, orderId = "", cardId = "") {
  const dbName = "vk-user-points";
  const logDbName = "vk-points-log";
  const db = vk.database();

  // 如果有订单号，先检查是否已经处理过（防止重复扣除）
  if (orderId) {
    const globalExist = await vk.baseDao.selects({
      dbName: logDbName,
      whereJson: { order_id: orderId, source: source }
    });
    let globalRecords = [];
    if (Array.isArray(globalExist)) globalRecords = globalExist;
    else if (globalExist && globalExist.rows) globalRecords = globalExist.rows;
    else if (globalExist && globalExist.data) globalRecords = globalExist.data;

    if (globalRecords && globalRecords.length > 0) {
      const isSameUser = globalRecords.some(r => r.user_id === userId);
      if (isSameUser) {
        console.log(`订单 ${orderId} 已处理过，跳过重复扣除`);
        const balance = await points.getPointsBalance(vk, userId);
        return { success: true, balance: balance.available_points, duplicate: true };
      } else {
        console.warn(`订单 ${orderId} 已被其他用户使用，拒绝扣除`);
        return { success: false, message: "该订单已被使用" };
      }
    }
  }

  await points.initUserPoints(vk, userId);

  const selectResult = await vk.baseDao.selects({ dbName, whereJson: { user_id: userId } });

  let records = [];
  if (Array.isArray(selectResult)) records = selectResult;
  else if (selectResult && selectResult.rows) records = selectResult.rows;
  else if (selectResult && selectResult.data) records = selectResult.data;

  if (!records || records.length === 0) {
    return { success: false, message: "积分账户不存在" };
  }

  const currentRecord = records[0];

  if (currentRecord.available_points < amount) {
    return {
      success: false,
      message: `积分不足，当前可用积分：${currentRecord.available_points}，需要：${amount}`,
    };
  }

  const newAvailablePoints = currentRecord.available_points - amount;
  const newConsumedPoints = currentRecord.consumed_points + amount;

  // 事务:日志+余额原子写入
  const transaction = await db.startTransaction();
  try {
    const logData = {
      user_id: userId,
      type: "consume",
      amount: -amount,
      balance: newAvailablePoints,
      source: source,
      card_id: cardId,
      remark: remark,
      _add_time: Date.now(),
    };
    if (orderId) logData.order_id = orderId;
    await transaction.collection(logDbName).add(logData);

    const updateRes = await transaction.collection(dbName)
      .where({ user_id: userId, available_points: currentRecord.available_points })
      .update({
        available_points: newAvailablePoints,
        consumed_points: newConsumedPoints,
        _update_time: Date.now(),
      });

    if (updateRes.updated === 0) {
      await transaction.rollback();
      return { success: false, message: "积分余额已变化，请刷新后重试" };
    }

    await transaction.commit();
    console.log(`积分扣除成功：用户=${userId}, 金额=${amount}, 订单=${orderId}, 新余额=${newAvailablePoints}`);
    return { success: true, balance: newAvailablePoints };

  } catch (err) {
    await transaction.rollback();
    console.error(`积分扣除失败：用户=${userId}, 金额=${amount}, 订单=${orderId}`, err);
    return { success: false, message: err.message || "积分扣除失败" };
  }
};

module.exports = points;
