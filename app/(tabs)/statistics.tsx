import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import NotionService from '@/src/services/notionService';
import { NOTION_CONFIG } from '@/src/config/notion';
import { Category } from '@/src/types';
import { formatAmount } from '@/src/utils/dateFormat';

export default function StatisticsScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'支出' | '收入'>('支出');

  const notionService = new NotionService(NOTION_CONFIG.apiKey);
  notionService.setDatabaseIds(NOTION_CONFIG.databaseIds);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const categoriesData = await notionService.getCategories();
      setCategories(categoriesData);
    } catch (error: any) {
      Alert.alert('错误', error.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 过滤并排序分类
  const filteredCategories = categories
    .filter((cat) => cat.type === type)
    .sort((a, b) => Math.abs(b.totalAmount) - Math.abs(a.totalAmount));

  // 计算总金额
  const totalAmount = filteredCategories.reduce(
    (sum, cat) => sum + Math.abs(cat.totalAmount),
    0
  );

  // 渲染分类项
  const renderCategoryItem = (category: Category) => {
    const percentage =
      totalAmount > 0
        ? (Math.abs(category.totalAmount) / totalAmount) * 100
        : 0;

    return (
      <View key={category.id} style={styles.categoryItem}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text
            style={[
              styles.categoryAmount,
              type === '收入' ? styles.incomeAmount : styles.expenseAmount,
            ]}
          >
            {formatAmount(Math.abs(category.totalAmount))}
          </Text>
        </View>

        {/* 进度条 */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: type === '收入' ? '#34C759' : '#FF3B30',
              },
            ]}
          />
        </View>

        <Text style={styles.percentageText}>{percentage.toFixed(1)}%</Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
    >
      {/* 顶部统计卡片 */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>分类统计</Text>

        {/* 类型切换 */}
        <View style={styles.typeSection}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === '支出' && styles.typeButtonActive,
            ]}
            onPress={() => setType('支出')}
          >
            <Text
              style={[
                styles.typeText,
                type === '支出' && styles.typeTextActive,
              ]}
            >
              支出
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === '收入' && styles.typeButtonActive,
            ]}
            onPress={() => setType('收入')}
          >
            <Text
              style={[
                styles.typeText,
                type === '收入' && styles.typeTextActive,
              ]}
            >
              收入
            </Text>
          </TouchableOpacity>
        </View>

        {/* 总金额 */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>总{type}</Text>
          <Text
            style={[
              styles.totalAmount,
              type === '收入' ? styles.incomeAmount : styles.expenseAmount,
            ]}
          >
            {formatAmount(totalAmount)}
          </Text>
        </View>
      </View>

      {/* 分类列表 */}
      <View style={styles.categoriesSection}>
        {filteredCategories.length > 0 ? (
          filteredCategories.map(renderCategoryItem)
        ) : (
          <Text style={styles.emptyText}>暂无{type}数据</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  typeSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
  totalSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#34C759',
  },
  expenseAmount: {
    color: '#FF3B30',
  },
  categoriesSection: {
    padding: 16,
  },
  categoryItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 40,
    fontSize: 16,
  },
});
