import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import RootNavigator from './src/navigation/RootNavigator';
import { store, loadInitialState } from './src/redux';
import { configureGoogleSignIn } from './src/services';

export default function App() {
  useEffect(() => {
    configureGoogleSignIn();
    store.dispatch(loadInitialState());
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <NavigationContainer>
<<<<<<< HEAD
          <RootNavigator
            initialRouteName="Auth"
            authInitialRouteName="Onboarding"
          />
=======
          <RootNavigator initialRouteName="DeleteFamily" />
>>>>>>> 8ab347b (commit 16 nov monday)
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
