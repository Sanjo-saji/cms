import { useEffect, useState } from "react";
import { StyleSheet, FlatList } from "react-native";
import SubjectContainer from "../../../components/NoteCompnets/SubjectContainer";

import { router } from "expo-router";
import API from "../../API/api";

const note = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await API.get("/data/notes");
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
    getData();
  }, []);

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
      renderItem={({ item }) => (
        <SubjectContainer
          image={item.image}
          text={item.subject}
          onPress={() =>
            router.push({
              pathname: "/screen/pages/Pdf",
              params: {
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
