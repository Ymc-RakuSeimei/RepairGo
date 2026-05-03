const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const { applianceType, applianceBrand, faultDescription, userName, userPhone, userAddress, preferredTime, faultImages } = event;

  if (!applianceType || !userName || !userPhone || !userAddress || !faultDescription) {
    return { code: -1, message: '请填写完整信息' };
  }

  const now = new Date();
  const orderNo = 'ORD' + now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0') +
    String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  try {
    const order = {
      orderNo,
      _openid: openid,
      userName,
      userPhone,
      userAddress,
      applianceType,
      applianceBrand: applianceBrand || '',
      faultDescription,
      faultImages: faultImages || [],
      preferredTime: preferredTime || '',
      status: 'pending',
      technicianId: '',
      technicianName: '',
      dispatchedBy: '',
      price: 0,
      repairNotes: '',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    };

    const res = await db.collection('orders').add({ data: order });
    return { code: 0, data: { _id: res._id, orderNo } };
  } catch (err) {
    console.error('createOrder error:', err);
    return { code: -1, message: '创建订单失败' };
  }
};
