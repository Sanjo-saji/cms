import { StyleSheet, Text, View } from "react-native";
import React from "react";
import PerformanceDe from "../../../components/pages/performence/PerformanceDe";

const PerformanceDetails = () => {
  return (
    <View style={styles.container}>
      <PerformanceDe />
    </View>
  );
};

export default PerformanceDetails;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 5, backgroundColor: "#121212" },
});
