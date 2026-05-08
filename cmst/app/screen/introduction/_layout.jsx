import { Stack } from "expo-router";
import { StatusBar } from "react-native";

const IntroductionLayout = () => {
  return (
    <>
      <StatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="CourseSemesterContext" />
      </Stack>
    </>
  );
};

export default IntroductionLayout;
