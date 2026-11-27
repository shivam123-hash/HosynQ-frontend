import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import chatServices from '../../../services/chatServices';
import { useAppSelector } from '../../../redux';
import { SelectableShareItem, SharedItemData } from './types';

export interface ShareItemModalProps {
  visible: boolean;
  onClose: () => void;
  onShareItem: (item: SelectableShareItem | SharedItemData) => void;
}

type TabType = 'tasks' | 'events' | 'lists';

const mapTaskToShareItem = (t: any): SelectableShareItem => {
  const assigneesStr =
    t.assignees && t.assignees.length > 0
      ? t.assignees.map((a: any) => a.fullName || a.member?.fullName || 'Member').join(', ')
      : 'Unassigned';
  const dueStr = t.dueOn ? `Due ${t.dueOn}` : 'No due date';
  return {
    id: t.id,
    type: 'task',
    title: t.title || 'Untitled task',
    subtitle: `Assigned to ${assigneesStr} · ${dueStr}`,
    iconName: 'check-square',
    iconColor: t.overdue ? Colors.dangerRed : Colors.primary,
    iconBgColor: 'transparent',
  };
};

const mapEventToShareItem = (e: any): SelectableShareItem => {
  const timeStr = e.startTime || (e.allDay ? 'All day' : '');
  const locStr = e.location ? ` · ${e.location}` : '';
  const dateStr = e.startsOn || e.occurrenceOn || 'Upcoming';
  const subtitle = `${dateStr}${timeStr ? ` · ${timeStr}` : ''}${locStr}`;
  return {
    id: e.id,
    type: 'event',
    title: e.title || 'Untitled event',
    subtitle,
    iconName: e.category === 'BIRTHDAY' ? 'gift' : 'calendar',
    iconColor: e.category === 'BIRTHDAY' ? '#F0913A' : '#3A8EF0',
    iconBgColor: 'transparent',
  };
};

const mapListToShareItem = (l: any): SelectableShareItem => {
  const done = l.counts?.done ?? l.doneCount ?? (l.items?.filter((i: any) => i.done || i.doneAt)?.length || 0);
  const total = l.counts?.total ?? l.totalCount ?? (l.items?.length || 0);
  const sharedBy = l.createdBy?.fullName ? ` · Shared by ${l.createdBy.fullName}` : '';
  return {
    id: l.id,
    type: 'list',
    title: l.name || l.title || 'Family List',
    subtitle: total > 0 ? `${done} of ${total} done${sharedBy}` : `Empty list${sharedBy}`,
    iconName: 'list',
    iconColor: Colors.accentTeal,
    iconBgColor: 'transparent',
  };
};

export const ShareItemModal: React.FC<ShareItemModalProps> = ({
  visible,
  onClose,
  onShareItem,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Cached items from Redux for immediate responsive display
  const reduxTasks = useAppSelector((state) => state.tasks?.tasks || []);
  const reduxEvents = useAppSelector((state) => state.calendar?.feed?.events || []);
  const reduxLists = useAppSelector((state) => state.lists?.lists || []);

  const [itemsByTab, setItemsByTab] = useState<Record<TabType, SelectableShareItem[]>>({
    tasks: [],
    events: [],
    lists: [],
  });

  // Fetch real shareable items from Backend
  const loadShareableItems = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, eventsRes, listsRes] = await Promise.allSettled([
        chatServices.getTasksForShare(),
        chatServices.getEventsForShare(),
        chatServices.getListsForShare(),
      ]);

      const newItemsByTab: Record<TabType, SelectableShareItem[]> = {
        tasks: [],
        events: [],
        lists: [],
      };

      // 1. Process Tasks
      if (tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value?.tasks) && tasksRes.value.tasks.length > 0) {
        newItemsByTab.tasks = tasksRes.value.tasks.map(mapTaskToShareItem);
      } else if (reduxTasks.length > 0) {
        newItemsByTab.tasks = reduxTasks.map(mapTaskToShareItem);
      }

      // 2. Process Events
      if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value?.events) && eventsRes.value.events.length > 0) {
        newItemsByTab.events = eventsRes.value.events.map(mapEventToShareItem);
      } else if (reduxEvents.length > 0) {
        newItemsByTab.events = reduxEvents.map(mapEventToShareItem);
      }

      // 3. Process Lists
      if (listsRes.status === 'fulfilled' && Array.isArray(listsRes.value?.lists) && listsRes.value.lists.length > 0) {
        newItemsByTab.lists = listsRes.value.lists.map(mapListToShareItem);
      } else if (reduxLists.length > 0) {
        newItemsByTab.lists = reduxLists.map(mapListToShareItem);
      }

      setItemsByTab(newItemsByTab);

      // Pre-select first item of active tab if none selected
      const currentTabItems = newItemsByTab[activeTab];
      if (currentTabItems.length > 0) {
        setSelectedItemId((prev) => {
          const exists = currentTabItems.some((item) => item.id === prev);
          return exists ? prev : currentTabItems[0].id;
        });
      } else {
        setSelectedItemId('');
      }
    } catch {
      // Retain existing state or fallback to cached Redux data
      setItemsByTab({
        tasks: reduxTasks.map(mapTaskToShareItem),
        events: reduxEvents.map(mapEventToShareItem),
        lists: reduxLists.map(mapListToShareItem),
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, reduxTasks, reduxEvents, reduxLists]);

  useEffect(() => {
    if (visible) {
      // Seed with available Redux items immediately
      setItemsByTab({
        tasks: reduxTasks.map(mapTaskToShareItem),
        events: reduxEvents.map(mapEventToShareItem),
        lists: reduxLists.map(mapListToShareItem),
      });
      loadShareableItems();
    } else {
      setSearchQuery('');
      setSelectedItemId('');
    }
  }, [visible, loadShareableItems]);

  // Tab switch handler
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
    const tabItems = itemsByTab[tab] || [];
    if (tabItems.length > 0) {
      setSelectedItemId(tabItems[0].id);
    } else {
      setSelectedItemId('');
    }
  };

  const currentTabItems = itemsByTab[activeTab] || [];
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return currentTabItems;
    const query = searchQuery.toLowerCase();
    return currentTabItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query)
    );
  }, [currentTabItems, searchQuery]);

  const selectedItem = useMemo(() => {
    return currentTabItems.find((item) => item.id === selectedItemId);
  }, [currentTabItems, selectedItemId]);

  const handleShare = () => {
    if (!selectedItem) return;
    onShareItem(selectedItem);
    onClose();
  };

  const getButtonText = () => {
    const singleNoun =
      activeTab === 'events' ? 'event' : activeTab === 'tasks' ? 'task' : 'list';
    return selectedItem ? `Share 1 ${singleNoun}` : `Select a ${singleNoun}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop touchable to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.handleBar} />

          {/* Title */}
          <Text style={styles.sheetTitle}>Share in Family chat</Text>

          {/* Segmented Control Tabs */}
          <View style={styles.tabBar}>
            {/* Tasks Tab */}
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'tasks' && styles.tabButtonActive,
              ]}
              onPress={() => handleTabChange('tasks')}
              activeOpacity={0.7}
            >
              <Feather
                name="check-square"
                size={16}
                color={activeTab === 'tasks' ? '#171612' : '#C8D1DC'}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'tasks' && styles.tabTextActive,
                ]}
              >
                Tasks
              </Text>
            </TouchableOpacity>

            {/* Events Tab */}
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'events' && styles.tabButtonActive,
              ]}
              onPress={() => handleTabChange('events')}
              activeOpacity={0.7}
            >
              <Feather
                name="calendar"
                size={16}
                color={activeTab === 'events' ? '#171612' : '#C8D1DC'}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'events' && styles.tabTextActive,
                ]}
              >
                Events
              </Text>
            </TouchableOpacity>

            {/* Lists Tab */}
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'lists' && styles.tabButtonActive,
              ]}
              onPress={() => handleTabChange('lists')}
              activeOpacity={0.7}
            >
              <Feather
                name="list"
                size={16}
                color={activeTab === 'lists' ? '#171612' : '#C8D1DC'}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'lists' && styles.tabTextActive,
                ]}
              >
                Lists
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Feather
              name="search"
              size={18}
              color="#8A97AB"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${activeTab}`}
              placeholderTextColor="#8A97AB"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={16} color="#8A97AB" />
              </TouchableOpacity>
            )}
          </View>

          {/* Items Card List */}
          <ScrollView
            style={styles.listScrollView}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {loading && currentTabItems.length === 0 ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading {activeTab}...</Text>
              </View>
            ) : filteredItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <View style={styles.emptyIconCircle}>
                  <Feather
                    name={activeTab === 'tasks' ? 'check-square' : activeTab === 'events' ? 'calendar' : 'list'}
                    size={26}
                    color="#63758E"
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {searchQuery.trim() ? `No matching ${activeTab}` : `No ${activeTab} found`}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery.trim()
                    ? 'Try searching with a different keyword'
                    : `Your family has no ${activeTab} available to share right now.`}
                </Text>
              </View>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.itemRow,
                      index > 0 && styles.itemRowDivider,
                    ]}
                    onPress={() => setSelectedItemId(item.id)}
                    activeOpacity={0.7}
                  >
                    {/* Checkbox */}
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Feather name="check" size={14} color="#171612" />
                      )}
                    </View>

                    {/* Icon */}
                    <View
                      style={[
                        styles.itemIconBox,
                        { borderColor: item.iconColor },
                      ]}
                    >
                      <Feather
                        name={item.iconName as any}
                        size={20}
                        color={item.iconColor}
                      />
                    </View>

                    {/* Text details */}
                    <View style={styles.itemTextGroup}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Bottom Share Button */}
          <TouchableOpacity
            style={[
              styles.shareCTAButton,
              !selectedItem && styles.shareCTAButtonDisabled,
            ]}
            onPress={handleShare}
            disabled={!selectedItem}
            activeOpacity={0.85}
          >
            <Text style={styles.shareCTAButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#122440',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1F3249',
    maxHeight: '88%',
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4A62',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 18,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0B1728',
    borderRadius: 26,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1F3249',
    marginBottom: 16,
    height: 52,
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#C8D1DC',
  },
  tabTextActive: {
    color: '#171612',
    fontFamily: 'Roboto-Bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1728',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#1F3249',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
    padding: 0,
  },
  listScrollView: {
    maxHeight: 290,
    marginBottom: 20,
  },
  listContainer: {
    backgroundColor: '#0E1E34',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3249',
    overflow: 'hidden',
    minHeight: 140,
  },
  loadingBox: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8A97AB',
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    marginTop: 8,
  },
  emptyBox: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#8A97AB',
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    lineHeight: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemRowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#172740',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#3A4A62',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  itemIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  itemTextGroup: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.white,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  shareCTAButton: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCTAButtonDisabled: {
    backgroundColor: '#3A4A62',
  },
  shareCTAButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
});

export default ShareItemModal;
