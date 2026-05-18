const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function isValidPreferredTime(preferredTime) {
  if (!preferredTime) return true;

  const match = preferredTime.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):00-(\d{2}):00$/);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const startHour = Number(match[4]);
  const endHour = Number(match[5]);
  const allowedSlots = {
    9: 10,
    10: 11,
    11: 12,
    14: 15,
    15: 16,
    16: 17,
    17: 18,
    18: 19,
    19: 20,
    20: 21,
  };

  const now = new Date();
  if (year !== now.getFullYear()) return false;
  if (allowedSlots[startHour] !== endHour) return false;

  const slotStart = new Date(year, month - 1, day, startHour, 0, 0, 0);
  if (Number.isNaN(slotStart.getTime())) return false;

  return slotStart.getTime() > now.getTime();
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const { applianceType, applianceBrand, faultDescription, userName, userPhone, userAddress, preferredTime, faultImages } = event;

  if (!applianceType || !userName || !userPhone || !userAddress || !faultDescription) {
    return { code: -1, message: '请填写完整信息' };
  }
  if (!isValidPreferredTime(preferredTime)) {
    return { code: -1, message: '请选择当前年度内且晚于当前时间的有效预约时段' };
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
