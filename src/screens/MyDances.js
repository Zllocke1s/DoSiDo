import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import * as Sharing from 'expo-sharing';
import { RequestModal } from '../components/RequestModal';
import { UsernameModal } from '../components/UsernameModal';
import { useUser } from '../UserContext';
import { useTheme } from '../ThemeContext';

const MyDances = ({navigation}) => {
  const [playlists, setPlaylists] = useState({});
  const [currentPlaylist, setCurrentPlaylist] = useState(null); // Track the current playlist
  const [fullscreenModal, setModal] = useState(null);
  const { username, setUsername, deviceId } = useUser();
  const [tempUsername, setTempUserName] = useState("")
    const { theme } = useTheme();

  const styles =
    StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        backgroundColor: theme.backgroundColor, // Theme-based background color
      },
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: theme.textColor, // Theme-based text color
      },
      backButton: {
        backgroundColor: theme.buttonBackgroundColor, // Theme-based button background color
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
      },
      backButtonText: {
        color: theme.buttonTextColor || '#FFF', // Theme-based button text color
        fontWeight: 'bold',
        fontSize: 16,
      },
      playlistList: {
        paddingBottom: 20,
      },
      playlistCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.cardBackgroundColor, // Theme-based card background color
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: theme.shadowColor, // Theme-based shadow color
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      },
      usernameInput: {
        color: theme.textColor
      },
      playlistInfo: {
        flex: 1,
      },
      playlistName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.textColor, // Theme-based text color
      },
      playlistCount: {
        fontSize: 14,
        color: theme.textColor, // Theme-based text color
      },
      deleteButton: {
        backgroundColor: theme.deleteButtonBackground || '#E57373', // Theme-based delete button background
        padding: 10,
        borderRadius: 5,
      },
      noPlaylists: {
        fontSize: 16,
        textAlign: 'center',
        color: theme.textColor, // Theme-based text color
      },
      danceList: {
        paddingBottom: 20,
      },
      danceCard: {
        backgroundColor: theme.cardBackgroundColor, // Theme-based card background color
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: theme.shadowColor, // Theme-based shadow color
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      },
      danceName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.textColor, // Theme-based text color
      },
      danceDetails: {
        fontSize: 14,
        color: theme.textColor, // Theme-based text color
        marginTop: 3,
      },
      removeButton: {
        backgroundColor: theme.deleteButtonBackground || '#E57373', // Theme-based delete button background
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginTop: 10,
      },
      removeButtonText: {
        color: theme.buttonTextColor || '#FFF', // Theme-based button text color
        fontWeight: 'bold',
        fontSize: 14,
      },
      cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      actionButtonIcon: {
        marginHorizontal: 5,
      },
      actionButtons: {
        flexDirection: 'row',
      },
    });
  

  // Use useFocusEffect to reload playlists when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadPlaylists();
    }, [])
  );
  const loadPlaylists = async () => {
    try {
      const savedPlaylists = JSON.parse(await AsyncStorage.getItem('playlists')) || {};
      setPlaylists(savedPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  

        // Function to send a request to your PHP API
        const requestDance = async (dance) => {
          setModal(<RequestModal songId={1} isVisible={true} onClose={() => {setModal(null)}} handleRequest={(type) => {
            if (!username) {
              setModal(<UsernameModal onClose={(username) => {
                setUsername(username)
                sendRequest(username, dance);
                setModal(null)}}></UsernameModal>)
            } else {
              sendRequest(username, dance, type);
              setModal(null)
            }
          
          
          }}></RequestModal>)
        }
    
        const sendRequest = async (user, dance, type) => {
          console.log("deviceID: ", deviceId)
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
                requestType: type,
                id: deviceId
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
    

    const focusListener = navigation?.addListener('focus', loadPlaylists);

    loadPlaylists()

    return focusListener;
  }, []);


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

  const deletePlaylist = async (playlistName) => {
    const updatedPlaylists = { ...playlists };
    delete updatedPlaylists[playlistName];

    setPlaylists(updatedPlaylists);
    await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    Alert.alert('Playlist Deleted', `The playlist "${playlistName}" has been deleted.`);
  };
  const leavePlaylistView = () => {
    setCurrentPlaylist(null); // Exit playlist view
  };

  const removeDanceFromPlaylist = async (danceName) => {
    const updatedPlaylists = { ...playlists };
    updatedPlaylists[currentPlaylist] = updatedPlaylists[currentPlaylist].filter(
      (dance) => dance.name !== danceName
    );
  
    // Check if the playlist is now empty
    if (updatedPlaylists[currentPlaylist].length === 0) {
      delete updatedPlaylists[currentPlaylist]; // Optionally delete the playlist
      setCurrentPlaylist(null); // Exit playlist view
      Alert.alert('Playlist Removed', 'The playlist is now empty and has been deleted.');
    }
  
    setPlaylists(updatedPlaylists);
    await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
  };


  useEffect(() => {
    if(tempUsername=="") {
      setTempUserName(username)
    }
  }, [username])

  return (
    <View style={styles.container}>
                {fullscreenModal}
                <TextInput
          style={styles.usernameInput}
          placeholder="Enter username"
          placeholderTextColor={theme.textColor}
          value={tempUsername}
          onChangeText={(text) => {
            setTempUserName(text)
          }}
          onSubmitEditing={() => setUsername(tempUsername)}
          onBlur={() => setUsername(tempUsername)} // This updates when clicking out
        />
      {currentPlaylist ? (
        // Playlist View
        <>
        
          <Text style={styles.title}>{currentPlaylist}</Text>
          <TouchableOpacity style={styles.backButton} onPress={leavePlaylistView}>
            <Text style={styles.backButtonText}>Back to Playlists</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.danceList}>
            {playlists[currentPlaylist].map((dance, index) => (
              <TouchableOpacity key={index} onPress={() => openLink(dance.link)} style={styles.danceCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.danceName} numberOfLines={1}>{dance.name}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={async () => {
                      //Todo Add unsave
                      removeDanceFromPlaylist(dance.name)
                    }}>
                      <MaterialIcons name="bookmark" size={24} color={theme.textColor} style={styles.actionButtonIcon} />
                    </TouchableOpacity>
                  
                    <TouchableOpacity onPress={() => shareDance(dance.link)}>
                      <MaterialIcons name="share" size={24} color={theme.textColor} style={styles.actionButtonIcon} />
                    </TouchableOpacity>
                    { true && 
                    <TouchableOpacity onPress={() => requestDance(dance)}>
                        <MaterialIcons name="send" size={24} color={theme.textColor} style={styles.actionButtonIcon} />
                      </TouchableOpacity>}
                  </View>
                </View>
                <Text style={styles.danceDetails}>Author/Date: {dance.authorDate}</Text>
                <Text style={styles.danceDetails}>Count: {dance.count}</Text>
                <Text style={styles.danceDetails}>Difficulty: {dance.difficulty}</Text>
                <Text style={styles.danceDetails}>Song: {dance.song}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : (
        // Playlist Selection View
        <>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.title}>My Playlists</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.playlistList}>
            {Object.keys(playlists).length > 0 ? (
              Object.entries(playlists).map(([playlistName, dances]) => (
                <View key={playlistName} style={styles.playlistCard}>
                  <TouchableOpacity
                    style={styles.playlistInfo}
                    onPress={() => setCurrentPlaylist(playlistName)} // Enter playlist view
                  >
                    <Text style={styles.playlistName}>{playlistName}</Text>
                    <Text style={styles.playlistCount}>{dances.length} dances</Text>
                  </TouchableOpacity>
                  
                </View>
              ))
            ) : (
              <Text style={styles.noPlaylists}>No playlists created yet.</Text>
            )}
          </ScrollView>
        </>
      )}
      <View style={{position: "absolute", top: 10, right: 10}}><Text>1.1.0</Text></View>
    </View>
  );
};



export default MyDances;
