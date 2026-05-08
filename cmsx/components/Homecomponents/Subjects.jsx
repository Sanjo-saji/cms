import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";

const Subjects = ({ image, subjectName, present, Absent, percentage }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.subjectIcon}>
          <Image source={{ uri: image }} style={styles.SubjecImage} />
        </View>
        <Text style={styles.HeadingsSubject}>{subjectName}</Text>
        <View style={styles.HeadingContainer}>
          <View>
            <Text style={styles.Headings}>Attedence</Text>
            <Text style={styles.PercentageText}>{percentage}%</Text>
          </View>
          <View>
            <Text style={styles.Headings}>Persent</Text>
            <Text style={styles.vlauesPresent}>{present}</Text>
          </View>
          <View>
            <Text style={styles.Headings}>Absent</Text>
            <Text style={styles.vlauesAbsent}>{Absent}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Subjects;

const styles = StyleSheet.create({
  container: {
    width: "95%",
    backgroundColor: "#1A1C1E",
    borderRadius: 10,
    marginHorizontal: 12,
    paddingVertical: 1,
    paddingHorizontal: 13,
    marginTop: 15,
  },
  content: {
    flexDirection: "row",
  },
  subjectIcon: {
    width: 60,
    height: 60,
    margin: 15,
  },
  SubjecImage: {
    width: "100%",
    height: "100%",
  },
  HeadingsSubject: {
    position: "absolute",
    top: 5,
    left: 100,
    fontSize: 18,
    color: "white",
    fontWeight: "regular",
  },
  HeadingContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
  },
  Headings: {
    color: "white",
    fontSize: 16,
  },
  vlauesPresent: {
    color: "white",
    textAlign: "center",
  },
  vlauesAbsent: {
    color: "white",
    textAlign: "center",
  },
  PercentageText: {
    color: "white",
    textAlign: "center",
  },
});
