import { StyleSheet, Text, View, Image } from "react-native";
import imagePath from "../../../app/constant/imagePath";
import React, { useEffect, useState } from "react";

const SubjectAttedence = ({ selectedDate, attendancet }) => {
  // This state will now hold the array of periods for the selected date
  const [periods, setPeriods] = useState(null);

  useEffect(() => {
    if (!selectedDate || !attendancet) {
      setPeriods(null);
      return;
    }

    // Find the attendance record for the selectedDate
    const record = attendancet.find((item) => item.date === selectedDate);

    // FIX: Check for the correct 'periods' key instead of 'subjects'
    if (record && record.periods) {
      setPeriods(record.periods);
    } else {
      setPeriods(null);
    }
  }, [selectedDate, attendancet]);

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{selectedDate}</Text>
      {periods ? (
        <View style={styles.attendanceContainer}>
          {/* FIX: Map directly over the 'periods' array */}
          {periods.map((period, index) => (
            <View key={index} style={styles.subjectRow}>
              {/* Access properties from the 'period' object */}
              <Text style={styles.subjectText}>{period.subject}</Text>
              <Image
                source={
                  period.status.toLowerCase() === "present"
                    ? imagePath.GreenSimbleIcon
                    : imagePath.RedSimbleIcon
                }
                style={styles.statusIcon}
              />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>No attendance data for this date</Text>
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
