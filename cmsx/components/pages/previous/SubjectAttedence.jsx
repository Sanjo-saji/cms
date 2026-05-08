import { StyleSheet, Text, View, Image } from "react-native";
import imagePath from "../../../app/constant/imagePath";
import { useState, useEffect } from "react";
import API from "../../../app/API/api";

const SubjectAttedence = ({ selectedDate }) => {
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get(`/data/by-date?date=${selectedDate}`);
        const data = response.data;
        if (data && data.date === selectedDate) {
          setAttendance(data.subjects);
        } else {
          setAttendance(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAttendance(null);
      }
    };
    fetchData();
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{selectedDate}</Text>

      {attendance === null ? (
        <Text style={styles.noDataText}>No attendance data for this date</Text>
      ) : Object.keys(attendance).length === 0 ? (
        <Text style={styles.noDataText}>
          No attendance recorded for this date
        </Text>
      ) : (
        <View style={styles.attendanceContainer}>
          {Object.entries(attendance).map(([subject, status], index) => (
            <View key={index} style={styles.subjectRow}>
              <Text style={styles.subjectText}>{subject}</Text>
              <Image
                source={
                  status.toLowerCase() === "present"
                    ? imagePath.GreenSimbleIcon
                    : imagePath.RedSimbleIcon
                }
                style={styles.statusIcon}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default SubjectAttedence;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: "#1A1C1E",
    width: "90%",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3F3E3E",
  },
  dateText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  attendanceContainer: {
    width: "100%",
  },
  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  subjectText: {
    color: "white",
    fontSize: 16,
  },
  statusIcon: {
    width: 21,
    height: 20,
  },
  noDataText: {
    color: "gray",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
});
