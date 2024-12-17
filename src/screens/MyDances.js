import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../UserContext';

const MyDances = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [dances, setDances] = useState([]);
  const { username, setUsername } = useUser();

        // Function to send a request to your PHP API
        const requestDance = async (dance) => {
          if (!username) {
            Alert.prompt(
              'Enter Username',
              'Please enter your username to continue.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: (name) => {
                    if (name) {
                      setUsername(name);
                      sendRequest(name, dance);
                    }
                  },
                },
              ],
              'plain-text'
            );
          } else {
            sendRequest(username, dance);
          }
        };
    
        const sendRequest = async (user, dance) => {
          try {
            const response = await fetch('https://www.outpostorganizer.com/dosidoapi.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                command: 'AddRequest', // Ensure the command is specified
                username: user,
                name: dance.name,
                link: dance.link,
                song: dance.song,
                authorDate: dance.authorDate,
                count: dance.count,
                difficulty: dance.difficulty,
              }),
            });
            
            // Parse and log the response JSON
            const responseData = await response.json();
            
            if (response.ok) {
              console.log('Request sent successfully:', responseData);
            } else {
              console.error('Failed to send request:', responseData);
            }
          } catch (error) {
            console.error('Error sending request:', error);
          }
        };

  useEffect(() => {
    const loadSavedDances = async () => {
      try {
        const savedDances = JSON.parse(await AsyncStorage.getItem('savedDances')) || [];
        setDances(savedDances);
        console.log('Loaded saved dances:', savedDances);
      } catch (error) {
        console.error('Error loading saved dances:', error);
      }
    };

    const focusListener = navigation?.addListener('focus', loadSavedDances);

    loadSavedDances();

    return focusListener;
  }, []);

  const filteredDances = dances.filter(dance =>
    dance.name.toLowerCase().includes(search.toLowerCase()) ||
    dance.details.toLowerCase().includes(search.toLowerCase())
  );

  const shareDance = async (link) => {
    try {
      await Sharing.shareAsync(link);
    } catch (error) {
      console.error('Error sharing dance link:', error);
    }
  };

  const openLink = (link) => {
    Linking.openURL(link);
  };

  

  return (
    <MenuProvider>
      <View style={styles.container}>
        <Text style={styles.title}>My Saved Dances</Text>
        <TextInput
          style={styles.usernameInput}
          placeholder="Enter username"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search dances..."
          value={search}
          onChangeText={text => setSearch(text)}
        />
        <ScrollView contentContainerStyle={styles.danceList}>
          {filteredDances.length > 0 ? (
            filteredDances.map((dance, index) => (
              <TouchableOpacity key={index} onPress={() => openLink(dance.link)} style={styles.danceCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.danceName} numberOfLines={1}>{dance.name}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={async () => {
                      try {
                        const updatedDances = dances.filter(d => d.link !== dance.link);
                        await AsyncStorage.setItem('savedDances', JSON.stringify(updatedDances));
                        setDances(updatedDances);
                        console.log('Dance unsaved successfully:', dance);
                      } catch (error) {
                        console.error('Error unsaving dance:', error);
                      }
                    }}>
                      <MaterialIcons name="bookmark" size={24} color="#5a3e36" style={styles.actionButtonIcon} />
                    </TouchableOpacity>
                  
                    <TouchableOpacity onPress={() => shareDance(dance.link)}>
                      <MaterialIcons name="share" size={24} color="#5a3e36" style={styles.actionButtonIcon} />
                    </TouchableOpacity>
                    { username!="" && 
                    <TouchableOpacity onPress={() => requestDance(dance)}>
                        <MaterialIcons name="send" size={24} color="#5a3e36" style={styles.actionButtonIcon} />
                      </TouchableOpacity>}
                  </View>
                </View>
                <Text style={styles.danceDetails}>Author/Date: {dance.authorDate}</Text>
                <Text style={styles.danceDetails}>Count: {dance.count}</Text>
                <Text style={styles.danceDetails}>Difficulty: {dance.difficulty}</Text>
                <Text style={styles.danceDetails}>Song: {dance.song}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResults}>No saved dances found.</Text>
          )}
        </ScrollView>
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FAEBD7', // Warm eggshell color
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 30, // Increased padding for more spacing
    textAlign: 'center',
    color: '#5a3e36', // Warm dark brown color for the title
  },
  usernameInput: {
    height: 40,
    borderColor: '#bca789',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fdf5e6',
  },
  searchBar: {
    height: 40,
    borderColor: '#bca789', // Warm beige color for border
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fdf5e6', // Light warm color for search bar background
  },
  danceList: {
    paddingBottom: 20,
  },
  danceCard: {
    backgroundColor: '#e6ccb2', // Darker warm beige color for the card background
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#8b6b61', // Warm shadow color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  danceName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#5a3e36', // Warm dark brown color for the dance name
    flex: 1,
  },
  danceDetails: {
    fontSize: 14,
    marginBottom: 3,
    color: '#5a3e36', // Warm dark brown color for the details
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButtonIcon: {
    marginHorizontal: 5,
  },
  noResults: {
    fontSize: 16,
    textAlign: 'center',
    color: '#5a3e36',
    marginTop: 20,
  },
});

export default MyDances;
