import { StyleSheet, Text, View } from "react-native";
import React from "react";

const ScheduleCom = ({ Class, section, subject, time }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.headerText}>Class</Text>
          <Text style={styles.contentText}>{Class?.name || "N/A"}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.headerText}>Section</Text>
          <Text style={styles.contentText}>{section?.name || "N/A"}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.headerText}>Subject</Text>
          <Text style={styles.contentText}>{subject?.name || "N/A"}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.headerText}>Time</Text>
          <Text style={styles.contentText}>{time || "N/A"}</Text>
        </View>
      </View>
    </View>
  );
};

export default ScheduleCom;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1C1E",
    width: 360,
    padding: 5,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#3F3E3E",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    alignItems: "center",
    flex: 1,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  contentText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
