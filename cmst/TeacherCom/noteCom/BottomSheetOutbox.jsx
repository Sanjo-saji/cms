import { View } from "react-native";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  useCallback,
} from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Content from "../../TeacherCom/Sheet/Content";
import imagepath_t from "../../app/constant/imagepath_t";

const BottomSheetOutbox = forwardRef(({ onClose, onDelete }, ref) => {
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
            onpress={onDelete}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default BottomSheetOutbox;
