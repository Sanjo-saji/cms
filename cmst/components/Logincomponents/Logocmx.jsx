import { View, Image, StyleSheet } from "react-native";
import React from "react";



const Logocmx = ({logo} ) => {
  return (
    <View style={style.logocontainer}>
      <Image style={style.logocmx} source={logo} />
    </View>
  );
};

export default Logocmx;

const style = StyleSheet.create({
  logocontainer: { marginTop: 70, marginLeft: 85, marginBottom: 40 },

  logocmx: {
    width: 218,
    height: 215,
  },
});
