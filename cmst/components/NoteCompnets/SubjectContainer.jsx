import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";

const SubjectContainer = ({ text, image, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <Image source={{ uri: image }} style={styles.icon} />
        <Text style={styles.SubjectText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default SubjectContainer;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 153,
    backgroundColor: "#1A1C1E",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3F3E3E",
    margin: 10,
  },
  content: {
    alignItems: "center",
  },
  icon: {
    width: 50,
    height: 50,
  },
  SubjectText: {
    color: "white",
    fontSize: 16,
    fontWeight: "300",
  },
});
