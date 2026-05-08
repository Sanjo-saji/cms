import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

const RootLayout = () => {
  return (
    <>
      <StatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
};

export default RootLayout;
