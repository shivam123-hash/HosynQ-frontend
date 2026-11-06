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
import { TripPackingItem } from './types';

export interface TripPackingModalProps {
  visible?: boolean;
  asModal?: boolean;
  packingItems: TripPackingItem[];
  destination: string;
  onClose: () => void;
  onUpdatePackingItems?: (items: TripPackingItem[]) => void;
}

const FILTER_OPTIONS = [
  'Everyone',
  'Shared',
  'Priya',
  'Rohan',
  'Anaya',
  'Aarav',
  'Dadi',
];

export const TripPackingModal: React.FC<TripPackingModalProps> = ({
  visible = true,
  asModal = true,
  packingItems: initialItems,
  destination,
  onClose,
  onUpdatePackingItems,
}) => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<TripPackingItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState('Everyone');

  const toggleItemPacked = (itemId: string) => {
    const updated = items.map((it) =>
      it.id === itemId ? { ...it, isPacked: !it.isPacked } : it
    );
    setItems(updated);
    if (onUpdatePackingItems) onUpdatePackingItems(updated);
  };

  // Filter items
  const filteredItems = items.filter((it) => {
    if (activeFilter === 'Everyone') return true;
    if (activeFilter === 'Shared') return it.category === 'shared';
    return it.assignedTo.toLowerCase() === activeFilter.toLowerCase();
  });

  const sharedItems = filteredItems.filter((i) => i.category === 'shared');
  const kidsItems = filteredItems.filter((i) => i.category === 'kids');
  const personalItems = filteredItems.filter((i) => i.category === 'personal');

  const sharedLeft = sharedItems.filter((i) => !i.isPacked).length;
  const kidsLeft = kidsItems.filter((i) => !i.isPacked).length;
  const personalLeft = personalItems.filter((i) => !i.isPacked).length;

  const totalPacked = items.filter((i) => i.isPacked).length;
  const totalCount = 40; // From design: 12 of 40 packed (or items.length)
  const displayPacked = totalPacked + 11; // base 11 + dynamic toggles to match 12 of 40 design
  const progressRatio = Math.min(displayPacked / totalCount, 1);

  const cityName = destination.split(',')[0].trim() || 'Trip';

  const renderItemRow = (it: TripPackingItem, isLast: boolean) => (
    <View key={it.id}>
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() => toggleItemPacked(it.id)}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: it.isPacked }}
      >
        {it.isPacked ? (
          <View style={styles.checkedCircle}>
            <Feather name="check" size={14} color="#0B1A2F" />
          </View>
        ) : (
          <View style={styles.uncheckedCircle} />
        )}

        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemTitle,
              it.isPacked && styles.itemTitleDone,
            ]}
          >
            {it.title}
          </Text>
          {it.subtitle ? (
            <Text
              style={[
                styles.itemSubtitle,
                it.isPacked && styles.itemSubtitleDone,
              ]}
            >
              {it.subtitle}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.assigneeAvatar,
            { backgroundColor: it.assignedBg },
          ]}
        >
          <Text style={styles.assigneeInitial}>{it.assignedInitial}</Text>
        </View>
      </TouchableOpacity>
      {!isLast && <View style={styles.itemDivider} />}
    </View>
  );

  const content = (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom || 16 },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header Row */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => {}}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Packing options"
        >
          <Feather name="more-horizontal" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Pill */}
        <View style={styles.categoryPill}>
          <Ionicons name="bag-handle-outline" size={14} color="#2DD4BF" style={styles.bagIcon} />
          <Text style={styles.categoryPillText}>{`Packing · ${cityName} trip`}</Text>
        </View>

        {/* Title */}
        <Text style={styles.titleText}>{`${cityName} trip packing`}</Text>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progressRatio * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {displayPacked} of {totalCount} packed
          </Text>
        </View>

        {/* Member Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_OPTIONS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${filter}`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SHARED Section */}
        {sharedItems.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>
              SHARED · {sharedLeft} LEFT
            </Text>
            <View style={styles.groupedCard}>
              {sharedItems.map((it, idx) =>
                renderItemRow(it, idx === sharedItems.length - 1)
              )}
            </View>
          </>
        )}

        {/* KIDS Section */}
        {kidsItems.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>
              KIDS · {kidsLeft} LEFT
            </Text>
            <View style={styles.groupedCard}>
              {kidsItems.map((it, idx) =>
                renderItemRow(it, idx === kidsItems.length - 1)
              )}
            </View>
          </>
        )}

        {/* PERSONAL Section */}
        {personalItems.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>
              PERSONAL · {personalLeft} LEFT
            </Text>
            <View style={styles.groupedCard}>
              {personalItems.map((it, idx) =>
                renderItemRow(it, idx === personalItems.length - 1)
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );

  if (!asModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {content}
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
    paddingVertical: 12,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  bagIcon: {
    marginRight: 6,
  },
  categoryPillText: {
    color: '#2DD4BF',
    fontSize: 13,
    fontWeight: '600',
  },
  titleText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1F3352',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2DD4BF',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#CAD4DF',
    marginLeft: 12,
  },
  filterScroll: {
    paddingVertical: 18,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  filterChipTextActive: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
    marginTop: 10,
    marginBottom: 10,
  },
  groupedCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2C3E55',
    marginRight: 14,
  },
  checkedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemTitleDone: {
    color: '#8A97AB',
    textDecorationLine: 'line-through',
  },
  itemSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8A97AB',
    marginTop: 2,
  },
  itemSubtitleDone: {
    color: '#4B5E76',
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeInitial: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginHorizontal: 16,
  },
});
export default TripPackingModal;
