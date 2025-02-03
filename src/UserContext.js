import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import * as Notifications from 'expo-notifications';

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

        // Get push notification token
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus === 'granted') {
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          setPushToken(token);
          console.log('Push Token:', token);
        } else {
          console.warn('Push notifications not enabled.');
        }
      } catch (error) {
        console.error('Error initializing UserContext:', error);
      }
    };

    initializeUserContext();
  }, []);

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
