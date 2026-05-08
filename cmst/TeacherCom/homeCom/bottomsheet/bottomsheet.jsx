import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { StyleSheet } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import BottomNew from "./bottomNew";
import BottomCom from "./bottomCom";
import Close from "./close";

const Bottomsheet = forwardRef((_, ref) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["100%"], []);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    expand: () => {
      setSelectedItem(null);
      setIsVisible(true);
      bottomSheetRef.current?.expand();
    },
    close: () => {
      setIsVisible(false);
      bottomSheetRef.current?.close();
    },
    reset: () => {
      setSelectedItem(null);
      setIsVisible(true);
      bottomSheetRef.current?.expand();
    },
  }));

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      setSelectedItem(null);
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      onChange={handleSheetChanges}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      backgroundStyle={{ backgroundColor: "rgba(26, 28, 30, 0.9)" }}
      handleIndicatorStyle={{ backgroundColor: "white" }}
      activeOffsetY={[-1, 1]}
      failOffsetX={[-5, 5]}
      waitFor={selectedItem ? undefined : bottomSheetRef}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Close onPress={() => ref?.current?.close()} />
        {selectedItem ? (
          <BottomCom
            id={selectedItem.id}
            image={selectedItem.image}
            subject={selectedItem.title}
            content={selectedItem.description}
            isNew={selectedItem.isNew}
            del={selectedItem.del_on}
            onCancel={() => setSelectedItem(null)}
          />
        ) : (
          <BottomNew
            onItemPress={(item) => setSelectedItem(item)}
            isVisible={isVisible}
          />
        )}
      </BottomSheetView>
    </BottomSheet>
  );
});

export default Bottomsheet;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingVertical: 20,
  },
});
