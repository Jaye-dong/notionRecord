// Notion 配置
// 重要：请在 .env 文件中配置你的 API Key 和数据库 ID
// 不要在此文件中硬编码敏感信息

export const NOTION_CONFIG = {
  // 请在 .env 文件中设置 NOTION_API_KEY
  apiKey: process.env.NOTION_API_KEY || '',

  // 数据库 ID 需要你手动填入
  // 可以通过运行 node scripts/getDatabases.js 获取
  databaseIds: {
    transactions: process.env.NOTION_DATABASE_TRANSACTIONS_ID || '', // 数据流水
    categories: process.env.NOTION_DATABASE_CATEGORIES_ID || '',   // 收支类别
    accounts: process.env.NOTION_DATABASE_ACCOUNTS_ID || '',     // 我的账户
    transfers: process.env.NOTION_DATABASE_TRANSFERS_ID || '',    // 账户互转
  },
};
