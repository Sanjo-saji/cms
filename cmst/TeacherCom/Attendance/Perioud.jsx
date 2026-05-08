import { TouchableOpacity, StyleSheet, Text } from "react-native";
import Roman from "./Roman";
const Period = ({ text, current, completed, onPress, selected }) => {
  const roman = Roman({ number: text });
  let bgColor = "#1A1C1E";

  if (completed) {
    bgColor = "#4CAF50";
  } else if (current) {
    bgColor = "#1A1C1E";
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: bgColor },
        current && styles.activeContainer,
        selected && styles.selectedContainer,
      ]}
    >
      <Text style={styles.text}>{roman}</Text>
    </TouchableOpacity>
  );
};
export default Period;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1C1E",
    borderRadius: "100%",
    width: "38%",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 2,
    marginRight: 10,
    borderColor: "#3F3E3E",
  },
  activeContainer: {
    borderColor: "#c9ae36",
  },
  selectedContainer: {
    borderColor: "#2196F3",
  },
  text: {
    color: "#c9ae36",
    fontSize: 16,
    fontWeight: "bold",
  },
});
