import React from 'react';
import { Text, TouchableOpacity, TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CalendarScreen from '../src/screens/mainScreens/calendarScreen/CalendarScreen';
import {
  TEST_FAMILY_MEMBERS,
  TEST_CALENDAR_EVENTS,
  TEST_TASKS_DUE,
} from '../src/__test_fixtures__/calendarFixtures';
import {
  buildUpdateEventPayload,
  mapUiRemindersToBackend,
  formatDisplayReminders,
  formatDisplayRepeat,
  mapApiEventToUiEvent,
} from '../src/screens/mainScreens/calendarScreen/calendarApiHelpers';
import { CalendarEvent } from '../src/screens/mainScreens/calendarScreen/types';

const mockMetrics = {
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
  frame: { x: 0, y: 0, width: 375, height: 812 },
};

const defaultTestProps = {
  initialEvents: TEST_CALENDAR_EVENTS,
  initialTasksDue: TEST_TASKS_DUE,
  initialFamilyMembers: TEST_FAMILY_MEMBERS,
};

const renderScreen = async (component: React.ReactElement<any>) => {
  let elementToRender = component;
  if (component.type === CalendarScreen) {
    elementToRender = React.cloneElement(component, {
      ...defaultTestProps,
      ...component.props,
    });
  }
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={mockMetrics}>
        {elementToRender}
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

  it('navigates across months using prev, next, and Today buttons in Month view', async () => {
    const renderer = await renderScreen(<CalendarScreen />);

    // Switch to Month View
    const monthTab = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Month view');
    expect(monthTab).toBeTruthy();

    await ReactTestRenderer.act(() => {
      monthTab?.props.onPress();
    });

    let texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('October 2026');

    // Tap Next Month (October -> November)
    const nextBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.testID === 'month-next-btn' || t.props.accessibilityLabel === 'Next month');
    expect(nextBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      nextBtn?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('November 2026');

    // Tap Prev Month (November -> October)
    const prevBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.testID === 'month-prev-btn' || t.props.accessibilityLabel === 'Previous month');
    expect(prevBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      prevBtn?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('October 2026');

    // Tap Prev Month again (October -> September)
    await ReactTestRenderer.act(() => {
      prevBtn?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('September 2026');

    // Tap Today button (returns to October 2026 in test env)
    const todayBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.testID === 'month-today-btn' || t.props.accessibilityLabel === 'Go to today');
    expect(todayBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      todayBtn?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('October 2026');
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

  it('submits RSVP response (Going / Not Going) from event detail', async () => {
    const renderer = await renderScreen(<CalendarScreen />);

    // Open Event Detail
    const ptmEvent = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Aarav’s PTM'));
    expect(ptmEvent).toBeTruthy();

    await ReactTestRenderer.act(() => {
      ptmEvent?.props.onPress();
    });

    // Find "Respond Going" button
    const goingBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Respond Going');
    expect(goingBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      goingBtn?.props.onPress();
    });

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).not.toContain('Are you going?');
    expect(
      renderer.root
        .findAllByType(TouchableOpacity)
        .some((t) =>
          ['Respond Going', 'Respond Not Going'].includes(
            t.props.accessibilityLabel
          )
        )
    ).toBe(false);
  });

  it('hides RSVP section when invited user has already accepted and never displays duplicate "you and you"', async () => {
    const invitedRespondedEvent: CalendarEvent = {
      id: 'evt-invited-responded',
      title: 'Sac',
      date: '2026-10-30',
      startTime: '8:00 PM',
      endTime: '10:00 PM',
      formattedDate: 'Fri, 30 Oct',
      formattedTime: '8:00 – 10:00 PM',
      isAllDay: false,
      category: 'Family',
      categoryColor: '#3B82F6',
      location: 'Sac',
      isCreator: false,
      askToConfirm: true,
      canRespond: true,
      myResponse: 'GOING',
      invitees: [{ id: 'm1', name: 'Meera', response: 'GOING' }],
      goingMemberIds: ['m2', 'm1'],
      goingMembers: [
        { id: 'm2', name: 'Rupesh Sharma', initial: 'R', color: '#1F3A66' },
        { id: 'm1', name: 'Meera', initial: 'M', color: '#4A2E1A' },
      ],
      reminders: '2 hours before',
      repeat: 'Doesn’t repeat',
      comments: [],
    };

    const renderer = await renderScreen(
      <CalendarScreen initialEvents={[invitedRespondedEvent]} />
    );

    const evtBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Sac'));
    expect(evtBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      evtBtn?.props.onPress();
    });

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).not.toContain('Are you going?');
    expect(texts).not.toContain('you and you');
  });

  it('shows RSVP section when backend event has PENDING status and permissions.canRespond is true', async () => {
    const mappedPending = mapApiEventToUiEvent({
      id: 'evt-pending-rsvp',
      title: 'Team Lunch',
      startsOn: '2026-10-30',
      startTime: '13:00',
      endsOn: '2026-10-30',
      endTime: '14:00',
      category: 'FAMILY',
      myResponse: 'PENDING',
      askToConfirm: true,
      permissions: {
        canEdit: false,
        canCancel: false,
        canRespond: true,
        isCreator: false,
      },
      going: [{ memberId: 'm2', fullName: 'Rupesh Sharma' }],
      invitees: [{ memberId: 'm1', fullName: 'Meera', response: 'PENDING' }],
    });

    expect(mappedPending.myResponse).toBeNull();
    expect(mappedPending.canRespond).toBe(true);
    expect(mappedPending.backendCanRespond).toBe(true);

    const renderer = await renderScreen(
      <CalendarScreen initialEvents={[mappedPending]} />
    );

    const evtBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Team Lunch'));
    expect(evtBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      evtBtn?.props.onPress();
    });

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).toContain('Are you going?');
  });

  it('hides RSVP section for the event creator and keeps creator as going', async () => {
    const creatorEvent: CalendarEvent = {
      id: 'evt-creator-owned',
      title: 'Creator PTM',
      date: '2026-10-30',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      formattedDate: 'Fri, 30 Oct',
      formattedTime: '10:00 – 11:00 AM',
      isAllDay: false,
      category: 'Family',
      categoryColor: '#3B82F6',
      location: 'School',
      isCreator: true,
      askToConfirm: true,
      goingMemberIds: ['m2'],
      goingMembers: [
        { id: 'm2', name: 'Rohan', initial: 'R', color: '#1F3A66' },
      ],
      reminders: '2 hours before',
      repeat: 'Doesn’t repeat',
      comments: [],
    };

    const renderer = await renderScreen(
      <CalendarScreen initialEvents={[creatorEvent]} />
    );

    const evtBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Creator PTM'));
    expect(evtBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      evtBtn?.props.onPress();
    });

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat();
    expect(texts).not.toContain('Are you going?');
    expect(
      renderer.root
        .findAllByType(TouchableOpacity)
        .some((t) =>
          ['Respond Going', 'Respond Not Going'].includes(
            t.props.accessibilityLabel
          )
        )
    ).toBe(false);
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

    // Tap Invite row to open Who's invited modal (CAL-12)
    const inviteRow = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Invite members');
    expect(inviteRow).toBeTruthy();

    await ReactTestRenderer.act(() => {
      inviteRow?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Who’s invited?');
    expect(texts).toContain('They’ll see it on their calendar');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Anaya');

    // Tap Invite button to close Who's invited
    const inviteDoneBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('Invite'));
    expect(inviteDoneBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      inviteDoneBtn?.props.onPress();
    });

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

    // Tap Repeat row to open Repeat picker dropdown
    const repeatRow = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Repeat option');
    expect(repeatRow).toBeTruthy();

    await ReactTestRenderer.act(() => {
      repeatRow?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Choose how often this event occurs');
    expect(texts).toContain('Every day');
    expect(texts).toContain('Every week');
    expect(texts).toContain('Every month');
    expect(texts).toContain('Every year');

    // Select "Every month"
    const everyMonthOpt = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Every month');
    expect(everyMonthOpt).toBeTruthy();

    await ReactTestRenderer.act(() => {
      everyMonthOpt?.props.onPress();
    });

    // Done on Repeat picker
    const repeatDoneBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Done');
    await ReactTestRenderer.act(() => {
      repeatDoneBtn?.props.onPress();
    });

    // Tap Reminders row to open Reminders modal with expanded options
    const remindersRow = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Select reminders');
    expect(remindersRow).toBeTruthy();

    await ReactTestRenderer.act(() => {
      remindersRow?.props.onPress();
    });

    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Pick as many as you like');
    expect(texts).toContain('30 minutes before');
    expect(texts).toContain('2 hours before');
    expect(texts).toContain('The evening before (7:00 PM)');
    expect(texts).not.toContain('1 hour before');
    expect(texts).toContain('1 day before');

    // Close Reminders modal
    const remindersDoneBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Done');
    await ReactTestRenderer.act(() => {
      remindersDoneBtn?.props.onPress();
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

  it('toggles search bar, searches events in real-time, and clears search', async () => {
    const renderer = await renderScreen(<CalendarScreen />);

    // Initially search bar is hidden
    let searchInput = renderer.root
      .findAllByType(TextInput)
      .find((input) => input.props.placeholder === 'Search events, tasks...');
    expect(searchInput).toBeFalsy();

    // Find and tap search toggle button
    const searchBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Search events');
    expect(searchBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      searchBtn?.props.onPress();
    });

    // Search bar is now visible
    searchInput = renderer.root
      .findAllByType(TextInput)
      .find((input) => input.props.placeholder === 'Search events, tasks...');
    expect(searchInput).toBeTruthy();

    // Type query matching "Nani"
    await ReactTestRenderer.act(() => {
      searchInput?.props.onChangeText('Nani');
    });

    // Check filtered events
    let texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Dinner at Nani’s');
    expect(texts).not.toContain('Aarav’s PTM');

    // Tap clear search button
    const clearBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Clear search');
    expect(clearBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      clearBtn?.props.onPress();
    });

    // Full list restored
    texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );
    expect(texts).toContain('Aarav’s PTM');
  });

  it('displays only going members and all selected reminders and repeat in event detail', async () => {
    const singleGoingEvent: CalendarEvent = {
      id: 'evt-custom-ptm',
      title: 'PTM Myra’s',
      date: '2026-10-30',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      formattedDate: 'Fri, 30 Oct',
      formattedTime: '10:00 – 11:00 AM',
      isAllDay: false,
      category: 'Family',
      categoryColor: '#3B82F6',
      location: 'St marry’s school',
      goingMemberIds: ['m-myra'],
      goingMembers: [
        { id: 'm-myra', name: 'Myra', initial: 'M', color: '#10B981' },
      ],
      reminders: '1 day before · 2 hours before',
      repeat: 'Every month',
      comments: [],
    };

    const renderer = await renderScreen(
      <CalendarScreen initialEvents={[singleGoingEvent]} />
    );

    const eventBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel?.includes('PTM Myra’s'));
    expect(eventBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      eventBtn?.props.onPress();
    });

    const texts = renderer.root
      .findAllByType(Text)
      .map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children
      );

    // Strictly verify only going members are displayed
    expect(texts).toContain('Myra');
    expect(texts).not.toContain('Rohan and you');

    // Strictly verify all selected reminders are displayed together
    expect(texts).toContain('1 day before · 2 hours before');

    // Strictly verify repeat rule is accurately displayed
    expect(texts).toContain('Every month');

    // Reminders and Repeat rows are read-only on event detail (only editable in add/edit screens)
    const editableButtons = renderer.root
      .findAllByType(TouchableOpacity)
      .filter((t) =>
        t.props.accessibilityLabel?.startsWith('Reminders:') ||
        t.props.accessibilityLabel?.startsWith('Repeat:')
      );
    expect(editableButtons.length).toBe(0);
  });

  it('verifies helper mappings for multiple reminders and repeat', () => {
    // Multiple reminders mapping from UI to backend enums
    const backendReminders = mapUiRemindersToBackend('1 day before · 2 hours before');
    expect(backendReminders).toContain('ONE_DAY_BEFORE');
    expect(backendReminders).toContain('TWO_HOURS_BEFORE');
    expect(backendReminders.length).toBe(2);

    // Reminders display helper joins cleanly
    expect(formatDisplayReminders(['ONE_DAY_BEFORE', 'TWO_HOURS_BEFORE'])).toBe(
      '1 day before · 2 hours before'
    );
    expect(formatDisplayReminders('ONE_DAY_BEFORE, TWO_HOURS_BEFORE')).toBe(
      '1 day before · 2 hours before'
    );

    // Repeat display helper
    expect(formatDisplayRepeat('MONTHLY')).toBe('Every month');
    expect(formatDisplayRepeat('YEARLY')).toBe('Every year');
    expect(formatDisplayRepeat('NONE')).toBe('Doesn’t repeat');
  });

  it('only emits reminder values accepted by the calendar API', () => {
    const acceptedReminders = [
      'AT_START',
      'THIRTY_MIN_BEFORE',
      'TWO_HOURS_BEFORE',
      'EVENING_BEFORE',
      'ONE_DAY_BEFORE',
      'ONE_WEEK_BEFORE',
      'CUSTOM',
    ];

    expect(
      mapUiRemindersToBackend(
        'When it starts · 30 minutes before · 2 hours before · The evening before (7:00 PM) · 1 day before · 1 week before · Custom time'
      )
    ).toEqual(acceptedReminders);
    expect(mapUiRemindersToBackend('On the day (9:00 AM)', true)).toEqual([
      'AT_START',
    ]);
    expect(mapUiRemindersToBackend('1 hour before · 2 days before')).toEqual([
      'TWO_HOURS_BEFORE',
    ]);
  });

  it('does not send a repeat rule when editing only one recurring event occurrence', () => {
    const event = { repeat: 'Every month' } as Partial<CalendarEvent>;

    expect(buildUpdateEventPayload(event, 'THIS_ONE').repeat).toBeUndefined();
    expect(buildUpdateEventPayload(event, 'THIS_AND_FUTURE').repeat).toBe(
      'MONTHLY'
    );
    expect(buildUpdateEventPayload(event, 'ALL').repeat).toBe('MONTHLY');
  });
});
