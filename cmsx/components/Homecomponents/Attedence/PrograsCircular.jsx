import { StyleSheet, Text, View } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";

const PrograsCircular = ({ percentage }) => {
  return (
    <View style={styles.container}>
      <CircularProgress
        value={percentage}
        radius={58}
        duration={1000}
        progressValueColor={"#ecf0f1"}
        maxValue={100}
        activeStrokeColor={"#38C738"}
        valueSuffix={"%"}
        titleStyle={{ fontWeight: "bold" }}
      />
    </View>
  );
};
export default PrograsCircular;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: 170,
    height: 160,
    backgroundColor: "#1A1C1E",
    borderRadius: 10,
    marginVertical: 15,
    // marginHorizontal:20
  },
});
