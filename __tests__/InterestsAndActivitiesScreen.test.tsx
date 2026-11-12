import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import InterestsAndActivitiesScreen from '../src/screens/completeProfileScreens/innerScreens/InterestsAndActivitiesScreen';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('InterestsAndActivitiesScreen (LPS-13)', () => {
  test('renders InterestsAndActivitiesScreen with all categories and default chips', () => {
    const onSave = jest.fn();
    const onEnterHosynQ = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <InterestsAndActivitiesScreen
            onSave={onSave}
            onEnterHosynQ={onEnterHosynQ}
          />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;

    // Header
    expect(root.findByProps({ children: 'Interests and activities' })).toBeTruthy();
    expect(root.findByProps({ children: 'Priya · Section 5 of 5' })).toBeTruthy();

    // Banner
    expect(
      root.findByProps({
        children:
          'Used later for suggestions, like weekend plans and gift ideas.',
      }),
    ).toBeTruthy();

    // Categories
    expect(root.findByProps({ children: 'SPORTS' })).toBeTruthy();
    expect(root.findByProps({ children: 'MUSIC' })).toBeTruthy();
    expect(root.findByProps({ children: 'READING' })).toBeTruthy();
    expect(root.findByProps({ children: 'GAMING' })).toBeTruthy();
    expect(root.findByProps({ children: 'TRAVEL' })).toBeTruthy();
    expect(root.findByProps({ children: 'COOKING' })).toBeTruthy();

    // Chips
    expect(root.findByProps({ children: 'Yoga' })).toBeTruthy();
    expect(root.findByProps({ children: 'Badminton' })).toBeTruthy();
    expect(root.findByProps({ children: 'Walking' })).toBeTruthy();
    expect(root.findByProps({ children: 'Bollywood' })).toBeTruthy();
    expect(root.findByProps({ children: 'Ghazals' })).toBeTruthy();
    expect(root.findByProps({ children: 'Fiction' })).toBeTruthy();
    expect(root.findByProps({ children: 'Board games' })).toBeTruthy();
    expect(root.findByProps({ children: 'Hill stations' })).toBeTruthy();
    expect(root.findByProps({ children: 'Baking' })).toBeTruthy();
    expect(root.findByProps({ children: 'Regional Indian' })).toBeTruthy();

    // Add something else
    expect(root.findByProps({ children: 'Add something else' })).toBeTruthy();

    // Save button
    expect(root.findByProps({ children: 'Save' })).toBeTruthy();
  });
});

