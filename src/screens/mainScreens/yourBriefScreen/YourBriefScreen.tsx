import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../../units/Colors';
import {
  BriefHeader,
  BriefTimeframeSelector,
  BriefAiCard,
  BriefTodayEvents,
  BriefDueTasks,
  BriefWatchOutList,
  BriefSmartSuggestion,
  BriefHowMadeCard,
  BriefWeekDayByDay,
  BriefWhoWorkload,
  BriefComingUpList,
  BriefMonthStatCards,
  BriefLoadingState,
  BriefEmptyState,
} from './components';
import { BriefTimeframe, BriefTaskItem, ChecklistItem } from './types';
import {
  TODAY_AI_TEXT,
  TODAY_EVENTS,
  TODAY_DUE_TASKS,
  TODAY_WATCH_OUT,
  TODAY_SUGGESTION,
  WEEK_AI_TEXT,
  WEEK_DAYS,
  WEEK_MEMBERS,
  WEEK_COMING_UP,
  WEEK_SUGGESTION,
  MONTH_AI_TEXT,
  MONTH_STATS,
  MONTH_MEMBERS,
  MONTH_COMING_UP,
  MONTH_SUGGESTION,
  EMPTY_CHECKLIST,
} from './mockData';

export interface YourBriefScreenProps {
  initialTimeframe?: BriefTimeframe;
  forceLoading?: boolean;
  isEmpty?: boolean;
  onBack?: () => void;
  onShare?: () => void;
  onOpenCalendar?: () => void;
  onOpenTasks?: () => void;
  onAddTask?: () => void;
  onAddEvent?: () => void;
}

const YourBriefScreen: React.FC<YourBriefScreenProps> = ({
  initialTimeframe = 'today',
  forceLoading = false,
  isEmpty = false,
  onBack,
  onShare,
  onOpenCalendar,
  onOpenTasks,
  onAddTask,
  onAddEvent,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<BriefTimeframe>(initialTimeframe);
  const [isLoading, setIsLoading] = useState<boolean>(forceLoading);
  const [isBriefEmpty, setIsBriefEmpty] = useState<boolean>(isEmpty);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Interactive Task List state for "Due today"
  const [tasks, setTasks] = useState<BriefTaskItem[]>(TODAY_DUE_TASKS);

  // Checklist state for Empty state
  const [checklist] = useState<ChecklistItem[]>(EMPTY_CHECKLIST);

  const handleToggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      )
    );
  }, []);

  const handleChecklistItemPress = useCallback((item: ChecklistItem) => {
    if (item.id === 'chk-2') {
      onAddTask?.();
    } else if (item.id === 'chk-3') {
      onAddEvent?.();
    }
  }, [onAddTask, onAddEvent]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare();
    } else {
      Alert.alert('Share Brief', 'Family brief copied to clipboard.');
    }
  }, [onShare]);

  // Demo toggle helper (on title long press) to cycle normal -> loading -> empty
  const handleDebugToggle = useCallback(() => {
    if (!isLoading && !isBriefEmpty) {
      setIsLoading(true);
    } else if (isLoading) {
      setIsLoading(false);
      setIsBriefEmpty(true);
    } else {
      setIsBriefEmpty(false);
    }
  }, [isLoading, isBriefEmpty]);

  const getDateMetaForCurrentTab = () => {
    switch (selectedTimeframe) {
      case 'week':
        return { range: 'Fri 30 Oct – Thu 5 Nov', updated: 'Updated 7:00 AM' };
      case 'month':
        return { range: 'October 2026', updated: 'Updated 7:00 AM' };
      case 'today':
      default:
        return { range: 'Friday, 30 October', updated: 'Updated 2:10 PM' };
    }
  };

  const dateMeta = getDateMetaForCurrentTab();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Top Header Bar */}
      <BriefHeader
        onBackPress={onBack}
        onSharePress={handleShare}
        onStateTogglePress={handleDebugToggle}
      />

      {/* Timeframe Pill Selector (Today / Week / Month) */}
      <BriefTimeframeSelector
        selectedTimeframe={selectedTimeframe}
        onSelectTimeframe={setSelectedTimeframe}
      />

      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {isLoading ? (
          // ================= Loading View (Pic 5) =================
          <BriefLoadingState dateRangeText={dateMeta.range} />
        ) : isBriefEmpty ? (
          // ================= Empty State View (Pic 3) =================
          <BriefEmptyState
            checklist={checklist}
            onAddTaskPress={onAddTask || (() => Alert.alert('Add Task', 'Open task creation'))}
            onChecklistItemPress={handleChecklistItemPress}
          />
        ) : selectedTimeframe === 'today' ? (
          // ================= Today View (Pic 1) =================
          <>
            <BriefAiCard
              dateRangeText={dateMeta.range}
              updatedText={dateMeta.updated}
              summaryText={TODAY_AI_TEXT}
            />

            <BriefTodayEvents
              events={TODAY_EVENTS}
              onOpenCalendar={onOpenCalendar}
              onEventPress={(event) =>
                Alert.alert(event.title, `${event.location}\nAttendees: ${event.attendees}`)
              }
            />

            <BriefDueTasks
              tasks={tasks}
              onOpenTasks={onOpenTasks}
              onToggleTask={handleToggleTask}
            />

            <BriefWatchOutList
              items={TODAY_WATCH_OUT}
              onItemPress={(item) => Alert.alert(item.title, item.subtitle)}
            />

            <BriefSmartSuggestion
              sectionTitle="Suggested for today"
              suggestion={TODAY_SUGGESTION}
              onConfirm={() => Alert.alert('Confirmed', 'Reminder set for Rohan at 6:00 PM.')}
              onIgnore={() => Alert.alert('Ignored', 'Suggestion dismissed.')}
            />

            <BriefHowMadeCard
              description="From 7 tasks, 3 events and 2 reminders in your family’s HosynQ. Nothing from outside the app."
              textColor="#C9D1DC"
              onFeedback={(useful) =>
                Alert.alert(
                  'Thank you',
                  useful ? 'Glad this was helpful!' : 'Thanks for your feedback.'
                )
              }
            />
          </>
        ) : selectedTimeframe === 'week' ? (
          // ================= Week View (Pic 2) =================
          <>
            <BriefAiCard
              dateRangeText={dateMeta.range}
              updatedText={dateMeta.updated}
              summaryText={WEEK_AI_TEXT}
            />

            <BriefWeekDayByDay days={WEEK_DAYS} />

            <BriefWhoWorkload
              sectionTitle="Who’s doing what"
              members={WEEK_MEMBERS}
            />

            <BriefComingUpList
              sectionTitle="Coming up"
              items={WEEK_COMING_UP}
              onItemPress={(item) => Alert.alert(item.title, item.subtitle)}
            />

            <BriefSmartSuggestion
              sectionTitle="Suggested this week"
              suggestion={WEEK_SUGGESTION}
              onConfirm={() =>
                Alert.alert('Confirmed', 'Task moved to Sunday for Rohan.')
              }
              onIgnore={() => Alert.alert('Ignored', 'Suggestion dismissed.')}
            />

            <BriefHowMadeCard
              description="From 11 tasks and 4 events planned between 30 October and 5 November."
              onFeedback={(useful) =>
                Alert.alert(
                  'Thank you',
                  useful ? 'Glad this was helpful!' : 'Thanks for your feedback.'
                )
              }
            />
          </>
        ) : (
          // ================= Month View (Pic 4) =================
          <>
            <BriefAiCard
              dateRangeText={dateMeta.range}
              updatedText={dateMeta.updated}
              summaryText={MONTH_AI_TEXT}
            />

            <BriefMonthStatCards stats={MONTH_STATS} />

            <BriefWhoWorkload
              sectionTitle="Who got things done"
              members={MONTH_MEMBERS}
            />

            <BriefComingUpList
              sectionTitle="Coming in November"
              items={MONTH_COMING_UP}
              onItemPress={(item) => Alert.alert(item.title, item.subtitle)}
            />

            <BriefSmartSuggestion
              sectionTitle="Suggested this month"
              suggestion={MONTH_SUGGESTION}
              onConfirm={() =>
                Alert.alert('Confirmed', 'Added task to renew Rohan’s passport.')
              }
              onIgnore={() => Alert.alert('Ignored', 'Suggestion dismissed.')}
            />

            <BriefHowMadeCard
              description="From 38 completed tasks, 12 events and the renewal dates in your family’s Life Profiles."
              textColor="#B6B8B8"
              onFeedback={(useful) =>
                Alert.alert(
                  'Thank you',
                  useful ? 'Glad this was helpful!' : 'Thanks for your feedback.'
                )
              }
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

export default YourBriefScreen;
