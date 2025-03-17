import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../UserContext';



  //enum of notification types
  const notificationTypes = {
    dance: 'dance',
    playlist: 'playlist',
    general: 'general'
  };

  //enum of request filters
  const requestFilters = {
    teach: 'teach',
    play: 'play',
  };

const Admin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(requestFilters.play); // Default filter is 'play'
  const { theme } = useTheme();

  const [sendNotificationModal, setSendNotificationModal] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [notificationLink, setNotificationLink] = useState('');
  const [notificationType, setNotificationType] = useState(notificationTypes.general);
  const [notificationDance, setNotificationDance] = useState({});

  const [sortAscending, setSortAscending] = useState(true);
  const [seenRequests, setSeenRequests] = useState(new Set());


  const { username, setUsername, deviceId } = useUser();


  const styles =
    StyleSheet.create({
      container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: theme.backgroundColor, // Theme-based background color
      },
      input: {
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
      closeButton: { position: "absolute", top: 10, right: 10 },

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
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 50,
        marginBottom: 20,
        textAlign: 'center',
        color: theme.textColor, // Theme-based text color
      },
      toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
      },
      toggleButton: {
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: theme.cardBackgroundColor, // Theme-based button background
        borderRadius: 5,
      },
      
      sortButton: {
        padding: 5,
        marginHorizontal: 5,
        backgroundColor: theme.cardBackgroundColor, // Theme-based button background
        borderRadius: 5,
        textAlign: "center",
        alignItems: "center",
        width: 150,
        position: "absolute",
        top: 20,
      },
      activeButton: {
        backgroundColor: theme.activeButtonColor || theme.textColor, // Theme-based active button background
      },
      toggleText: {
        fontSize: 13,
        color: theme.textColor, // Theme-based text color
      },
      activeText: {
        color: theme.activeTextColor || '#FFF8E1', // Theme-based active text color
      },
      requestList: {
        paddingBottom: 20,
      },
      requestCard: {
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
      songName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: theme.textColor, // Theme-based text color
      },
      details: {
        fontSize: 14,
        color: theme.textColor, // Theme-based text color
        marginBottom: 3,
      },
      requestCount: {
        fontSize: 16,
        color: theme.textColor, // Theme-based text color
        marginTop: 10,
      },
      
      requestCountHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.textColor, // Theme-based text color
        marginTop: 10,
      },
      
      
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
  },
      noRequests: {
        fontSize: 16,
        textAlign: 'center',
        color: theme.textColor, // Theme-based text color
        marginTop: 20,
      },
      loading: {
        flex: 1,
        justifyContent: 'center',
      },
    });

  const getNotificationLink = () => {
    if(notificationType == notificationTypes.dance) {
      return notificationLink
    } else if (notificationType == notificationTypes.playlist) {
      return "spotify:" + notificationLink.split('\n').map(link => link.split("playlist/")[1]).join(':')
    }
    return "general"
  }

  const sendNotification = async () => {
    try {
      let notificationLink = getNotificationLink()
      const response = await fetch('https://www.outpostorganizer.com/dosidoapi.php', {
        method: 'POST',
        body: JSON.stringify({
          command: 'SendNotification',
          notificationType: notificationType,
          notificationText: notificationText,
          notificationLink: notificationLink,
          notificationDanceName: notificationDance.name,
          notificationDanceSong: notificationDance.song,
          notificationDanceAuthor: notificationDance.author,
          notificationDanceCount: notificationDance.count,
          notificationDanceDifficulty: notificationDance.difficulty,
          deviceId: deviceId

        }),
      });

      const responseData = await response.json();
      console.log(responseData)
      if (responseData.code === 1) {
        Alert.alert('Notification Sent', 'The notification has been sent.');
        setNotificationText('');
        setNotificationLink('');
        setNotificationType(notificationTypes.general);
        setSendNotificationModal(false);
        setNotificationDance({});
      } else {
        console.error('Failed to send notification:', responseData);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
  
  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Retrieve previously seen requests
      const storedSeenRequests = await AsyncStorage.getItem('seenRequests');
      const seenIds = storedSeenRequests ? new Set(JSON.parse(storedSeenRequests)) : new Set();
  
      const response = await fetch('https://www.outpostorganizer.com/dosidoapi.php', {
        method: 'POST',
        body: JSON.stringify({
          command: 'GetRequests',
          requestType: filter,
          deviceId: deviceId
        }),
      });
  
      const responseData = await response.json();
      if (responseData.code === 1) {
        const updatedRequests = responseData.requests.map(request => {
          const requesters = request.user_request_pairs
            ? request.user_request_pairs
                .split(',')
                .map(pair => pair.split('%&%')[1])
                .join('\n')
            : 'N/A';
  
          return { 
            ...request, 
            requesters, 
            newRequest: !seenIds.has(request.Link) // Mark as new if the Link isn't in seenIds
          };
        });
  
        console.log(updatedRequests);
  
        // Extract all request Links (since IDs might be reused)
        const newRequestLinks = updatedRequests.map(req => req.Link);
  
        // Merge old and new seen requests, removing duplicates
        const updatedSeenRequests = new Set([...seenIds, ...newRequestLinks]);
  
        // Save the merged list back to AsyncStorage
        await AsyncStorage.setItem('seenRequests', JSON.stringify([...updatedSeenRequests]));
  
        setRequests(updatedRequests.sort((a, b) => sortAscending ? a.id - b.id : b.id - a.id));
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const toggleSortOrder = () => {
    setSortAscending(prev => !prev);
    setRequests(prevRequests => [...prevRequests].reverse());
  };
  


  const openLink = (link) => {
    Linking.openURL(link);
  };

  const acknowledgeRequest = async (request) => {
    try {
      const response = await fetch('https://www.outpostorganizer.com/dosidoapi.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'Acknowledge',
          song: request.Song,
          link: request.Link,
          authorDate: request.AuthorDate,
          count: request.Count,
          difficulty: request.Difficulty,
          deviceId: deviceId
        }),
      });


      
      const responseData = await response.json();

      if (responseData.code === 1) {
        Alert.alert('Acknowledged', 'The request has been acknowledged.');
        fetchRequests();
      } else {
        console.error('Failed to acknowledge request:', responseData);
      }
    } catch (error) {
      console.error('Error acknowledging request:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [filter])
  );

  
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
  
    const isSameDay = now.toDateString() === date.toDateString();
    const isSameWeek = (now - date) / (1000 * 60 * 60 * 24) < 7 && now.getDay() >= date.getDay();
    const isSameYear = now.getFullYear() === date.getFullYear();
  
    if (isSameDay) {
      return `Today at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } else if (isSameWeek) {
      return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    } else if (isSameYear) {
      return date.toLocaleDateString('en-US', { month: 'numeric', day: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin</Text>
      <TouchableOpacity 
  style={[styles.sortButton]} 
  onPress={toggleSortOrder}
>
  <Text style={[styles.toggleText, {fontSize: 12}]}>
    Sort By: {sortAscending ? 'Oldest' : 'Newest'}
  </Text>
</TouchableOpacity>

      {/* Toggle for Teach and Play Requests */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, filter === requestFilters.teach && styles.activeButton]}
          onPress={() => setFilter('teach')}
        >
          <Text style={[styles.toggleText, filter === requestFilters.teach && styles.activeText]}>Teach Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, filter === requestFilters.play && styles.activeButton]}
          onPress={() => setFilter('play')}
        >
          <Text style={[styles.toggleText, filter === requestFilters.play && styles.activeText]}>Play Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton]}
          onPress={() => setSendNotificationModal(true)}
        >
          <Text style={[styles.toggleText]}>Send Notification</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#5a3e36" style={styles.loading} />
      ) : (
        <ScrollView contentContainerStyle={styles.requestList}>
          {requests.length > 0 ? (
            requests.map((request, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => openLink(request.Link)}
                onLongPress={() => acknowledgeRequest(request)}
                style={styles.requestCard}
              >
                                <View style={styles.cardHeader}>
                                <Text style={styles.songName}>
      {request.Name} {request.newRequest && '⭐'}
    </Text>                                
    <View style={styles.actionButtons}>
                                     <TouchableOpacity onPress={() => 
                                      {
                                        setNotificationDance({
                                          name: request.Name,
                                          song: request.Song,
                                          author: request.AuthorDate,
                                          count: request.Count,
                                          difficulty: request.Difficulty
                                          })
                                        setNotificationLink(request.Link)
                                        setNotificationType(notificationTypes.dance)
                                        setSendNotificationModal(true)
                                      }
                                      }>
                                        <MaterialIcons name="send"  size={24} color={theme.textColor} style={{marginHorizontal: 5, transform: [{rotate: '180deg'}]}} />
                                      </TouchableOpacity>
                                  </View>
                                </View>
                <Text style={styles.details}>Song: {request.Song}</Text>
                <Text style={styles.details}>Author/Date: {request.AuthorDate}</Text>
                <Text style={styles.details}>Count: {request.Count}</Text>
                <Text style={styles.details}>Difficulty: {request.Difficulty}</Text>
                <Text style={styles.requestCountHeader}>Requested by:</Text>
                <Text style={styles.requestCount}>{request.requesters.split("\n").map((requestor) => {
                  let requestorAry = requestor.split(" | ")
                  let requestName = requestorAry[0]
                  let requestDate = formatTimestamp(requestorAry[1])
                  return(
                    requestName + " - " + requestDate
                  )
                }).join("\n")}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noRequests}>No {filter === requestFilters.teach ? 'Teach' : 'Play'} Requests</Text>
          )}
        </ScrollView>
      )}
      <Modal visible={sendNotificationModal} animationType="slide" transparent>
      <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Send Notification</Text>
          <View style={styles.toggleContainer}>
          {notificationType == notificationTypes.dance && <TouchableOpacity
          style={[styles.toggleButton, notificationType === notificationTypes.dance && styles.activeButton]}
          onPress={() => setNotificationType(notificationTypes.dance)}
        >
          <Text style={[styles.toggleText, notificationType === notificationTypes.dance && styles.activeText]}>Dance Link</Text>
        </TouchableOpacity>}
        <TouchableOpacity
          style={[styles.toggleButton, notificationType === notificationTypes.playlist && styles.activeButton]}
          onPress={() => setNotificationType(notificationTypes.playlist)}
        >
          <Text style={[styles.toggleText, notificationType === notificationTypes.playlist && styles.activeText]}>Playlist Link</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, notificationType === notificationTypes.general && styles.activeButton]}
          onPress={() => setNotificationType(notificationTypes.general)}
        >
          <Text style={[styles.toggleText, notificationType === notificationTypes.general && styles.activeText]}>General Announcement</Text>
        </TouchableOpacity>
        </View>
          <TextInput
            style={styles.input}
            placeholder="Notification Text"
            value={notificationText}
            onChangeText={setNotificationText}
            multiline
          />
          {notificationType != notificationTypes.general && 
          <TextInput
            style={styles.input}
            placeholder="Playlist Links (Each on new line)"
            value={notificationLink}
            onChangeText={setNotificationLink}
            editable={notificationType != notificationTypes.dance}
            multiline
          />}
          
          <TouchableOpacity
            style={[styles.toggleButton, {width: 70, textAlign: "center", justifyContent: "center", alignItems: "center", alignItems: "center"}]}
            onPress={() => {
              sendNotification();
              setSendNotificationModal(false)}
            }
          >
            <Text style={[styles.toggleText]}>Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSendNotificationModal(false)} style={styles.closeButton}>
        <MaterialIcons name="close" size={28} color="white" />
      </TouchableOpacity>
          </View>
          </View>
          </Modal>
          
    </View>
  );
};


export default Admin;
