import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import imagePath from "../../../app/constant/imagePath";
const TextTravel = ({ text }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.calenderImage}>
          <Image source={imagePath.calenderIcon} style={styles.calenderIcon} />
        </View>
        <Text style={styles.command}>{text}</Text>
      </View>
    </View>
  );
};

export default TextTravel;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1C1E",
    borderRadius: 15,
    width: 170,
    height: 54,
    justifyContent: "center",
    marginHorizontal: 5,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },

  calenderImage: {
    width: 26,
    height: 26,
    marginHorizontal: 15,
  },
  calenderIcon: {
    width: "100%",
    height: "100%",
  },
  command: {
    color: "white",
    fontSize: 16,
    fontWeight: "light",
  },
});
