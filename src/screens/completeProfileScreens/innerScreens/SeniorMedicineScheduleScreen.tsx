import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';

export interface MedicineScheduleItemData {
  id: string;
  name: string;
  dosage: string;
  status: 'taken' | 'due';
  iconType?: 'pill' | 'drops';
}

export interface MedicineTimeSlot {
  timeLabel: string;
  items: MedicineScheduleItemData[];
}

export interface SeniorMedicineScheduleScreenProps {
  onBack?: () => void;
  onReorderPress?: () => void;
  onAddMedicine?: () => void;
  onItemPress?: (item: MedicineScheduleItemData) => void;
}

const DEFAULT_SCHEDULE: MedicineTimeSlot[] = [
  {
    timeLabel: 'MORNING · 8:00 AM',
    items: [
      {
        id: '1',
        name: 'BP tablet',
        dosage: '1 tablet · after breakfast',
        status: 'taken',
        iconType: 'pill',
      },
      {
        id: '2',
        name: 'Calcium',
        dosage: '1 tablet',
        status: 'taken',
        iconType: 'pill',
      },
    ],
  },
  {
    timeLabel: 'AFTERNOON · 2:00 PM',
    items: [
      {
        id: '3',
        name: 'Sugar tablet',
        dosage: '1 tablet · after lunch',
        status: 'taken',
        iconType: 'pill',
      },
    ],
  },
  {
    timeLabel: 'NIGHT · 9:00 PM',
    items: [
      {
        id: '4',
        name: 'BP tablet',
        dosage: '1 tablet · after dinner',
        status: 'due',
        iconType: 'pill',
      },
      {
        id: '5',
        name: 'Eye drops',
        dosage: '2 drops in each eye',
        status: 'due',
        iconType: 'drops',
      },
    ],
  },
];

const SeniorMedicineScheduleScreen: React.FC<
  SeniorMedicineScheduleScreenProps
> = ({ onBack, onReorderPress, onAddMedicine, onItemPress }) => {
  const insets = useSafeAreaInsets();
  const [schedule, setSchedule] = useState<MedicineTimeSlot[]>(DEFAULT_SCHEDULE);
  const [missedDoseAlert, setMissedDoseAlert] = useState<boolean>(true);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header if needed, or simple back navigation */}
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}

        {/* Reorder Pill Banner */}
        <View style={styles.reorderBanner}>
          <Feather
            name="paperclip"
            size={14}
            color="#CBD5E1"
            style={styles.bannerIcon}
          />
          <Text style={styles.bannerText}>BP tablets run out on Sunday</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onReorderPress}
            style={styles.reorderButton}
            accessibilityRole="button"
            accessibilityLabel="Reorder medicine"
          >
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today Summary Header */}
        <View style={styles.summaryHeader}>
          <Text style={styles.todayText}>TODAY</Text>
          <Text style={styles.takenCountText}>3 of 5 taken</Text>
        </View>

        {/* Schedule Groups */}
        {schedule.map((slot, slotIndex) => (
          <View key={slotIndex} style={styles.slotGroup}>
            <Text style={styles.timeLabelText}>{slot.timeLabel}</Text>
            <View style={styles.slotCard}>
              {slot.items.map((item, itemIndex) => {
                const isLast = itemIndex === slot.items.length - 1;
                const isTaken = item.status === 'taken';

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => onItemPress?.(item)}
                    style={[styles.itemRow, !isLast && styles.itemDivider]}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}, ${item.dosage}, ${item.status}`}
                  >
                    {/* Icon Box */}
                    <View
                      style={[
                        styles.itemIconBox,
                        isTaken
                          ? styles.itemIconBoxTeal
                          : styles.itemIconBoxPurple,
                      ]}
                    >
                      {item.iconType === 'drops' ? (
                        <Ionicons
                          name="eyedrop-outline"
                          size={16}
                          color={isTaken ? '#14B8A6' : '#A855F7'}
                        />
                      ) : (
                        <Feather
                          name="paperclip"
                          size={15}
                          color={isTaken ? '#14B8A6' : '#A855F7'}
                        />
                      )}
                    </View>

                    {/* Text Container */}
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemNameText}>{item.name}</Text>
                      <Text style={styles.itemDosageText}>{item.dosage}</Text>
                    </View>

                    {/* Status Badge */}
                    <View
                      style={[
                        styles.statusBadge,
                        isTaken
                          ? styles.statusBadgeTaken
                          : styles.statusBadgeDue,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isTaken
                            ? styles.statusTextTaken
                            : styles.statusTextDue,
                        ]}
                      >
                        {isTaken ? '✓ Taken' : 'Due'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* If a Dose is Missed Switch Card */}
        <View style={styles.missedDoseCard}>
          <View style={styles.missedDoseTextContainer}>
            <Text style={styles.missedDoseTitle}>If a dose is missed</Text>
            <Text style={styles.missedDoseSubtitle}>
              Remind Dadi, then tell Priya after 30 min
            </Text>
          </View>
          <Switch
            value={missedDoseAlert}
            onValueChange={setMissedDoseAlert}
            trackColor={{ false: '#1E293B', true: '#F0913A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="+ Add medicine"
          onPress={onAddMedicine}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={54}
          borderRadius={27}
        />
      </View>
    </View>
  );
};

export default SeniorMedicineScheduleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reorderBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2238',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: RFValue(11.5),
    fontWeight: '400',
  },
  reorderButton: {
    marginLeft: 8,
  },
  reorderButtonText: {
    color: Colors.primary || '#F0913A',
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  todayText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  takenCountText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '500',
  },
  slotGroup: {
    marginHorizontal: 20,
    marginTop: 14,
  },
  timeLabelText: {
    color: Colors.primary || '#F0913A',
    fontSize: RFValue(11.5),
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  slotCard: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIconBoxTeal: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.25)',
  },
  itemIconBoxPurple: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemNameText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  itemDosageText: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusBadgeTaken: {
    borderColor: 'rgba(20, 184, 166, 0.4)',
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  statusBadgeDue: {
    borderColor: 'rgba(240, 145, 58, 0.4)',
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
  },
  statusBadgeText: {
    fontSize: RFValue(11),
    fontWeight: '600',
  },
  statusTextTaken: {
    color: '#14B8A6',
  },
  statusTextDue: {
    color: '#F0913A',
  },
  missedDoseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  missedDoseTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  missedDoseTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  missedDoseSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});

