import { StyleSheet, Text, View, Image } from "react-native";
import { useEffect, useState } from "react";
import API from "../../../app/API/api";
import imagePath_t from "../../../app/constant/imagepath_t";

const ProfileCom = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/data/get-profile");
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "white" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ## Top section with Image and Name ## */}
      <View style={styles.header}>
        <Image
          source={profile.image ? { uri: profile.image } : imagePath_t.studen3}
          style={styles.profilePhoto}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.department}>{profile.department}</Text>
        </View>
      </View>

      {/* ## Details Section ## */}
      <View style={styles.details}>
        <Text style={styles.detailsText}>
          Employee ID : {profile.employeeId}
        </Text>
        <Text style={styles.detailsText}>Role : {profile.role}</Text>
        {/* Render phone number only if it exists */}
        {profile.phone && (
          <Text style={styles.detailsText}>Phone : {profile.phone}</Text>
        )}
      </View>
    </View>
  );
};

export default ProfileCom;

const styles = StyleSheet.create({
  // Main container for the entire card
  container: {
    width: "92%",
    padding: 20,
    backgroundColor: "#1A1C1E",
    borderWidth: 1,
    borderColor: "#3F3E3E",
    borderRadius: 20,
    marginBottom: 60,
  },
  // A simple container for the loading state
  loadingContainer: {
    width: "92%",
    padding: 20,
    backgroundColor: "#1A1C1E",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  // New style for the top row (Image + Text)
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePhoto: {
    width: 70,
    height: 70,
    borderRadius: 35, // Half of width/height for a perfect circle
  },
  // Container for Name and Department
  headerTextContainer: {
    marginLeft: 15, // Space between image and text
    justifyContent: "center",
  },
  name: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  department: {
    color: "#EB09B3",
    fontSize: 15,
    marginTop: 4, // Space between name and department
  },
  // Container for the details below the header
  details: {
    marginTop: 20, // Space between header and details
    borderTopWidth: 1,
    borderTopColor: "#3F3E3E",
    paddingTop: 15,
  },
  detailsText: {
    color: "white",
    fontSize: 16,
    marginBottom: 8, // Space between each detail line
  },
});
