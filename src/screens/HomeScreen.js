import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import backgroundImage from '../../assets/background.jpg'; // Adjust path based on your folder structure
import MyVenue from './MyVenue';
import MyDances from './MyDances';
import AllDances from './AllDances';
import RequestList from './RequestList';
import { useUser } from '../UserContext';
import { useTheme } from '../ThemeContext';

const Tab = createBottomTabNavigator();

export const MainScreen = ({navigation}) => {

  const { username } = useUser();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    background: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'center',
      backgroundColor: theme.backgroundColor,
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
      color: theme.textColor,
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
  });

  return (
    <SafeAreaView style={[styles.background,  { backgroundColor: theme.headerBackgroundColor || theme.backgroundColor }]}>
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
        tabBarActiveTintColor: theme.tabBarActiveTintColor,
        tabBarInactiveTintColor: theme.tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: theme.backgroundColor,
          borderTopWidth: 0,
          elevation: 5,
          paddingBottom: 20,
          height: 70
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
      {username.includes('Instructor') && (

      <Tab.Screen name="Requests" component={RequestList} />
      )}
    </Tab.Navigator>
    </SafeAreaView>

  );
};


