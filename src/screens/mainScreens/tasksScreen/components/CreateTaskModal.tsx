import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../../redux';
import { createTask, updateTask } from '../../../../redux/features/tasks/tasksSlice';
import { getMyFamilyThunk } from '../../../../redux/features/family/familySlice';
import { CreateTaskPayload } from '../../../../services/tasksServices';
import { TaskItem, TaskCategory, TaskPriority } from '../types';
import { CATEGORY_META, PRIORITY_META } from '../mockData';
import {
  toIsoDateString,
  formatTimeTo24Hour,
  mapRepeatToBackend,
  mapRemindersListToBackend,
  mapVisibilityToBackend,
  isUUID,
} from '../taskApiHelpers';
import AssigneesAndViewersModal, {
  ViewersOption,
} from './AssigneesAndViewersModal';
import DueDateTimeModal from './DueDateTimeModal';
import RepeatModal from './RepeatModal';
import RemindersModal from './RemindersModal';
import CategoryPriorityModal from './CategoryPriorityModal';
import DiscardChangesModal from './DiscardChangesModal';

const getTodayIsoString = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateTask: (task: Partial<TaskItem>) => void;
  initialTitle?: string;
  taskToEdit?: TaskItem | null;
  onUpdateTask?: (task: TaskItem) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onClose,
  onCreateTask,
  initialTitle = '',
  taskToEdit = null,
  onUpdateTask,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const myMemberId = useAppSelector(
    (state) =>
      state.family.myMemberId ||
      state.family.myFamilyData?.family?.myMemberId ||
      state.family.family?.myMemberId ||
      (state.family.myFamilyData as any)?.myMemberId ||
      null
  );
  const familyMembers = useAppSelector(
    (state) =>
      ((state.family.myFamilyData?.family as any)?.members as any[]) ||
      ((state.family.myFamilyData as any)?.members as any[]) ||
      ((state.family.family as any)?.members as any[]) ||
      []
  );

  useEffect(() => {
    if (visible && (!myMemberId || familyMembers.length === 0)) {
      dispatch(getMyFamilyThunk());
    }
  }, [visible, myMemberId, familyMembers.length, dispatch]);

  const resolveMemberId = (nameOrId: string): string | null => {
    if (!nameOrId) return null;
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        nameOrId
      )
    ) {
      return nameOrId;
    }
    const lower = nameOrId.toLowerCase();
    if (lower === 'you' || lower === 'priya') {
      return (
        myMemberId ||
        familyMembers.find((m: any) => m.isYou)?.memberId ||
        familyMembers[0]?.memberId ||
        familyMembers[0]?.id ||
        null
      );
    }
    const matched = familyMembers.find(
      (m: any) =>
        (m.fullName && m.fullName.toLowerCase().includes(lower)) ||
        (m.name && m.name.toLowerCase().includes(lower)) ||
        m.memberId === nameOrId ||
        m.id === nameOrId
    );
    return matched?.memberId || matched?.id || null;
  };

  const [title, setTitle] = useState(initialTitle);
  const [assignee, setAssignee] = useState('You');
  const [assigneesList, setAssigneesList] = useState<string[]>(['You']);
  const [viewers, setViewers] = useState('Everyone in the family');
  const [viewersOption, setViewersOption] = useState<ViewersOption>('everyone');
  const [category, setCategory] = useState<TaskCategory>('household');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('Today');
  const [dueFormatted, setDueFormatted] = useState('Today · by 6:00 PM');
  const [dueTime, setDueTime] = useState<string | undefined>('6:00 PM');
  const [dueOnIso, setDueOnIso] = useState<string>(getTodayIsoString());
  const [repeat, setRepeat] = useState('Doesn’t repeat');
  const [reminders, setReminders] = useState('1 hour before');
  const [remindersList, setRemindersList] = useState<string[]>([
    '1 hour before',
  ]);
  const [alsoRemindViewers, setAlsoRemindViewers] = useState(false);
  const [notes, setNotes] = useState('');

  // Internal Sub-Modals
  const [showAssigneesModal, setShowAssigneesModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showCategoryPriorityModal, setShowCategoryPriorityModal] =
    useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  React.useEffect(() => {
    if (!visible) {
      setShowDiscardModal(false);
      return;
    }
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setNotes(taskToEdit.notes || '');
      setAssignee(taskToEdit.assignee || 'You');
      setAssigneesList(taskToEdit.assignee ? taskToEdit.assignee.split(', ') : ['You']);
      setCategory((taskToEdit.category?.toLowerCase() || 'household') as TaskCategory);
      setPriority((taskToEdit.priority?.toLowerCase() || 'medium') as TaskPriority);
      setDueDate(taskToEdit.dueDate || 'Today');
      setDueTime(taskToEdit.dueTime || undefined);
      setDueFormatted(taskToEdit.dueFormatted || taskToEdit.dueDate || '');
      setRepeat(taskToEdit.repeat || 'Doesn’t repeat');
      setReminders(taskToEdit.reminders || '1 hour before');
      setRemindersList(taskToEdit.reminders ? [taskToEdit.reminders] : ['1 hour before']);
    } else {
      setTitle(initialTitle);
      setDueDate('Today');
      setDueFormatted('Today · by 6:00 PM');
      setDueTime('6:00 PM');
      setDueOnIso(getTodayIsoString());
    }
  }, [initialTitle, taskToEdit, visible]);

  const resetForm = () => {
    setTitle('');
    setNotes('');
    setAssignee('You');
    setAssigneesList(['You']);
    setViewers('Everyone in the family');
    setViewersOption('everyone');
    setCategory('household');
    setPriority('medium');
    setDueDate('Today');
    setDueFormatted('Today · by 6:00 PM');
    setDueTime('6:00 PM');
    setDueOnIso(getTodayIsoString());
    setRepeat('Doesn’t repeat');
    setReminders('1 hour before');
    setRemindersList(['1 hour before']);
    setAlsoRemindViewers(false);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    // Resolve assignees to valid member UUIDs
    const resolvedIds = assigneesList
      .map(resolveMemberId)
      .filter((id): id is string => Boolean(id));

    const finalAssigneeIds =
      resolvedIds.length > 0
        ? resolvedIds
        : myMemberId
        ? [myMemberId]
        : familyMembers[0]?.memberId
        ? [familyMembers[0].memberId]
        : [];

    if (finalAssigneeIds.length === 0) {
      Alert.alert(
        'Assignee Required',
        'Please assign the task to at least one family member.'
      );
      return;
    }

    const finalDueOn = dueOnIso || toIsoDateString(dueDate);
    const finalDueTime = formatTimeTo24Hour(dueTime);
    const finalRepeat = mapRepeatToBackend(repeat);
    const finalReminders = mapRemindersListToBackend(remindersList);
    const finalVisibility = mapVisibilityToBackend(viewersOption);

    // Rule 5: Field Interdependence
    // 1. repeat & reminders require dueOn
    // 2. AT_DUE & ONE_HOUR_BEFORE require dueTime
    let sanitizedReminders = finalReminders;
    if (!finalDueTime && sanitizedReminders.length > 0) {
      sanitizedReminders = sanitizedReminders.filter(
        (r) => r !== 'AT_DUE' && r !== 'ONE_HOUR_BEFORE'
      );
    }

    const payload: CreateTaskPayload = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      assigneeMemberIds: finalAssigneeIds,
      category: category.toUpperCase(),
      priority: priority.toUpperCase(),
      dueOn: finalDueOn || undefined,
      dueTime: finalDueTime || undefined,
      visibility: finalVisibility,
      repeat: finalDueOn ? finalRepeat : undefined,
      reminders: finalDueOn && sanitizedReminders.length > 0 ? sanitizedReminders : undefined,
      remindViewersToo: alsoRemindViewers,
    };

    console.log('[CreateTaskModal] Submitting task payload:', payload);

    try {
      if (taskToEdit && isUUID(taskToEdit.id)) {
        await dispatch(updateTask({ taskId: taskToEdit.id, payload })).unwrap();
        console.log('[CreateTaskModal] ✅ Task successfully updated:', taskToEdit.id);
        const updatedTask: TaskItem = {
          ...taskToEdit,
          title: title.trim(),
          notes: notes.trim() || undefined,
          category,
          categoryLabel: CATEGORY_META[category].label,
          priority,
          priorityLabel: PRIORITY_META[priority].label,
          dueDate,
          dueTime,
          dueFormatted,
          repeat,
          reminders,
          viewers,
        };
        onUpdateTask?.(updatedTask);
        onCreateTask(updatedTask);
        resetForm();
        onClose();
        return;
      }

      const res = await dispatch(createTask(payload)).unwrap();
      console.log('[CreateTaskModal] ✅ Task successfully created:', res);
      onCreateTask({
        id: res?.task?.id || `task-${Date.now()}`,
        title: title.trim(),
        dueDate,
        dueTime,
        dueFormatted,
        dueType: 'today',
        assignee,
        assigneeInitial: assignee === 'You' ? 'P' : assignee[0],
        category,
        categoryLabel: CATEGORY_META[category].label,
        priority,
        priorityLabel: PRIORITY_META[priority].label,
        repeat,
        reminders,
        viewers,
        notes: notes.trim(),
        isCompleted: false,
      });
      resetForm();
      onClose();
    } catch (err: any) {
      console.log('[CreateTaskModal] ❌ Failed to create task:', err);
      const errorMessage = Array.isArray(err)
        ? err.join('\n')
        : typeof err === 'object' && err?.message
        ? Array.isArray(err.message)
          ? err.message.join('\n')
          : err.message
        : String(err);
      Alert.alert('Create Task Error', errorMessage);
    }
  };

  const isFormDirty =
    title.trim().length > 0 ||
    notes.trim().length > 0 ||
    assignee !== 'You' ||
    assigneesList.length !== 1 ||
    assigneesList[0] !== 'You' ||
    viewersOption !== 'everyone' ||
    category !== 'household' ||
    priority !== 'medium' ||
    (repeat !== 'Doesn’t repeat' && repeat !== "Doesn't repeat") ||
    dueDate !== 'Today' ||
    dueTime !== '6:00 PM' ||
    remindersList.length !== 1 ||
    remindersList[0] !== '1 hour before';

  const handleClose = () => {
    if (isFormDirty) {
      setShowDiscardModal(true);
    } else {
      onClose();
    }
  };

  const handleDiscard = () => {
    setShowDiscardModal(false);
    resetForm();
    onClose();
  };

  const categoryMeta = CATEGORY_META[category];
  const priorityMeta = PRIORITY_META[priority];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 16) },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar barStyle="light-content" />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close create task"
          >
            <Feather name="x" size={20} color="#CAD4DF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {taskToEdit ? 'Edit task' : 'New task'}
          </Text>

          <View style={styles.spacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 88 },
          ]}
        >
          {/* What needs doing? Input */}
          <Text style={styles.inputLabel}>What needs doing?</Text>
          <View style={styles.titleInputWrapper}>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g. Book train tickets to Jaipur"
              placeholderTextColor="#8A97AB"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          {/* Options Card */}
          <View style={styles.optionsCard}>
            {/* Assigned to */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setShowAssigneesModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconBox}>
                <Feather name="user" size={18} color="#8A97AB" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Assigned to</Text>
                <View style={styles.assigneeBadgeRow}>
                  <View style={styles.assigneeMiniAvatar}>
                    <Text style={styles.assigneeMiniText}>
                      {assignee === 'You' ? 'P' : assignee[0]}
                    </Text>
                  </View>
                  <Text style={styles.optionValue}>{assignee}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Who can see it */}
            <TouchableOpacity
              style={[styles.optionRow, styles.divider]}
              onPress={() => setShowAssigneesModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconBox}>
                <Feather name="eye" size={18} color="#8A97AB" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Who can see it</Text>
                <Text style={styles.optionValue}>{viewers}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Due */}
            <TouchableOpacity
              style={[styles.optionRow, styles.divider]}
              onPress={() => setShowDueModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconBox}>
                <Feather name="calendar" size={18} color="#8A97AB" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Due</Text>
                <Text style={styles.optionValue}>{dueFormatted}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Repeat */}
            <TouchableOpacity
              style={[styles.optionRow, styles.divider]}
              onPress={() => setShowRepeatModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconBox}>
                <Feather name="repeat" size={18} color="#8A97AB" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Repeat</Text>
                <Text style={styles.optionValue}>{repeat}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Reminders */}
            <TouchableOpacity
              style={[styles.optionRow, styles.divider]}
              onPress={() => setShowRemindersModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconBox}>
                <Feather name="bell" size={18} color="#8A97AB" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Reminders</Text>
                <Text style={styles.optionValue}>{reminders}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Category */}
            <TouchableOpacity
              style={[styles.optionRow, styles.divider]}
              onPress={() => setShowCategoryPriorityModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconBox}>
                <Feather name="tag" size={18} color="#8A97AB" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Category</Text>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: categoryMeta.color },
                    ]}
                  />
                  <Text style={styles.optionValue}>{categoryMeta.label}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Priority */}
            <TouchableOpacity
              style={[styles.optionRow, styles.divider]}
              onPress={() => setShowCategoryPriorityModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconBox}>
                <Feather name="flag" size={18} color="#8A97AB" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Priority</Text>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: priorityMeta.color },
                    ]}
                  />
                  <Text style={styles.optionValue}>{priorityMeta.label}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>
          </View>

          {/* Notes Input */}
          <Text style={styles.notesLabel}>Notes</Text>
          <View style={styles.notesInputCard}>
            <TextInput
              style={styles.notesInput}
              placeholder="Add details, an amount or a link (optional)"
              placeholderTextColor="#8A97AB"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </ScrollView>

        {/* Bottom CTA Button */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) + 6 },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.createButton,
              !title.trim() && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!title.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>
              {taskToEdit ? 'Save changes' : 'Create task'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub-Modals */}
        <AssigneesAndViewersModal
          visible={showAssigneesModal}
          selectedAssignees={assigneesList}
          selectedViewers={viewersOption}
          onClose={() => setShowAssigneesModal(false)}
          onSave={(newAssignees, newViewersOption, newViewersLabel) => {
            setAssigneesList(newAssignees);
            setAssignee(newAssignees.join(', '));
            setViewersOption(newViewersOption);
            setViewers(newViewersLabel);
          }}
        />

        <DueDateTimeModal
          visible={showDueModal}
          initialDate={dueDate}
          initialTime={dueTime}
          onClose={() => setShowDueModal(false)}
          onSave={(newDate, newFormatted, newTime, isoDate) => {
            setDueDate(newDate);
            setDueFormatted(newFormatted);
            setDueTime(newTime);
            if (isoDate) setDueOnIso(isoDate);
          }}
        />

        <RepeatModal
          visible={showRepeatModal}
          initialRepeat={repeat}
          onClose={() => setShowRepeatModal(false)}
          onSave={(newRepeat) => setRepeat(newRepeat)}
        />

        <RemindersModal
          visible={showRemindersModal}
          initialReminders={remindersList}
          initialAlsoRemindViewers={alsoRemindViewers}
          onClose={() => setShowRemindersModal(false)}
          onSave={(formattedText, list, alsoRemind) => {
            setReminders(formattedText);
            setRemindersList(list);
            setAlsoRemindViewers(alsoRemind);
          }}
        />

        <CategoryPriorityModal
          visible={showCategoryPriorityModal}
          initialCategory={category}
          initialPriority={priority}
          onClose={() => setShowCategoryPriorityModal(false)}
          onSave={(newCat, newPri) => {
            setCategory(newCat);
            setPriority(newPri);
          }}
        />

        <DiscardChangesModal
          visible={showDiscardModal}
          onKeepEditing={() => setShowDiscardModal(false)}
          onDiscard={handleDiscard}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateTaskModal;

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
    fontFamily: 'Roboto-Bold',
    color: '#CAD4DF',
  },
  spacer: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
    marginBottom: 8,
  },
  titleInputWrapper: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  optionsCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    overflow: 'hidden',
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
  },
  optionIconBox: {
    marginRight: 14,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 2,
  },
  optionValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  assigneeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assigneeMiniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5C3A21',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeMiniText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
    marginBottom: 8,
  },
  notesInputCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    padding: 14,
    minHeight: 80,
  },
  notesInput: {
    fontSize: 14,
    color: '#CAD4DF',
    lineHeight: 20,
    paddingTop: 0,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  createButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
});
