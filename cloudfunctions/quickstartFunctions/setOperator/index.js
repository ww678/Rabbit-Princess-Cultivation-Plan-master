const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
  const data = event.data
  // 返回数据库查询结果
  if (!data.mission_id)
  {
    return await db.collection('user_operator').add({
      data: [{
        goods_id: data.goods_id,
        operator_type: data.operator_type,
        operator_time: new Date(),
        user_id:data.user_id
      }]
    });
  }else{
    return await db.collection('user_operator').add({
      data: [{
        mission_id: data.mission_id,
        operator_type: data.operator_type,
        operator_time: new Date(),
        user_id:data.user_id
      }]
    });
  }
 
};
