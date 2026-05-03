const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * Get current user's openid and roles array
 */
async function getCurrentUser() {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  if (!openid) {
    throw new Error("无法获取用户身份");
  }
  
  const userRes = await db.collection("users").where({ _openid: openid }).get();
  const user = userRes.data.length > 0 ? userRes.data[0] : null;
  
  // Ensure roles array exists (backward compatibility)
  if (user && !Array.isArray(user.roles)) {
    user.roles = [user.role || 'user'];
  }
  if (user && !Array.isArray(user.pendingRoles)) {
    user.pendingRoles = [];
  }
  
  return { openid, user };
}

/**
 * Check if user's roles array includes the required role
 */
function hasPermission(userRoles, requiredRole) {
  if (!Array.isArray(userRoles)) return false;
  // Developer has all permissions
  if (userRoles.includes('developer')) return true;
  // Admin has all permissions except developer
  if (userRoles.includes('admin') && requiredRole !== 'developer') return true;
  // Direct role check
  return userRoles.includes(requiredRole);
}

/**
 * Require specific role — throws if not authorized
 */
async function requireRole(requiredRole) {
  const { openid, user } = await getCurrentUser();
  
  if (!user) {
    throw new Error("用户未登录");
  }
  
  if (!hasPermission(user.roles, requiredRole)) {
    throw new Error(`权限不足：需要${requiredRole}权限`);
  }
  
  return { openid, user };
}

async function requireAdmin() { return requireRole("admin"); }
async function requireTechnician() { return requireRole("technician"); }
async function requireUser() { return requireRole("user"); }

/**
 * Get technician record for current user
 */
async function getTechnicianRecord() {
  const { openid } = await getCurrentUser();
  
  const techRes = await db.collection("technicians").where({ _openid: openid }).get();
  if (techRes.data.length === 0) {
    throw new Error("维修师傅信息不存在");
  }
  
  return techRes.data[0];
}

/**
 * Validate price is within reasonable range
 */
function validatePrice(price, min = 0, max = 10000) {
  if (typeof price !== "number" || isNaN(price)) {
    throw new Error("价格必须是数字");
  }
  if (price < min || price > max) {
    throw new Error(`价格必须在 ${min} 到 ${max} 之间`);
  }
  return true;
}

module.exports = {
  getCurrentUser,
  requireAdmin,
  requireTechnician,
  requireUser,
  requireRole,
  hasPermission,
  getTechnicianRecord,
  validatePrice,
};
