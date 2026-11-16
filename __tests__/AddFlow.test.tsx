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
  FamilyVaultModal,
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
        initialPermission="granted"
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

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('renders Camera Permission Prompt (ADD-04) and opens camera on allow', async () => {
    const onItemsAdded = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <ScanDocumentModal
        visible={true}
        onClose={onClose}
        onItemsAdded={onItemsAdded}
        initialPermission="not_determined"
      />
    );

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Let HosynQ use your camera');
    expect(texts).toContain('Allow camera');
    expect(texts).toContain('Not now');

    // Tap Allow camera
    const allowBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t
          .findAllByType(Text)
          .find((txt) => txt.props.children === 'Allow camera');
        return Boolean(textChild);
      });
    expect(allowBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      allowBtn?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Scan document');
    expect(texts).toContain('Edges found. Hold steady...');

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('renders Camera Permission Denied (ADD-04b) and allows file upload fallback', async () => {
    const onItemsAdded = jest.fn();
    const onClose = jest.fn();
    const onOpenUpload = jest.fn();

    const renderer = await renderWithProvider(
      <ScanDocumentModal
        visible={true}
        onClose={onClose}
        onItemsAdded={onItemsAdded}
        onOpenUpload={onOpenUpload}
        initialPermission="denied"
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Camera is off for HosynQ');
    expect(texts).toContain('Open Settings');
    expect(texts).toContain('Upload a file instead');

    // Tap Upload a file instead
    const uploadInsteadBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t
          .findAllByType(Text)
          .find((txt) => txt.props.children === 'Upload a file instead');
        return Boolean(textChild);
      });
    expect(uploadInsteadBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      uploadInsteadBtn?.props.onPress();
    });

    expect(onClose).toHaveBeenCalled();
    expect(onOpenUpload).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('renders AskHosynQModal (ADD-19) with suggestion chips and proposal workflow', async () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <AskHosynQModal
        visible={true}
        onClose={onClose}
        onConfirmAdded={onConfirm}
        thinkingDurationMs={0}
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

  it('renders Photos/files permission prompt (ADD-06)', async () => {
    const onFileSelected = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <UploadDocumentModal
        visible={true}
        onClose={onClose}
        onFileSelected={onFileSelected}
        initialPermissionStatus="prompt"
      />
    );

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('SYSTEM PROMPT · SHOWN BY THE PHONE');
    expect(texts).toContain('“HosynQ” would like to access your photos');
    expect(texts).toContain('HOSYNQ WRITES THIS LINE');
    expect(texts).toContain('HosynQ only looks at a photo when you choose it to upload.');
    expect(texts).toContain('Select Photos...');
    expect(texts).toContain('Allow Access to All Photos');

    // Tap "Allow Access to All Photos"
    const allowBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t
          .findAllByType(Text)
          .find((txt) => txt.props.children === 'Allow Access to All Photos');
        return Boolean(textChild);
      });
    expect(allowBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      allowBtn?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Photos or Files');
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

    // Tap Choose from Photos quick action
    const photoBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t
          .findAllByType(Text)
          .find((txt) => txt.props.children === 'Choose from Photos');
        return Boolean(textChild);
      });
    expect(photoBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      photoBtn?.props.onPress();
    });

    expect(onFileSelected).toHaveBeenCalledWith('IMG_2041.jpg');
  });

  it('renders File not supported error screen (ADD-08) when unsupported file is chosen', async () => {
    const onFileSelected = jest.fn();
    const onClose = jest.fn();
    const onScanWithCamera = jest.fn();

    const renderer = await renderWithProvider(
      <UploadDocumentModal
        visible={true}
        onClose={onClose}
        onFileSelected={onFileSelected}
        onScanWithCamera={onScanWithCamera}
        initialError="unsupported"
      />
    );

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Upload');
    expect(texts).toContain('Choose a photo or PDF');
    expect(texts).toContain('PDF, JPG or JPEG · up to 25 MB');
    expect(texts).toContain('Electricity_bills.xlsx');
    expect(texts).toContain('Excel spreadsheet · 240 KB');
    expect(texts).toContain('This file type isn’t supported');
    expect(texts).toContain(
      'HosynQ can read PDF, JPG and JPEG files. Save the sheet as a PDF and try again.'
    );
    expect(texts).toContain('Choose another file');
    expect(texts).toContain('Scan with camera instead');

    // Tap "Scan with camera instead"
    const scanCameraBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t
          .findAllByType(Text)
          .find((txt) => txt.props.children === 'Scan with camera instead');
        return Boolean(textChild);
      });
    expect(scanCameraBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      scanCameraBtn?.props.onPress();
    });

    expect(onClose).toHaveBeenCalled();
    expect(onScanWithCamera).toHaveBeenCalled();

    // Tap "Choose another file" to return to picker
    const chooseAnotherBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t
          .findAllByType(Text)
          .find((txt) => txt.props.children === 'Choose another file');
        return Boolean(textChild);
      });
    expect(chooseAnotherBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      chooseAnotherBtn?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Photos or Files');

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('renders File too large error screen (ADD-09) when file exceeds size limit', async () => {
    const onFileSelected = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <UploadDocumentModal
        visible={true}
        onClose={onClose}
        onFileSelected={onFileSelected}
        initialError="too_large"
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Upload');
    expect(texts).toContain('School_report_full_scan.pdf');
    expect(texts).toContain('PDF · 48 MB');
    expect(texts).toContain('This file is too large');
    expect(texts).toContain(
      'Files can be up to 25 MB. Try scanning fewer pages, or split the PDF.'
    );
    expect(texts).toContain('Choose another file');
    expect(texts).toContain('Scan with camera instead');

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('renders Saved, no actions found (ADD-11) when photo has no actions', async () => {
    const onItemsAdded = jest.fn();
    const onClose = jest.fn();
    const onTypeDetails = jest.fn();
    const onOpenVault = jest.fn();

    const renderer = await renderWithProvider(
      <ScanDocumentModal
        visible={true}
        onClose={onClose}
        onItemsAdded={onItemsAdded}
        onTypeDetailsMyself={onTypeDetails}
        onOpenVault={onOpenVault}
        scannedFileName="IMG_2041.jpg"
      />
    );

    // 1. Verify pending screen (ADD-10 · Reading your document) is shown first
    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Reading your document');
    expect(texts).toContain('Uploaded securely');
    expect(texts).toContain('Reading the text');
    expect(texts).toContain('Finding dates, people and actions');
    expect(texts).toContain('70%');

    // 2. Complete reading doc -> transitions to saved screen (ADD-11)
    const readingCard = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Complete reading document');
    expect(readingCard).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      readingCard?.props.onPress();
    });

    // 3. Verify Saved, no actions found screen is shown
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Saved. Nothing to add.');
    expect(texts).toContain(
      'We didn’t find any dates, tasks or reminders in this photo. It’s saved in Family Vault › Photos.'
    );
    expect(texts).toContain('IMG_2041.jpg');
    expect(texts).toContain('Done');
    expect(texts).toContain('Open in Family Vault');
    expect(texts).toContain('Add a task anyway');

    // Tap "Add a task anyway"
    const addTaskBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t
          .findAllByType(Text)
          .find((txt) => txt.props.children === 'Add a task anyway');
        return Boolean(textChild);
      });
    expect(addTaskBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      addTaskBtn?.props.onPress();
    });

    expect(onTypeDetails).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('renders Couldn’t read this (ADD-12) when photo is blurry or dark', async () => {
    const onItemsAdded = jest.fn();
    const onClose = jest.fn();
    const onTypeDetails = jest.fn();

    const renderer = await renderWithProvider(
      <ScanDocumentModal
        visible={true}
        onClose={onClose}
        onItemsAdded={onItemsAdded}
        onTypeDetailsMyself={onTypeDetails}
        scannedFileName="Blurry_photo_document.jpg"
        initialPermission="granted"
      />
    );

    // 1. Verify pending screen (ADD-10 · Reading your document) is shown first
    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Reading your document');
    expect(texts).toContain('Uploaded securely');
    expect(texts).toContain('Finding dates, people and actions');

    // 2. Complete reading doc with issue -> transitions to Couldn't read screen (ADD-12)
    const readingCard = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Complete reading document');
    expect(readingCard).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      readingCard?.props.onPress();
    });

    // 3. Verify Couldn’t read this screen is shown
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('We couldn’t read this');
    expect(texts).toContain(
      'The photo looks blurry or too dark. Scan it again in better light, or type in the details yourself.'
    );
    expect(texts).toContain('Scan again');
    expect(texts).toContain('Type the details myself');

    // Tap "Scan again" -> goes to camera viewfinder
    const scanAgainBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t
          .findAllByType(Text)
          .find((txt) => txt.props.children === 'Scan again');
        return Boolean(textChild);
      });
    expect(scanAgainBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      scanAgainBtn?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Scan document');
    expect(texts).toContain('Edges found. Hold steady...');

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('renders FamilyVaultModal (ADD-13) with categories, search and file list', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyVaultModal visible={true} onClose={onClose} />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Family Vault');
    expect(texts).toContain('Proposed: every scan and upload is kept here, sorted by type.');
    expect(texts).toContain('RECENT');
    expect(texts).toContain('St. Mary’s circular');
    expect(texts).toContain('Electricity bill · October');
    expect(texts).toContain('IMG_2041.jpg');
    expect(texts).toContain('Aarav · Vaccination certificate');
    expect(texts).toContain('Car insurance policy');

    // Tap back button
    const backBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Back');
    expect(backBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });

    expect(onClose).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('renders AskHosynQModal thinking (ADD-20), clarifying (ADD-21), and editing (ADD-23)', async () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    // 1. Thinking state
    let renderer = await renderWithProvider(
      <AskHosynQModal
        visible={true}
        onClose={onClose}
        onConfirmAdded={onConfirm}
        initialStage="thinking"
        thinkingDurationMs={0}
      />
    );

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Working out the dates and people...');

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });

    // 2. Clarifying question state (ADD-21)
    renderer = await renderWithProvider(
      <AskHosynQModal
        visible={true}
        onClose={onClose}
        onConfirmAdded={onConfirm}
        initialStage="clarifying"
        thinkingDurationMs={0}
      />
    );

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Which Friday?');
    expect(texts).toContain('This Friday, 6 Nov');
    expect(texts).toContain('Next Friday, 13 Nov');
    expect(texts).toContain('What time is the meeting?');
    expect(texts).toContain('3:00 PM');

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });

    // 3. Edit proposal state (ADD-23)
    renderer = await renderWithProvider(
      <AskHosynQModal
        visible={true}
        onClose={onClose}
        onConfirmAdded={onConfirm}
        initialStage="editing"
        thinkingDurationMs={0}
      />
    );

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Edit before adding');
    expect(texts).toContain('EVENT');
    expect(texts).toContain('REMINDER');
    expect(texts).toContain('Confirm and add');

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('renders AskHosynQModal couldn’t understand state (ADD-24) with task/event fallbacks', async () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    const onMakeTask = jest.fn();
    const onMakeEvent = jest.fn();

    const renderer = await renderWithProvider(
      <AskHosynQModal
        visible={true}
        onClose={onClose}
        onConfirmAdded={onConfirm}
        onMakeTask={onMakeTask}
        onMakeEvent={onMakeEvent}
        initialStage="couldNotUnderstand"
        thinkingDurationMs={0}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain(
      'Sorry, I’m not sure what to add. What needs doing, and when? For example: “Book Dadi’s eye check-up next Tuesday.”'
    );
    expect(texts).toContain('Make a task instead');
    expect(texts).toContain('Make an event instead');

    // Tap "Make a task instead"
    const makeTaskBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const textChild = t
          .findAllByType(Text)
          .find((txt) => txt.props.children === 'Make a task instead');
        return Boolean(textChild);
      });
    expect(makeTaskBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      makeTaskBtn?.props.onPress();
    });

    expect(onMakeTask).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('renders ConfirmationToast (ADD-18 and ADD-25) toasts', async () => {
    const onUndo = jest.fn();

    // ADD-18 Ignored
    let renderer = await renderWithProvider(
      <ConfirmationToast
        visible={true}
        message="Ignored. Nothing was added. The file is saved."
        onUndo={onUndo}
      />
    );

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Ignored. Nothing was added. The file is saved.');
    expect(texts).toContain('Undo');

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });

    // ADD-25 Cancelled
    renderer = await renderWithProvider(
      <ConfirmationToast
        visible={true}
        message="Cancelled. Nothing was changed."
        onUndo={onUndo}
      />
    );

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    expect(texts).toContain('Cancelled. Nothing was changed.');
    expect(texts).toContain('Undo');

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });
});
