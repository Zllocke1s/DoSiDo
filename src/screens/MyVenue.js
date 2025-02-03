import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Modal, StyleSheet, TextInput, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
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
import { useTheme } from '../ThemeContext';
  
const sampleDanceData = {
  name: 'Salsa Night',
  authorDate: 'John Doe / 2025',
  count: 123,
  difficulty: 'Intermediate',
  song: 'Salsa Fiesta',
  link: 'https://www.example.com',
};


const MyVenue = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [dances, setDances] = useState([]);
  const [savedDances, setSavedDances] = useState([]);
  const [fullscreenModal, setModal] = useState(null)
  const { username, setUsername, deviceId } = useUser();
  const [playlists, setPlaylists] = useState({});
  const [isApproved, setIsApproved] = useState(false);
  const [entryCode, setEntryCode] = useState('');
  const { theme } = useTheme();
  const [isNotificationVisible, setNotificationVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);


   // Fetch notifications from the server
   const fetchNotifications = async () => {
    try {
      const response = await fetch('https://www.outpostorganizer.com/dosidoapi.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'GetNotifications',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data)
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  

  const groupNotificationsByDate = () => {
    return notifications.reduce((groups, notification) => {
      const date = notification.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    }, {});
  };
  
const styles = 
StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  notificationButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: theme.backgroundColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.textColor,
  },
  notificationText: {
    fontSize: 16,
    marginVertical: 5,
    color: theme.textColor,
  },
  notificationSection: {
    marginBottom: 20,
  },
  notificationDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.textColor,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
    paddingBottom: 5,
  },
  notificationCard: {
    backgroundColor: theme.cardBackgroundColor,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: theme.textColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 10,
    color: theme.textColor,
  },
  
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: theme.borderColor,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.textColor,
  },  
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: theme.backgroundColor, // Theme-based background color
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 50,
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
    backgroundColor: theme.cardBackgroundColor, // Theme-based card background
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: theme.textColor, // Theme-based shadow color
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
         // console.log(`Fetching dance data for page ${currentPage}...`);
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
        //  console.log(response)
          if (listItems && listItems.length > 0) {
         //   console.log(`Found ${listItems.length} list items on page ${currentPage}. Parsing...`);
            listItems.forEach((item, index) => {
         //     console.log(`Parsing item ${index + 1} on page ${currentPage}`);
              try {
                const linkMatch = item.match(/(\/stepsheets\/.*?)['"]/);
                const titleMatch = item.match(/<span class="listTitleColor1">(.*?)<\/span>/);
                const authorDateMatch = item.match(/<span class="listTitleColor2">(.*?)<\/span>/);
                const countMatch = item.match(/(\d+)\s*&nbsp;?Count/);
                const difficultyMatch = item.match(/(Beginner|Improver|Intermediate|Advanced)/);
                const songMatch = item.match(/Music:\s*([^<]*)/);

                const link = linkMatch ? `https://www.copperknob.co.uk${linkMatch[1]}` : 'N/A';
           //     console.log(`Parsed link: ${link}`);
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
       //         console.log(`Item ${index + 1} on page ${currentPage} parsed successfully.`);
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
      <View style={styles.header}>
  <Text style={styles.title}>Red Rock Saloon</Text>
  <TouchableOpacity onPress={() => setNotificationVisible(true)} style={styles.notificationButton}>
    <MaterialIcons name="notifications" size={28} color={theme.textColor} />
  </TouchableOpacity>
</View>
<View style={{flexDirection: "row", display: "flex", justifyContent: "space-between"}}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search dances..."
          placeholderTextColor={theme.textColor}
          value={search}
          onChangeText={text => setSearch(text)}
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
            <Text style={styles.noResults}>No dances found. Please try again later.</Text>
          )}
        </ScrollView>
        <Modal
  visible={isNotificationVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setNotificationVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Notifications</Text>
      <ScrollView>
        {Object.entries(groupNotificationsByDate()).map(([date, group]) => (
          <View key={date} style={styles.notificationSection}>
            <Text style={styles.notificationDate}>{date}</Text>
            {group.map(notification => (
              <TouchableOpacity
                key={notification.id}
                style={styles.notificationCard}
                onPress={notification.dance ? () => openLink(notification.dance.link) : null}
              >
                <Text style={styles.notificationText}>{notification.text}</Text>
                {notification.dance && (
                  <View style={[styles.danceCard, {borderWidth: 1}]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.danceName} numberOfLines={1}>
                        {notification.dance.name}
                      </Text>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => toggleSaveDance(notification.dance)}>
                          <MaterialIcons
                            name="bookmark-border"
                            size={24}
                            color={theme.textColor}
                            style={styles.actionButtonIcon}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => shareDance(notification.dance.link)}>
                          <MaterialIcons
                            name="share"
                            size={24}
                            color={theme.textColor}
                            style={styles.actionButtonIcon}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => requestDance(notification.dance)}>
                          <MaterialIcons
                            name="send"
                            size={24}
                            color={theme.textColor}
                            style={styles.actionButtonIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.danceDetails}>
                      Author/Date: {notification.dance.authorDate}
                    </Text>
                    <Text style={styles.danceDetails}>Count: {notification.dance.count}</Text>
                    <Text style={styles.danceDetails}>
                      Difficulty: {notification.dance.difficulty}
                    </Text>
                    <Text style={styles.danceDetails}>Song: {notification.dance.song}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={() => setNotificationVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      </View>
    </MenuProvider>
  );
};


export default MyVenue;
