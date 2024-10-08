import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RecordsPage = ({ route }) => {
  const { records } = route.params; // Destructure records from route.params
  const navigation = useNavigation();

  const handleRecordPress = (record) => {
    navigation.navigate('RecordDetail', { record });
  };

  const handleAddRecord = () => {
      navigation.navigate('AddRecord');
    };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Financial Records</Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item.docRef}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleRecordPress(item)} style={styles.touchableOpacity}>
            <View style={styles.recordItem}>
            <View style={styles.left}>
              <Image
                source={require('./icon.png')} // Replace with your own icon
                style={styles.recordIcon}
              />
              <Text style={styles.recordStatus}>{item.status}</Text>
             </View>
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
      <TouchableOpacity style={styles.addButton} onPress={handleAddRecord}>
              <Text style={styles.addButtonText}>+ Add Record</Text>
      </TouchableOpacity>
    </View>
  );
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
    borderWidth: 2,
    borderColor: '#1f78d1',
  },
  left:{
  width: '30%',
  alignItems: 'center',
  },
  recordContent: {
      flex: 1,
      justifyContent: 'center',
    },
    recordDetailContainer: {
      flexDirection: 'row',
      marginBottom: 4,
      backgroundColor: '#f9f9f9',
      borderRadius: 10,
      padding: 5,
      alignItems: 'center',
    },
    recordStatus:{
    marginTop: 10,
      color: 'red',
      fontWeight: 'bold',
    },
    recordLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: '#555',
      width: 100,
    },
    recordValue: {
      fontSize: 16,
      color: '#333',
      flex: 1,
    },
    recordAmount: {
      fontSize: 18,
      fontWeight: '600',
      color: '#27ae60',
    },
    recordAmountValue: {
    flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: '#27ae60',
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

export default RecordsPage;
