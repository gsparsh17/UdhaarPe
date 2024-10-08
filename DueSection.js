import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const DueSection = ({ records, title }) => {
  const filteredRecords = records.filter(record => record.status === 'UnCleared');

  // Sort records by due date in ascending order
  const sortedRecords = filteredRecords.sort((a, b) => {
    const dueDateA = moment(a.dueDate, 'DD/MM/YYYY');
    const dueDateB = moment(b.dueDate, 'DD/MM/YYYY');
    return dueDateA - dueDateB;
  });

  const navigation = useNavigation();

  const handleRecordPress = (record) => {
    navigation.navigate('RecordDetail', { record });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Amount</Text>
        <Text style={styles.tableHeaderText}>Name</Text>
        <Text style={styles.tableHeaderText}>Due Date</Text>
      </View>
      {/* Table Rows */}
      <FlatList
        data={sortedRecords}
        keyExtractor={(item) => item.docRef}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleRecordPress(item)}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Rs {item.amount}</Text>
              <Text style={[styles.tableCell, styles.name]}>{item.name}</Text>
              <Text style={styles.tableCell}>{item.dueDate}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    margin: 2,
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    height: 270,
  },
  name: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50', // Cool green header
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tableCell: {
    margin: 5,
    flex: 1,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

export default DueSection;
