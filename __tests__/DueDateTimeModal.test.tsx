import React from 'react';
import { Text, TouchableOpacity, Switch } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DueDateTimeModal from '../src/screens/mainScreens/tasksScreen/components/DueDateTimeModal';

const mockMetrics = {
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
  frame: { x: 0, y: 0, width: 375, height: 812 },
};

const renderModal = async (
  props: React.ComponentProps<typeof DueDateTimeModal>
) => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={mockMetrics}>
        <DueDateTimeModal {...props} />
      </SafeAreaProvider>
    );
  });
  return renderer!;
};

describe('DueDateTimeModal - Fully Functional Calendar', () => {
  it('renders modal with dynamic calendar and time controls', async () => {
    const onCloseMock = jest.fn();
    const onSaveMock = jest.fn();

    const renderer = await renderModal({
      visible: true,
      initialDate: 'Mon, 2 Nov',
      initialTime: '6:00 PM',
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('When is it due?');
    expect(texts).toContain('November 2026');
    expect(texts).toContain('Today');
    expect(texts).toContain('Tomorrow');
    expect(texts).toContain('This weekend');
    expect(texts).toContain('Mon, 2 Nov');
    expect(texts).toContain('Morning 9:00');
    expect(texts).toContain('Afternoon 2:00');
    expect(texts).toContain('Evening 6:00');
    expect(texts).toContain('No specific time');
    expect(texts).toContain('Done');
  });

  it('navigates to next and previous months when chevron buttons are clicked', async () => {
    const renderer = await renderModal({
      visible: true,
      initialDate: 'Mon, 2 Nov',
      initialTime: '6:00 PM',
      onClose: jest.fn(),
      onSave: jest.fn(),
    });

    // Find next month button
    const nextBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Next month');
    expect(nextBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      nextBtn?.props.onPress();
    });

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('December 2026');

    // Find previous month button
    const prevBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Previous month');
    expect(prevBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      prevBtn?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('November 2026');
  });

  it('selects a date on the calendar grid and updates formatted pill', async () => {
    const renderer = await renderModal({
      visible: true,
      initialDate: 'Mon, 2 Nov',
      initialTime: '6:00 PM',
      onClose: jest.fn(),
      onSave: jest.fn(),
    });

    // Find day cell for 15 November 2026
    const dayCell = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === '15 November 2026');
    expect(dayCell).toBeTruthy();

    await ReactTestRenderer.act(() => {
      dayCell?.props.onPress();
    });

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('Sun, 15 Nov');
  });

  it('selects Today, Tomorrow, and This weekend from quick chips', async () => {
    const renderer = await renderModal({
      visible: true,
      initialDate: 'Mon, 2 Nov',
      initialTime: '6:00 PM',
      onClose: jest.fn(),
      onSave: jest.fn(),
    });

    const todayChip = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Due today');
    expect(todayChip).toBeTruthy();

    await ReactTestRenderer.act(() => {
      todayChip?.props.onPress();
    });

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('Fri, 30 Oct');

    const tomorrowChip = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Due tomorrow');
    expect(tomorrowChip).toBeTruthy();

    await ReactTestRenderer.act(() => {
      tomorrowChip?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('Sat, 31 Oct');
  });

  it('toggles no specific time switch and calls onSave on Done', async () => {
    const onSaveMock = jest.fn();
    const onCloseMock = jest.fn();

    const renderer = await renderModal({
      visible: true,
      initialDate: 'Mon, 2 Nov',
      initialTime: '6:00 PM',
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    // Toggle switch on
    const switchEl = renderer.root.findByType(Switch);
    await ReactTestRenderer.act(() => {
      switchEl.props.onValueChange(true);
    });

    // Click Done button
    const doneBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Done');
    expect(doneBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      doneBtn?.props.onPress();
    });

    expect(onSaveMock).toHaveBeenCalledWith('Mon, 2 Nov', 'Mon, 2 Nov', undefined);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});

