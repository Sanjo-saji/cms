import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { Card } from "react-native-paper";
import API from "../../API/api";
import { useCourseSemester } from "../introduction/CourseSemesterContext";
import { useLocalSearchParams } from "expo-router";
import Floatbutton from "../../../TeacherCom/noteCom/floatbutton";

const StudEvaluationProfile = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { courseId, semesterId } = useCourseSemester();
  const params = useLocalSearchParams();

  // Get exam details from navigation parameters, including the new subjectId
  const examDetails = {
    examName: params.examName || "",
    date: params.date || "",
    totalMarks: params.totalMarks || "",
    subjectId: params.subjectId || null, // Get the subjectId
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await API.get(
          `/data/studentlists?course=${courseId}&semster=${semesterId}`
        );
        const studentsData = response.data.map((student) => ({
          id: student._id,
          name: student.name,
          register: student.register,
          admission: student.admission,
          phone: student.phone,
          DOB: student.DOB,
          mark: "",
        }));
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
        Alert.alert("Error", "Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && semesterId) {
      fetchStudents();
    }
  }, [courseId, semesterId]);

  const handleMarkChange = (studentId, mark) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId ? { ...student, mark } : student
      )
    );
  };

  const handleSubmitAll = async () => {
    const studentsWithMarks = students.filter((student) => student.mark.trim());
    if (studentsWithMarks.length === 0) {
      Alert.alert("Error", "Please enter marks for at least one student");
      return;
    }

    // Add a check for the subjectId
    if (!examDetails.subjectId) {
      Alert.alert(
        "Error",
        "Subject information is missing. Please go back and select a subject."
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        examName: examDetails.examName,
        date: examDetails.date,
        subject: examDetails.subjectId, // <<<< UPDATED: Use subjectId from params
        total: parseInt(examDetails.totalMarks),
        course: courseId,
        semster: semesterId,
        studentMarks: studentsWithMarks.map((student) => ({
          studentId: student.id,
          marks: parseInt(student.mark),
        })),
      };

      await API.post("/data/insert-bulk-marks", payload);

      Alert.alert(
        "Submission Complete",
        `Successfully submitted marks for ${studentsWithMarks.length} students`
      );

      setStudents((prevStudents) =>
        prevStudents.map((student) => ({ ...student, mark: "" }))
      );
    } catch (error) {
      console.error("Error submitting marks:", error);
      Alert.alert("Error", "Failed to submit marks. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ... (rest of your component code remains the same)
  // renderExamDetailsSection, renderStudentCard, loading view, main return

  const renderExamDetailsSection = () => (
    <Card style={styles.examDetailsCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Exam Details</Text>
        <View style={styles.examInfoContainer}>
          <Text style={styles.examInfoText}>
            Exam Name: {examDetails.examName}
          </Text>
          <Text style={styles.examInfoText}>Date: {examDetails.date}</Text>
          <Text style={styles.examInfoText}>
            Total Marks: {examDetails.totalMarks}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStudentCard = ({ item }) => (
    <Card style={styles.card} key={item.id}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.studentInfoContainer}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.studentDetails}>Register: {item.register}</Text>
            <Text style={styles.studentDetails}>
              Admission: {item.admission}
            </Text>
            {item.phone && (
              <Text style={styles.studentDetails}>Phone: {item.phone}</Text>
            )}
            {item.DOB && (
              <Text style={styles.studentDetails}>DOB: {item.DOB}</Text>
            )}
          </View>
          <View style={styles.markContainer}>
            <TextInput
              style={styles.markinput}
              placeholderTextColor="#666"
              placeholder="Enter mark"
              value={item.mark}
              onChangeText={(text) => handleMarkChange(item.id, text)}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.totalMarksText}>
              / {examDetails.totalMarks}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderExamDetailsSection()}
      <FlatList
        data={students}
        renderItem={renderStudentCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      <Floatbutton
        onPress={handleSubmitAll}
        label={submitting ? "Submitting..." : "Submit All Marks"}
        disabled={submitting}
      />
    </View>
  );
};

export default StudEvaluationProfile;

// ... (Your styles remain the same)
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },

  studentInfoContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },

  markContainer: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },

  container: {
    padding: 16,
    backgroundColor: "#121212",
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#fff",
  },
  examDetailsCard: {
    marginBottom: 16,
    backgroundColor: "#1A1C1E",
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  examInfoContainer: {
    gap: 8,
  },
  examInfoText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  card: {
    marginBottom: 12,
    padding: 16,
    minHeight: 100,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: "#1A1C1E",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    color: "#fff",
    marginBottom: 8,
  },
  studentDetails: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 4,
  },
  markinput: {
    borderWidth: 1,
    borderColor: "#3F3E3E",
    padding: 12,
    borderRadius: 8,
    width: 80,
    textAlign: "center",
    color: "#fff",
    backgroundColor: "#2A2A2A",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalMarksText: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
});
