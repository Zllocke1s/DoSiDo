import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [pushToken, setPushToken] = useState('');


  
  

  useEffect(() => {
    const initializeUserContext = async () => {
      try {
        // Load username and deviceId from AsyncStorage
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) setUsername(storedUsername);

        let storedDeviceId = await AsyncStorage.getItem('device_id');
        if (!storedDeviceId) {
          storedDeviceId = uuidv4();
          await AsyncStorage.setItem('device_id', storedDeviceId);
        }
        setDeviceId(storedDeviceId);

      // registerForPushNotificationsAsync()
      } catch (error) {
        console.error('Error initializing UserContext:', error);
      }
    };

    initializeUserContext();
  }, []);

  useEffect(() => {
    async function registerForPushNotificationsAsync() {

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
        try {

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('Permission not granted to get push token for push notification!');
          handleRegistrationError('Permission not granted to get push token for push notification!');
          return;
        }

        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

        if (!projectId) {
          console.log('Project ID not found');
          handleRegistrationError('Project ID not found');
        }
        console.log('Push token:', projectId);
          const pushTokenString = (
            await Notifications.getExpoPushTokenAsync({
              projectId,
            })
          ).data;
          console.log('Push token:', pushTokenString);
          setPushToken(pushTokenString);
        } catch (e) {
          handleRegistrationError(`${e}`);
        }
      
      
    }  
  registerForPushNotificationsAsync();
  }

    
  ,[])

  const saveUsername = async (newUsername) => {
    try {
      await AsyncStorage.setItem('username', newUsername);
      setUsername(newUsername);

      // Send updated info to the server
      await updateServerInfo(newUsername, deviceId, pushToken);
    } catch (error) {
      console.error('Failed to save username to AsyncStorage:', error);
    }
  };

  const updateServerInfo = async (username, deviceId, pushToken) => {
    try {
      const response = await fetch('https://www.outpostorganizer.com/dosidoapi.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: "UpdateUser",
          username: username,
          deviceId: deviceId,
          PNT: pushToken,
        }),
      });

      if (!response.ok) {
        console.error('Failed to update server info:', response.statusText);
      } else {
        console.log('User info updated successfully on server.');
      }
    } catch (error) {
      console.error('Error updating server info:', error);
    }
  };

  return (
    <UserContext.Provider value={{ username, setUsername: saveUsername, deviceId, pushToken }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
