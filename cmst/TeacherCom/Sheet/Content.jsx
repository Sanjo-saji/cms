import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
const Content = ({ image, text, onpress }) => {
  return (
    <TouchableOpacity style={styles.content} onPress={onpress}>
      <View style={{ width: 30, height: 30 }}>
        <Image source={image} style={{ width: "100%", height: "100%" }} />
      </View>
      <Text style={{ color: "white", fontSize: 16, marginLeft: 10 }}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default Content;

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    marginBottom: 10,
  },
});
