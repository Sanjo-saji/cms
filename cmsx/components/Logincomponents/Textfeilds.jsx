import { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";

const Textfeilds = ({
  placeholder,
  iconss,
  text,
  setText,
  password = true,
  secureTextEntry = false,
}) => {
  const icons = iconss;
  const [hidePassword, setHidePassword] = useState(secureTextEntry);
  const togglePasswordVisibility = () => {
    setHidePassword(!hidePassword);
  };
  return (
    <View style={style.inputcontainer}>
      <TextInput
        style={style.input}
        placeholder={placeholder}
        value={text}
        onChangeText={(newtext) => setText(newtext)}
        placeholderTextColor="#CCCCCC"
        secureTextEntry={hidePassword}
      />
      {iconss && password ? (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Image style={style.reglogo} source={iconss} />
        </TouchableOpacity>
      ) : (
        iconss && <Image style={style.reglogo} source={iconss} />
      )}
    </View>
  );
};
export default Textfeilds;

const style = StyleSheet.create({
  inputcontainer: {
    flexDirection: "row",
    height: 57,
    width: "85%",
    borderColor: "#444444",
    borderRadius: 15,
    borderWidth: 3,
    marginHorizontal: 25,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "regular",
    color: "white",
  },
  reglogo: {
    height: 35,
    width: 35,
    opacity: 0.8,
  },
});
