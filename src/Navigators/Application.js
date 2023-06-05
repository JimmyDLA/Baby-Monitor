import React from 'react'
import { StatusBar } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import {
  StartupContainer,
  CreateFreq,
  JoinFreq,
  EnterFreq,
  Home,
} from '../Screens'
import { useTheme } from '@/Hooks'
import { navigationRef } from './utils'

const Stack = createStackNavigator()

// @refresh reset
const ApplicationNavigator = () => {
  const { darkMode, NavigationTheme } = useTheme()

  return (
    <NavigationContainer theme={NavigationTheme} ref={navigationRef}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Startup" component={StartupContainer} />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            animationEnabled: false,
          }}
        />
        <Stack.Screen
          name="CreateFreq"
          component={CreateFreq}
          options={{
            animationEnabled: true,
            gestureEnabled: false,
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="JoinFreq"
          component={JoinFreq}
          options={{
            animationEnabled: true,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="EnterFreq"
          component={EnterFreq}
          options={{
            animationEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default ApplicationNavigator
