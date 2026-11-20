import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../src/redux';
import PersonalInfoScreen from '../src/screens/completeProfileScreens/innerScreens/PersonalInfoScreen';
import PersonalInfoDetailsScreen from '../src/screens/completeProfileScreens/innerScreens/PersonalInfoDetailsScreen';
import PersonalInfoInputScreen from '../src/screens/completeProfileScreens/innerScreens/PersonalInfoInputScreen';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Complete Profile Personal Info Navigation Flow', () => {
  it('renders input mode initially when initialMode="input"', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <PersonalInfoScreen initialMode="input" />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const inputScreen = renderer!.root.findAllByType(PersonalInfoInputScreen);
    expect(inputScreen.length).toBe(1);

    const detailsScreen = renderer!.root.findAllByType(PersonalInfoDetailsScreen);
    expect(detailsScreen.length).toBe(0);
  });

  it('navigates to onBack (MyLifeProfile) when back button is pressed in details mode', () => {
    const handleBack = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <PersonalInfoScreen initialMode="details" onBack={handleBack} />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const detailsScreen = renderer!.root.findByType(PersonalInfoDetailsScreen);
    expect(detailsScreen).toBeTruthy();

    ReactTestRenderer.act(() => {
      detailsScreen.props.onBack();
    });

    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('switches to input mode when onEditPress is called from details mode', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <PersonalInfoScreen initialMode="details" />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const detailsScreen = renderer!.root.findByType(PersonalInfoDetailsScreen);
    expect(detailsScreen).toBeTruthy();

    ReactTestRenderer.act(() => {
      detailsScreen.props.onEditPress();
    });

    const inputScreen = renderer!.root.findAllByType(PersonalInfoInputScreen);
    expect(inputScreen.length).toBe(1);
  });
});
