import { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import moment from "moment";
import imagePath from "../../../app/constant/imagePath";
import Bottominput from "./bottominput";
import Bottombutton from "./bottombutton";
import Bottomcalender from "./bottomcalender";
import API from "../../../app/API/api";
import { useCourseSemester } from "../../../app/screen/introduction/CourseSemesterContext";

const bottomCom = ({ image, subject, content, id, isNew, del, onCancel }) => {
  const [subjectValue, setSubjectValue] = useState(subject);
  const [contentValue, setContentValue] = useState(content);
  const [pickedImage, setPickedImage] = useState(
    typeof image === "string" ? image : null
  );
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(del);
  const { courseId, semesterId } = useCourseSemester();

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      // Ensure URI is always a string
      setPickedImage(selectedAsset.uri ? String(selectedAsset.uri) : null);
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();

      const deleteDate = selectedDate
        ? moment(selectedDate).format("YYYY-MM-DD")
        : moment().add(2, "days").format("YYYY-MM-DD");

      formData.append("title", subjectValue);
      formData.append("message", contentValue);
      formData.append("course", courseId);
      formData.append("semster", semesterId);
      formData.append("deleteOnDate", deleteDate);

      // 🔹 Only append image if it’s local (not server URL)
      if (pickedImage && !pickedImage.startsWith("http")) {
        const filename = pickedImage.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("image", {
          uri: pickedImage,
          name: filename || `upload.jpg`,
          type,
        });
      }

      await API.put(`/data/update-event/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Event updated!");
    } catch (error) {
      console.log("Update error", error?.response?.data || error.message);
      alert("Update failed!");
    }
  };

  const handleCreate = async () => {
    try {
      const formData = new FormData();
      const deleteDate = selectedDate
        ? moment(selectedDate).format("YYYY-MM-DD")
        : moment().add(2, "days").format("YYYY-MM-DD");
      formData.append("title", subjectValue);
      formData.append("message", contentValue);
      formData.append("course", courseId);
      formData.append("semster", semesterId);
      formData.append("deleteOnDate", deleteDate);

      if (pickedImage) {
        const filename = pickedImage.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("image", {
          uri: pickedImage || imagePath.anime1,
          name: filename,
          type,
        });
      }
      // console.log("Form Data:", formData);
      // console.log("Sending to:", API.defaults.baseURL + "/data/add-event");
      await API.post("/data/add-event", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Event created!");
    } catch (error) {
      console.log("Create error", error?.response?.data || error.message);
      alert("Create failed!");
    }
  };

  const handleSubjectChange = (newValue) => {
    setSubjectValue(newValue);
  };

  const handleContentChange = (newValue) => {
    setContentValue(newValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.firstrow}>
        <TouchableOpacity
          style={isNew ? styles.previous : styles.imageContainer}
          activeOpacity={0.7}
          onPress={handlePickImage}
        >
          {pickedImage ? (
            <Image source={{ uri: pickedImage }} style={styles.editimage} />
          ) : (
            <View style={styles.contents}>
              <View style={styles.newContainer}>
                <Text style={{ color: "white", fontSize: 24 }}>Plus</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.datecontainer}>
          <TextInput
            placeholder="Delete on date"
            placeholderTextColor="#888"
            editable={false}
            style={{ color: "white" }}
            value={selectedDate}
            onChangeText={setSelectedDate}
          />
          <TouchableOpacity
            style={styles.calenderContainer}
            onPress={() => setCalendarVisible(true)}
          >
            <Image
              source={imagePath.calenderIcon}
              style={styles.calendericon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Bottominput
          placeholder={"Subject"}
          value={subjectValue}
          onChange={handleSubjectChange}
        />
      </View>
      <View>
        <Bottominput
          placeholder={"content"}
          value={contentValue}
          onChange={handleContentChange}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Bottombutton text={"Cancel"} check={true} onpress={onCancel} />
        <Bottombutton
          text={isNew ? "Create" : "Update"}
          check={false}
          onpress={isNew ? handleCreate : handleUpdate}
        />
      </View>
      <Bottomcalender
        calendarVisible={calendarVisible}
        selectedDate={selectedDate}
        setCalendarVisible={setCalendarVisible}
        setSelectedDate={setSelectedDate}
      />
    </View>
  );
};
export default bottomCom;

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginLeft: 10,
  },
  firstrow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imageContainer: {
    height: 90,
    width: 150,
  },
  editimage: {
    height: "100%",
    width: "100%",
    borderRadius: 15,
  },
  datecontainer: {
    flexDirection: "row",
    marginRight: 20,
    borderBottomWidth: 1,
    borderColor: "#3F3E3E",
  },
  calenderContainer: {
    height: 24,
    width: 24,
    marginTop: 5,
    marginLeft: 5,
    opacity: 0.7,
  },
  calendericon: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  previous: {
    height: 110,
    width: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  contents: {
    justifyContent: "center",
    alignItems: "center",
  },
  newContainer: {
    height: 100,
    width: 170,
    backgroundColor: "#1A1C1ECC",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});

// {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
