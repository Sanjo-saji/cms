import React, { useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Animated,
} from "react-native";

const AvailablebookCom = ({ image, bookName, author, onpress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        onPress={onpress}
        style={styles.contents}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.image} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.bookName}>{bookName}</Text>
          <Text style={styles.author}>{author}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AvailablebookCom;

const styles = StyleSheet.create({
  contents: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  imageContainer: {
    width: 53,
    height: 58,
    borderRadius: 4,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  bookName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  author: {
    fontSize: 14,
    color: "#aaa",
  },
});
