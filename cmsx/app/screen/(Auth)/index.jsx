import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Snackbar } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import Heading from "@/components/Logincomponents/Heading";
import Logocmx from "@/components/Logincomponents/Logocmx";
import Textfeilds from "@/components/Logincomponents/Textfeilds";
import Loginbutton from "@/components/Logincomponents/Loginbutton";
import imagePath from "@/app/constant/imagePath";
import API from "../../API/api";
export default function Studentlogin() {
  const [register, setRegtext] = useState("");
  const [password, setPasstext] = useState("");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const onDismissSnackBar = () => setVisible(false);
  const handleLogin = async () => {
    try {
      const response = await API.post(
        "/auth/login",
        {
          register,
          password,
        },
        { withCredentials: true },
      );
      if (response.data.success) {
        const token = response.data.token;
        await SecureStore.setItemAsync("stoken", token);
        if (token) {
          router.replace("/screen/(tabs)");
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
          <Logocmx logo={imagePath.logocmx} />
          {/* Register number */}
          <Textfeilds
            placeholder={"Register number"}
            iconss={imagePath.regicon}
            text={register}
            setText={setRegtext}
            password={false}
          />
          {/* password */}
          <Textfeilds
            placeholder={"Password"}
            iconss={imagePath.passicon}
            text={password}
            setText={setPasstext}
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
