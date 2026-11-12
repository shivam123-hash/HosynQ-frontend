import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import Colors from './src/units/Colors';
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
          <RootNavigator authInitialRouteName="Onboarding" />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
