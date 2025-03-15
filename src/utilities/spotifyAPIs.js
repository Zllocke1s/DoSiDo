const CLIENT_ID = "e30d6fcea5044f7199826fe68452f0aa";
const CLIENT_SECRET = "cdc67f1b414f414380d3ef458935ac52";

// Function to get an OAuth token
const getSpotifyToken = async () => {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching Spotify token:", error);
    return null;
  }
};

export const getSpotifyPlaylists = async (playlistId) => {
    //call getspotifyplaylist for each playlist in the playlistId Array
    //return an array of playlist data
    const token = await getSpotifyToken();
    if (!token) return null;
    let playlists = [];
    for(let i = 0; i < playlistId.length; i++){
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId[i]}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            playlists.push(data);
        } catch (error) {
            console.error("Error fetching Spotify playlist:", error);
            return null;
        }
    }
    return playlists;
}

// Function to fetch a public playlist
export const getSpotifyPlaylist = async (playlistId) => {
  const token = await getSpotifyToken();
  if (!token) return null;

  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    return data; // JSON playlist data
  } catch (error) {
    console.error("Error fetching Spotify playlist:", error);
    return null;
  }
};
