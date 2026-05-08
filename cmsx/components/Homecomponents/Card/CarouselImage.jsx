import { StyleSheet, View, Dimensions } from "react-native";
import imagePath from "../../../app/constant/imagePath";
import Carousel from "react-native-reanimated-carousel";
import CustomPagination from "../Card/CustomPagination";
import CustomCard from "./CustomCard";
import API from "../../../app/API/api";
import { useState, useEffect } from "react";

const width = Dimensions.get("window").width;

const CarouselImage = () => {
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isManualScroll, setisManualSAcroll] = useState(false);

  useEffect(() => {
    const getEvents = async () => {
      try {
        const response = await API.get("/data/events");
        const events = response.data.events;

        if (!events || events.length === 0) {
          // fallback if no events
          setData([
            {
              id: "default-1",
              image: imagePath.anime1,
              title: "Default Title",
              content: "Nothing to show yet.",
            },
          ]);
        } else {
          setData(events);
        }
      } catch (error) {
        console.error("Error fetching events:", error.message);

        // fallback when API fails
        setData([
          {
            id: "default-error",
            image: imagePath.anime1,
            title: "Error loading events",
            content: "Please try again later.",
          },
        ]);
      }
    };

    getEvents();
  }, []);

  return (
    <View style={styles.CarouselContainer}>
      <Carousel
        loop
        width={width}
        height={width / 2}
        autoPlay={true}
        autoPlayInterval={2000}
        data={data}
        scrollAnimationDuration={isManualScroll ? 200 : 1000}
        onSnapToItem={(index) => setActiveIndex(index)}
        onScrollStart={() => setisManualSAcroll(true)}
        onScrollEnd={() => setisManualSAcroll(false)}
        renderItem={({ item }) => (
          <CustomCard
            key={item.id}
            image={item.image || imagePath.anime1}
            title={item.title || "Default Title"}
            Subtitle={item.content || "Nothing"}
          />
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
