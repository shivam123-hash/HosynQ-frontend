import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList, AuthStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import ProfileNavigator from './ProfileNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export interface RootNavigatorProps {
  initialRouteName?: keyof RootStackParamList;
  authInitialRouteName?: keyof AuthStackParamList;
}

const RootNavigator: React.FC<RootNavigatorProps> = ({
  initialRouteName = 'Auth',
  authInitialRouteName = 'Onboarding',
}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Auth">
        {(props) => (
          <AuthNavigator {...props} initialRouteName={authInitialRouteName} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Profile" component={ProfileNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
