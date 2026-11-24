import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { ListGroup, ListItemEntry, ListType } from '../types';
import { LIST_TYPE_CONFIG } from '../mockData';

const renderTypeIcon = (type: ListType, color: string) => {
  switch (type) {
    case 'grocery':
      return <Ionicons name="cart-outline" size={14} color={color} style={styles.pillIcon} />;
    case 'packing':
      return <Ionicons name="bag-handle-outline" size={13} color={color} style={styles.pillIcon} />;
    case 'school':
      return <Ionicons name="school-outline" size={13} color={color} style={styles.pillIcon} />;
    case 'party':
      return <Ionicons name="sparkles-outline" size={13} color={color} style={styles.pillIcon} />;
    case 'custom':
      return <Ionicons name="list-outline" size={14} color={color} style={styles.pillIcon} />;
  }
};
import AddListItemsModal from './AddListItemsModal';
import AssignListItemModal from './AssignListItemModal';
import ShareListModal from './ShareListModal';
import ListOptionsModal from './ListOptionsModal';

export interface ListDetailModalProps {
  visible: boolean;
  list: ListGroup | null;
  onClose: () => void;
  onUpdateList: (updatedList: ListGroup) => void;
  onDeleteList: (listId: string) => void;
}

const ListDetailModal: React.FC<ListDetailModalProps> = ({
  visible,
  list,
  onClose,
  onUpdateList,
  onDeleteList,
}) => {
  const insets = useSafeAreaInsets();
  const [showAddItems, setShowAddItems] = useState(false);
  const [selectedItemForAssign, setSelectedItemForAssign] =
    useState<ListItemEntry | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDoneItems, setShowDoneItems] = useState(false);

  if (!list) return null;

  const config = LIST_TYPE_CONFIG[list.type] || LIST_TYPE_CONFIG.custom;
  const totalCount = list.items.length;
  const doneItems = list.items.filter((i) => i.isCompleted);
  const pendingItems = list.items.filter((i) => !i.isCompleted);
  const doneCount = doneItems.length;
  const isAllDone = totalCount > 0 && doneCount === totalCount;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  // Toggle single item complete
  const handleToggleItem = (itemId: string) => {
    const updatedItems = list.items.map((i) =>
      i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i
    );
    const updated: ListGroup = { ...list, items: updatedItems };
    onUpdateList(updated);
  };

  // Add items callback
  const handleAddItems = (newEntries: ListItemEntry[]) => {
    const updated: ListGroup = {
      ...list,
      items: [...list.items, ...newEntries],
    };
    onUpdateList(updated);
  };

  // Assign item callback
  const handleAssignItem = (
    itemId: string,
    assigneeName?: string,
    initial?: string,
    bg?: string
  ) => {
    const updatedItems = list.items.map((i) =>
      i.id === itemId
        ? {
          ...i,
          assignedTo: assigneeName,
          assignedInitial: initial,
          assignedAvatarBg: bg,
        }
        : i
    );
    const updated: ListGroup = { ...list, items: updatedItems };
    onUpdateList(updated);
  };

  // Share list update callback
  const handleUpdateShare = (
    listId: string,
    sharedWith: string[],
    isSharedAll: boolean
  ) => {
    const updated: ListGroup = {
      ...list,
      sharedWith,
      isSharedWithAll: isSharedAll,
    };
    onUpdateList(updated);
  };

  // Rename list callback
  const handleRenameList = (listId: string, newTitle: string) => {
    const updated: ListGroup = { ...list, title: newTitle };
    onUpdateList(updated);
  };

  // Duplicate list callback
  const handleDuplicateList = (sourceList: ListGroup) => {
    const duplicated: ListGroup = {
      ...sourceList,
      id: `lst-${Date.now()}`,
      title: `${sourceList.title} (Copy)`,
      items: sourceList.items.map((it) => ({
        ...it,
        id: `li-dup-${Date.now()}-${Math.random()}`,
        isCompleted: false,
      })),
    };
    onUpdateList(duplicated);
  };

  // Clear completed items
  const handleClearDoneItems = (_listId: string) => {
    const updated: ListGroup = {
      ...list,
      items: list.items.filter((i) => !i.isCompleted),
    };
    onUpdateList(updated);
  };

  // Archive list
  const handleArchiveList = (_listId: string) => {
    const updated: ListGroup = { ...list, isArchived: true };
    onUpdateList(updated);
    onClose();
  };

  // Delete list
  const handleDeleteListConfirmed = (_listId: string) => {
    onDeleteList(list.id);
    onClose();
  };

  const getSectionTitle = () => {
    switch (list.type) {
      case 'grocery':
        return `TO BUY · ${pendingItems.length}`;
      case 'packing':
        return `TO PACK · ${pendingItems.length}`;
      default:
        return `PENDING · ${pendingItems.length}`;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="light-content" />

        {/* Top Header Row */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close list"
          >
            <Feather name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setShowOptionsModal(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="List options"
          >
            <Feather name="more-horizontal" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isAllDone && { paddingBottom: 100 + insets.bottom },
          ]}
        >
          {/* Category Pill */}
          <View style={[styles.categoryPill, { borderColor: config.color }]}>
            {renderTypeIcon(list.type, config.color)}
            <Text style={[styles.categoryPillText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>

          {/* List Title */}
          <Text style={styles.listTitle}>{list.title}</Text>

          {/* Shared with row */}
          <TouchableOpacity
            style={styles.sharedRow}
            onPress={() => setShowShareModal(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Manage members"
          >
            <View style={styles.sharedAvatarCluster}>
              {list.sharedWith.slice(0, 5).map((name, idx) => {
                const initial = name.slice(0, name === 'Aarav' ? 2 : 1);
                const bgColors = [
                  '#78350F',
                  '#064E3B',
                  '#1E3A8A',
                  '#831843',
                  '#854D0E',
                ];
                const bg = bgColors[idx % bgColors.length];
                return (
                  <View
                    key={idx}
                    style={[
                      styles.clusterAvatar,
                      idx > 0 && styles.clusterAvatarOverlap,
                      { backgroundColor: bg },
                    ]}
                  >
                    <Text style={styles.clusterInitial}>{initial}</Text>
                  </View>
                );
              })}
            </View>

            <Text style={styles.sharedText}>
              {list.isSharedWithAll
                ? 'Shared with everyone'
                : `Shared with ${list.sharedWith.length} members`}
            </Text>
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  isAllDone
                    ? styles.progressFillGreen
                    : styles.progressFillOrange,
                  {
                    width: `${Math.min(Math.max(progressPercent, 4), 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {doneCount} of {totalCount}
            </Text>
          </View>

          {/* If all done, show celebratory banner (LST-09) */}
          {isAllDone && (
            <View style={styles.celebrationCard}>
              <View style={styles.celebrationCircle}>
                <Feather name="check" size={26} color="#6FDAA6" />
              </View>
              <Text style={styles.celebrationTitle}>Everything’s bought</Text>
              <Text style={styles.celebrationSubtitle}>
                All {totalCount} items are ticked off. Keep the list for{' '}
                {list.title.toLowerCase().includes('diwali')
                  ? 'next Diwali'
                  : 'next time'}
                , or clear it.
              </Text>
            </View>
          )}

          {/* "+ Add an item" pill button */}
          {!isAllDone && (
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={() => setShowAddItems(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Add an item"
            >
              <Feather
                name="plus"
                size={20}
                color="#F0913A"
                style={styles.addItemIcon}
              />
              <Text style={styles.addItemText}>Add an item</Text>
            </TouchableOpacity>
          )}

          {/* Pending Items List */}
          {pendingItems.length > 0 && (
            <View style={styles.itemsSection}>
              <Text style={styles.sectionHeader}>{getSectionTitle()}</Text>

              <View style={styles.itemsCard}>
                {pendingItems.map((item, idx) => {
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.itemRow,
                        idx > 0 && styles.itemRowDivider,
                      ]}
                    >
                      {/* Checkbox circle */}
                      <TouchableOpacity
                        style={styles.checkboxTouch}
                        onPress={() => handleToggleItem(item.id)}
                        activeOpacity={0.7}
                        accessibilityRole="checkbox"
                        accessibilityLabel={`Mark ${item.title} completed`}
                      >
                        <View style={styles.checkboxCircle} />
                      </TouchableOpacity>

                      {/* Title & Quantity */}
                      <TouchableOpacity
                        style={styles.itemTextCol}
                        onPress={() => setSelectedItemForAssign(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        {Boolean(item.quantity) && (
                          <Text style={styles.itemSubtitle}>
                            {item.quantity}
                          </Text>
                        )}
                      </TouchableOpacity>

                      {/* Assignee Avatar or "+" Icon */}
                      <TouchableOpacity
                        style={styles.assigneeBtn}
                        onPress={() => setSelectedItemForAssign(item)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`Assign ${item.title}`}
                      >
                        {item.assignedTo ? (
                          <View
                            style={[
                              styles.assignedBadge,
                              {
                                backgroundColor:
                                  item.assignedAvatarBg || '#78350F',
                              },
                            ]}
                          >
                            <Text style={styles.assignedInitial}>
                              {item.assignedInitial ||
                                item.assignedTo.slice(0, 1)}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.unassignedBadge}>
                            <Feather name="plus" size={14} color="#8A97AB" />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Completed Items Section */}
          {doneCount > 0 && (
            <View style={styles.doneSection}>
              {!isAllDone && (
                <View style={styles.doneSectionHeaderRow}>
                  <Text style={styles.sectionHeader}>DONE · {doneCount}</Text>
                  <TouchableOpacity
                    onPress={() => setShowDoneItems((prev) => !prev)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showAllText}>
                      {showDoneItems ? 'Hide' : 'Show all'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {(showDoneItems || isAllDone) && (
                <View style={styles.itemsCard}>
                  {(isAllDone && !showDoneItems ? doneItems.slice(0, 4) : doneItems).map((item, idx) => (
                    <View
                      key={item.id}
                      style={[
                        styles.itemRow,
                        idx > 0 && styles.itemRowDivider,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.checkboxTouch}
                        onPress={() => handleToggleItem(item.id)}
                        activeOpacity={0.7}
                        accessibilityRole="checkbox"
                        accessibilityLabel={`Unmark ${item.title}`}
                      >
                        <View style={styles.completedCheckCircle}>
                          <Feather name="check" size={14} color="#0B1A2F" />
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.itemTextCol}
                        onPress={() => setSelectedItemForAssign(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.itemTitle, styles.completedTitle]}>
                          {item.title}
                        </Text>
                        {Boolean(item.quantity) && (
                          <Text style={styles.itemSubtitle}>
                            {item.quantity}
                          </Text>
                        )}
                      </TouchableOpacity>

                      {item.assignedTo && (
                        <View
                          style={[
                            styles.assignedBadge,
                            {
                              backgroundColor:
                                item.assignedAvatarBg || '#1E3A8A',
                            },
                          ]}
                        >
                          <Text style={styles.assignedInitial}>
                            {item.assignedInitial || item.assignedTo.slice(0, 1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {isAllDone && doneCount > 4 && (
                <TouchableOpacity
                  style={styles.moreDoneBtn}
                  onPress={() => setShowDoneItems((prev) => !prev)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={showDoneItems ? 'Show less' : `+ ${doneCount - 4} more done`}
                >
                  <Text style={styles.moreDoneText}>
                    {showDoneItems ? 'Show less' : `+ ${doneCount - 4} more done`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

        </ScrollView>

        {/* Bottom Action buttons on All Done (LST-09) */}
        {isAllDone && (
          <View
            style={[
              styles.allDoneBottomBar,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              style={styles.clearListBtn}
              onPress={() => handleClearDoneItems(list.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Clear list"
            >
              <Text style={styles.clearListText}>Clear list</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.archiveListBtn}
              onPress={() => handleArchiveList(list.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Archive list"
            >
              <Feather
                name="archive"
                size={18}
                color="#FFFFFF"
                style={styles.archiveBtnIcon}
              />
              <Text style={styles.archiveListText}>Archive list</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sub-modals */}
        <AddListItemsModal
          visible={showAddItems}
          onClose={() => setShowAddItems(false)}
          onAddItems={handleAddItems}
        />

        <AssignListItemModal
          visible={Boolean(selectedItemForAssign)}
          item={selectedItemForAssign}
          onClose={() => setSelectedItemForAssign(null)}
          onAssign={handleAssignItem}
        />

        <ShareListModal
          visible={showShareModal}
          list={list}
          onClose={() => setShowShareModal(false)}
          onUpdateShare={handleUpdateShare}
        />

        <ListOptionsModal
          visible={showOptionsModal}
          list={list}
          onClose={() => setShowOptionsModal(false)}
          onRenameList={handleRenameList}
          onDuplicateList={handleDuplicateList}
          onClearDoneItems={handleClearDoneItems}
          onArchiveList={handleArchiveList}
          onDeleteList={handleDeleteListConfirmed}
        />
      </View>
    </Modal>
  );
};

export default ListDetailModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  pillIcon: {
    marginRight: 6,
  },
  categoryPillText: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  listTitle: {
    fontSize: 28,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  sharedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  sharedAvatarCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  clusterAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0B1A2F',
  },
  clusterAvatarOverlap: {
    marginLeft: -6,
  },
  clusterInitial: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  sharedText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  progressTrack: {
    width: 185,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E2D44',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressFillGreen: {
    backgroundColor: '#6FDAA6',
  },
  progressFillOrange: {
    backgroundColor: '#F0913A',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  celebrationCard: {
    backgroundColor: '#0F2329',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#2F6B52',
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  celebrationCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#6FDAA6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  celebrationTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#6FDAA6',
    marginBottom: 8,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 14,
    color: '#CBD2D9',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 18,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    backgroundColor: 'transparent',
    marginBottom: 22,
  },
  addItemIcon: {
    marginRight: 10,
  },
  addItemText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
  },
  itemsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.2,
    color: '#8A97AB',
    marginBottom: 12,
  },
  itemsCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemRowDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  checkboxTouch: {
    paddingRight: 14,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E415E',
  },
  completedCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2DD4BF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#8A97AB',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  assigneeBtn: {
    paddingLeft: 8,
  },
  assignedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignedInitial: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  unassignedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#3A4D6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  doneSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  showAllText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
  },
  moreDoneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  moreDoneText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#8A97AB',
  },
  allDoneBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  clearListBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearListText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  archiveListBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  archiveBtnIcon: {
    marginRight: 8,
  },
  archiveListText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
});
