import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList, AuthStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import ProfileNavigator from './ProfileNavigator';
import YourBriefScreen from '../screens/mainScreens/yourBriefScreen/YourBriefScreen';
import NeedsAttentionScreen from '../screens/mainScreens/needsAttentionScreen/NeedsAttentionScreen';
import NotificationsScreen from '../screens/mainScreens/notificationsScreen/NotificationsScreen';
import MainTabScreen from '../screens/mainScreens/mainTabScreen/MainTabScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export interface RootNavigatorProps {
  initialRouteName?: keyof RootStackParamList;
  authInitialRouteName?: keyof AuthStackParamList;
}

const RootNavigator: React.FC<RootNavigatorProps> = ({
  initialRouteName = 'Home',
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
      <Stack.Screen name="Home">
        {(props) => (
          <MainTabScreen
            initialTab={props.route.params?.initialTab || 'home'}
            onProfilePress={() =>
              props.navigation.navigate('Profile', { screen: 'Step1' })
            }
            onOpenBrief={(timeframe) =>
              props.navigation.navigate('YourBrief', {
                initialTimeframe: timeframe || 'today',
              })
            }
            onOpenNeedsAttention={() =>
              props.navigation.navigate('NeedsAttention')
            }
            onNotificationsPress={() =>
              props.navigation.navigate('Notifications')
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="YourBrief">
        {(props) => (
          <YourBriefScreen
            initialTimeframe={props.route.params?.initialTimeframe}
            forceLoading={props.route.params?.forceLoading}
            isEmpty={props.route.params?.isEmpty}
            onBack={() => props.navigation.goBack()}
            onOpenCalendar={() =>
              props.navigation.navigate('Home')
            }
            onOpenTasks={() =>
              props.navigation.navigate('Tasks')
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NeedsAttention">
        {(props) => (
          <NeedsAttentionScreen
            initialFilter={props.route.params?.initialFilter}
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Notifications">
        {(props) => (
          <NotificationsScreen
            isEmpty={props.route.params?.isEmpty}
            initialFilter={props.route.params?.initialFilter}
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Tasks">
        {(props) => (
          <MainTabScreen
            initialTab="tasks"
            onProfilePress={() =>
              props.navigation.navigate('Profile', { screen: 'Step1' })
            }
            onOpenBrief={(timeframe) =>
              props.navigation.navigate('YourBrief', {
                initialTimeframe: timeframe || 'today',
              })
            }
            onOpenNeedsAttention={() =>
              props.navigation.navigate('NeedsAttention')
            }
            onNotificationsPress={() =>
              props.navigation.navigate('Notifications')
            }
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default RootNavigator;
