import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const storedToken = await SecureStore.getItemAsync("ttoken");
      setToken(storedToken);
      setChecking(false);
    };
    checkLogin();
  }, []);

  if (checking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#121212",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/screen/introduction" />;
  } else {
    return <Redirect href="/screen/(Auth)" />;
  }
}
