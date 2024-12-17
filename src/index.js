import { createAppContainer } from 'react-navigation';
import { createStackNavigator, TransitionPresets } from 'react-navigation-stack';

import {
  HomeScreen,
} from './screens';

const Router = createStackNavigator(
  {
    HomeScreen: {
      screen: HomeScreen,
      navigationOptions: {
        header: ({scene, previous, navigation}) => {
          return(null)
        },  
        ...TransitionPresets.ModalTransition
      }
    }
  },  
  {
    initialRouteName: 'Init',
    headerMode: 'float',
    defaultNavigationOptions: {
        gestureEnabled: false,
        gestureDirection: "horizontal",      
        cardOverlayEnabled: true,
        ...TransitionPresets.SlideFromRightIOS
      
    }
    
  }
);

export default createAppContainer(Router);
