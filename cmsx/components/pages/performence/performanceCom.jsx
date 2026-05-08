import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import CircularProgress from "react-native-circular-progress-indicator";

const performanceCom = ({ name, image, performance, percentage }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/screen/pages/PerformanceDetails",
          params: { subject: name },
        })
      }
    >
      <View style={styles.content}>
        <View style={styles.subjectIcon}>
          <Image source={{ uri: image }} style={styles.SubjecImage} />
        </View>
        <View>
          <Text style={styles.HeadingsSubject}>{name}</Text>
          <Text style={styles.vlauesText}>Performance: {performance}</Text>
        </View>
      </View>
      <CircularProgress
        value={percentage}
        radius={30}
        duration={1000}
        progressValueColor={"#ecf0f1"}
        maxValue={100}
        activeStrokeColor={"#38C738"}
        valueSuffix={"%"}
        titleStyle={{ fontWeight: "bold" }}
      />
    </TouchableOpacity>
  );
};

export default performanceCom;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "90%",
    height: 90,
    backgroundColor: "#1A1C1E",
    borderRadius: 15,
    marginHorizontal: 13,
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },

  content: {
    flexDirection: "row",
  },

  subjectIcon: {
    width: 45,
    height: 45,
    marginRight: 10,
  },
  SubjecImage: {
    width: "100%",
    height: "100%",
  },

  HeadingsSubject: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },

  vlauesText: {
    color: "#E0DADA",
    fontSize: 13,
    marginTop: 2,
  },
});
