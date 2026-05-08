import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CourseSemesterProvider } from "../app/screen/introduction/CourseSemesterContext"; 

const RootLayout = () => {
  return (
    <CourseSemesterProvider>
      <StatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </CourseSemesterProvider>
  );
};

export default RootLayout;
