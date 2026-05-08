import {
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState } from "react";
import Floatbutton from "../../../TeacherCom/noteCom/floatbutton";
import imagepath_t from "../../constant/imagepath_t";
import API from "../../API/api";
import { useCourseSemester } from "../introduction/CourseSemesterContext";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

const NotificatonCompose = () => {
  const [contentHeight, setContentHeight] = useState(500);
  const params = useLocalSearchParams();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const { courseId, semesterId } = useCourseSemester();
  useEffect(() => {
    if (params.isEdit) {
      setSubject(params.title || "");
      setContent(params.message || "");
    }
  }, [params.isEdit, params.title, params.message]);

  const handleSendNotification = async () => {
    try {
      if (!subject.trim() || !content.trim()) {
        alert("Please fill in both subject and content");
        return;
      }

      if (params.isEdit && params.itemId) {
        // Update existing notification
        await API.put(`/data/update-message/${params.itemId}`, {
          heading: subject,
          content,
        });
        alert("Message updated successfully");
      } else {
        // Create new notification
        await API.post("/data/add-message-t", {
          course: courseId,
          semster: semesterId,
          Heading: subject,
          content,
        });
        alert("Message sent successfully");
      }
      // Navigate back to the outbox
      router.back();
    } catch (error) {
      console.log(error);
      alert("Error sending message");
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ backgroundColor: "#121212" }}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            placeholder="Subject"
            placeholderTextColor="#888"
            style={styles.inputTitle}
            value={subject}
            onChangeText={setSubject}
            autoFocus={!!params.isEdit}
          />

          <TextInput
            placeholder="Content"
            placeholderTextColor="#888"
            style={[styles.inputContent, { height: contentHeight }]}
            value={content}
            onChangeText={setContent}
            autoFocus={!!params.isEdit}
            multiline
            textAlignVertical="top"
            keyboardAppearance="dark"
            onContentSizeChange={(e) => {
              const newHeight = Math.max(500, e.nativeEvent.contentSize.height);
              if (newHeight !== contentHeight) {
                setContentHeight(newHeight);
              }
            }}
          />

          {/* Keep only one instance of the button */}
          <Floatbutton
            icon={imagepath_t.send}
            label="Send"
            onPress={handleSendNotification}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default NotificatonCompose;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#121212",
    paddingBottom: 80, // Adjust padding to avoid overlap with the button
  },
  inputTitle: {
    color: "white",
    fontSize: 20,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  inputContent: {
    color: "white",
    fontSize: 17,
    paddingHorizontal: 20,
    maxHeight: 300,
  },
});
