import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { useState, useEffect } from "react"; // Import useEffect
import Textfeilds from "../../../components/Logincomponents/Textfeilds";
import imagePath from "../../constant/imagePath";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker"; // Import Picker
import API from "../../API/api"; // Make sure to import your API helper

const EvaluvationSet = () => {
  const [date, setDate] = useState("");
  const [examName, setExamName] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  // New state variables for subjects
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Fetch subjects when the component mounts
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await API.get("/data/get-mark-subject");
        setSubjects(response.data);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        Alert.alert("Error", "Could not load subjects.");
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleConfirm = () => {
    // Updated validation to include the subject
    if (
      !examName.trim() ||
      !date.trim() ||
      !totalMarks.trim() ||
      !selectedSubject
    ) {
      Alert.alert("Please fill in all fields and select a subject");
      return;
    }

    // Navigate to studEvaluationProfile with exam details AND subjectId
    router.push({
      pathname: "/screen/pages/studEvaluationProfile",
      params: {
        examName: examName.trim(),
        date: date.trim(),
        totalMarks: totalMarks.trim(),
        subjectId: selectedSubject, // Pass the selected subject ID
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Subject Picker Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSubject}
          onValueChange={(itemValue) => setSelectedSubject(itemValue)}
          style={styles.picker}
          dropdownIconColor="#FFFFFF"
        >
          <Picker.Item label="Select a subject..." value={null} color="#888" />
          {subjects.map((subject) => (
            <Picker.Item
              key={subject._id}
              label={subject.name}
              value={subject._id}
              color="#000000" // For Android item text color
            />
          ))}
        </Picker>
      </View>

      <Textfeilds
        placeholder="Enter the exam date"
        iconss={imagePath.calenderIcon}
        text={date}
        setText={setDate}
      />
      <Textfeilds
        placeholder="Enter the exam name"
        text={examName}
        setText={setExamName}
      />
      <Textfeilds
        placeholder="Enter total marks"
        text={totalMarks}
        setText={setTotalMarks}
        keyboardType="numeric" // Good practice for marks
      />
      <TouchableOpacity style={styles.confirmbutton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EvaluvationSet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingVertical: 25,
  },
  // New styles for the picker
  pickerContainer: {
    backgroundColor: "#2A2A2A", // A background color for the container
    borderRadius: 15,
    marginHorizontal: 25,
    marginBottom: 20, // Spacing
    height: 55,
    justifyContent: "center",
  },
  picker: {
    color: "#FFFFFF", // For iOS selected value color
  },
  confirmbutton: {
    height: 55,
    width: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    justifyContent: "center",
    marginHorizontal: 25,
    marginTop: 20,
  },
  confirmText: {
    fontWeight: "600",
    fontSize: 25,
    textAlign: "center",
  },
});
