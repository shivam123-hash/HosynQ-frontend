import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  ScrollView,
} from 'react-native';
import Colors from '../../../units/Colors';
import AppTopBar from '../../../components/AppTopBar';
import BottomNavBar from '../homeScreen/components/BottomNavBar';
import { NavigationTab, BriefTimeframe } from '../homeScreen/types';
import HomeScreen from '../homeScreen/HomeScreen';
import TasksScreen from '../tasksScreen/TasksScreen';
import { CreateTaskModal } from '../tasksScreen/components';
import { TaskItem } from '../tasksScreen/types';
import { INITIAL_UPCOMING_EVENTS } from '../homeScreen/mockData';

export interface MainTabScreenProps {
  initialTab?: NavigationTab;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onExplorePress?: () => void;
  onOpenBrief?: (timeframe?: BriefTimeframe) => void;
  onOpenNeedsAttention?: () => void;
}

const MainTabScreen: React.FC<MainTabScreenProps> = ({
  initialTab = 'home',
  onProfilePress,
  onNotificationsPress,
  onExplorePress,
  onOpenBrief,
  onOpenNeedsAttention,
}) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(initialTab);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Sync activeTab when initialTab prop updates from navigation
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Primary Tab View */}
      <View style={styles.screenArea}>
        {activeTab === 'home' && (
          <HomeScreen
            showBottomNavBar={false}
            onProfilePress={onProfilePress}
            onNotificationsPress={onNotificationsPress}
            onExplorePress={onExplorePress}
            onOpenBrief={onOpenBrief}
            onOpenNeedsAttention={onOpenNeedsAttention}
            onAllTasksPress={() => setActiveTab('tasks')}
            onOpenCalendar={() => setActiveTab('calendar')}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksScreen
            showBottomNavBar={false}
            onProfilePress={onProfilePress}
            onNotificationsPress={onNotificationsPress}
            onExplorePress={onExplorePress}
            onTabChange={setActiveTab}
            onOpenCalendar={() => setActiveTab('calendar')}
            onOpenChat={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'calendar' && (
          <View style={styles.placeholderContainer}>
            {/* Unified App Top Bar */}
            <AppTopBar
              onAvatarPress={onProfilePress}
              onExplorePress={onExplorePress}
              onNotificationsPress={onNotificationsPress}
            />

            <ScrollView
              contentContainerStyle={styles.placeholderContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.calendarDateText}>Friday, 30 October</Text>
              <Text style={styles.sectionHeading}>Upcoming family events</Text>

              {INITIAL_UPCOMING_EVENTS.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventTimeColumn}>
                    <Text style={styles.eventTime}>{event.time}</Text>
                    <Text style={styles.eventPeriod}>{event.period}</Text>
                  </View>
                  <View style={styles.eventDivider} />
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventLocation}>
                      {`${event.location} · ${event.attendees}`}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'chat' && (
          <View style={styles.placeholderContainer}>
            {/* Unified App Top Bar */}
            <AppTopBar
              onAvatarPress={onProfilePress}
              onExplorePress={onExplorePress}
              onNotificationsPress={onNotificationsPress}
            />

            <ScrollView
              contentContainerStyle={styles.placeholderContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionHeading}>The Sharma Family</Text>
              <View style={styles.chatThreadCard}>
                <View style={styles.chatThreadHeader}>
                  <View style={styles.chatAvatar}>
                    <Text style={styles.chatAvatarText}>S</Text>
                  </View>
                  <View style={styles.chatThreadInfo}>
                    <Text style={styles.chatThreadName}>Family General</Text>
                    <Text style={styles.chatThreadLastMsg}>
                      Rohan: Switched it off now. Thanks!
                    </Text>
                  </View>
                  <Text style={styles.chatTime}>9:45 AM</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* SINGLE UNIFIED BOTTOM NAVIGATION BAR FOR THE FULL APP */}
      <View style={styles.dockWrapper}>
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddPress={() => setCreateModalVisible(true)}
        />
      </View>

      {/* Global Quick Task Creator from Center FAB */}
      <CreateTaskModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreateTask={(_task: Partial<TaskItem>) => {
          setActiveTab('tasks');
          setCreateModalVisible(false);
        }}
      />
    </View>
  );
};

export default MainTabScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenArea: {
    flex: 1,
  },
  dockWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  placeholderContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150,
  },
  calendarDateText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#CAD4DF',
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 14,
    color: '#8A97AB',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 12,
  },
  eventTimeColumn: {
    width: 50,
    alignItems: 'center',
  },
  eventTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CAD4DF',
  },
  eventPeriod: {
    fontSize: 11,
    color: '#8A97AB',
  },
  eventDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#1F3352',
    marginHorizontal: 14,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 13,
    color: '#8A97AB',
  },
  chatThreadCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
  },
  chatThreadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1A2F',
  },
  chatThreadInfo: {
    flex: 1,
  },
  chatThreadName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CAD4DF',
    marginBottom: 2,
  },
  chatThreadLastMsg: {
    fontSize: 13,
    color: '#8A97AB',
  },
  chatTime: {
    fontSize: 12,
    color: '#8A97AB',
  },
});
