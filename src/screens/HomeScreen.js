import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import backgroundImage from '../../assets/background.jpg'; // Adjust path based on your folder structure
import MyVenue from './MyVenue';
import MyDances from './MyDances';
import AllDances from './AllDances';
import RequestList from './RequestList';
import { useUser } from '../UserContext';

const Tab = createBottomTabNavigator();

export const MainScreen = ({navigation}) => {

  const { username } = useUser();

  return (
    <Tab.Navigator
    initialRouteName="MyDances"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'My Venue') {
            iconName = 'place';
          } else if (route.name === 'My Dances') {
            iconName = 'favorite';
          } else if (route.name === 'All Dances') {
            iconName = 'library-music';
          } else if (route.name === 'Requests') {
            iconName = 'send'
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5a3e36',
        tabBarInactiveTintColor: '#bca789',
        tabBarStyle: {
          backgroundColor: '#FAEBD7',
          borderTopWidth: 0,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="My Venue" component={MyVenue} />
      <Tab.Screen name="My Dances" component={MyDances} />
      <Tab.Screen name="All Dances" component={AllDances} />
      {username === 'Instructor' && (

      <Tab.Screen name="Requests" component={RequestList} />
      )}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
