import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { MilestoneItem } from './types';

export interface MilestonesModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenAddMilestone?: () => void;
  milestones?: MilestoneItem[];
}

const DEFAULT_MILESTONES: MilestoneItem[] = [
  {
    id: 'mile-1',
    title: 'Reached the badminton semi-final',
    personName: 'Anaya',
    personInitial: 'A',
    personColor: Colors.avatarWine,
    dateText: 'Wed, 28 Oct',
    monthYear: 'OCTOBER 2026',
    authorText: 'Added by Rohan',
    reactionsCount: 6,
    iconType: 'trophy',
    hasPhoto: true,
    categoryTag: 'ANAYA',
  },
  {
    id: 'mile-2',
    title: 'Aarav read his first chapter book',
    personName: 'Aarav',
    personInitial: 'Aa',
    personColor: Colors.avatarOlive,
    dateText: 'Mon, 12 Oct',
    monthYear: 'OCTOBER 2026',
    authorText: 'Added by you',
    reactionsCount: 3,
    iconType: 'book',
  },
  {
    id: 'mile-3',
    title: 'Dadi turned 75',
    personName: 'Dadi',
    personInitial: 'D',
    personColor: Colors.avatarGreen,
    dateText: 'Tue, 22 Sep',
    monthYear: 'SEPTEMBER 2026',
    authorText: 'Family',
    reactionsCount: 12,
    iconType: 'cake',
  },
];

type FilterCategory = 'All' | 'Anaya' | 'Aarav' | 'Family';

export const MilestonesModal: React.FC<MilestonesModalProps> = ({
  visible,
  onClose,
  onOpenAddMilestone,
  milestones = DEFAULT_MILESTONES,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('All');

  const filteredMilestones = milestones.filter((item) => {
    if (selectedFilter === 'All') return true;
    return item.personName.toLowerCase() === selectedFilter.toLowerCase();
  });

  // Group by monthYear
  const groupedMilestones = filteredMilestones.reduce<{
    [month: string]: MilestoneItem[];
  }>((acc, item) => {
    if (!acc[item.monthYear]) {
      acc[item.monthYear] = [];
    }
    acc[item.monthYear].push(item);
    return acc;
  }, {});

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
            style={styles.circleButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Milestones</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['All', 'Anaya', 'Aarav', 'Family'] as FilterCategory[]).map(
            (filter) => {
              const isActive = selectedFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    isActive ? styles.filterChipActive : styles.filterChipInactive,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive
                        ? styles.filterChipTextActive
                        : styles.filterChipTextInactive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedMilestones).map(([month, items]) => (
            <View key={month} style={styles.monthSection}>
              <Text style={styles.monthHeader}>{month}</Text>

              <View style={styles.itemsList}>
                {items.map((item) => {
                  if (item.hasPhoto) {
                    // Featured Card with photo graphic
                    return (
                      <View key={item.id} style={styles.featuredCard}>
                        {/* Court Graphic Area */}
                        <View style={styles.featuredPhotoContainer}>
                          <View style={styles.courtNetVertical} />
                          <View style={styles.courtNetHorizontal} />
                          <View style={styles.shuttlecockBall} />
                        </View>

                        {/* Details */}
                        <View style={styles.featuredBody}>
                          <View style={styles.categoryRow}>
                            <Feather
                              name="award"
                              size={14}
                              color={Colors.primary}
                              style={styles.awardIcon}
                            />
                            <Text style={styles.categoryTagText}>
                              {item.categoryTag || item.personName.toUpperCase()}
                            </Text>
                          </View>

                          <Text style={styles.featuredTitle}>{item.title}</Text>
                          <Text style={styles.featuredSubtext}>
                            {item.dateText} · {item.authorText} ·{' '}
                            {item.reactionsCount} reactions
                          </Text>
                        </View>
                      </View>
                    );
                  }

                  // Standard Row Item
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.standardRow}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.iconBox,
                          item.iconType === 'cake'
                            ? styles.iconBoxOrange
                            : styles.iconBoxNavy,
                        ]}
                      >
                        {item.iconType === 'cake' ? (
                          <Feather name="gift" size={18} color={Colors.primary} />
                        ) : (
                          <Feather
                            name="book-open"
                            size={18}
                            color={Colors.accentBlue}
                          />
                        )}
                      </View>

                      <View style={styles.standardRowTextGroup}>
                        <Text style={styles.standardTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.standardSubtitle}>
                          {item.dateText} · {item.authorText}
                        </Text>
                      </View>

                      <Feather
                        name="chevron-right"
                        size={18}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom CTA Button */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={styles.addMilestoneBtn}
            onPress={onOpenAddMilestone}
            activeOpacity={0.85}
          >
            <Feather
              name="plus"
              size={18}
              color={Colors.white}
              style={styles.addBtnIcon}
            />
            <Text style={styles.addMilestoneBtnText}>Add milestone</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerRightSpacer: {
    width: 44,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipInactive: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.black,
  },
  filterChipTextInactive: {
    color: Colors.textSecondary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  monthSection: {
    marginBottom: 20,
  },
  monthHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  itemsList: {
    gap: 12,
  },
  featuredCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  featuredPhotoContainer: {
    height: 140,
    backgroundColor: '#1E3F33',
    position: 'relative',
    margin: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  courtNetVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  courtNetHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  shuttlecockBall: {
    position: 'absolute',
    top: '30%',
    left: '68%',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white,
  },
  featuredBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  awardIcon: {
    marginRight: 6,
  },
  categoryTagText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  featuredSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  standardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconBoxNavy: {
    backgroundColor: Colors.surfaceNavy,
  },
  iconBoxOrange: {
    backgroundColor: 'rgba(240, 145, 58, 0.15)',
  },
  standardRowTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  standardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 3,
  },
  standardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  addMilestoneBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnIcon: {
    marginRight: 8,
  },
  addMilestoneBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MilestonesModal;
