import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import CircularProgress from "react-native-circular-progress-indicator";

const performanceCom = ({ name, image, percentage, attendance }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/screen/pages/Previous",
         params: {
        student: name,
        attendance: JSON.stringify(attendance),
      },
        })
      }
    >
      <View style={styles.content}>
        <View style={styles.studentImage}>
          <Image source={image} style={styles.StdentI} />
        </View>
        <Text style={styles.name}>{name}</Text>
      </View>
      <CircularProgress
        value={percentage}
        radius={30}
        duration={500}
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
    borderRadius: 10,
    marginHorizontal: 13,
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentImage: {
    width: 45,
    height: 45,
    marginRight: 10,
  },
  StdentI: {
    borderRadius: 22,
    width: "100%",
    height: "100%",
  },
  name: {
    color: "#E0DADA",
    fontSize: 16,
    marginLeft: 20,
  },
});
