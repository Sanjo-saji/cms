import { View, Alert } from "react-native";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Content from "./Content";
import imagepath_t from "../../app/constant/imagepath_t";
import API from "../../app/API/api";

const BottomNot = forwardRef(
  (
    { onClose, courseId, semesterId, subjectId, selectedPdf, refreshPDFs },
    ref
  ) => {
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ["18%"], []);

    useImperativeHandle(ref, () => ({
      expand: () => bottomSheetRef.current?.snapToIndex(0),
      close: () => bottomSheetRef.current?.close(),
    }));

    const backdrop = useCallback(
      (props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      []
    );

    const handleDelete = async () => {
      if (!selectedPdf) return;

      const encodedPdfName = encodeURIComponent(selectedPdf.name);
      const url = `/notes/del-notes/${courseId}/${semesterId}/${subjectId}/${encodedPdfName}`;

      try {
        const res = await API.delete(url);
        if (res.data.ok) {
          Alert.alert("Success", "PDF deleted successfully");
          refreshPDFs?.();
        }
      } catch (error) {
        console.error("❌ Delete error:", error);
        Alert.alert("Delete Failed", "Network/server error");
      } finally {
        onClose?.();
      }
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={backdrop}
        backgroundStyle={{ backgroundColor: "rgba(26, 28, 30, 0.9)" }}
        handleIndicatorStyle={{ backgroundColor: "white" }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <View>
            <Content
              image={imagepath_t.deleteIcon}
              text="Delete"
              onpress={handleDelete}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default BottomNot;
