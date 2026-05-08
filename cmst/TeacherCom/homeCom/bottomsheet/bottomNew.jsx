import { TouchableOpacity, StyleSheet, Image, View, Text } from "react-native";
import { useEffect, useState } from "react";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import API from "../../../app/API/api";
import { useCourseSemester } from "../../../app/screen/introduction/CourseSemesterContext";
import imagepath_t from "../../../app/constant/imagepath_t";
const BottomNew = ({ onItemPress, isVisible }) => {
  const { courseId, semesterId } = useCourseSemester();

  const [data, setData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const fetchEvents = async () => {
      if (!courseId || !semesterId) {
        setData([]);
        return;
      }
      try {
        const response = await API.get(
          `/data/events-by-teacher?course=${courseId}&semster=${semesterId}`
        );

        if (Array.isArray(response.data.events)) {
          setData(response.data.events); // Set the full array
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setData([]);
      }
    };
    fetchEvents();
  }, [courseId, semesterId, refreshKey]);

  useEffect(() => {
    if (isVisible) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [isVisible]);

  const handleDelete = async (eventsId) => {
    try {
      await API.delete(`data/delete-event/${eventsId}`);
      alert("Delete successfully");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => onItemPress(item)}
      style={styles.previous}
      activeOpacity={0.7}
    >
      <View style={styles.contents}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.image,
            }}
            style={styles.editimage}
          />
        </View>
        <View style={styles.texts}>
          <Text style={styles.title}>
            {item.title?.length > 17
              ? item.title.slice(0, 17) + "..."
              : item.title}
          </Text>
          <Text style={styles.content}>
            {item.description?.length > 17
              ? item.description.slice(0, 17) + "..."
              : item.description}
          </Text>
          <Text style={styles.del}>Del on : {item.del_on || "Unknown"}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.deleteButton}
      >
        <Image source={imagepath_t.deleteIcon} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFooter = () => (
    <TouchableOpacity
      style={styles.previous}
      onPress={() => onItemPress({ isNew: true })}
      activeOpacity={0.7}
    >
      <View style={styles.contents}>
        <View style={styles.newContainer}>
          <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 28 }}>
            Plus
          </Text>
        </View>
        <Text style={styles.create}>Add Event</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <BottomSheetFlatList
        key={refreshKey}
        data={data}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        scrollEnabled={true}
      />
    </View>
  );
};

export default BottomNew;

const styles = StyleSheet.create({
  previous: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    justifyContent: "space-between",
  },
  imageContainer: {
    height: 80,
    width: 145,
  },
  editimage: {
    height: "100%",
    width: "100%",
    borderRadius: 15,
  },
  contents: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    flexShrink: 1,
  },
  texts: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    marginLeft: 15,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    color: "white",
    fontSize: 16,
  },
  del: {
    color: "white",
    fontSize: 16,
    opacity: 0.7,
  },
  deleteButton: {
    marginRight: 10,
  },
  newContainer: {
    height: 80,
    width: 145,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1C1ECC",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 15,
  },
  addimageContainer: {
    height: 45,
    width: 45,
    opacity: 0.7,
  },
  create: {
    flexDirection: "row",
    marginLeft: 15,
    color: "white",
    fontSize: 20,
    opacity: 0.7,
  },
});
