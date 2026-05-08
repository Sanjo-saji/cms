import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import API from "../../API/api";
import { router } from "expo-router";

const Chat = () => {
  const [contacts, setContacts] = useState([]);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [toast, setToast] = useState(null);

  // Handler for regenerate anon id
  const handleRegenerateAnonId = async () => {
    setModalVisible(true);
  };

  const handleConfirmReset = async () => {
    setModalVisible(false);
    try {
      // --- CORRECTED PATH ---
      const response = await API.post("/anonymous/student/reset-all");

      if (response.status === 200) {
        setToast({
          type: "success",
          message: "Your anonymous ID has been reset for all chats.",
        });
      } else {
        setToast({
          type: "error",
          message: response.data.message || "An unexpected error occurred.",
        });
      }
    } catch (error) {
      console.error("Reset error:", error);
      setToast({
        type: "error",
        message: "Failed to reset anonymous ID. Please try again.",
      });
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch teachers for the student to chat with
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // --- CORRECTED PATH ---
        const response = await API.get("/data/teachers-by-course-semester");
        setContacts(
          Array.isArray(response.data.teachers) ? response.data.teachers : []
        );
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setContacts([]);
      }
    };
    fetchContacts();
  }, []);

  const handlePress = (item) => {
    router.push({
      pathname: "/screen/pages/ChatScreen",
      params: {
        id: item._id,
        name: item.name,
        image: item.image,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Teacher Chats</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleRegenerateAnonId}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconReset}>⟳</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Custom Modal for confirmation */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Anonymous ID</Text>
            <Text style={styles.modalMessage}>
              This will reset your anonymous ID and update all existing chats.
              Old messages will become untraceable for privacy. Continue?
            </Text>
            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.continueButton]}
                onPress={handleConfirmReset}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Feedback Toast */}
      {toast && (
        <View
          style={[
            styles.toast,
            toast.type === "success" ? styles.toastSuccess : styles.toastError,
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}

      <FlatList
        data={contacts}
        keyExtractor={(item, index) =>
          item && item._id ? item._id.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={styles.item}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.name ? item.name.charAt(0).toUpperCase() : "T"}
                  </Text>
                </View>
              )}
              <View style={styles.contactInfo}>
                <Text style={styles.text}>{item.name}</Text>
                <Text style={styles.subText}>Tap to start chatting</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No teachers available</Text>
            <Text style={styles.emptySubtext}>
              Teachers will appear here when available for your course
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
    backgroundColor: "#121212",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 1,
    borderBottomColor: "#333",
    borderBottomWidth: 0.2,
  },
  contactInfo: {
    flex: 1,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  subText: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4F8EF7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  resetButton: {
    marginLeft: 10,
    padding: 0,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#23272F",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  iconReset: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#23272F",
    borderRadius: 16,
    padding: 24,
    width: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    color: "#ccc",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#444",
  },
  continueButton: {
    backgroundColor: "#fff",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  continueButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  feedbackContent: {
    backgroundColor: "#23272F",
    borderRadius: 12,
    padding: 20,
    minWidth: 200,
    alignItems: "center",
  },
  successText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF5252",
    fontSize: 16,
    fontWeight: "bold",
  },
  toast: {
    position: "absolute",
    bottom: 40,
    left: 30,
    right: 30,
    backgroundColor: "#23272F",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  toastSuccess: {
    // No border
  },
  toastError: {
    // No border
  },
  toastText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
});
