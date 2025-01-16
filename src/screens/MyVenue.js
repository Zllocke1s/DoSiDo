import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../UserContext';
import {RequestModal} from '../components/RequestModal'
import { UsernameModal } from '../components/UsernameModal';
import { CustomModal } from '../components/CustomModal';
import { PlaylistModal } from '../components/PlaylistModal';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { EntryCodeModal } from '../components/EntryCodeModal';


const MyVenue = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [dances, setDances] = useState([]);
  const [savedDances, setSavedDances] = useState([]);
  const [fullscreenModal, setModal] = useState(null)
  const { username, setUsername, deviceId } = useUser();
  const [playlists, setPlaylists] = useState({});
  const [isApproved, setIsApproved] = useState(false);
  const [entryCode, setEntryCode] = useState('');


    // Check approval state on component mount
    useEffect(() => {
      const checkApproval = async () => {
        try {
          const approved = await AsyncStorage.getItem('entryApproved');
          if (approved === 'true') {
            setIsApproved(true);
          } else {
            showEntryCodeModal();
          }
        } catch (error) {
          console.error('Error checking approval state:', error);
        }
      };
  
      checkApproval();
    }, []);

    
    // Show entry code modal
  const showEntryCodeModal = () => {
    setModal(
      <EntryCodeModal onClose={(code) => {handleEntryCodeSubmit(code)}}/>
    );
  };

    // Validate and save entry code
    const handleEntryCodeSubmit = async (code) => {
      const validCode = 'redrock2025'; // Replace with your actual validation logic
      if (code === validCode) {
        try {
          await AsyncStorage.setItem('entryApproved', 'true');
          setIsApproved(true);
          setModal(null);
        } catch (error) {
          console.error('Error saving approval state:', error);
        }
      } else {
        alert('Invalid code: ' + JSON.stringify(code) + '. Please try again.');
      }
    };
  

  const loadPlaylists = async () => {
    try {
      const savedPlaylists = JSON.parse(await AsyncStorage.getItem('playlists')) || {};
      setPlaylists(savedPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

    // Use useFocusEffect to reload playlists when the screen is focused
    useFocusEffect(
      React.useCallback(() => {
        loadPlaylists();
      }, [])
    );

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



      const initializeDances = async () => {
        try {
          // Load cached dances from AsyncStorage
          const cachedDances = JSON.parse(await AsyncStorage.getItem('venueDances')) || [];
          setDances(cachedDances);
  
          // Fetch updated dances in the background
          fetchAllDances();
        } catch (error) {
          console.error('Error loading cached dances:', error);
        }
      };


      useEffect(() => {
      initializeDances();
      loadSavedDances();
      loadPlaylists();
      const focusListener = navigation?.addListener('focus', loadSavedDances);
  
      return focusListener
    }, []);
  

    
    const fetchAllDances = async () => {
      let currentPage = 0;
      let hasMore = true;
      const danceList = [];

      try {
        while (hasMore) {
          console.log(`Fetching dance data for page ${currentPage}...`);
          const response = await fetch(`https://www.outpostorganizer.com/cnproxy.php`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              command: "venue",
              cursor: currentPage * 20,
            }),
          });
          

          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }

          const html = await response.text();
          const listItems = html.match(/<div class="listitem".*?<\/div>\s*<\/div>/gs);
          console.log(response)
          if (listItems && listItems.length > 0) {
            console.log(`Found ${listItems.length} list items on page ${currentPage}. Parsing...`);
            listItems.forEach((item, index) => {
              console.log(`Parsing item ${index + 1} on page ${currentPage}`);
              try {
                const linkMatch = item.match(/(\/stepsheets\/.*?)['"]/);
                const titleMatch = item.match(/<span class="listTitleColor1">(.*?)<\/span>/);
                const authorDateMatch = item.match(/<span class="listTitleColor2">(.*?)<\/span>/);
                const countMatch = item.match(/(\d+)\s*&nbsp;?Count/);
                const difficultyMatch = item.match(/(Beginner|Improver|Intermediate|Advanced)/);
                const songMatch = item.match(/Music:\s*([^<]*)/);

                const link = linkMatch ? `https://www.copperknob.co.uk${linkMatch[1]}` : 'N/A';
                console.log(`Parsed link: ${link}`);
                const name = titleMatch ? titleMatch[1] : 'Unnamed Dance';
                const authorDate = authorDateMatch ? authorDateMatch[1] : 'Unknown Author/Date';
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
                console.log(`Item ${index + 1} on page ${currentPage} parsed successfully.`);
              } catch (parseError) {
                console.warn(`Failed to parse item ${index + 1} on page ${currentPage}:`, parseError);
              }
            });
            currentPage += 1;
          } else {
            console.warn(`No more list items found on page ${currentPage}. Stopping.`);
            hasMore = false;
          }
        }

        console.log('Dance list parsed successfully:', danceList);
        setDances(danceList);
        await AsyncStorage.setItem('venueDances', JSON.stringify(danceList));

      } catch (error) {
        console.error('Error fetching and parsing dances:', error);
      }
    };



    const loadSavedDances = async () => {
      try {
        const saved = JSON.parse(await AsyncStorage.getItem('savedDances')) || [];
        setSavedDances(saved);
      } catch (error) {
        console.error('Error loading saved dances:', error);
      }
    };

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


 


  const toggleSaveDance = async (dance) => {
      saveToPlaylist(dance)
  };

  const openLink = (link) => {
    Linking.openURL(link);
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


    
    
  return (
    <MenuProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Red Rock Saloon</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search dances..."
          value={search}
          onChangeText={text => setSearch(text)}
        />
        <ScrollView contentContainerStyle={styles.danceList}>
        {fullscreenModal}
          {filteredDances.length > 0 ? (
            filteredDances.map((dance, index) => (
              <TouchableOpacity key={index} onPress={() => openLink(dance.link)} style={styles.danceCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.danceName} numberOfLines={1}>{dance.name}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => toggleSaveDance(dance)}>
                      <MaterialIcons
                        name={"bookmark-border"}
                        size={24}
                        color="#5a3e36"
                        style={styles.actionButtonIcon}
                      />
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
            <Text style={styles.noResults}>No dances found. Please try again later.</Text>
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
  searchBar: {
    height: 40,
    borderColor: '#bca789', // Warm beige color for border
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexShrink: 0, // Prevent shrinking
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

export default MyVenue;
