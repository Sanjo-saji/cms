import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import imagePath from "../../../app/constant/imagePath";
import React from "react";
import { router } from "expo-router";

const ModuleCom = ({module, subjectName,longpress}) => {
  return (
    <TouchableOpacity
      onLongPress={longpress}
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/screen/pages/Pdf",
          params: {
            moduleName: module.title,
            lectures: JSON.stringify(module.lectures) 
          },
        })
      }
    >
      <View style={styles.content}>
        <View style={styles.moduleimage}>
          <Image source={imagePath.ModuleIcon} style={styles.moduleIcon} />
        </View>
        <Text style={styles.moduleText}>{module.title}</Text>
      </View>
      <Text style={styles.subtitle}>Module {subjectName} </Text>
    </TouchableOpacity>
  );
};

export default ModuleCom; 

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#1A1C1E",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#3F3E3E",
    marginBottom:10,
  },
  content: {
    flexDirection: "row",
  },
  moduleimage: {
    position: "absolute",
    top: 5,
    width: 30,
    height: 30,
  },
  moduleIcon: {
    width: "100%",
    height: "100%",
    marginHorizontal: 15,
  },

  moduleText: {
    color: "white",
    fontSize: 18,
    fontWeight: "400",
    marginHorizontal: 70,
  },
  subtitle: {
    color: "white",
    fontSize: 14,
    opacity: 0.6,
    marginHorizontal: 70,
  },
})