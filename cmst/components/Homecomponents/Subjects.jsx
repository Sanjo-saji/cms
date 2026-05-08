import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";

const Subjects = ({ image, subjectName, present, Absent, percentage }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.subjectIcon}>
          <Image source={image} style={styles.SubjecImage} />
        </View>
        <View style={styles.HeadingContainer}>
          <View>
            <Text style={styles.HeadingsSubject}>{subjectName}</Text>
            <Text style={styles.vlauesText}>Attedence</Text>
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
        <Text style={styles.PercentageText}>{percentage}</Text>
      </View>
    </View>
  );
};

export default Subjects;

const styles = StyleSheet.create({
  container: {
    width: 365,
    height: 100,
    backgroundColor: "#1A1C1E",
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flexDirection: "row",
  },

  subjectIcon: {
    width: 50,
    height: 60,
    marginVertical: 30,
    marginRight: 25,
  },
  SubjecImage: {
    width: "100%",
    height: "100%",
  },
  HeadingContainer: {
    flexDirection: "row",
    marginTop: 30,
  },

  HeadingsSubject: {
    // position: "absolute",
    // top: -5,
    fontSize: 17,
    color: "white",
    fontWeight: "regular",
    flexShrink: 1,
  },

  Headings: {
    color: "white",
    marginLeft: 25,
    fontSize: 18,
  },
  vlauesText: {
    color: "#E0DADA",
    fontSize: 15,
    marginTop: 25,
  },
  vlauesPresent: {
    color: "white",
    marginLeft: 40,
  },
  vlauesAbsent: {
    color: "white",
    marginLeft: 40,
  },
  PercentageText: {
    position: "absolute",
    color: "white",
    top: 55,
    left: 91,
  },
});
