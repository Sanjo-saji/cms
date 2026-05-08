import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";
const LoginLayout = () => {
  return (
    <>
      <StatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
};

export default LoginLayout;
