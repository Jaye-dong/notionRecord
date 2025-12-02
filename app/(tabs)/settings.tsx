import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotionService from '@/src/services/notionService';
import { NOTION_CONFIG } from '@/src/config/notion';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState(NOTION_CONFIG.apiKey);
  const [transactionsDbId, setTransactionsDbId] = useState(
    NOTION_CONFIG.databaseIds.transactions
  );
  const [categoriesDbId, setCategoriesDbId] = useState(
    NOTION_CONFIG.databaseIds.categories
  );
  const [accountsDbId, setAccountsDbId] = useState(
    NOTION_CONFIG.databaseIds.accounts
  );
  const [transfersDbId, setTransfersDbId] = useState(
    NOTION_CONFIG.databaseIds.transfers
  );
  const [autoSync, setAutoSync] = useState(true);

  const handleSearchDatabases = async () => {
    try {
      const notionService = new NotionService(apiKey);
      const result = await notionService.searchDatabases();

      if (result.results && result.results.length > 0) {
        let message = '找到以下数据库：\n\n';
        result.results.forEach((db: any, index: number) => {
          const title = db.title?.[0]?.plain_text || '未命名';
          message += `${index + 1}. ${title}\nID: ${db.id}\n\n`;
        });

        Alert.alert('数据库列表', message);
      } else {
        Alert.alert('提示', '未找到任何数据库，请检查 API Key 权限');
      }
    } catch (error: any) {
      Alert.alert('错误', error.message || '搜索数据库失败');
    }
  };

  const handleTestConnection = async () => {
    try {
      const notionService = new NotionService(apiKey);
      notionService.setDatabaseIds({
        transactions: transactionsDbId,
        categories: categoriesDbId,
        accounts: accountsDbId,
        transfers: transfersDbId,
      });

      // 测试连接
      await notionService.getAccounts();
      Alert.alert('成功', '连接测试成功！');
    } catch (error: any) {
      Alert.alert('错误', '连接测试失败：' + (error.message || '未知错误'));
    }
  };

  const SettingItem = ({
    icon,
    title,
    value,
    onPress,
  }: {
    icon: string;
    title: string;
    value?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#007AFF" />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>设置</Text>
      </View>

      {/* Notion API 配置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notion API 配置</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>API Key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="输入 Notion API Key"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>数据流水数据库 ID</Text>
          <TextInput
            style={styles.input}
            value={transactionsDbId}
            onChangeText={setTransactionsDbId}
            placeholder="输入数据库 ID"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>收支类别数据库 ID</Text>
          <TextInput
            style={styles.input}
            value={categoriesDbId}
            onChangeText={setCategoriesDbId}
            placeholder="输入数据库 ID"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>我的账户数据库 ID</Text>
          <TextInput
            style={styles.input}
            value={accountsDbId}
            onChangeText={setAccountsDbId}
            placeholder="输入数据库 ID"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>账户互转数据库 ID</Text>
          <TextInput
            style={styles.input}
            value={transfersDbId}
            onChangeText={setTransfersDbId}
            placeholder="输入数据库 ID"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSearchDatabases}
        >
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.buttonText}>搜索数据库</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleTestConnection}
        >
          <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
            测试连接
          </Text>
        </TouchableOpacity>
      </View>

      {/* 应用设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>应用设置</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="sync" size={24} color="#007AFF" />
            <Text style={styles.settingTitle}>自动同步</Text>
          </View>
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* 关于 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>

        <SettingItem
          icon="information-circle"
          title="版本"
          value="1.0.0"
        />

        <SettingItem
          icon="help-circle"
          title="使用帮助"
          onPress={() => Alert.alert('使用帮助', '这是一个基于 Notion 的记账应用')}
        />
      </View>

      {/* 说明 */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>如何获取数据库 ID？</Text>
        <Text style={styles.infoText}>
          1. 打开 Notion 网页版{'\n'}
          2. 进入你的数据库页面{'\n'}
          3. 复制浏览器地址栏的 URL{'\n'}
          4. URL 格式：notion.so/[数据库ID]?v=...{'\n'}
          5. 提取 32 位字符的数据库 ID
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#007AFF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
