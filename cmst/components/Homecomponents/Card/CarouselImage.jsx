import { StyleSheet, View, Dimensions, TouchableOpacity } from "react-native";
import imagePath from "../../../app/constant/imagePath";
import Carousel from "react-native-reanimated-carousel";
import CustomPagination from "../Card/CustomPagination";
import CustomCard from "./CustomCard";
import API from "../../../app/API/api";
import { useState, useEffect } from "react";
import { useCourseSemester } from "../../../app/screen/introduction/CourseSemesterContext";

const width = Dimensions.get("window").width;

const CarouselImage = ({ onPress, onReady }) => {
  const { courseId, semesterId } = useCourseSemester();
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isManualScroll, setisManualSAcroll] = useState(false);

  const fetchEvents = async () => {
    if (!courseId || !semesterId) {
      setData([]); // clear data if no filter
      return;
    }
    try {
      // Build query string with course and semester
      const response = await API.get(
        `/data/events-t?course=${courseId}&semster=${semesterId}`
      );
      setData(response.data.events || []);
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn("No events found (404):", error.message);
      } else {
        console.error("Failed to fetch events:", error.message);
      }

      // fallback to empty -> handled in displayData
      setData([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [courseId, semesterId]);

  useEffect(() => {
    if (onReady) {
      onReady(fetchEvents);
    }
  }, [onReady]);

  const displayData =
    data.length > 0
      ? data
      : [
          {
            id: "fallback",
            image:
              "https://miserably-arriving-adder.ngrok-free.app/images/events.png",
            title: "",
            content: "",
          },
        ];

  return (
    <View style={styles.CarouselContainer}>
      <Carousel
        loop
        width={width}
        height={width / 2}
        autoPlay={true}
        autoPlayInterval={2000}
        data={displayData}
        scrollAnimationDuration={isManualScroll ? 200 : 1000}
        onSnapToItem={(index) => setActiveIndex(index)}
        onScrollStart={() => setisManualSAcroll(true)}
        onScrollEnd={() => setisManualSAcroll(false)}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.5}
            onLongPress={() => onPress(item)}
          >
            <CustomCard
              image={item.image || imagePath.anime1}
              title={item.title || ""}
              Subtitle={item.content || ""}
            />
          </TouchableOpacity>
        )}
      />

      <CustomPagination
        length={data.length}
        activeIndex={activeIndex}
        activeColor={"#D9D9D9"}
        inactiveColor={"#9C9C9C"}
        dotSize={7}
      />
    </View>
  );
};

export default CarouselImage;

const styles = StyleSheet.create({
  CarouselContainer: {
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
  },
});
