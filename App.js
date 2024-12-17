import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MainScreen } from './src/screens/HomeScreen'; // Adjust the import if needed
import { UserProvider } from './src/UserContext';

function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <MainScreen />
      </NavigationContainer>
    </UserProvider>
  );
}

export default App;
