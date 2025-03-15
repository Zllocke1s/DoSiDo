import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';




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


  const styles =
    StyleSheet.create({
      container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: theme.backgroundColor, // Theme-based background color
      },
      input: {
        height: 200,
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
    padding: 20
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
        justifyContent: 'center',
        marginBottom: 20,
        width: "100%"
      },
      toggleButton: {
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: theme.cardBackgroundColor, // Theme-based button background
        borderRadius: 5,
        flex: 0.4,
        
      },
      sendButton: {
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: theme.cardBackgroundColor, // Theme-based button background
        borderRadius: 5, 
      },
      activeButton: {
        backgroundColor: theme.activeButtonColor || theme.textColor, // Theme-based active button background
      },
      toggleText: {
        fontSize: 16,
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
        display: "flex",
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
    width: "100%"
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
          notificationDanceDifficulty: notificationDance.difficulty
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
      const response = await fetch('https://www.outpostorganizer.com/dosidoapi.php', {
        method: 'POST',
        body: JSON.stringify({
          command: 'GetRequests',
          requestType: filter, // Send the filter ('teach' or 'play')
        }),
      });
  
      const responseData = await response.json();
      if (responseData.code === 1) {
        // Parse user_request_pairs to extract names
        const updatedRequests = responseData.requests.map(request => {
          const requesters = request.user_request_pairs
            ? request.user_request_pairs
                .split(',') // Split pairs
                .map(pair => pair.split(':')[1]) // Extract RequestedBy (name)
                .join(', ') // Rejoin names
            : 'N/A';
          return { ...request, requesters };
        });
        setRequests(updatedRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin</Text>

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
                                <Text style={styles.songName}>{request.Name}</Text>
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
                                        <MaterialIcons name="send"  size={24} color={theme.textColor} style={{marginHorizontal: 5, flex: 0.4, transform: [{rotate: '180deg'}]}} />
                                      </TouchableOpacity>
                                  </View>
                                </View>
                <Text style={styles.details}>Song: {request.Song}</Text>
                <Text style={styles.details}>Author/Date: {request.AuthorDate}</Text>
                <Text style={styles.details}>Count: {request.Count}</Text>
                <Text style={styles.details}>Difficulty: {request.Difficulty}</Text>
                <Text style={styles.requestCount}>Requests by: {request.requesters}</Text>
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
          style={[styles.toggleButton, notificationType === notificationTypes.dance && styles.activeButton, {height: 40}]}
          onPress={() => setNotificationType(notificationTypes.dance)}
        >
          <Text style={[styles.toggleText, notificationType === notificationTypes.dance && styles.activeText]}>Dance Link</Text>
        </TouchableOpacity>}
        <TouchableOpacity
          style={[styles.toggleButton, notificationType === notificationTypes.playlist && styles.activeButton, {height: 40}]}
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
            placeholderTextColor={theme.textColor + "77"}
            value={notificationText}
            onChangeText={setNotificationText}
            multiline
          />
          {notificationType != notificationTypes.general && 
          <TextInput
            style={[styles.input, {height: notificationType != notificationDance.dance ? 40 : 300}]}
            placeholder="Playlist Links (Each on new line)"
            placeholderTextColor={theme.textColor + "77"}
            value={notificationLink}
            onChangeText={setNotificationLink}
            editable={notificationType != notificationTypes.dance}
            multiline
          />}
          
          <TouchableOpacity
            style={[styles.sendButton, {width: 100, justifyContent: "center", alignContent: "center", alignItems: "center"}]}
            onPress={() => {
              sendNotification();
              setSendNotificationModal(false)}
            }
          >
            <Text style={[styles.toggleText]}>Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSendNotificationModal(false)} style={styles.closeButton}>
        <MaterialIcons name="close" size={28} color={theme.textColor} />
      </TouchableOpacity>
          </View>
          </View>
          </Modal>
    </View>
  );
};


export default Admin;
