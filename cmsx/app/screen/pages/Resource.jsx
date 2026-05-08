import { StyleSheet, Text, View, FlatList } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import ModuleCom from "../../../components/pages/Resource/ModuleCom";

const Resource = () => {
  const { subject } = useLocalSearchParams();
  const subjectData = subject ? JSON.parse(subject) : null;
  return (
    <FlatList
      data={subjectData?.modules || []}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <ModuleCom module={item} subjectName={subjectData.name} />
      )}
      contentContainerStyle={styles.container}
    />
  );
};

export default Resource;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
});
