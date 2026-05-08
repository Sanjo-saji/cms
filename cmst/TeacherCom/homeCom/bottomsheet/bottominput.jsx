import { StyleSheet, Text, View, TextInput } from "react-native";
import React from "react";

const bottominput = ({ placeholder, value, onChange }) => {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#888"
        style={styles.input}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
};

export default bottominput;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 57,
    alignSelf: "center",
    width: "97%",
    borderColor: "#444444",
    borderBottomWidth: 3,
    marginHorizontal: 0,
    marginVertical: 20,
    paddingHorizontal: 10,
    paddingVertical: 1,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  input: {
    height: 50,
    width: "90%",
    fontSize: 20,
    color: "white",
  },
});
