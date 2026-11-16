import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import YourBriefScreen from '../src/screens/mainScreens/yourBriefScreen/YourBriefScreen';

const mockMetrics = {
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
  frame: { x: 0, y: 0, width: 375, height: 812 },
};

const renderWithProvider = async (component: React.ReactElement) => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={mockMetrics}>
        {component}
      </SafeAreaProvider>
    );
  });
  return renderer!;
};

describe('YourBriefScreen', () => {
  it('renders Today view correctly', async () => {
    const renderer = await renderWithProvider(
      <YourBriefScreen initialTimeframe="today" />
    );
    expect(renderer.root).toBeTruthy();
  });

  it('renders Week view correctly', async () => {
    const renderer = await renderWithProvider(
      <YourBriefScreen initialTimeframe="week" />
    );
    expect(renderer.root).toBeTruthy();
  });

  it('renders Month view correctly', async () => {
    const renderer = await renderWithProvider(
      <YourBriefScreen initialTimeframe="month" />
    );
    expect(renderer.root).toBeTruthy();
  });

  it('renders Loading state correctly', async () => {
    const renderer = await renderWithProvider(
      <YourBriefScreen forceLoading />
    );
    expect(renderer.root).toBeTruthy();
  });

  it('renders Empty state correctly', async () => {
    const renderer = await renderWithProvider(
      <YourBriefScreen isEmpty />
    );
    expect(renderer.root).toBeTruthy();
  });
});
