import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import NotificationCom from "../../../components/pages/Notification/NotificationCom";
import { useEffect, useRef, useState } from "react";
import Floatbutton from "../../../TeacherCom/noteCom/floatbutton";
import { Searchbar } from "react-native-paper";
import { router } from "expo-router";
import API from "../../API/api";
import { useCourseSemester } from "../introduction/CourseSemesterContext";
import BottomNot from "../../../TeacherCom/Sheet/BottomNot";
import imagepath_t from "../../constant/imagepath_t";
const Notification = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const bottomSheetRef = useRef(null);
  const { courseId, semesterId } = useCourseSemester();
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await API.get(
          `/data/messages-g?course=${courseId}&semster=${semesterId}`,
        );
        setData(response.data.msg || []);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };
    getData();
  }, [courseId, semesterId]);

  const filteredFruit = data.filter(
    (item) =>
      item.heading?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeContainer}>
        <Searchbar
          placeholder="Search"
          onChangeText={(query) => setSearchQuery(query)}
          value={searchQuery}
          style={{
            backgroundColor: "#1A1C1E",
            borderWidth: 1,
            borderColor: "#3F3E3E",
            borderRadius: 20,
            marginTop: 10,
            width: "89%",
            marginRight: 10,
          }}
          inputStyle={{
            color: "#fff",
          }}
          iconColor="#fff"
          selectionColor="#fff"
          placeholderTextColor="#fff"
        />
        <FlatList
          data={filteredFruit}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationCom
              Heading={item.heading}
              date={item.date}
              content={item.content}
              sender={item.sender}
            />
          )}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        />
        <Floatbutton
          onPress={() => router.push("/screen/pages/outbox")}
          icon={() => (
            <Image
              source={imagepath_t.outbox}
              style={{ width: 27, height: 25 }}
            />
          )}
        />
        {isSheetVisible && (
          <BottomNot
            ref={bottomSheetRef}
            onClose={() => setIsSheetVisible(false)}
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Notification;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#121212",
    paddingTop: 10,
  },
});
