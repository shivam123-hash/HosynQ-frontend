import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  BackHandler,
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
  buildCreateEventPayload,
  extractFamilyMembersFromState,
} from '../calendarScreen/calendarApiHelpers';
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
import { ReminderDetailModal } from '../needsAttentionScreen';
import { RemindersScreen } from '../remindersScreen';
import { deleteReminderThunk } from '../../../redux/features/reminders/remindersSlice';
import { fetchNeedsAttentionThunk } from '../../../redux/features/home/needsAttentionSlice';
import { ReminderApi } from '../../../services/remindersServices';
import { formatReminderScheduleLabel } from '../addFlow/reminderApiHelpers';
import { SideMenuModal, LogoutConfirmationModal } from '../menuScreens';
import { CompassModal } from '../compassScreen';
import {
  useAppDispatch,
  useAppSelector,
  logout,
  resetFamilyState,
  resetLifeProfileState,
} from '../../../redux';
import { fetchTasks } from '../../../redux/features/tasks/tasksSlice';
import {
  fetchCalendarFeed,
  createCalendarEvent,
} from '../../../redux/features/calendar/calendarSlice';
import {
  getMyFamilyBasicThunk,
  getMyFamilyThunk,
} from '../../../redux/features/family/familySlice';
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
  const familyState = useAppSelector((state) => state.family);
  const familyMembersList = useMemo(() => {
    return extractFamilyMembersFromState(familyState);
  }, [familyState]);

  useEffect(() => {
    if (familyMembersList.length === 0) {
      dispatch(getMyFamilyBasicThunk());
      dispatch(getMyFamilyThunk());
    }
  }, [familyMembersList.length, dispatch]);
  const [activeTab, setActiveTab] = useState<NavigationTab>(initialTab);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [createTaskModalVisible, setCreateTaskModalVisible] = useState(false);
  const [createEventModalVisible, setCreateEventModalVisible] = useState(false);
  const [createReminderModalVisible, setCreateReminderModalVisible] = useState(false);
  const [remindersListModalVisible, setRemindersListModalVisible] = useState(false);
  const [selectedReminderForDetail, setSelectedReminderForDetail] = useState<{
    id: string;
    initial?: ReminderApi | null;
  } | null>(null);
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
    type: 'success' | 'cancelled' | 'info' = 'success',
    actions?: { onUndo?: () => void; onView?: () => void }
  ) => {
    setToastConfig({
      visible: true,
      message,
      type,
      onUndo: () => {
        setToastConfig((prev) => ({ ...prev, visible: false }));
        actions?.onUndo?.();
      },
      onView: () => {
        setToastConfig((prev) => ({ ...prev, visible: false }));
        actions?.onView?.();
      },
    });
    setTimeout(() => {
      setToastConfig((prev) => ({ ...prev, visible: false }));
    }, 4500);
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

  const handleNavigateToItem = useCallback(
    (type: 'TASK' | 'EVENT' | 'LIST', itemId: string, meta?: any) => {
      if (type === 'TASK' || type === 'LIST') {
        setActiveTab('tasks');
      } else if (type === 'EVENT') {
        setActiveTab('calendar');
      }
    },
    []
  );

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
            onNavigateToItem={handleNavigateToItem}
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
          if (navigation && typeof navigation.navigate === 'function') {
            navigation.navigate('Reminders');
          } else {
            setRemindersListModalVisible(true);
          }
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
        members={familyMembersList}
        initialDate={new Date().toISOString().slice(0, 10)}
        onClose={() => setCreateEventModalVisible(false)}
        onSaveEvent={async (eventData: Partial<CalendarEvent>) => {
          try {
            const payload = buildCreateEventPayload(eventData);
            console.log('[MainTabScreen.onSaveEvent] Creating event payload:', payload);
            try {
              console.log(
                '[MainTabScreen.onSaveEvent] Backend Create Payload (formatted):\n',
                JSON.stringify(payload, null, 2)
              );
            } catch {
              // ignore serialization error
            }
            const created = await dispatch(createCalendarEvent(payload)).unwrap();
            console.log('[MainTabScreen.onSaveEvent] Create success, created event:', created);
            if (activeTab === 'calendar') {
              dispatch(
                fetchCalendarFeed({
                  from: new Date().toISOString().slice(0, 10),
                  to: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                })
              );
            }
            setActiveTab('calendar');
            setCreateEventModalVisible(false);
            showToast('Event added to your family');
          } catch (err: any) {
            console.log('[MainTabScreen.onSaveEvent] Create event error:', err);
            showToast(err?.message || 'Failed to create event', 'cancelled');
          }
        }}
      />

      {/* Reminder Creator (ADD-02) */}
      <CreateReminderModal
        visible={createReminderModalVisible}
        onClose={() => setCreateReminderModalVisible(false)}
        onApiSaved={(created, isEdit) => {
          const whenLabel = formatReminderScheduleLabel(
            created.remindOn,
            created.remindTime
          );
          showToast(
            isEdit
              ? `Reminder updated for ${whenLabel}`
              : `Reminder set for ${whenLabel}`,
            'success',
            {
              onView: () =>
                setSelectedReminderForDetail({
                  id: created.id,
                  initial: created,
                }),
              onUndo: !isEdit
                ? () => {
                    dispatch(deleteReminderThunk(created.id));
                  }
                : undefined,
            }
          );
        }}
        onSaveReminder={(_reminder: ReminderItem) => {}}
        onConvertToTask={() => {
          setCreateReminderModalVisible(false);
          setCreateTaskModalVisible(true);
        }}
      />

      {selectedReminderForDetail && (
        <ReminderDetailModal
          visible={Boolean(selectedReminderForDetail)}
          reminderId={selectedReminderForDetail.id}
          initialReminder={selectedReminderForDetail.initial}
          onClose={() => setSelectedReminderForDetail(null)}
          onUpdated={() => {
            dispatch(
              fetchNeedsAttentionThunk({
                section: 'ALL',
                withinDays: 60,
                limit: 30,
              })
            );
          }}
          onDeleted={() => {
            showToast('Reminder removed', 'cancelled');
          }}
        />
      )}

      {/* Reminders List Screen Fallback */}
      <RemindersScreen
        asModal={true}
        visible={remindersListModalVisible}
        onClose={() => setRemindersListModalVisible(false)}
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
