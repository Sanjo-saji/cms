import { StyleSheet, Text, View } from "react-native";

import React from "react";

const Days = ({ days, totalDay }) => {
  return (
    <View style={styles.container}>
      <View style={styles.DaysText}>
        <Text style={styles.PersentDay}>{days}</Text>
        <Text style={styles.TotalDay}>/{totalDay}</Text>
      </View>
      <Text style={styles.day}>Days</Text>
    </View>
  );
};

export default Days;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: 170,
    height: 160,
    backgroundColor: "#1A1C1E",
    borderRadius: 10,
    marginVertical: 15,
    marginHorizontal: 20,
  },

  DaysText: {
    flexDirection: "row",
  },

  PersentDay: {
    fontSize: 35,
    color: "#38C738",
    fontWeight: "bold",
  },
  TotalDay: {
    color: "white",
    fontSize: 35,
    fontWeight: "bold",
  },
  day: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
});
