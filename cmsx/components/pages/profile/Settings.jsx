import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import ToggleSwitch from "toggle-switch-react-native";
import * as SecureStore from "expo-secure-store";
import imagePath from "../../../app/constant/imagePath";
import React, { useState } from "react";
import { router } from "expo-router";
import API from "../../../app/API/api";

const Settings = () => {
  const [isNotificationOn, setNotificationOn] = useState(false);
  const logout = async () => {
    try {
      await API.post("auth/logout");
      await SecureStore.deleteItemAsync("stoken");
      router.replace("/screen/(Auth)");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <View style={styles.container}>
      {/* <View style={styles.NotificationContainer}>
        <Text style={styles.text}>Notification</Text>
        <ToggleSwitch
          isOn={isNotificationOn}
          onColor="green"
          offColor="red"
          size="medium"
          onToggle={(isOn) => setNotificationOn(isOn)}
        />
      </View> */}
      <TouchableOpacity
        style={styles.ChangePasswordContainer}
        onPress={() => router.push("/screen/pages/ChangePassword")}
      >
        <Text style={styles.text}>Change Password</Text>
        <View style={styles.changePassword}>
          <Image
            source={imagePath.ChangePasswordIcon}
            style={styles.changePasswordIcon}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.LogoutCotainer} onPress={logout}>
        <Text style={styles.text}>Logout</Text>
        <View style={styles.logout}>
          <Image source={imagePath.LogoutIcon} style={styles.logoutIcon} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    width: "92%",
    padding: 15,
    paddingVertical: 20,
    backgroundColor: "#1A1C1E",
    borderWidth: 1,
    borderColor: "#3F3E3E",
    borderRadius: 20,
  },
  NotificationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  ChangePasswordContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  changePassword: {
    width: 26,
    height: 26,
  },
  changePasswordIcon: {
    width: "100%",
    height: "100%",
    marginLeft: -10,
  },
  LogoutCotainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  logout: {
    width: 25,
    height: 25,
  },
  logoutIcon: {
    width: "100%",
    height: "100%",
    marginLeft: -10,
  },
  text: {
    color: "white",
    fontSize: 20,
    // paddingTop: 10,
  },
});
