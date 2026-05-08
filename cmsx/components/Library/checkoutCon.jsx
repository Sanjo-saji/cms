import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from "react-native";
import imagePath from "../../app/constant/imagePath";
import { useState, useRef, useEffect } from "react";
import API from "../../app/API/api";
const screenHeight = Dimensions.get("window").height;

const CheckoutContainer = () => {
  const scrollViewRef = useRef(null);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [books, setBooks] = useState([]);

  // ✅ Fetch data from API
  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const res = await API.get("/data/checkout"); // adjust endpoint if different
        const { books } = res.data; // ✅ only books now

        // Each book already has checkoutDate + dueDate
        const formatted = books.map((book) => ({
          id: book._id,
          title: book.title,
          checkoutDate: new Date(book.checkoutDate).toLocaleDateString(),
          dueDate: new Date(book.dueDate).toLocaleDateString(),
          image: book.cover ? { uri: book.cover } : imagePath.Book1,
        }));

        setBooks(formatted);
      } catch (error) {
        console.error("❌ Failed to fetch checkout data:", error.message);
      }
    };

    fetchCheckoutData();
  }, []);

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const isScrolledToEnd =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isScrolledToEnd && !isAtEnd) {
      setIsAtEnd(true);
      startBurstAnimation();
    } else if (!isScrolledToEnd && isAtEnd) {
      setIsAtEnd(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      Animated.timing(widthAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const startBurstAnimation = () => {
    fadeAnim.setValue(0);
    widthAnim.setValue(0);
    pulseAnim.setValue(1);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(widthAnim, {
        toValue: 100,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
  };

  useEffect(() => {
    return () => {
      fadeAnim.stopAnimation();
      widthAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, []);

  const renderBookItem = (item, index) => (
    <TouchableOpacity
      key={`${item.id}-${index}`}
      style={styles.contents}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.bookName}>{item.title}</Text>
        <Text style={styles.date}>Checked out Date: {item.checkoutDate}</Text>
        <Text style={styles.date}>Due Date: {item.dueDate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {books.length > 0 ? (
        <View style={styles.scrollContainer}>
          <ScrollView
            ref={scrollViewRef}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            style={styles.scrollViewStyle}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {books.map((item, index) => renderBookItem(item, index))}
          </ScrollView>

          <View style={styles.indicatorContainer}>
            <Animated.View
              style={[
                styles.scrollEndIndicator,
                {
                  opacity: fadeAnim,
                  width: widthAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "90%"],
                  }),
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.6],
                  }),
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No books checked out</Text>
        </View>
      )}
    </View>
  );
};

export default CheckoutContainer;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#1A1C1E",
    overflow: "hidden",
    width: "90%",
    alignSelf: "center",
  },
  scrollContainer: {
    position: "relative",
  },
  scrollViewStyle: {
    maxHeight: screenHeight * 0.35,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contents: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  imageContainer: {
    width: 53,
    height: 58,
    borderRadius: 4,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  bookName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
  },
  scrollEndIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#4CAF50",
    borderRadius: 1.5,
  },
});
