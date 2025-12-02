import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NotionService from '@/src/services/notionService';
import { NOTION_CONFIG } from '@/src/config/notion';
import { Category, Account } from '@/src/types';
import { getTodayDate, formatAmount } from '@/src/utils/dateFormat';

export default function AddTransactionScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'支出' | '收入'>('支出');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const notionService = new NotionService(NOTION_CONFIG.apiKey);
  notionService.setDatabaseIds(NOTION_CONFIG.databaseIds);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesData, accountsData] = await Promise.all([
        notionService.getCategories(),
        notionService.getAccounts(),
      ]);

      setCategories(categoriesData);
      setAccounts(accountsData);

      // 默认选择第一个账户
      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0].id);
      }
    } catch (error: any) {
      Alert.alert('错误', error.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // 验证
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('提示', '请输入有效金额');
      return;
    }

    if (!name.trim()) {
      Alert.alert('提示', '请输入交易名称');
      return;
    }

    if (!selectedAccount) {
      Alert.alert('提示', '请选择账户');
      return;
    }

    setSubmitting(true);

    try {
      await notionService.addTransaction({
        name: name.trim(),
        amount: type === '支出' ? -parseFloat(amount) : parseFloat(amount),
        type,
        category: selectedCategory,
        account: selectedAccount,
        date: getTodayDate(),
      });

      Alert.alert('成功', '记账成功！', [
        {
          text: '继续记账',
          onPress: () => {
            setAmount('');
            setName('');
            setSelectedCategory('');
          },
        },
        {
          text: '返回',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('错误', error.message || '记账失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 过滤对应类型的分类
  const filteredCategories = categories.filter((cat) => cat.type === type);

  // 数字键盘
  const NumberPad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

    const handleNumberPress = (num: string) => {
      if (num === '⌫') {
        setAmount(amount.slice(0, -1));
      } else if (num === '.' && amount.includes('.')) {
        return;
      } else {
        setAmount(amount + num);
      }
    };

    return (
      <View style={styles.numberPad}>
        {numbers.map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => handleNumberPress(num)}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 金额输入 */}
      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>金额</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>¥</Text>
          <Text style={styles.amountDisplay}>{amount || '0'}</Text>
        </View>
      </View>

      {/* 类型选择 */}
      <View style={styles.typeSection}>
        <TouchableOpacity
          style={[styles.typeButton, type === '支出' && styles.typeButtonActive]}
          onPress={() => {
            setType('支出');
            setSelectedCategory('');
          }}
        >
          <Text
            style={[styles.typeText, type === '支出' && styles.typeTextActive]}
          >
            支出
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === '收入' && styles.typeButtonActive]}
          onPress={() => {
            setType('收入');
            setSelectedCategory('');
          }}
        >
          <Text
            style={[styles.typeText, type === '收入' && styles.typeTextActive]}
          >
            收入
          </Text>
        </TouchableOpacity>
      </View>

      {/* 交易名称 */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>名称</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="请输入交易名称"
          placeholderTextColor="#C7C7CC"
        />
      </View>

      {/* 分类选择 */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>分类</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryList}>
            {filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 账户选择 */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>账户</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryList}>
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.categoryChip,
                  selectedAccount === account.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedAccount(account.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedAccount === account.id &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {account.name}
                </Text>
                <Text
                  style={[
                    styles.accountBalanceText,
                    selectedAccount === account.id &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {formatAmount(account.balance)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 数字键盘 */}
      <NumberPad />

      {/* 提交按钮 */}
      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>确认记账</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountSection: {
    padding: 24,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 32,
    color: '#000',
    marginRight: 8,
  },
  amountDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  typeSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    fontSize: 16,
    color: '#000',
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  inputSection: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#000',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  accountBalanceText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  numberButton: {
    width: '30%',
    aspectRatio: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
  },
  submitButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#34C759',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
