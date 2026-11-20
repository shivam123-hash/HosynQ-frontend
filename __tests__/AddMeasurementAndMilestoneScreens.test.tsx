import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Animated } from 'react-native';
import {
  AddMeasurementScreen,
  AddMilestoneScreen,
} from '../src/screens/completeProfileScreens';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('AddMeasurementScreen', () => {
  beforeAll(() => {
    jest.spyOn(Animated, 'timing').mockImplementation(
      () =>
        ({
          start: (cb?: any) => cb && cb({ finished: true }),
          stop: () => {},
          reset: () => {},
        } as any),
    );
  });

  it('renders correctly with default measurement values and saves', async () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <AddMeasurementScreen
            childName="Aarav"
            initialData={{ height: 133.5, weight: 28.4 }}
            onClose={handleClose}
            onSave={handleSave}
          />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Add measurement' })).toBeTruthy();
    expect(root.findByProps({ children: 'Aarav · Growth' })).toBeTruthy();
    expect(root.findByProps({ children: 'Height' })).toBeTruthy();
    expect(root.findByProps({ children: 'Weight' })).toBeTruthy();
    expect(root.findByProps({ children: 'Remind me to measure' })).toBeTruthy();

    const saveButton = root.findByProps({
      title: 'Save measurement',
    });
    expect(saveButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      await saveButton.props.onPress();
    });

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        height: 133.5,
        weight: 28.4,
        unit: 'metric',
      }),
    );
    expect(handleClose).toHaveBeenCalled();
  });
});

describe('AddMilestoneScreen', () => {
  it('renders correctly with default milestone values and saves', async () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <AddMilestoneScreen
            childName="Aarav"
            initialData={{ title: 'Swam a full length of the pool' }}
            onClose={handleClose}
            onSave={handleSave}
          />
        </SafeAreaProvider>,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Add milestone' })).toBeTruthy();
    expect(root.findByProps({ children: 'Aarav · Milestones' })).toBeTruthy();
    expect(root.findByProps({ children: 'What happened?' })).toBeTruthy();
    expect(root.findByProps({ children: 'TYPE' })).toBeTruthy();
    expect(root.findByProps({ children: 'Physical' })).toBeTruthy();
    expect(root.findByProps({ children: 'Share in Family Pulse' })).toBeTruthy();

    const saveButton = root.findByProps({
      title: 'Save milestone',
    });
    expect(saveButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      await saveButton.props.onPress();
    });

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Swam a full length of the pool',
        type: 'Physical',
        shareInPulse: true,
      }),
    );
    expect(handleClose).toHaveBeenCalled();
  });
});
