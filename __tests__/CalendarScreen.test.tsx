import React from 'react';
import { Text, TouchableOpacity, TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CalendarScreen from '../src/screens/mainScreens/calendarScreen/CalendarScreen';

const mockMetrics = {
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
  frame: { x: 0, y: 0, width: 375, height: 812 },
};

const renderScreen = async (component: React.ReactElement) => {
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

describe('CalendarScreen - Full Calendar Experience', () => {
  it('renders Day view by default with header, member filter, week strip, and timeline', async () => {
    const renderer = await renderScreen(<CalendarScreen />);
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    // Header & Tabs
    expect(texts).toContain('Calendar');
    expect(texts).toContain('Day');
    expect(texts).toContain('Week');
    expect(texts).toContain('Month');

    // Member Filter
    expect(texts).toContain('Everyone');
    expect(texts).toContain('Priya');
    expect(texts).toContain('Rohan');

    // Day View
    expect(texts).toContain('Friday, 30 October');
    expect(texts).toContain('TASKS DUE TODAY · 2');
    expect(texts).toContain('Aarav’s PTM');
    expect(texts).toContain('Badminton class');
  });

  it('switches between Day, Week, and Month views via segmented tabs', async () => {
    const renderer = await renderScreen(<CalendarScreen />);

    // Switch to Week View
    const weekTab = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Week view');
    expect(weekTab).toBeTruthy();

    await ReactTestRenderer.act(() => {
      weekTab?.props.onPress();
    });

    let texts = renderer.root
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
    expect(texts).toContain('Today');
    expect(texts).toContain('Event');
    expect(texts).toContain('Task due');
  });

  it('opens event detail modal when an event is pressed', async () => {
    const renderer = await renderScreen(<CalendarScreen />);

    const ptmEvent = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Aarav’s PTM'));
    expect(ptmEvent).toBeTruthy();

    await ReactTestRenderer.act(() => {
      ptmEvent?.props.onPress();
    });

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('Going');
    expect(texts).toContain('Reminders');
    expect(texts).toContain('Get directions');
    expect(texts).toContain('Edit');
  });

  it('shows themed dropdown menu when three dots is tapped in event detail and navigates to comments', async () => {
    const renderer = await renderScreen(<CalendarScreen />);

    // Open Event Detail
    const ptmEvent = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Aarav’s PTM'));
    expect(ptmEvent).toBeTruthy();

    await ReactTestRenderer.act(() => {
      ptmEvent?.props.onPress();
    });

    // Tap More options button (three dots)
    const moreBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'More options');
    expect(moreBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      moreBtn?.props.onPress();
    });

    // Check that dropdown items are present
    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Comments (4)');
    expect(texts).toContain('Edit Event');
    expect(texts).toContain('Cancel Event');

    // Tap Comments in dropdown
    const commentsBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Comments'));
    expect(commentsBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      commentsBtn?.props.onPress();
    });

    // Verify Comments modal opened
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Comments');
    expect(texts).toContain('Aarav’s PTM');
    expect(texts).toContain('3:00 PM');
  });

  it('opens cancel event dialog (CAL-08), shows custom subtitle and note toggle, and cancels event', async () => {
    const renderer = await renderScreen(<CalendarScreen />);

    // Open Event Detail
    const ptmEvent = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Aarav’s PTM'));
    expect(ptmEvent).toBeTruthy();

    await ReactTestRenderer.act(() => {
      ptmEvent?.props.onPress();
    });

    // Tap More options button (three dots)
    const moreBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'More options');
    expect(moreBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      moreBtn?.props.onPress();
    });

    // Tap Cancel Event in dropdown
    const cancelOption = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Cancel Event');
    expect(cancelOption).toBeTruthy();

    await ReactTestRenderer.act(() => {
      cancelOption?.props.onPress();
    });

    // Verify Cancel Event dialog (CAL-08) is displayed over the dimmed screen
    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Cancel this event?');
    expect(texts).toContain('Add a note for them');
    expect(texts).toContain('Cancel event');
    expect(texts).toContain('Keep event');

    // Confirm cancel
    const confirmCancelBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Confirm cancel event');
    expect(confirmCancelBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      confirmCancelBtn?.props.onPress();
    });

    // Verify event is removed from calendar
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).not.toContain('Aarav’s PTM');
  });

  it('toggles Important Dates view via header button', async () => {
    const renderer = await renderScreen(<CalendarScreen showImportantDatesBtn={true} />);

    const importantDatesBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Important dates');
    expect(importantDatesBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      importantDatesBtn?.props.onPress();
    });

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('Important dates');
    expect(texts).toContain('THIS MONTH');
    expect(texts).toContain('NEXT 3 MONTHS');
    expect(texts).toContain('Nani’s birthday');
    expect(texts).toContain('Rohan’s passport expires');
    expect(texts).toContain('Add an important date');

    // Tap on Rohan's passport expires to open ImportantDateDetailModal (CAL-16)
    const passportItem = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) =>
        t.props.accessibilityLabel?.includes('Rohan’s passport expires')
      );
    expect(passportItem).toBeTruthy();

    await ReactTestRenderer.act(() => {
      passportItem?.props.onPress();
    });

    // Verify Important Date Detail (CAL-16) screen content
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Important date');
    expect(texts).toContain('Document expiry');
    expect(texts).toContain('Rohan’s passport expires');
    expect(texts).toContain('45');
    expect(texts).toContain('DAYS LEFT');
    expect(texts).toContain('Monday, 14 Dec 2026');
    expect(texts).toContain('Passport · Rohan Sharma');
    expect(texts).toContain('Person');
    expect(texts).toContain('Reminders');
    expect(texts).toContain('Who sees it');
    expect(texts).toContain('Confirm');
    expect(texts).toContain('Edit date');
    expect(texts).toContain('Add renewal task');

    // Confirm AI suggestion
    const confirmBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Confirm add task');
    expect(confirmBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      confirmBtn?.props.onPress();
    });

    // Verify task confirmed banner
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain("Task added to Rohan's tasks list");
  });

  it('opens Filter Calendar modal and applies member filter', async () => {
    const renderer = await renderScreen(<CalendarScreen />);

    const filterBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Filter calendar');
    expect(filterBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      filterBtn?.props.onPress();
    });

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('Filter calendar');
    expect(texts).toContain('SHOW');
    expect(texts).toContain('WHOSE CALENDAR');
    expect(texts).toContain('CATEGORY');
    expect(texts).toContain('Show items');
  });

  it('opens and interacts with Create and Edit Event modals matching CAL-09 and CAL-10', async () => {
    const renderer = await renderScreen(<CalendarScreen />);

    // Open Event Detail
    const ptmEvent = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Aarav’s PTM'));
    expect(ptmEvent).toBeTruthy();

    await ReactTestRenderer.act(() => {
      ptmEvent?.props.onPress();
    });

    // Tap Edit button (at bottom of Event Detail)
    const editBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Edit event');
    expect(editBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      editBtn?.props.onPress();
    });

    // Check Edit Event (CAL-10) is displayed
    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Edit event');
    expect(texts).toContain('STARTS');
    expect(texts).toContain('ENDS');
    expect(texts).toContain('All day');
    expect(texts).toContain('Where');
    expect(texts).toContain('Invite');
    expect(texts).toContain('Category');
    expect(texts).toContain('Repeat');
    expect(texts).toContain('Reminders');
    expect(texts).toContain('Cancel this event');
    expect(texts).toContain('Save changes');

    // Tap Category row to open Category picker (CAL-11)
    const categoryRow = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Select category');
    expect(categoryRow).toBeTruthy();

    await ReactTestRenderer.act(() => {
      categoryRow?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('The colour shows on the calendar');
    expect(texts).toContain('Family');
    expect(texts).toContain('Personal');
    expect(texts).toContain('Household');

    // Tap Done in Category picker
    const doneBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Done');
    expect(doneBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      doneBtn?.props.onPress();
    });

    // Tap Save changes
    const saveChangesBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Save changes');
    expect(saveChangesBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      saveChangesBtn?.props.onPress();
    });

    // Verify returning to Event Detail screen
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Event');
    expect(texts).toContain('Get directions');
  });

  it('allows posting a new comment and returns back to event detail on back button press', async () => {
    const renderer = await renderScreen(<CalendarScreen />);

    // Open Event Detail for Aarav's PTM
    const ptmEvent = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Aarav’s PTM'));
    expect(ptmEvent).toBeTruthy();

    await ReactTestRenderer.act(() => {
      ptmEvent?.props.onPress();
    });

    // Tap More options button (three dots)
    const moreBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'More options');
    expect(moreBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      moreBtn?.props.onPress();
    });

    // Tap Comments in dropdown
    const commentsBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Comments'));
    expect(commentsBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      commentsBtn?.props.onPress();
    });

    // Verify initial comments are visible
    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Comments');
    expect(texts).toContain(
      'I’ll meet you at 3. Can you ask about his maths marks?'
    );

    // Type a new comment
    const input = renderer.root.findByType(TextInput);
    expect(input).toBeTruthy();

    await ReactTestRenderer.act(() => {
      input.props.onChangeText('I will reach by 2:45 PM');
    });

    // Tap Send button
    const sendBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Send comment');
    expect(sendBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      sendBtn?.props.onPress();
    });

    // Verify new comment is in the list
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('I will reach by 2:45 PM');

    // Tap Back to event button
    const backBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Back to event');
    expect(backBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      backBtn?.props.onPress();
    });

    // Verify back on Event Detail
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Event');
    expect(texts).toContain('Get directions');
  });

  it('allows tapping STARTS and ENDS cards to pick start and end date and time via EventDateTimePickerModal', async () => {
    const renderer = await renderScreen(<CalendarScreen />);

    // Open Event Detail for Aarav's PTM
    const ptmEvent = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Aarav’s PTM'));
    expect(ptmEvent).toBeTruthy();

    await ReactTestRenderer.act(() => {
      ptmEvent?.props.onPress();
    });

    // Tap Edit button
    const editBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Edit event');
    expect(editBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      editBtn?.props.onPress();
    });

    // Tap STARTS card
    const startsCard = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Starts time');
    expect(startsCard).toBeTruthy();

    await ReactTestRenderer.act(() => {
      startsCard?.props.onPress();
    });

    // Verify EventDateTimePickerModal is open for Starts
    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Starts');
    expect(texts).toContain('Today');
    expect(texts).toContain('Tomorrow');
    expect(texts).toContain('TIME');

    // Pick a quick time (e.g. 6:00 PM)
    const quickTimeBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const c = t.props.children;
        return (
          c &&
          typeof c === 'object' &&
          c.props &&
          c.props.children === '6:00 PM'
        );
      });
    expect(quickTimeBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      quickTimeBtn?.props.onPress();
    });

    // Tap Done on the Date/Time picker
    const applyBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Apply date and time');
    expect(applyBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      applyBtn?.props.onPress();
    });

    // Verify STARTS card updated with 6:00 PM
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('6:00 PM');
  });
});
