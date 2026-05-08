import { useState } from "react";
import {
  View,
  Button,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Calendar } from "react-native-calendars";

export default function bottomcalender({
  calendarVisible,
  setCalendarVisible,
  selectedDate,
  setSelectedDate,
}) {
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setCalendarVisible(false);
  };

  return (
    <View style={styles.container}>
      <Button title="Pick a Date" onPress={() => setCalendarVisible(true)} />
      {selectedDate ? (
        <Text style={styles.selectedText}>Selected: {selectedDate}</Text>
      ) : null}

      <Modal
        visible={calendarVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarBox}>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  marked: true,
                  selectedColor: "#00adf5",
                },
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCalendarVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  selectedText: { marginTop: 10, fontSize: 16 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  calendarBox: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    padding: 10,
    backgroundColor: "#00adf5",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
