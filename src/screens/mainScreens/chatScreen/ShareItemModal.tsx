import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { SelectableShareItem, SharedItemData } from './types';

export interface ShareItemModalProps {
  visible: boolean;
  onClose: () => void;
  onShareItem: (item: SharedItemData) => void;
}

type TabType = 'tasks' | 'events' | 'lists';

const ITEMS_BY_TAB: Record<TabType, SelectableShareItem[]> = {
  events: [
    {
      id: 'ev-1',
      type: 'event',
      title: 'Aarav’s PTM',
      subtitle: 'Fri, 6 Nov · 3:00 PM · St. Mary’s School',
      iconName: 'calendar',
      iconColor: '#3A8EF0',
      iconBgColor: 'transparent',
    },
    {
      id: 'ev-2',
      type: 'event',
      title: 'Badminton',
      subtitle: 'Today · 6:30 PM · Anaya',
      iconName: 'calendar',
      iconColor: '#4CC38A',
      iconBgColor: 'transparent',
    },
    {
      id: 'ev-3',
      type: 'event',
      title: 'Dinner at Nani’s',
      subtitle: 'Today · 8:00 PM',
      iconName: 'calendar',
      iconColor: '#3A8EF0',
      iconBgColor: 'transparent',
    },
    {
      id: 'ev-4',
      type: 'event',
      title: 'Nani’s birthday',
      subtitle: 'Wed, 4 Nov · All day',
      iconName: 'gift',
      iconColor: '#F0913A',
      iconBgColor: 'transparent',
    },
  ],
  tasks: [
    {
      id: 'tk-1',
      type: 'task',
      title: 'Pay school bus fee',
      subtitle: 'Assigned to Rohan · Due Wed, 28 Oct',
      iconName: 'check-square',
      iconColor: Colors.dangerRed,
      iconBgColor: 'rgba(232, 74, 95, 0.15)',
    },
    {
      id: 'tk-2',
      type: 'task',
      title: 'Buy Dadi’s BP tablets',
      subtitle: 'Assigned to you · Due Sunday',
      iconName: 'check-square',
      iconColor: Colors.primary,
      iconBgColor: 'rgba(240, 145, 58, 0.15)',
    },
    {
      id: 'tk-3',
      type: 'task',
      title: 'Sign Aarav’s science report',
      subtitle: 'Assigned to you · Due Tomorrow',
      iconName: 'check-square',
      iconColor: Colors.accentBlue,
      iconBgColor: 'rgba(58, 142, 240, 0.15)',
    },
  ],
  lists: [
    {
      id: 'ls-1',
      type: 'list',
      title: 'Diwali shopping',
      subtitle: '6 of 14 done · Shared by Dadi',
      iconName: 'list',
      iconColor: Colors.accentTeal,
      iconBgColor: 'rgba(46, 196, 182, 0.15)',
    },
    {
      id: 'ls-2',
      type: 'list',
      title: 'Weekly Groceries',
      subtitle: '12 items · Updated yesterday',
      iconName: 'list',
      iconColor: Colors.accentBlue,
      iconBgColor: 'rgba(58, 142, 240, 0.15)',
    },
  ],
};

export const ShareItemModal: React.FC<ShareItemModalProps> = ({
  visible,
  onClose,
  onShareItem,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('ev-1');

  const items = ITEMS_BY_TAB[activeTab].filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItem = ITEMS_BY_TAB[activeTab].find(
    (item) => item.id === selectedItemId
  );

  const handleShare = () => {
    if (!selectedItem) return;
    const sharePayload: SharedItemData = {
      type: selectedItem.type,
      title: selectedItem.title,
      subtitle: selectedItem.subtitle,
      actionLabel:
        selectedItem.type === 'event'
          ? 'Add to my calendar'
          : selectedItem.type === 'task'
          ? 'Mark done'
          : 'Open list',
      isOverdue: selectedItem.id === 'tk-1',
      progress:
        selectedItem.type === 'list' ? { current: 6, total: 14 } : undefined,
    };
    onShareItem(sharePayload);
    onClose();
  };

  const getButtonText = () => {
    const singleNoun =
      activeTab === 'events' ? 'event' : activeTab === 'tasks' ? 'task' : 'list';
    return `Share 1 ${singleNoun}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
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
                  onPress={() => {
                    setActiveTab('tasks');
                    setSelectedItemId('tk-1');
                  }}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="check-square"
                    size={16}
                    color={
                      activeTab === 'tasks' ? '#171612' : '#C8D1DC'
                    }
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
                  onPress={() => {
                    setActiveTab('events');
                    setSelectedItemId('ev-1');
                  }}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="calendar"
                    size={16}
                    color={
                      activeTab === 'events' ? '#171612' : '#C8D1DC'
                    }
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
                  onPress={() => {
                    setActiveTab('lists');
                    setSelectedItemId('ls-1');
                  }}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="list"
                    size={16}
                    color={
                      activeTab === 'lists' ? '#171612' : '#C8D1DC'
                    }
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
              </View>

              {/* Items Card List */}
              <ScrollView
                style={styles.listScrollView}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              >
                {items.map((item, index) => {
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
                })}
              </ScrollView>

              {/* Bottom Share Button */}
              <TouchableOpacity
                style={styles.shareCTAButton}
                onPress={handleShare}
                activeOpacity={0.85}
              >
                <Text style={styles.shareCTAButtonText}>{getButtonText()}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
    fontWeight: '700',
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
    fontWeight: '500',
    color: '#C8D1DC',
  },
  tabTextActive: {
    color: '#171612',
    fontWeight: '700',
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
    fontWeight: '600',
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
  shareCTAButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ShareItemModal;
