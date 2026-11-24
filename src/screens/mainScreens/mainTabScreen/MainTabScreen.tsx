import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Colors from '../../../units/Colors';
import BottomNavBar from '../homeScreen/components/BottomNavBar';
import { NavigationTab, BriefTimeframe } from '../homeScreen/types';
import HomeScreen from '../homeScreen/HomeScreen';
import TasksScreen from '../tasksScreen/TasksScreen';
import CalendarScreen from '../calendarScreen/CalendarScreen';
import ChatsScreen from '../chatScreen/ChatsScreen';
import { CreateTaskModal } from '../tasksScreen/components';
import { CreateEventModal } from '../calendarScreen/components';
import { TaskItem } from '../tasksScreen/types';
import { CalendarEvent } from '../calendarScreen/types';
import {
  AddSheetModal,
  CreateReminderModal,
  ScanDocumentModal,
  AskHosynQModal,
  UploadDocumentModal,
  FamilyVaultModal,
  ConfirmationToast,
  ReminderItem,
  ToastConfig,
} from '../addFlow';
import { SideMenuModal, LogoutConfirmationModal } from '../menuScreens';
import { CompassModal } from '../compassScreen';
import {
  useAppDispatch,
  logout,
  resetFamilyState,
  resetLifeProfileState,
} from '../../../redux';
import { fetchTasks } from '../../../redux/features/tasks/tasksSlice';
import { fetchCalendarFeed } from '../../../redux/features/calendar/calendarSlice';
import { clearUserData } from '../../../units/AsyncStorageManager';

export interface MainTabScreenProps {
  initialTab?: NavigationTab;
  navigation?: any;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onExplorePress?: () => void;
  onOpenBrief?: (timeframe?: BriefTimeframe) => void;
  onOpenNeedsAttention?: () => void;
}

const MainTabScreen: React.FC<MainTabScreenProps> = ({
  initialTab = 'home',
  navigation,
  onProfilePress,
  onNotificationsPress,
  onExplorePress,
  onOpenBrief,
  onOpenNeedsAttention,
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<NavigationTab>(initialTab);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [createTaskModalVisible, setCreateTaskModalVisible] = useState(false);
  const [createEventModalVisible, setCreateEventModalVisible] = useState(false);
  const [createReminderModalVisible, setCreateReminderModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [askModalVisible, setAskModalVisible] = useState(false);
  const [vaultModalVisible, setVaultModalVisible] = useState(false);
  const [compassVisible, setCompassVisible] = useState(false);
  const [uploadedFileForScan, setUploadedFileForScan] = useState<
    string | undefined
  >(undefined);

  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (
    message: string,
    type: 'success' | 'cancelled' | 'info' = 'success'
  ) => {
    setToastConfig({
      visible: true,
      message,
      type,
      onUndo: () => {
        setToastConfig((prev) => ({ ...prev, visible: false }));
      },
      onView: () => {
        setToastConfig((prev) => ({ ...prev, visible: false }));
      },
    });
    setTimeout(() => {
      setToastConfig((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  // Sync activeTab when initialTab prop updates from navigation
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleOpenMenu = onExplorePress || (() => setSideMenuVisible(true));
  const handleAvatarPress = () => setSideMenuVisible(true);
  const handleOpenCompass = () => setCompassVisible(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Primary Tab View */}
      <View style={styles.screenArea}>
        {activeTab === 'home' && (
          <HomeScreen
            showBottomNavBar={false}
            onProfilePress={handleAvatarPress}
            onNotificationsPress={onNotificationsPress}
            onExplorePress={handleOpenMenu}
            onCompassPress={handleOpenCompass}
            onOpenBrief={onOpenBrief}
            onOpenNeedsAttention={onOpenNeedsAttention}
            onAllTasksPress={() => setActiveTab('tasks')}
            onOpenCalendar={() => setActiveTab('calendar')}
            onAddTaskPress={() => setCreateTaskModalVisible(true)}
            onAddEventPress={() => setCreateEventModalVisible(true)}
            onScanPress={() => setScanModalVisible(true)}
            onAddPress={() => setAddSheetVisible(true)}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksScreen
            showBottomNavBar={false}
            onProfilePress={handleAvatarPress}
            onNotificationsPress={onNotificationsPress}
            onExplorePress={handleOpenMenu}
            onCompassPress={handleOpenCompass}
            onTabChange={setActiveTab}
            onOpenCalendar={() => setActiveTab('calendar')}
            onOpenChat={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarScreen
            onProfilePress={handleAvatarPress}
            onNotificationsPress={onNotificationsPress}
            onExplorePress={handleOpenMenu}
            onCompassPress={handleOpenCompass}
            onOpenChat={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'chat' && (
          <ChatsScreen
            onProfilePress={handleAvatarPress}
            onNotificationsPress={onNotificationsPress}
            onExplorePress={handleOpenMenu}
            onCompassPress={handleOpenCompass}
            onOpenVault={() => setVaultModalVisible(true)}
          />
        )}
      </View>

      {/* SINGLE UNIFIED BOTTOM NAVIGATION BAR FOR THE FULL APP */}
      <View style={styles.dockWrapper}>
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddPress={() => setAddSheetVisible(true)}
        />
      </View>

      {/* Confirmation Toast floating above bottom dock */}
      <ConfirmationToast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onUndo={toastConfig.onUndo}
        onView={toastConfig.onView}
      />

      {/* PRIMARY ADD SHEET (ADD-01) */}
      <AddSheetModal
        visible={addSheetVisible}
        onClose={() => setAddSheetVisible(false)}
        onSelectTask={() => {
          setAddSheetVisible(false);
          setCreateTaskModalVisible(true);
        }}
        onSelectEvent={() => {
          setAddSheetVisible(false);
          setCreateEventModalVisible(true);
        }}
        onSelectReminder={() => {
          setAddSheetVisible(false);
          setCreateReminderModalVisible(true);
        }}
        onSelectList={() => {
          setAddSheetVisible(false);
          setActiveTab('tasks');
        }}
        onSelectScan={() => {
          setAddSheetVisible(false);
          setScanModalVisible(true);
        }}
        onSelectUpload={() => {
          setAddSheetVisible(false);
          setUploadModalVisible(true);
        }}
        onSelectAsk={() => {
          setAddSheetVisible(false);
          setAskModalVisible(true);
        }}
      />

      {/* Quick Task Creator (Task screen modal) */}
      <CreateTaskModal
        visible={createTaskModalVisible}
        onClose={() => setCreateTaskModalVisible(false)}
        onCreateTask={(_task: Partial<TaskItem>) => {
          dispatch(
            fetchTasks({
              status: 'PENDING',
              today: new Date().toISOString().slice(0, 10),
            })
          );
          setActiveTab('tasks');
          setCreateTaskModalVisible(false);
          showToast('Task added to your family');
        }}
      />

      {/* Quick Event Creator (Calendar screen modal) */}
      <CreateEventModal
        visible={createEventModalVisible}
        onClose={() => setCreateEventModalVisible(false)}
        onSaveEvent={(_event: Partial<CalendarEvent>) => {
          dispatch(
            fetchCalendarFeed({
              from: new Date().toISOString().slice(0, 10),
              to: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
            })
          );
          setActiveTab('calendar');
          setCreateEventModalVisible(false);
          showToast('Event added to your family');
        }}
      />

      {/* Reminder Creator (ADD-02) */}
      <CreateReminderModal
        visible={createReminderModalVisible}
        onClose={() => setCreateReminderModalVisible(false)}
        onSaveReminder={(reminder: ReminderItem) => {
          showToast(`Reminder set for ${reminder.whenText.toLowerCase()}`);
        }}
        onConvertToTask={() => {
          setCreateReminderModalVisible(false);
          setCreateTaskModalVisible(true);
        }}
      />

      {/* Document Scanner Flow (ADD-05 -> ADD-17) */}
      <ScanDocumentModal
        visible={scanModalVisible}
        onClose={() => {
          setScanModalVisible(false);
          setUploadedFileForScan(undefined);
        }}
        onItemsAdded={(count: number) => {
          showToast(`Added ${count} items to your family`);
        }}
        onOpenUpload={() => {
          setScanModalVisible(false);
          setUploadModalVisible(true);
        }}
        onTypeDetailsMyself={() => {
          setScanModalVisible(false);
          setUploadedFileForScan(undefined);
          setCreateTaskModalVisible(true);
        }}
        onOpenVault={() => {
          setScanModalVisible(false);
          setVaultModalVisible(true);
        }}
        onIgnore={() => {
          showToast('Ignored. Nothing was added. The file is saved.', 'cancelled');
        }}
        scannedFileName={uploadedFileForScan}
      />

      {/* Upload Document Picker (ADD-07, ADD-08, ADD-09) */}
      <UploadDocumentModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onFileSelected={(fileName: string) => {
          setUploadedFileForScan(fileName);
          setUploadModalVisible(false);
          setScanModalVisible(true);
        }}
        onScanWithCamera={() => {
          setUploadModalVisible(false);
          setScanModalVisible(true);
        }}
      />

      {/* Ask HosynQ AI Assistant Flow (ADD-19 -> ADD-24) */}
      <AskHosynQModal
        visible={askModalVisible}
        onClose={() => setAskModalVisible(false)}
        onConfirmAdded={(title: string) => {
          showToast(`Added "${title}" to your family`);
        }}
        onCancelProposal={() => {
          showToast('Cancelled. Nothing was changed.', 'cancelled');
        }}
        onMakeTask={() => {
          setAskModalVisible(false);
          setCreateTaskModalVisible(true);
        }}
        onMakeEvent={() => {
          setAskModalVisible(false);
          setCreateEventModalVisible(true);
        }}
      />

      {/* Family Vault (ADD-13) */}
      <FamilyVaultModal
        visible={vaultModalVisible}
        onClose={() => setVaultModalVisible(false)}
      />

      {/* Side Menu Drawer (MNU-01) */}
      <SideMenuModal
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
        userName="Priya Sharma"
        familyRole="Owner"
        familyName="The Sharma Family"
        onSelectMyProfile={() => {
          setSideMenuVisible(false);
          if (onProfilePress) {
            onProfilePress();
          } else if (navigation) {
            navigation.navigate('MyProfile');
          }
        }}
        onSelectNotifications={() => navigation?.navigate('NotificationPreferences')}
        onSelectPrivacyConsent={() => navigation?.navigate('PrivacyConsent')}
        onSelectSecurity={() => navigation?.navigate('Security')}
        onSelectSubscription={() => navigation?.navigate('Subscription')}
        onSelectAccount={() => navigation?.navigate('Account')}
        onSelectHelpSupport={() => navigation?.navigate('HelpSupport')}
        onSelectPolicies={() => navigation?.navigate('Policies')}
        onSelectAbout={() => navigation?.navigate('AboutUs')}
        onLogout={() => setShowLogoutModal(true)}
      />
      <LogoutConfirmationModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirmLogout={async () => {
          setShowLogoutModal(false);
          try {
            await dispatch(logout());
            await clearUserData();
            dispatch(resetFamilyState());
            dispatch(resetLifeProfileState());
          } catch (err) {
            console.log('[MainTabScreen] Logout error:', err);
          }
          if (navigation) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth', params: { screen: 'Onboarding' } }],
            });
          }
        }}
      />

      {/* Compass & Heading Home Modal */}
      <CompassModal
        visible={compassVisible}
        initialScreen="compass"
        onClose={() => setCompassVisible(false)}
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
  sectionHeading: {
    fontSize: 14,
    color: '#8A97AB',
    marginBottom: 16,
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
    fontFamily: 'Roboto-Bold',
    color: '#0B1A2F',
  },
  chatThreadInfo: {
    flex: 1,
  },
  chatThreadName: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
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
