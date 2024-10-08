import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // Ensure this module is correctly implemented and imported

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [error, setError] = useState('');
  const [showSimModal, setShowSimModal] = useState(false);

  // Validate fields before sending OTP
  const validateFieldsForOtp = () => {
    if (!name || !phone) {
      Alert.alert('Missing Fields', 'Please fill in all fields before sending OTP.');
      return false;
    }
    return true;
  };

  // Validate fields before signing up
  const validateFieldsForSignUp = () => {
    if (!otp || !email || !password || !upiId) {
      Alert.alert('Missing Fields', 'Please fill in all fields before signing up.');
      return false;
    }
    return true;
  };

  // Step 1: Send OTP
  const sendOtp = async () => {
    if (!validateFieldsForOtp()) return;

    try {
      const confirmation = await auth().signInWithPhoneNumber(`+91${phone}`);
      console.log(confirmation);
      setVerificationId(confirmation.verificationId);
      Alert.alert('OTP Sent', 'Please check your phone for the OTP');
    } catch (error) {
      setError(error.message);
      Alert.alert('Error', error.message);
    }
  };

  // Step 2: Verify OTP and Sign Up
  const verifyOtpAndSignUp = async () => {
    if (!validateFieldsForSignUp()) return;

    try {
      if (verificationId) {
        const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
        await auth().signInWithCredential(credential);
        Alert.alert('Success', 'Phone number verified');

        // Create email account after phone verification
        await auth().createUserWithEmailAndPassword(email, password);
        const userId = auth().currentUser.uid;

        // Save user data in Firestore
        await firestore().collection('Users').doc(userId).set({
          name,
          phone
        });
        await firestore().collection('Users').doc(userId).collection('Profile').doc(userId).set({
                            name,
                            phone,
                            upiId,
                            email
         });

        Alert.alert('Success', 'User registered successfully');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Please request OTP first');
      }
    } catch (error) {
      setError('Invalid OTP or signup failed');
      Alert.alert('Error', 'Invalid OTP');
    }
  };


  return (
    <View style={styles.container}>
      <Image source={require('./icon.png')} style={styles.icon} />
      <Text style={styles.header}>Sign Up</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#6c757d"
        value={name}
        onChangeText={setName}
      />

      {/* Phone Number Input */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#6c757d"
        value={phone ? `+91${phone}` : ''}
        onChangeText={text => setPhone(text.replace(/^\+91/, ''))}
        keyboardType="phone-pad"
      />

      {/* Button to Send OTP */}
      <View style={{ marginBottom: 10 }}>
        <Button title="Send OTP" onPress={sendOtp} color="#28a745" />
      </View>

      {/* OTP Input (Shown after OTP is sent) */}
      {verificationId && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            placeholderTextColor="#6c757d"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <Button title="Verify OTP and Sign Up" onPress={verifyOtpAndSignUp} color="#007bff"/>
        </>
      )}

      {/* UPI ID, Email, and Password Fields */}
      <TextInput
        style={styles.input}
        placeholder="UPI Id"
        placeholderTextColor="#6c757d"
        value={upiId}
        onChangeText={setUpiId}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6c757d"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6c757d"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#e4f5ff',
  },
  icon: {
      width: 200, // adjust the size accordingly
      height: 200,
      alignSelf: 'center',
      marginBottom: 20,
      marginTop: -40,
    },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    color: "black",
  },
  error: {
    color: '#dc3545',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default SignUpScreen;
