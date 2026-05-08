import { StyleSheet, Text, View, Image } from "react-native";
import imagePath from "../../../app/constant/imagePath";
import { useState, useEffect } from "react";
import API from "../../../app/API/api";
const ProfileCom = () => {
  const [name, setName] = useState("");
  const [sclass, setClass] = useState("");
  const [semester, setSemester] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [phone, setPhone] = useState("");
  const [sDOB, setDOB] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await API.get("/data/profile");
        setName(response.data.name);
        setClass(response.data.class);
        setSemester(response.data.semester);
        setAdmissionNo(response.data.admission);
        setPhone(response.data.phone);
        setDOB(response.data.DOB);
        setImage(response.data.image);
      } catch (error) {
        console.log(error);
      }
    };
    getProfile();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.ProfilePicture}>
          <Image
            source={image ? { uri: image } : imagePath.ProfileImage}
            style={styles.profilePhoto}
          />
        </View>
        <View style={styles.ProfileName}>
          <Text style={styles.sname}>{name}</Text>
          <Text style={styles.insititude}>IHRD</Text>
        </View>
      </View>
      <View style={styles.Details}>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>
            Class : {sclass} {semester}{" "}
          </Text>
          <Text style={styles.detailsDOB}>DOB : {sDOB} </Text>
        </View>
        <Text style={styles.detailsText}>Admission No : {admissionNo} </Text>
        <Text style={styles.detailsText}>Phone : {phone} </Text>
      </View>
    </View>
  );
};

export default ProfileCom;

const styles = StyleSheet.create({
  container: {
    width: "92%",
    padding: 15,
    backgroundColor: "#1A1C1E",
    borderWidth: 1,
    borderColor: "#3F3E3E",
    borderRadius: 20,
    marginBottom: 15,
  },
  ProfilePicture: {
    width: 80,
    height: 74,
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
  },
  profileContainer: {
    flexDirection: "row",
  },
  ProfileName: {
    flexDirection: "column",
    margin: 10,
    alignItems: "center",
  },
  sname: {
    color: "white",
    fontSize: 25,
  },
  insititude: {
    color: "#EB09B3",
    fontSize: 15,
  },
  Details: {
    marginTop: 10,
  },
  detailsText: {
    paddingTop: 5,
    color: "white",
    fontSize: 18,
  },

  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsDOB: {
    color: "white",
    fontSize: 18,
  },
});
