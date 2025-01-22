import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('play'); // Default filter is 'play'
  const { theme } = useTheme();

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
        marginTop: 50,
        marginBottom: 20,
        textAlign: 'center',
        color: theme.textColor, // Theme-based text color
      },
      toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
      },
      toggleButton: {
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
  
  
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://www.outpostorganizer.com/dosidoapi.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      <Text style={styles.title}>Request List</Text>

      {/* Toggle for Teach and Play Requests */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, filter === 'teach' && styles.activeButton]}
          onPress={() => setFilter('teach')}
        >
          <Text style={[styles.toggleText, filter === 'teach' && styles.activeText]}>Teach Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, filter === 'play' && styles.activeButton]}
          onPress={() => setFilter('play')}
        >
          <Text style={[styles.toggleText, filter === 'play' && styles.activeText]}>Play Requests</Text>
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
                <Text style={styles.songName}>{request.Name}</Text>
                <Text style={styles.details}>Song: {request.Song}</Text>
                <Text style={styles.details}>Author/Date: {request.AuthorDate}</Text>
                <Text style={styles.details}>Count: {request.Count}</Text>
                <Text style={styles.details}>Difficulty: {request.Difficulty}</Text>
                <Text style={styles.requestCount}>Requests by: {request.requesters}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noRequests}>No {filter === 'teach' ? 'Teach' : 'Play'} Requests</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};


export default RequestList;
