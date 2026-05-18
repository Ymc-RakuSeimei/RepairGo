# 代码 Bug 修复报告

**修复日期**: 2026-05-12
**修复人**: Claude Code
**项目**: RepairGo 微信小程序

---

## 修复的 Bug 列表

### 1. 订单详情权限检查错误 (严重)

**文件**: `cloudfunctions/api/handlers/common_getOrderDetail.js`

**问题描述**:
- `getCurrentUser()` 函数返回 `{ openid, user }`，但代码错误地解构为 `{ openid, role }`
- 导致 `role` 变量始终为 `undefined`，权限检查逻辑完全失效
- 技师无法正确查看分配给自己的订单（比较 `technicianId` 和 `openid`，但这两个是不同的东西）

**修复方案**:
- 修改解构为 `{ openid, user }`
- 使用 `hasPermission(user.roles, 'admin')` 检查权限
- 技师权限检查改为查询技师表获取 `_id` 后与 `order.technicianId` 比较

**影响**: 所有订单详情页面（用户、技师、管理员）

---

### 2. 价格验证未正确处理 (中等)

**文件**: `cloudfunctions/api/handlers/technician_updateOrderStatus.js`

**问题描述**:
- `validatePrice()` 函数调用后返回值未被使用
- 如果验证失败，异常未被捕获处理，会导致云函数报错

**修复方案**:
- 使用 `if (!validatePrice(...))` 检查返回值
- 验证失败时返回友好的错误信息

**影响**: 技师完成维修时的价格输入

---

### 3. 地址地区验证逻辑错误 (中等)

**文件**: `cloudfunctions/api/handlers/user_saveAddress.js`

**问题描述**:
- 原代码检查 `payload.region.length !== 3`，但 `region` 数组经过 `filter(Boolean)` 过滤
- 如果用户只选择了部分地区（如省和市，但没选区），`region.length` 可能不等于 3，导致验证失败

**修复方案**:
- 改为检查 `province`、`city`、`district` 三个字段是否都存在

**影响**: 用户保存地址时的地区选择验证

---

### 4. 前端地区验证不一致 (中等)

**文件**: `miniprogram/pages/user/addressForm/addressForm.js`

**问题描述**:
- 前端检查 `region.length !== 3`，但不检查数组元素是否为空字符串
- 与后端验证逻辑不一致

**修复方案**:
- 改为检查 `region.length < 3 || !region[0] || !region[1] || !region[2]`

**影响**: 地址表单提交时的地区验证

---

### 5. 开发者审核权限错误 (严重)

**文件**: `cloudfunctions/api/handlers/developer_reviewApplications.js`

**问题描述**:
- 代码使用 `await requireRole('admin')` 检查权限
- 但审核管理员申请应该是开发者权限，不是管理员权限
- 管理员可以审核其他管理员的申请，这是权限漏洞

**修复方案**:
- 改为 `await requireRole('developer')`

**影响**: 开发者审核管理员申请功能

---

### 6. 多个云函数缺少输入验证 (低)

**涉及文件**:
- `admin_manageTechnician.js` - 缺少 `technicianId` 验证
- `admin_replyFeedback.js` - 缺少 `feedbackId` 验证
- `admin_closeFeedback.js` - 缺少 `feedbackId` 验证
- `user_cancelOrder.js` - 缺少 `orderId` 验证
- `user_submitReview.js` - 缺少 `orderId` 验证
- `technician_acceptOrder.js` - 缺少 `orderId` 验证
- `admin_dispatchOrder.js` - 缺少 `orderId` 和 `technicianId` 验证
- `technician_updateOrderStatus.js` - 缺少 `orderId` 和 `orderAction` 验证
- `common_getOrderDetail.js` - 缺少 `orderId` 验证
- `technician_getReviews.js` - 缺少 `technicianId` 验证
- `admin_getTechnicianDetail.js` - 缺少 `technicianId` 验证
- `admin_getFeedbackDetail.js` - 缺少 `feedbackId` 验证

**问题描述**:
- 如果调用时未传递必要参数，会导致云函数报错
- 错误信息不友好，难以定位问题

**修复方案**:
- 在函数开头添加参数存在性检查
- 返回友好的中文错误信息

**影响**: 所有云函数调用的健壮性

---

### 7. 前端手机号验证缺失 (低)

**涉及文件**:
- `miniprogram/pages/user/createOrder/createOrder.js` - 下单时未验证手机号格式
- `miniprogram/pages/technician/register/register.js` - 注册时未验证手机号格式

**问题描述**:
- 只检查手机号是否为空，不验证格式
- 可能导致无效手机号被保存到数据库

**修复方案**:
- 引入 `isValidPhone` 函数
- 使用 `isValidPhone(phone)` 替代 `!phone.trim()`

**影响**: 订单创建和技师注册时的手机号验证

---

### 8. 并发查询潜在问题 (低)

**涉及文件**:
- `admin_getTechnicians.js`
- `admin_getAllOrders.js`

**问题描述**:
- 使用同一个 `query` 对象同时执行 `count()` 和 `get()`
- 在微信云数据库中，这可能导致查询结果不一致

**修复方案**:
- 将并发查询改为顺序查询

**影响**: 管理员查看技师列表和订单列表的稳定性

---

## 修复统计

| 类型 | 数量 |
|------|------|
| 严重 Bug | 2 |
| 中等 Bug | 4 |
| 低优先级 Bug | 2 |
| **总计** | **8** |

---

## 测试建议

1. **订单详情权限测试**:
   - 用户只能查看自己的订单
   - 技师只能查看分配给自己的订单
   - 管理员可以查看所有订单

2. **价格验证测试**:
   - 输入有效价格（0-10000）
   - 输入无效价格（负数、超过10000、非数字）

3. **地址保存测试**:
   - 完整选择省市区
   - 只选择部分地区

4. **开发者审核测试**:
   - 开发者可以审核管理员申请
   - 管理员不能审核管理员申请

5. **输入验证测试**:
   - 不传递必要参数
   - 传递空字符串参数

---

## 部署说明

修复后的云函数需要在微信开发者工具中重新部署：
1. 右键点击 `cloudfunctions/api` 目录
2. 选择"上传并部署：云端安装依赖"
3. 等待部署完成

前端代码修改会在下次编译时自动生效。

---

## 备注

- 所有修复都保持了向后兼容性
- 没有修改数据库结构
- 没有添加新的依赖
- 代码风格保持一致
