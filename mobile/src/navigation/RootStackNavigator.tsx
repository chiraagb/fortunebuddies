import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import useAuth from '../hooks/auth/useAuth';
import MainTabNavigator from './MainTabNavigator';
import AuthStackNavigator from './AuthStackNavigator';

const Stack = createNativeStackNavigator();

const RootStackNavigator = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </Stack.Navigator>
  );
};
export default RootStackNavigator;
