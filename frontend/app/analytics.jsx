import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useTransactions } from "../hooks/useTransactions";
import { styles } from "../assets/styles/home.styles";
import { LineChart, PieChart } from "react-native-chart-kit";
import { COLORS } from "../constants/colors";
import AppHeader from "../components/AppHeader";
import { useRouter } from "expo-router";

export default function Analytics() {
  const router = useRouter();
  const { user } = useUser();
  const { transactions, loadData } = useTransactions(user?.id);

  const [periodFilter, setPeriodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // --------------------------
  // Filter by period
  // --------------------------
  const getPeriodFilteredTransactions = () => {
    const now = new Date();
    if (!transactions) return [];

    if (periodFilter === "all") return transactions;

    if (periodFilter === "day") {
      return transactions.filter((tx) => {
        const txDate = new Date(tx.created_at);
        return (
          txDate.getDate() === now.getDate() &&
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear()
        );
      });
    }

    if (periodFilter === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return transactions.filter((tx) => {
        const txDate = new Date(tx.created_at);
        return txDate >= startOfWeek && txDate <= endOfWeek;
      });
    }

    if (periodFilter === "month") {
      return transactions.filter((tx) => {
        const txDate = new Date(tx.created_at);
        return (
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear()
        );
      });
    }

    if (periodFilter === "year") {
      return transactions.filter(
        (tx) => new Date(tx.created_at).getFullYear() === now.getFullYear()
      );
    }

    return transactions;
  };

  // --------------------------
  // Filter by type (income/expense/all)
  // --------------------------
  const getTypeFilteredTransactions = (txs) => {
    if (typeFilter === "all") return txs;
    if (typeFilter === "income") return txs.filter((tx) => tx.type === "income");
    if (typeFilter === "expense")
      return txs.filter((tx) => tx.type === "expense");
    return txs;
  };

  // Final filtered transactions (sorted)
  const filtered = [
    ...getTypeFilteredTransactions(getPeriodFilteredTransactions()),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // --------------------------
  // Trends: group by period
  // --------------------------
  function getTrendLabelsAndData(period) {
    const map = {};

    filtered.forEach((tx) => {
      let label;
      const date = new Date(tx.created_at);

      if (period === "day") {
        label = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (period === "week" || period === "month") {
        label = date.toLocaleDateString();
      } else if (period === "year") {
        label = date.toLocaleDateString([], { month: "short" });
      } else {
        label = date.toLocaleDateString();
      }

      if (!map[label]) map[label] = { income: 0, expense: 0 };
      if (tx.type === "income") map[label].income += tx.amount;
      if (tx.type === "expense") map[label].expense += tx.amount;
    });

    const labels = Object.keys(map);
    const incomeData = labels.map((l) => map[l].income);
    const expenseData = labels.map((l) => map[l].expense);

    return { labels, incomeData, expenseData };
  }

  const { labels: trendLabels, incomeData, expenseData } =
    getTrendLabelsAndData(periodFilter);

  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        data: incomeData,
        color: () => COLORS.income,
        strokeWidth: 3,
      },
      {
        data: expenseData,
        color: () => COLORS.expense,
        strokeWidth: 3,
      },
    ],
  };

  // --------------------------
  // Totals
  // --------------------------
  const income = filtered
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expense = filtered
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <View style={{ flex: 1, backgroundColor: styles.container.backgroundColor }}>
      

      <AppHeader title="Analytics" showBack={true} />

      {/* Period Filter */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 8,
          gap: 12,
        }}
      >
        {["all", "day", "week", "month", "year"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setPeriodFilter(f)}
            style={{
              backgroundColor:
                periodFilter === f ? COLORS.primary : COLORS.card,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                color: periodFilter === f ? COLORS.white : COLORS.text,
                fontWeight: "bold",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

        

      {/* Breakdown */}
      <ScrollView contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

        {/* Line Chart (Trends) */}
        {trendLabels.length > 0 ? (
          <LineChart
            data={trendChartData}
            width={Dimensions.get("window").width - 40}
            height={250}
            chartConfig={{      
              backgroundColor: styles.container.backgroundColor,
              color: () => COLORS.primary,
              labelColor: () => COLORS.background,
            }}
            bezier
            style={{ marginVertical: 16, borderRadius: 16 }}
          />
        ) : (
          <Text style={{ color: COLORS.textLight, marginTop: 12 }}>
            No trend data for this period.
          </Text>
        )} 
        
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: COLORS.primary,
            marginBottom: 8,
          }}
        >
          Transactions Breakdown
        </Text>


        {/* Pie Chart */}
        {income + expense > 0 ? (
          <PieChart
            data={[
              {
                name: "Income",
                population: Math.abs(income),
                color: COLORS.income,
                legendFontColor: COLORS.text,
                legendFontSize: 14,
              },
              {
                name: "Expense",
                population: Math.abs(expense),
                color: COLORS.expense,
                legendFontColor: COLORS.text,
                legendFontSize: 14,
              },
            ]}
            width={Dimensions.get("window").width - 40}
            height={220}
            chartConfig={{
              color: () => COLORS.primary,
              labelColor: () => COLORS.text,
            }}
            accessor="population"
            backgroundColor={styles.container.backgroundColor}
            paddingLeft={16}
            absolute
          />
        ) : (
          <Text style={{ color: COLORS.textLight, marginTop: 8 }}>
            No transaction data for this period.
          </Text>
        )}

        {/* Totals */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: Dimensions.get("window").width - 40,
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.income, fontWeight: "bold" }}>
            Income: XAF {income.toLocaleString()}
          </Text>
          <Text style={{ fontSize: 16, color: COLORS.expense, fontWeight: "bold" }}>
            Expense: XAF {expense.toLocaleString()}
          </Text>
        </View>

        
      </ScrollView>
    </View>
  );
}
