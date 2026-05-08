import { StyleSheet, FlatList } from "react-native";
import PerformanceCom from "../../../components/pages/performence/performanceCom";
import { useEffect, useState } from "react";
import API from "../../API/api";

const Performance = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getEvaluvation = async () => {
      try {
        const response = await API.get("/data/marks");

        //  Fix: extract from semesters -> subjects
        const semesters = response.data.semesters || [];
        const subjects = semesters.flatMap((sem) =>
          sem.subjects.map((sub, index) => ({
            ...sub,
            id: sub.subject._id || `fallback-${index}`,
          }))
        );

        setData(subjects);
      } catch (error) {
        console.error("Error fetching marks:", error.message);
      }
    };
    getEvaluvation();
  }, []);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <PerformanceCom
          name={item.subject.name}
          image={item.subject.image}
          performance={item.performance}
          percentage={item.percentage}
        />
      )}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default Performance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#121212",
  },
});
