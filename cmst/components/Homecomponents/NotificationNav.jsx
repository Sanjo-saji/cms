import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import imagePath from "../../app/constant/imagePath";

import React from "react";

const NotificationNav = () => {
  return (
    <TouchableOpacity onPress={() => router.push("/screen/pages/Notification")}>
      <Image
        style={styles.notificationStyle}
        source={imagePath.notificationIcon}
      />
    </TouchableOpacity>
  );
};

export default NotificationNav;

const styles = StyleSheet.create({
  notificationStyle: {
    width: 30,
    height: 30,
    marginRight: 10,
    marginTop: 10,
  },
});
