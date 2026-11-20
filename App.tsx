import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import RootNavigator from './src/navigation/RootNavigator';
import { store, loadInitialState } from './src/redux';
import {
  fetchLifeProfileFullThunk,
  loadCachedLifeProfileThunk,
} from './src/redux/features/lifeProfile/lifeProfileSlice';
import { configureGoogleSignIn, authServices } from './src/services';
import {
  getUserData,
  getMyMemberId,
  saveMyMemberId,
  clearUserData,
} from './src/units/asyncStorageManager';

function AppContent() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [initialTarget, setInitialTarget] = useState<{
    root: 'Auth' | 'Profile' | 'Home';
    authScreen?: any;
    memberId?: string;
  }>({
    root: 'Auth',
    authScreen: 'Onboarding',
  });

  useEffect(() => {
    configureGoogleSignIn();

    const bootstrapAuth = async () => {
      try {
        console.log('[AppBootstrap] Initializing app authentication state...');
        // Hydrate cached life profile from AsyncStorage immediately
        await store.dispatch(loadCachedLifeProfileThunk());

        const stored = await getUserData();
        const storedMemberId = await getMyMemberId();

        console.log('[AppBootstrap] Stored User Credentials:', {
          hasAccessToken: !!stored?.accessToken,
          hasRefreshToken: !!stored?.refreshToken,
          storedMemberId,
        });

        if (stored?.accessToken || stored?.refreshToken) {
          try {
            console.log('[AppBootstrap] Validating session with GET api/v1/auth/me ...');
            const meData = await authServices.getProfile();
            console.log(
              '[AppBootstrap] GET api/v1/auth/me Success Response:\n',
              JSON.stringify(meData, null, 2)
            );

            // Also dispatch loadInitialState to hydrate redux store
            store.dispatch(loadInitialState());

            const resolvedMemberId =
              meData?.lifeProfile?.memberId ||
              meData?.memberId ||
              storedMemberId ||
              null;

            if (resolvedMemberId) {
              await saveMyMemberId(resolvedMemberId);
              // Pre-fetch fresh life profile before un-blocking render
              try {
                console.log(
                  '[AppBootstrap] Pre-fetching full life profile for:',
                  resolvedMemberId
                );
                await store
                  .dispatch(
                    fetchLifeProfileFullThunk({ memberId: resolvedMemberId })
                  )
                  .unwrap();
              } catch (fetchErr) {
                console.log(
                  '[AppBootstrap] Full life profile fetch error (cached profile retained):',
                  fetchErr
                );
              }
            }

            // Decide landing screen based on backend response:
            if (
              meData?.inFamily ||
              meData?.lifeProfile ||
              meData?.nextStep === 'HOME'
            ) {
              console.log(
                '[AppBootstrap] User in family. Navigating directly to MyLifeProfile!'
              );
              setInitialTarget({
                root: 'Profile',
                memberId: resolvedMemberId || undefined,
              });
              setIsCheckingAuth(false);
              return;
            } else if (meData?.nextStep === 'FAMILY_SETUP' || !meData?.inFamily) {
              console.log(
                '[AppBootstrap] User needs family setup. Navigating to SetUpFamily.'
              );
              setInitialTarget({
                root: 'Auth',
                authScreen: 'SetUpFamily',
                memberId: resolvedMemberId || undefined,
              });
              setIsCheckingAuth(false);
              return;
            }
          } catch (meError: any) {
            console.log(
              '[AppBootstrap] GET api/v1/auth/me error:',
              meError?.response?.status,
              meError?.message
            );
            if (meError?.response?.status === 401) {
              console.log('[AppBootstrap] Session expired. Clearing stored data.');
              await clearUserData();
            } else if (storedMemberId) {
              console.log(
                '[AppBootstrap] Network unavailable. Offline fallback to MyLifeProfile.'
              );
              setInitialTarget({
                root: 'Profile',
                memberId: storedMemberId,
              });
              setIsCheckingAuth(false);
              return;
            }
          }
        }
      } catch (err) {
        console.log('[AppBootstrap] Error bootstrapping auth:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    bootstrapAuth();
  }, []);

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#F0913A" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <RootNavigator
          initialRouteName={initialTarget.root}
          authInitialRouteName={initialTarget.authScreen || 'Onboarding'}
          initialMemberId={initialTarget.memberId}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A111F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
