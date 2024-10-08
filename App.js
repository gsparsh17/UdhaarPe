import React, { useEffect, useState } from 'react';
import { Alert, AppState, PermissionsAndroid, Platform, Image, Text } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import BackgroundService from 'react-native-background-actions';
import PushNotification from 'react-native-push-notification';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import RecordsPage from './RecordsPage';
import SignUpScreen from './SignUpScreen';
import LoginScreen from './LoginScreen';
import RecordDetail from './RecordDetail';
import AddRecord from './AddRecord';
import DuePage from './DuePage';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Home"
          component={HomePage}
          options={{
            headerStyle: { backgroundColor: '#2980b9' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />

        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="AddRecord" component={AddRecord} options={{headerStyle: { backgroundColor: '#2980b9'},headerTintColor: '#fff',headerTitleStyle: { fontWeight: 'bold' },}}/>
        <Stack.Screen name="Profile" component={ProfilePage} options={{headerStyle: { backgroundColor: '#2980b9'},headerTintColor: '#fff',headerTitleStyle: { fontWeight: 'bold' },}}/>
        <Stack.Screen name="Records" component={RecordsPage} options={{headerStyle: { backgroundColor: '#2980b9'},headerTintColor: '#fff',headerTitleStyle: { fontWeight: 'bold' },}}/>
        <Stack.Screen name="RecordDetail" component={RecordDetail} options={{headerStyle: { backgroundColor: '#2980b9'},headerTintColor: '#fff',headerTitleStyle: { fontWeight: 'bold' },}}/>
        <Stack.Screen name="Reminder" component={DuePage} options={{headerStyle: { backgroundColor: '#2980b9'},headerTintColor: '#fff',headerTitleStyle: { fontWeight: 'bold' },}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
