import { View, Text, StyleSheet } from "react-native";
import React from "react";

const Heading = () => {
  return (
    <View style={style.heading}>
      <Text style={style.headingText}>Hey Welcome, </Text>
      <Text style={style.headingText}>to IHRD Kundara </Text>
    </View>
  );
};

export default Heading;

const style = StyleSheet.create({
  heading: {
    marginTop: 70,
    marginLeft: 36,
  },
  headingText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight:"regular",
  },
});
