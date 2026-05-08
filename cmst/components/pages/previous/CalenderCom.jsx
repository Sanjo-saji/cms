import { StyleSheet, View, Dimensions } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import React, { useState, useEffect } from "react";

const { width } = Dimensions.get("window");

// Custom weekday names to show single letters
LocaleConfig.locales["custom"] = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  dayNames: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  dayNamesShort: ["S", "M", "T", "W", "T", "F", "S"], // Show single letters
  today: "Today",
};

// Set custom locale
LocaleConfig.defaultLocale = "custom";

const CalenderCom = ({ onSelectDate }) => {
  const [selected, setSelected] = useState("");

  // Get current date dynamically
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // Generate disabled weekends
  const generateDisabledWeekends = () => {
    const startDate = new Date("2023-10-01");
    const endDate = new Date(today);
    let disabledDates = {};

    // Loop through all dates from startDate to today
    while (startDate <= endDate) {
      const day = startDate.getDay(); // Get day index (0 = Sunday, 6 = Saturday)
      const dateString = startDate.toISOString().split("T")[0]; // Format date

      if (day === 0 || day === 6) {
        // Mark weekends as disabled
        disabledDates[dateString] = {
          disabled: true,
          disableTouchEvent: true,
          dotColor: "red", // Optional: mark with a red dot
        };
      }

      startDate.setDate(startDate.getDate() + 1);
    }

    return disabledDates;
  };

  // Store disabled weekends
  const disabledWeekends = generateDisabledWeekends();

  return (
    <Calendar
      style={styles.calender}
      current={today} // Set current date dynamically
      minDate={"2023-10-01"} // Start date: 1st October 2023
      maxDate={today} // End date: Current date dynamically
      onDayPress={(day) => {
        setSelected(day.dateString);
        onSelectDate(day.dateString);
      }}
      markedDates={{
        [today]: {
          selected: true,
          selectedColor: "rgba(255, 0, 0, 0.7)", // Red background with opacity
          selectedTextColor: "white",
        },
        [selected]: {
          selected: true,
          disableTouchEvent: true,
          selectedColor: "rgba(217, 217, 217, 0.5)",
        },
        ...disabledWeekends, // Add disabled weekends
      }}
      theme={{
        backgroundColor: "#1C1E1F", // Outer background
        calendarBackground: "#1C1E1F", // Calendar background
        textSectionTitleColor: "#b6c1cd", // Month title color
        todayTextColor: "#00adf5", // Today text color
        dayTextColor: "white", // Normal day text color
        textDisabledColor: "#555555", // Disabled day text color
        arrowColor: "#00adf5", // Navigation arrows
        monthTextColor: "white", // Month text color
        indicatorColor: "#00adf5", // Month indicator
        textDayFontWeight: "500",
        textMonthFontWeight: "bold",
        textDayHeaderFontWeight: "bold",
        textDayFontSize: 16,
        textMonthFontSize: 18,
        textDayHeaderFontSize: 14,
        textDayHeaderColor: "#FF5733", // Customize weekday text color
      }}
    />
  );
};

export default CalenderCom;

const styles = StyleSheet.create({
  calender: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    marginTop: 20,
    width: width * 0.9,
  },
});
