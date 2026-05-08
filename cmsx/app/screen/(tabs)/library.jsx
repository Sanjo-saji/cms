import { useState, useEffect, useRef, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  View,
  Animated,
} from "react-native";
import { Searchbar } from "react-native-paper";
import CheckoutContainer from "../../../components/Library/checkoutCon";
import AvailablebookCom from "../../../components/Library/availablebookCom";
import { router } from "expo-router";
import API from "../../API/api";

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [expires, setExpires] = useState(null);
  const [otp, setOtp] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const headerOpacity = useRef(new Animated.Value(1)).current;

  // Fetch books
  const fetchBooks = async () => {
    try {
      const res = await API.get("/library/data/get-all-library-books");
      if (res.data && res.data.success) {
        setData(res.data.books);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  // Fetch OTP
  const fetchOtp = async () => {
    try {
      const res = await API.get("/data/otp");
      if (res.data.success && res.data.otp) {
        setOtp(res.data.otp);
        setExpires(new Date(res.data.expires));
      } else {
        setOtp("");
        setExpires(null);
      }
    } catch (err) {
      console.error("Error fetching OTP:", err);
      setOtp("");
      setExpires(null);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBooks();
    await fetchOtp();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchOtp();
  }, []);

  // Auto hide OTP when expired
  useEffect(() => {
    if (expires) {
      const now = new Date();
      const msLeft = new Date(expires).getTime() - now.getTime();

      // --- ADD THIS FOR DEBUGGING ---
      console.log(
        "Received expiration time:",
        new Date(expires).toLocaleString()
      );
      console.log("Current time:", now.toLocaleString());
      console.log("Milliseconds left:", msLeft);
      // -----------------------------

      if (msLeft > 0) {
        const timeout = setTimeout(() => {
          setOtp("");
          setExpires(null);
        }, msLeft);

        return () => clearTimeout(timeout);
      } else {
        console.log("OTP is already expired. Clearing it now."); // Add this log
        setOtp("");
        setExpires(null);
      }
    }
  }, [expires]);

  const filterData = data.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.authors &&
        item.authors
          .join(", ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View>
              {otp ? (
                <View style={styles.otpContainer}>
                  <View style={styles.otpCard}>
                    <Text style={styles.otpText}>{otp}</Text>
                  </View>
                </View>
              ) : null}

              <Searchbar
                placeholder="Search"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBar}
                inputStyle={{ color: "#fff" }}
                iconColor="#fff"
                selectionColor="#fff"
                placeholderTextColor="#fff"
              />

              {searchQuery.trim().length === 0 ? (
                <Animated.View style={{ opacity: headerOpacity }}>
                  <Text style={styles.sectionTitle}>Checked Out Books</Text>
                  <CheckoutContainer />
                </Animated.View>
              ) : null}

              <Text style={styles.sectionTitle}>Available Books</Text>
            </View>
          }
          data={filterData}
          keyExtractor={(item) => item.isbn}
          renderItem={({ item }) => (
            <AvailablebookCom
              image={{ uri: item.cover }}
              bookName={item.title}
              author={item.authors?.join(", ") || "Unknown"}
              onpress={() =>
                router.push({
                  pathname: "/screen/pages/BookDetails",
                  params: { book: JSON.stringify(item) },
                })
              }
            />
          )}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Library;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  otpContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  otpCard: {
    backgroundColor: "#1A1C1E",
    paddingVertical: 30,
    paddingHorizontal: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  otpText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  searchBar: {
    backgroundColor: "#1A1C1E",
    borderWidth: 1,
    borderColor: "#3F3E3E",
    borderRadius: 20,
    marginTop: 60,
    width: 350,
    marginLeft: 30,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 22,
    marginTop: 25,
  },
});
