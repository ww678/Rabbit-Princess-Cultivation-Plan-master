const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
  // 返回数据库查询结果
  if(event.data && event.data.id){
    return await db.collection('goods').where({
      _id: event.data.id,
      user_id: event.data.user_id
    }).get();
  } else {
    return await db.collection('goods').where({
      is_online: true,
      user_id: event.data.user_id
    }).get()
  }
};
