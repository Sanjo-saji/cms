import React from "react";
import {
  Text,
  Image,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

const BookDetails = () => {
  const { book } = useLocalSearchParams();
  const parsedBook = JSON.parse(book);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: parsedBook.cover }} style={styles.image} />
        </View>
        <Text style={styles.title}>{parsedBook.title}</Text>
        <Text style={styles.author}>by {parsedBook.authors?.join(", ") || "Unknown"}</Text>
        <Text style={styles.description}>
          {parsedBook.description || "No description available."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    paddingHorizontal: 15,
    marginLeft: 8,
    alignItems: "center",
  },
  imageContainer: {
    width: 360,
    height: 260,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  author: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  description: {
    color: "#aaa",
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
  },
});
