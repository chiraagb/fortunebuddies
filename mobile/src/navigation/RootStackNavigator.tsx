import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LoginHome from '../screens/auth/LoginHome';

const Stack = createNativeStackNavigator();

const RootStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginHome}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
export default RootStackNavigator;
