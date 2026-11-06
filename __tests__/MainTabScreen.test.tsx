import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainTabScreen from '../src/screens/mainScreens/mainTabScreen/MainTabScreen';

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

describe('MainTabScreen - Unified Navigation Bar', () => {
  it('renders Home tab with single bottom navigation bar by default', async () => {
    const renderer = await renderWithProvider(<MainTabScreen />);
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    // Home content
    expect(texts).toContain('HosynQ');
    expect(texts).toContain('Good afternoon');
    expect(texts).toContain('Friday, 30 October');
  });

  it('renders Tasks tab when initialTab="tasks"', async () => {
    const renderer = await renderWithProvider(
      <MainTabScreen initialTab="tasks" />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    // Tasks content
    expect(texts).toContain('Tasks');
    expect(texts).toContain('Lists');
    expect(texts).toContain('Everyone');
    expect(texts).toContain('Buy Diwali sweets and diyas');
  });

  it('renders Calendar tab when initialTab="calendar"', async () => {
    const renderer = await renderWithProvider(
      <MainTabScreen initialTab="calendar" />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('HosynQ');
    expect(texts).toContain('Friday, 30 October');
    expect(texts).toContain('Upcoming family events');
  });

  it('renders Chat tab when initialTab="chat"', async () => {
    const renderer = await renderWithProvider(
      <MainTabScreen initialTab="chat" />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('HosynQ');
    expect(texts).toContain('The Sharma Family');
    expect(texts).toContain('Family General');
  });
});

