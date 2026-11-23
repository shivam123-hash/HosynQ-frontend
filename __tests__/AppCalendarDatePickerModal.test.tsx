import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppCalendarDatePickerModal from '../src/components/AppCalendarDatePickerModal';

const renderModal = async (ui: React.ReactElement) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        {ui}
      </SafeAreaProvider>
    );
  });
  return renderer;
};

describe('AppCalendarDatePickerModal', () => {
  it('renders modal with title, formatted selected date chip, month and days grid', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderModal(
      <AppCalendarDatePickerModal
        visible={true}
        title="Date of birth"
        initialDate="14 Mar 2022"
        maximumDate={new Date(2026, 10, 23)}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);

    expect(texts).toContain('Date of birth');
    expect(texts).toContain('14 Mar 2022');
    expect(texts).toContain('March 2022');
    expect(texts).toContain('M');
    expect(texts).toContain('T');
    expect(texts).toContain('W');
    expect(texts).toContain('Done');
  });

  it('navigates months when clicking next and prev month chevrons', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderModal(
      <AppCalendarDatePickerModal
        visible={true}
        title="Date of birth"
        initialDate="14 Mar 2022"
        maximumDate={new Date(2026, 10, 23)}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const nextBtn = buttons.find((b) => b.props.accessibilityLabel === 'Next month');
    const prevBtn = buttons.find((b) => b.props.accessibilityLabel === 'Previous month');

    expect(nextBtn).toBeDefined();
    expect(prevBtn).toBeDefined();

    // Click Next month -> April 2022
    await ReactTestRenderer.act(async () => {
      nextBtn?.props.onPress();
    });

    let texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('April 2022');

    // Click Prev month -> March 2022
    await ReactTestRenderer.act(async () => {
      prevBtn?.props.onPress();
    });

    texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('March 2022');
  });

  it('selects a day and confirms with formatted date and iso date when Done is pressed', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderModal(
      <AppCalendarDatePickerModal
        visible={true}
        title="Date of birth"
        initialDate="14 Mar 2022"
        maximumDate={new Date(2026, 10, 23)}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    // Select day 20
    const dayBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((b) => b.props.accessibilityLabel === '20 March 2022');
    expect(dayBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      dayBtn?.props.onPress();
    });

    // Top chip should update to 20 Mar 2022
    let texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('20 Mar 2022');

    // Press Done
    const doneBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((b) => b.props.accessibilityLabel === 'Done');
    expect(doneBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      doneBtn?.props.onPress();
    });

    expect(onConfirm).toHaveBeenCalledWith(
      expect.any(Date),
      '20 Mar 2022',
      '2022-03-20'
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('switches to Year & Month picker when tapping month/year title', async () => {
    const renderer = await renderModal(
      <AppCalendarDatePickerModal
        visible={true}
        title="Date of birth"
        initialDate="14 Mar 2022"
        maximumDate={new Date(2026, 10, 23)}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    const monthTitleBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((b) =>
        b.props.accessibilityLabel?.includes('Select year or month')
      );
    expect(monthTitleBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      monthTitleBtn?.props.onPress();
    });

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Select Year & Month');
    expect(texts).toContain('MONTH');
    expect(texts).toContain('YEAR');
  });
});
