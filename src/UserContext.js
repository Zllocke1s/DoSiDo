import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const initializeUserContext = async () => {
      try {
        // Load username from AsyncStorage
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }

        // Load or generate device ID
        let storedDeviceId = await AsyncStorage.getItem('device_id');
        if (!storedDeviceId) {
          storedDeviceId = uuidv4(); // Generate a new UUID if not found
          await AsyncStorage.setItem('device_id', storedDeviceId);
        }
        setDeviceId(storedDeviceId);
        console.log('Device ID:', storedDeviceId);
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
    } catch (error) {
      console.error('Failed to save username to AsyncStorage:', error);
    }
  };

  return (
    <UserContext.Provider value={{ username, setUsername: saveUsername, deviceId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
