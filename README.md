# Notion 记账 App

基于 React Native 和 Notion API 的移动端记账应用，提供流畅的记账体验。

## ✨ 功能特性

- 📱 **快速记账** - 优化的移动端记账体验，数字键盘快速输入
- 📊 **分类统计** - 可视化的收支分类统计
- 💰 **账户管理** - 多账户余额实时查看
- ☁️ **云端同步** - 数据存储在 Notion，多端同步
- 🎨 **现代 UI** - 简洁美观的界面设计

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Expo Go App（用于在手机上测试）

### 安装步骤

1. **克隆项目**

```bash
git clone <your-repo-url>
cd notionRecord
```

2. **安装依赖**

```bash
npm install
```

3. **配置 Notion API**

   a. 创建 Notion Integration：
   - 访问 https://www.notion.so/my-integrations
   - 点击 "+ New integration"
   - 输入名称，选择关联的 workspace
   - 复制 API Key

   b. 获取数据库 ID：
   - 在 Notion 中打开你的数据库页面
   - 复制浏览器地址栏的 URL
   - URL 格式：`https://www.notion.so/[数据库ID]?v=...`
   - 提取 32 位字符的数据库 ID

   c. 配置应用：
   - 编辑 `src/config/notion.ts` 文件
   - 填入你的 API Key 和数据库 ID

4. **运行应用**

```bash
# 启动开发服务器
npm start

# 或者直接在特定平台运行
npm run android  # Android
npm run ios      # iOS (需要 Mac)
npm run web      # Web
```

5. **在手机上测试**

   - 下载 Expo Go App（iOS 或 Android）
   - 扫描终端中显示的 QR 码

## 📁 项目结构

```
notionRecord/
├── app/                    # 应用页面（Expo Router）
│   ├── (tabs)/            # Tab 导航页面
│   │   ├── index.tsx      # 首页
│   │   ├── statistics.tsx # 统计页面
│   │   └── settings.tsx   # 设置页面
│   ├── add-transaction.tsx # 快速记账页面
│   └── _layout.tsx        # 根布局
├── src/
│   ├── services/          # 服务层
│   │   └── notionService.ts # Notion API 服务
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts
│   ├── config/            # 配置文件
│   │   └── notion.ts      # Notion 配置
│   └── utils/             # 工具函数
│       └── dateFormat.ts  # 日期格式化
├── package.json
├── tsconfig.json
└── app.json
```

## 🔧 配置说明

### Notion 数据库结构

应用需要以下四个数据库：

#### 1. 数据流水（交易记录）
- 日期 (Date)
- 名称 (Title)
- 金额 (Number)
- 收支类别 (Relation - 关联到收支类别数据库)
- 性质 (Select: 支出/收入)
- 我的账户 (Relation - 关联到账户数据库)

#### 2. 收支类别
- 名称 (Title)
- 总金额 (Rollup)
- 收支金额 (Rollup)
- 类别 (Select: 支出/收入)

#### 3. 我的账户
- 名称 (Title)
- 目前金额 (Formula)
- 原始金额 (Number)
- 增长金额 (Rollup)
- 转出汇总 (Rollup)
- 转入汇总 (Rollup)

#### 4. 账户互转
- 日期 (Date)
- 名称 (Title)
- 互转金额 (Number)
- 转出账户 (Relation)
- 转入账户 (Relation)
- 状态 (Status)

### 数据库权限设置

确保你创建的 Notion Integration 有访问这些数据库的权限：

1. 进入每个数据库页面
2. 点击右上角 "..." 菜单
3. 选择 "Add connections"
4. 选择你创建的 Integration

## 📱 使用指南

### 快速记账

1. 点击首页的"快速记账"按钮
2. 使用数字键盘输入金额
3. 选择支出/收入类型
4. 输入交易名称
5. 选择分类和账户
6. 点击"确认记账"

### 查看统计

1. 点击底部导航的"统计"标签
2. 切换支出/收入类型
3. 查看各分类的占比和金额

### 配置数据库

1. 点击底部导航的"设置"标签
2. 输入 Notion API Key
3. 点击"搜索数据库"查看所有可用数据库
4. 复制数据库 ID 并填入对应的输入框
5. 点击"测试连接"验证配置

## 🛠️ 技术栈

- **React Native** - 跨平台移动应用框架
- **Expo** - React Native 开发工具链
- **Expo Router** - 基于文件的路由系统
- **TypeScript** - 类型安全
- **Notion API** - 数据存储和同步
- **Axios** - HTTP 客户端

## 📝 待开发功能

- [ ] 账户互转功能
- [ ] 交易编辑和删除
- [ ] 日期范围筛选
- [ ] 图表可视化
- [ ] 预算管理
- [ ] 数据导出
- [ ] 离线缓存
- [ ] 指纹/Face ID 认证

## ⚠️ 注意事项

1. **API Key 安全**：请勿将 API Key 提交到公开仓库
2. **数据库权限**：确保 Integration 有访问所有必要数据库的权限
3. **网络连接**：应用需要网络连接才能同步数据
4. **Notion 限制**：注意 Notion API 的请求频率限制

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT

## 🙋 常见问题

### Q: 如何获取 Notion API Key？
A: 访问 https://www.notion.so/my-integrations，创建新的 Integration 即可获得。

### Q: 找不到数据库 ID？
A: 在应用的设置页面点击"搜索数据库"，会列出所有有权限的数据库及其 ID。

### Q: 为什么无法连接到 Notion？
A: 请检查：
   1. API Key 是否正确
   2. 数据库 ID 是否正确
   3. Integration 是否有访问数据库的权限
   4. 网络连接是否正常

### Q: 如何在真机上运行？
A: 下载 Expo Go App，然后扫描终端显示的 QR 码即可。

---

Made with ❤️ using React Native & Notion
