import { StyleSheet, View, ScrollView } from "react-native";
import { useState } from "react";
import TextTravel from "../../../components/pages/previous/TextTravel";
import CalenderCom from "../../../components/pages/previous/CalenderCom";
import SubjectAttedence from "../../../components/pages/previous/SubjectAttedence";
import { useLocalSearchParams } from "expo-router";

const Previous = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const { student, attendance } = useLocalSearchParams();
  const parsedAttendance = JSON.parse(attendance);
  console.log(parsedAttendance);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.TextTravelContainer}>
        <TextTravel text={"Go To Start"} />
        <TextTravel text={"Current Date"} />
      </View>
      <CalenderCom onSelectDate={setSelectedDate} />
      {selectedDate && (
        <SubjectAttedence
          selectedDate={selectedDate}
          attendancet={parsedAttendance}
        />
      )}
    </ScrollView>
  );
};

export default Previous;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingVertical: 20,
    paddingBottom: 50,
  },
  content: {
    alignItems: "center",
  },
  TextTravelContainer: {
    flexDirection: "row",
  },
});
