import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import NotificationCom from "../../../components/pages/Notification/NotificationCom";
import { useEffect, useRef, useState } from "react";
import Floatbutton from "../../../TeacherCom/noteCom/floatbutton";
import { Searchbar } from "react-native-paper";
import { router } from "expo-router";
import BottomNot from "../../../TeacherCom/Sheet/BottomNot";
import { useCourseSemester } from "../introduction/CourseSemesterContext";
import API from "../../API/api";
import BottomSheetOutbox from "../../../TeacherCom/noteCom/BottomSheetOutbox";

const Outbox = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const bottomSheetRef = useRef(null);
  const { courseId, semesterId } = useCourseSemester();

  // Fetch data from the API
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await API.get(
          `/data/messages-t?course=${courseId}&semster=${semesterId}`
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
      item.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLongPress = (item) => {
    setSelectedItem(item);
    setIsSheetVisible(true);
  };

  const handleEdit = () => {
    if (selectedItem) {
      router.push({
        pathname: "/screen/pages/notificationCompose",
        params: {
          title: selectedItem.heading,
          message: selectedItem.content,
          isEdit: true,
          itemId: selectedItem.id,
        },
      });
    }
    setIsSheetVisible(false);
  };

  const handleDelete = async () => {
    console.log("Delete");
    if (selectedItem) {
      try {
        await API.delete(`/data/delete-message/${selectedItem.id}`);
        console.log(selectedItem.id);
        alert("Message deleted successfully");
        // Refresh the data after successful deletion
        const response = await API.get(
          `/data/messages-t?course=${courseId}&semster=${semesterId}`
        );
        setData(response.data.msg || []);
      } catch (error) {
        console.error("Error deleting message:", error);
        alert("Failed to delete message. Please try again.");
      }
    }
    setIsSheetVisible(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                item={item}
                onLongPress={handleLongPress}
              />
            )}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          />
          <Floatbutton
            onPress={() => router.push("/screen/pages/notificationCompose")}
            icon={"plus"}
          />
          {isSheetVisible && (
            <BottomSheetOutbox
              ref={bottomSheetRef}
              onClose={() => setIsSheetVisible(false)}
              onDelete={handleDelete} // pass the parent's delete handler
            />
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
};

export default Outbox;

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
