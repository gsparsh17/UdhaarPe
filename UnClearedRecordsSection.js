// UnClearedRecordsSection.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import moment from 'moment';

const UnClearedRecordsSection = ({ records }) => {
  // Filter records with due date before today and status 'UnCleared'
  const filteredRecords = records.filter(record =>
    moment(record.dueDate, 'DD/MM/YYYY').isBefore(moment(), 'day') &&
    record.status === 'UnCleared'
  );

  return (
    <View style={styles.container}>
      {filteredRecords.length > 0 ? (
      <>
      <Text style={styles.title}>Uncleared Records with Past Due Dates</Text>
        <FlatList
          data={filteredRecords}
          keyExtractor={item => item.docRef}
          renderItem={({ item }) => (
            <View style={styles.recordContainer}>
              <Text style={styles.recordText}>Amount: {item.amount}</Text>
              <Text style={styles.recordText}>Name: {item.name}</Text>
              <Text style={styles.recordText}>Phone: {item.phone}</Text>
              <Text style={styles.recordText}>Due Date: {item.dueDate}</Text>
            </View>
          )}
        />
        </>
      ) : (
        <Text style={styles.title}>All Udhaars Till Today Are Cleared</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#e4f5ff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'green',
  },
  recordContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  recordText: {
    fontSize: 16,
  },
  noRecordsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default UnClearedRecordsSection;
