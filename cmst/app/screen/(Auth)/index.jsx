import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useState } from "react";
import { Snackbar } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import Heading from "@/components/Logincomponents/Heading";
import Logocmx from "@/components/Logincomponents/Logocmx";
import Textfeilds from "@/components/Logincomponents/Textfeilds";
import Loginbutton from "@/components/Logincomponents/Loginbutton";
import imagePath from "../../constant/imagePath";
import imagepath_t from "../../constant/imagepath_t";
import API from "../../API/api";
import { useRouter } from "expo-router";
export default function Studentlogin() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const onDismissSnackBar = () => setVisible(false);
  const handleLogin = async () => {
    try {
      const response = await API.post(
        "/auth/login-t",
        {
          employeeId,
          password,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        const token = response.data.token;
        await SecureStore.setItemAsync("ttoken", token);
        if (token) {
          router.replace("/screen/introduction");
        }
        setMessage(response.data.message);
      } else {
        setMessage("Login Failed", response.data.message);
      }
      setVisible(true);
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
      console.log(error);
      setVisible(true);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback>
        <ScrollView
          contentContainerStyle={style.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* content */}

          <Heading />
          <Logocmx logo={imagepath_t.cmstIcon} />

          {/* Register number */}
          <Textfeilds
            placeholder={"Employee id"}
            iconss={imagePath.regicon}
            text={employeeId}
            setText={setEmployeeId}
          />

          {/* password */}
          <Textfeilds
            placeholder={"Password"}
            iconss={imagePath.passicon}
            text={password}
            setText={setPassword}
            secureTextEntry={true}
          />

          {/* Loginbutton */}
          <Loginbutton onpress={handleLogin} />
          <Snackbar visible={visible} onDismiss={onDismissSnackBar}>
            {message}
          </Snackbar>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const style = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#121212",
  },
});
