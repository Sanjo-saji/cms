import { StyleSheet, Text, View, Image } from "react-native";

const CustomCard = ({ image, title, Subtitle }) => {
  // check if `image` is a string (URL) or a local require()
  const imageSource = typeof image === "string" ? { uri: image } : image;

  return (
    <View style={styles.cardContainer}>
      <Image source={imageSource} style={styles.backgroundImage} />
      <View style={styles.overlay} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{Subtitle}</Text>
    </View>
  );
};

export default CustomCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: "95%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  cardTitle: {
    position: "absolute",
    top: 20,
    left: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  cardSubtitle: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 10,
    fontSize: 16,
    color: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
});
