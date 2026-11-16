import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { PersonalInfoHeader } from '../components';
import {
  HealthProfileFormValues,
  DEFAULT_HEALTH_FORM_VALUES,
} from './HealthProfileInputScreen';

export interface MedicineSlotItem {
  id: string;
  name: string;
  dosage: string;
  status: 'taken' | 'due';
  icon: 'pill' | 'drops';
}

export interface MedicineTimeGroup {
  timeLabel: string;
  items: MedicineSlotItem[];
}

export const DEFAULT_MEDICINE_SCHEDULE: MedicineTimeGroup[] = [
  {
    timeLabel: 'MORNING · 8:00 AM',
    items: [
      {
        id: '1',
        name: 'BP tablet',
        dosage: '1 tablet · after breakfast',
        status: 'taken',
        icon: 'pill',
      },
      {
        id: '2',
        name: 'Calcium',
        dosage: '1 tablet',
        status: 'taken',
        icon: 'pill',
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
        icon: 'pill',
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
        icon: 'pill',
      },
      {
        id: '5',
        name: 'Eye drops',
        dosage: '2 drops in each eye',
        status: 'due',
        icon: 'drops',
      },
    ],
  },
];

export interface HealthProfileDetailsScreenProps {
  data?: HealthProfileFormValues;
  userName?: string;
  onBack?: () => void;
  onEditPress?: () => void;
  onAddMedicine?: () => void;
  onReorderPress?: () => void;
  onDoctorPress?: () => void;
  onClinicPress?: () => void;
  onHospitalPress?: () => void;
  onCheckupsPress?: () => void;
  onEyesightPress?: () => void;
}

const HealthProfileDetailsScreen: React.FC<HealthProfileDetailsScreenProps> = ({
  data = DEFAULT_HEALTH_FORM_VALUES,
  userName = 'Priya',
  onBack,
  onEditPress,
  onAddMedicine,
  onReorderPress,
  onDoctorPress,
  onClinicPress,
  onHospitalPress,
  onCheckupsPress,
  onEyesightPress,
}) => {
  const insets = useSafeAreaInsets();

  const [schedule, setSchedule] = useState<MedicineTimeGroup[]>(
    DEFAULT_MEDICINE_SCHEDULE,
  );
  const [missedDoseAlert, setMissedDoseAlert] = useState(true);

  // Toggle medicine taken/due status
  const handleToggleMedicineStatus = (itemId: string) => {
    setSchedule((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              status: item.status === 'taken' ? 'due' : 'taken',
            };
          }
          return item;
        }),
      })),
    );
  };

  // Count taken medicines
  const totalItems = schedule.reduce(
    (count, group) => count + group.items.length,
    0,
  );
  const takenCount = schedule.reduce(
    (count, group) =>
      count + group.items.filter((i) => i.status === 'taken').length,
    0,
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <PersonalInfoHeader
        title="Health profile"
        subtitle={`${userName} · Section 3 of 5`}
        onBack={onBack}
        icon="back"
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Banner */}
        <View style={styles.privacyBanner}>
          <Feather
            name="lock"
            size={14}
            color="#8E9BAE"
            style={styles.privacyIcon}
          />
          <Text style={styles.privacyText}>
            Only you and Rohan can see this.
          </Text>
        </View>

        {/* CARD 1: Doctor, Clinic Location & Hospital */}
        <View style={styles.card}>
          {/* Doctor */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.cardRow}
            onPress={onDoctorPress || onEditPress}
          >
            <View style={styles.rowIconBox}>
              <Feather name="user" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Doctor</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {`${data.doctor.doctorName} · ${data.doctor.speciality}`}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#8E9BAE" />
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          {/* Clinic location */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.cardRow}
            onPress={onClinicPress || onEditPress}
          >
            <View style={styles.rowIconBox}>
              <Feather name="map-pin" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Clinic location</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {`${data.doctor.clinicName}, ${data.doctor.clinicLocation.split(',')[0]}`}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#8E9BAE" />
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          {/* Hospital */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.cardRow}
            onPress={onHospitalPress || onEditPress}
          >
            <View style={styles.rowIconBox}>
              <Feather name="home" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Hospital</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {data.hospital.preferredHospital}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#8E9BAE" />
          </TouchableOpacity>
        </View>

        {/* CARD 2: Allergies, Conditions & Medications */}
        <View style={styles.card}>
          {/* Allergies */}
          <View style={styles.allergySection}>
            <Text style={styles.sectionSmallLabel}>Allergies</Text>
            <View style={styles.allergyPillsRow}>
              {data.allergies.map((allergy) => {
                const cleanName = allergy.label.split('·')[0].trim();
                return (
                  <View key={allergy.id} style={styles.solidPill}>
                    <Text style={styles.solidPillText}>{cleanName}</Text>
                  </View>
                );
              })}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.addPillBtn}
                onPress={onEditPress}
              >
                <Text style={styles.addPillText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Conditions */}
          <View style={styles.conditionSection}>
            <Text style={styles.sectionSmallLabel}>Conditions</Text>
            <Text style={styles.boldDetailText}>
              {data.conditions[0]?.label.split('·')[0].trim() || 'Migraine'}
            </Text>
          </View>

          {/* Medications */}
          <View style={styles.medicationSection}>
            <Text style={styles.sectionSmallLabel}>Medications</Text>
            <Text style={styles.boldDetailText}>
              {data.medications[0]?.label
                ? data.medications[0].label
                    .replace('weekly', 'once a week')
                    .replace('daily', 'once a day')
                : 'Vitamin D · once a week'}
            </Text>
          </View>
        </View>

        {/* CARD 3: Checkups & Eyesight */}
        <View style={styles.card}>
          {/* Checkups */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.cardRow}
            onPress={onCheckupsPress || onEditPress}
          >
            <View style={styles.rowIconBox}>
              <Feather name="calendar" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Checkups</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {`Last ${data.checkups.lastCheckup} · Next ${data.checkups.nextCheckup}`}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#8E9BAE" />
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          {/* Eyesight */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.cardRow}
            onPress={onEyesightPress || onEditPress}
          >
            <View style={styles.rowIconBox}>
              <Feather name="eye" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Eyesight</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {`Right ${data.eyesight.rightEyePower}, Left ${data.eyesight.leftEyePower} · ${data.eyesight.wears}`}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#8E9BAE" />
          </TouchableOpacity>
        </View>

        {/* MEDICINE REFILL BANNER (from Image 3) */}
        <View style={styles.refillBanner}>
          <View style={styles.refillLeftRow}>
            <Feather
              name="paperclip"
              size={16}
              color="#F0913A"
              style={styles.refillIcon}
            />
            <Text style={styles.refillText}>
              BP tablets run out on Sunday
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (onReorderPress) {
                onReorderPress();
              } else {
                Alert.alert('Reorder', 'BP tablets reorder requested.');
              }
            }}
          >
            <Text style={styles.reorderText}>Reorder</Text>
          </TouchableOpacity>
        </View>

        {/* SCHEDULE SECTION: TODAY */}
        <View style={styles.scheduleHeaderRow}>
          <Text style={styles.scheduleSectionTitle}>TODAY</Text>
          <Text style={styles.scheduleStatusCount}>
            {`${takenCount} of ${totalItems} taken`}
          </Text>
        </View>

        {/* TIME SLOTS CARDS */}
        {schedule.map((group, index) => (
          <View key={index} style={styles.scheduleCard}>
            <Text style={styles.timeSlotLabel}>{group.timeLabel}</Text>
            {group.items.map((item, itemIdx) => (
              <View
                key={item.id}
                style={[
                  styles.scheduleItemRow,
                  itemIdx > 0 && styles.scheduleItemDivider,
                ]}
              >
                <View style={styles.scheduleItemLeft}>
                  <View style={styles.medicineIconBox}>
                    <Feather
                      name={item.icon === 'drops' ? 'droplet' : 'paperclip'}
                      size={16}
                      color="#2ED573"
                    />
                  </View>
                  <View style={styles.medicineItemContent}>
                    <Text style={styles.medicineNameText}>{item.name}</Text>
                    <Text style={styles.medicineDosageText}>
                      {item.dosage}
                    </Text>
                  </View>
                </View>

                {/* Status Badge Toggle */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleToggleMedicineStatus(item.id)}
                  style={[
                    styles.statusBadge,
                    item.status === 'taken'
                      ? styles.statusBadgeTaken
                      : styles.statusBadgeDue,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      item.status === 'taken'
                        ? styles.statusBadgeTextTaken
                        : styles.statusBadgeTextDue,
                    ]}
                  >
                    {item.status === 'taken' ? '✓ Taken' : 'Due'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        {/* MISSED DOSE ALERT CARD */}
        <View style={styles.missedDoseCard}>
          <View style={styles.missedDoseContent}>
            <Text style={styles.missedDoseTitle}>If a dose is missed</Text>
            <Text style={styles.missedDoseSubtitle}>
              Remind Dadi, then tell Priya after 30 min
            </Text>
          </View>
          <Switch
            value={missedDoseAlert}
            onValueChange={setMissedDoseAlert}
            trackColor={{ false: '#223554', true: '#F0913A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>

      {/* STICKY BOTTOM BAR: + Add medicine */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="+ Add medicine"
          onPress={() => {
            if (onAddMedicine) {
              onAddMedicine();
            } else {
              Alert.alert('Add medicine', 'Opening Add medicine flow...');
            }
          }}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={52}
          borderRadius={26}
        />
      </View>
    </View>
  );
};

export default HealthProfileDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#0A111F',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D2038',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  privacyIcon: {
    marginRight: 10,
  },
  privacyText: {
    color: '#8E9BAE',
    fontSize: RFValue(12.5),
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '500',
    marginBottom: 2,
  },
  rowValue: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 62,
  },
  allergySection: {
    padding: 16,
  },
  sectionSmallLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    fontWeight: '500',
    marginBottom: 10,
  },
  allergyPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  solidPill: {
    backgroundColor: '#F0913A',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  solidPillText: {
    color: '#FFFFFF',
    fontSize: RFValue(12.5),
    fontWeight: '600',
  },
  addPillBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  addPillText: {
    color: '#FFFFFF',
    fontSize: RFValue(12.5),
    fontWeight: '500',
  },
  conditionSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  medicationSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  boldDetailText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  refillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1D2B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    marginTop: 4,
  },
  refillLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  refillIcon: {
    marginRight: 10,
  },
  refillText: {
    color: '#F0913A',
    fontSize: RFValue(12.5),
    fontWeight: '600',
  },
  reorderText: {
    color: '#FFA756',
    fontSize: RFValue(12.5),
    fontWeight: '700',
    marginLeft: 10,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleSectionTitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  scheduleStatusCount: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    fontWeight: '500',
  },
  scheduleCard: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 14,
  },
  timeSlotLabel: {
    color: '#F0913A',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  scheduleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  scheduleItemDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 8,
    paddingTop: 12,
  },
  scheduleItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicineIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(46, 213, 115, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(46, 213, 115, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicineItemContent: {
    flex: 1,
  },
  medicineNameText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
    marginBottom: 2,
  },
  medicineDosageText: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusBadgeTaken: {
    backgroundColor: 'rgba(46, 213, 115, 0.12)',
    borderColor: '#2ED573',
  },
  statusBadgeDue: {
    backgroundColor: 'rgba(142, 155, 174, 0.12)',
    borderColor: '#8E9BAE',
  },
  statusBadgeText: {
    fontSize: RFValue(11.5),
    fontWeight: '700',
  },
  statusBadgeTextTaken: {
    color: '#2ED573',
  },
  statusBadgeTextDue: {
    color: '#8E9BAE',
  },
  missedDoseCard: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  missedDoseContent: {
    flex: 1,
    marginRight: 12,
  },
  missedDoseTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  missedDoseSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    marginTop: 4,
    lineHeight: 16,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});
