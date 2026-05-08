import { StyleSheet, View, Image } from "react-native";
import React from "react";
import imagePath from "../../app/constant/imagePath";

const Cmslogo = () => {
  return <Image style={styles.cmslogoStyle} source={imagePath.cmsLogo} />;
};

export default Cmslogo;

const styles = StyleSheet.create({
  cmslogoStyle: {
    height: 57,
    width: 96,
    marginLeft: 20,
  },
});
