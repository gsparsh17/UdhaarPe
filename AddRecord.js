import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';

const AddRecord = () => {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState('UnCleared');
  const navigation = useNavigation();

  const handleSave = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }

      const userId = currentUser.uid;
      const newDueDate = calculateDueDate(date, duration);

      const formattedAmount = parseFloat(amount).toFixed(2);

      // Create the record object
      const Record = {
        id: userId,
        amount: formattedAmount,
        name,
        phone,
        duration,
        status,
        date,
        dueDate: newDueDate
      };

      // Add the record to the user's collection
      const userRecordRef = await firestore()
        .collection("Users")
        .doc(userId)
        .collection("TransactionRecords")
        .add(Record);

      const docId = userRecordRef.id;

      // Update the document with its own ID
      await userRecordRef.update({ docRef: docId });

      // Add the record to the global collection
      await firestore()
        .collection("TransactionRecords")
        .doc(docId)
        .set({
          ...Record,
          docRef: docId
        });

      // Navigate back after saving
      navigation.goBack();
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert('Error', 'Failed to save record.');
    }
  };

  const calculateDueDate = (startDate, duration) => {
    const Mdate = moment(startDate, 'DD/MM/YYYY');

    if (!duration || typeof duration !== 'string' || !duration.includes(' ')) {
      console.log(`Invalid duration format: ${duration}`);
      return startDate;
    }

    const [durationValue, durationUnit] = duration.split(' ');

    switch (durationUnit) {
      case 'month':
      case 'months':
        return Mdate.add(parseInt(durationValue), 'months').format('DD/MM/YYYY');
      case 'week':
      case 'weeks':
        return Mdate.add(parseInt(durationValue), 'weeks').format('DD/MM/YYYY');
      case 'day':
      case 'days':
        return Mdate.add(parseInt(durationValue), 'days').format('DD/MM/YYYY');
      default:
        console.log(`Unrecognized duration unit: ${durationUnit}`);
        return startDate;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Record</Text>
      <TextInput
        style={styles.input}
        placeholder="Amount"
        placeholderTextColor="#6c757d"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#6c757d"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        placeholderTextColor="#6c757d"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
              style={styles.input}
              placeholder="Date(dd/mm/yyyy)"
              placeholderTextColor="#6c757d"
              keyboardType="text"
              value={date}
              onChangeText={setDate}
            />
      <TextInput
        style={styles.input}
        placeholder="Duration (days)"
        placeholderTextColor="#6c757d"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Record</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4f5ff',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1f78d1',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#1f78d1',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignSelf: 'center',
    marginVertical: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddRecord;
