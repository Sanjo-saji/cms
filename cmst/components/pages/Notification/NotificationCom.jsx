import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";

const NotificationCom = ({
  Heading,
  date,
  content,
  sender,
  onLongPress,
  item,
}) => {
  const truncate = (text, max) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  return (
    <TouchableOpacity
      onLongPress={() => onLongPress && onLongPress(item)}
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/screen/pages/NotifictaionDetails",
          params: {
            Heading,
            content,
            date,
            sender,
          },
        })
      }
    >
      <View style={styles.NotificatiomImage}>
        <Image
          source={{
            uri: "https://miserably-arriving-adder.ngrok-free.app/images/message.png",
          }}
          style={styles.NotificatiomIcon}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.HeadingContent}>
          <Text style={styles.Heading}> {truncate(Heading, 15)}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Text style={styles.messages} numberOfLines={1}>
          {content}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCom;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1A1C1E",
    height: 90,
    width: "90%",
    marginBottom: 10,
    paddingHorizontal: 35,
    marginHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3F3E3E",
    borderRadius: 10,
  },
  NotificatiomImage: {
    width: 40,
    height: 40,
  },
  NotificatiomIcon: {
    width: "100%",
    height: "100%",
    marginRight: 10,
  },
  content: {
    marginHorizontal: 3,
    paddingHorizontal: 10,
  },
  HeadingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  Heading: {
    color: "white",
    fontWeight: "light",
    fontSize: 20,
    width: "70%",
  },
  messages: {
    color: "white",
    fontWeight: "300",
    fontSize: 13,
    paddingHorizontal: 10,
  },
  date: {
    color: "white",
    fontWeight: "light",
    fontSize: 13,
  },
});
