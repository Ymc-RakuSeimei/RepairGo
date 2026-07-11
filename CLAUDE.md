---
marp: true
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

RepairGo 是一个微信小程序，用于电器维修服务的在线预约和管理。基于**微信云开发**（CloudBase），无需自建后端服务器。

## 技术栈

- **前端**: 微信小程序原生框架（WXML + WXSS + JS）
- **后端**: 微信云函数（Node.js + wx-server-sdk）
- **数据库**: 微信云数据库（JSON 文档型）
- **云环境 ID**: `cloud1-d5gj31502d98d7e43`

## 架构

### 云函数：单函数路由模式

所有后端逻辑集中在一个云函数 `api`（`cloudfunctions/api/`）中，通过 `action` 参数自动分发到对应 handler：

```
前端调用 callCloud('user/login') → 云函数 index.js → 加载 handlers/user_login.js → 执行 main()
```

- 入口：`cloudfunctions/api/index.js` — 启动时自动扫描 `handlers/` 目录下所有 `.js` 文件并注册
- Handler 命名规则：`{角色}_{操作}.js`（如 `user_login.js`、`admin_dispatchOrder.js`）
- 公共 handler：`common_*.js`、`auth_helper.js`（权限校验工具）
- 每个 handler 导出 `exports.main = async (event, context) => { ... }`，返回 `{ code: 0, data }` 或 `{ code: -1, message }`

### 前端：按角色分页组织

```
miniprogram/pages/
  index/           — 登录入口页（自动根据角色跳转）
  user/            — 普通用户功能（下单、订单、反馈、个人中心）
  technician/      — 维修师傅功能（接单、工单、收入、注册）
  admin/           — 管理员功能（派单、维修师傅管理、反馈处理）
  developer/       — 开发者功能（角色切换、申请审核）
```

### 四角色权限体系

角色优先级：`developer > admin > technician > user`

- 用户可拥有多个角色（`roles` 数组），登录时按优先级自动跳转到最高角色的首页
- `developer` 角色可切换到任意角色视角（`pages/developer/roleSwitch/`）
- 前端权限校验：`util.js` 中的 `checkRoleAsync()` / `hasPermission()`
- 后端权限校验：`auth_helper.js` 中的 `requireRole()` / `getCurrentUser()`

### 前后端通信

前端通过 `miniprogram/utils/util.js` 中的 `callCloud(name, data)` 调用云函数。`name` 会自动将 `/` 替换为 `_` 映射到 handler 文件名。

### 自定义 TabBar 组件

`miniprogram/components/role-tabbar/` 根据当前角色动态渲染不同底部导航栏，每个角色有独立的 tab 配置。

## 数据库集合

- `users` — 用户表（含 `roles` 数组、`pendingRoles` 数组）
- `technicians` — 维修师傅信息表
- `orders` — 维修订单表
- `feedback` — 用户反馈表

## 开发注意事项

- 微信开发者工具是唯一的调试和预览工具，无法通过 CLI 运行或测试
- 云函数部署需在微信开发者工具中右键上传，无法通过命令行完成
- 新增 handler 文件后会自动被 `index.js` 加载，无需修改入口文件
- 全局常量（订单状态、电器类型、角色映射）定义在 `miniprogram/utils/util.js`
- 所有页面使用中文界面，代码注释也使用中文
