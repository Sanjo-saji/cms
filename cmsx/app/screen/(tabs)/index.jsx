import { StyleSheet, View, Text, SafeAreaView, FlatList } from "react-native";
import Cmslogo from "../../../components/Homecomponents/Cmslogo";
import NotificationNav from "../../../components/Homecomponents/NotificationNav";
import ProfileNav from "../../../components/Homecomponents/ProfileNav";
import CarouselImage from "../../../components/Homecomponents/Card/CarouselImage";
import PrograsCircular from "../../../components/Homecomponents/Attedence/PrograsCircular";
import Days from "../../../components/Homecomponents/Attedence/Days";
import Subjects from "../../../components/Homecomponents/Subjects";
import { SubjetContent } from "../../../fakeserve/SubjectContent";
import { useEffect, useState } from "react";
import PageNavigate from "../../../components/Homecomponents/PagesNavigate/PageNavigate";
import imagePath from "../../constant/imagePath";
import API from "../../API/api";
const home = () => {
  const [attData, setattData] = useState([]);
  const [subData, setSubData] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [total, setTotal] = useState(0);
  const [day, setDay] = useState(0);
  useEffect(() => {
    const getAttendance = async () => {
      try {
        const response = await API.get("/data/attendance");
        setattData(response.data || []);
        setPercentage(response.data.percentage);
        setTotal(response.data.total);
        setDay(response.data.present);
      } catch (error) {
        console.error("Error fetching events:", error.message);
      }
    };
    getAttendance();
  }, []);

  useEffect(() => {
    const getAttendanceSub = async () => {
      try {
        const response = await API.get("/data/subject-wise-attendance");
        setSubData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching events:", error.message);
      }
    };
    getAttendanceSub();
  }, []);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <FlatList
        data={subData}
        keyExtractor={(item) => item.name.toString()}
        ListHeaderComponent={
          <>
            <View style={styles.headerConatainer}>
              <Cmslogo />
              <View style={{ flexDirection: "row" }}>
                <NotificationNav />
                <ProfileNav />
              </View>
            </View>
            <CarouselImage />
            <View>
              <Text style={styles.Subheadings}>Attendance</Text>
              <View style={styles.Attdence}>
                <PrograsCircular percentage={percentage} />
                <Days days={day} totalDay={total} />
              </View>
            </View>
            <Text style={styles.Subheadings}>Subjects</Text>
          </>
        }
        renderItem={({ item }) => (
          <Subjects
            image={item.image}
            subjectName={item.name}
            percentage={item.percentage}
            present={item.present}
            Absent={item.absent}
          />
        )}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            <Text style={styles.attedenceDetailasText}>Attendance Details</Text>
            <PageNavigate
              image={imagePath.PerviousIcon}
              text={"Previous"}
              marginArow={false}
              navigate={"/screen/pages/Previous"}
            />
            <Text style={styles.attedenceDetailasText}>Performance</Text>
            <PageNavigate
              image={imagePath.PerformenceIcon}
              text={"Performance"}
              marginArow={true}
              navigate={"/screen/pages/Performance"}
            />
          </>
        }
      />
    </SafeAreaView>
  );
};

export default home;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    paddingBottom: 40,
  },
  headerConatainer: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  Attdence: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingLeft: 15,
  },
  Subheadings: {
    color: "white",
    fontSize: 20,
    marginHorizontal: 20,
    fontWeight: "regular",
  },
  attedenceDetailasText: {
    color: "white",
    fontSize: 20,
    fontWeight: "regular",
    margin: 20,
    // marginHorizontal: 20,
    // marginVertical: 20,
  },
});
