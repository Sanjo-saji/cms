import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import API from "../../API/api";
import { router } from "expo-router";

const Chat = () => {
  const [contacts, setContacts] = useState([]);
  const navigation = useNavigation();

  // Load teacher chat threads (anonId-based)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await API.get("/chat/teacher/chats");
        const students = Array.isArray(response.data?.students)
          ? response.data.students
          : [];
        
        // Flatten all anonIds for display
        const allContacts = [];
        students.forEach((student, studentIdx) => {
          if (student.anonIds && Array.isArray(student.anonIds)) {
            student.anonIds.forEach((anonIdInfo, anonIdx) => {
              allContacts.push({
                id: `${student.studentId}-${anonIdInfo.anonId}`,
                anonId: anonIdInfo.anonId,
                studentId: student.studentId,
                messageCount: anonIdInfo.messageCount ?? 0,
                lastActivity: anonIdInfo.lastActivity || null,
                isActive: anonIdInfo.isActive,
                createdAt: anonIdInfo.createdAt,
                deactivatedAt: anonIdInfo.deactivatedAt,
                totalMessages: student.totalMessages,
                hasMultipleIds: student.anonIds.length > 1,
              });
            });
          }
        });
        
        setContacts(allContacts);
      } catch (error) {
        console.error(error);
        setContacts([]);
      }
    };
    fetchContacts();
  }, []);

  const handlePress = (item) => {
    router.push({
      pathname: "/screen/pages/ChatScreen",
      params: {
        id: item.anonId,
        name: item.anonId,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      {/* Contact List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={styles.item}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.anonId ? item.anonId.substring(0, 2).toUpperCase() : "?"}
                </Text>
              </View>
              <View>
                <Text style={styles.text}>
                  {item.anonId}
                  {!item.isActive && ' (Inactive)'}
                  {item.hasMultipleIds && ' (Multiple IDs)'}
                </Text>
                <Text style={styles.subText}>
                  {item.messageCount} messages
                  {item.totalMessages > item.messageCount && 
                    ` (${item.totalMessages} total)`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

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
  text: {
    color: "#fff",
    fontSize: 18,
  },
  subText: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 2,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#23272F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
