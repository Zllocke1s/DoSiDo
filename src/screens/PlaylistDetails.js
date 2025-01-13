const PlaylistDetails = ({ route, navigation }) => {
    const { playlistName, dances } = route.params;
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{playlistName}</Text>
        <ScrollView contentContainerStyle={styles.danceList}>
          {dances.map((dance, index) => (
            <View key={index} style={styles.danceCard}>
              <Text style={styles.danceName}>{dance.name}</Text>
              <Text style={styles.danceDetails}>Author/Date: {dance.authorDate}</Text>
              <Text style={styles.danceDetails}>Count: {dance.count}</Text>
              <Text style={styles.danceDetails}>Difficulty: {dance.difficulty}</Text>
              <Text style={styles.danceDetails}>Song: {dance.song}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#FAEBD7',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: '#5a3e36',
    },
    danceList: {
      paddingBottom: 20,
    },
    danceCard: {
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
    danceName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#5a3e36',
    },
    danceDetails: {
      fontSize: 14,
      color: '#5a3e36',
      marginTop: 3,
    },
  });
  
  export default PlaylistDetails;
  