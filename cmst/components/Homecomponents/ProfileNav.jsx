import { StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import imagePath from "../../app/constant/imagePath";
import { router } from "expo-router";

const ProfileNav = () => {
  return (
    <TouchableOpacity onPress={()=>router.push("screen/pages/Profile")}>
      <Image style={styles.profileStyle} source={imagePath.profileIcon} />
    </TouchableOpacity>
  );
};

export default ProfileNav;

const styles = StyleSheet.create({
  profileStyle: {
    width: 30,
    height: 30,
    marginVertical:10,
    marginHorizontal:10
  },
});
