import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../UserContext';
import {RequestModal} from '../components/RequestModal'
import { PlaylistModal } from '../components/PlaylistModal';
import { UsernameModal } from '../components/UsernameModal';
import { CustomModal } from '../components/CustomModal';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { useTheme } from '../ThemeContext';

const AllDances = () => {
  const [search, setSearch] = useState('');
  const [dances, setDances] = useState([]);
  const [savedDances, setSavedDances] = useState([]);
  const { username, setUsername, deviceId } = useUser();
  const [fullscreenModal, setModal] = useState(null)
  const [playlists, setPlaylists] = useState({});
  const [playlistName, setPlaylistName] = React.useState("")
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(false)

  const styles =
    StyleSheet.create({
      container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: theme.backgroundColor, // Theme-based background color
      },
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 30,
        marginBottom: 30, // Increased padding for more spacing
        textAlign: 'center',
        color: theme.textColor, // Theme-based text color
      },
      searchBar: {
        height: 40,
        flex: 0.9,
        borderColor: theme.borderColor,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        flexShrink: 0,
        marginBottom: 20,
        backgroundColor: theme.cardBackgroundColor,
        color: theme.textColor

      },
      clearButton: {
        flex: 0.05,
        paddingHorizontal: 10, // Add padding for better appearance
        minWidth: 50,          // Ensure the button is wide enough for "Clear"
        alignItems: 'center',  // Center the text horizontally
        justifyContent: 'center', // Center the text vertically
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
      cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      danceName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: theme.textColor, // Theme-based text color
        flex: 1,
      },
      danceDetails: {
        fontSize: 14,
        marginBottom: 3,
        color: theme.textColor, // Theme-based text color
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
        color: theme.textColor, // Theme-based text color
        marginTop: 20,
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

  const saveToPlaylist = async (dance) => {
    setModal(
      <CustomModal
        title="Add to Playlist"
        body="Select a playlist or create a new one"
        options={[
          ...Object.keys(playlists).map((name) => ({ label: name, value: name })),
          { label: 'Create New Playlist', value: 'new' },
        ]}
        handleRequest={(value) => {
          if (value === 'new') {
            setModal(null)
            promptForPlaylistName(dance);
          } else {
            setModal(null)
            addDanceToPlaylist(dance, value);
          }
        }}
        onClose={() => setModal(null)}
      />
    );
  };

  const promptForPlaylistName = (dance) => {
    setModal(
     <PlaylistModal onClose={(newName) => {
      addDanceToPlaylist(dance, newName)
      setModal(null)}
    }></PlaylistModal>
    );
  };

  const addDanceToPlaylist = async (dance, playlistName) => {
    const updatedPlaylists = { ...playlists };
    if (!updatedPlaylists[playlistName]) {
      updatedPlaylists[playlistName] = [];
    }
    updatedPlaylists[playlistName].push(dance);

    setPlaylists(updatedPlaylists);
    await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    console.log(`Dance added to playlist "${playlistName}":`, dance);
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
    loadPlaylists()
  }, []);


    const fetchDances = async () => {
      try {
        const response = await fetch("https://www.outpostorganizer.com/cnproxy.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            command: "all",
            search: encodeURIComponent(search), // Pass the search query as a parameter
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        
        const html = await response.text();
        
        const listItems = html.match(/<div class="listitem".*?<\/div>\s*<\/div>/gs);
        const danceList = [];

        if (listItems && listItems.length > 0) {
          console.log(`Found ${listItems.length} list items. Parsing...`);
          listItems.forEach((item, index) => {
            console.log(`Parsing item ${index + 1}`);
            try {
              const linkMatch = item.match(/(\/stepsheets\/.*?)['"]/);
              const titleMatch = item.match(/<span class=\"listTitleColor1\">([\s\S]*?)<\/span>/);
              const cleanedTitle = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : 'Unnamed Dance';
                            const authorDateMatch = item.match(/<span class="listTitleColor2">(.*?)<\/span>/);
              const countMatch = item.match(/(\d+)\s*&nbsp;?Count/);
              const difficultyMatch = item.match(/(Beginner|Improver|Intermediate|Advanced)/);
              const songMatch = item.match(/Music:\s*([^<]*)/);

              const link = linkMatch ? `https://www.copperknob.co.uk${linkMatch[1]}` : 'N/A';
              console.log(`Parsed link: ${link}`);
              const name = cleanedTitle ? cleanedTitle : 'Unnamed Dance';
              const authorDate = authorDateMatch ? authorDateMatch[1].replace("</font>", "") : 'Unknown Author/Date';
              const count = countMatch ? countMatch[1] : 'N/A';
              const difficulty = difficultyMatch ? difficultyMatch[1] : 'N/A';
              const song = songMatch ? songMatch[1].trim() : 'N/A';

              danceList.push({
                name,
                authorDate,
                details: `Count: ${count}, Difficulty: ${difficulty}, Song: ${song}`,
                count,
                difficulty,
                song,
                link,
              });
              console.log(`Item ${index + 1} parsed successfully.`);
            } catch (parseError) {
              console.warn(`Failed to parse item ${index + 1}:`, parseError);
            }
          });
        }

        console.log('Dance list parsed successfully:', danceList);
        setDances(danceList);
      } catch (error) {
        console.error('Error fetching and parsing dances:', error);
      }
      setLoading(false)
    };


  const toggleSaveDance = async (dance) => {
    saveToPlaylist(dance)

  };

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
        <Text style={styles.title}>All Dances</Text>
        <View style={{flexDirection: "row", display: "flex", justifyContent: "space-between"}}>
                <TextInput
                  style={styles.searchBar}
                  placeholder="Search dances..."
                  placeholderTextColor={theme.textColor}
                  value={search}
                  onChangeText={text => setSearch(text)}
                  onBlur={() => {
                    setLoading(true)
                    fetchDances();

                  }}
                />
        <TouchableOpacity 
          onPress={() => { setSearch("") }} 
          style={[styles.searchBar, styles.clearButton]}
        >
          <Text style={{ color: theme.textColor }}>Clear</Text>
        </TouchableOpacity>
                </View>
        <ScrollView contentContainerStyle={styles.danceList}>
        {fullscreenModal}
                  {loading && (
                          <ActivityIndicator size="large" color={theme.textColor} style={styles.loading} />
                  )}
          {dances.length > 0 ? (
            dances.map((dance, index) => (
              <TouchableOpacity key={index} onPress={() => openLink(dance.link)} style={styles.danceCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.danceName} numberOfLines={1}>{dance.name}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => toggleSaveDance(dance)}>
                      <MaterialIcons
                        name={savedDances.find(savedDance => savedDance.link === dance.link) ? "bookmark" : "bookmark-border"}
                        size={24}
                        color={theme.textColor}
                        style={styles.actionButtonIcon}
                      />
                    </TouchableOpacity>
                   
                    <TouchableOpacity onPress={() => shareDance(dance.link)}>
                      <MaterialIcons name="share" size={24} color={theme.textColor} style={styles.actionButtonIcon} />
                    </TouchableOpacity>
                     
                    <TouchableOpacity onPress={() => requestDance(dance)}>
                        <MaterialIcons name="send" size={24} color={theme.textColor} style={styles.actionButtonIcon} />
                      </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.danceDetails}>Author/Date: {dance.authorDate}</Text>
                <Text style={styles.danceDetails}>Count: {dance.count}</Text>
                <Text style={styles.danceDetails}>Difficulty: {dance.difficulty}</Text>
                <Text style={styles.danceDetails}>Song: {dance.song}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResults}>No dances found.</Text>
          )}
        </ScrollView>
      </View>
    </MenuProvider>
  );
};


export default AllDances;
