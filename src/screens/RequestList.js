import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://www.outpostorganizer.com/dosidoapi.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: 'GetRequests' }),
      });
      
      const responseData = await response.json();
      console.log('Fetched Requests:', responseData); // Log API response
  
      if (responseData.code === 1) {
        const unacknowledgedRequests = responseData.requests;
        setRequests(unacknowledgedRequests);
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
  

  // Send acknowledge request to server and reload data
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
        Alert.alert("Acknowledged", "The request has been acknowledged.");
        fetchRequests(); // Reload the list to reflect the acknowledged state
      } else {
        console.error('Failed to acknowledge request:', responseData);
      }
    } catch (error) {
      console.error('Error acknowledging request:', error);
    }
  };

  // Reload data whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#5a3e36" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request List</Text>
      <ScrollView contentContainerStyle={styles.requestList}>
        {requests.length > 0 ? requests.map((request, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => openLink(request.Link)}
            onLongPress={() => acknowledgeRequest(request)}
            style={styles.requestCard}
          >
            <Text style={styles.songName}>{request.Name}</Text>
            <Text style={styles.details}>{request.Song}</Text>
            <Text style={styles.details}></Text>
            <Text style={styles.details}>Author/Date: {request.AuthorDate}</Text>
            <Text style={styles.details}>Count: {request.Count}</Text>
            <Text style={styles.details}>Difficulty: {request.Difficulty}</Text>
            <Text style={styles.details}>Link: {request.Link}</Text>
            <Text style={styles.requestCount}>Requests: {request.request_list.split(",").join(", ")}</Text>
          </TouchableOpacity>
        )) : <Text style={styles.title}>No Requests</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FAEBD7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
    textAlign: 'center',
    color: '#5a3e36',
  },
  requestList: {
    paddingBottom: 20,
  },
  requestCard: {
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
  songName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#5a3e36',
  },
  details: {
    fontSize: 14,
    color: '#5a3e36',
    marginBottom: 3,
  },
  requestCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5a3e36',
    marginTop: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default RequestList;
