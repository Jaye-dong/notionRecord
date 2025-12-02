import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NotionService from '@/src/services/notionService';
import { NOTION_CONFIG } from '@/src/config/notion';
import { Transaction, Account } from '@/src/types';
import { formatDisplayDate, formatAmount } from '@/src/utils/dateFormat';

export default function HomeScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);

  const notionService = new NotionService(NOTION_CONFIG.apiKey);
  notionService.setDatabaseIds(NOTION_CONFIG.databaseIds);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsData, transactionsData] = await Promise.all([
        notionService.getAccounts(),
        notionService.getTransactions(20),
      ]);

      setAccounts(accountsData);
      setTransactions(transactionsData);

      // 计算总余额
      const total = accountsData.reduce((sum, acc) => sum + acc.balance, 0);
      setTotalBalance(total);
    } catch (error: any) {
      Alert.alert('错误', error.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionName}>{item.name}</Text>
        <Text style={styles.transactionDate}>{formatDisplayDate(item.date)}</Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          item.type === '收入' ? styles.incomeAmount : styles.expenseAmount,
        ]}
      >
        {item.type === '收入' ? '+' : '-'}
        {formatAmount(Math.abs(item.amount))}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 账户余额卡片 */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>总余额</Text>
        <Text style={styles.balanceAmount}>{formatAmount(totalBalance)}</Text>

        {/* 账户列表 */}
        <View style={styles.accountsList}>
          {accounts.slice(0, 3).map((account) => (
            <View key={account.id} style={styles.accountItem}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountBalance}>
                {formatAmount(account.balance)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 快速记账按钮 */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-transaction')}
      >
        <Ionicons name="add-circle" size={28} color="#fff" />
        <Text style={styles.addButtonText}>快速记账</Text>
      </TouchableOpacity>

      {/* 最近交易 */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>最近交易</Text>
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>暂无交易记录</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceCard: {
    backgroundColor: '#007AFF',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
  },
  accountsList: {
    marginTop: 20,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  accountName: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  accountBalance: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  transactionsSection: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#34C759',
  },
  expenseAmount: {
    color: '#FF3B30',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 20,
  },
});
