import { StyleSheet, FlatList, View } from "react-native";
import PerformanceCom from "../../../components/pages/performence/performanceCom";
import { useEffect, useState } from "react";
import imagepath_t from "../../constant/imagepath_t";
import API from "../../API/api";
import { useCourseSemester } from "../introduction/CourseSemesterContext";
const Performance = () => {
  const [data, setData] = useState([]);
  const { courseId, semesterId } = useCourseSemester();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(
          `data/student-attendance-report?course=${courseId}&semster=${semesterId}`
        );
        setData(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [courseId, semesterId]);

  return (
    <View style={styles.root}>
      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <PerformanceCom
            key={index}
            name={item.name}
            image={item.image || imagepath_t.studen1}
            percentage={item.percentage}
            attendance={item.attendance}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Performance;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#121212",

  },

  listContent: {
    paddingVertical: 10,
    backgroundColor: "#121212",
  },
});
