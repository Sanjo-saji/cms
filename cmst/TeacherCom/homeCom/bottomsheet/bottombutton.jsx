import { Text, TouchableOpacity } from "react-native";
const bottombutton = ({ text, check, onpress }) => {
  return (
    <TouchableOpacity
      style={{
        paddingHorizontal: 60,
        minWidth: 160,
        alignItems: "center",
        paddingVertical: 10,
        borderWidth: check ? 1 : 0,
        borderColor: "#3F3E3E",
        backgroundColor: check ? "#121212" : "#FFFFFF",
        marginLeft: check ? 0 : 15,
        borderRadius: 10,
      }}
      onPress={onpress}
    >
      <Text style={{ width: "100%", color: check ? "white" : "black" }}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default bottombutton;
