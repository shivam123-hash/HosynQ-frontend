import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import InterestsDetailsScreen from '../src/screens/completeProfileScreens/innerScreens/InterestsDetailsScreen';
import { CompleteProfileStep5Screen } from '../src/screens/completeProfileScreens';

// Mock fetchLifeProfileSectionThunk to avoid dangling network calls in tests
jest.mock('../src/redux', () => {
  const actual = jest.requireActual('../src/redux');
  return {
    ...actual,
    fetchLifeProfileSectionThunk: jest.fn(() => ({
      type: 'mock/fetchLifeProfileSection',
      unwrap: () => Promise.resolve({ data: { interests: [] } }),
    })),
  };
});

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('InterestsDetailsScreen', () => {
  test('renders saved favorites categorized with check icons and count badge', () => {
    const onBack = jest.fn();
    const onEditPress = jest.fn();

    const sampleInterests = [
      'Yoga',
      'Badminton',
      'Bollywood',
      'Fiction',
      'Board games',
      'Hill stations',
      'Pottery', // Custom favorite
    ];

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <InterestsDetailsScreen
            userName="Priya"
            interests={sampleInterests}
            onBack={onBack}
            onEditPress={onEditPress}
          />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;

    // Header
    expect(root.findByProps({ children: 'Interests and activities' })).toBeTruthy();
    expect(root.findByProps({ children: 'Priya · Section 5 of 5' })).toBeTruthy();

    // Banner & Count
    expect(
      root.findByProps({
        children:
          'Used later for suggestions, like weekend plans and gift ideas.',
      }),
    ).toBeTruthy();
    expect(root.findByProps({ children: '7 favorites saved' })).toBeTruthy();

    // Category titles
    expect(root.findByProps({ children: 'SPORTS' })).toBeTruthy();
    expect(root.findByProps({ children: 'MUSIC' })).toBeTruthy();
    expect(root.findByProps({ children: 'READING' })).toBeTruthy();
    expect(root.findByProps({ children: 'GAMING' })).toBeTruthy();
    expect(root.findByProps({ children: 'TRAVEL' })).toBeTruthy();
    expect(root.findByProps({ children: 'CUSTOM FAVORITES' })).toBeTruthy();

    // Specific chips
    expect(root.findByProps({ children: 'Yoga' })).toBeTruthy();
    expect(root.findByProps({ children: 'Badminton' })).toBeTruthy();
    expect(root.findByProps({ children: 'Bollywood' })).toBeTruthy();
    expect(root.findByProps({ children: 'Fiction' })).toBeTruthy();
    expect(root.findByProps({ children: 'Board games' })).toBeTruthy();
    expect(root.findByProps({ children: 'Hill stations' })).toBeTruthy();
    expect(root.findByProps({ children: 'Pottery' })).toBeTruthy();

    // Edit button
    const editBtn = root.findByProps({ title: 'Edit interests' });
    expect(editBtn).toBeTruthy();
    ReactTestRenderer.act(() => {
      editBtn.props.onPress();
    });
    expect(onEditPress).toHaveBeenCalledTimes(1);

    // Header edit button
    const headerEditBtn = root.findByProps({ accessibilityLabel: 'Edit interests' });
    expect(headerEditBtn).toBeTruthy();
    ReactTestRenderer.act(() => {
      headerEditBtn.props.onPress();
    });
    expect(onEditPress).toHaveBeenCalledTimes(2);

    // Back button
    const backBtn = root.findByProps({ accessibilityLabel: 'Go back' });
    expect(backBtn).toBeTruthy();
    ReactTestRenderer.act(() => {
      backBtn.props.onPress();
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('renders empty state when no interests are selected', () => {
    const onEditPress = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <InterestsDetailsScreen
            userName="Aarav"
            interests={[]}
            onEditPress={onEditPress}
          />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;

    expect(root.findByProps({ children: 'No interests selected yet' })).toBeTruthy();
    const chooseBtn = root.findByProps({ title: 'Choose favorites' });
    expect(chooseBtn).toBeTruthy();
    ReactTestRenderer.act(() => {
      chooseBtn.props.onPress();
    });
    expect(onEditPress).toHaveBeenCalledTimes(1);
  });

  test('CompleteProfileStep5Screen defaults to details mode and switches to form on edit', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <CompleteProfileStep5Screen />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;

    // In details mode initially
    expect(root.findByProps({ children: 'Interests and activities' })).toBeTruthy();
    const chooseBtn = root.findByProps({ title: 'Choose favorites' });
    expect(chooseBtn).toBeTruthy();

    // Click edit/choose favorites -> switches to form mode
    ReactTestRenderer.act(() => {
      chooseBtn.props.onPress();
    });

    // Now in form mode -> 'Add something else' should be visible
    expect(root.findByProps({ children: 'Add something else' })).toBeTruthy();
    expect(root.findByProps({ children: 'Save' })).toBeTruthy();
  });

  test('extractInterestsList correctly parses all backend shapes', () => {
    const { extractInterestsList } = require('../src/screens/completeProfileScreens/innerScreens/InterestsDetailsScreen');

    // Case 1: Plain array
    expect(extractInterestsList(['Yoga', 'Music'])).toEqual(['Yoga', 'Music']);

    // Case 2: Nested data.interests as array
    expect(extractInterestsList({ data: { interests: ['Yoga', 'Music'] } })).toEqual(['Yoga', 'Music']);

    // Case 3: Nested data.interests.interests as array
    expect(extractInterestsList({ data: { interests: { interests: ['Yoga', 'Music'] } } })).toEqual(['Yoga', 'Music']);

    // Case 4: Direct interests object with interests array
    expect(extractInterestsList({ interests: { interests: ['Yoga'] } })).toEqual(['Yoga']);

    // Case 5: Empty or undefined
    expect(extractInterestsList(null)).toEqual([]);
    expect(extractInterestsList({})).toEqual([]);
  });
});
