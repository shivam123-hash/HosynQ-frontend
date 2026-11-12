import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
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

    expect(texts).toContain('Calendar');
    expect(texts).toContain('Day');
    expect(texts).toContain('Week');
    expect(texts).toContain('Month');
    expect(texts).toContain('Friday, 30 October');
    expect(texts).toContain('Aarav’s PTM');
  });

  it('switches to Calendar from Tasks tab and filters Day, Week, Month seamlessly', async () => {
    const renderer = await renderWithProvider(
      <MainTabScreen initialTab="tasks" />
    );

    // Switch to Calendar tab via bottom nav bar
    const calendarTabTouch = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Calendar tab');
    expect(calendarTabTouch).toBeTruthy();

    await ReactTestRenderer.act(() => {
      calendarTabTouch?.props.onPress();
    });

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('Calendar');
    expect(texts).toContain('Day');
    expect(texts).toContain('Week');
    expect(texts).toContain('Month');

    // Switch to Week View
    const weekTab = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Week view');
    expect(weekTab).toBeTruthy();

    await ReactTestRenderer.act(() => {
      weekTab?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('26 Oct – 1 Nov');
    expect(texts).toContain('MON');
    expect(texts).toContain('Anaya’s dance class');

    // Switch to Month View
    const monthTab = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Month view');
    expect(monthTab).toBeTruthy();

    await ReactTestRenderer.act(() => {
      monthTab?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('October 2026');
    expect(texts).toContain('Event');
    expect(texts).toContain('Task due');
  });

  it('renders Chat tab when initialTab="chat"', async () => {
    const renderer = await renderWithProvider(
      <MainTabScreen initialTab="chat" />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('HosynQ');
    expect(texts).toContain('Chats');
    expect(texts).toContain('Family chat');
    expect(texts).toContain('Just Us');
  });

  it('opens CreateTaskModal when tapping "Add task" on homepage and NOT on bottom dock +', async () => {
    const renderer = await renderWithProvider(<MainTabScreen initialTab="home" />);

    // Tap center FAB '+' button on the bottom nav dock
    const fabButton = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Add new item');
    expect(fabButton).toBeTruthy();

    await ReactTestRenderer.act(() => {
      fabButton?.props.onPress?.();
    });

    // Verify CreateTaskModal did NOT open (e.g. "Create task" title is not present)
    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).not.toContain('Create task');
    // But Add to HosynQ sheet IS open!
    expect(texts).toContain('Add to HosynQ');

    // Tap "Add task" button on homepage QuickActionsBar
    const addTaskHomeBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t.findAllByType(Text).find((txt) => txt.props.children === 'Add task');
        return Boolean(textChild);
      });
    expect(addTaskHomeBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      addTaskHomeBtn?.props.onPress();
    });

    // Verify CreateTaskModal opened
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Create task');
  });
});

