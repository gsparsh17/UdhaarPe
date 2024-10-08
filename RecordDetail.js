import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Linking, Alert, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import SmsAndroid from 'react-native-sms';
import firestore from '@react-native-firebase/firestore';

const RecordDetail = ({ route, navigation }) => {
  const { record } = route.params;
  const [editMode, setEditMode] = useState(false);
  const [editedRecord, setEditedRecord] = useState({ ...record });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reminderMessage, setReminderMessage] = useState(`Bhai Mere ${record.amount} kab Bhejega`);
  const [interval, setInterval] = useState('daily');

  const sendSmsReminder = () => {
    if (!record.phone) {
      Alert.alert('Error', 'Phone number is missing.');
      return;
    }
    SmsAndroid.autoSend(
      record.phone,
      reminderMessage,
      (fail) => {
        console.error('Failed to send SMS:', fail);
        Alert.alert('Error', 'Failed to send SMS');
      },
      (success) => {
        console.log('SMS sent successfully:', success);
        Alert.alert('Success', 'SMS sent successfully');
      }
    );
  };

  const sendWhatsAppReminder = () => {
    if (!editedRecord.phone) {
      Alert.alert('Error', 'Phone number is missing.');
      return;
    }
    const message = `Bhai Mere ${editedRecord.amount} Kb Bhejega`;
    const url = `https://wa.me/+91${editedRecord.phone}?text=${message}`;
    Linking.openURL(url)
      .catch(err => console.error('Error opening WhatsApp:', err));
  };

  const fetchRecord = async () => {
    try {
      if (!record.id) {
        Alert.alert('Error', 'Record ID is missing.');
        return;
      }
      const recordRef = firestore().collection('Users').doc(record.id).collection('TransactionRecords').doc(record.docRef);
      const doc = await recordRef.get();
      if (doc.exists) {
        setEditedRecord(doc.data());
      } else {
        Alert.alert('No such document!');
      }
    } catch (error) {
      console.error('Error fetching document: ', error);
      Alert.alert('Error fetching record');
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    try {
      await firestore().collection('Users').doc(record.id).collection('TransactionRecords').doc(record.docRef).update(editedRecord);
      await firestore().collection('TransactionRecords').doc(record.docRef).update(editedRecord);
      Alert.alert('Record updated successfully');
      fetchRecord();
      setEditMode(false);
    } catch (error) {
      console.error('Error updating document: ', error);
      Alert.alert('Error updating record');
    }
  };

  const handleDelete = async () => {
    try {
      if (!record.id) {
        Alert.alert('Error', 'Record ID is missing.');
        return;
      }
      await firestore().collection('Users').doc(record.id).collection('TransactionRecords').doc(record.docRef).delete();
      await firestore().collection('TransactionRecords').doc(record.docRef).delete();
      Alert.alert('Record deleted successfully');
      navigation.goBack(); // Go back after deletion
    } catch (error) {
      console.error('Error deleting document: ', error);
      Alert.alert('Error deleting record');
    }
  };

  const callUser = () => {
    if (!editedRecord.phone) {
      Alert.alert('Error', 'Phone number is missing.');
      return;
    }
    Linking.openURL(`tel:+91${editedRecord.phone}`);
  };

  const messageUser = () => {
    if (!editedRecord.phone) {
      Alert.alert('Error', 'Phone number is missing.');
      return;
    }
    Linking.openURL(`sms:+91${editedRecord.phone}?body=Reminder: Bhai Mere ${editedRecord.amount} Kab Bhejega`);
  };

  const handleSendReminder = async () => {
    sendSmsReminder();
    await scheduleReminders();
  };

  const handleChangeStatus = async () => {
    const newStatus = editedRecord.status === 'UnCleared' ? 'Cleared' : 'Uncleared';
    try {
      await firestore().collection('Users').doc(record.id).collection('TransactionRecords').doc(record.docRef).update({status: newStatus});
      await firestore().collection('TransactionRecords').doc(record.docRef).update({
        status: newStatus
      });
      setEditedRecord({ ...editedRecord, status: newStatus });
      Alert.alert('Success', `Status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to change status');
    }
  };

  useEffect(() => {
    fetchRecord();
  }, []);

  return (
    <View style={styles.container}>
      {editMode ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={editedRecord.name}
            onChangeText={(text) => setEditedRecord({ ...editedRecord, name: text })}
            placeholder="Name"
            placeholderTextColor="#6c757d"
          />
          <TextInput
            style={styles.input}
            value={editedRecord.amount}
            onChangeText={(text) => setEditedRecord({ ...editedRecord, amount: text })}
            placeholder="Amount"
            keyboardType="numeric"
            placeholderTextColor="#6c757d"
          />
          <TextInput
            style={styles.input}
            value={editedRecord.dueDate}
            onChangeText={(text) => setEditedRecord({ ...editedRecord, dueDate: text })}
            placeholder="Due Date"
            placeholderTextColor="#6c757d"
          />
          <TextInput
            style={styles.input}
            value={editedRecord.phone}
            onChangeText={(numeric) => setEditedRecord({ ...editedRecord, phone: numeric })}
            placeholder="Phone"
            keyboardType="phone-pad"
            placeholderTextColor="#6c757d"
          />
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Name: </Text>
              <Text style={styles.value}>{editedRecord.name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Amount: </Text>
              <Text style={styles.value}>{editedRecord.amount}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Start Date: </Text>
              <Text style={styles.value}>{editedRecord.date}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Due Date: </Text>
              <Text style={styles.value}>{editedRecord.dueDate}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Phone: </Text>
              <Text style={styles.value}>{editedRecord.phone}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Status: </Text>
              <Text style={styles.value}>{editedRecord.status}</Text>
            </View>
          </View>
        </View>
      )}
      <TouchableOpacity style={[styles.button, styles.reminderButton]} onPress={handleChangeStatus}>
              <Text style={styles.buttonText}>Cleared</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleEditToggle}>
        <Text style={styles.buttonText}>{editMode ? 'Cancel' : 'Edit Record'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.reminderButton]} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>Set Up Reminder</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.callButton]} onPress={callUser}>
        <Text style={styles.buttonText}>Call</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.messageButton]} onPress={messageUser}>
        <Text style={styles.buttonText}>Send SMS Reminder</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.whatsappButton]} onPress={sendWhatsAppReminder}>
        <Text style={styles.buttonText}>Send WhatsApp Reminder</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
        <Text style={styles.buttonText}>Delete Record</Text>
      </TouchableOpacity>

      {/* Modal for customizing the reminder */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Customize Reminder</Text>
          <TextInput
            style={styles.modalInput}
            value={reminderMessage}
            onChangeText={setReminderMessage}
            placeholder="Enter reminder message"
            placeholderTextColor="#6c757d"
          />
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSendReminder}>
            <Text style={styles.buttonText}>Save Reminder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e4f5ff',
  },
  editContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
    color: '#6c757d',
  },
  infoContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: 'blue',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  reminderButton: {
    backgroundColor: '#ffca28',
  },
  callButton: {
    backgroundColor: '#34b7f1',
  },
  messageButton: {
    backgroundColor: '#4caf50',
  },
  whatsappButton: {
    backgroundColor: '#25d366',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  infoContainer: {
      marginBottom: 20,
      padding: 10,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      borderColor: '#e3e3e3',
      borderWidth: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#343a40',
      marginRight: 5,
    },
    value: {
      fontSize: 16,
      color: '#6c757d',
    },
    icon: {
      marginRight: 10,
    },
});

export default RecordDetail;
