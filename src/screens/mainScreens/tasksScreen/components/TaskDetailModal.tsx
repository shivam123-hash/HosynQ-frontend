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
import { TaskItem, TaskCategory, TaskPriority } from '../types';
import { CATEGORY_META, PRIORITY_META } from '../mockData';
import CommentsModal from './CommentsModal';
import AssigneesAndViewersModal from './AssigneesAndViewersModal';
import DueDateTimeModal from './DueDateTimeModal';
import RepeatModal from './RepeatModal';
import RemindersModal from './RemindersModal';
import CategoryPriorityModal from './CategoryPriorityModal';
import EditRepeatingConfirmModal, {
  RepeatEditScope,
} from './EditRepeatingConfirmModal';

export interface TaskDetailModalProps {
  visible: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onToggleComplete: (task: TaskItem) => void;
  onReassign?: (task: TaskItem, newAssignee: string) => void;
  onUpdateTask?: (updatedTask: TaskItem) => void;
  onDelete?: (task: TaskItem) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible,
  task,
  onClose,
  onToggleComplete,
  onReassign,
  onUpdateTask,
  onDelete,
}) => {
  const insets = useSafeAreaInsets();
  const [localTask, setLocalTask] = useState<TaskItem | null>(task);

  // Sub-Modals
  const [showComments, setShowComments] = useState(false);
  const [showAssigneesModal, setShowAssigneesModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showCategoryPriorityModal, setShowCategoryPriorityModal] =
    useState(false);
  const [showEditRepeatingConfirm, setShowEditRepeatingConfirm] =
    useState(false);
  const [showCompletedToast, setShowCompletedToast] = useState(false);

  React.useEffect(() => {
    setLocalTask(task);
  }, [task, visible]);

  if (!localTask) return null;

  const currentTask = localTask;
  const categoryMeta = CATEGORY_META[currentTask.category];
  const priorityMeta = PRIORITY_META[currentTask.priority];

  const isAssigneeYou =
    currentTask.assignee.toLowerCase() === 'you' ||
    currentTask.assignee.toLowerCase() === 'priya';

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
    Alert.alert(
      'Task Options',
      currentTask.title,
      [
        {
          text: 'Add Comment',
          onPress: () => setShowComments(true),
        },
        {
          text: 'Category & Priority',
          onPress: () => setShowCategoryPriorityModal(true),
        },
        {
          text: 'Edit Due Date',
          onPress: () => setShowDueModal(true),
        },
        {
          text: 'Delete Task',
          style: 'destructive',
          onPress: () => {
            onDelete?.(currentTask);
            onClose();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
            <Feather name="chevron-left" size={22} color="#CAD4DF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Task</Text>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleMorePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Feather name="more-horizontal" size={20} color="#CAD4DF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 96 },
          ]}
        >
          {/* Overdue Alert Banner */}
          {currentTask.isOverdue && !currentTask.isCompleted && (
            <View style={styles.overdueBanner}>
              <View style={styles.overdueHeaderRow}>
                <Feather name="alert-circle" size={18} color="#F87171" />
                <Text style={styles.overdueTitle}>
                  {currentTask.overdueDateText || 'Overdue by 2 days'}
                </Text>
              </View>
              <Text style={styles.overdueSubtitle}>
                {`${currentTask.assignee} was reminded yesterday at 6:00 PM.`}
              </Text>
              <View style={styles.overdueActionsRow}>
                <TouchableOpacity
                  style={styles.bannerActionBtn}
                  onPress={() =>
                    Alert.alert(
                      'Reminder Sent',
                      `Reminder sent to ${currentTask.assignee}.`
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.bannerActionText}>
                    {`Remind ${currentTask.assignee}`}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bannerActionBtn}
                  onPress={() => setShowDueModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.bannerActionText}>Change due date</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Completed Banner */}
          {currentTask.isCompleted && (
            <View style={styles.completedBanner}>
              <View style={styles.completedHeaderRow}>
                <Feather name="check-circle" size={18} color="#10B981" />
                <Text style={styles.completedTitle}>Completed by you</Text>
              </View>
              <Text style={styles.completedSubtitle}>
                Just now · Rohan and Dadi can see it
              </Text>
            </View>
          )}

          {/* Badges Row */}
          <View style={styles.badgesRow}>
            {categoryMeta && (
              <TouchableOpacity
                style={[
                  styles.badge,
                  { borderColor: categoryMeta.badgeBorder },
                ]}
                onPress={() => setShowCategoryPriorityModal(true)}
                activeOpacity={0.7}
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
              </TouchableOpacity>
            )}

            {priorityMeta && (
              <TouchableOpacity
                style={[
                  styles.badge,
                  styles.priorityBadge,
                ]}
                onPress={() => setShowCategoryPriorityModal(true)}
                activeOpacity={0.7}
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
              </TouchableOpacity>
            )}

            {isRepeating && (
              <TouchableOpacity
                style={[styles.badge, styles.repeatBadge]}
                onPress={handleRepeatRowPress}
                activeOpacity={0.7}
              >
                <View style={[styles.badgeDot, styles.repeatBadgeDot]} />
                <Text style={[styles.badgeText, styles.repeatBadgeText]}>
                  {formatRepeatBadge(currentTask.repeat || '')}
                </Text>
              </TouchableOpacity>
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
              ? `Done ${currentTask.dueDate.toLowerCase()} at ${currentTask.completedAt || '2:14 PM'}`
              : currentTask.isOverdue
              ? `${currentTask.amount ? `${currentTask.amount} · ` : ''}Was due ${currentTask.dueDate}`
              : `${currentTask.amount ? `${currentTask.amount} · ` : ''}Due ${currentTask.dueDate}`}
          </Text>

          {/* Configuration Card */}
          <View style={styles.infoCard}>
            {/* Due */}
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => setShowDueModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.infoIconBox}>
                <Feather name="calendar" size={18} color="#8A97AB" />
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
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Repeat */}
            <TouchableOpacity
              style={[styles.infoRow, styles.divider]}
              onPress={handleRepeatRowPress}
              activeOpacity={0.7}
            >
              <View style={styles.infoIconBox}>
                <Feather name="repeat" size={18} color="#8A97AB" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Repeat</Text>
                <Text style={styles.infoValue}>
                  {currentTask.repeat || 'Doesn’t repeat'}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Reminders */}
            <TouchableOpacity
              style={[styles.infoRow, styles.divider]}
              onPress={() => setShowRemindersModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.infoIconBox}>
                <Feather name="bell" size={18} color="#8A97AB" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Reminders</Text>
                <Text style={styles.infoValue}>
                  {currentTask.reminders || 'None'}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Assigned to */}
            <TouchableOpacity
              style={[styles.infoRow, styles.divider]}
              onPress={() => setShowAssigneesModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.infoIconBox}>
                <Feather name="user" size={18} color="#8A97AB" />
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
                        (isAssigneeYou ? 'P' : 'R')}
                    </Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {isAssigneeYou ? 'You' : currentTask.assignee}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Who can see it */}
            <TouchableOpacity
              style={[styles.infoRow, styles.divider]}
              onPress={() => setShowAssigneesModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.infoIconBox}>
                <Feather name="eye" size={18} color="#8A97AB" />
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
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>
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
          {currentTask.comments && currentTask.comments.length > 0 && (
            <View style={styles.commentsSection}>
              <View style={styles.commentsHeaderRow}>
                <Text style={styles.commentsTitle}>
                  {`Comments · ${currentTask.comments.length}`}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowComments(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              </View>

              {currentTask.comments.slice(0, 2).map((comment) => (
                <TouchableOpacity
                  key={comment.id}
                  style={styles.commentItem}
                  onPress={() => setShowComments(true)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.commentAvatar,
                      { backgroundColor: comment.avatarBg || '#1E3A66' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.commentAvatarText,
                        { color: comment.avatarColor || '#8DB8F5' },
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
              ))}
            </View>
          )}
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
              <Feather name="check-circle" size={18} color="#10B981" />
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
                onPress={() => setShowAssigneesModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.reassignBtnText}>Reassign</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.markDoneBtn}
                onPress={handleMarkDonePress}
                activeOpacity={0.8}
              >
                <Feather name="check" size={18} color="#FFFFFF" />
                <Text style={styles.markDoneBtnText}>Mark as done</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.reopenTaskBtn}
              onPress={handleReopenPress}
              activeOpacity={0.8}
            >
              <Feather name="repeat" size={18} color="#F0913A" />
              <Text style={styles.reopenTaskBtnText}>Reopen task</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comments Modal */}
        <CommentsModal
          visible={showComments}
          taskTitle={currentTask.title}
          dueDateSubtitle={`Due ${currentTask.dueDate}`}
          comments={currentTask.comments || []}
          onClose={() => setShowComments(false)}
        />

        {/* Assignees and Viewers Modal (TSK-15) */}
        <AssigneesAndViewersModal
          visible={showAssigneesModal}
          selectedAssignees={[currentTask.assignee]}
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
            onReassign?.(currentTask, primaryAssignee);
          }}
        />

        {/* Due Date & Time Modal (TSK-16) */}
        <DueDateTimeModal
          visible={showDueModal}
          initialDate={currentTask.dueDate}
          initialTime={currentTask.dueTime || '6:00 PM'}
          onClose={() => setShowDueModal(false)}
          onSave={(newDate, newFormatted, newTime) => {
            handleUpdate({
              dueDate: newDate,
              dueFormatted: newFormatted,
              dueTime: newTime,
              isOverdue: false,
            });
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
          initialCategory={currentTask.category}
          initialPriority={currentTask.priority}
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
          dueDateText={currentTask.dueDate}
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
    backgroundColor: '#0B1A2F',
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
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#CAD4DF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  overdueBanner: {
    backgroundColor: '#1C1522',
    borderWidth: 1,
    borderColor: '#6B2B2B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  overdueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  overdueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F87171',
  },
  overdueSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginBottom: 12,
  },
  overdueActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bannerActionBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#6B2B2B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F87171',
  },
  completedBanner: {
    backgroundColor: '#0F261E',
    borderWidth: 1,
    borderColor: '#1E4E38',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  completedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  completedSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
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
    borderRadius: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    backgroundColor: '#122440',
  },
  repeatBadge: {
    borderColor: 'rgba(141, 184, 245, 0.4)',
  },
  priorityBadge: {
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  repeatBadgeDot: {
    backgroundColor: '#8DB8F5',
  },
  repeatBadgeText: {
    color: '#8DB8F5',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#CAD4DF',
    lineHeight: 32,
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8A97AB',
  },
  taskMetaSubtitle: {
    fontSize: 15,
    color: '#8A97AB',
    marginBottom: 20,
  },
  overdueSubtitleText: {
    color: '#F0913A',
  },
  infoCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
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
    borderTopColor: '#1F3352',
  },
  infoIconBox: {
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  overdueValueText: {
    color: '#F0913A',
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
    backgroundColor: '#5C3A21',
  },
  avatarTextPriya: {
    color: '#F0913A',
  },
  avatarBgRohan: {
    backgroundColor: '#1E3A66',
  },
  avatarTextRohan: {
    color: '#8DB8F5',
  },
  assigneeMiniText: {
    fontSize: 12,
    fontWeight: '700',
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
    borderColor: '#122440',
  },
  stackedAvatarFirst: {
    zIndex: 2,
  },
  stackedAvatarSecond: {
    marginLeft: -6,
    zIndex: 1,
  },
  avatarBgBlue: {
    backgroundColor: '#1E3A66',
  },
  avatarTextBlue: {
    color: '#8DB8F5',
  },
  avatarBgGreen: {
    backgroundColor: '#215C33',
  },
  avatarTextGreen: {
    color: '#4ADE80',
  },
  stackedAvatarText: {
    fontSize: 10,
    fontWeight: '700',
  },
  createdByText: {
    fontSize: 13,
    color: '#8A97AB',
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 16,
  },
  notesCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A97AB',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#CAD4DF',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#CAD4DF',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0913A',
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
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 13,
    fontWeight: '700',
    color: '#CAD4DF',
  },
  commentTime: {
    fontSize: 12,
    color: '#8A97AB',
  },
  commentBubble: {
    backgroundColor: '#122440',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 12,
  },
  commentBubbleYou: {
    borderColor: '#F0913A',
  },
  commentText: {
    fontSize: 14,
    color: '#CAD4DF',
    lineHeight: 20,
  },
  toastPill: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
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
    fontSize: 15,
    fontWeight: '600',
    color: '#0B1A2F',
  },
  toastUndoText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F0913A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
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
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reassignBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  markDoneBtn: {
    flex: 1.3,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0913A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  markDoneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reopenTaskBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reopenTaskBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CAD4DF',
  },
});
