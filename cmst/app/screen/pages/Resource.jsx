import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import ModuleCom from "../../../components/pages/Resource/ModuleCom";
import Floatbutton from "../../../TeacherCom/noteCom/floatbutton";
import Pop from "../../../TeacherCom/model/Pop";
import BottomNot from "../../../TeacherCom/Sheet/BottomNot";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Resource = () => {
  const { subject } = useLocalSearchParams();
  const subjectData = subject ? JSON.parse(subject) : null;
  const [modalVisible, setModalVisible] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const bottomSheetRef = useRef(null);
  const handleLongPress = () => {
    setIsSheetVisible(true);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          data={subjectData?.modules || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ModuleCom
              module={item}
              subjectName={subjectData.name}
              longpress={handleLongPress}
            />
          )}
        />
        <Floatbutton
          onPress={() => {
            setModalVisible(true);
          }}
          icon="plus"
        />
        <Pop
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          title="Module creation"
          placeholder="Enter your module name"
          buttonName="Create"
        />
      </View>
      {isSheetVisible && (
        <BottomNot
          ref={bottomSheetRef}
          onClose={() => setIsSheetVisible(false)}
        />
      )}
    </GestureHandlerRootView>
  );
};

export default Resource;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
});
