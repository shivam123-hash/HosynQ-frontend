import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import remindersReducer from '../src/redux/features/reminders/remindersSlice';
import needsAttentionReducer from '../src/redux/features/home/needsAttentionSlice';
import tasksReducer from '../src/redux/features/tasks/tasksSlice';
import vaultReducer from '../src/redux/features/vault/vaultSlice';
import NeedsAttentionScreen from '../src/screens/mainScreens/needsAttentionScreen/NeedsAttentionScreen';
import {
  mockNeedsAttentionResponse,
  mockPastReminder,
  mockRecipientOnlyReminder,
  mockUpcomingReminder,
} from '../src/__test_fixtures__/reminderFixtures';

const mockMetrics = {
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
  frame: { x: 0, y: 0, width: 375, height: 812 },
};

const createTestStore = () =>
  configureStore({
    reducer: {
      reminders: remindersReducer,
      needsAttention: needsAttentionReducer,
      tasks: tasksReducer,
      vault: vaultReducer,
      family: (state = { basicFamilyData: null, myFamilyData: null }) => state,
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

const renderWithProvider = async (component: React.ReactElement) => {
  const store = createTestStore();
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={mockMetrics}>
          {component}
        </SafeAreaProvider>
      </Provider>
    );
  });
  return renderer!;
};

const getAllTexts = (renderer: ReactTestRenderer.ReactTestRenderer): string[] =>
  renderer.root
    .findAllByType(Text)
    .map((n) =>
      Array.isArray(n.props.children)
        ? n.props.children.join('')
        : String(n.props.children ?? '')
    );

describe('NeedsAttentionScreen (Unified /home/needs-attention)', () => {
  it('renders unified sections and filter pills with live backend counts', async () => {
    const renderer = await renderWithProvider(<NeedsAttentionScreen />);
    const texts = getAllTexts(renderer);

    expect(texts).toContain('All 4');
    expect(texts).toContain('Overdue 1');
    expect(texts).toContain('Due soon 1');
    expect(texts).toContain('Renewals 1');
    expect(texts).toContain('Important 1');

    expect(texts).toContain('OVERDUE');
    expect(texts).toContain('DUE SOON');
    expect(texts).toContain('RENEWALS');
    expect(texts).toContain('IMPORTANT DATES');

    expect(texts).toContain('Pay school bus fee');
    expect(texts).toContain('Call the plumber about the kitchen tap');
    expect(texts).toContain('Car insurance · ₹14,250');
    expect(texts).toContain("Nani's birthday");
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Add reminder' })
    ).toHaveLength(0);
  });

  it('filters to OVERDUE, DUE_SOON, RENEWALS, and IMPORTANT_DATES sections', async () => {
    const overdueRenderer = await renderWithProvider(
      <NeedsAttentionScreen initialFilter="OVERDUE" />
    );
    const overdueTexts = getAllTexts(overdueRenderer);
    expect(overdueTexts).toContain('Pay school bus fee');
    expect(overdueTexts).not.toContain('RENEWALS');

    const renewalsRenderer = await renderWithProvider(
      <NeedsAttentionScreen initialFilter="RENEWALS" />
    );
    const renewalsTexts = getAllTexts(renewalsRenderer);
    expect(renewalsTexts).toContain('Car insurance · ₹14,250');
    expect(renewalsTexts).not.toContain('OVERDUE');
  });

  it('opens ReminderDetailModal for REMINDER items and delegates VAULT/TASK items to onItemPress', async () => {
    const onItemPress = jest.fn();
    const renderer = await renderWithProvider(
      <NeedsAttentionScreen onItemPress={onItemPress} />
    );

    const vaultRow = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) =>
        t.findAllByType(Text).some((tx) =>
          String(tx.props.children || '').includes('Car insurance')
        )
      );
    expect(vaultRow).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      vaultRow?.props.onPress();
    });
    expect(onItemPress).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'VAULT',
        rawId: '0abcfba3-0000-4000-8000-000000000002',
      })
    );

    const reminderRow = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) =>
        t.findAllByType(Text).some(
          (tx) => tx.props.children === 'Call the plumber about the kitchen tap'
        )
      );
    expect(reminderRow).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      reminderRow?.props.onPress();
    });

    const textsAfterTap = getAllTexts(renderer);
    expect(textsAfterTap).toContain('Reminder');
    expect(textsAfterTap).toContain('Edit');
  });
});
