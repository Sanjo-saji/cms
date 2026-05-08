import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

const Floatbutton = ({ onPress, icon, label, disabled }) => {
  return (
    <FAB
      icon={icon}
      label={label}
      style={[styles.fab, disabled && styles.disabled]}
      onPress={onPress}
      variant={label ? "extended" : "surface"}
      disabled={disabled}
    />
  );
};

export default Floatbutton;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 20,
    right: 0,
    bottom: 20,
    backgroundColor: "white",
  },
  disabled: {
    backgroundColor: "#ccc",
  },
});
