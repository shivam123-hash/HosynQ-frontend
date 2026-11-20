import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import VaccinationSegmentedTabs from '../src/screens/completeProfileScreens/components/VaccinationSegmentedTabs';
import TabTransitionView from '../src/screens/completeProfileScreens/components/TabTransitionView';

describe('VaccinationSegmentedTabs & TabTransitionView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    ReactTestRenderer.act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders VaccinationSegmentedTabs and switches active tab on press', () => {
    const handleTabChange = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <VaccinationSegmentedTabs
          activeTab="vaccines"
          onTabChange={handleTabChange}
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Vaccines' })).toBeTruthy();
    expect(root.findByProps({ children: 'Growth' })).toBeTruthy();
    expect(root.findByProps({ children: 'Milestones' })).toBeTruthy();

    // Trigger onLayout to set container width for animated sliding pill
    const container = root.findByProps({ accessibilityLabel: 'Vaccines' }).parent;
    ReactTestRenderer.act(() => {
      container?.props.onLayout?.({
        nativeEvent: { layout: { width: 350, height: 48, x: 0, y: 0 } },
      });
    });

    const growthButton = root.findByProps({ accessibilityLabel: 'Growth' });
    ReactTestRenderer.act(() => {
      growthButton.props.onPress();
    });

    expect(handleTabChange).toHaveBeenCalledWith('growth');
  });

  it('renders TabTransitionView and handles tab switching transitions smoothly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <TabTransitionView
          activeKey="vaccines"
          tabOrder={['vaccines', 'growth', 'milestones']}
        >
          <Text>Vaccines Content</Text>
        </TabTransitionView>,
      );
    });

    expect(renderer!.root.findByProps({ children: 'Vaccines Content' })).toBeTruthy();

    // Switch activeKey to 'growth'
    ReactTestRenderer.act(() => {
      renderer.update(
        <TabTransitionView
          activeKey="growth"
          tabOrder={['vaccines', 'growth', 'milestones']}
        >
          <Text>Growth Content</Text>
        </TabTransitionView>,
      );
    });

    expect(renderer!.root.findByProps({ children: 'Growth Content' })).toBeTruthy();
  });
});

