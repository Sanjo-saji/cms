import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import Attedance from "../../../TeacherCom/Attendance/Attedance";
import Floatbutton from "../../../TeacherCom/noteCom/floatbutton";
import Period from "../../../TeacherCom/Attendance/Perioud";
import Checkbox from "expo-checkbox";
import API from "../../API/api";
import { useCourseSemester } from "../introduction/CourseSemesterContext";

const Attendances = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [periodList, setPeriodList] = useState([]);
  const [dayLabel, setDayLabel] = useState("");

  const { courseId, semesterId } = useCourseSemester();

  const isSubmitted = periodList[selectedPeriod - 1]?.submitted;
  const isHoliday = periodList.length === 0;

  const fetchPeriod = async () => {
    if (!courseId || !semesterId) {
      console.log("-> ABORTING: IDs are not available yet.");
      return;
    }

    try {
      // This part will now only run when the IDs are valid
      const response = await API.get(
        `/data/get-period?course=${courseId}&semster=${semesterId}`
      );

      setPeriodList(response.data.periods);
    } catch (error) {
      // This error should no longer be a 404 if the logic is correct
      console.error("Fetch periods error:", error.message);
    }
  };

  useEffect(() => {
    fetchPeriod();
    setDayLabel(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
      })
    );
  }, [courseId, semesterId]);

  useEffect(() => {
    const fetchStudentNames = async () => {
      // Don't fetch students if already submitted
      if (periodList[selectedPeriod - 1]?.submitted) return;

      try {
        const response = await API.get(
          `/data/student-names?course=${courseId}&semster=${semesterId}`
        );

        const students = await response.data;
        const formattedStudents = students.map((student) => ({
          id: student._id,
          name: student.name,
          image: student.image,
          isChecked: false,
        }));
        setAttendanceData(formattedStudents);
      } catch (error) {
        console.error("Fetch student names error:", error);
      }
    };

    fetchStudentNames();
  }, [courseId, semesterId, selectedPeriod, periodList]);

  const handleConfirm = async () => {
    const period = periodList[selectedPeriod - 1];
    if (!period) {
      console.warn("No period found for selected index");
      return;
    }

    if (period.submitted) {
      Alert.alert(
        "Already Submitted",
        "Attendance already submitted for this period."
      );
      return;
    }

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const timeStr = today.toTimeString().split(" ")[0].slice(0, 5);

    const attendancePayload = {
      course: courseId,
      semster: semesterId,
      date: dateStr,
      time: timeStr,
      period_id: period.period_id,
      students: attendanceData.map((student) => ({
        student: student.id,
        status: student.isChecked ? "present" : "absent",
      })),
    };

    try {
      await API.post("/data/submit-attendance", attendancePayload);
      await fetchPeriod();

      const newData = attendanceData.map((item) => ({
        ...item,
        isChecked: false,
      }));
      setAttendanceData(newData);
      setSelectAll(false);
    } catch (error) {
      console.error("Attendance submission failed", error);
    }
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const newData = attendanceData.map((item) => ({
      ...item,
      isChecked: newSelectAll,
    }));
    setAttendanceData(newData);
  };

  const toggleStudent = (id) => {
    const newData = attendanceData.map((item) =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    setAttendanceData(newData);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isHoliday ? (
        <Text style={styles.holidayText}>Today is {dayLabel}. No classes.</Text>
      ) : (
        <>
          <View style={styles.periodRowContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.periodRow}
            >
              {periodList.map((period, index) => {
                const periodNumber = index + 1;
                return (
                  <Period
                    key={period.period_id}
                    text={periodNumber}
                    current={periodNumber === currentPeriod}
                    completed={period.submitted}
                    onPress={() => setSelectedPeriod(periodNumber)}
                    selected={periodNumber === selectedPeriod}
                  />
                );
              })}
            </ScrollView>

            <View style={styles.stickyAllContainer}>
              <Text style={styles.selecttext}>All</Text>
              <Checkbox
                value={selectAll}
                onValueChange={toggleSelectAll}
                color={selectAll ? "green" : undefined}
                style={styles.checkBox}
              />
            </View>
          </View>

          {isSubmitted ? (
            <Text style={styles.completedText}>
              Attendance for Period {selectedPeriod} is already submitted.
            </Text>
          ) : (
            <FlatList
              data={attendanceData}
              renderItem={({ item, index }) => (
                <Attedance
                  rollno={index + 1}
                  name={item.name}
                  image={item.image}
                  isChecked={item.isChecked}
                  onToggle={() => toggleStudent(item.id)}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 20,
                paddingVertical: 10,
              }}
            />
          )}

          <Floatbutton
            label={
              periodList[selectedPeriod - 1]?.submitted
                ? "Submitted"
                : selectedPeriod > periodList.length
                ? "Done"
                : "Confirm"
            }
            onPress={handleConfirm}
            disabled={isSubmitted}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default Attendances;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1A1C1E",
    padding: 10,
    paddingTop: 65,
    paddingBottom: 30,
  },
  periodRowContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  periodRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignSelf: "stretch",
    marginBottom: 10,
    marginRight: 17,
  },
  stickyAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
    marginRight: 10,
    marginBottom: 13,
  },
  selecttext: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  checkBox: {
    padding: 5,
    transform: [{ scale: 1.2 }],
  },
  completedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  holidayText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 150,
  },
});
