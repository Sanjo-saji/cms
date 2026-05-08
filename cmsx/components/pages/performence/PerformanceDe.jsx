import { StyleSheet, Text, View, ScrollView, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import API from "../../../app/API/api";

const PerformanceDe = () => {
  const { subject } = useLocalSearchParams(); //  get subject from params
  const [data, setData] = useState([]);

  useEffect(() => {
    const getEvaluvation = async () => {
      try {
        const response = await API.get("/data/marks");
        const semesters = response.data.semesters || [];

        let foundSubject = null;

        for (let sem of semesters) {
          foundSubject = sem.subjects.find(
            (subj) => subj.subject.name === subject
          );
          if (foundSubject) break; // stop when found
        }

        setData(foundSubject?.exams || []);
      } catch (error) {
        console.error("Error fetching marks:", error.message);
      }
    };

    getEvaluvation();
  }, [subject]);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>Date</Text>
      <Text style={styles.headerText}>Exam Name</Text>
      <Text style={styles.headerText}>Score</Text>
      <Text style={styles.headerText}>Total</Text>
      <Text style={styles.headerText}>Percentage</Text>
      <Text style={styles.headerText}>Performance</Text>
    </View>
  );

  const renderData = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.date}</Text>
      <Text style={styles.cell}>{item.examName}</Text>
      <Text style={styles.cell}>{item.marks}</Text>
      <Text style={styles.cell}>{item.total}</Text>
      <Text style={styles.cell}>{item.percentage}%</Text>
      <Text style={styles.cell}>{item.performance}</Text>
    </View>
  );

  return (
    <ScrollView horizontal>
      <View>
        {renderHeader()}
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderData}
        />
      </View>
    </ScrollView>
  );
};

export default PerformanceDe;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    backgroundColor: "#2C3034",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#212529",
  },
  row: {
    backgroundColor: "#212529",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
  },
  cell: {
    width: 100,
    textAlign: "center",
    paddingHorizontal: 5,
    color: "white",
    paddingVertical: 10,
  },
  headerText: {
    width: 100,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    paddingHorizontal: 5,
    marginTop: 10,
  },
});
