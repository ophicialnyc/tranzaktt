import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { useTransactions } from "../../hooks/useTransactions";
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionItem } from "@/components/TransactionItem";
import NoTransactionsFound from "@/components/NoTransactionFound";
import { styles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { transactions, summary, isLoading, loadData, deleteTransaction } = useTransactions(user?.id);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Sort transactions by most recent (descending by created_at) and limit to 5
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    await loadData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          {/* LEFT */}
          <View style={styles.headerLeft}>
             <Image
              source={require("../../assets/images/tranzakt.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            /> 
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Hello,</Text>
              <Text style={styles.usernameText}>
                {user?.username[0]?.toUpperCase() + user?.username?.slice(1) || "User"}
              </Text>
            </View>
          </View>
          {/* RIGHT */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}> 
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <SignOutButton />
          </View>
        </View>

        <BalanceCard summary={summary} />

        <View style={[styles.transactionsHeaderContainer, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
          <Text style={[styles.sectionTitle, { marginBottom: 0, lineHeight: 28 }]}>Recent Transactions</Text>
          <Link href="/all-transactions" asChild>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text }}>See all</Text>
              <Ionicons name="arrow-forward-circle" size={22} color={COLORS.primary} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* FlatList is a performant way to render long lists in React Native. */}
      {/* it renders items lazily — only those on the screen. */}
      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={sortedTransactions}
        renderItem={({ item }) => <TransactionItem item={item} onDelete={handleDelete} />}
        ListEmptyComponent={<NoTransactionsFound />}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}