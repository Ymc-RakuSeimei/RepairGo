// 云函数调用封装
const callCloud = async (name, data = {}) => {
  wx.showLoading({ title: '加载中...', mask: true });
  try {
    const funcName = name.replace(/\//g, '_');
    const res = await wx.cloud.callFunction({
      name: 'api',
      data: { action: funcName, ...data }
    });
    wx.hideLoading();
    if (res.result && res.result.code === -1) {
      wx.showToast({ title: res.result.message || '操作失败', icon: 'none' });
      return null;
    }
    return res.result;
  } catch (err) {
    wx.hideLoading();
    console.error(`云函数 ${name} 调用失败:`, err);
    wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    return null;
  }
};

// 生成订单号
const generateOrderNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `ORD${y}${m}${d}${h}${min}${s}${rand}`;
};

// 格式化日期
const formatDate = (date, fmt = 'YYYY-MM-DD HH:mm') => {
  if (!date) return '';
  const d = new Date(date);
  const map = {
    'YYYY': d.getFullYear(),
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'DD': String(d.getDate()).padStart(2, '0'),
    'HH': String(d.getHours()).padStart(2, '0'),
    'mm': String(d.getMinutes()).padStart(2, '0'),
    'ss': String(d.getSeconds()).padStart(2, '0'),
  };
  let result = fmt;
  for (const [key, val] of Object.entries(map)) {
    result = result.replace(key, val);
  }
  return result;
};

const formatPreferredTime = (preferredTime) => {
  const value = String(preferredTime || '').trim();
  if (!value) return '';

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):00-(\d{2}):00$/);
  if (!match) return value;

  const year = match[1];
  const month = Number(match[2]);
  const day = Number(match[3]);
  const startHour = Number(match[4]);
  const endHour = Number(match[5]);

  return `${year}年${month}月${day}日 ${startHour}:00-${endHour}:00`;
};

// 订单状态映射
const ORDER_STATUS = {
  pending: { text: '待接单', color: '#f39c12' },
  accepted: { text: '已接单', color: '#3498db' },
  in_progress: { text: '维修中', color: '#9b59b6' },
  awaiting_payment: { text: '待付款', color: '#ff9500' },
  completed: { text: '已完成', color: '#27ae60' },
  reviewed: { text: '已评价', color: '#95a5a6' },
  cancelled: { text: '已取消', color: '#e74c3c' },
};

const INCOME_STATUS = {
  pending: { text: '待结算', color: '#f39c12' },
  settled: { text: '已结算', color: '#27ae60' },
};

// 电器类型列表
const APPLIANCE_TYPES = ['空调', '冰箱', '洗衣机', '热水器', '电视', '油烟机', '燃气灶', '微波炉', '电磁炉', '其他'];

// 性别映射
const GENDER_MAP = { 0: '未设置', 1: '男', 2: '女' };

// 角色映射
const ROLE_MAP = {
  user: { text: '普通用户', home: '/pages/user/home/home' },
  technician: { text: '维修师傅', home: '/pages/technician/home/home' },
  admin: { text: '管理人员', home: '/pages/admin/home/home' },
  developer: { text: '开发者', home: '/pages/developer/roleSwitch/roleSwitch' },
};

// 角色优先级：开发者 > 管理员 > 维修工人 > 普通用户
const ROLE_PRIORITY = ['developer', 'admin', 'technician', 'user'];

// 根据角色数组确定最高优先级角色（登录后自动跳转用）
const getEntryRole = (roles) => {
  if (!Array.isArray(roles)) return 'user';
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return 'user';
};

// 角色中文名
const ROLE_TEXT = {
  user: '用户',
  technician: '维修工人',
  admin: '管理员',
  developer: '开发者',
};

const GENDER_OPTIONS = [
  { value: 'unknown', label: '保密' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
];

const isValidPhone = (phone) => /^1\d{10}$/.test(String(phone || '').trim());

const getGenderLabel = (gender) => {
  const target = GENDER_OPTIONS.find((item) => item.value === gender);
  return target ? target.label : '未设置';
};

const formatFullAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;

  const {
    province = '',
    city = '',
    district = '',
    detail = '',
    fullAddress = '',
  } = address;

  return fullAddress || [province, city, district, detail].filter(Boolean).join(' ');
};

// 检查 roles 数组是否包含所需角色
const hasPermission = (userRoles, requiredRole) => {
  if (!Array.isArray(userRoles)) return false;
  if (userRoles.includes('developer')) return true;
  if (userRoles.includes('admin') && requiredRole !== 'developer') return true;
  return userRoles.includes(requiredRole);
};

// 获取用户 roles 数组（兼容旧数据）
const getUserRoles = (user) => {
  if (Array.isArray(user.roles)) return user.roles;
  return [user.role || 'user'];
};

// 获取用户 pendingRoles 数组
const getUserPendingRoles = (user) => {
  if (Array.isArray(user.pendingRoles)) return user.pendingRoles;
  return [];
};

// 从数据库验证角色并返回用户信息
const verifyRole = async (requiredRole) => {
  const result = await callCloud('user/login', {});
  if (result && result.code === 0) {
    const user = result.data;
    const roles = getUserRoles(user);
    if (hasPermission(roles, requiredRole)) {
      return user;
    }
  }
  return null;
};

// 检查角色并跳转（异步版本）
const checkRoleAsync = async (requiredRole) => {
  const user = await verifyRole(requiredRole);
  if (!user) {
    wx.showModal({
      title: '权限不足',
      content: `您没有${ROLE_TEXT[requiredRole] || requiredRole}权限`,
      showCancel: false,
      success: () => {
        wx.redirectTo({ url: '/pages/index/index' });
      }
    });
    return null;
  }
  return user;
};

// 设置当前角色（用于角色切换）
const setCurrentRole = (role) => {
  wx.setStorageSync('currentRole', role);
  getApp().globalData.currentRole = role;
};

// 设置实际角色（数据库中的最高角色）
const setActualRole = (role) => {
  getApp().globalData.actualRole = role;
};

// 获取实际角色
const getActualRole = () => {
  return getApp().globalData.actualRole || 'user';
};

// 获取当前角色
const getCurrentRole = () => {
  return getApp().globalData.currentRole || wx.getStorageSync('currentRole') || 'user';
};

// 从服务器同步最新用户信息到 globalData
const syncUserInfo = async () => {
  const result = await callCloud('user/login', {});
  if (result && result.code === 0) {
    getApp().globalData.userInfo = result.data;
    return result.data;
  }
  return null;
};

module.exports = {
  callCloud,
  generateOrderNo,
  formatDate,
  formatPreferredTime,
  ORDER_STATUS,
  INCOME_STATUS,
  APPLIANCE_TYPES,
  GENDER_MAP,
  ROLE_MAP,
  ROLE_PRIORITY,
  ROLE_TEXT,
  GENDER_OPTIONS,
  isValidPhone,
  getGenderLabel,
  formatFullAddress,
  hasPermission,
  getUserRoles,
  getUserPendingRoles,
  setCurrentRole,
  getCurrentRole,
  setActualRole,
  getActualRole,
  getEntryRole,
  verifyRole,
  checkRoleAsync,
  syncUserInfo,
};
