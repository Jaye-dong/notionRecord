/**
 * 获取 Notion 数据库列表的辅助脚本
 *
 * 使用方法：
 * 1. 在 .env 文件中填入你的 NOTION_API_KEY
 * 2. 运行：node scripts/getDatabases.js
 */

const axios = require('axios');
require('dotenv').config();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_API_VERSION = '2022-06-28';

if (!NOTION_API_KEY) {
  console.error('❌ 错误：未找到 NOTION_API_KEY');
  console.log('\n请在 .env 文件中设置 NOTION_API_KEY');
  console.log('示例：NOTION_API_KEY=your_api_key_here\n');
  process.exit(1);
}

async function searchDatabases() {
  try {
    console.log('🔍 正在搜索 Notion 数据库...\n');

    const response = await axios.post(
      'https://api.notion.com/v1/search',
      {
        filter: {
          property: 'object',
          value: 'database'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': NOTION_API_VERSION,
          'Content-Type': 'application/json'
        }
      }
    );

    const databases = response.data.results;

    if (databases.length === 0) {
      console.log('❌ 未找到任何数据库');
      console.log('请确保：');
      console.log('1. API Key 正确');
      console.log('2. Integration 已连接到数据库');
      return;
    }

    console.log(`✅ 找到 ${databases.length} 个数据库：\n`);
    console.log('='.repeat(80));

    databases.forEach((db, index) => {
      const title = db.title?.[0]?.plain_text || '未命名数据库';
      const id = db.id;
      const url = db.url;

      console.log(`\n${index + 1}. ${title}`);
      console.log(`   ID: ${id}`);
      console.log(`   URL: ${url}`);

      // 显示数据库属性
      const properties = Object.keys(db.properties);
      console.log(`   属性: ${properties.join(', ')}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📋 建议的数据库匹配：\n');

    // 智能匹配数据库
    const matches = {
      transactions: null,
      categories: null,
      accounts: null,
      transfers: null
    };

    databases.forEach(db => {
      const title = db.title?.[0]?.plain_text || '';
      const props = Object.keys(db.properties);

      // 匹配数据流水
      if (title.includes('流水') || title.includes('交易') || props.includes('金额') && props.includes('日期')) {
        matches.transactions = { title, id: db.id };
      }
      // 匹配收支类别
      else if (title.includes('类别') || title.includes('分类') || props.includes('总金额')) {
        matches.categories = { title, id: db.id };
      }
      // 匹配账户
      else if (title.includes('账户') && !title.includes('互转') || props.includes('余额')) {
        matches.accounts = { title, id: db.id };
      }
      // 匹配账户互转
      else if (title.includes('互转') || title.includes('转账') || props.includes('转出账户')) {
        matches.transfers = { title, id: db.id };
      }
    });

    if (matches.transactions) {
      console.log(`📊 数据流水: ${matches.transactions.title}`);
      console.log(`   ID: ${matches.transactions.id}`);
    }
    if (matches.categories) {
      console.log(`\n🏷️  收支类别: ${matches.categories.title}`);
      console.log(`   ID: ${matches.categories.id}`);
    }
    if (matches.accounts) {
      console.log(`\n💰 我的账户: ${matches.accounts.title}`);
      console.log(`   ID: ${matches.accounts.id}`);
    }
    if (matches.transfers) {
      console.log(`\n🔄 账户互转: ${matches.transfers.title}`);
      console.log(`   ID: ${matches.transfers.id}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 提示：请将上述 ID 复制到 src/config/notion.ts 文件中\n');

  } catch (error) {
    console.error('❌ 错误:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log('\n请检查 API Key 是否正确');
    } else if (error.response?.status === 403) {
      console.log('\n请确保 Integration 有访问数据库的权限');
    }
  }
}

searchDatabases();
