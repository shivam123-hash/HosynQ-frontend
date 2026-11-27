import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  deleteReminderThunk,
  fetchRemindersThunk,
  updateReminderThunk,
} from '../../../redux/features/reminders/remindersSlice';
import {
  ReminderApi,
  ReminderStatus,
} from '../../../services/remindersServices';
import { NeedsAttentionSkeleton } from '../../../components/SkeletonLoader';
import { CreateReminderModal } from '../addFlow/CreateReminderModal';
import { ConfirmationToast } from '../addFlow/ConfirmationToast';
import { ToastConfig } from '../addFlow/types';
import ReminderDialog, {
  INITIAL_REMINDER_DIALOG_STATE,
  ReminderDialogState,
} from '../addFlow/ReminderDialog';
import {
  formatReminderRecipients,
  formatReminderScheduleLabel,
  formatRepeatSummary,
  isJestTestEnv,
  scheduleReminderAfterTransition,
} from '../addFlow/reminderApiHelpers';
import ReminderDetailModal from '../needsAttentionScreen/ReminderDetailModal';

export interface RemindersScreenProps {
  initialStatus?: ReminderStatus;
  visible?: boolean;
  asModal?: boolean;
  onBack?: () => void;
  onClose?: () => void;
}

const DEFAULT_LIMIT = 10;

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  initialStatus = 'UPCOMING',
  visible = true,
  asModal = false,
  onBack,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const remindersState = useAppSelector((state) => state.reminders);
  const isTestEnv = isJestTestEnv();

  const [activeStatus, setActiveStatus] =
    useState<ReminderStatus>(initialStatus);
  const [refreshing, setRefreshing] = useState(false);
  const didInitialLoadRef = useRef(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [detailReminder, setDetailReminder] = useState<{
    id: string;
    initial?: ReminderApi | null;
  } | null>(null);
  const [dialog, setDialog] = useState<ReminderDialogState>(
    INITIAL_REMINDER_DIALOG_STATE
  );
  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback(
    (
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
    },
    []
  );

  const loadBoth = useCallback(
    async (statusToPrioritize: ReminderStatus = 'UPCOMING') => {
      const otherStatus: ReminderStatus =
        statusToPrioritize === 'UPCOMING' ? 'PAST' : 'UPCOMING';
      await Promise.all([
        dispatch(
          fetchRemindersThunk({
            status: statusToPrioritize,
            limit: DEFAULT_LIMIT,
          })
        ),
        dispatch(
          fetchRemindersThunk({
            status: otherStatus,
            limit: DEFAULT_LIMIT,
          })
        ),
      ]);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!visible) {
      didInitialLoadRef.current = false;
      return;
    }
    if (didInitialLoadRef.current) return;
    if (
      isTestEnv &&
      remindersState.hasLoadedUpcoming &&
      remindersState.hasLoadedPast
    ) {
      didInitialLoadRef.current = true;
      return;
    }
    didInitialLoadRef.current = true;
    return scheduleReminderAfterTransition(() => {
      loadBoth(initialStatus);
    });
  }, [
    visible,
    isTestEnv,
    initialStatus,
    remindersState.hasLoadedUpcoming,
    remindersState.hasLoadedPast,
    loadBoth,
  ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadBoth(activeStatus);
    } finally {
      setRefreshing(false);
    }
  }, [activeStatus, loadBoth]);

  const handleSelectStatus = useCallback((status: ReminderStatus) => {
    setActiveStatus(status);
  }, []);

  const reminders =
    activeStatus === 'PAST' ? remindersState.past : remindersState.upcoming;
  const pagination =
    activeStatus === 'PAST'
      ? remindersState.pastPagination
      : remindersState.upcomingPagination;

  const isInitialLoading =
    !isTestEnv &&
    !refreshing &&
    (activeStatus === 'PAST'
      ? !remindersState.hasLoadedPast && remindersState.loadingPast
      : !remindersState.hasLoadedUpcoming && remindersState.loadingUpcoming) &&
    reminders.length === 0;

  const handleLoadMore = useCallback(async () => {
    const cursor = pagination?.nextCursor?.trim();
    if (remindersState.loadingMore || !pagination?.hasMore || !cursor) return;
    await dispatch(
      fetchRemindersThunk({
        status: activeStatus,
        limit: DEFAULT_LIMIT,
        before: cursor,
      })
    );
  }, [activeStatus, dispatch, pagination?.hasMore, pagination?.nextCursor, remindersState.loadingMore]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 120) {
        handleLoadMore();
      }
    },
    [handleLoadMore]
  );

  const handleToggleDone = async (item: ReminderApi) => {
    try {
      await dispatch(
        updateReminderThunk({
          id: item.id,
          payload: { done: !item.done },
        })
      ).unwrap();
    } catch (err: any) {
      setDialog({
        visible: true,
        type: 'danger',
        iconName: 'alert-circle',
        title: 'Could not update reminder',
        description: String(err || 'Please try again.'),
        primaryButtonText: 'OK',
      });
    }
  };

  const handleBackAction = onBack || onClose;

  const upCount = Math.max(
    remindersState.counts?.upcoming || 0,
    remindersState.upcoming.length
  );
  const pastCount = Math.max(
    remindersState.counts?.past || 0,
    remindersState.past.length
  );

  const screenContent = (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackAction}
          activeOpacity={0.7}
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Reminders</Text>

        <TouchableOpacity
          onPress={() => setCreateVisible(true)}
          activeOpacity={0.7}
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="Add reminder"
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Segmented Status Tabs: UPCOMING / PAST */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsTrack}>
          <TouchableOpacity
            onPress={() => handleSelectStatus('UPCOMING')}
            activeOpacity={0.8}
            style={[
              styles.tabBtn,
              activeStatus === 'UPCOMING' && styles.tabBtnActive,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: activeStatus === 'UPCOMING' }}
          >
            <Text
              style={[
                styles.tabText,
                activeStatus === 'UPCOMING' && styles.tabTextActive,
              ]}
            >
              Upcoming ({upCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelectStatus('PAST')}
            activeOpacity={0.8}
            style={[
              styles.tabBtn,
              activeStatus === 'PAST' && styles.tabBtnActive,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: activeStatus === 'PAST' }}
          >
            <Text
              style={[
                styles.tabText,
                activeStatus === 'PAST' && styles.tabTextActive,
              ]}
            >
              Past ({pastCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reminders List Body */}
      {isInitialLoading ? (
        <NeedsAttentionSkeleton />
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={200}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {reminders.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Feather name="bell" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {activeStatus === 'PAST'
                  ? 'No past reminders yet'
                  : 'No upcoming reminders'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeStatus === 'PAST'
                  ? 'Completed or already-triggered reminders will appear here.'
                  : 'Set quick timed or repeating nudges for yourself or your family.'}
              </Text>
              {activeStatus === 'UPCOMING' && (
                <TouchableOpacity
                  style={styles.emptyCtaBtn}
                  onPress={() => setCreateVisible(true)}
                  activeOpacity={0.85}
                >
                  <Feather
                    name="plus"
                    size={16}
                    color="#0B1A2F"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.emptyCtaText}>Set a reminder</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <Text style={styles.sectionLabel}>
                {activeStatus === 'PAST'
                  ? 'PAST & DONE REMINDERS'
                  : 'UPCOMING REMINDERS'}
              </Text>

              <View style={styles.card}>
                {reminders.map((item, idx) => {
                  const schedule = formatReminderScheduleLabel(
                    item.remindOn,
                    item.remindTime
                  );
                  const who = formatReminderRecipients(item);
                  const rep = item.repeat
                    ? ` · ${formatRepeatSummary(
                        item.repeat,
                        item.repeatDays,
                        item.repeatEndsOn
                      )}`
                    : '';
                  const subtitle = `${
                    item.done ? 'Done · ' : ''
                  }${schedule} · ${who}${rep}`;

                  const showQuickButton =
                    activeStatus === 'UPCOMING' || item.done;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.itemRow, idx > 0 && styles.rowBorder]}
                      onPress={() =>
                        setDetailReminder({ id: item.id, initial: item })
                      }
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityLabel={item.text}
                    >
                      <View
                        style={[
                          styles.iconCircle,
                          item.done
                            ? styles.doneIconCircle
                            : activeStatus === 'PAST'
                            ? styles.pastIconCircle
                            : styles.upcomingIconCircle,
                        ]}
                      >
                        <Feather
                          name={
                            item.done
                              ? 'check-circle'
                              : activeStatus === 'PAST'
                              ? 'clock'
                              : 'bell'
                          }
                          size={19}
                          color={
                            item.done
                              ? '#6FD9A6'
                              : activeStatus === 'PAST'
                              ? '#8A97AB'
                              : '#F6C08E'
                          }
                        />
                      </View>

                      <View style={styles.contentColumn}>
                        <Text style={styles.titleText} numberOfLines={2}>
                          {item.text}
                        </Text>
                        <Text style={styles.subtitleText} numberOfLines={1}>
                          {subtitle}
                        </Text>
                      </View>

                      {showQuickButton ? (
                        <TouchableOpacity
                          style={styles.actionPill}
                          onPress={() => handleToggleDone(item)}
                          activeOpacity={0.75}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Text style={styles.actionPillText}>
                            {item.done ? 'Undo' : 'Done'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Feather
                          name="chevron-right"
                          size={18}
                          color="#5A6880"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {pagination?.hasMore && Boolean(pagination?.nextCursor?.trim()) && (
                <TouchableOpacity
                  style={styles.loadMoreBtn}
                  onPress={handleLoadMore}
                  disabled={remindersState.loadingMore}
                  activeOpacity={0.8}
                >
                  {remindersState.loadingMore ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.loadMoreText}>Load more reminders</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Confirmation Toast */}
      <ConfirmationToast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onUndo={toastConfig.onUndo}
        onView={toastConfig.onView}
      />

      {/* Reminder Detail Modal (GET /reminders/:id, PATCH, DELETE) */}
      <ReminderDetailModal
        visible={Boolean(detailReminder)}
        reminderId={detailReminder?.id}
        initialReminder={detailReminder?.initial}
        onClose={() => setDetailReminder(null)}
        onUpdated={() => {
          loadBoth(activeStatus);
        }}
        onDeleted={() => {
          loadBoth(activeStatus);
          showToast('Reminder removed', 'cancelled');
        }}
      />

      {/* Create Reminder Sheet (POST /reminders) */}
      <CreateReminderModal
        asModal={false}
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
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
                setDetailReminder({ id: created.id, initial: created }),
              onUndo: !isEdit
                ? () => {
                    dispatch(deleteReminderThunk(created.id));
                  }
                : undefined,
            }
          );
          loadBoth(activeStatus);
        }}
      />

      <ReminderDialog
        dialog={dialog}
        onClose={() => setDialog(INITIAL_REMINDER_DIALOG_STATE)}
      />
    </SafeAreaView>
  );

  if (asModal) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleBackAction}
      >
        {screenContent}
      </Modal>
    );
  }

  return screenContent;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2A4163',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  tabsWrapper: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
  },
  tabsTrack: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 4,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#9DB0C7',
  },
  tabTextActive: {
    fontFamily: 'Roboto-Bold',
    color: '#0B1A2F',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.1,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 72,
    gap: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderBold,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingIconCircle: {
    borderColor: '#6E4924',
  },
  pastIconCircle: {
    borderColor: '#3A4556',
  },
  doneIconCircle: {
    borderColor: '#2A5945',
  },
  contentColumn: {
    flex: 1,
    gap: 4,
  },
  titleText: {
    fontSize: 15.5,
    lineHeight: 20,
    fontFamily: 'Roboto-Medium',
    color: '#DCE6F1',
  },
  subtitleText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Roboto-Regular',
    color: '#8A97AB',
  },
  actionPill: {
    height: 34,
    minWidth: 74,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    color: '#CAD4DF',
  },
  loadMoreBtn: {
    marginTop: 16,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#2A4163',
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.primary,
  },
  emptyCard: {
    marginTop: 24,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 24,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#6E4924',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16.5,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyCtaBtn: {
    marginTop: 16,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCtaText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#0B1A2F',
  },
});

export default RemindersScreen;
