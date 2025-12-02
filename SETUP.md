# 快速配置指南

这份指南将帮助你快速配置 Notion 记账应用。

## 步骤 1：创建 Notion Integration

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 **"+ New integration"**
3. 填写以下信息：
   - Name: `记账助手`（或任何你喜欢的名字）
   - Associated workspace: 选择你的工作区
   - Capabilities: 保持默认（勾选 Read content, Update content, Insert content）
4. 点击 **"Submit"**
5. 复制显示的 **Internal Integration Token**（以 `secret_` 或 `ntn_` 开头）

## 步骤 2：准备 Notion 数据库

### 选项 A：使用现有数据库

如果你已经有记账数据库（如截图所示），跳到步骤 3。

### 选项 B：创建新数据库

如果需要创建新的数据库，请参考以下结构：

#### 1. 数据流水数据库

创建一个新的数据库页面，添加以下属性：

| 属性名称 | 类型 | 说明 |
|---------|------|------|
| 名称 | Title | 交易描述 |
| 日期 | Date | 交易日期 |
| 金额 | Number | 交易金额 |
| 性质 | Select | 选项：支出、收入 |
| 收支类别 | Relation | 关联到"收支类别"数据库 |
| 我的账户 | Relation | 关联到"我的账户"数据库 |

#### 2. 收支类别数据库

| 属性名称 | 类型 | 说明 |
|---------|------|------|
| 名称 | Title | 分类名称（如：餐饮、交通、日用） |
| 类别 | Select | 选项：支出、收入 |
| 总金额 | Rollup | 汇总"数据流水"的金额 |
| 我的账户 | Relation | 关联到"我的账户"数据库 |

#### 3. 我的账户数据库

| 属性名称 | 类型 | 说明 |
|---------|------|------|
| 名称 | Title | 账户名称（如：支付宝、微信、农业银行） |
| 原始金额 | Number | 初始余额 |
| 目前金额 | Formula | 计算当前余额 |
| 增长金额 | Rollup | 汇总收入 |
| 转出汇总 | Rollup | 汇总转出金额 |
| 转入汇总 | Rollup | 汇总转入金额 |

#### 4. 账户互转数据库（可选）

| 属性名称 | 类型 | 说明 |
|---------|------|------|
| 名称 | Title | 转账描述 |
| 日期 | Date | 转账日期 |
| 互转金额 | Number | 转账金额 |
| 转出账户 | Relation | 关联到"我的账户"数据库 |
| 转入账户 | Relation | 关联到"我的账户"数据库 |
| 状态 | Status | 转账状态 |

## 步骤 3：连接数据库到 Integration

对于每个数据库：

1. 打开数据库页面
2. 点击右上角的 **"..."** 菜单
3. 选择 **"Add connections"**
4. 找到并选择你在步骤 1 创建的 Integration

## 步骤 4：获取数据库 ID

### 方法 A：通过 URL 获取

1. 在 Notion 中打开数据库页面
2. 复制浏览器地址栏的 URL
3. URL 格式：`https://www.notion.so/[数据库ID]?v=...`
4. 数据库 ID 是一个 32 位字符的字符串（带有连字符）

**示例：**
```
URL: https://www.notion.so/myworkspace/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6?v=...
数据库 ID: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 方法 B：使用辅助脚本

1. 打开 `.env` 文件，填入你的 API Key
2. 运行脚本：

```bash
node scripts/getDatabases.js
```

这将列出所有可访问的数据库及其 ID。

## 步骤 5：配置应用

### 方法 A：在代码中配置

编辑 `src/config/notion.ts` 文件：

```typescript
export const NOTION_CONFIG = {
  apiKey: 'your_api_key_here',
  databaseIds: {
    transactions: 'your_transactions_database_id',
    categories: 'your_categories_database_id',
    accounts: 'your_accounts_database_id',
    transfers: 'your_transfers_database_id',
  },
};
```

### 方法 B：在应用中配置

1. 运行应用：`npm start`
2. 打开应用，进入 "设置" 标签
3. 填入 API Key
4. 点击 "搜索数据库" 获取数据库列表
5. 填入各个数据库的 ID
6. 点击 "测试连接" 验证配置

## 步骤 6：运行应用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

然后：
- 按 `a` 打开 Android 模拟器
- 按 `i` 打开 iOS 模拟器（需要 Mac）
- 扫描 QR 码在真机上测试（需要安装 Expo Go）

## 常见问题

### Q1: "unauthorized" 错误
**解决方案：**
- 检查 API Key 是否正确
- 确保 Integration 已连接到所有数据库

### Q2: "object not found" 错误
**解决方案：**
- 检查数据库 ID 是否正确
- 确保数据库 ID 没有多余的空格或字符
- 数据库 ID 应该是 32 位字符（含连字符）

### Q3: 数据库 ID 格式问题
**正确格式：**
- ✅ `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`
- ✅ `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` （部分格式也可以）
- ❌ `https://www.notion.so/a1b2c3d4...` （不要包含 URL）

### Q4: 如何在真机上测试？
**步骤：**
1. 在手机上安装 Expo Go（[iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)）
2. 确保手机和电脑在同一 WiFi 网络
3. 运行 `npm start`
4. 在 Expo Go 中扫描二维码

### Q5: 修改数据后应用没有更新？
**解决方案：**
- 下拉刷新页面
- 或重启应用

## 获取帮助

如果遇到问题：
1. 查看 [README.md](./README.md) 中的详细文档
2. 检查浏览器控制台的错误信息
3. 在 GitHub 提交 Issue

## 下一步

配置完成后，你可以：
- ✅ 使用快速记账功能添加交易
- ✅ 查看分类统计
- ✅ 管理多个账户
- ✅ 数据自动同步到 Notion

享受记账吧！ 📱💰
