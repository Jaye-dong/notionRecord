// 交易记录类型
export interface Transaction {
  id: string;
  date: string;
  name: string;
  amount: number;
  category: string;
  type: '支出' | '收入';
  account: string;
}

// 收支类别
export interface Category {
  id: string;
  name: string;
  totalAmount: number;
  incomeAmount: number;
  type: '支出' | '收入';
  account: string;
}

// 账户
export interface Account {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  increase: number;
  decrease: number;
  transfer: number;
}

// 账户互转
export interface Transfer {
  id: string;
  date: string;
  name: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  status: string;
}

// Notion API 响应类型
export interface NotionResponse<T> {
  results: T[];
  has_more: boolean;
  next_cursor: string | null;
}
