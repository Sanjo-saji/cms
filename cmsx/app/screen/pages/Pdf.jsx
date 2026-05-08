import { StyleSheet, View, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher"; //  /android
import PdfCom from "../../../components/pages/Resource/pdfcomentent/PdfCom";
// import mime from "mime-types"; // optional if you want dynamic

const Pdf = () => {
  const params = useLocalSearchParams();
  const lectures = JSON.parse(params.pdfs || "[]");
  const subject = params.subject;

  const handleDownload = async ({ item }) => {
    const downloadUrl = `http://miserably-arriving-adder.ngrok-free.app/api/data/notes/${subject}/${item.name}`;
    const localUri = `${FileSystem.documentDirectory}${item.name}`;

    try {
      const { uri } = await FileSystem.downloadAsync(downloadUrl, localUri);

      const contentUri = await FileSystem.getContentUriAsync(uri);

      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        flags: 1,
        type: "application/pdf", //  just hardcode since it's always PDF
        // type: mime.lookup(uri) || "application/pdf", // if using mime-types
      });
    } catch (error) {
      console.error("❌ Failed to open PDF:", error);
      Alert.alert("❌ Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {lectures.slice(0, 2).map((lecture, index) => (
        <PdfCom
          key={index}
          title={lecture.name}
          onClick={() => handleDownload({ item: lecture })}
        />
      ))}
    </View>
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
