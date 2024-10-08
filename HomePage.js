 import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Alert, TouchableOpacity, PermissionsAndroid, Platform, Image, TextInput, StyleSheet, Modal, AppState, FlatList } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import BackgroundService from 'react-native-background-actions';
import PushNotification from 'react-native-push-notification';
import firestore from '@react-native-firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';
import moment from 'moment';
import messaging from '@react-native-firebase/messaging';
import RecordsSection from './RecordsSection'
import DueSection from './DueSection'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; // Create a new file for the home page
import ProfilePage from './ProfilePage';
import RecordsPage from './RecordsPage';
import DuePage from './DuePage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import UnClearedRecordsSection from './UnClearedRecordsSection';
import BackgroundFetch from 'react-native-background-fetch';

// Configure background fetch


const currentUser = auth().currentUser;

const HomePage = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setconfirmVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [status, setstatus] = useState('UnCleared');
  const [phone, setPhone] = useState('');
  const [duration, setDuration] = useState('');
  const [records, setRecords] = useState([]);
  const [matchedTransaction, setMatchedTransaction] = useState(null);
  const [serviceRunning, setServiceRunning] = useState(true);
  let dueDate = "";
  let date = "";

  useEffect(() => {
    const currentUser = auth().currentUser;
      if (currentUser) {
        const userId = currentUser.uid;
        const usersCollection = firestore().collection('Users').doc(userId).collection('TransactionRecords');

        const unsubscribe = usersCollection.onSnapshot((snapshot) => {
          const fetchedRecords = snapshot.docs.map(doc => {
            const data = doc.data();
            // Calculate the due date by adding the duration to the saved date
            dueDate = calculateDueDate(data.date, data.duration);
            return {
               id: doc.id,
              ...data,
              dueDate
            };
          });

      // Sort the records by the due date in ascending order
      const sortedRecords = fetchedRecords.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            setRecords(sortedRecords);
          }, (error) => {
            console.error("Error fetching data: ", error);
          });

          // Cleanup subscription on unmount
          return () => unsubscribe();
        }
      }, []);

   useEffect(() => {
     console.log('useEffect is being called'); // Check if logs work

     const configureBackgroundFetch = async () => {
       console.log('Configuring BackgroundFetch...'); // Check if this part is reached

       // Your background fetch configuration
       await BackgroundFetch.configure({
         minimumFetchInterval: 1,  // Interval in minutes
         startOnBoot: true,
         stopOnTerminate: false,
         enableHeadless: true,      // Important for Android
       }, async (taskId) => {
         console.log('[BackgroundFetch] taskId: ', taskId); // This should log when the task triggers
         // Simulate a background task
         await handleSMSListeningInBackground();
         await new Promise(resolve => setTimeout(resolve, 1000));
         BackgroundFetch.finish(taskId);
       }, (error) => {
         console.log('[BackgroundFetch] failed to start: ', error); // Log if there's a failure
       });

       // Check background fetch status
       const status = await BackgroundFetch.status();
       console.log('[BackgroundFetch] status: ', status); // Should log the status
     };

     configureBackgroundFetch();
   }, []);

const handleSMSListeningInBackground = async () => {
    // SMS Listener logic
    const subscription = SmsListener.addListener(message => {
      if (message.body.toLowerCase().includes('debited') || message.body.toLowerCase().includes('sent')) {
        showDebitedAlert(message.body);
        console.log(message.body);
      } else if (message.body.toLowerCase().includes('credited') || message.body.toLowerCase().includes('received')) {
        showCreditedAlert(message.body);
        console.log(message.body);
      }
    });

    // Use a Firebase Firestore call for matching records
    if (currentUser) {
      const userId = currentUser.uid;
      const unclearedRecords = await fetchUnclearedTransactions(userId);

      // Check if any uncleared record matches a received SMS amount
      if (unclearedRecords) {
        console.log('Matching uncleared records found.');
      }
    }

    // Remove the listener after the task completes
    subscription.remove();
  };

  const handleAddRecord = () => {
        navigation.navigate('AddRecord');
      };

  const calculateDueDate = (startDate, duration) => {
    const Mdate = moment(startDate, 'DD/MM/YYYY');
    console.log(`${Mdate.format('DD/MM/YYYY')}`);

    // Ensure duration is a valid string before splitting
    if (!duration || typeof duration !== 'string' || !duration.includes(' ')) {
      console.log(`Invalid duration format: ${duration}`);
      return startDate;
    }

    const [durationValue, durationUnit] = duration.split(' ');
    console.log(`Duration Value: ${durationValue}, Duration Unit: ${durationUnit}`);

    switch (durationUnit) {
      case 'month':
      case 'months':
        console.log(`Adding ${durationValue} months`);
        return Mdate.add(parseInt(durationValue), 'months').format('DD/MM/YYYY');
      case 'week':
      case 'weeks':
        console.log(`Adding ${durationValue} weeks`);
        return Mdate.add(parseInt(durationValue), 'weeks').format('DD/MM/YYYY');
      case 'day':
      case 'days':
        console.log(`Adding ${durationValue} days`);
        return Mdate.add(parseInt(durationValue), 'days').format('DD/MM/YYYY');
      default:
        console.log(`Unrecognized duration unit: ${durationUnit}`);
        return startDate; // If the duration unit is unrecognized
    }
  };

  const options = {
      taskName: 'UdhaarPe',
      taskTitle: 'UdhaarPe Message Tracker',
      taskDesc: 'App is running in the background and listening for SMS.',
      taskIcon: {
        name: 'ic_launcher_round',
        type: 'drawable',
      },
      color: '#ff00ff',
      linkingURI: 'sms-listener-app://home',
      parameters: {
        delay: 1000,
      },
      notificationText: 'App is running and listening for incoming SMS.',
      notificationIcon: 'ic_launcher_round',
      importance: 'high',
    };

    const requestNotificationPermission = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'This app requires access to post notifications.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Denied', 'The app requires notification permissions to function properly.');
          }
        }
      } catch (err) {
        console.warn(err);
      }
    };

    const requestSmsPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
            {
              title: 'SMS Permission',
              message: 'This app requires access to receive SMS messages.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('SMS permission denied');
          }
        }
      } catch (err) {
        console.warn(err);
      }
    };

    const showSaveForm = (message) => {
       const extractedAmount = message.match(/Rs (\d+(\.\d{1,2})?)/);
      if (extractedAmount) {
        setAmount(extractedAmount[1]);
      }
      setModalVisible(true);
    };

    const showDebitedAlert = (message) => {
      if (AppState.currentState === 'background') {
        BackgroundService.start(backgroundTask, options);
        PushNotification.localNotification({
          channelId: 'sms-channel',
          title: 'Debited Amount Detected',
          message: 'Do you want to save this amount?',
          data: { message },
          playSound: true,
          soundName: 'default',
        });
      } else {
        Alert.alert(
          'Debited Amount Detected',
          'Do you want to save this amount?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Save', onPress: () => showSaveForm(message) }
          ]
        );
      }
    };

    const showCreditedAlert = (message) => {
        if (AppState.currentState === 'background') {
          BackgroundService.start(backgroundTask, options);
          PushNotification.localNotification({
            channelId: 'sms-channel',
            title: 'Credited Amount Detected',
            message: 'Do you want to match this transaction?',
            data: { message },
            playSound: true,
            soundName: 'default',
          });
        } else {
          Alert.alert(
            'Credited Amount Detected',
            'Do you want to match this transaction?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Match', onPress: () => handleTransactionMatch(message) }
            ]
          );
        }
      };

    const backgroundTask = async () => {
      const subscription = SmsListener.addListener(message => {
        if (message.body.toLowerCase().includes('debited') || message.body.toLowerCase().includes('sent')) {
          const extractedAmount = message.body.match(/(?:Rs\.?|₹|INR)\s?(\d+(?:\.\d{1,2})?)/);
          const amount = extractedAmount ? extractedAmount[1] : 'an amount';
          showDebitedAlert(message.body);
          BackgroundService.updateNotification({
            taskTitle: 'Transaction Detected',
            taskDesc: `A transaction of Rs ${amount} was detected. Tap to save the transaction.`,
          });
        }
        else if (message.body.toLowerCase().includes('credited') || message.body.toLowerCase().includes('received')) {
                const extractedAmount = message.body.match(/(?:Rs\.?|₹|INR)\s?(\d+(?:\.\d{1,2})?)/);
                const amount = extractedAmount ? extractedAmount[1] : 'an amount';
                  showCreditedAlert(message.body);
                  BackgroundService.updateNotification({
                    taskTitle: 'Transaction Detected',
                    taskDesc: `A transaction of Rs ${amount} was detected. Tap to save the transaction.`,
                  });
                }
      });

      try {
        while (true) {  // Keep the task alive indefinitely
          await new Promise(res => setTimeout(res, 10000));
        }
      } finally {
        subscription.remove();
      }
    };

    const handleTransactionMatch = (message) => {
        const extractedAmount = message.match(/(?:Rs\.?|₹|INR)\s?(\d+(?:\.\d{1,2})?)/);
        const amount = extractedAmount ? extractedAmount[1] : 'an amount';

        // Fetch uncleared transactions and match
        const userId = currentUser.uid;
        firestore().collection('Users').doc(userId).collection('TransactionRecords')
          .where('status', '==', 'UnCleared')
          .get()
          .then(snapshot => {
            const unclearedRecords = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            const matchedRecord = unclearedRecords.find(record => record.amount === amount);
            if (matchedRecord) {
              setMatchedTransaction(matchedRecord);
              setAmount(matchedRecord.amount)
              setName(matchedRecord.name)
              setPhone(matchedRecord.phone)
              setDuration(matchedRecord.duration)
              setconfirmVisible(true);
            } else {
              Alert.alert('No Matching Transaction Found', 'No matching uncleared transactions were found.');
            }
          })
          .catch(error => {
            console.error("Error fetching transactions: ", error);
          });
      };

    const handleConfirmMatch = async (docId) => {
        try {
          await firestore()
            .collection('Users')
            .doc(currentUser.uid)
            .collection('TransactionRecords')
            .doc(docId)
            .update({ status: 'Cleared' });

          setconfirmVisible(false);
        } catch (error) {
          console.error("Error updating document: ", error);
          Alert.alert('Error', 'There was a problem updating the record.');
        }
      };

    const startService = () => {
      BackgroundService.start(backgroundTask, options);
      setServiceRunning(true);
    };

    const stopService = () => {
      BackgroundService.stop();
      setServiceRunning(false);
    };

    useEffect(() => {
      requestSmsPermission();
      requestNotificationPermission();
      startService();

      PushNotification.createChannel({
        channelId: 'sms-channel',
        channelName: 'Transaction SMS Notifications',
        importance: PushNotification.Importance.HIGH,
      });

      PushNotification.configure({
        onNotification: function(notification) {
          if (notification.data && notification.data.message) {
            showSaveForm(notification.data.message);
          }
        },
        popInitialNotification: true,
        requestPermissions: Platform.OS === 'ios',
      });

      // Start background service when the app is in the foreground
      BackgroundService.start(backgroundTask, options);
      const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('FCM Message Data:', remoteMessage.data);
            if (remoteMessage.data && remoteMessage.data.message) {
              showSaveForm(remoteMessage.data.message);
            }
          });
      return () => {
        unsubscribe();
        // Stop the background service when the component is unmounted
//        BackgroundService.stop();
      };
    }, []);

  const handleSave = async () => {
    try {
      const date = new Date().toLocaleDateString('en-GB');
      const userId = currentUser.uid; // Ensure userId is defined
      if (!userId) {
        throw new Error('User ID is not available.');
      }

      const newDueDate = calculateDueDate(date, duration);
      const Record = {
        id: userId,
        amount,
        name,
        phone,
        duration,
        date,
        dueDate: newDueDate,
        status,
        docRef: null // Placeholder for document ID
      };

      // Add the record to the user's collection
      const userRecordRef = await firestore()
        .collection("Users")
        .doc(userId)
        .collection("TransactionRecords")
        .add(Record);

      // Get the document ID from the reference
      const docId = userRecordRef.id;

      // Update the document with its own ID
      await userRecordRef.update({ docRef: docId });

      // Add the record to the global collection
      await firestore()
        .collection("TransactionRecords")
        .doc(docId)
        .set({
          ...Record,
          docRef: docId // Include the document ID in the global record
        });

      // Update the records state
      setRecords((prevRecords) => [
        ...prevRecords,
        { ...Record, id: docId }
      ]);

      // Close the modal
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert('Error', 'There was a problem saving the record.');
    }
  };

    return (
      <View style={styles.container}>
            <Image source={require('./title.png')} style={styles.icon} />
            <Text style={styles.subtitle}>Manage your Udhaars easily</Text>

            <View style={styles.flex}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.iconText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Records', { records })}>
                <Text style={styles.iconText}>Records</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Reminder', { records })}>
                <Text style={styles.iconText}>Reminders</Text>
              </TouchableOpacity>
            </View>
            <UnClearedRecordsSection records={records} />
            <TouchableOpacity style={styles.addButton} onPress={handleAddRecord}>
                          <Text style={styles.addButtonText}>+ Add Record</Text>
            </TouchableOpacity>

            <DueSection records={records} title="Udhaars Left" />

            <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Save Udhaar</Text>
                  <TextInput placeholder="Amount" value={amount} placeholderTextColor="#6c757d" onChangeText={setAmount} style={styles.input} keyboardType="numeric" />
                  <TextInput placeholder="Name" value={name} placeholderTextColor="#6c757d" onChangeText={setName} style={styles.input} />
                  <TextInput placeholder="Phone" value={phone} placeholderTextColor="#6c757d" onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
                  <TextInput placeholder="Duration (e.g., 1 month)" placeholderTextColor="#6c757d" value={duration} onChangeText={setDuration} style={styles.input} />

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal visible={confirmVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                      <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                          <Text style={styles.modalTitle}>Confirm Match</Text>
                          <Text style={styles.modalText}>Amount: Rs {amount}</Text>
                          <Text style={styles.modalText}>Name: {name}</Text>
                          <Text style={styles.modalText}>Phone: {phone}</Text>
                          <Text style={styles.modalText}>Duration: {duration}</Text>
                          <Text style={styles.modalText}>Status: {status}</Text>

                          <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={() => handleConfirmMatch(matchedTransaction.docRef)}>
                              <Text style={styles.buttonText}>Yes, It's the Same</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setconfirmVisible(false)}>
                              <Text style={styles.buttonText}>No, Dismiss</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </Modal>

            <View style={styles.serviceControls}>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: serviceRunning ? '#28a745' : '#007bff' }]}
                onPress={() => setServiceRunning(!serviceRunning)}
              >
                <Text style={styles.buttonText}>{serviceRunning ? 'Stop Service' : 'Start Service'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      };

      const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 20,
          backgroundColor: '#e4f5ff',
        },
        header: {
          fontSize: 32,
          fontWeight: 'bold',
          color: '#2c3e50',
          textAlign: 'center',
          marginBottom: 10,
        },
        subtitle: {
          fontSize: 18,
          color: '#34495e',
          textAlign: 'center',
          marginBottom: 10,
        },
        flex: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginVertical: 10,
        },
        iconButton: {
          backgroundColor: '#2980b9',
          borderRadius: 10,
          padding: 8,
          alignItems: 'center',
          justifyContent: 'center',
          width: '32%',
        },
        iconText: {
        fontSize: 14,
          color: '#fff',
          fontWeight: 'bold',
        },
        modalContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContent: {
          width: '80%',
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: 20,
          alignItems: 'center',
        },
        modalTitle: {
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 10,
          color: '#2c3e50',
        },
        modalText:{
        fontWeight: 'bold',
        color: 'blue',
        marginBottom: 5,
        },
        input: {
          width: '100%',
          padding: 10,
          marginVertical: 10,
          borderWidth: 1,
          borderColor: '#bdc3c7',
          borderRadius: 5,
          color: 'black',
        },
        buttonContainer: {
        marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
        },
        saveButton: {
          backgroundColor: '#27ae60',
          padding: 10,
          borderRadius: 5,
          flex: 1,
          marginRight: 5,
          alignItems: 'center',
        },
        cancelButton: {
          backgroundColor: '#e74c3c',
          padding: 10,
          borderRadius: 5,
          flex: 1,
          marginLeft: 5,
          alignItems: 'center',
        },
        icon: {
                width: 300, // adjust the size accordingly
                height: 60,
                alignSelf: 'center',
                marginTop: 10,
        },
        buttonText: {
          color: '#fff',
          fontWeight: 'bold',
        },
        serviceControls: {
          marginTop: 10,
          alignItems: 'center',
        },
        serviceButton: {
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
          width: '60%',
        },
        addButton: {
                backgroundColor: '#1f78d1',
                borderRadius: 30,
                paddingVertical: 15,
                paddingHorizontal: 25,
                alignSelf: 'center',
                marginVertical: 20,
              },
              addButtonText: {
                color: '#fff',
                fontSize: 18,
                fontWeight: '600',
              },
      });

      export default HomePage;