import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MainScreen } from './src/screens/HomeScreen'; // Adjust the import if needed
import { UserProvider } from './src/UserContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/ThemeContext';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';


function App() {
  const [initialRoute, setInitialRoute] = React.useState(null);

  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending
  } = Updates.useUpdates();

  useEffect(() => {
    if (isUpdatePending) {
      // Update has successfully downloaded; apply it now
      Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  const savePlaylist = async (playlist, overwrite) => {
    try {
      const existingPlaylists = JSON.parse(await AsyncStorage.getItem("playlists")) || {};
  
      if (overwrite) {
        // Overwrite the existing playlist
        existingPlaylists[playlist.name] = playlist.dances;
      } else {
        // Save new playlist
        existingPlaylists[playlist.name] = playlist.dances;
      }
  
      await AsyncStorage.setItem("playlists", JSON.stringify(existingPlaylists));
      console.log("Playlist saved:", playlist.name);
    } catch (error) {
      console.error("Error saving playlist:", error);
    }
  };

  const savePlaylistWithCopy = async (playlist, existingNames) => {
    let copyNumber = 1;
    let newName = `${playlist.name} - (${copyNumber})`;
  
    // Find the next available number
    while (existingNames.includes(newName)) {
      copyNumber++;
      newName = `${playlist.name} - (${copyNumber})`;
    }
  
    // Save the new playlist with the modified name
    playlist.name = newName;
    await savePlaylist(playlist, false);
  
    console.log(`Playlist saved as "${newName}"`);
  };
  
  

  const handleDeepLink = async (event) => {
    const { url } = event;
    if (url) {
      const parsedUrl = Linking.parse(url);
      if (parsedUrl.queryParams?.file) {
        const fileUrl = decodeURIComponent(parsedUrl.queryParams.file);
        
        try {
          const response = await fetch(fileUrl);
          const playlistJson = await response.text();
          const playlist = JSON.parse(playlistJson);
  
          console.log("Received Playlist:", playlist);
  
          // Check if the playlist already exists
          const existingPlaylists = JSON.parse(await AsyncStorage.getItem("playlists")) || {};
          const existingNames = Object.keys(existingPlaylists);
  
          if (existingNames.includes(playlist.name)) {
            // If duplicate, show overwrite prompt
            Alert.alert(
              "Playlist Already Exists",
              `A playlist named "${playlist.name}" already exists. What do you want to do?`,
              [
                {
                  text: "Overwrite",
                  onPress: () => savePlaylist(playlist, true),
                },
                {
                  text: "Create Copy",
                  onPress: () => savePlaylistWithCopy(playlist, existingNames),
                },
                {
                  text: "Cancel",
                  style: "cancel",
                },
              ]
            );
          } else {
            // If no duplicate, just save it
            savePlaylist(playlist, false);
          }
        } catch (error) {
          console.error("Error fetching playlist:", error);
        }
        setInitialRoute("My Dances");
      }
    }
  };


  
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);
  return (
    <SafeAreaProvider>
    <UserProvider>
      <ThemeProvider>
        <NavigationContainer>
          <MainScreen initialRoute={initialRoute}/>
        </NavigationContainer>
      </ThemeProvider>
    </UserProvider>
    </SafeAreaProvider>
  );
}

export default App;
