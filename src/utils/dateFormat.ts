import { format, parseISO } from 'date-fns';

// 格式化日期为 YYYY-MM-DD
export const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    return format(parseISO(date), 'yyyy-MM-dd');
  }
  return format(date, 'yyyy-MM-dd');
};

// 格式化日期为显示格式 MM月DD日
export const formatDisplayDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    return format(parseISO(date), 'MM月dd日');
  }
  return format(date, 'MM月dd日');
};

// 获取今天的日期
export const getTodayDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

// 格式化金额
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amount);
};

// 简化金额格式（不带货币符号）
export const formatSimpleAmount = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
