import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import React from "react";

const NotificationDetails = () => {
  const { Heading, content, date, sender } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{Heading}</Text>
      <Text style={styles.date}>{date}</Text>
      <View style={styles.MessageContainer}>
        <Text style={styles.content}>{content}</Text>
        <Text style={styles.SenderName}> - {sender}</Text>
      </View>
    </View>
  );
};

export default NotificationDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  heading: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  date: {
    color: "#B0B0B0",
    fontSize: 12,
    marginBottom: 20,
  },
  MessageContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#3F3E3E",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  content: {
    color: "white",
    fontSize: 16,
    marginBottom: 15,
  },
  SenderName: {
    color: "white",
    fontSize: 14,
    textAlign: "right",
  },
});
