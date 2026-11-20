import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import { AppConfirmationModal, ThreeDotsLoader } from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  getMedicineThunk,
  deleteMedicineThunk,
  fetchMedicinesThunk,
} from '../../../redux/features/medicine/medicineSlice';
import { fetchLifeProfileFullThunk } from '../../../redux/features/lifeProfile/lifeProfileSlice';
import { getMyMemberId } from '../../../units/asyncStorageManager';

export interface MedicineDetailsScreenProps {
  medicineId: string;
  medicineName?: string;
  memberId?: string;
  userName?: string;
  onBack?: () => void;
  onDeleteSuccess?: () => void;
  onEditMedicine?: (medicine: any) => void;
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

const formatDisplayDate = (dateString?: string | null, fallback = 'Ongoing'): string => {
  if (!dateString) return fallback;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateString;
  }
};

const formatFrequencyLabel = (freq?: string): string => {
  if (!freq) return 'Every day';
  if (freq === 'EVERY_DAY' || freq === 'Every day') return 'Every day';
  if (freq === 'SOME_DAYS' || freq === 'Some days') return 'Some days';
  if (freq === 'WHEN_NEEDED' || freq === 'When needed') return 'When needed';
  return freq;
};

const formatFoodTimingLabel = (timing?: string): string => {
  if (!timing) return 'After food';
  if (timing === 'AFTER_FOOD') return 'After food';
  if (timing === 'BEFORE_FOOD') return 'Before food';
  if (timing === 'WITH_FOOD') return 'With food';
  return timing;
};

const MedicineDetailsScreen: React.FC<MedicineDetailsScreenProps> = ({
  medicineId,
  medicineName: initialMedicineName,
  memberId: propMemberId,
  userName = 'Priya',
  onBack,
  onDeleteSuccess,
  onEditMedicine,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const reduxMedicines = useAppSelector((state) => state.medicine?.medicines || []);
  const cachedMed = reduxMedicines.find((m) => m.id === medicineId);

  const [medicine, setMedicine] = useState<any>(cachedMed || null);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedMed);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadDetail = async () => {
      try {
        console.log(`[MedicineDetails] Fetching GET /api/v1/family/medicines/${medicineId}`);
        const resultAction = await dispatch(getMedicineThunk({ medicineId })).unwrap();
        console.log('[MedicineDetails] Loaded medicine detail:', resultAction);
        if (isMounted && resultAction?.medicine) {
          setMedicine(resultAction.medicine);
        }
      } catch (err) {
        console.log('[MedicineDetails] Error fetching medicine detail:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [dispatch, medicineId]);

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      console.log(`[MedicineDetails] Requesting DELETE /api/v1/family/medicines/${medicineId}`);
      await dispatch(deleteMedicineThunk({ medicineId })).unwrap();

      const resolvedMemberId = propMemberId || (await getMyMemberId());
      if (resolvedMemberId) {
        dispatch(fetchMedicinesThunk({ memberId: resolvedMemberId }));
        dispatch(fetchLifeProfileFullThunk({ memberId: resolvedMemberId }));
      }

      setIsDeleteModalVisible(false);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else if (onBack) {
        onBack();
      }
    } catch (err: any) {
      console.log('[MedicineDetails] Delete error:', err);
      setIsDeleteModalVisible(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const name = medicine?.name || initialMedicineName || 'Medicine';
  const purpose = medicine?.purpose || '';
  const type = medicine?.type || 'TABLET';
  const strength = medicine?.strength || '';
  const doseAmount = medicine?.doseAmount ?? 1;
  const doseUnit = medicine?.doseUnit || 'tablet';
  const foodTiming = formatFoodTimingLabel(medicine?.foodTiming);
  const frequency = formatFrequencyLabel(medicine?.frequency);
  const timesPerDay = medicine?.timesPerDay || medicine?.doses?.length || 1;
  const doses: any[] = medicine?.doses || [];
  const startsOn = formatDisplayDate(medicine?.startsOn, 'Not specified');
  const endsOn = medicine?.endsOn ? formatDisplayDate(medicine?.endsOn, 'Ongoing') : 'Ongoing';
  const unitsLeft = medicine?.unitsLeft;
  const daysLeft = medicine?.daysLeft;
  const runsOutOn = medicine?.runsOutOn ? formatDisplayDate(medicine?.runsOutOn, 'Ongoing') : null;
  const needsReorder = Boolean(medicine?.needsReorder);
  const reorderDays = medicine?.reorderWhenDaysLeft ?? 5;
  const remindAtEachDose = medicine?.remindAtEachDose ?? true;
  const missedDoseAfterMin = medicine?.missedDoseAfterMin ?? 30;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitleText}>Medicine details</Text>
          <Text style={styles.headerSubtitleText} numberOfLines={1}>
            {userName} · {name}
          </Text>
        </View>

        {/* Balanced spacer so title stays centered without duplicate header delete icon */}
        <View style={styles.headerSpacer} />
      </View>

      {isLoading && !medicine ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F0913A" />
          <Text style={styles.loadingText}>Loading medicine details...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HERO CARD */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroIconBox}>
                <Feather
                  name={type.toLowerCase() === 'drops' ? 'droplet' : 'disc'}
                  size={24}
                  color="#2ED573"
                />
              </View>
              <View style={styles.heroTitleContainer}>
                <Text style={styles.heroNameText}>{name}</Text>
                {purpose ? (
                  <Text style={styles.heroPurposeText}>For {purpose}</Text>
                ) : null}
              </View>
            </View>

            {/* Chips row: Type, Strength, Food timing */}
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{type.toUpperCase()}</Text>
              </View>
              {strength ? (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{strength}</Text>
                </View>
              ) : null}
              <View style={[styles.chip, styles.chipTiming]}>
                <Text style={styles.chipTimingText}>{foodTiming}</Text>
              </View>
            </View>
          </View>

          {/* LOW SUPPLY REFILL ALERT BANNER */}
          {needsReorder && (
            <View style={styles.refillBanner}>
              <Feather name="alert-circle" size={17} color="#F0913A" style={styles.refillIcon} />
              <View style={styles.refillTextContainer}>
                <Text style={styles.refillTitle}>Refill Recommended</Text>
                <Text style={styles.refillSubtitle}>
                  {unitsLeft !== undefined
                    ? `${unitsLeft} ${doseUnit}s left · runs out in ${daysLeft ?? 'a few'} days`
                    : 'Low stock remaining. Please reorder soon.'}
                </Text>
              </View>
            </View>
          )}

          {/* SECTION 1: SCHEDULE */}
          <View style={styles.sectionHeaderBox}>
            <Text style={styles.sectionHeaderText}>SCHEDULE</Text>
            <Text style={styles.sectionHeaderBadge}>
              {frequency} · {timesPerDay} {timesPerDay === 1 ? 'time' : 'times'} a day
            </Text>
          </View>

          <View style={styles.cardContainer}>
            {doses && doses.length > 0 ? (
              doses.map((dose, idx) => (
                <View key={dose.id || idx}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.doseRow}>
                    <View style={styles.doseIconBox}>
                      <Feather
                        name={idx === 0 ? 'sun' : 'moon'}
                        size={17}
                        color={idx === 1 ? '#F0913A' : '#8E9BAE'}
                      />
                    </View>
                    <View style={styles.doseContent}>
                      <Text style={[styles.doseTitle, idx === 1 && { color: '#F0913A' }]}>
                        {dose.label || `Dose ${idx + 1}`}
                      </Text>
                      <Text style={styles.doseSubtitle}>
                        {doseAmount} {doseUnit}
                        {dose.foodNote ? ` · ${dose.foodNote}` : ''}
                      </Text>
                    </View>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeBadgeText}>
                        {format12Hour(dose.timeOfDay)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.doseRow}>
                <View style={styles.doseIconBox}>
                  <Feather name="clock" size={17} color="#8E9BAE" />
                </View>
                <View style={styles.doseContent}>
                  <Text style={styles.doseTitle}>Morning</Text>
                  <Text style={styles.doseSubtitle}>
                    {doseAmount} {doseUnit} · {foodTiming}
                  </Text>
                </View>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeText}>8:00 AM</Text>
                </View>
              </View>
            )}
          </View>

          {/* SECTION 2: SUPPLY & REFILL */}
          <View style={styles.sectionHeaderBox}>
            <Text style={styles.sectionHeaderText}>SUPPLY & REFILL</Text>
          </View>

          <View style={styles.cardContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Feather name="package" size={16} color="#8E9BAE" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Tablets remaining</Text>
                <Text style={styles.infoValue}>
                  {unitsLeft != null ? `${unitsLeft} ${doseUnit}s` : 'Not specified'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Feather name="calendar" size={16} color="#8E9BAE" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Estimated run-out date</Text>
                <Text style={styles.infoValue}>
                  {runsOutOn
                    ? `${runsOutOn}${daysLeft !== null ? ` (${daysLeft} days left)` : ''}`
                    : daysLeft !== null && daysLeft !== undefined
                    ? `${daysLeft} days left`
                    : 'Ongoing'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Feather name="bell" size={16} color="#8E9BAE" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Refill alert threshold</Text>
                <Text style={styles.infoValue}>Remind when {reorderDays} days left</Text>
              </View>
            </View>
          </View>

          {/* SECTION 3: DURATION */}
          <View style={styles.sectionHeaderBox}>
            <Text style={styles.sectionHeaderText}>DURATION</Text>
          </View>

          <View style={styles.cardContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Feather name="play" size={16} color="#8E9BAE" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Started on</Text>
                <Text style={styles.infoValue}>{startsOn}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Feather name="rotate-ccw" size={16} color="#8E9BAE" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Ends on</Text>
                <Text style={styles.infoValue}>{endsOn}</Text>
              </View>
            </View>
          </View>

          {/* SECTION 4: REMINDER SETTINGS */}
          <View style={styles.sectionHeaderBox}>
            <Text style={styles.sectionHeaderText}>REMINDERS</Text>
          </View>

          <View style={styles.cardContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Feather name="check-circle" size={16} color="#2ED573" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Dose reminders</Text>
                <Text style={styles.infoValue}>
                  {remindAtEachDose ? 'Enabled (on phone with buzzer)' : 'Disabled'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Feather name="alert-triangle" size={16} color="#F0913A" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Missed dose notification</Text>
                <Text style={styles.infoValue}>
                  Alert {userName} after {missedDoseAfterMin} minutes
                </Text>
              </View>
            </View>
          </View>

          {/* DELETE BUTTON */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDelete}
            disabled={isDeleting}
            style={styles.deleteButton}
            accessibilityRole="button"
            accessibilityLabel="Delete medicine"
          >
            {isDeleting ? (
              <ThreeDotsLoader color="#EF4444" size={6} spacing={4} />
            ) : (
              <>
                <Feather name="trash-2" size={17} color="#EF4444" style={styles.deleteBtnIcon} />
                <Text style={styles.deleteButtonText}>Delete medicine</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Delete Medicine Confirmation Modal */}
      <AppConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete medicine?"
        message={`Are you sure you want to delete "${medicine?.name || initialMedicineName || 'this medicine'}"? This will remove all scheduled reminders.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={isDeleting}
        iconName="trash-2"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </View>
  );
};

export default MedicineDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#0A111F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#162338',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontWeight: '700',
  },
  headerSubtitleText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '400',
    marginTop: 2,
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#8E9BAE',
    fontSize: RFValue(13),
    marginTop: 12,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#131F33',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(46, 213, 115, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTitleContainer: {
    flex: 1,
  },
  heroNameText: {
    color: '#FFFFFF',
    fontSize: RFValue(18),
    fontWeight: '700',
  },
  heroPurposeText: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    marginTop: 3,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 8,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chipText: {
    color: '#E2E8F0',
    fontSize: RFValue(11),
    fontWeight: '600',
  },
  chipTiming: {
    backgroundColor: 'rgba(240, 145, 58, 0.15)',
  },
  chipTimingText: {
    color: '#F0913A',
    fontSize: RFValue(11),
    fontWeight: '600',
  },
  refillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  refillIcon: {
    marginRight: 10,
  },
  refillTextContainer: {
    flex: 1,
  },
  refillTitle: {
    color: '#F0913A',
    fontSize: RFValue(12),
    fontWeight: '700',
  },
  refillSubtitle: {
    color: '#E2E8F0',
    fontSize: RFValue(11),
    marginTop: 2,
  },
  sectionHeaderBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionHeaderText: {
    color: '#F0913A',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionHeaderBadge: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '500',
  },
  cardContainer: {
    backgroundColor: '#131F33',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 18,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginLeft: 46,
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  doseIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  doseContent: {
    flex: 1,
  },
  doseTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  doseSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 2,
  },
  timeBadge: {
    backgroundColor: '#1A2942',
    borderWidth: 1,
    borderColor: '#263B5C',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timeBadgeText: {
    color: '#FFFFFF',
    fontSize: RFValue(12),
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  infoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1A2942',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '500',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
    marginTop: 2,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  deleteBtnIcon: {
    marginRight: 8,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: RFValue(13),
    fontWeight: '700',
  },
});

