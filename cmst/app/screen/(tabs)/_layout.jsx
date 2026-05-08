import { Tabs } from "expo-router";
import { Image, Text } from "react-native";
import imagePath from "../../constant/imagePath";
const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1A1C1E",
          height: 60,
          paddingTop: 5,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Image
              source={imagePath.homeIcon}
              style={{
                width: focused ? 32 : 29,
                height: focused ? 32 : 29,
                resizeMode: "contain",
              }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: focused ? 12 : 10,
                color: "white",
                fontWeight: "700",
              }}
            >
              Home
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) => (
            <Image
              source={imagePath.chatIcon}
              style={{
                width: focused ? 32 : 27,
                height: focused ? 32 : 27,
                resizeMode: "contain",
              }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: focused ? 13 : 11,
                color: "white",
                fontWeight: "700",
              }}
            >
              Chat
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendence",
          tabBarIcon: ({ focused }) => (
            <Image
              source={imagePath.libraryIcon}
              style={{
                width: focused ? 32 : 28,
                height: focused ? 32 : 28,
                resizeMode: "contain",
              }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: focused ? 13 : 11,
                color: "white",
                fontWeight: "700",
              }}
            >
              Attendence
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="note"
        options={{
          title: "Note",
          tabBarIcon: ({ focused }) => (
            <Image
              source={imagePath.noteIcon}
              style={{
                width: focused ? 32 : 28,
                height: focused ? 32 : 28,
                resizeMode: "contain",
              }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: focused ? 13 : 11,
                color: "white",
                fontWeight: "700",
              }}
            >
              Note
            </Text>
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
