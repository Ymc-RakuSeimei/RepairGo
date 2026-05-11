# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RepairGo is a WeChat Mini Program (微信小程序) for appliance repair services, built on WeChat Cloud Development (云开发). The frontend uses the native WeChat framework (WXML/WXSS/JS), and the backend is a single cloud function running on Node.js with `wx-server-sdk`.

## Build & Run

- **Run**: Open in WeChat DevTools (微信开发者工具), appid `wx76aa5fb7218fdaed`. DevTools handles compilation, preview, and hot reload automatically. No CLI build step.
- **Deploy cloud functions**: Right-click `cloudfunctions/api` in DevTools → "Upload and Deploy: Cloud Install Dependencies" (上传并部署: 云端安装依赖).
- **No test framework or linter is configured.**

## Architecture

### Directory Layout

```
miniprogram/          # Frontend (pages, components, utils)
cloudfunctions/api/   # Backend (single cloud function)
```

### Backend: Single Cloud Function with Action Router

All backend logic lives in one cloud function (`cloudfunctions/api/`). The entry point `index.js` auto-loads all handler files from `handlers/` and routes by the `action` field in the event payload.

Frontend calls are made via `callCloud('role/action', params)` (defined in `miniprogram/utils/util.js`), which translates to `wx.cloud.callFunction({ name: 'api', data: { action: 'role_action', ... } })`. The `/` becomes `_` to match the handler filename.

Handler naming convention: `{role}_{operation}.js` — e.g., `user_createOrder.js`, `admin_dispatchOrder.js`, `technician_acceptOrder.js`. Common/shared operations use `common_` prefix.

All handlers use `auth_helper.js` for permission checking via `checkAuth(event, requiredRole)`.

### Frontend: Role-Based Page Organization

Pages are organized under `miniprogram/pages/{role}/` with 4 roles:

| Role | Purpose |
|------|---------|
| `user/` | Customer: create orders, view history, submit reviews, send feedback |
| `technician/` | Repair tech: accept orders, update status, view income |
| `admin/` | Manager: dispatch orders, manage technicians, handle feedback |
| `developer/` | Dev tools: role switching, review technician applications |

Entry point is `pages/index/index` — handles login and redirects to the appropriate role home page based on the user's highest-priority role.

### Role System

Priority hierarchy: `developer > admin > technician > user`. A user can hold multiple roles (stored as `roles` array in the `users` collection). Role management utilities are in `miniprogram/utils/util.js` (`ROLE_MAP`, `ROLE_PRIORITY`, `getEntryRole`, `hasPermission`, `verifyRole`, `checkRoleAsync`).

### Order Lifecycle

```
pending → accepted → in_progress → completed → reviewed
   ↘ cancelled (any state before completed)
```

Orders are accepted via admin dispatch (`admin_dispatchOrder`) or technician self-acceptance (`technician_acceptOrder`). Status constants are defined in `ORDER_STATUS` in `miniprogram/utils/util.js`.

### Reusable Components (`miniprogram/components/`)

- `orderCard` — order summary card, navigates to role-specific detail page
- `statusBadge` — status indicator with color coding
- `starRating` — interactive rating widget
- `role-tabbar` — bottom tab bar that adapts tabs per role

### Cloud Environment

Cloud environment ID: `cloud1-d5gj31502d98d7e43` (set in `miniprogram/app.js`).

### Database Collections

- `users` — accounts with `_openid`, `roles` array, `pendingRoles`
- `orders` — repair orders with status workflow, technician assignment, pricing
- `technicians` — technician profiles with approval status and busy state
- `reviews` — customer ratings
- `feedback` — customer support tickets

## Key Conventions

- All cloud function calls go through `callCloud()` in `util.js` — never call `wx.cloud.callFunction` directly.
- New handlers must be placed in `cloudfunctions/api/handlers/` to be auto-discovered by the router.
- Page navigation uses `wx.navigateTo` with role-aware paths. The `orderCard` component handles role-specific detail page routing automatically.
- WXML templates use `wx:for`, `wx:if`, `bindtap` (standard WeChat template syntax, not Vue/React).
- Styles use `rpx` units (responsive pixel, 750rpx = screen width).
