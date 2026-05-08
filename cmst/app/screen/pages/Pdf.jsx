import { StyleSheet, View, Alert, ActivityIndicator } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import PdfCom from "../../../components/pages/Resource/pdfcomentent/PdfCom";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Floatbutton from "../../../TeacherCom/noteCom/floatbutton";
import BottomNot from "../../../TeacherCom/Sheet/BottomNot";
import * as DocumentPicker from "expo-document-picker";
import Pop from "../../../TeacherCom/model/Pop";
import { useCourseSemester } from "../introduction/CourseSemesterContext";
import API from "../../API/api";
import events from "../../../app/events";

const Pdf = () => {
  const params = useLocalSearchParams();
  const [lectures, setLectures] = useState(JSON.parse(params.pdfs || "[]"));
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [canUpload, setCanUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [uploading, setUploading] = useState(false);

  const { courseId, semesterId } = useCourseSemester();
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    const checkPermission = async () => {
      if (!courseId || !semesterId || !params.id) return;
      try {
        const res = await API.post(
          `/data/check-assignment?course=${courseId}&semster=${semesterId}`,
          {
            subjectId: params.id,
            course: courseId,
            semester: semesterId,
          }
        );
        if (res.data.assigned === true) setCanUpload(true);
      } catch (err) {
        console.error(
          "Assignment check failed:",
          err.response?.data || err.message
        );
      }
    };
    checkPermission();
  }, [courseId, semesterId, params.id]);

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setFile(asset);
        setPdfName(asset.name.replace(".pdf", ""));
        setShowRenameModal(true);
      }
    } catch (err) {
      console.error("❌ File pick error:", err);
    }
  };

  const handleUpload = async () => {
    if (!file || !pdfName.trim()) {
      Alert.alert("Error", "Please select a file and enter a name.");
      return false;
    }

    const uri = file.uri.startsWith("file://")
      ? file.uri
      : `file://${file.uri}`;
    const formData = new FormData();
    formData.append("pdf", {
      uri,
      name: `${pdfName}.pdf`,
      type: "application/pdf",
    });
    formData.append("course", courseId);
    formData.append("semster", semesterId);
    formData.append("subjectId", params.id);

    try {
      setUploading(true);
      await API.post("/notes/upload-note", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFile(null);
      setPdfName("");
      setShowRenameModal(false);
      await refreshPDFs();

      // ✅ Tell parent screen to refresh
      events.emit("refreshNotes");

      return true;
    } catch (err) {
      console.error(
        "❌ Upload error:",
        err.response?.data || err.message || err
      );
      Alert.alert(
        "Upload Failed",
        err.response?.data?.message || "Network/server error"
      );
      return false;
    } finally {
      setUploading(false);
    }
  };

  const refreshPDFs = async () => {
    try {
      const res = await API.get(
        `/data/get-t-notes?course=${courseId}&semster=${semesterId}`
      );
      const subject = res.data.data.find((s) => s.id === params.id);
      if (subject) setLectures(subject.pdfs || []);
    } catch (err) {
      console.error("❌ Failed to refresh notes:", err);
    }
  };

  const BASE_URL = "http://192.168.1.2:3000/api/data";

  const handleDownload = async (item) => {
    try {
      const cleanUrl = item.url.replace("/teacher", "");
      const downloadUrl = `${BASE_URL}${cleanUrl}`;
      const localUri = `${FileSystem.documentDirectory}${item.name}`;
      const { uri } = await FileSystem.downloadAsync(downloadUrl, localUri);
      const contentUri = await FileSystem.getContentUriAsync(uri);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        flags: 1,
        type: "application/pdf",
      });
    } catch (error) {
      console.error("❌ Failed to open PDF:", error);
      Alert.alert("Error", "Could not open PDF. Please try again.");
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {lectures.map((pdf, index) => (
          <PdfCom
            key={index}
            title={pdf.name}
            url={`${BASE_URL}${pdf.url}`}
            onPress={() => handleDownload(pdf)}
            lonpress={() => {
              setSelectedPdf(pdf);
              setIsSheetVisible(true);
            }}
          />
        ))}

        {canUpload && <Floatbutton icon="plus" onPress={pickPDF} />}

        {uploading && (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={{ marginTop: 10 }}
          />
        )}
      </View>

      {isSheetVisible && (
        <BottomNot
          ref={bottomSheetRef}
          onClose={() => setIsSheetVisible(false)}
          courseId={courseId}
          semesterId={semesterId}
          subjectId={params.id}
          selectedPdf={selectedPdf}
          refreshPDFs={async () => {
            await refreshPDFs();
            events.emit("refreshNotes"); // ✅ also on delete
          }}
        />
      )}

      <Pop
        placeholder="Enter PDF name"
        title="Rename PDF"
        buttonName="Upload"
        modalVisible={showRenameModal}
        setModalVisible={setShowRenameModal}
        onSubmit={handleUpload}
        pdfName={pdfName}
        setPdfName={setPdfName}
      />
    </GestureHandlerRootView>
  );
};

export default Pdf;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
    paddingVertical: 20,
    alignItems: "center",
  },
});
