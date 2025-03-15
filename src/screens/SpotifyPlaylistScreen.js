import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { getSpotifyPlaylist } from "../utilities/spotifyAPIs"; // Ensure this function is implemented
import { MaterialIcons } from '@expo/vector-icons';

const SpotifyPlaylistScreen = ({ route, navigation }) => {
  const { playlistId } = route.params;
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      const data = await getSpotifyPlaylist(playlistId);
      if (data) setPlaylist(data);
      setLoading(false);
    };

    fetchPlaylist();
  }, [playlistId]);

  if (loading) return <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
        <MaterialIcons name="close" size={28} color="white" />
      </TouchableOpacity>
      {playlist && (
        <>
          <Text style={styles.title}>{playlist.name}</Text>
          <Text style={styles.description}>{playlist.description}</Text>

          <FlatList
            data={playlist.tracks.items}
            keyExtractor={(item) => item.track.id}
            renderItem={({ item }) => (
              <View style={styles.trackItem}>
                <Image
                  source={{ uri: item.track.album.images[0]?.url }}
                  style={styles.albumArt}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.trackName}>{item.track.name}</Text>
                  <Text style={styles.artistName}>
                    {item.track.artists.map((artist) => artist.name).join(", ")}
                  </Text>
                </View>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: 50 },
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 10 },
  description: { fontSize: 14, color: "gray", marginBottom: 20 },
  trackItem: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  albumArt: { width: 50, height: 50, borderRadius: 5 },
  trackName: { fontSize: 16, color: "white" },
  artistName: { fontSize: 14, color: "gray" },
  closeButton: { position: "absolute", top: 20, right: 20 },
});

export default SpotifyPlaylistScreen;
