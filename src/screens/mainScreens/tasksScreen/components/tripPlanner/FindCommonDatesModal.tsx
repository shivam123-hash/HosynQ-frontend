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
import {
  AVAILABILITY_DAYS,
  MEMBER_AVAILABILITY,
} from './mockTripData';

export interface FindCommonDatesModalProps {
  visible?: boolean;
  asModal?: boolean;
  onClose: () => void;
  onSelectDates: (selectedOption: string) => void;
}

export const FindCommonDatesModal: React.FC<FindCommonDatesModalProps> = ({
  visible = true,
  asModal = true,
  onClose,
  onSelectDates,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedOptionId, setSelectedOptionId] = useState<'option1' | 'option2'>('option1');

  const getCellColor = (status: 'free' | 'busy' | 'best') => {
    switch (status) {
      case 'best':
        return '#2DD4BF';
      case 'free':
        return '#166534';
      case 'busy':
        return '#1E293B';
    }
  };

  const handleUseDates = () => {
    if (selectedOptionId === 'option1') {
      onSelectDates('Fri 13 – Mon 16 Nov');
    } else {
      onSelectDates('Sat 21 – Sun 22 Nov');
    }
  };

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

        <Text style={styles.headerTitle}>Find common dates</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Subtitle description */}
        <Text style={styles.subtitle}>
          We checked everyone’s calendar. Green days are free.
        </Text>

        {/* Availability Heatmap Card */}
        <View style={styles.heatmapCard}>
          {/* Days header */}
          <View style={styles.daysHeaderRow}>
            <View style={styles.avatarSpacer} />
            <View style={styles.daysNumbersRow}>
              {AVAILABILITY_DAYS.map((day) => {
                const isBest = day >= 13 && day <= 16;
                return (
                  <View key={day} style={styles.dayCol}>
                    <Text
                      style={[
                        styles.dayNumberText,
                        isBest && styles.dayNumberBest,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Member rows */}
          {MEMBER_AVAILABILITY.map((member) => (
            <View key={member.memberId} style={styles.memberRow}>
              <View
                style={[
                  styles.memberAvatar,
                  { backgroundColor: member.color },
                ]}
              >
                <Text style={styles.memberInitial}>{member.initial}</Text>
              </View>

              <View style={styles.daysNumbersRow}>
                {member.days.map((item) => (
                  <View key={item.day} style={styles.dayCol}>
                    <View
                      style={[
                        styles.heatmapCell,
                        { backgroundColor: getCellColor(item.status) },
                      ]}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendFree]} />
              <Text style={styles.legendText}>Free</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBusy]} />
              <Text style={styles.legendText}>Busy</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBest]} />
              <Text style={styles.legendText}>Best window</Text>
            </View>
          </View>
        </View>

        {/* Section: Best options */}
        <Text style={styles.sectionHeader}>BEST OPTIONS</Text>

        {/* Option 1: 13-16 Nov (All free) */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedOptionId === 'option1' && styles.optionCardSelected,
          ]}
          onPress={() => setSelectedOptionId('option1')}
          activeOpacity={0.8}
          accessibilityRole="radio"
          accessibilityState={{ checked: selectedOptionId === 'option1' }}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#34D399" />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Fri 13 – Mon 16 Nov</Text>
            <Text style={styles.optionSubtitle}>Everyone is free · 4 days</Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              selectedOptionId === 'option1' && styles.radioOuterSelected,
            ]}
          >
            {selectedOptionId === 'option1' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {/* Option 2: 21-22 Nov (Aarav exams) */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedOptionId === 'option2' && styles.optionCardSelected,
          ]}
          onPress={() => setSelectedOptionId('option2')}
          activeOpacity={0.8}
          accessibilityRole="radio"
          accessibilityState={{ checked: selectedOptionId === 'option2' }}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#F0913A" />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Sat 21 – Sun 22 Nov</Text>
            <Text style={styles.optionSubtitleAlert}>Aarav has exams</Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              selectedOptionId === 'option2' && styles.radioOuterSelected,
            ]}
          >
            {selectedOptionId === 'option2' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleUseDates}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Use selected dates"
        >
          <Text style={styles.bottomButtonText}>
            {selectedOptionId === 'option1' ? 'Use 13–16 Nov' : 'Use 21–22 Nov'}
          </Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8A97AB',
    lineHeight: 22,
    marginBottom: 20,
  },
  heatmapCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
  },
  daysHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarSpacer: {
    width: 28,
    marginRight: 8,
  },
  daysNumbersRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A97AB',
  },
  dayNumberBest: {
    color: '#2DD4BF',
    fontWeight: '800',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  memberInitial: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heatmapCell: {
    width: '85%',
    height: 20,
    borderRadius: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 6,
  },
  legendFree: {
    backgroundColor: '#166534',
  },
  legendBusy: {
    backgroundColor: '#1E293B',
  },
  legendBest: {
    backgroundColor: '#2DD4BF',
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A97AB',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
  },
  optionCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: '#F0913A',
    borderWidth: 1.5,
  },
  optionIconContainer: {
    marginRight: 14,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8A97AB',
    marginTop: 3,
  },
  optionSubtitleAlert: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F0913A',
    marginTop: 3,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#2C3E55',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioOuterSelected: {
    borderColor: '#F0913A',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F0913A',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  bottomButton: {
    backgroundColor: '#F0913A',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
export default FindCommonDatesModal;
