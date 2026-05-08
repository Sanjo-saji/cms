import { TouchableOpacity, StyleSheet, Text } from "react-native";
const Close = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.closeButton} onPress={onPress}>
      <Text style={styles.closeText}>Close</Text>
    </TouchableOpacity>
  );
};

export default Close;

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 10,
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
  },
});
