import { View, Text, StyleSheet } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useEffect, useState } from "react";
import API from "../../app/API/api";
import { useCourseSemester } from "../../app/screen/introduction/CourseSemesterContext";

const Linechart = () => {
  const { courseId, semesterId } = useCourseSemester();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchLineChartData = async () => {
      if (!courseId || !semesterId) return;
      try {
        const response = await API.get(
          `/data/monthly-attendance?course=${courseId}&semster=${semesterId}`
        );
        const { labels, data } = response.data;
        const formattedData = data.map((value, index) => ({
          value: Number(value.toFixed(1)),
          label: labels[index],
          labelTextStyle: { color: "lightgray", width: 60 },
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Line chart fetch error:", error);
      }
    };
    fetchLineChartData();
  }, [courseId, semesterId]);

  return (
    <View style={styles.container}>
      <LineChart
        areaChart
        data={chartData}
        rotateLabel
        width={300}
        hideDataPoints
        spacing={60}
        color="#ffffff"
        thickness={2}
        startFillColor="rgb(255, 255, 255)"
        endFillColor="rgb(255, 255, 255)"
        startOpacity={0.9}
        endOpacity={0.2}
        initialSpacing={0}
        noOfSections={6}
        maxValue={100}
        yAxisColor="white"
        yAxisThickness={0}
        rulesType="solid"
        rulesColor="transparent"
        yAxisTextStyle={{ color: "gray" }}
        yAxisSide="right"
        xAxisColor="lightgray"
      />
    </View>
  );
};
export default Linechart;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    width: "95%",
    marginHorizontal: "2%",
    marginTop: 20,
    backgroundColor: "#1C1C1C",
  },
});
