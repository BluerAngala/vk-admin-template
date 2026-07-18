
/**
 * 检查特定卡密和用户绑定关系的调试脚本
 * 
 * 使用方法：
 * 1. 在 HBuilderX 中打开此文件
 * 2. 右键选择"运行云函数本地调试"
 */

const cardCode = '0728b641c35f942d85083ff68eac0967';
const userIdToCheck = '6926aa247c280e407bff576a';

module.exports = {
  main: async (event, context) => {
    const db = uniCloud.database();
    
    console.log('--- 开始查询卡密信息 ---');
    console.log('查询卡密:', cardCode);
    
    // 1. 查询卡密表
    const cardRes = await db.collection('vk-card-key')
      .where({ card_code: cardCode })
      .get();
      
    if (cardRes.data.length === 0) {
      return { msg: '未找到该卡密记录' };
    }
    
    const cardInfo = cardRes.data[0];
    console.log('数据库中的卡密详情:', JSON.stringify(cardInfo, null, 2));
    
    // 2. 检查购买者ID
    const buyUserId = cardInfo.buy_user_id;
    console.log('该卡密绑定的购买者用户ID (buy_user_id):', buyUserId);
    console.log('你输入的待校验用户ID:', userIdToCheck);
    
    const isMatch = buyUserId === userIdToCheck;
    console.log('两者是否完全匹配:', isMatch);
    
    if (!isMatch) {
      console.log('注意：如果不匹配，校验接口会报错 "此卡密不属于您"');
      if (userIdToCheck.length !== (buyUserId ? buyUserId.length : 0)) {
        console.log(`长度不一致！数据库中长度: ${buyUserId ? buyUserId.length : 0}, 输入长度: ${userIdToCheck.length}`);
      }
    }
    
    // 3. 查询用户信息确认用户是否存在
    const userRes = await db.collection('uni-id-users')
      .doc(userIdToCheck)
      .field({ username: 1, nickname: 1 })
      .get();
      
    return {
      cardInfo: {
        _id: cardInfo._id,
        card_code: cardInfo.card_code,
        buy_user_id: cardInfo.buy_user_id,
        product_id: cardInfo.product_id
      },
      inputUserId: userIdToCheck,
      isMatch: isMatch,
      userExists: userRes.data.length > 0,
      userInfo: userRes.data[0] || null
    };
  }
};
