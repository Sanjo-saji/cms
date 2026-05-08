import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import Checkbox from "expo-checkbox";
import imagepath_t from "../../app/constant/imagepath_t";

const Attedance = ({ rollno, image, name, isChecked, onToggle }) => {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.container}>
      <View style={styles.firstContainer}>
        <Text style={{ color: "#FFFFFF" }}>{rollno}</Text>
        <View style={styles.ImageContainer}>
          <Image
            source={image ? { uri: image } : imagepath_t.placeholder}
            style={styles.image} // Apply the style here
          />
        </View>
        <Text style={styles.name}>{name}</Text>
      </View>
      <Checkbox
        value={isChecked}
        onValueChange={onToggle}
        color={isChecked ? "green" : undefined}
        style={styles.checkBox}
      />
    </TouchableOpacity>
  );
};

export default Attedance;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1A1C1E",
    alignItems: "center",
    justifyContent: "space-between",
    width: "97%",
    padding: 5,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#3F3E3E",
    marginBottom: 10,
  },
  firstContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 20,
  },
  ImageContainer: {
    width: 50,
    height: 50,
    marginLeft: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 25, // For a perfect circle, this should be half of the width/height
  },
  checkBox: {
    padding: 10,
    marginRight: 10,
  },
});
