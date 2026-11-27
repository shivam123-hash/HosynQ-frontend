import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { updateReminderThunk } from '../../../redux/features/reminders/remindersSlice';
import {
  fetchNeedsAttentionThunk,
  removeNeedsAttentionItemById,
  setNeedsAttentionSection,
} from '../../../redux/features/home/needsAttentionSlice';
import { remindTaskThunk } from '../../../redux/features/tasks/tasksSlice';
import {
  NeedsAttentionSectionFilter,
  NeedsAttentionSectionName,
} from '../../../services/homeServices';
import { ReminderApi } from '../../../services/remindersServices';
import { NeedsAttentionSkeleton } from '../../../components/SkeletonLoader';
import ReminderDialog, {
  INITIAL_REMINDER_DIALOG_STATE,
  ReminderDialogState,
} from '../addFlow/ReminderDialog';
import {
  isJestTestEnv,
  scheduleReminderAfterTransition,
} from '../addFlow/reminderApiHelpers';
import {
  mapFilterToBackendSection,
  mapHomeAttentionToScreenItem,
  normalizeAttentionSource,
} from './attentionHelpers';
import {
  NeedsAttentionHeader,
  NeedsAttentionFilterPills,
  AttentionSectionCard,
} from './components';
import ReminderDetailModal from './ReminderDetailModal';
import {
  AttentionCategory,
  AttentionFilterPillItem,
  AttentionFilterType,
  AttentionItem,
  AttentionSectionGroup,
} from './types';

export interface NeedsAttentionScreenProps {
  initialFilter?: AttentionFilterType;
  onBack?: () => void;
  onItemPress?: (item: AttentionItem) => void;
  onRemindPress?: (item: AttentionItem) => void;
}

const SECTION_ORDER: Array<{
  backend: NeedsAttentionSectionName;
  category: AttentionCategory;
  title: string;
}> = [
  { backend: 'OVERDUE', category: 'overdue', title: 'OVERDUE' },
  { backend: 'DUE_SOON', category: 'due_soon', title: 'DUE SOON' },
  { backend: 'RENEWALS', category: 'renewals', title: 'RENEWALS' },
  {
    backend: 'IMPORTANT_DATES',
    category: 'important_dates',
    title: 'IMPORTANT DATES',
  },
];

const WITHIN_DAYS = 60;
const PAGE_LIMIT = 30;

const NeedsAttentionScreen: React.FC<NeedsAttentionScreenProps> = ({
  initialFilter = 'ALL',
  onBack,
  onItemPress,
  onRemindPress,
}) => {
  const dispatch = useAppDispatch();
  const needsAttentionState = useAppSelector((state) => state.needsAttention);
  const remindersState = useAppSelector((state) => state.reminders);
  const isTestEnv = isJestTestEnv();

  const [selectedSection, setSelectedSection] =
    useState<NeedsAttentionSectionFilter>(() =>
      mapFilterToBackendSection(initialFilter)
    );
  const [refreshing, setRefreshing] = useState(false);
  const didInitialLoadRef = useRef(false);
  const [detailReminder, setDetailReminder] = useState<{
    id: string;
    initial?: ReminderApi | null;
  } | null>(null);
  const [dialog, setDialog] = useState<ReminderDialogState>(
    INITIAL_REMINDER_DIALOG_STATE
  );

  const loadAllSections = useCallback(async () => {
    await dispatch(
      fetchNeedsAttentionThunk({
        section: 'ALL',
        withinDays: WITHIN_DAYS,
        limit: PAGE_LIMIT,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (didInitialLoadRef.current) return;
    if (isTestEnv && needsAttentionState.hasLoaded) {
      didInitialLoadRef.current = true;
      return;
    }
    didInitialLoadRef.current = true;
    return scheduleReminderAfterTransition(() => {
      dispatch(setNeedsAttentionSection('ALL'));
      loadAllSections();
    });
  }, [dispatch, isTestEnv, loadAllSections, needsAttentionState.hasLoaded]);

  const handleSelectFilter = useCallback(
    (filter: AttentionFilterType) => {
      const nextSection = mapFilterToBackendSection(filter);
      setSelectedSection(nextSection);
      dispatch(setNeedsAttentionSection(nextSection));
    },
    [dispatch]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAllSections();
    } finally {
      setRefreshing(false);
    }
  }, [loadAllSections]);

  const mappedItems: AttentionItem[] = useMemo(() => {
    return (needsAttentionState.items || []).map(mapHomeAttentionToScreenItem);
  }, [needsAttentionState.items]);

  const filteredSections: AttentionSectionGroup[] = useMemo(() => {
    const visibleItems =
      selectedSection === 'ALL'
        ? mappedItems
        : mappedItems.filter(
            (item) => item.backendSection === selectedSection
          );

    const groups: AttentionSectionGroup[] = [];
    SECTION_ORDER.forEach(({ backend, category, title }) => {
      const bucket = visibleItems.filter(
        (item) => item.backendSection === backend
      );
      if (bucket.length > 0) {
        groups.push({
          key: category,
          title,
          items: bucket,
        });
      }
    });
    return groups;
  }, [mappedItems, selectedSection]);

  const filterPills: AttentionFilterPillItem[] = useMemo(() => {
    const c = needsAttentionState.counts || {
      total: 0,
      overdue: 0,
      all: 0,
      dueSoon: 0,
      renewals: 0,
      importantDates: 0,
    };
    return [
      { id: 'ALL', label: `All ${c.all ?? c.total ?? 0}`, count: c.all ?? 0 },
      { id: 'OVERDUE', label: `Overdue ${c.overdue ?? 0}`, count: c.overdue ?? 0 },
      { id: 'DUE_SOON', label: `Due soon ${c.dueSoon ?? 0}`, count: c.dueSoon ?? 0 },
      { id: 'RENEWALS', label: `Renewals ${c.renewals ?? 0}`, count: c.renewals ?? 0 },
      {
        id: 'IMPORTANT_DATES',
        label: `Important ${c.importantDates ?? 0}`,
        count: c.importantDates ?? 0,
      },
    ];
  }, [needsAttentionState.counts]);

  const handleActionPress = useCallback(
    async (item: AttentionItem) => {
      const src = normalizeAttentionSource(item.source);
      const rawId = item.rawId || item.reminderId || item.taskId || item.id;

      if (src === 'REMINDER' && rawId) {
        try {
          await dispatch(
            updateReminderThunk({
              id: rawId,
              payload: { done: !item.done },
            })
          ).unwrap();
          dispatch(
            removeNeedsAttentionItemById({ source: 'REMINDER', id: rawId })
          );
          await loadAllSections();
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
        return;
      }

      if (src === 'TASK' && rawId) {
        if (onRemindPress) {
          onRemindPress(item);
          return;
        }
        try {
          await dispatch(remindTaskThunk({ taskId: rawId })).unwrap();
          setDialog({
            visible: true,
            type: 'warning',
            iconName: 'bell',
            title: 'Reminder sent',
            description: `Sent a nudge for "${item.title}".`,
            primaryButtonText: 'OK',
          });
        } catch (err: any) {
          setDialog({
            visible: true,
            type: 'danger',
            iconName: 'alert-circle',
            title: 'Could not send reminder',
            description: String(err || 'Please try again.'),
            primaryButtonText: 'OK',
          });
        }
        return;
      }

      if (onRemindPress) {
        onRemindPress(item);
      }
    },
    [dispatch, loadAllSections, onRemindPress]
  );

  const handleItemPress = useCallback(
    (item: AttentionItem) => {
      const src = normalizeAttentionSource(item.source);
      const rawId = item.rawId || item.reminderId || item.taskId || item.id;

      if (src === 'REMINDER' && rawId) {
        const matched =
          remindersState.selectedReminder?.id === rawId
            ? remindersState.selectedReminder
            : null;
        setDetailReminder({ id: rawId, initial: matched });
        return;
      }

      if (onItemPress) {
        onItemPress(item);
      } else {
        setDialog({
          visible: true,
          type: 'warning',
          iconName: item.iconName || 'bell',
          title: item.title,
          description: item.subtitle,
          primaryButtonText: 'OK',
        });
      }
    },
    [onItemPress, remindersState.selectedReminder]
  );

  const pagination = needsAttentionState.pagination;

  const handleLoadMore = useCallback(async () => {
    const cursor = pagination?.nextCursor?.trim();
    if (needsAttentionState.loadingMore || !pagination?.hasMore || !cursor) return;
    await dispatch(
      fetchNeedsAttentionThunk({
        section: 'ALL',
        withinDays: WITHIN_DAYS,
        limit: PAGE_LIMIT,
        before: cursor,
      })
    );
  }, [dispatch, needsAttentionState.loadingMore, pagination?.hasMore, pagination?.nextCursor]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 120) {
        handleLoadMore();
      }
    },
    [handleLoadMore]
  );

  const isInitialLoading =
    !isTestEnv &&
    !refreshing &&
    !needsAttentionState.hasLoaded &&
    needsAttentionState.loading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <NeedsAttentionHeader onBackPress={onBack} />

      {/* Filter Horizontal Pills */}
      <NeedsAttentionFilterPills
        pills={filterPills}
        selectedFilter={selectedSection}
        onSelectFilter={handleSelectFilter}
      />

      {/* Scrollable Unified Needs Attention List */}
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
              tintColor="#F0923A"
              colors={['#F0923A']}
            />
          }
        >
          {filteredSections.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Feather name="bell" size={22} color="#F0923A" />
              </View>
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptySubtitle}>
                No reminders, overdue tasks, renewals, or important dates need attention right now.
              </Text>
            </View>
          ) : (
            <>
              {filteredSections.map((section) => (
                <AttentionSectionCard
                  key={section.key}
                  section={section}
                  onItemPress={handleItemPress}
                  onRemindPress={handleActionPress}
                />
              ))}

              {pagination?.hasMore && Boolean(pagination?.nextCursor?.trim()) && (
                <TouchableOpacity
                  style={styles.loadMoreBtn}
                  onPress={handleLoadMore}
                  disabled={needsAttentionState.loadingMore}
                  activeOpacity={0.8}
                >
                  {needsAttentionState.loadingMore ? (
                    <ActivityIndicator size="small" color="#F0923A" />
                  ) : (
                    <Text style={styles.loadMoreText}>Load more</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Reminder Detail Modal (GET /reminders/:id, PATCH, DELETE) */}
      <ReminderDetailModal
        visible={Boolean(detailReminder)}
        reminderId={detailReminder?.id}
        initialReminder={detailReminder?.initial}
        onClose={() => setDetailReminder(null)}
        onUpdated={() => {
          loadAllSections();
        }}
        onDeleted={() => {
          loadAllSections();
        }}
      />

      <ReminderDialog
        dialog={dialog}
        onClose={() => setDialog(INITIAL_REMINDER_DIALOG_STATE)}
      />
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyCard: {
    marginTop: 24,
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 24,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#6E4924',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16.5,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 19,
  },
  loadMoreBtn: {
    marginTop: 16,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#2A4163',
    backgroundColor: '#122440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0923A',
  },
});

export default NeedsAttentionScreen;
