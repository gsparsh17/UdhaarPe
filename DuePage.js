import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

const DuePage = ({ route }) => {
  const { records } = route.params;
  const navigation = useNavigation();

  const handleRecordPress = (record) => {
    navigation.navigate('RecordDetail', { record });
  };

  // Sort records by due date in ascending order
  const sortedRecords = records
    .filter(record => isDueSoon(record.dueDate) && record.status === 'UnCleared')
    .sort((a, b) => {
      const dueDateA = moment(a.dueDate, 'DD/MM/YYYY');
      const dueDateB = moment(b.dueDate, 'DD/MM/YYYY');
      return dueDateA - dueDateB;
    });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Reminders</Text>
      <FlatList
        nestedScrollEnabled={true}
        data={sortedRecords}
        keyExtractor={(item) => item.docRef}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleRecordPress(item)} style={styles.touchableOpacity}>
            <View style={styles.recordItem}>
              <Image
                source={require('./icon.png')} // Replace with your own icon
                style={styles.recordIcon}
              />
              <View style={styles.recordContent}>
                <View style={styles.recordDetailContainer}>
                  <Text style={styles.recordAmount}>Amount:</Text>
                  <Text style={styles.recordAmountValue}>Rs {item.amount}</Text>
                </View>
                <View style={styles.recordDetailContainer}>
                  <Text style={styles.recordLabel}>Name:</Text>
                  <Text style={styles.recordValue}>{item.name}</Text>
                </View>
                <View style={styles.recordDetailContainer}>
                  <Text style={styles.recordLabel}>Date:</Text>
                  <Text style={styles.recordValue}>{item.date}</Text>
                </View>
                <View style={styles.recordDetailContainer}>
                  <Text style={styles.recordLabel}>Due Date:</Text>
                  <Text style={styles.recordValue}>{item.dueDate}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// Helper function to check if the due date is within the upcoming days
const isDueSoon = (dueDate) => {
  const today = moment().startOf('day'); // Start of today without time
  const due = moment(dueDate, 'DD/MM/YYYY').startOf('day'); // Parse and start of day
  const daysDiff = due.diff(today, 'days'); // Difference in days
  return daysDiff >= 0; // Due within the next 15 days
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4f5ff',
    padding: 15,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1f78d1',
    marginBottom: 20,
    textAlign: 'center',
  },
  touchableOpacity: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 10,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 10,
    marginVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recordIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#1f78d1',
  },
  recordContent: {
    flex: 1,
    justifyContent: 'center',
  },
  recordDetailContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 5,
    alignItems: 'center',
  },
  recordLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    width: 120,
  },
  recordValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  recordAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc3545',
  },
  recordAmountValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc3545',
  },
});

export default DuePage;
