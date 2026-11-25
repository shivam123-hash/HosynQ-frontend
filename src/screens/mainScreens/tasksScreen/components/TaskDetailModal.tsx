import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../../redux';
import {
  addTaskComment,
  remindTask,
  fetchReminderState,
  updateTask,
} from '../../../../redux/features/tasks/tasksSlice';
import { TaskDetailResponse, TaskReminderState } from '../../../../services/tasksServices';
import { TaskItem, TaskCategory, TaskPriority, TaskComment } from '../types';
import { CATEGORY_META, PRIORITY_META } from '../constants';
import {
  isUUID,
  isTaskOverdue,
  toIsoDateString,
  formatTimeTo24Hour,
  resolveMemberId,
} from '../taskApiHelpers';
import CommentsModal from './CommentsModal';
import AssigneesAndViewersModal from './AssigneesAndViewersModal';
import DueDateTimeModal from './DueDateTimeModal';
import RepeatModal from './RepeatModal';
import RemindersModal from './RemindersModal';
import CategoryPriorityModal from './CategoryPriorityModal';
import EditRepeatingConfirmModal, {
  RepeatEditScope,
} from './EditRepeatingConfirmModal';
import ReassignModal from './ReassignModal';
import DeleteTaskModal from './DeleteTaskModal';
import CreateTaskModal from './CreateTaskModal';
import AppOptionsMenu from '../../common/AppOptionsMenu';
import Colors from '../../../../units/Colors';

import { Fonts, Typography } from '../../../../units';

export interface TaskDetailModalProps {
  visible: boolean;
  task: TaskItem | null;
  liveTaskDetail?: TaskDetailResponse['task'] | null;
  onClose: () => void;
  onToggleComplete: (task: TaskItem) => void;
  onReassign?: (task: TaskItem, newAssignee: string) => void;
  onUpdateTask?: (updatedTask: TaskItem) => void;
  onDelete?: (task: TaskItem) => void;
  onEditTask?: (task: TaskItem) => void;
  members?: any[];
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible,
  task,
  liveTaskDetail,
  onClose,
  onToggleComplete,
  onReassign,
  onUpdateTask,
  onDelete,
  onEditTask,
  members,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(
    (state: any) => state.auth?.user || state.emailAuth?.user
  );
  const familyMembers = useAppSelector(
    (state) =>
      state.family.family?.members ||
      state.family.myFamilyData?.family?.members ||
      ((state.family.myFamilyData as any)?.members as any[]) ||
      []
  );
  const myMemberId = useAppSelector(
    (state) =>
      state.family.myFamilyData?.family?.myMemberId ||
      state.family.family?.myMemberId ||
      state.family.myMemberId ||
      null
  );
  const [localTask, setLocalTask] = useState<TaskItem | null>(task);

  // Sub-Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAssigneesModal, setShowAssigneesModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showCategoryPriorityModal, setShowCategoryPriorityModal] =
    useState(false);
  const [showEditRepeatingConfirm, setShowEditRepeatingConfirm] =
    useState(false);
  const [showCompletedToast, setShowCompletedToast] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reminderState, setReminderState] = useState<TaskReminderState | null>(null);
  const [remindLoading, setRemindLoading] = useState(false);

  React.useEffect(() => {
    if (!visible) {
      setIsMenuOpen(false);
    }
  }, [visible]);

  React.useEffect(() => {
    if (
      showEditModal ||
      showComments ||
      showAssigneesModal ||
      showReassignModal ||
      showDeleteModal ||
      showDueModal ||
      showRepeatModal ||
      showRemindersModal ||
      showCategoryPriorityModal ||
      showEditRepeatingConfirm
    ) {
      setIsMenuOpen(false);
    }
  }, [
    showEditModal,
    showComments,
    showAssigneesModal,
    showReassignModal,
    showDeleteModal,
    showDueModal,
    showRepeatModal,
    showRemindersModal,
    showCategoryPriorityModal,
    showEditRepeatingConfirm,
  ]);

  // Hook 17: Sync task prop with localTask state
  React.useEffect(() => {
    setLocalTask(task);
  }, [task, visible]);

  // Use localTask if edited, otherwise fallback to task prop directly
  const currentTask = localTask || task;

  // Sync initial reminderState from liveTaskDetail
  React.useEffect(() => {
    if (liveTaskDetail?.reminder && !reminderState) {
      setReminderState({
        canRemind: liveTaskDetail.reminder.canRemind,
        remindableMembers: [],
        nextAllowedAt: null,
        lastReminder: liveTaskDetail.reminder.lastRemindedAt
          ? {
              at: liveTaskDetail.reminder.lastRemindedAt,
              by: liveTaskDetail.reminder.lastRemindedBy
                ? {
                    fullName: liveTaskDetail.reminder.lastRemindedBy.fullName,
                  }
                : null,
              to: [],
            }
          : null,
      });
    }
  }, [liveTaskDetail?.reminder, reminderState]);

  // Fetch live reminder state (GET /api/v1/tasks/:id/reminder)
  React.useEffect(() => {
    if (visible && currentTask?.id && isUUID(currentTask.id)) {
      dispatch(fetchReminderState(currentTask.id))
        .unwrap()
        .then((state) => {
          console.log('[TaskDetailModal] Fetched reminder state:', state);
          setReminderState(state);
        })
        .catch((err) => {
          console.log('[TaskDetailModal] Could not fetch reminder state:', err);
        });
    } else if (!visible) {
      setReminderState(null);
    }
  }, [visible, currentTask?.id, dispatch]);

  // ✅ Hook 18: Declared UNCONDITIONALLY at the top level
  const effectiveComments: TaskComment[] = React.useMemo(() => {
    if (liveTaskDetail?.comments?.latest && liveTaskDetail.comments.latest.length > 0) {
      return liveTaskDetail.comments.latest.map((c) => ({
        id: c.id,
        author: c.author?.fullName || (c.isMine ? 'You' : 'Member'),
        authorInitial: ((c.author?.fullName || (c.isMine ? 'You' : 'M')).trim()[0] || 'M').toUpperCase(),
        avatarBg: c.author?.avatarColor || Colors.avatarNavy,
        avatarColor: Colors.accentBlueSoft,
        time: c.createdAt
          ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now',
        text: c.body,
        isYou: c.isMine,
      }));
    }
    return currentTask?.comments || [];
  }, [liveTaskDetail, currentTask?.comments]);

  // Hook 19: Compute dynamic overdue status based on date AND time
  const isOverdue = React.useMemo(() => {
    if (!currentTask) return false;
    return isTaskOverdue({
      isOverdue: currentTask.isOverdue || liveTaskDetail?.isOverdue,
      isCompleted: currentTask.isCompleted,
      dueDate: currentTask.dueDate,
      dueOn: liveTaskDetail?.dueOn,
      dueTime: currentTask.dueTime || liveTaskDetail?.dueTime,
      dueFormatted: currentTask.dueFormatted,
    });
  }, [currentTask, liveTaskDetail]);

  const currentUserName = useAppSelector(
    (state) =>
      state.baseProfile?.fullName ||
      state.baseProfile?.user?.fullName ||
      (state as any).auth?.user?.fullName ||
      (state as any).emailAuth?.user?.fullName ||
      (state as any).auth?.user?.name ||
      (state as any).emailAuth?.user?.name ||
      ''
  );
  const youMember = familyMembers.find(
    (m: any) =>
      m.isYou ||
      (myMemberId && (m.memberId === myMemberId || m.id === myMemberId))
  );
  const myName =
    youMember?.fullName || youMember?.name || currentUserName || '';

  const assigneeStr = currentTask?.assignee || 'You';
  const isAssigneeYou = React.useMemo(() => {
    if (!assigneeStr) return true;
    const lower = assigneeStr.toLowerCase().trim();
    if (lower === 'you') return true;
    if (lower === 'priya') return true;
    if (myName && lower === myName.toLowerCase().trim()) return true;
    if (authUser?.fullName && lower === authUser.fullName.toLowerCase().trim())
      return true;
    if (authUser?.name && lower === authUser.name.toLowerCase().trim())
      return true;
    if (myMemberId) {
      if (
        liveTaskDetail?.assignees?.some((a: any) => a.memberId === myMemberId)
      )
        return true;
    }
    const youFromList = familyMembers.find((m: any) => m.isYou);
    if (
      youFromList?.fullName &&
      lower === youFromList.fullName.toLowerCase().trim()
    )
      return true;
    return false;
  }, [
    assigneeStr,
    myName,
    authUser,
    myMemberId,
    liveTaskDetail?.assignees,
    familyMembers,
  ]);

  // Hook 20: Compute live reminder eligibility (authoritative from API when loaded)
  const canRemindNow = React.useMemo(() => {
    if (isAssigneeYou) return false;
    if (currentTask?.isCompleted) return false;

    // 1. If reminderState is loaded from GET /tasks/:id/reminder, it is authoritative
    if (reminderState) {
      if (reminderState.canRemind === false) return false;
      if (
        Array.isArray(reminderState.remindableMembers) &&
        reminderState.remindableMembers.length === 0
      ) {
        return false;
      }
      if (reminderState.nextAllowedAt) {
        const nextTime = new Date(reminderState.nextAllowedAt).getTime();
        if (!isNaN(nextTime) && nextTime > Date.now()) {
          return false;
        }
      }
      return Boolean(reminderState.canRemind);
    }

    // 2. If task detail permissions are present
    if (liveTaskDetail?.permissions?.canRemind !== undefined) {
      return Boolean(liveTaskDetail.permissions.canRemind);
    }

    // 3. Fallback: only if assigned to another family member and task is active
    return !isAssigneeYou && !currentTask?.isCompleted;
  }, [isAssigneeYou, currentTask?.isCompleted, reminderState, liveTaskDetail?.permissions?.canRemind]);

  // Hook 21: Compute reminder subtitle matching Figma/Live design
  const reminderSubtitle = React.useMemo(() => {
    const lastReminder =
      reminderState?.lastReminder ||
      (liveTaskDetail?.reminder?.lastRemindedAt
        ? {
            at: liveTaskDetail.reminder.lastRemindedAt,
            by: liveTaskDetail.reminder.lastRemindedBy,
            to: [],
          }
        : null);

    if (lastReminder?.at) {
      const d = new Date(lastReminder.at);
      if (!isNaN(d.getTime())) {
        const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = d.toDateString() === yesterday.toDateString();
        const dayStr = isToday
          ? 'today'
          : isYesterday
          ? 'yesterday'
          : `on ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
        const sender = lastReminder.by?.fullName;
        return `${assigneeStr} was reminded ${dayStr} at ${timeStr}${sender ? ` by ${sender}` : ''}.`;
      }
    }

    // When API reminderState has loaded:
    if (reminderState) {
      if (isAssigneeYou) {
        return 'This task is overdue. Change the due date to reschedule.';
      }
      if (reminderState.canRemind) {
        return `Tap Remind to notify ${assigneeStr}.`;
      }
      if (reminderState.nextAllowedAt) {
        return `${assigneeStr} was reminded recently. You can remind them again later.`;
      }
      return `${assigneeStr} cannot receive reminders for this task.`;
    }

    // Default design string when state not yet loaded
    return `${assigneeStr} was reminded yesterday at 6:00 PM.`;
  }, [reminderState, liveTaskDetail?.reminder, assigneeStr, isAssigneeYou]);

  // ✅ EARLY RETURN is placed AFTER ALL HOOKS HAVE BEEN CALLED
  if (!visible || !currentTask) return null;

  // Safe category & priority resolution with lowercase normalization
  const categoryKey = (currentTask.category?.toLowerCase() || 'household') as TaskCategory;
  const categoryMeta = CATEGORY_META[categoryKey] || CATEGORY_META.household;

  const priorityKey = (currentTask.priority?.toLowerCase() || 'medium') as TaskPriority;
  const priorityMeta = PRIORITY_META[priorityKey] || PRIORITY_META.medium;

  const totalCommentsCount =
    typeof liveTaskDetail?.comments?.count === 'number'
      ? liveTaskDetail.comments.count
      : (currentTask?.comments?.length ?? effectiveComments.length);

  const handleSendReminder = async () => {
    if (!canRemindNow) {
      if (isAssigneeYou) {
        Alert.alert(
          'Cannot Remind',
          'You are assigned to this task. Reminders can only be sent to other family members.'
        );
      } else {
        Alert.alert(
          'Cannot Remind',
          'A reminder cannot be sent for this task right now.'
        );
      }
      return;
    }
    if (!isUUID(currentTask.id)) {
      Alert.alert('Reminder Sent', `A reminder notification was sent to ${assigneeStr}.`);
      return;
    }
    try {
      setRemindLoading(true);
      console.log('[TaskDetailModal] Sending reminder for task:', currentTask.id);
      const res = await dispatch(remindTask({ taskId: currentTask.id })).unwrap();
      if (res?.reminder) {
        setReminderState(res.reminder);
      }
      Alert.alert('Reminder Sent', `A reminder notification was sent to ${assigneeStr}.`);
    } catch (err: any) {
      console.log('[TaskDetailModal] ❌ Reminder error:', err);
      Alert.alert(
        'Cannot Send Reminder',
        typeof err === 'string' ? err : err?.message || 'Please wait before sending another reminder.'
      );
    } finally {
      setRemindLoading(false);
    }
  };

  const markDoneLabel = liveTaskDetail?.permissions?.completesOwnPartOnly
    ? 'Done my part'
    : 'Mark as done';

  const isRepeating =
    Boolean(currentTask.repeat) &&
    !currentTask.repeat?.toLowerCase().includes("doesn't") &&
    !currentTask.repeat?.toLowerCase().includes('doesn’t');

  const formatRepeatBadge = (repeatText: string) => {
    const lower = repeatText.toLowerCase();
    if (lower.startsWith('repeat')) return repeatText;
    if (lower.includes('month')) return 'Repeats monthly';
    if (lower.includes('week')) return 'Repeats weekly';
    if (lower.includes('day') || lower.includes('daily')) return 'Repeats daily';
    return `Repeats ${repeatText.toLowerCase()}`;
  };

  const handleUpdate = (updates: Partial<TaskItem>) => {
    const updated = { ...currentTask, ...updates };
    setLocalTask(updated);
    onUpdateTask?.(updated);
  };

  const handleRepeatRowPress = () => {
    if (isRepeating) {
      setShowEditRepeatingConfirm(true);
    } else {
      setShowRepeatModal(true);
    }
  };

  const handleMorePress = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleMarkDonePress = () => {
    onToggleComplete(currentTask);
    setShowCompletedToast(true);
  };

  const handleReopenPress = () => {
    onToggleComplete(currentTask);
    setShowCompletedToast(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 16) },
        ]}
      >
        <StatusBar barStyle="light-content" />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close task detail"
          >
            <Feather name="chevron-left" size={22} color={Colors.textLightMutedAlt} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Task</Text>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleMorePress}
            activeOpacity={0.7}
            disabled={showDeleteModal || showComments || showDueModal || showCategoryPriorityModal || showReassignModal}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Feather name="more-horizontal" size={20} color={Colors.textLightMutedAlt} />
          </TouchableOpacity>
        </View>

        {/* Dropdown Options Menu (Strictly 2 options: Edit Task and Delete Task) */}
        <AppOptionsMenu
          visible={
            isMenuOpen &&
            !showDeleteModal &&
            !showComments &&
            !showDueModal &&
            !showCategoryPriorityModal &&
            !showReassignModal &&
            !showEditModal
          }
          onClose={() => setIsMenuOpen(false)}
          topOffset={Math.max(insets.top, 16) + 54}
          items={[
            {
              id: 'edit',
              label: 'Edit Task',
              iconName: 'edit-2',
              onPress: () => {
                setIsMenuOpen(false);
                setShowEditModal(true);
                onEditTask?.(currentTask);
              },
              showDividerAfter: true,
            },
            {
              id: 'delete',
              label: 'Delete Task',
              iconName: 'trash-2',
              destructive: true,
              onPress: () => {
                setIsMenuOpen(false);
                setShowDeleteModal(true);
              },
            },
          ]}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 96 },
          ]}
        >
          {/* Overdue Alert Banner */}
          {isOverdue && !currentTask.isCompleted && (
            <View style={styles.overdueBanner}>
              <View style={styles.overdueHeaderRow}>
                <Feather
                  name="alert-circle"
                  size={20}
                  color={Colors.dangerCoral}
                  style={styles.overdueIcon}
                />
                <Text style={styles.overdueTitle}>Overdue</Text>
              </View>
              <Text style={styles.overdueSubtitle}>
                {reminderSubtitle}
              </Text>
              <View style={styles.overdueActionsCol}>
                <TouchableOpacity
                  style={[
                    styles.bannerActionBtnRemind,
                    canRemindNow ? styles.bannerActionBtnRemindActive : styles.bannerActionBtnDisabled,
                    remindLoading && { opacity: 0.7 },
                  ]}
                  onPress={handleSendReminder}
                  disabled={!canRemindNow || remindLoading}
                  activeOpacity={canRemindNow ? 0.7 : 1}
                  accessibilityRole="button"
                  accessibilityLabel={`Remind ${assigneeStr}`}
                >
                  <Text
                    style={[
                      styles.bannerActionTextRemind,
                      canRemindNow ? styles.bannerActionTextRemindActive : styles.bannerActionTextDisabled,
                    ]}
                  >
                    {remindLoading ? 'Sending…' : `Remind ${assigneeStr}`}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bannerActionBtnChangeDate}
                  onPress={() => {
                    setShowEditModal(true);
                    onEditTask?.(currentTask);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Change due date"
                >
                  <Text style={styles.bannerActionTextChangeDate}>
                    Change due date
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Completed Banner */}
          {currentTask.isCompleted && (
            <View style={styles.completedBanner}>
              <View style={styles.completedContentRow}>
                <Feather name="check-circle" size={20} color={Colors.tripCompletedGreen} style={styles.completedIcon} />
                <View style={styles.completedTextCol}>
                  <Text style={styles.completedTitle}>Completed by you</Text>
                  <Text style={styles.completedSubtitle}>
                    Just now · Rohan and Dadi can see it
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Badges Row (View-only presentation) */}
          <View style={styles.badgesRow}>
            {categoryMeta && (
              <View
                style={[
                  styles.badge,
                  { borderColor: categoryMeta.color },
                ]}
              >
                <View
                  style={[
                    styles.badgeDot,
                    { backgroundColor: categoryMeta.color },
                  ]}
                />
                <Text
                  style={[styles.badgeText, { color: categoryMeta.color }]}
                >
                  {categoryMeta.label}
                </Text>
              </View>
            )}

            {priorityMeta && (
              <View
                style={[
                  styles.badge,
                  { borderColor: priorityMeta.color },
                ]}
              >
                <View
                  style={[
                    styles.badgeDot,
                    { backgroundColor: priorityMeta.color },
                  ]}
                />
                <Text
                  style={[styles.badgeText, { color: priorityMeta.color }]}
                >
                  {priorityMeta.label}
                </Text>
              </View>
            )}

            {Boolean(currentTask.repeat) && (
              <View
                style={[styles.badge, styles.repeatBadge]}
              >
                <View style={[styles.badgeDot, styles.repeatBadgeDot]} />
                <Text style={[styles.badgeText, styles.repeatBadgeText]}>
                  {isRepeating
                    ? formatRepeatBadge(currentTask.repeat || '')
                    : "Doesn't repeat"}
                </Text>
              </View>
            )}
          </View>

          {/* Main Title & Subtitle */}
          <Text
            style={[
              styles.taskTitle,
              currentTask.isCompleted && styles.taskTitleCompleted,
            ]}
          >
            {currentTask.title}
          </Text>

          <Text
            style={[
              styles.taskMetaSubtitle,
              currentTask.isOverdue &&
                !currentTask.isCompleted &&
                styles.overdueSubtitleText,
            ]}
          >
            {currentTask.isCompleted
              ? `Done ${(currentTask.dueDate || 'today').toLowerCase()} at ${currentTask.completedAt || '2:14 PM'}`
              : currentTask.isOverdue
              ? `${currentTask.amount ? `${currentTask.amount} · ` : ''}Was due ${currentTask.dueDate || 'today'}`
              : `${currentTask.amount ? `${currentTask.amount} · ` : ''}Due ${currentTask.dueDate || 'today'}`}
          </Text>

          {/* Configuration Card (View-only presentation) */}
          <View style={styles.infoCard}>
            {/* Due */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Feather name="calendar" size={18} color={Colors.textSecondaryMuted} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Due</Text>
                <Text
                  style={[
                    styles.infoValue,
                    currentTask.isOverdue &&
                      !currentTask.isCompleted &&
                      styles.overdueValueText,
                  ]}
                >
                  {currentTask.dueFormatted || currentTask.dueDate}
                </Text>
              </View>
            </View>

            {/* Repeat */}
            <View style={[styles.infoRow, styles.divider]}>
              <View style={styles.infoIconBox}>
                <Feather name="repeat" size={18} color={Colors.textSecondaryMuted} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Repeat</Text>
                <Text style={styles.infoValue}>
                  {currentTask.repeat || 'Doesn’t repeat'}
                </Text>
              </View>
            </View>

            {/* Reminders */}
            <View style={[styles.infoRow, styles.divider]}>
              <View style={styles.infoIconBox}>
                <Feather name="bell" size={18} color={Colors.textSecondaryMuted} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Reminders</Text>
                <Text style={styles.infoValue}>
                  {currentTask.reminders || 'None'}
                </Text>
              </View>
            </View>

            {/* Assigned to */}
            <View style={[styles.infoRow, styles.divider]}>
              <View style={styles.infoIconBox}>
                <Feather name="user" size={18} color={Colors.textSecondaryMuted} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Assigned to</Text>
                <View style={styles.assigneeBadgeRow}>
                  <View
                    style={[
                      styles.assigneeMiniAvatar,
                      isAssigneeYou ? styles.avatarBgPriya : styles.avatarBgRohan,
                    ]}
                  >
                    <Text
                      style={[
                        styles.assigneeMiniText,
                        isAssigneeYou
                          ? styles.avatarTextPriya
                          : styles.avatarTextRohan,
                      ]}
                    >
                      {currentTask.assigneeInitial ||
                        (isAssigneeYou ? (myName.trim()[0] || 'P').toUpperCase() : 'R')}
                    </Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {isAssigneeYou ? 'You' : assigneeStr}
                  </Text>
                </View>
              </View>
            </View>

            {/* Who can see it */}
            <View style={[styles.infoRow, styles.divider]}>
              <View style={styles.infoIconBox}>
                <Feather name="eye" size={18} color={Colors.textSecondaryMuted} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Who can see it</Text>
                <View style={styles.viewersBadgeRow}>
                  <View style={styles.stackedAvatarsRow}>
                    <View
                      style={[
                        styles.stackedAvatar,
                        styles.avatarBgBlue,
                        styles.stackedAvatarFirst,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stackedAvatarText,
                          styles.avatarTextBlue,
                        ]}
                      >
                        {currentTask.viewers?.includes('Rohan') ? 'R' : 'P'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.stackedAvatar,
                        styles.avatarBgGreen,
                        styles.stackedAvatarSecond,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stackedAvatarText,
                          styles.avatarTextGreen,
                        ]}
                      >
                        D
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.infoValue}>
                    {currentTask.viewers || 'Everyone in the family'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Created by note (below card, matching Figma TSK-11) */}
          {currentTask.createdBy && (
            <Text style={styles.createdByText}>
              {`Created by ${currentTask.createdBy}`}
            </Text>
          )}

          {/* Notes Card */}
          {currentTask.notes && (
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>NOTES</Text>
              <Text style={styles.notesText}>{currentTask.notes}</Text>
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsHeaderRow}>
              <Text style={styles.commentsTitle}>
                {`Comments · ${totalCommentsCount}`}
              </Text>
              <TouchableOpacity
                onPress={() => setShowComments(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>

            {effectiveComments && effectiveComments.length > 0 ? (
              effectiveComments.slice(0, 2).map((comment) => (
                <TouchableOpacity
                  key={comment.id}
                  style={styles.commentItem}
                  onPress={() => setShowComments(true)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.commentAvatar,
                      { backgroundColor: comment.avatarBg || Colors.avatarNavy },
                    ]}
                  >
                    <Text
                      style={[
                        styles.commentAvatarText,
                        { color: comment.avatarColor || Colors.accentBlueSoft },
                      ]}
                    >
                      {comment.authorInitial}
                    </Text>
                  </View>
                  <View style={styles.commentBody}>
                    <View style={styles.commentMetaRow}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentTime}>{comment.time}</Text>
                    </View>
                    <View
                      style={[
                        styles.commentBubble,
                        comment.isYou && styles.commentBubbleYou,
                      ]}
                    >
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={styles.writeCommentPill}
                onPress={() => setShowComments(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Write a comment"
              >
                <Text style={styles.writeCommentPlaceholder}>
                  Write a comment...
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Floating Toast Pill (When completed) */}
        {currentTask.isCompleted && showCompletedToast && (
          <View
            style={[
              styles.toastPill,
              { bottom: Math.max(insets.bottom, 16) + 70 },
            ]}
          >
            <View style={styles.toastLeftRow}>
              <Feather name="check-circle" size={18} color={Colors.success} />
              <Text style={styles.toastText}>Marked as done</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                onToggleComplete(currentTask);
                setShowCompletedToast(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.toastUndoText}>Undo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Actions Bar */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) + 6 },
          ]}
        >
          {!currentTask.isCompleted ? (
            <>
              <TouchableOpacity
                style={styles.reassignBtn}
                onPress={() => setShowReassignModal(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Reassign task"
              >
                <Text style={styles.reassignBtnText}>Reassign</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.markDoneBtn}
                onPress={handleMarkDonePress}
                activeOpacity={0.8}
              >
                <Feather name="check" size={18} color={Colors.white} />
                <Text style={styles.markDoneBtnText}>{markDoneLabel}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.reopenTaskBtn}
              onPress={handleReopenPress}
              activeOpacity={0.8}
            >
              <Feather name="repeat" size={18} color={Colors.primary} />
              <Text style={styles.reopenTaskBtnText}>Reopen task</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comments Modal */}
        <CommentsModal
          visible={showComments}
          taskId={currentTask.id}
          taskTitle={currentTask.title}
          dueDateSubtitle={`Due ${currentTask.dueDate || 'today'}`}
          comments={effectiveComments}
          onClose={() => setShowComments(false)}
          onAddComment={async (text) => {
            console.log('[TaskDetailModal] Adding comment to task:', currentTask.id);
            try {
              if (isUUID(currentTask.id)) {
                await dispatch(
                  addTaskComment({
                    taskId: currentTask.id,
                    payload: { body: text },
                  })
                ).unwrap();
                console.log('[TaskDetailModal] ✅ Comment added successfully');
              }
            } catch (err) {
              console.log('[TaskDetailModal] ❌ Failed to add comment:', err);
            }
          }}
        />

        {/* Reassign Modal (TSK Reassign sheet) */}
        <ReassignModal
          visible={showReassignModal}
          taskTitle={currentTask.title}
          currentAssignee={currentTask.assignee || 'You'}
          members={members}
          onClose={() => setShowReassignModal(false)}
          onSelectAssignee={(newAssigneeId, newAssigneeName) => {
            const displayName = newAssigneeName || newAssigneeId;
            handleUpdate({
              assignee: displayName,
              assigneeInitial: displayName === 'You' ? 'P' : displayName[0],
            });
            const resolvedId = isUUID(newAssigneeId)
              ? newAssigneeId
              : resolveMemberId(displayName, familyMembers, myMemberId);
            onReassign?.(currentTask, resolvedId || newAssigneeId);
            setShowReassignModal(false);
          }}
        />

        {/* Edit Task Modal */}
        <CreateTaskModal
          visible={showEditModal}
          taskToEdit={currentTask}
          onClose={() => setShowEditModal(false)}
          onCreateTask={(updated) => {
            handleUpdate(updated as TaskItem);
            setShowEditModal(false);
          }}
          onUpdateTask={(updated) => {
            handleUpdate(updated);
            setShowEditModal(false);
          }}
        />

        {/* Delete Task Modal (TSK Delete confirmation dialog) */}
        <DeleteTaskModal
          visible={showDeleteModal}
          taskTitle={currentTask.title}
          isRepeating={isRepeating}
          repeatText={currentTask.repeat}
          onClose={() => setShowDeleteModal(false)}
          onConfirmDelete={() => {
            setShowDeleteModal(false);
            onDelete?.(currentTask);
            onClose();
          }}
        />

        {/* Assignees and Viewers Modal (TSK-15) */}
        <AssigneesAndViewersModal
          visible={showAssigneesModal}
          selectedAssignees={[currentTask.assignee || 'You']}
          selectedViewers="everyone"
          onClose={() => setShowAssigneesModal(false)}
          onSave={(newAssignees, _newViewersOption, newViewersLabel) => {
            const primaryAssignee = newAssignees[0] || 'You';
            handleUpdate({
              assignee: primaryAssignee,
              assigneeInitial:
                primaryAssignee === 'You' ? 'P' : primaryAssignee[0],
              viewers: newViewersLabel,
            });
            const resolvedId = resolveMemberId(primaryAssignee, familyMembers, myMemberId);
            onReassign?.(currentTask, resolvedId || primaryAssignee);
          }}
        />

        {/* Due Date & Time Modal (TSK-16) */}
        <DueDateTimeModal
          visible={showDueModal}
          initialDate={currentTask.dueDate || 'Today'}
          initialTime={currentTask.dueTime || '6:00 PM'}
          onClose={() => setShowDueModal(false)}
          onSave={async (newDate: string, newFormatted: string, newTime?: string, isoDateStr?: string) => {
            const updated: Partial<TaskItem> = {
              dueDate: newDate,
              dueFormatted: newFormatted,
              dueTime: newTime,
              isOverdue: false,
            };
            handleUpdate(updated);
            if (isUUID(currentTask.id)) {
              try {
                const finalDueOn = isoDateStr || toIsoDateString(newDate);
                const finalDueTime = formatTimeTo24Hour(newTime);
                const payload: any = {
                  dueOn: finalDueOn,
                };
                if (finalDueTime) {
                  payload.dueTime = finalDueTime;
                }
                if (isRepeating) {
                  payload.scope = 'THIS_ONE';
                }
                console.log('[TaskDetailModal] Updating due date/time with payload:', payload);
                await dispatch(updateTask({ taskId: currentTask.id, payload })).unwrap();
                console.log('[TaskDetailModal] ✅ Due date & time updated via API:', currentTask.id);
              } catch (e: any) {
                console.log('[TaskDetailModal] ❌ Failed to update due date via API:', e?.response?.data || e);
              }
            }
          }}
        />

        {/* Repeat Modal (TSK-17) */}
        <RepeatModal
          visible={showRepeatModal}
          initialRepeat={currentTask.repeat || 'Doesn’t repeat'}
          onClose={() => setShowRepeatModal(false)}
          onSave={(newRepeat) => {
            handleUpdate({ repeat: newRepeat });
          }}
        />

        {/* Reminders Modal (TSK-18) */}
        <RemindersModal
          visible={showRemindersModal}
          initialReminders={
            currentTask.reminders ? [currentTask.reminders] : ['1 hour before']
          }
          onClose={() => setShowRemindersModal(false)}
          onSave={(formattedReminders) => {
            handleUpdate({ reminders: formattedReminders });
          }}
        />

        {/* Category & Priority Modal (TSK-19) */}
        <CategoryPriorityModal
          visible={showCategoryPriorityModal}
          initialCategory={categoryKey}
          initialPriority={priorityKey}
          onClose={() => setShowCategoryPriorityModal(false)}
          onSave={(newCategory: TaskCategory, newPriority: TaskPriority) => {
            handleUpdate({
              category: newCategory,
              categoryLabel: CATEGORY_META[newCategory].label,
              priority: newPriority,
              priorityLabel: PRIORITY_META[newPriority].label,
            });
          }}
        />

        {/* Edit Repeating Confirm Dialog (TSK-20) */}
        <EditRepeatingConfirmModal
          visible={showEditRepeatingConfirm}
          repeatInterval={currentTask.repeat || 'every month'}
          dueDateText={currentTask.dueDate || 'Today'}
          onClose={() => setShowEditRepeatingConfirm(false)}
          onConfirm={(_scope: RepeatEditScope) => {
            setShowEditRepeatingConfirm(false);
            setShowRepeatModal(true);
          }}
        />
      </View>
    </Modal>
  );
};

export default TaskDetailModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.transparent,
  },
  headerTitle: {
    fontSize: Typography.size.titleSmall,
    fontFamily: Fonts.bold,
    color: Colors.textLightMutedAlt,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  overdueBanner: {
    backgroundColor: Colors.tasksOverdueBg,
    borderWidth: 1.5,
    borderColor: Colors.dangerBorderSubtle,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  overdueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  overdueTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  overdueIcon: {
    marginTop: 0,
  },
  overdueContentCol: {
    flex: 1,
  },
  overdueTitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.dangerCoral,
  },
  overdueSubtitle: {
    fontSize: Typography.size.bodyMedium,
    color: Colors.textLightMutedAlt,
    lineHeight: 22,
    marginBottom: 16,
  },
  overdueActionsCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  overdueActionsRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  bannerActionBtnRemind: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Colors.dangerCoral,
    backgroundColor: Colors.transparent,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerActionBtnRemindActive: {
    borderColor: Colors.dangerCoral,
  },
  bannerActionBtnDisabled: {
    borderColor: Colors.dangerBorderDark,
    opacity: 0.5,
  },
  bannerActionTextRemind: {
    fontSize: Typography.size.bodyMedium,
    fontWeight: '600',
    color: Colors.dangerCoral,
  },
  bannerActionTextRemindActive: {
    color: Colors.dangerCoral,
  },
  bannerActionTextDisabled: {
    color: Colors.dangerTextMuted,
  },
  bannerActionBtnChangeDate: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Colors.dangerCoral,
    backgroundColor: Colors.transparent,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerActionTextChangeDate: {
    fontSize: Typography.size.bodyMedium,
    fontWeight: '600',
    color: Colors.dangerCoral,
  },
  bannerActionBtn: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Colors.dangerCoral,
    backgroundColor: Colors.transparent,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerActionText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.semiBold,
    color: Colors.dangerCoral,
  },
  completedBanner: {
    backgroundColor: Colors.completedDarkBg,
    borderWidth: 1.5,
    borderColor: Colors.tripMintBorder,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  completedContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  completedIcon: {
    marginTop: 1,
  },
  completedTextCol: {
    flex: 1,
  },
  completedTitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.tripCompletedGreen,
  },
  completedSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textLightGray,
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 28,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    backgroundColor: Colors.transparent,
  },
  repeatBadge: {
    borderColor: Colors.textSecondaryMuted,
  },
  priorityBadge: {},
  repeatBadgeDot: {
    backgroundColor: Colors.textSecondaryMuted,
  },
  repeatBadgeText: {
    color: Colors.chipInactive,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  taskTitle: {
    fontSize: Typography.size.header,
    fontFamily: Fonts.bold,
    color: Colors.textLightMutedAlt,
    lineHeight: 32,
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondaryMuted,
  },
  taskMetaSubtitle: {
    fontSize: Typography.size.bodyMedium,
    color: Colors.textSecondaryMuted,
    marginBottom: 20,
  },
  overdueSubtitleText: {
    color: Colors.primary,
  },
  infoCard: {
    backgroundColor: Colors.transparent,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    overflow: 'hidden',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderDividerNavy,
  },
  infoIconBox: {
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.size.caption,
    color: Colors.textSecondaryMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  overdueValueText: {
    color: Colors.primary,
  },
  assigneeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assigneeMiniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBgPriya: {
    backgroundColor: Colors.avatarBrown,
  },
  avatarTextPriya: {
    color: Colors.primary,
  },
  avatarBgRohan: {
    backgroundColor: Colors.avatarNavy,
  },
  avatarTextRohan: {
    color: Colors.accentBlueSoft,
  },
  assigneeMiniText: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.bold,
  },
  viewersBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stackedAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.cardBackground,
  },
  stackedAvatarFirst: {
    zIndex: 2,
  },
  stackedAvatarSecond: {
    marginLeft: -6,
    zIndex: 1,
  },
  avatarBgBlue: {
    backgroundColor: Colors.avatarNavy,
  },
  avatarTextBlue: {
    color: Colors.accentBlueSoft,
  },
  avatarBgGreen: {
    backgroundColor: Colors.avatarGreenDark,
  },
  avatarTextGreen: {
    color: Colors.tripGreenAccent,
  },
  stackedAvatarText: {
    fontSize: Typography.size.micro,
    fontFamily: Fonts.bold,
  },
  createdByText: {
    fontSize: Typography.size.bodySmall,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 16,
  },
  notesCard: {
    backgroundColor: Colors.transparent,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    padding: 16,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    letterSpacing: 1.2,
    color: Colors.textSecondaryMuted,
    marginBottom: 6,
  },
  notesText: {
    fontSize: Typography.size.body,
    color: Colors.textLightMutedAlt,
    lineHeight: 20,
  },
  commentsSection: {
    marginTop: 8,
  },
  commentsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  commentsTitle: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.textLightMutedAlt,
  },
  viewAllText: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.bold,
  },
  commentBody: {
    flex: 1,
  },
  commentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.bold,
    color: Colors.textLightMutedAlt,
  },
  commentTime: {
    fontSize: Typography.size.caption,
    color: Colors.textSecondaryMuted,
  },
  commentBubble: {
    backgroundColor: Colors.transparent,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    padding: 12,
  },
  commentBubbleYou: {
    borderColor: Colors.primary,
  },
  commentText: {
    fontSize: Typography.size.body,
    color: Colors.textLightMutedAlt,
    lineHeight: 20,
  },
  toastPill: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: Colors.textNearWhite,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
  toastLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toastText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.semiBold,
    color: Colors.background,
  },
  toastUndoText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderBold,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  reassignBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reassignBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  markDoneBtn: {
    flex: 1.3,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  markDoneBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  writeCommentPill: {
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 6,
  },
  writeCommentPlaceholder: {
    fontSize: Typography.size.body,
    color: Colors.textSecondaryMuted,
  },
  reopenTaskBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reopenTaskBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
});
