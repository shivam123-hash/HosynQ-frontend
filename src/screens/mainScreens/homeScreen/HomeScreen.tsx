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
  HomeHeader,
  HomeGreeting,
  BriefCard,
  QuickActionsBar,
  NeedsAttentionSection,
  UpcomingEventsSection,
  PendingTasksSection,
  RecentlyDoneSection,
  LifeProfileBanner,
  FamilyPulseSection,
  BottomNavBar,
} from './components';
import {
  INITIAL_ATTENTION_ITEMS,
  INITIAL_UPCOMING_EVENTS,
  INITIAL_PENDING_TASKS,
  INITIAL_RECENTLY_DONE,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_SMART_SUGGESTION,
} from './mockData';
import {
  AttentionItem,
  EventItem,
  TaskItem,
  FamilyMemberStatus,
  NavigationTab,
  BriefTimeframe,
} from './types';

export interface HomeScreenProps {
  showLifeProfileBanner?: boolean;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onExplorePress?: () => void;
  onOpenCalendar?: () => void;
  onAllTasksPress?: () => void;
  onContinueProfile?: () => void;
  onOpenPulse?: () => void;
  onScanPress?: () => void;
  onHeadingHomePress?: () => void;
  onAddTaskPress?: () => void;
  onAddEventPress?: () => void;
  onOpenBrief?: (timeframe?: BriefTimeframe) => void;
  onOpenNeedsAttention?: () => void;
  showBottomNavBar?: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  showLifeProfileBanner = false,
  showBottomNavBar = true,
  onProfilePress,
  onNotificationsPress,
  onExplorePress,
  onOpenCalendar,
  onAllTasksPress,
  onContinueProfile,
  onOpenPulse,
  onScanPress,
  onHeadingHomePress,
  onAddTaskPress,
  onAddEventPress,
  onOpenBrief,
  onOpenNeedsAttention,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  const [attentionItems] = useState<AttentionItem[]>(INITIAL_ATTENTION_ITEMS);
  const [upcomingEvents] = useState<EventItem[]>(INITIAL_UPCOMING_EVENTS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_PENDING_TASKS);
  const [recentlyDone, setRecentlyDone] = useState(INITIAL_RECENTLY_DONE);
  const [familyMembers] = useState<FamilyMemberStatus[]>(INITIAL_FAMILY_MEMBERS);
  const [suggestion, setSuggestion] = useState(INITIAL_SMART_SUGGESTION);

  // Pull to refresh simulation
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Task check/uncheck handler
  const handleToggleTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          const willComplete = !t.isCompleted;
          if (willComplete) {
            // Add to recently done
            setRecentlyDone((prev) => [
              {
                id: `done-${Date.now()}`,
                title: t.title,
                completedBy: t.assignee,
                timeAgo: 'Just now',
              },
              ...prev,
            ]);
          }
          return { ...t, isCompleted: willComplete };
        }
        return t;
      })
    );
  };

  // Reopen task handler
  const handleReopenTask = (doneId: string) => {
    const item = recentlyDone.find((r) => r.id === doneId);
    if (item) {
      setRecentlyDone((prev) => prev.filter((r) => r.id !== doneId));
      Alert.alert('Task Reopened', `"${item.title}" moved back to pending tasks.`);
    }
  };

  const handleFabPress = () => {
    Alert.alert('Quick Action', 'Choose an action to create:', [
      { text: 'Add Task', onPress: onAddTaskPress },
      { text: 'Add Event', onPress: onAddEventPress },
      { text: 'Scan Document', onPress: onScanPress },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <HomeHeader
        onAvatarPress={onProfilePress}
        onExplorePress={onExplorePress}
        onNotificationPress={onNotificationsPress}
      />

      {/* Main Scrollable Dashboard Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* User Greeting */}
        <HomeGreeting
          dateString="Friday, 30 October"
          greeting="Good afternoon"
          userName="Priya"
        />

        {/* AI Daily Brief Card */}
        <BriefCard
          onReadFullBrief={() =>
            onOpenBrief
              ? onOpenBrief('today')
              : Alert.alert(
                  'Daily AI Brief',
                  "Aarav's PTM is at 3:00 PM and Rohan is picking him up. The electricity bill of ₹2,840 is due tomorrow, and Dadi's BP tablets run out on Sunday. Weather is clear with a high of 27°C."
                )
          }
          onTimeframeChange={(tf) => onOpenBrief?.(tf)}
        />

        {/* 4 Quick Action Buttons */}
        <QuickActionsBar
          onAddTask={onAddTaskPress}
          onAddEvent={onAddEventPress}
          onHeadingHome={
            onHeadingHomePress ||
            (() => Alert.alert('Heading Home', 'ETA shared with family members!'))
          }
          onScan={onScanPress}
        />

        {/* Needs Attention Alerts */}
        <NeedsAttentionSection
          items={attentionItems}
          onViewAll={
            onOpenNeedsAttention ||
            (() => Alert.alert('Needs Attention', 'Showing all 3 urgent alerts.'))
          }
          onItemPress={(item) => Alert.alert(item.title, item.subtitle)}
        />

        {/* Upcoming Today Events */}
        <UpcomingEventsSection
          events={upcomingEvents}
          onOpenCalendar={onOpenCalendar}
          onEventPress={(event) =>
            Alert.alert(event.title, `${event.location}\nAttendees: ${event.attendees}`)
          }
        />

        {/* Pending Tasks with Filtering & Checkboxes */}
        <PendingTasksSection
          tasks={tasks}
          onAllTasksPress={onAllTasksPress}
          onToggleTask={handleToggleTask}
          onTaskPress={(t) => Alert.alert(t.title, `Due: ${t.dueDate} · Assigned to: ${t.assignee}`)}
        />

        {/* Recently Done Section */}
        <RecentlyDoneSection
          items={recentlyDone}
          onReopen={handleReopenTask}
        />

        {/* Life Profile Progress Card (Optional - from Pic 2 spec) */}
        {showLifeProfileBanner && (
          <LifeProfileBanner
            progressPercent={35}
            completedSections={2}
            totalSections={6}
            onContinue={onContinueProfile}
          />
        )}

        {/* Family Pulse Status & AI Suggestion */}
        <FamilyPulseSection
          members={familyMembers}
          suggestion={suggestion}
          onOpenPulse={onOpenPulse}
          onMemberPress={(m) =>
            Alert.alert(m.name, `Location: ${m.location}\nStatus: ${m.status}`)
          }
          onConfirmSuggestion={() =>
            setSuggestion((prev) => ({
              ...prev,
              state: 'confirmed',
              resultText: 'reminder sent to Rohan',
            }))
          }
          onEditSuggestion={() =>
            Alert.alert('Edit Suggestion', 'Customise suggestion details.')
          }
          onIgnoreSuggestion={() =>
            setSuggestion((prev) => ({
              ...prev,
              state: 'ignored',
            }))
          }
        />
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      {showBottomNavBar && (
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'calendar') onOpenCalendar?.();
            if (tab === 'tasks') onAllTasksPress?.();
          }}
          onAddPress={handleFabPress}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 160, // Generous padding so content isn't obscured by floating BottomNavBar
  },
});
