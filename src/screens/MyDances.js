import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

const MyDances = () => {
  const [playlists, setPlaylists] = useState({});
  const [currentPlaylist, setCurrentPlaylist] = useState(null); // Track the current playlist

  useEffect(() => {
    loadPlaylists();
  }, []);

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
  

  return (
    <View style={styles.container}>
      {currentPlaylist ? (
        // Playlist View
        <>
          <Text style={styles.title}>{currentPlaylist}</Text>
          <TouchableOpacity style={styles.backButton} onPress={leavePlaylistView}>
            <Text style={styles.backButtonText}>Back to Playlists</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.danceList}>
            {playlists[currentPlaylist].map((dance, index) => (
              <View key={index} style={styles.danceCard}>
                <Text style={styles.danceName}>{dance.name}</Text>
                <Text style={styles.danceDetails}>{dance.authorDate}</Text>
                <Text style={styles.danceDetails}>{dance.details}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeDanceFromPlaylist(dance.name)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        // Playlist Selection View
        <>
          <Text style={styles.title}>My Playlists</Text>
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
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      Alert.alert(
                        'Delete Playlist',
                        `Are you sure you want to delete "${playlistName}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', onPress: () => deletePlaylist(playlistName) },
                        ]
                      )
                    }
                  >
                    <MaterialIcons name="delete" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noPlaylists}>No playlists created yet.</Text>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FAEBD7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#5a3e36',
  },
  backButton: {
    backgroundColor: '#5a3e36',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FFF',
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
    backgroundColor: '#e6ccb2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#8b6b61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5a3e36',
  },
  playlistCount: {
    fontSize: 14,
    color: '#5a3e36',
  },
  deleteButton: {
    backgroundColor: '#E57373',
    padding: 10,
    borderRadius: 5,
  },
  noPlaylists: {
    fontSize: 16,
    textAlign: 'center',
    color: '#5a3e36',
  },
  danceList: {
    paddingBottom: 20,
  },
  danceCard: {
    backgroundColor: '#e6ccb2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#8b6b61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  danceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5a3e36',
  },
  danceDetails: {
    fontSize: 14,
    color: '#5a3e36',
    marginTop: 3,
  },
  removeButton: {
    backgroundColor: '#E57373',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  removeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MyDances;
