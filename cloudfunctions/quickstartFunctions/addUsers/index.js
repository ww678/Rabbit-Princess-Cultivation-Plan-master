const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
  const data = event.data
  return await db.collection('user').add({
    data: [{
      open_id: data.openid,
      user_id: 'yf',
      user_integral: 0
    }]
  });
};
