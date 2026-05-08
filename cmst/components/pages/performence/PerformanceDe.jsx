import { StyleSheet, Text, View, ScrollView, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { SubjetContent } from "../../../fakeserve/SubjectContent";
import { useLocalSearchParams } from "expo-router";

const PerformanceDe = () => {
  const { subject } = useLocalSearchParams(); //  Get subject name from params
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const content = await SubjetContent();
      //  Find the subject and get its marks
      const subjectData = content.find((item) => item.Subject === subject);
      setData(subjectData?.Marks || []); // Set marks or empty array
    };
    getData();
  }, [subject]);

  const renderheader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Date</Text>
        <Text style={styles.headerText}>Exam Name</Text>
        <Text style={styles.headerText}>Score</Text>
        <Text style={styles.headerText}>Total</Text>
        <Text style={styles.headerText}>Percentage</Text>
        <Text style={styles.headerText}>Performance</Text>
      </View>
    );
  };

  const renderData = ({ item }) => {
    return (
      <View style={styles.row}>
        <Text style={styles.cell}>{item.date}</Text>
        <Text style={styles.cell}>{item.title}</Text>
        <Text style={styles.cell}>{item.Score}</Text>
        <Text style={styles.cell}>{item.Total}</Text>
        <Text style={styles.cell}>{item.Percentage}</Text>
        <Text style={styles.cell}>{item.performance}</Text>
      </View>
    );
  };

  return (
    <ScrollView horizontal>
      <View>
        {renderheader()}
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderData}
        />
      </View>
    </ScrollView>
  );
};

export default PerformanceDe;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    backgroundColor: "#2C3034",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#212529",
  },

  row: {
    backgroundColor: "#212529",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
  },

  cell: {
    width: 100,
    textAlign: "center",
    paddingHorizontal: 5,
    color: "white",
    paddingVertical: 10,
  },

  headerText: {
    width: 100,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    paddingHorizontal: 5,
    marginTop: 10,
  },
});
