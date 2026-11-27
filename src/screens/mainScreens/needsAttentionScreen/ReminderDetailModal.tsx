import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  deleteReminderThunk,
  fetchReminderDetailThunk,
  setSelectedReminderLocal,
  updateReminderThunk,
} from '../../../redux/features/reminders/remindersSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import { ReminderApi } from '../../../services/remindersServices';
import { ReminderDetailSkeleton } from '../../../components/SkeletonLoader';
import AppOptionsMenu from '../common/AppOptionsMenu';
import {
  CreateReminderModal,
} from '../addFlow/CreateReminderModal';
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

export interface ReminderDetailModalProps {
  visible: boolean;
  reminderId?: string | null;
  initialReminder?: ReminderApi | null;
  onClose: () => void;
  onUpdated?: (reminder: ReminderApi) => void;
  onDeleted?: (deletedId: string) => void;
}

export const ReminderDetailModal: React.FC<ReminderDetailModalProps> = ({
  visible,
  reminderId,
  initialReminder,
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const remindersState = useAppSelector((state) => state.reminders);

  const resolvedId = reminderId || initialReminder?.id || '';
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [dialog, setDialog] = useState<ReminderDialogState>(
    INITIAL_REMINDER_DIALOG_STATE
  );

  const loadDetail = useCallback(async () => {
    if (!resolvedId || !isUUID(resolvedId)) return;
    await dispatch(fetchReminderDetailThunk(resolvedId));
  }, [dispatch, resolvedId]);

  useEffect(() => {
    if (!visible) {
      setIsMenuOpen(false);
      setEditModalVisible(false);
      return;
    }
    if (initialReminder) {
      dispatch(setSelectedReminderLocal(initialReminder));
    }
    if (resolvedId && isUUID(resolvedId) && !(isJestTestEnv() && initialReminder)) {
      return scheduleReminderAfterTransition(() => {
        loadDetail();
      });
    }
    return () => {};
  }, [dispatch, initialReminder, loadDetail, resolvedId, visible]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDetail();
    } finally {
      setRefreshing(false);
    }
  }, [loadDetail]);

  const reminder: ReminderApi | null = useMemo(() => {
    if (
      remindersState.selectedReminder &&
      (!resolvedId || remindersState.selectedReminder.id === resolvedId)
    ) {
      return remindersState.selectedReminder;
    }
    return initialReminder || null;
  }, [initialReminder, remindersState.selectedReminder, resolvedId]);

  const isInitialLoading =
    !reminder && Boolean(resolvedId) && remindersState.loadingDetail;

  const isPastOrDone = Boolean(
    reminder?.done || reminder?.status === 'PAST'
  );
  const canModifyActive = Boolean(reminder?.canEdit && !isPastOrDone);

  const handleToggleDone = async () => {
    if (!reminder || !isUUID(reminder.id)) return;
    try {
      const updated = await dispatch(
        updateReminderThunk({
          id: reminder.id,
          payload: { done: !reminder.done },
        })
      ).unwrap();
      onUpdated?.(updated);
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

  const handleDeleteConfirm = () => {
    if (!reminder || !isUUID(reminder.id)) return;
    setDialog({
      visible: true,
      type: 'danger',
      iconName: 'trash-2',
      title: 'Remove reminder?',
      description: `Delete "${reminder.text}"? It will no longer trigger notifications.`,
      primaryButtonText: 'Remove',
      secondaryButtonText: 'Cancel',
      onConfirm: async () => {
        setDialog((prev) => ({ ...prev, loading: true }));
        try {
          await dispatch(deleteReminderThunk(reminder.id)).unwrap();
          setDialog(INITIAL_REMINDER_DIALOG_STATE);
          onDeleted?.(reminder.id);
          onClose();
        } catch (err: any) {
          setDialog({
            visible: true,
            type: 'danger',
            iconName: 'alert-circle',
            title: 'Remove failed',
            description: String(err || 'Only the creator can remove this reminder.'),
            primaryButtonText: 'OK',
          });
        }
      },
    });
  };

  const statusBadge = useMemo(() => {
    if (!reminder) return null;
    if (reminder.done) {
      return {
        label: 'DONE',
        color: '#6FD9A6',
        borderColor: '#2A5945',
      };
    }
    if (reminder.status === 'PAST') {
      return {
        label: 'SENT · PAST',
        color: '#8A97AB',
        borderColor: '#3A4556',
      };
    }
    return {
      label: 'UPCOMING',
      color: '#F7C08E',
      borderColor: '#6E4924',
    };
  }, [reminder]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={styles.circleBtn}
            accessibilityRole="button"
            accessibilityLabel="Close reminder detail"
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reminder</Text>
          {canModifyActive ? (
            <TouchableOpacity
              onPress={() => setIsMenuOpen((prev) => !prev)}
              activeOpacity={0.7}
              style={styles.circleBtn}
              accessibilityRole="button"
              accessibilityLabel="More options"
            >
              <Feather name="more-horizontal" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {canModifyActive && (
          <AppOptionsMenu
            visible={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            topOffset={insets.top + 60}
            items={[
              {
                id: 'edit',
                label: 'Edit Reminder',
                iconName: 'edit-2',
                onPress: () => setEditModalVisible(true),
              },
              {
                id: 'delete',
                label: 'Remove Reminder',
                iconName: 'trash-2',
                destructive: true,
                onPress: handleDeleteConfirm,
              },
            ]}
          />
        )}

        {isInitialLoading ? (
          <ReminderDetailSkeleton />
        ) : !reminder ? (
          <View style={styles.emptyWrap}>
            <Feather name="bell-off" size={28} color="#8A97AB" />
            <Text style={styles.emptyTitle}>Reminder not found</Text>
            <TouchableOpacity style={styles.emptyBackBtn} onPress={onClose}>
              <Text style={styles.emptyBackBtnText}>Go back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: 110 + insets.bottom },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#F0923A"
                colors={['#F0923A']}
              />
            }
          >
            {/* Main Banner Card */}
            <View style={styles.heroCard}>
              {statusBadge && (
                <View
                  style={[
                    styles.statusPill,
                    { borderColor: statusBadge.borderColor },
                  ]}
                >
                  <Text
                    style={[styles.statusPillText, { color: statusBadge.color }]}
                  >
                    {statusBadge.label}
                  </Text>
                </View>
              )}
              <Text style={styles.heroText}>{reminder.text}</Text>
              <Text style={styles.heroSub}>
                {formatReminderScheduleLabel(
                  reminder.remindOn,
                  reminder.remindTime
                )}
              </Text>
            </View>

            {/* Details Card */}
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.fieldIcon}>
                  <Feather name="clock" size={18} color="#F0923A" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Scheduled for (IST)</Text>
                  <Text style={styles.fieldValue}>
                    {formatReminderScheduleLabel(
                      reminder.remindOn,
                      reminder.remindTime
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.fieldIcon}>
                  <Feather name="repeat" size={18} color="#5B9BF1" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Repeat</Text>
                  <Text style={styles.fieldValue}>
                    {formatRepeatSummary(
                      reminder.repeat,
                      reminder.repeatDays,
                      reminder.repeatEndsOn
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.fieldIcon}>
                  <Feather name="users" size={18} color="#6FD9A6" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Reminded members</Text>
                  <Text style={styles.fieldValue}>
                    {formatReminderRecipients(reminder)}
                  </Text>
                </View>
              </View>

              {Boolean(reminder.createdBy?.fullName) && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.row}>
                    <View style={styles.fieldIcon}>
                      <Feather name="user" size={18} color="#8A97AB" />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text style={styles.fieldLabel}>Set by</Text>
                      <Text style={styles.fieldValue}>
                        {reminder.createdBy?.fullName}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        )}

        {reminder && (
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            {canModifyActive && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setEditModalVisible(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Edit reminder"
              >
                <Feather
                  name="edit-2"
                  size={17}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.doneBtn, reminder.done && styles.undoDoneBtn]}
              onPress={handleToggleDone}
              disabled={remindersState.submitting}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={reminder.done ? 'Undo done' : 'Mark as done'}
            >
              {remindersState.submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.doneBtnText}>
                  {reminder.done ? 'Undo done' : 'Mark as done'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <CreateReminderModal
          asModal={false}
          visible={editModalVisible}
          reminderToEdit={reminder}
          onClose={() => setEditModalVisible(false)}
          onApiSaved={(updated) => {
            dispatch(setSelectedReminderLocal(updated));
            onUpdated?.(updated);
          }}
        />

        <ReminderDialog
          dialog={dialog}
          onClose={() => setDialog(INITIAL_REMINDER_DIALOG_STATE)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#233348',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 18,
    marginBottom: 16,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1,
  },
  heroText: {
    fontSize: 19,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    color: '#8A97AB',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyBackBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0923A',
  },
  emptyBackBtnText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0923A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 16,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#3A4555',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 15.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  doneBtn: {
    flex: 1.4,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoDoneBtn: {
    backgroundColor: '#1E3454',
    borderWidth: 1,
    borderColor: '#6FD9A6',
  },
  doneBtnText: {
    fontSize: 15.5,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
});

export default ReminderDetailModal;
