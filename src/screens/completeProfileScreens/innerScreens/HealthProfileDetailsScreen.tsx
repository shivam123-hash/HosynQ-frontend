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
import { useAppSelector } from '../../../redux';
import {
  HealthProfileFormValues,
  DEFAULT_HEALTH_FORM_VALUES,
} from './HealthProfileInputScreen';

export interface MedicineSlotItem {
  id: string;
  medicineId?: string;
  name: string;
  dosage: string;
  status: 'taken' | 'due';
  icon: 'pill' | 'drops';
}

export interface MedicineTimeGroup {
  timeLabel: string;
  items: MedicineSlotItem[];
}

export interface HealthProfileDetailsScreenProps {
  data?: HealthProfileFormValues;
  userName?: string;
  memberId?: string;
  onBack?: () => void;
  onEditPress?: () => void;
  onAddMedicine?: () => void;
  onMedicinePress?: (medicineId: string) => void;
  onReorderPress?: () => void;
  onDoctorPress?: () => void;
  onClinicPress?: () => void;
  onHospitalPress?: () => void;
  onCheckupsPress?: () => void;
  onEyesightPress?: () => void;
}

const format12Hour = (time24?: string): string => {
  if (!time24) return '8:00 AM';
  const match = time24.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time24;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const HealthProfileDetailsScreen: React.FC<HealthProfileDetailsScreenProps> = ({
  data = DEFAULT_HEALTH_FORM_VALUES,
  userName = 'Priya',
  memberId,
  onBack,
  onEditPress,
  onAddMedicine,
  onMedicinePress,
  onReorderPress,
  onDoctorPress,
  onClinicPress,
  onHospitalPress,
  onCheckupsPress,
  onEyesightPress,
}) => {
  const insets = useSafeAreaInsets();
  const medicines = useAppSelector((state) => state.medicine?.medicines || []);

  const [schedule, setSchedule] = useState<MedicineTimeGroup[]>([]);
  const [missedDoseAlert, setMissedDoseAlert] = useState(true);

  // Sync redux medicines to time slots
  React.useEffect(() => {
    if (!medicines || medicines.length === 0) {
      setSchedule([]);
      return;
    }

    const groupMap = new Map<string, MedicineSlotItem[]>();

    medicines.forEach((med: any) => {
      const doses = med.doses || [];
      if (doses.length === 0) {
        const key = 'MORNING · 8:00 AM';
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key)!.push({
          id: med.id,
          medicineId: med.id,
          name: med.name,
          dosage: `${med.doseAmount || 1} ${med.doseUnit || 'tablet'}${
            med.purpose ? ` · ${med.purpose}` : ''
          }`,
          status: 'due',
          icon: med.type?.toLowerCase() === 'drops' ? 'drops' : 'pill',
        });
      } else {
        doses.forEach((dose: any, idx: number) => {
          const timeStr = format12Hour(dose.timeOfDay);
          const label = (
            dose.label ||
            (dose.timeOfDay >= '18:00'
              ? 'NIGHT'
              : dose.timeOfDay >= '12:00'
              ? 'AFTERNOON'
              : 'MORNING')
          ).toUpperCase();
          const key = `${label} · ${timeStr}`;
          if (!groupMap.has(key)) groupMap.set(key, []);
          groupMap.get(key)!.push({
            id: `${med.id}-${dose.id || idx}`,
            medicineId: med.id,
            name: med.name,
            dosage: `${med.doseAmount || 1} ${med.doseUnit || 'tablet'}${
              dose.foodNote ? ` · ${dose.foodNote}` : ''
            }`,
            status: 'due',
            icon: med.type?.toLowerCase() === 'drops' ? 'drops' : 'pill',
          });
        });
      }
    });

    const groups: MedicineTimeGroup[] = [];
    groupMap.forEach((items, timeLabel) => {
      groups.push({ timeLabel, items });
    });
    setSchedule(groups);
  }, [medicines]);

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
                {data.doctor.doctorName
                  ? `${data.doctor.doctorName}${
                      data.doctor.speciality ? ` · ${data.doctor.speciality}` : ''
                    }`
                  : 'Not specified'}
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
                {data.doctor.clinicName || data.doctor.clinicLocation
                  ? `${data.doctor.clinicName || ''}${
                      data.doctor.clinicLocation
                        ? `, ${data.doctor.clinicLocation.split(',')[0]}`
                        : ''
                    }`
                  : 'Not specified'}
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
                {data.hospital.preferredHospital || 'Not specified'}
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
              {data.allergies.length > 0 ? (
                data.allergies.map((allergy) => {
                  const cleanName = allergy.label.split('·')[0].trim();
                  return (
                    <View key={allergy.id} style={styles.solidPill}>
                      <Text style={styles.solidPillText}>{cleanName}</Text>
                    </View>
                  );
                })
              ) : (
                <Text style={[styles.boldDetailText, { marginRight: 8 }]}>None recorded</Text>
              )}
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
              {data.conditions[0]?.label.split('·')[0].trim() || 'None recorded'}
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
                : 'None recorded'}
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
                {data.checkups.lastCheckup || data.checkups.nextCheckup
                  ? `Last ${data.checkups.lastCheckup || '—'} · Next ${
                      data.checkups.nextCheckup || '—'
                    }`
                  : 'Not scheduled'}
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
                {data.eyesight.wears !== 'Neither' ||
                data.eyesight.rightEyePower ||
                data.eyesight.leftEyePower
                  ? `Right ${data.eyesight.rightEyePower || '—'}, Left ${
                      data.eyesight.leftEyePower || '—'
                    } · ${data.eyesight.wears}`
                  : 'Normal vision'}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#8E9BAE" />
          </TouchableOpacity>
        </View>

        {/* SCHEDULE SECTION: TODAY */}
        <View style={styles.scheduleHeaderRow}>
          <Text style={styles.scheduleSectionTitle}>TODAY</Text>
          {totalItems > 0 ? (
            <Text style={styles.scheduleStatusCount}>
              {`${takenCount} of ${totalItems} taken`}
            </Text>
          ) : null}
        </View>

        {/* TIME SLOTS CARDS OR CLEAN EMPTY STATE */}
        {schedule.length > 0 ? (
          schedule.map((group, index) => (
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
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onMedicinePress?.(item.medicineId || item.id)}
                    style={styles.scheduleItemLeft}
                  >
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
                  </TouchableOpacity>

                  <View style={styles.scheduleItemRight}>
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

                    {/* Arrow after Due badge */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => onMedicinePress?.(item.medicineId || item.id)}
                      style={styles.scheduleArrowBox}
                      hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
                    >
                      <Feather
                        name="chevron-right"
                        size={16}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyMedicineCard}>
            <View style={styles.emptyMedicineIconBox}>
              <Feather name="calendar" size={22} color="#F0913A" />
            </View>
            <Text style={styles.emptyMedicineTitle}>No medicines added yet</Text>
            <Text style={styles.emptyMedicineSubtitle}>
              Tap "+ Add medicine" below to add regular medications and set reminder times.
            </Text>
          </View>
        )}

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
    marginRight: 10,
  },
  scheduleItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleArrowBox: {
    paddingLeft: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyMedicineCard: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyMedicineIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyMedicineTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyMedicineSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    lineHeight: 18,
    textAlign: 'center',
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
