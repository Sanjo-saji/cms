import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import NotificationCom from "../../../components/pages/Notification/NotificationCom";
import { Searchbar } from "react-native-paper";
import React, { useEffect, useState } from "react";
import API from "../../API/api";
const Notification = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const getNotifications = async () => {
      const response = await API.get("/data/notifications");
      setData(response.data.msg);
    };
    getNotifications();
  }, []);

  const filterData = data.filter(
    (item) =>
      item.Heading?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeContainer}>
        <Searchbar
          placeholder="Search"
          onChangeText={(query) => setSearchQuery(query)}
          value={searchQuery}
          style={{
            backgroundColor: "#1A1C1E",
            borderWidth: 1,
            borderColor: "#3F3E3E",
            borderRadius: 20,
            marginTop: 10,
            width: "92%",
          }}
          inputStyle={{
            color: "#fff",
          }}
          iconColor="#fff"
          selectionColor="#fff"
          placeholderTextColor="#fff"
        />
        <FlatList
          data={filterData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationCom
              Heading={item.heading}
              date={item.date}
              content={item.content}
              sender={item.sender}
            />
          )}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Notification;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#121212",
    paddingTop: 10,
  },
});
