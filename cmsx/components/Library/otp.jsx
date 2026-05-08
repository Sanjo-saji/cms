import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Otp = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.otpText}>OTP</Text>
      </View>
    </View>
  )
}

export default Otp

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // vertically center
    alignItems: 'center',     // horizontally center
    backgroundColor: '#121212', // optional: dark background
  },
  card: {
    backgroundColor: '#1A1C1E',
    paddingVertical: 40,
    paddingHorizontal: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // for Android shadow
  },
  otpText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
})
