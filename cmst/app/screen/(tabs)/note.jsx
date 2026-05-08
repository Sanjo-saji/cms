import { useState, useCallback, useEffect } from "react";
import { StyleSheet, FlatList } from "react-native";
import SubjectContainer from "../../../components/NoteCompnets/SubjectContainer";
import { router, useFocusEffect } from "expo-router";
import API from "../../API/api";
import { useCourseSemester } from "../introduction/CourseSemesterContext";
import events from "../../../app/events";

const note = () => {
  const [data, setData] = useState([]);
  const { courseId, semesterId } = useCourseSemester();

  const getData = async () => {
    try {
      const response = await API.get(
        `/data/get-t-notes?course=${courseId}&semster=${semesterId}`
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  // Refresh when screen focused
  useFocusEffect(
    useCallback(() => {
      getData();
    }, [courseId, semesterId])
  );

  // Listen for Pdf screen events
  useEffect(() => {
    const sub = events.addListener("refreshNotes", () => {
      getData();
    });
    return () => sub.remove();
  }, []);

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <SubjectContainer
          image={item.image}
          text={item.subject}
          onPress={() =>
            router.push({
              pathname: "/screen/pages/Pdf",
              params: {
                id: item.id,
                subject: item.subject,
                pdfs: JSON.stringify(item.pdfs),
              },
            })
          }
        />
      )}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
});

export default note;
