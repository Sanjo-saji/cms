import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import imagePath from "../../../../app/constant/imagePath";

const PdfCom = ({ title, onClick }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onClick}>
      <View style={styles.content}>
        <View style={styles.pdfImage}>
          <Image source={imagePath.PDFIcon} style={styles.pdfIcon} />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
      <View style={styles.dowloadImage}>
        <Image source={imagePath.DowloadIcon} style={styles.dowloadIcon} />
      </View>
    </TouchableOpacity>
  );
};

export default PdfCom;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "90%",
    paddingVertical: 20,
    marginBottom: 10,
    alignItems: "center",
    backgroundColor: "#1A1C1E",
    justifyContent: "space-between",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#3F3E3E",
  },

  content: {
    flexDirection: "row",
  },

  pdfImage: {
    width: 29,
    height: 29,
    marginHorizontal: 15,
  },
  pdfIcon: {
    width: "100%",
    height: "100%",
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    maxWidth: "75%",
  },

  dowloadImage: {
    width: 28,
    height: 28,
    marginRight: 14,
  },
  dowloadIcon: {
    width: "100%",
    height: "100%",
  },
});
