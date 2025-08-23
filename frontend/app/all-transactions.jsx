import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { View, FlatList, Text } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { COLORS } from "../constants/colors";
import { useTransactions } from "../hooks/useTransactions";
import { styles } from "../assets/styles/home.styles";
import { TransactionItem } from "../components/TransactionItem";
import AppHeader from "../components/AppHeader";
import NoTransactionFound from "../components/NoTransactionFound";
export default function AllTransactionsPage() {
  const { user } = useUser();
  const router = require('expo-router').useRouter();
  const { transactions, isLoading, loadData, deleteTransaction } = useTransactions(user?.id);
  const [periodFilter, setPeriodFilter] = useState('month');
  const [typeFilter, setTypeFilter] = useState('all');
  const now = new Date();

  React.useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Filter transactions by day, week, month, year
  const getPeriodFilteredTransactions = () => {
    if (!transactions) return [];
    if (periodFilter === 'day') {
      return transactions.filter(tx => {
        const txDate = new Date(tx.created_at);
        return txDate.getDate() === now.getDate() && txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      });
    }
    if (periodFilter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return transactions.filter(tx => new Date(tx.created_at) >= startOfWeek);
    }
    if (periodFilter === 'month') {
      return transactions.filter(tx => new Date(tx.created_at).getMonth() === now.getMonth() && new Date(tx.created_at).getFullYear() === now.getFullYear());
    }
    if (periodFilter === 'year') {
      return transactions.filter(tx => new Date(tx.created_at).getFullYear() === now.getFullYear());
    }
    return transactions;
  };

  // Filter by type (income, expense, all) using category
  const getTypeFilteredTransactions = (txs) => {
    if (typeFilter === 'all') return txs;
    if (typeFilter === 'income') return txs.filter(tx => tx.category === 'Income');
    if (typeFilter === 'expense') return txs.filter(tx => tx.category !== 'Income');
    return txs;
  };

  // Sort filtered transactions by most recent
  const sortedTransactions = [...getTypeFilteredTransactions(getPeriodFilteredTransactions())].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="All Transactions"
        showBack={true}
        rightComponent={
          <TouchableOpacity
            onPress={() => router.push('/analytics')}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 24,
              alignItems: 'center',
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 16 }}>View Analytics</Text>
          </TouchableOpacity>
        }
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8, gap: 12 }}>
        {['day', 'week', 'month', 'year'].map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setPeriodFilter(f)}
            style={{
              backgroundColor: periodFilter === f ? COLORS.primary : COLORS.card,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ color: periodFilter === f ? COLORS.white : COLORS.text, fontWeight: 'bold' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12, gap: 12 }}>
        {['all', 'income', 'expense'].map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTypeFilter(t)}
            style={{
              backgroundColor: typeFilter === t ? COLORS.primary : COLORS.card,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ color: typeFilter === t ? COLORS.white : COLORS.text, fontWeight: 'bold' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={sortedTransactions}
        renderItem={({ item }) => (
          <TransactionItem item={item} onDelete={deleteTransaction} />
        )}
        ListEmptyComponent={<NoTransactionFound />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
