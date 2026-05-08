import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  Pressable,
} from "react-native";

const Pop = ({
  placeholder,
  title,
  buttonName,
  modalVisible,
  setModalVisible,
  pdfName,
  setPdfName,
  onSubmit,
}) => {
  const handleUpload = async () => {
    const success = await onSubmit();
    if (success) {
      setModalVisible(false);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#888"
            value={pdfName}
            onChangeText={setPdfName}
          />
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                const success = await onSubmit(); // ← wait for upload result
                if (success) {
                  setModalVisible(false); // only close if upload works
                }
              }}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>{buttonName}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Pop;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    backgroundColor: "#2a2a2a",
    color: "white",
    fontSize: 16,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#444",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
  },
  actionText: {
    color: "#000",
    fontSize: 16,
  },
});
