import { View, Text, TouchableOpacity, Modal } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import { formatDate } from "../lib/utils";

// Map categories to their respective icons
const CATEGORY_ICONS = {
  "Food & Drinks": "fast-food",
  Shopping: "cart",
  Transportation: "car",
  Entertainment: "film",
  Bills: "receipt",
  Income: "cash",
  Other: "ellipsis-horizontal",
};

export const TransactionItem = ({ item, onDelete }) => {
  const isIncome = parseFloat(item.amount) > 0;
  const iconName = CATEGORY_ICONS[item.category] || "pricetag-outline";
  const [modalVisible, setModalVisible] = React.useState(false);
  const [confirmVisible, setConfirmVisible] = React.useState(false);

  return (
    <View style={styles.transactionCard} key={item.id}>
      <TouchableOpacity style={styles.transactionContent}>
        <View style={styles.categoryIconContainer}>
          <Ionicons name={iconName} size={22} color={isIncome ? COLORS.income : COLORS.expense} />
        </View>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[styles.transactionAmount, { color: isIncome ? COLORS.income : COLORS.expense }]}
          >
            {isIncome ? "+" : "-"}FCFA{Math.abs(parseFloat(item.amount)).toFixed(2)}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="trash-outline" size={20} color={COLORS.expense} />
      </TouchableOpacity>
      {/* Delete Confirmation Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <View style={{ backgroundColor: COLORS.card, padding: 24, borderRadius: 16, alignItems: "center", width: 320, }}>
           
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" }}>Delete Transaction</Text>
            <Text style={{ fontSize: 16, marginBottom: 24, textAlign: "center" }}>Are you sure you want to delete this transaction?</Text>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10 }}>
                <Text style={{ color: COLORS.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                onDelete(item.id);
                setTimeout(() => setConfirmVisible(true), 200);
              }} style={{ padding: 10 }}>
                <Text style={{ color: COLORS.expense, fontWeight: "bold" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Delete Success Modal */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <View style={{ backgroundColor: COLORS.card, padding: 24, borderRadius: 16, alignItems: "center", width: 320 }}>
            <Ionicons name="checkmark-circle" size={40} color={COLORS.primary} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" }}>Deleted</Text>
            <Text style={{ fontSize: 16, marginBottom: 24, textAlign: "center" }}>Transaction deleted successfully.</Text>
            <TouchableOpacity onPress={() => setConfirmVisible(false)} style={{ padding: 10 }}>
              <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};