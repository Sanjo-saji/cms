import { StyleSheet, FlatList, SafeAreaView, Text, View } from "react-native";
import { useState, useEffect } from "react";
import Sem from "../../../TeacherCom/intro/Sem";
import API from "../../API/api";

const Introduction = () => {
  const [semData, setSemData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSemData = async () => {
      try {
        const response = await API.get("/data/assign");
        const assignments = response.data.assignments;

        if (!assignments || assignments.length === 0) {
          setSemData([]); // no assignments
        } else {
          const formatted = assignments.map((item, index) => ({
            id: `${item.courseId}_${item.semesterId}_${index}`,
            semesterId: item.semesterId,
            semesterName: item.semesterName,
            courseId: item.courseId,
            courseName: item.courseName,
          }));
          setSemData(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
        setSemData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSemData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <Text style={styles.message}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (semData.length === 0) {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.messageContainer}>
          <Text style={styles.message}>No assignments found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <FlatList
        data={semData}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Sem
            cousername={item.courseName}
            Semname={item.semesterName}
            semId={item.semesterId}
            couId={item.courseId}
          />
        )}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      />
    </SafeAreaView>
  );
};

export default Introduction;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  container: { padding: 20, paddingBottom: 50, paddingTop: 50 },
  messageContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  message: {
    color: "#fff",
    fontSize: 18,
  },
});
