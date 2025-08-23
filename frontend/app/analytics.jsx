import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useTransactions } from "../hooks/useTransactions";
import { styles } from "../assets/styles/home.styles";
import { LineChart, PieChart } from "react-native-chart-kit";
import { COLORS } from "../constants/colors";
import AppHeader from "../components/AppHeader";

export default function Analytics() {
  const router = require('expo-router').useRouter();
  const { user } = useUser();
  const { transactions, summary, loadData } = useTransactions(user?.id);
  const [periodFilter, setPeriodFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  React.useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Filter transactions by day, week, month, year
  const getPeriodFilteredTransactions = () => {
    const now = new Date();
    if (!transactions) return [];
    if (periodFilter === 'all') {
      return transactions;
    }
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
  const filtered = [...getTypeFilteredTransactions(getPeriodFilteredTransactions())].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  // Trends: group by day (or week/month/year based on filter)
  function getTrendLabelsAndData(period) {
    const map = {};
    filtered.forEach(tx => {
      let label;
      const date = new Date(tx.created_at);
      if (period === 'day') {
        label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (period === 'week' || period === 'month') {
        label = date.toLocaleDateString();
      } else if (period === 'year') {
        label = date.toLocaleDateString([], { month: 'short' });
      }
      if (!map[label]) map[label] = { income: 0, expense: 0 };
      if (tx.type === 'income') map[label].income += tx.amount;
      if (tx.type === 'expense') map[label].expense += tx.amount;
    });
    const labels = Object.keys(map);
    const incomeData = labels.map(l => map[l].income);
    const expenseData = labels.map(l => map[l].expense);
    return { labels, incomeData, expenseData };
  }

  const { labels: trendLabels, incomeData, expenseData } = getTrendLabelsAndData(periodFilter);

  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        data: incomeData,
        color: (opacity = 1) => COLORS.income,
        strokeWidth: 3,
      },
      {
        data: expenseData,
        color: (opacity = 1) => COLORS.expense,
        strokeWidth: 3,
      },
    ],
  };

  // Categories: group by category
  const categoryMap = {};
  filtered.forEach(tx => {
    if (!categoryMap[tx.category]) categoryMap[tx.category] = 0;
    categoryMap[tx.category] += tx.amount;
  });
  const pieData = Object.keys(categoryMap).map((cat, i) => ({
    name: cat,
    amount: Math.abs(categoryMap[cat]),
    color: i % 2 === 0 ? COLORS.income : COLORS.expense,
    legendFontColor: COLORS.text,
    legendFontSize: 14,
  })).filter(d => d.amount > 0);

  const income = filtered.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const expense = filtered.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);

  // DEBUG: Show raw transactions and userId
  console.log('Analytics userId:', user?.id);
  console.log('Analytics transactions:', transactions);
  return (
    <View style={{ flex: 1, backgroundColor: styles.container.backgroundColor }}>
      <View style={{ padding: 10 }}>
        <Text style={{ color: 'red', fontSize: 12 }}>DEBUG userId: {user?.id?.toString() || 'none'}</Text>
        <Text style={{ color: 'red', fontSize: 12 }}>DEBUG transactions: {Array.isArray(transactions) ? transactions.length : 'none'}</Text>
      </View>
  <AppHeader title="Analytics" showBack={true} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8, gap: 12 }}>
        {['all', 'day', 'week', 'month', 'year'].map(f => (
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
  {/* Category filter removed as requested */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          {/* Removed duplicate period filter row */}
         
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 }}>Transactions Breakdown</Text>
          {
            (() => {
              // Use tx.type for income/expense, not category
              const income = filtered.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
              const expense = filtered.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
              const pieData = [
                {
                  name: 'Income',
                  population: Math.abs(income),
                  color: COLORS.income,
                  legendFontColor: COLORS.text,
                  legendFontSize: 14,
                },
                {
                  name: 'Expense',
                  population: Math.abs(expense),
                  color: COLORS.expense,
                  legendFontColor: COLORS.text,
                  legendFontSize: 14,
                },
              ].filter(d => d.population > 0);
              if (pieData.length > 0) {
                return (
                  <PieChart
                    data={pieData}
                    width={Dimensions.get("window").width - 40}
                    height={220}
                    chartConfig={{
                      color: (opacity = 1) => COLORS.primary,
                      labelColor: (opacity = 1) => COLORS.text,
                    }}
                    accessor={"population"}
                    backgroundColor={styles.container.backgroundColor}
                    paddingLeft={16}
                    absolute
                  />
                );
              } else {
                return <Text style={{ color: COLORS.textLight, marginTop: 8 }}>No transaction data for this period.</Text>;
              }
            })()
          }
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: Dimensions.get("window").width - 40, marginTop: 8 }}>
          <Text style={{ fontSize: 16, color: COLORS.income, fontWeight: 'bold' }}>
            Income: XAF {income?.toLocaleString() || 0}
          </Text>
          <Text style={{ fontSize: 16, color: COLORS.expense, fontWeight: 'bold' }}>
            Expense: XAF {expense?.toLocaleString() || 0}
          </Text>
        </View>
  {/* Removed duplicate pie chart and category section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: Dimensions.get("window").width - 40, marginTop: 8 }}>
          <Text style={{ fontSize: 16, color: COLORS.income, fontWeight: 'bold' }}>
            Income: XAF {income?.toLocaleString() || 0}
          </Text>
          <Text style={{ fontSize: 16, color: COLORS.expense, fontWeight: 'bold' }}>
            Expense: XAF {expense?.toLocaleString() || 0}
          </Text>
        </View>
      </View>
    </View>
  );
}
