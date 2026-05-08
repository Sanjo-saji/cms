import { Stack, router } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import imagePath from "../../constant/imagePath";

const CustomAppbar = ({ title }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Image source={imagePath.BackArrow} style={styles.backIcon} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const _Pageslayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="Performance"
        options={{ header: () => <CustomAppbar title={"Performance"} /> }}
      />

      <Stack.Screen
        name="Previous"
        options={{
          header: () => <CustomAppbar title={"Previous"} />,
        }}
      />
      <Stack.Screen
        name="Notification"
        options={{
          header: () => <CustomAppbar title={"Notification"} />,
        }}
      />
      <Stack.Screen
        name="NotifictaionDetails"
        options={{
          header: () => <CustomAppbar title={""} />,
        }}
      />
      <Stack.Screen
        name="Profile"
        options={{
          header: () => <CustomAppbar title={"Profile"} />,
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        options={{
          header: () => <CustomAppbar title={"ChangePassword"} />,
        }}
      />
      <Stack.Screen
        name="Resource"
        options={{
          header: () => <CustomAppbar title={"Resource"} />,
        }}
      />
      <Stack.Screen
        name="Pdf"
        options={{
          header: () => <CustomAppbar title={"PDF"} />,
        }}
      />
      <Stack.Screen
        name="notificationCompose"
        options={{
          header: () => <CustomAppbar title={""} />,
        }}
      />
      <Stack.Screen
        name="Schedule"
        options={{
          header: () => <CustomAppbar title={"Schedule"} />,
        }}
      />
      <Stack.Screen
        name="EvaluvationSet"
        options={{
          header: () => <CustomAppbar title={"Pre Entry"} />,
        }}
      />

      <Stack.Screen
        name="ChatScreen"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="outbox"
        options={{
          header: () => <CustomAppbar title={"Outbox"} />,
        }}
      />
      <Stack.Screen
        name="studEvaluationProfile"
        options={{
          header: () => <CustomAppbar title={"Evaluation"} />,
        }}
      />
    </Stack>
  );
};

export default _Pageslayout;

const styles = StyleSheet.create({
  headerContainer: {
    height: 90,
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#121212",
    alignItems: "center",
    paddingTop: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 5,
    marginLeft: 5,
  },
  backIcon: {
    width: 23,
    height: 23,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
