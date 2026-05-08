import { StyleSheet, Text, View } from "react-native";
import ProfileCom from "../../../components/pages/profile/ProfileCom";
import Settings from "../../../components/pages/profile/Settings";
import React from "react";

const Profile = () => {
  return (
    <View style={styles.container}>
      <ProfileCom />
      <View style={styles.settingWrapper}>
        <Text style={styles.settingText}>Setting</Text>
      </View>
      <Settings />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#121212",
    paddingVertical: 15,
  },
  settingWrapper: {
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  settingText: {
    color: "white",
    fontSize: 25,
    textAlign: "left",
  },
});
