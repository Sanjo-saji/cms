import { StyleSheet, Text, View, ScrollView } from "react-native";
import { React, useState } from "react";
import TextTravel from "../../../components/pages/previous/TextTravel";
import CalenderCom from "../../../components/pages/previous/CalenderCom";
import SubjectAttedence from "../../../components/pages/previous/SubjectAttedence";
import Days from "../../../components/Homecomponents/Attedence/Days";
import PrograsCircular from "../../../components/Homecomponents/Attedence/PrograsCircular";

const Previous = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.TextTravelContainer}>
        <TextTravel text={"Go To Start"} />
        <TextTravel text={"Current Date"} />
      </View>
      <CalenderCom onSelectDate={setSelectedDate} />
      {selectedDate && <SubjectAttedence selectedDate={selectedDate} />}
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
  monthText: {
    color: "white",
    fontSize: 23,
    fontWeight: "regular",
    position: "absolute",
    bottom: 240,
    left: 20,
  },
  AttdencePercentage: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 40,
    marginBottom: 50,
    marginRight: 50,
  },
});
