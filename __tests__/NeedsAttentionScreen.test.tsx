import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NeedsAttentionScreen from '../src/screens/mainScreens/needsAttentionScreen/NeedsAttentionScreen';

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

describe('NeedsAttentionScreen', () => {
  it('renders correctly with default all filter', async () => {
    const renderer = await renderWithProvider(<NeedsAttentionScreen />);
    expect(renderer.root).toBeTruthy();
  });

  it('renders overdue filter correctly', async () => {
    const renderer = await renderWithProvider(
      <NeedsAttentionScreen initialFilter="overdue" />
    );
    expect(renderer.root).toBeTruthy();
  });

  it('renders due soon filter correctly', async () => {
    const renderer = await renderWithProvider(
      <NeedsAttentionScreen initialFilter="due_soon" />
    );
    expect(renderer.root).toBeTruthy();
  });

  it('renders renewals filter correctly', async () => {
    const renderer = await renderWithProvider(
      <NeedsAttentionScreen initialFilter="renewals" />
    );
    expect(renderer.root).toBeTruthy();
  });

  it('renders important dates filter correctly', async () => {
    const renderer = await renderWithProvider(
      <NeedsAttentionScreen initialFilter="important_dates" />
    );
    expect(renderer.root).toBeTruthy();
  });
});

