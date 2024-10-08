import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Success', 'Logged in successfully');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('No Account Found', 'I Think U Have to SignUp First');
    }
  };

  const handlePhoneSignIn = async () => {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
      Alert.alert('OTP Sent', 'Please check your phone for the OTP');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleOtpVerification = async () => {
    try {
      await confirm.confirm(otp);
      Alert.alert('Success', 'Logged in successfully');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP');
    }
  };

  return (
    <View style={styles.container}>
    <Image source={require('./icon.png')} style={styles.icon} />
      <Text style={styles.header}>Login</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Email and Password Login */}
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
      <Button title="Login" onPress={handleLogin} color="#007bff" />

      <Text style={styles.divider}>or</Text>

      {/* Phone Number Login */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#6c757d"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <Button title="Sign in with Phone Number" onPress={handlePhoneSignIn} color="#007bff" />

      {/* OTP Input (Only visible after OTP is sent) */}
      {confirm && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            placeholderTextColor="#6c757d"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <Button title="Verify OTP" onPress={handleOtpVerification} color="#007bff" />
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
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
    color: 'black',
  },
  signUpText: {
    color: '#007bff',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  error: {
    color: '#dc3545',
    marginBottom: 15,
    textAlign: 'center',
  },
  icon: {
        width: 200, // adjust the size accordingly
        height: 200,
        alignSelf: 'center',
        marginBottom: 20,
        marginTop: -40,
      },
  divider: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#6c757d',
  },
});

export default LoginScreen;
