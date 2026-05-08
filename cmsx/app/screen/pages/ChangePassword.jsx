import { StyleSheet, View, TouchableOpacity, Text, Alert } from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator } from "react-native";
import { Snackbar } from "react-native-paper";
import Textfeilds from "../../../components/Logincomponents/Textfeilds";
import imagePath from "../../constant/imagePath";
import API from "../../API/api";

const ChangePassword = () => {
  const [CurrentPassword, setCurrentpassword] = useState("");
  const [NewPassword, setNewpassword] = useState("");
  const [ConfirmPassword, setConfirmpassword] = useState("");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const onDismissSnackBar = () => setVisible(false);
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await API.post("/auth/update-password", {
        password: CurrentPassword,
        newPassword: NewPassword,
        confirmPass: ConfirmPassword,
      });

      setMessage(response.data.message);
      setVisible(true);

      if (response.data.success) {
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Unexpected error occurred");
      }
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Textfeilds
        placeholder={"Current Password"}
        iconss={imagePath.passicon}
        text={CurrentPassword}
        setText={setCurrentpassword}
        secureTextEntry={true}
      />
      <Textfeilds
        placeholder={"New Password"}
        iconss={imagePath.currentIcon}
        text={NewPassword}
        setText={setNewpassword}
        secureTextEntry={true}
      />
      <Textfeilds
        placeholder={"Confirm Password"}
        iconss={null}
        text={ConfirmPassword}
        setText={setConfirmpassword}
        secureTextEntry={true}
      />
      <TouchableOpacity style={styles.loginbutton} onPress={handleUpdate}>
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.LoginText}>Update</Text>
        )}
      </TouchableOpacity>
      <Snackbar visible={visible} onDismiss={onDismissSnackBar}>
        {message}
      </Snackbar>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingVertical: 40,
  },
  loginbutton: {
    height: 55,
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    justifyContent: "center",
    marginHorizontal: 25,
  },
  LoginText: {
    fontWeight: "600",
    fontSize: 25,
    textAlign: "center",
  },
});
