import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  AddSheetModal,
  CreateReminderModal,
  ScanDocumentModal,
  AskHosynQModal,
  UploadDocumentModal,
  ConfirmationToast,
} from '../src/screens/mainScreens/addFlow';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderWithProvider = async (element: React.ReactElement) => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        {element}
      </SafeAreaProvider>
    );
  });
  return renderer!;
};

describe('Add Flow Components (ADD-01 to ADD-25)', () => {
  it('renders AddSheetModal (ADD-01) with 6 grid actions and AI prompt', async () => {
    const onSelectTask = jest.fn();
    const onSelectEvent = jest.fn();
    const onSelectReminder = jest.fn();
    const onSelectList = jest.fn();
    const onSelectScan = jest.fn();
    const onSelectUpload = jest.fn();
    const onSelectAsk = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <AddSheetModal
        visible={true}
        onClose={onClose}
        onSelectTask={onSelectTask}
        onSelectEvent={onSelectEvent}
        onSelectReminder={onSelectReminder}
        onSelectList={onSelectList}
        onSelectScan={onSelectScan}
        onSelectUpload={onSelectUpload}
        onSelectAsk={onSelectAsk}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Add to HosynQ');
    expect(texts).toContain('Ask HosynQ to add something');
    expect(texts).toContain('Task');
    expect(texts).toContain('Event');
    expect(texts).toContain('Reminder');
    expect(texts).toContain('List');
    expect(texts).toContain('Scan');
    expect(texts).toContain('Upload');

    // Tap on Reminder
    const reminderBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Add Reminder');
    expect(reminderBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      reminderBtn?.props.onPress();
    });
    expect(onSelectReminder).toHaveBeenCalled();
  });

  it('renders CreateReminderModal (ADD-02) and saves reminder', async () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <CreateReminderModal
        visible={true}
        onClose={onClose}
        onSaveReminder={onSave}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('New reminder');
    expect(texts).toContain('Remind me to...');
    expect(texts).toContain('At a time');
    expect(texts).toContain('At a place');
    expect(texts).toContain('This evening, 7:00 PM');
    expect(texts).toContain('Set reminder');

    const submitBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Set reminder');
    expect(submitBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      submitBtn?.props.onPress();
    });
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Call the plumber about the kitchen tap',
        type: 'time',
        whenText: 'This evening, 7:00 PM',
      })
    );
  });

  it('renders ScanDocumentModal (ADD-05 -> ADD-10 -> ADD-14 -> ADD-17)', async () => {
    const onItemsAdded = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <ScanDocumentModal
        visible={true}
        onClose={onClose}
        onItemsAdded={onItemsAdded}
      />
    );

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Scan document');
    expect(texts).toContain('Edges found. Hold steady...');

    // Tap Done to advance stage to reading
    const doneBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t.findAllByType(Text).find((txt) => txt.props.children === 'Done');
        return Boolean(textChild);
      });
    expect(doneBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      doneBtn?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Reading your document');
    expect(texts).toContain('Uploaded securely');
  });

  it('renders AskHosynQModal (ADD-19) with suggestion chips and proposal workflow', async () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <AskHosynQModal
        visible={true}
        onClose={onClose}
        onConfirmAdded={onConfirm}
      />
    );

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Ask HosynQ');
    expect(texts).toContain('What should I add?');
    expect(texts).toContain('Remind Dadi about her BP tablets at 9 PM every day');

    // Tap suggestion
    const suggestionBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t.findAllByType(Text).find((txt) =>
          typeof txt.props.children === 'string' &&
          txt.props.children.includes('Rohan picks up Anaya')
        );
        return Boolean(textChild);
      });
    expect(suggestionBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      suggestionBtn?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Here’s what I’ll add. Check it, then confirm.');
    expect(texts).toContain('Confirm');

    // Tap Confirm
    const confirmBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t.findAllByType(Text).find((txt) => txt.props.children === 'Confirm');
        return Boolean(textChild);
      });
    expect(confirmBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      confirmBtn?.props.onPress();
    });

    expect(onConfirm).toHaveBeenCalled();
  });

  it('renders ConfirmationToast (ADD-03) with message and actions', async () => {
    const onUndo = jest.fn();
    const onView = jest.fn();

    const renderer = await renderWithProvider(
      <ConfirmationToast
        visible={true}
        message="Reminder set for 7:00 PM today"
        type="success"
        onUndo={onUndo}
        onView={onView}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Reminder set for 7:00 PM today');
    expect(texts).toContain('View');
    expect(texts).toContain('Undo');
  });

  it('renders UploadDocumentModal (ADD-07)', async () => {
    const onFileSelected = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <UploadDocumentModal
        visible={true}
        onClose={onClose}
        onFileSelected={onFileSelected}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Photos or Files');
    expect(texts).toContain("St. Mary's School circular.pdf");
  });
});
