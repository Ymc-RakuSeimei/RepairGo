# RepairGo

电器维修服务在线预约微信小程序，基于微信云开发（CloudBase）。

## 技术栈

- 前端：微信小程序原生框架（WXML + WXSS + JS）
- 后端：微信云函数（Node.js + wx-server-sdk）
- 数据库：微信云数据库（JSON 文档型）
- 云环境 ID：`cloud1-d5gj31502d98d7e43`

## 项目结构

```
RepairGo/
├── project.config.json                    # 微信开发者工具配置（appid、编译设置）
├── project.private.config.json            # 私有配置覆盖（项目名、基础库版本）
├── README.md
│
├── miniprogram/                           # ==================== 前端 ====================
│   ├── app.js                             # 入口：初始化云环境、globalData 定义
│   ├── app.json                           # 全局配置：页面路由（25页）、窗口样式
│   ├── app.wxss                           # 全局样式：Clean Minimalist 设计体系
│   ├── sitemap.json                       # 站点地图（允许所有页面被微信索引）
│   │
│   ├── components/                        # ---------- 自定义组件 ----------
│   │   ├── orderCard/                     # 订单卡片（接收 order/role，点击跳转详情）
│   │   │   ├── orderCard.js
│   │   │   ├── orderCard.json
│   │   │   ├── orderCard.wxml
│   │   │   └── orderCard.wxss
│   │   ├── role-tabbar/                   # 角色底部导航栏（根据 role 动态渲染不同 tab）
│   │   │   ├── role-tabbar.js
│   │   │   ├── role-tabbar.json
│   │   │   ├── role-tabbar.wxml
│   │   │   └── role-tabbar.wxss
│   │   ├── starRating/                    # 星级评分（支持只读/交互模式）
│   │   │   ├── starRating.js
│   │   │   ├── starRating.json
│   │   │   ├── starRating.wxml
│   │   │   └── starRating.wxss
│   │   └── statusBadge/                   # 状态徽章（从 ORDER_STATUS 映射文本和颜色）
│   │       ├── statusBadge.js
│   │       ├── statusBadge.json
│   │       ├── statusBadge.wxml
│   │       └── statusBadge.wxss
│   │
│   ├── images/                            # ---------- 静态资源 ----------
│   │   ├── arrow.svg
│   │   ├── avatar.png
│   │   ├── copy.svg
│   │   └── icons/
│   │       ├── avatar.png
│   │       ├── close.png
│   │       ├── copy.png
│   │       ├── customer-service.svg
│   │       ├── question.svg
│   │       ├── setting.svg
│   │       └── share.svg
│   │
│   ├── utils/                             # ---------- 工具函数 ----------
│   │   └── util.js                        # callCloud()、权限校验、常量定义、格式化工具
│   │
│   └── pages/                             # ---------- 页面（按角色分目录） ----------
│       ├── index/                         # [公共] 登录入口
│       │   ├── index.js                   # 自动登录，按角色优先级跳转
│       │   ├── index.json
│       │   ├── index.wxml
│       │   └── index.wxss
│       │
│       ├── user/                          # [用户端] 9 个页面
│       │   ├── home/                      # 首页（快捷入口、最近订单）
│       │   ├── createOrder/               # 创建订单（选择电器、描述故障、上传图片）
│       │   ├── orderList/                 # 我的订单列表（按状态筛选）
│       │   ├── orderDetail/               # 订单详情（查看进度、取消、评价）
│       │   ├── feedback/                  # 提交反馈
│       │   ├── profile/                   # 个人中心
│       │   ├── editProfile/               # 编辑个人资料
│       │   ├── addressList/               # 地址列表
│       │   └── addressForm/               # 新增/编辑地址
│       │
│       ├── technician/                    # [师傅端] 6 个页面
│       │   ├── home/                      # 首页（待接单、进行中统计）
│       │   ├── orderList/                 # 工单列表（全部/进行中/已完成）
│       │   ├── orderDetail/               # 工单详情（更新状态、填写费用）
│       │   ├── income/                    # 收入统计
│       │   ├── profile/                   # 师傅资料
│       │   └── register/                  # 注册申请成为师傅
│       │
│       ├── admin/                         # [管理端] 8 个页面
│       │   ├── home/                      # 首页（数据概览）
│       │   ├── orderList/                 # 所有订单（分页+状态筛选）
│       │   ├── orderDetail/               # 订单详情（派单操作）
│       │   ├── technicians/               # 师傅列表（审核/禁用）
│       │   ├── technicianDetail/          # 师傅详情（审核通过/拒绝）
│       │   ├── feedbackList/              # 反馈列表
│       │   ├── feedbackDetail/            # 反馈详情（回复/关闭）
│       │   └── profile/                   # 管理员个人中心
│       │
│       └── developer/                     # [开发者] 1 个页面
│           └── roleSwitch/                # 角色切换（调试用，切换到任意角色视角）
│
└── cloudfunctions/                        # ==================== 后端 ====================
    └── api/                               # 统一云函数（单函数路由模式）
        ├── index.js                       # 路由入口：启动时自动扫描 handlers/ 注册
        ├── package.json                   # 依赖：wx-server-sdk ~2.6.3
        │
        ├── handlers/                      # ---------- 业务处理器（30个） ----------
        │   ├── auth_helper.js             # 认证鉴权：getCurrentUser、requireRole、hasPermission
        │   │
        │   ├── user_login.js              # 登录/注册（新用户自动创建，旧数据迁移）
        │   ├── user_createOrder.js        # 创建维修订单
        │   ├── user_getMyOrders.js        # 获取我的订单列表
        │   ├── user_cancelOrder.js        # 取消订单
        │   ├── user_submitReview.js       # 提交订单评价
        │   ├── user_updateProfile.js      # 更新用户资料
        │   ├── user_getAddresses.js       # 获取地址列表
        │   ├── user_saveAddress.js        # 保存地址（新增/编辑）
        │   ├── user_deleteAddress.js      # 删除地址
        │   ├── user_setDefaultAddress.js  # 设置默认地址
        │   │
        │   ├── technician_register.js     # 维修师傅注册申请（含重新提交）
        │   ├── technician_getPendingOrders.js  # 获取待接单列表
        │   ├── technician_acceptOrder.js  # 接单（需 approved 且 isBusy=false）
        │   ├── technician_updateOrderStatus.js # 更新订单状态（维修中/已完成）
        │   ├── technician_getMyOrders.js  # 获取我的工单列表
        │   ├── technician_getIncome.js    # 获取收入统计
        │   ├── technician_getProfile.js   # 获取师傅资料
        │   ├── technician_getReviews.js   # 获取评价列表
        │   │
        │   ├── admin_getAllOrders.js      # 获取所有订单（分页+状态筛选）
        │   ├── admin_dispatchOrder.js     # 管理员派单
        │   ├── admin_getAvailableTechs.js # 获取可用师傅列表
        │   ├── admin_getTechnicians.js    # 获取所有师傅列表
        │   ├── admin_getTechnicianDetail.js  # 获取师傅详情
        │   ├── admin_manageTechnician.js  # 审核/拒绝/禁用师傅
        │   ├── admin_getStats.js          # 获取统计数据
        │   ├── admin_getFeedback.js       # 获取反馈列表
        │   ├── admin_getFeedbackDetail.js # 获取反馈详情
        │   ├── admin_replyFeedback.js     # 回复反馈
        │   ├── admin_closeFeedback.js     # 关闭反馈
        │   │
        │   ├── common_getOrderDetail.js   # 获取订单详情（角色无关）
        │   └── common_submitFeedback.js   # 提交反馈/投诉
        │
        └── helpers/                       # ---------- 辅助模块 ----------
            └── userAddress.js             # 地址 CRUD、默认地址同步、旧数据迁移
```

## 角色体系

四角色权限体系，角色优先级：`developer > admin > technician > user`

| 角色 | 说明 | 权限范围 |
|------|------|----------|
| developer | 开发者（调试用） | 万能权限，可在前端自由切换到任意角色视角 |
| admin | 管理员 | 派单、师傅审核管理、反馈处理、数据统计 |
| technician | 维修师傅 | 接单、更新工单状态、查看收入和评价 |
| user | 普通用户 | 下单、管理订单和地址、提交反馈和评价 |

用户可拥有多个角色（`users.roles` 数组），登录时按优先级自动跳转到最高角色首页。

## 数据库集合

| 集合 | 说明 | 关键字段 |
|------|------|----------|
| `users` | 用户表 | `roles[]`、`pendingRoles[]`、`nickName`、`phone`、`gender`、`defaultAddressId` |
| `orders` | 订单表 | `orderNo`、`status`、`technicianId`、`price`、`applianceType`、`faultDescription` |
| `technicians` | 维修师傅表 | `status`(pending/approved/rejected/disabled)、`isBusy`、`rating`、`totalIncome` |
| `user_addresses` | 用户地址表 | `province`/`city`/`district`/`detail`、`isDefault`、`tag` |
| `feedback` | 反馈表 | `status`(open/closed)、`replies[]`、`type`、`orderId` |

## 订单状态流转

```
pending → accepted → in_progress → completed → reviewed
   ↓
cancelled
```

- `pending`：用户下单后等待接单
- `accepted`：师傅接单或管理员派单
- `in_progress`：师傅上门维修中
- `completed`：维修完成，等待用户评价
- `reviewed`：用户已评价，订单完结
- `cancelled`：用户取消订单

## 前后端通信

前端通过 `miniprogram/utils/util.js` 中的 `callCloud(name, data)` 调用云函数。`name` 将 `/` 替换为 `_` 映射到 handler 文件名：

```
前端 callCloud('user/login') → 云函数 index.js → handlers/user_login.js → exports.main()
```

## 开发说明

- 微信开发者工具是唯一的调试和预览工具，无法通过 CLI 运行或测试
- 云函数部署需在微信开发者工具中右键上传，无法通过命令行完成
- 新增 handler 文件后会自动被 `index.js` 加载，无需修改入口文件
- 全局常量（订单状态、电器类型、角色映射）定义在 `miniprogram/utils/util.js`
- 后端权限校验：`auth_helper.js` 中的 `requireRole()` / `getCurrentUser()`
- 前端权限校验：`util.js` 中的 `checkRoleAsync()` / `hasPermission()`
