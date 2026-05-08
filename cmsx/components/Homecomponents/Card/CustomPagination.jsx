import { StyleSheet, View } from "react-native";
import React from "react";

const CustomPagination = ({
  length,
  activeIndex,
  activeColor,
  inactiveColor,
  dotSize,
}) => {
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor:
                activeIndex == index ? activeColor : inactiveColor,
              width: dotSize,
              height: dotSize,
            },
          ]}
        ></View>
      ))}
    </View>
  );
};

export default CustomPagination;

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent:"center"
  },

  dot: {
    marginHorizontal: 5,
    borderRadius: 50,
  },
});
