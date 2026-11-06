import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import RootNavigator from './src/navigation/RootNavigator';
import { store, loadInitialState } from './src/redux';

export default function App() {
  useEffect(() => {
    store.dispatch(loadInitialState());
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <NavigationContainer>
          <RootNavigator initialRouteName="Home" />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
