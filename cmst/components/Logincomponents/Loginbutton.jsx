import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
const Loginbutton = ({ onpress }) => {
  return (
    <TouchableOpacity style={style.loginbutton} onPress={onpress}>
      <Text style={style.LoginText}>Login</Text>
    </TouchableOpacity>
  );
};

export default Loginbutton;

const style = StyleSheet.create({
  loginbutton: {
    height: 55,
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    justifyContent: "center",
    marginHorizontal: 25,
  },
  LoginText: {
    fontWeight: "600",
    fontSize: 25,
    textAlign: "center",
  },
});
