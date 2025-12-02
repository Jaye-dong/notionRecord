import axios from 'axios';
import { Transaction, Category, Account, Transfer } from '../types';

const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';

class NotionService {
  private apiKey: string;
  private databaseIds: {
    transactions?: string;
    categories?: string;
    accounts?: string;
    transfers?: string;
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.databaseIds = {};
  }

  // 设置数据库 ID
  setDatabaseIds(ids: {
    transactions?: string;
    categories?: string;
    accounts?: string;
    transfers?: string;
  }) {
    this.databaseIds = { ...this.databaseIds, ...ids };
  }

  // 通用 API 请求方法
  private async request(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const response = await axios({
        method,
        url: `${NOTION_API_BASE}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': NOTION_API_VERSION,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error: any) {
      console.error('Notion API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // 搜索数据库列表
  async searchDatabases() {
    return this.request('/search', 'POST', {
      filter: { property: 'object', value: 'database' },
    });
  }

  // 查询数据库
  async queryDatabase(databaseId: string, filter?: any, sorts?: any) {
    return this.request(`/databases/${databaseId}/query`, 'POST', {
      filter,
      sorts,
    });
  }

  // 创建页面（添加记录）
  async createPage(databaseId: string, properties: any) {
    return this.request('/pages', 'POST', {
      parent: { database_id: databaseId },
      properties,
    });
  }

  // 更新页面
  async updatePage(pageId: string, properties: any) {
    return this.request(`/pages/${pageId}`, 'PATCH', {
      properties,
    });
  }

  // 删除页面（归档）
  async deletePage(pageId: string) {
    return this.request(`/pages/${pageId}`, 'PATCH', {
      archived: true,
    });
  }

  // ============= 业务方法 =============

  // 获取所有交易记录
  async getTransactions(limit: number = 100): Promise<Transaction[]> {
    if (!this.databaseIds.transactions) {
      throw new Error('Transactions database ID not set');
    }

    const response = await this.queryDatabase(
      this.databaseIds.transactions,
      undefined,
      [{ property: '日期', direction: 'descending' }]
    );

    return response.results.map((page: any) => this.parseTransaction(page));
  }

  // 解析交易记录
  private parseTransaction(page: any): Transaction {
    const props = page.properties;
    return {
      id: page.id,
      date: props['日期']?.date?.start || '',
      name: props['名称']?.title?.[0]?.plain_text || '',
      amount: props['金额']?.number || 0,
      category: props['收支类别']?.relation?.[0]?.id || '',
      type: props['性质']?.select?.name || '支出',
      account: props['我的账户']?.relation?.[0]?.id || '',
    };
  }

  // 添加交易记录
  async addTransaction(transaction: Partial<Transaction>) {
    if (!this.databaseIds.transactions) {
      throw new Error('Transactions database ID not set');
    }

    const properties: any = {
      '名称': {
        title: [{ text: { content: transaction.name || '' } }],
      },
      '金额': {
        number: transaction.amount || 0,
      },
      '性质': {
        select: { name: transaction.type || '支出' },
      },
    };

    if (transaction.date) {
      properties['日期'] = {
        date: { start: transaction.date },
      };
    }

    if (transaction.category) {
      properties['收支类别'] = {
        relation: [{ id: transaction.category }],
      };
    }

    if (transaction.account) {
      properties['我的账户'] = {
        relation: [{ id: transaction.account }],
      };
    }

    return this.createPage(this.databaseIds.transactions, properties);
  }

  // 获取分类列表
  async getCategories(): Promise<Category[]> {
    if (!this.databaseIds.categories) {
      throw new Error('Categories database ID not set');
    }

    const response = await this.queryDatabase(this.databaseIds.categories);
    return response.results.map((page: any) => this.parseCategory(page));
  }

  // 解析分类
  private parseCategory(page: any): Category {
    const props = page.properties;
    return {
      id: page.id,
      name: props['名称']?.title?.[0]?.plain_text || '',
      totalAmount: props['总金额']?.rollup?.number || 0,
      incomeAmount: props['收支金额']?.rollup?.number || 0,
      type: props['类别']?.select?.name || '支出',
      account: props['我的账户']?.relation?.[0]?.id || '',
    };
  }

  // 获取账户列表
  async getAccounts(): Promise<Account[]> {
    if (!this.databaseIds.accounts) {
      throw new Error('Accounts database ID not set');
    }

    const response = await this.queryDatabase(this.databaseIds.accounts);
    return response.results.map((page: any) => this.parseAccount(page));
  }

  // 解析账户
  private parseAccount(page: any): Account {
    const props = page.properties;
    return {
      id: page.id,
      name: props['名称']?.title?.[0]?.plain_text || '',
      balance: props['目前金额']?.formula?.number || 0,
      initialBalance: props['原始金额']?.number || 0,
      increase: props['增长金额']?.rollup?.number || 0,
      decrease: props['转出汇总']?.rollup?.number || 0,
      transfer: props['转入汇总']?.rollup?.number || 0,
    };
  }

  // 获取转账记录
  async getTransfers(): Promise<Transfer[]> {
    if (!this.databaseIds.transfers) {
      throw new Error('Transfers database ID not set');
    }

    const response = await this.queryDatabase(
      this.databaseIds.transfers,
      undefined,
      [{ property: '日期', direction: 'descending' }]
    );

    return response.results.map((page: any) => this.parseTransfer(page));
  }

  // 解析转账记录
  private parseTransfer(page: any): Transfer {
    const props = page.properties;
    return {
      id: page.id,
      date: props['日期']?.date?.start || '',
      name: props['名称']?.title?.[0]?.plain_text || '',
      amount: props['互转金额']?.number || 0,
      fromAccount: props['转出账户']?.relation?.[0]?.id || '',
      toAccount: props['转入账户']?.relation?.[0]?.id || '',
      status: props['状态']?.status?.name || '',
    };
  }
}

export default NotionService;
