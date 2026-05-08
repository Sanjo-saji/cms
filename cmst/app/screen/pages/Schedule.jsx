import { StyleSheet, Text, View, FlatList } from "react-native";
import { useState, useEffect } from "react";
import ScheduleCom from "../../../TeacherCom/Schedule/ScheduleCom";
import {useCourseSemester} from "../introduction/CourseSemesterContext"
import API from "../../API/api";

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const { courseId, semesterId } = useCourseSemester();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await API.get(`/data/schedule?course=${courseId}&semster=${semesterId}`);
        setScheduleData(response.data.schedule || []);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };

    fetchSchedule();
  }, [courseId, semesterId]);

  return (
    <View style={styles.container}>
      <FlatList
        data={scheduleData}
        renderItem={({ item }) => (
          <>
            <Text style={styles.day}>{item.day}</Text>
            {item.contents.length > 0 ? (
              item.contents.map((subject,index) => (
                <ScheduleCom
                  key={index}
                  Class={subject.course}
                  section={subject.semester}
                  subject={subject.subject}
                  time={subject.time}
                />
              ))
            ) : (
              <Text style={styles.noClass}>No class</Text>
            )}
          </>
        )}
      />
    </View>
  );
};

export default Schedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 10,
    alignItems: "center",
  },
  day: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noClass: {
    color: "#888",
    fontStyle: "italic",
    marginBottom: 20,
    fontSize: 20,
    textAlign: "center",
  },
});
