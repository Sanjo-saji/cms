import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

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
