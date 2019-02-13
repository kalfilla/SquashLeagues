import React from 'react';
import Stats from "./components/Stats"
import Clasifications from "./components/Clasifications"
import MatchSearcher from "./components/MatchSearcher"
import MatchModal from "./components/MatchModal"
import Loading from "./components/Loading"
import Login from "./components/Login"
import GroupChat from "./components/GroupChat"
import EditingScreen from "./components/EditingScreen"
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import {Text} from 'react-native';
import { Ionicons, AntDesign, Entypo } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Font } from 'expo';

async function fixOppoTextCutOff() {

  await Font.loadAsync({
      'roboto': require('./assets/fonts/Roboto-Regular.ttf'),
      'bold': require('./assets/fonts/Roboto-Bold.ttf'),
    })

  const oldRender = Text.render;
  Text.render = function render(...args) {
    const origin = oldRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [{fontFamily: 'roboto'}, origin.props.style],
    });
  };
}

fixOppoTextCutOff()

const ClasifStack = createStackNavigator({
  Clasifications: Clasifications,
  MatchModal: MatchModal,
  EditingScreen: EditingScreen
}, {
  headerMode: "none",
  mode: "modal"
});

const AppNavigator = createBottomTabNavigator(
  {
    Stats: {
      screen:Stats,
      navigationOptions: {
        tabBarLabel:"Estadístiques",
        tabBarIcon: ({ tintColor }) => (
          <Ionicons name="ios-stats" size={20} color={tintColor}/>
        )
      },
    },
    Classificacions: {
      screen:ClasifStack,
      navigationOptions: {
        tabBarLabel:"Competició",
        tabBarIcon: ({ tintColor }) => (
          <MaterialCommunityIcons name="tournament" size={20} color={tintColor}/>
        )
      },
    },
    GroupChat: {
      screen:EditingScreen,
      navigationOptions: {
        tabBarLabel:"Xat",
        tabBarIcon: ({ tintColor }) => (
          <Entypo name="chat" size={20} color={tintColor}/>
        )
      },
    },
    MatchSearcher: {
      screen:MatchSearcher,
      navigationOptions: {
        tabBarLabel:"Partits",
        tabBarIcon: ({ tintColor }) => (
          <AntDesign name="database" size={20} color={tintColor}/>
        )
      },
    },
  },
  {initialRouteName: "GroupChat"},
  {tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
      activeBackgroundColor: "#cccccc4D",
      inactiveBackgroundColor: "#ffffff00"
    },
  }
);

const LogInChecker = createStackNavigator({
  Loading: Loading,
  App: AppNavigator,
  Login: Login
}, {
  headerMode: "none",
});

const prevGetStateForAction = LogInChecker.router.getStateForAction;

LogInChecker.router.getStateForAction = (action, state) => {
  // Do not allow to go back from Home
  //if (action.type === 'Navigation/BACK' && state && state.routes[state.index].routeName === 'App') {
  //  return null;
  //}

  // Do not allow to go back to Login
  if (action.type === 'Navigation/BACK' && state) {
    const newRoutes = state.routes.filter(r => r.routeName !== 'Loading' && r.routeName !== 'Login')
    const newIndex = newRoutes.length - 1;
    return prevGetStateForAction(action, { index: newIndex, routes: newRoutes });
  }
  return prevGetStateForAction(action, state);
};

export default LogInChecker;

