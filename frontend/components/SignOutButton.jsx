import React, { useState } from "react";
import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignOut = async () => {
    setModalVisible(false);
    console.log("Signing out...");
    await signOut();
    console.log("Signed out, redirecting...");
    router.replace("/(auth)/sign-in");
  };

  return (
    <>
      <TouchableOpacity style={styles.logoutButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <View style={{ backgroundColor: COLORS.card, padding: 24, borderRadius: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>Logout</Text>
            <Text style={{ fontSize: 16, marginBottom: 24 }}>Are you sure you want to logout?</Text>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10 }}>
                <Text style={{ color: COLORS.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSignOut} style={{ padding: 10 }}>
                <Text style={{ color: COLORS.expense, fontWeight: "bold" }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};