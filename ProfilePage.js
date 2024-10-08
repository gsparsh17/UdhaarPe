import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ProfilePage = () => {
  const [userData, setUserData] = useState({ name: '', phone: '', upiId: '' });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const currentUser = auth().currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser) {
          console.log('No current user found');
          return;
        }

        const userId = currentUser.uid;
        console.log('Fetching data for userId:', userId);

        const userDoc = await firestore().collection('Users').doc(userId).get();

        if (userDoc.exists) {
          setUserData(userDoc.data());
        } else {
          console.log('No user data found for userId:', userId);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);


  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = currentUser.uid;

      // Update Firestore with the new data
      await firestore().collection('Users').doc(userId).set(userData);

      Alert.alert('Success', 'Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile: ', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={require('./icon.png')} // Placeholder image URL
          style={styles.profilePic}
        />
        <Text style={styles.profileName}>{userData.name || 'John Doe'}</Text>
      </View>
      <View style={styles.profileInfo}>
        {!editing ? (
          <>
            <Text style={styles.infoText}>Phone: {userData.phone || '123-456-7890'}</Text>
            <Text style={styles.infoText}>UPI ID: {userData.upiId || 'example@upi'}</Text>
            <Button title="Edit Profile" onPress={() => setEditing(true)} color="#007bff" />
          </>
        ) : (
          <View>
            <TextInput
              style={styles.input}
              value={userData.name}
              onChangeText={(text) => setUserData({ ...userData, name: text })}
              placeholder="Name"
            />
            <TextInput
              style={styles.input}
              value={userData.phone}
              onChangeText={(text) => setUserData({ ...userData, phone: text })}
              placeholder="Phone"
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              value={userData.upiId}
              onChangeText={(text) => setUserData({ ...userData, upiId: text })}
              placeholder="UPI ID"
            />
            {saving ? (
              <ActivityIndicator size="small" color="#007bff" />
            ) : (
              <Button title="Save Changes" onPress={handleSave} color="#28a745" />
            )}
            <Button title="Cancel" onPress={() => setEditing(false)} color="#dc3545" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    flex: 1,
    backgroundColor: '#e4f5ff',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007bff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  profileInfo: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfilePage;
