import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import remindersReducer from '../src/redux/features/reminders/remindersSlice';
import needsAttentionReducer from '../src/redux/features/home/needsAttentionSlice';
import tasksReducer from '../src/redux/features/tasks/tasksSlice';
import vaultReducer from '../src/redux/features/vault/vaultSlice';
import apiClient from '../src/services/apiClient';
import homeServices from '../src/services/homeServices';
import remindersServices from '../src/services/remindersServices';
import { RemindersScreen } from '../src/screens/mainScreens/remindersScreen';
import {
  CreateReminderModal,
} from '../src/screens/mainScreens/addFlow/CreateReminderModal';
import {
  convertWhenChipToIstSchedule,
  extractReminderMembersFromFamilyState,
  formatRepeatSummary,
  mapApiRepeatToUi,
  mapUiRepeatToApi,
} from '../src/screens/mainScreens/addFlow/reminderApiHelpers';
import NeedsAttentionScreen from '../src/screens/mainScreens/needsAttentionScreen/NeedsAttentionScreen';
import ReminderDetailModal from '../src/screens/mainScreens/needsAttentionScreen/ReminderDetailModal';
import {
  NeedsAttentionSectionSkeleton,
  NeedsAttentionSkeleton,
  ReminderDetailSkeleton,
} from '../src/components/SkeletonLoader';
import {
  mockNeedsAttentionResponse,
  mockPastReminder,
  mockRecipientOnlyReminder,
  mockReminderMembersBasic,
  mockRemindersListResponse,
  mockUpcomingReminder,
} from '../src/__test_fixtures__/reminderFixtures';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const createReminderTestStore = () =>
  configureStore({
    reducer: {
      reminders: remindersReducer,
      needsAttention: needsAttentionReducer,
      tasks: tasksReducer,
      vault: vaultReducer,
      family: (state = { basicFamilyData: mockReminderMembersBasic }) => state,
    },
    preloadedState: {
      needsAttention: {
        items: mockNeedsAttentionResponse.items,
        counts: mockNeedsAttentionResponse.counts,
        activeSection: 'ALL' as const,
        withinDays: 60,
        pagination: mockNeedsAttentionResponse.pagination,
        loading: false,
        loadingMore: false,
        hasLoaded: true,
        error: null,
      },
      reminders: {
        upcoming: [mockUpcomingReminder, mockRecipientOnlyReminder],
        past: [mockPastReminder],
        counts: { upcoming: 2, past: 1 },
        upcomingPagination: null,
        pastPagination: null,
        selectedReminder: mockUpcomingReminder,
        hasLoadedUpcoming: true,
        hasLoadedPast: true,
        loadingUpcoming: false,
        loadingPast: false,
        loadingMore: false,
        loadingDetail: false,
        submitting: false,
        error: null,
      },
    },
  });

const getAllTexts = (renderer: ReactTestRenderer.ReactTestRenderer): string[] =>
  renderer.root
    .findAllByType(Text)
    .map((node) =>
      Array.isArray(node.props.children)
        ? node.props.children.join('')
        : String(node.props.children ?? '')
    );

describe('Reminders Integration & Components', () => {
  it('converts IST time chips and repeat rules accurately', () => {
    // 2026-11-27 14:00:00 IST = 2026-11-27T08:30:00.000Z
    const before7pmUtc = Date.UTC(2026, 10, 27, 8, 30, 0);
    expect(convertWhenChipToIstSchedule('In 1 hour', undefined, undefined, before7pmUtc)).toEqual({
      remindOn: '2026-11-27',
      remindTime: '15:00',
    });
    expect(
      convertWhenChipToIstSchedule('This evening, 7:00 PM', undefined, undefined, before7pmUtc)
    ).toEqual({
      remindOn: '2026-11-27',
      remindTime: '19:00',
      rolledToTomorrow: false,
    });

    // 2026-11-27 20:30:00 IST = 2026-11-27T15:00:00.000Z -> rolls evening chip to tomorrow
    const after7pmUtc = Date.UTC(2026, 10, 27, 15, 0, 0);
    expect(
      convertWhenChipToIstSchedule('This evening, 7:00 PM', undefined, undefined, after7pmUtc)
    ).toEqual({
      remindOn: '2026-11-28',
      remindTime: '19:00',
      rolledToTomorrow: true,
    });

    expect(
      convertWhenChipToIstSchedule('Tomorrow, 9:00 AM', undefined, undefined, before7pmUtc)
    ).toEqual({
      remindOn: '2026-11-28',
      remindTime: '09:00',
    });

    expect(mapUiRepeatToApi('Every 3 months')).toBe('EVERY_3_MONTHS');
    expect(mapApiRepeatToUi('EVERY_3_MONTHS')).toBe('Every 3 months');
    expect(formatRepeatSummary('CUSTOM', ['MON', 'FRI'], '2026-12-31')).toBe(
      'Custom · MON, FRI · Ends 2026-12-31'
    );
  });

  it('filters members to app-enabled only and restricts DEPENDENT_CHILD_PROFILE to self', () => {
    const adultResult = extractReminderMembersFromFamilyState({
      basicFamilyData: mockReminderMembersBasic,
    });
    // Excludes Aarav (hasAppAccount: false, userId: null)
    expect(adultResult.members.map((m) => m.firstName)).toEqual(['Rupesh', 'Priya']);

    // Real /family/my-family/basic payload uses hasAccount without userId/hasAppAccount
    const apiBasicResult = extractReminderMembersFromFamilyState({
      basicFamilyData: {
        myMemberId: 'adult-1',
        myRole: 'FAMILY_OWNER',
        members: [
          {
            memberId: 'adult-1',
            fullName: 'Rupesh Sharma',
            role: 'FAMILY_OWNER',
            isYou: true,
            hasAccount: true,
          },
          {
            memberId: 'adult-2',
            fullName: 'Priya Sharma',
            role: 'ADULT_MEMBER',
            isYou: false,
            hasAccount: true,
          },
          {
            memberId: 'child-no-app',
            fullName: 'Myra Sharma',
            role: 'DEPENDENT_CHILD_PROFILE',
            isYou: false,
            hasAccount: false,
          },
        ],
      },
    });
    expect(apiBasicResult.members.map((m) => m.firstName)).toEqual(['Rupesh', 'Priya']);

    const childResult = extractReminderMembersFromFamilyState({
      basicFamilyData: {
        myMemberId: 'child-1',
        myRole: 'DEPENDENT_CHILD_PROFILE',
        members: [
          {
            memberId: 'parent-1',
            fullName: 'Rupesh Sharma',
            role: 'FAMILY_OWNER',
            isYou: false,
            hasAppAccount: true,
            userId: 'u-1',
          },
          {
            memberId: 'child-1',
            fullName: 'Anaya Sharma',
            role: 'DEPENDENT_CHILD_PROFILE',
            isYou: true,
            hasAppAccount: true,
            userId: 'u-3',
          },
        ],
      },
    });
    expect(childResult.isChild).toBe(true);
    expect(childResult.members.map((m) => m.id)).toEqual(['child-1']);
  });

  it('renders ReminderDetailModal with permission gating (creator vs recipient-only)', async () => {
    const store = createReminderTestStore();

    let creatorRenderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      creatorRenderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <ReminderDetailModal
              visible={true}
              reminderId={mockUpcomingReminder.id}
              initialReminder={mockUpcomingReminder}
              onClose={jest.fn()}
            />
          </SafeAreaProvider>
        </Provider>
      );
    });
    const creatorTexts = getAllTexts(creatorRenderer!);
    expect(creatorTexts).toContain('Call the plumber about the kitchen tap');
    expect(creatorTexts).toContain('Mark as done');
    expect(creatorTexts).toContain('Edit');

    let recipientRenderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      recipientRenderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <ReminderDetailModal
              visible={true}
              reminderId={mockRecipientOnlyReminder.id}
              initialReminder={mockRecipientOnlyReminder}
              onClose={jest.fn()}
            />
          </SafeAreaProvider>
        </Provider>
      );
    });
    const recipientTexts = getAllTexts(recipientRenderer!);
    expect(recipientTexts).toContain('Pick up kids from school');
    expect(recipientTexts).toContain('Mark as done');
    expect(recipientTexts).not.toContain('Edit');

    let pastRenderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      pastRenderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <ReminderDetailModal
              visible={true}
              reminderId={mockPastReminder.id}
              initialReminder={mockPastReminder}
              onClose={jest.fn()}
            />
          </SafeAreaProvider>
        </Provider>
      );
    });
    const pastTexts = getAllTexts(pastRenderer!);
    expect(pastTexts).toContain('Undo done');
    expect(pastTexts).not.toContain('Edit');
    expect(pastTexts).not.toContain('Edit Reminder');
    expect(pastTexts).not.toContain('Remove Reminder');
    expect(
      pastRenderer!.root.findAllByProps({ accessibilityLabel: 'More options' })
    ).toHaveLength(0);
  });

  it('renders CreateReminderModal in Edit mode cleanly', async () => {
    const store = createReminderTestStore();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <CreateReminderModal
              visible={true}
              reminderToEdit={mockUpcomingReminder}
              onClose={jest.fn()}
            />
          </SafeAreaProvider>
        </Provider>
      );
    });
    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Edit reminder');
    expect(texts).toContain('Save changes');
    expect(texts).toContain('Custom');
  });

  it('renders NeedsAttentionScreen with unified sections and composite cursor pagination helper', async () => {
    const getSpy = jest
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data: mockNeedsAttentionResponse });

    await homeServices.getNeedsAttention({
      section: 'ALL',
      withinDays: 60,
      limit: 30,
      before: '   ',
    });
    expect(getSpy).toHaveBeenCalledWith('home/needs-attention', {
      params: { section: 'ALL', withinDays: 60, limit: 30 },
    });

    await homeServices.getNeedsAttention({
      section: 'DUE_SOON',
      withinDays: 60,
      limit: 30,
      before: 'REMINDER:6f9bd72b-40a7-4e10-9bfa-0ac5b2092e60',
    });
    expect(getSpy).toHaveBeenCalledWith('home/needs-attention', {
      params: {
        section: 'DUE_SOON',
        withinDays: 60,
        limit: 30,
        before: 'REMINDER:6f9bd72b-40a7-4e10-9bfa-0ac5b2092e60',
      },
    });
    getSpy.mockRestore();

    const store = createReminderTestStore();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <>
              <NeedsAttentionSectionSkeleton />
              <NeedsAttentionSkeleton />
              <ReminderDetailSkeleton />
              <NeedsAttentionScreen />
            </>
          </SafeAreaProvider>
        </Provider>
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Needs attention');
    expect(texts).toContain('OVERDUE');
    expect(texts).toContain('DUE SOON');
    expect(texts).toContain('Call the plumber about the kitchen tap');
    expect(texts).toContain('Done');
    expect(texts).toContain('Remind');
  });

  it('validates listReminders cursor & renders RemindersScreen with Upcoming and Past tabs', async () => {
    const getSpy = jest
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data: mockRemindersListResponse });

    // Omitting literal "nextCursor" on page 1; sending only valid UUID cursor
    await remindersServices.listReminders({
      status: 'UPCOMING',
      limit: 10,
      before: 'nextCursor',
    });
    expect(getSpy).toHaveBeenCalledWith('reminders', {
      params: { status: 'UPCOMING', limit: 10 },
    });

    await remindersServices.listReminders({
      status: 'PAST',
      limit: 10,
      before: '6f9bd72b-40a7-4e10-9bfa-0ac5b2092e60',
    });
    expect(getSpy).toHaveBeenCalledWith('reminders', {
      params: {
        status: 'PAST',
        limit: 10,
        before: '6f9bd72b-40a7-4e10-9bfa-0ac5b2092e60',
      },
    });
    getSpy.mockRestore();

    const store = createReminderTestStore();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <RemindersScreen onBack={jest.fn()} />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const upTexts = getAllTexts(renderer!);
    expect(upTexts).toContain('Reminders');
    expect(upTexts).toContain('Upcoming (2)');
    expect(upTexts).toContain('Past (1)');
    expect(upTexts).toContain('Call the plumber about the kitchen tap');
    expect(upTexts).toContain('Pick up kids from school');

    const pastTab = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) =>
        t.findAllByType(Text).some((tx) =>
          String(tx.props.children).startsWith('Past (')
        )
      );
    expect(pastTab).toBeTruthy();

    const getSpy2 = jest
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data: mockRemindersListResponse });

    await ReactTestRenderer.act(async () => {
      pastTab?.props.onPress();
    });

    // Switching tabs must NOT re-call GET /reminders
    expect(getSpy2).not.toHaveBeenCalled();
    getSpy2.mockRestore();

    const pastTexts = getAllTexts(renderer!);
    expect(pastTexts).toContain('Submit society maintenance receipt');
    expect(pastTexts).toContain('Undo');
  });

  it('omits repeatDays when editing a CUSTOM reminder to DAILY and leaves out repeat on Create when Doesn’t repeat', async () => {
    const store = createReminderTestStore();
    const patchSpy = jest
      .spyOn(apiClient, 'patch')
      .mockResolvedValue({ data: { success: true, reminder: { ...mockUpcomingReminder, repeat: 'DAILY', repeatDays: [], repeatEndsOn: null } } });
    const postSpy = jest
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { success: true, reminder: mockRecipientOnlyReminder } });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <CreateReminderModal
              visible={true}
              reminderToEdit={mockUpcomingReminder}
              onClose={jest.fn()}
            />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const repeatRow = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => String(t.props.accessibilityLabel || '').startsWith('Repeat '));
    expect(repeatRow).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      repeatRow?.props.onPress();
    });

    const dailyOption = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => {
        const inner = t.findAllByType(Text);
        return inner.some((tx) => tx.props.children === 'Daily');
      });
    expect(dailyOption).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      dailyOption?.props.onPress();
    });

    const saveBtn = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Save changes');
    expect(saveBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      saveBtn?.props.onPress();
    });

    expect(patchSpy).toHaveBeenCalledTimes(1);
    const [, rawPatchPayload] = patchSpy.mock.calls[0];
    const sentPatchPayload = rawPatchPayload as Record<string, any>;
    expect(sentPatchPayload.repeat).toBe('DAILY');
    expect(sentPatchPayload).not.toHaveProperty('repeatDays');
    expect(sentPatchPayload.repeatEndsOn).toBeNull();

    // Verify Create mode omits repeat & repeatDays when "Doesn’t repeat"
    await ReactTestRenderer.act(async () => {
      renderer!.update(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <CreateReminderModal
              visible={true}
              reminderToEdit={null}
              onClose={jest.fn()}
            />
          </SafeAreaProvider>
        </Provider>
      );
    });

    const { TextInput } = require('react-native');
    const titleInput = renderer!.root.findByType(TextInput);
    await ReactTestRenderer.act(async () => {
      titleInput.props.onChangeText('Drink water');
    });

    const setBtn = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Set reminder');
    await ReactTestRenderer.act(async () => {
      setBtn?.props.onPress();
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
    const [, sentPostPayload] = postSpy.mock.calls[0];
    expect(sentPostPayload).not.toHaveProperty('repeat');
    expect(sentPostPayload).not.toHaveProperty('repeatDays');
    expect(sentPostPayload).not.toHaveProperty('repeatEndsOn');

    patchSpy.mockRestore();
    postSpy.mockRestore();
  });
});
