import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import imagePath from "../../../app/constant/imagePath";
const PageNavigate = ({ image, text, marginArow, navigate }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(navigate)}
    >
      <View style={styles.pageIcon}>
        <Image source={image} style={styles.pageImage} />
      </View>
      <Text style={styles.pageText}>{text}</Text>
      <View style={{ width: 24, height: 24, marginLeft: marginArow ? 16 : 60 }}>
        <Image source={imagePath.RightArowIcon} style={styles.rightarowStyle} />
      </View>
    </TouchableOpacity>
  );
};

export default PageNavigate;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "95%",
    height: 87,
    backgroundColor: "#1A1C1E",
    borderRadius: 15,
    marginHorizontal: 12,
    marginTop: 2,
    alignItems: "center",
  },

  pageIcon: {
    position: "absolute",
    width: 42,
    height: 42,
    left: 15,
  },
  pageImage: {
    width: "100%",
    height: "100%",
  },
  pageText: {
    marginHorizontal: 90,
    fontSize: 22,
    color: "white",
  },
  rightarowStyle: {
    width: "100%",
    height: "100%",
  },
});
