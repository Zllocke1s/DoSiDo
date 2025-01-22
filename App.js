import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MainScreen } from './src/screens/HomeScreen'; // Adjust the import if needed
import { UserProvider } from './src/UserContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/ThemeContext';


function App() {
  return (
    <SafeAreaProvider>
    <UserProvider>
      <ThemeProvider>
        <NavigationContainer>
          <MainScreen />
        </NavigationContainer>
      </ThemeProvider>
    </UserProvider>
    </SafeAreaProvider>
  );
}

export default App;
