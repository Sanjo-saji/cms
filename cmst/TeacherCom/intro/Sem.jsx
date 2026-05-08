import { StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";
import { useCourseSemester } from "../../app/screen/introduction/CourseSemesterContext";

const { width } = Dimensions.get("window");
const cardWidth = (width - 60) / 2; // 20 padding + 2*10 margin

const Sem = ({ cousername, Semname, semId, couId }) => {
  const { setCourseId, setSemesterId } = useCourseSemester();

  return (
    <TouchableOpacity
      onPress={() => {
        if (couId && semId) {
          setCourseId(couId);
          setSemesterId(semId);
          router.push("/screen/(tabs)");
        } else {
          console.warn("Invalid course or semester");
        }
      }}
      style={styles.container}
    >
      <Text style={styles.text}>{cousername}</Text>
      <Text style={styles.Semtext}>{Semname}</Text>
    </TouchableOpacity>
  );
};

export default Sem;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: cardWidth, // fit 2 columns
    backgroundColor: "#1A1C1E",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3F3E3E",
    margin: 10,
    paddingVertical: 20, // smaller padding to balance
    paddingHorizontal: 10,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  Semtext: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
});
