import React, { useState, useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '../../../../redux';
import {
  fetchListDetail,
  toggleItemDone,
  addListItems,
  updateListItem,
  updateList,
  duplicateList,
  clearDone,
  deleteList,
} from '../../../../redux/features/lists/listsSlice';
import { ListGroup, ListItemEntry, ListType } from '../types';
import { LIST_TYPE_CONFIG } from '../constants';
import { isUUID } from '../taskApiHelpers';
import { mapApiListDetailToUiList } from '../listApiHelpers';

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

import { Colors, Fonts, Typography } from '../../../../units';

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
  const dispatch = useAppDispatch();
  const apiSelectedList = useAppSelector((state) => state.lists.selectedList);

  const [showAddItems, setShowAddItems] = useState(false);
  const [selectedItemForAssign, setSelectedItemForAssign] =
    useState<ListItemEntry | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDoneItems, setShowDoneItems] = useState(false);

  useEffect(() => {
    if (visible && list && isUUID(list.id)) {
      dispatch(fetchListDetail({ listId: list.id }));
    }
  }, [visible, list?.id, dispatch]);

  useEffect(() => {
    if (visible && list && apiSelectedList && apiSelectedList.id === list.id) {
      const mapped = mapApiListDetailToUiList(apiSelectedList);
      onUpdateList(mapped);
    }
  }, [apiSelectedList]);

  if (!list) return null;

  const config = LIST_TYPE_CONFIG[list.type] || LIST_TYPE_CONFIG.custom;
  const totalCount = list.items.length;
  const doneItems = list.items.filter((i) => i.isCompleted);
  const pendingItems = list.items.filter((i) => !i.isCompleted);
  const doneCount = doneItems.length;
  const isAllDone = totalCount > 0 && doneCount === totalCount;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  // Toggle single item complete
  const handleToggleItem = async (itemId: string) => {
    const item = list.items.find((i) => i.id === itemId);
    const newDone = !item?.isCompleted;
    const updatedItems = list.items.map((i) =>
      i.id === itemId ? { ...i, isCompleted: newDone } : i
    );
    const updated: ListGroup = { ...list, items: updatedItems };
    onUpdateList(updated);

    if (isUUID(list.id) && isUUID(itemId)) {
      try {
        await dispatch(toggleItemDone({ listId: list.id, itemId, done: newDone })).unwrap();
      } catch (e) {
        console.log('[ListDetailModal] Failed to toggle item via API:', e);
      }
    }
  };

  // Add items callback
  const handleAddItems = async (newEntries: ListItemEntry[]) => {
    if (!newEntries || newEntries.length === 0) return;
    const updated: ListGroup = {
      ...list,
      items: [...list.items, ...newEntries],
    };
    onUpdateList(updated);

    if (isUUID(list.id)) {
      try {
        await dispatch(
          addListItems({
            listId: list.id,
            payload: {
              items: newEntries.map((e) => ({
                name: e.title,
                note: e.quantity || null,
              })),
            },
          })
        ).unwrap();
      } catch (e) {
        console.log('[ListDetailModal] Failed to add items via API:', e);
      }
    }
  };

  // Assign item callback
  const handleAssignItem = async (
    itemId: string,
    assigneeName?: string,
    initial?: string,
    bg?: string,
    memberId?: string
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

    if (isUUID(list.id) && isUUID(itemId)) {
      try {
        await dispatch(
          updateListItem({
            listId: list.id,
            itemId,
            payload: { assignedMemberId: memberId || null },
          })
        ).unwrap();
      } catch (e) {
        console.log('[ListDetailModal] Failed to assign item via API:', e);
      }
    }
  };

  // Share list update callback
  const handleUpdateShare = async (
    listId: string,
    sharedWith: string[],
    isSharedAll: boolean,
    memberIds?: string[]
  ) => {
    const updated: ListGroup = {
      ...list,
      sharedWith,
      isSharedWithAll: isSharedAll,
    };
    onUpdateList(updated);

    if (isUUID(listId)) {
      try {
        await dispatch(
          updateList({
            listId,
            payload: {
              sharedWithAll: isSharedAll,
              memberIds: isSharedAll ? undefined : memberIds,
            },
          })
        ).unwrap();
      } catch (e) {
        console.log('[ListDetailModal] Failed to update share via API:', e);
      }
    }
  };

  // Rename list callback
  const handleRenameList = async (listId: string, newTitle: string) => {
    const updated: ListGroup = { ...list, title: newTitle };
    onUpdateList(updated);

    if (isUUID(listId)) {
      try {
        await dispatch(updateList({ listId, payload: { name: newTitle } })).unwrap();
      } catch (e) {
        console.log('[ListDetailModal] Failed to rename list via API:', e);
      }
    }
  };

  // Duplicate list callback
  const handleDuplicateList = async (sourceList: ListGroup) => {
    if (isUUID(sourceList.id)) {
      try {
        const res = await dispatch(
          duplicateList({
            listId: sourceList.id,
            name: `${sourceList.title} (Copy)`,
          })
        ).unwrap();
        onUpdateList(mapApiListDetailToUiList(res));
        return;
      } catch (e) {
        console.log('[ListDetailModal] Failed to duplicate list via API:', e);
      }
    }
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
  const handleClearDoneItems = async (listId: string) => {
    const updated: ListGroup = {
      ...list,
      items: list.items.filter((i) => !i.isCompleted),
    };
    onUpdateList(updated);

    if (isUUID(listId)) {
      try {
        await dispatch(clearDone(listId)).unwrap();
      } catch (e) {
        console.log('[ListDetailModal] Failed to clear done items via API:', e);
      }
    }
  };

  // Archive list
  const handleArchiveList = async (listId: string) => {
    const updated: ListGroup = { ...list, isArchived: true };
    onUpdateList(updated);
    onClose();

    if (isUUID(listId)) {
      try {
        await dispatch(updateList({ listId, payload: { archived: true } })).unwrap();
      } catch (e) {
        console.log('[ListDetailModal] Failed to archive list via API:', e);
      }
    }
  };

  // Delete list
  const handleDeleteListConfirmed = async (listId: string) => {
    onDeleteList(list.id);
    onClose();

    if (isUUID(listId)) {
      try {
        await dispatch(deleteList(listId)).unwrap();
      } catch (e) {
        console.log('[ListDetailModal] Failed to delete list via API:', e);
      }
    }
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
            <Feather name="chevron-left" size={24} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setShowOptionsModal(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="List options"
          >
            <Feather name="more-horizontal" size={22} color={Colors.white} />
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
                  Colors.tripYellowBg,
                  Colors.tripGreenBg,
                  Colors.tripBlueBg,
                  Colors.tripPinkBg,
                  Colors.amberDeep,
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
                <Feather name="check" size={26} color={Colors.tripCompletedGreen} />
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
                color={Colors.primary}
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
                                  item.assignedAvatarBg || Colors.tripYellowBg,
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
                            <Feather name="plus" size={14} color={Colors.textSecondaryMuted} />
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
                          <Feather name="check" size={14} color={Colors.background} />
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
                                item.assignedAvatarBg || Colors.tripBlueBg,
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
                color={Colors.white}
                style={styles.archiveBtnIcon}
              />
              <Text style={styles.archiveListText}>Archive list</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sub-modals */}
        <AddListItemsModal
          visible={showAddItems}
          listId={list.id}
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
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
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.bold,
  },
  listTitle: {
    fontSize: Typography.size.display,
    fontFamily: Fonts.bold,
    color: Colors.white,
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
    borderColor: Colors.background,
  },
  clusterAvatarOverlap: {
    marginLeft: -6,
  },
  clusterInitial: {
    fontSize: Typography.size.micro,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  sharedText: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
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
    backgroundColor: Colors.surfaceNavyAlt2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressFillGreen: {
    backgroundColor: Colors.tripCompletedGreen,
  },
  progressFillOrange: {
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  celebrationCard: {
    backgroundColor: Colors.tripTealBg,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.tripMintBorder,
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
    borderColor: Colors.tripCompletedGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  celebrationTitle: {
    fontSize: Typography.size.titleSmall,
    fontFamily: Fonts.bold,
    color: Colors.tripCompletedGreen,
    marginBottom: 8,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: Typography.size.body,
    color: Colors.textLightGray,
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
    borderColor: Colors.borderBold,
    backgroundColor: Colors.transparent,
    marginBottom: 22,
  },
  addItemIcon: {
    marginRight: 10,
  },
  addItemText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
  },
  itemsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.bold,
    letterSpacing: 1.2,
    color: Colors.textSecondaryMuted,
    marginBottom: 12,
  },
  itemsCard: {
    backgroundColor: Colors.transparent,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
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
    borderColor: Colors.surfaceNavyAlt,
  },
  checkboxTouch: {
    paddingRight: 14,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.borderNavyLight,
  },
  completedCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accentTealMint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
    marginBottom: 3,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondaryMuted,
  },
  itemSubtitle: {
    fontSize: Typography.size.bodySmall,
    color: Colors.textSecondaryMuted,
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
    fontSize: Typography.size.caption,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  unassignedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.borderSlate,
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
    fontSize: Typography.size.body,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  moreDoneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  moreDoneText: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondaryMuted,
  },
  allDoneBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderBold,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  clearListBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearListText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  archiveListBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  archiveBtnIcon: {
    marginRight: 8,
  },
  archiveListText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});
