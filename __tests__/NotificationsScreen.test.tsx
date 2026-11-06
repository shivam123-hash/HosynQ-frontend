import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NotificationsScreen from '../src/screens/mainScreens/notificationsScreen/NotificationsScreen';

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

describe('NotificationsScreen', () => {
  it('renders populated notifications screen correctly with defaults', async () => {
    const onBackMock = jest.fn();
    const renderer = await renderWithProvider(
      <NotificationsScreen onBack={onBackMock} />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Notifications');
    expect(texts).toContain('Mark all read');
    expect(texts).toContain('All');
    expect(texts).toContain('Unread 3');
    expect(texts).toContain('Tasks');
    expect(texts).toContain('Family');
    expect(texts).toContain('TODAY');
    expect(texts).toContain('YESTERDAY');
    expect(texts).toContain('Meera wants to join The Sharma Family');
    expect(texts).toContain('Approve');
    expect(texts).toContain('Decline');
    expect(texts).toContain('Rohan assigned you a task');
  });

  it('renders empty notifications state correctly when isEmpty={true}', async () => {
    const renderer = await renderWithProvider(
      <NotificationsScreen isEmpty={true} />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('You’re all caught up');
    expect(texts).toContain(
      'New tasks, reminders and family updates will show up here.'
    );
    expect(texts).toContain('Notification preferences');
    expect(texts).not.toContain('Mark all read');
    expect(texts).toContain('Unread');
  });

  it('renders tasks filter correctly', async () => {
    const renderer = await renderWithProvider(
      <NotificationsScreen initialFilter="tasks" />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Rohan assigned you a task');
    expect(texts).toContain('Anaya completed a task');
    expect(texts).not.toContain('Meera wants to join The Sharma Family');
  });

  it('renders family filter correctly', async () => {
    const renderer = await renderWithProvider(
      <NotificationsScreen initialFilter="family" />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Meera wants to join The Sharma Family');
    expect(texts).toContain('Aarav has reached St. Mary’s School');
    expect(texts).toContain('Dadi shared a list');
    expect(texts).not.toContain('Rohan assigned you a task');
  });
});

