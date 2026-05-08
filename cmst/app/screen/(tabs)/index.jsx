import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Cmslogo from "../../../components/Homecomponents/Cmslogo";
import NotificationNav from "../../../components/Homecomponents/NotificationNav";
import ProfileNav from "../../../components/Homecomponents/ProfileNav";
import CarouselImage from "../../../components/Homecomponents/Card/CarouselImage";
import PageNavigate from "../../../components/Homecomponents/PagesNavigate/PageNavigate";
import imagePath from "../../constant/imagePath";
import imagepath_t from "../../constant/imagepath_t";
import Linechart from "../../../TeacherCom/homeCom/linechart";
import Bottomsheet from "../../../TeacherCom/homeCom/bottomsheet/bottomsheet";
import { useEffect, useRef, useState } from "react";
import { useCourseSemester } from "../introduction/CourseSemesterContext";
import API from "../../API/api";
const home = () => {
  const bottomSheetRef = useRef(null);
  const { courseId, semesterId } = useCourseSemester();
  const [refreshing, setRefreshing] = useState(false);
  const carouselRefreshRef = useRef(null);

  const [selectedData, setSelectedData] = useState({
    image: null,
    subject: "",
    content: "",
  });
  const fetchEvents = async () => {
    if (!courseId || !semesterId) {
      setSelectedData({
        image: null,
        subject: "",
        content: "",
      });
      return;
    }
    try {
      const response = await API.get(
        `/data/events-by-teacher?course=${courseId}&semster=${semesterId}`,
      );

      const firstEvent = response.data.events?.[0];
      if (firstEvent) {
        setSelectedData({
          image: firstEvent.image,
          subject: firstEvent.title,
          content: firstEvent.description,
        });
      } else {
        setSelectedData({
          image: null,
          subject: "",
          content: "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchEvents(),
        carouselRefreshRef.current?.(), // Refresh the carousel
      ]);
    } finally {
      setRefreshing(false); // Always stop spinner
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [courseId, semesterId]);

  const handleOpenSheet = (item) => {
    setSelectedData({
      image: item.image,
      subject: item.title,
      content: item.description,
    });
    bottomSheetRef.current?.expand();
  };
  return (
    <GestureHandlerRootView style={styles.safeContainer}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerConatainer}>
          <Cmslogo />
          <View style={{ flexDirection: "row" }}>
            <NotificationNav />
            <ProfileNav />
          </View>
        </View>
        <CarouselImage
          onPress={handleOpenSheet}
          onReady={(refreshFn) => (carouselRefreshRef.current = refreshFn)}
        />
        <View>
          <Text style={styles.Subheadings}>Attendance</Text>
          <View style={styles.Attdence}>
            <Linechart />
          </View>
        </View>
        <Text style={styles.attedenceDetailasText}>Attendance Details</Text>
        <PageNavigate
          image={imagePath.PerviousIcon}
          text={"Previous"}
          marginArow={false}
          navigate={"/screen/pages/Performance"}
        />
        <Text style={styles.attedenceDetailasText}>Evaluvation</Text>
        <PageNavigate
          image={imagepath_t.evaluvationIcon}
          text={"Evaluvation Entry"}
          navigate={"/screen/pages/EvaluvationSet"}
          marginArow={true}
        />
        <Text style={styles.attedenceDetailasText}>Schedule</Text>
        <PageNavigate
          image={imagepath_t.scheduleIcon}
          text={"Schedule"}
          marginArow={false}
          navigate={"/screen/pages/Schedule"}
        />
      </ScrollView>
      <Bottomsheet
        ref={bottomSheetRef}
        image={selectedData.image}
        subject={selectedData.subject}
        content={selectedData.content}
      />
    </GestureHandlerRootView>
  );
};

export default home;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },

  headerConatainer: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  Attdence: {
    flexDirection: "row",
    marginRight: 10,
    marginLeft: 15,
  },

  Subheadings: {
    color: "white",
    fontSize: 20,
    marginHorizontal: 20,
    fontWeight: "bold",
  },
  attedenceDetailasText: {
    color: "white",
    fontSize: 20,
    fontWeight: "regular",
    marginHorizontal: 20,
    marginVertical: 20,
  },
});
