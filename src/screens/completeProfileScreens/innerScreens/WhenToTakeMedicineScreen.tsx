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
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import {
  AppDateTimePicker,
  formatDate,
  formatTime,
  parseDateTimeString,
} from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  updateMedicineThunk,
  fetchMedicinesThunk,
} from '../../../redux/features/medicine/medicineSlice';
import { UpdateMedicineRequest } from '../../../services/medicineServices';
import { getMyMemberId } from '../../../units/asyncStorageManager';

export interface WhenToTakeMedicineData {
  frequency: string;
  timesPerDay: number;
  dose1Time: string;
  dose2Time: string;
  dose3Time?: string;
  dose4Time?: string;
  startDate: string;
  endDate: string;
  tabletsLeft: string;
  remindAtDose: boolean;
  missedDoseAlert: boolean;
  reorderAlert: boolean;
}

export interface WhenToTakeMedicineScreenProps {
  medicineId?: string;
  medicineName?: string;
  memberId?: string;
  initialData?: Partial<WhenToTakeMedicineData>;
  onBack?: () => void;
  onSave?: (data: WhenToTakeMedicineData) => void;
  onStartsPress?: () => void;
  onEndsPress?: () => void;
  onTabletsLeftPress?: () => void;
}

export const convertTo24Hour = (timeStr: string): string => {
  if (!timeStr) return '08:00';
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) {
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) {
      return trimmed;
    }
    return '08:00';
  }
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const modifier = match[3]?.toUpperCase();
  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

export const parseUnitsLeft = (text: string): number => {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : 12;
};

const FREQUENCY_OPTIONS = ['Every day', 'Some days', 'When needed'];
const TIMES_PER_DAY_OPTIONS = [1, 2, 3, 4];

const WhenToTakeMedicineScreen: React.FC<WhenToTakeMedicineScreenProps> = ({
  medicineId,
  medicineName = 'BP tablet',
  memberId,
  initialData,
  onBack,
  onSave,
  onStartsPress,
  onEndsPress,
  onTabletsLeftPress,
}) => {
  const dispatch = useAppDispatch();
  const familyState = useAppSelector((state: any) => state.family);
  const familyMembers =
    familyState?.myFamilyData?.family?.members ||
    familyState?.familyData?.family?.members ||
    [];

  const insets = useSafeAreaInsets();
  const [frequency, setFrequency] = useState<string>(
    initialData?.frequency || 'Every day',
  );
  const [timesPerDay, setTimesPerDay] = useState<number>(
    initialData?.timesPerDay || 2,
  );
  const [dose1Time, setDose1Time] = useState<string>(
    initialData?.dose1Time || '8:00 AM',
  );
  const [dose2Time, setDose2Time] = useState<string>(
    initialData?.dose2Time || '9:00 PM',
  );
  const [dose3Time, setDose3Time] = useState<string>(
    initialData?.dose3Time || '9:00 PM',
  );
  const [dose4Time, setDose4Time] = useState<string>(
    initialData?.dose4Time || '9:00 PM',
  );
  const [startDate, setStartDate] = useState<string>(
    initialData?.startDate || 'Today, Wed 11 Nov',
  );
  const [startDateObj, setStartDateObj] = useState<Date>(() => new Date());
  const [endDate, setEndDate] = useState<string>(
    initialData?.endDate || 'Ongoing',
  );
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);
  const [tabletsLeft, setTabletsLeft] = useState<string>(
    initialData?.tabletsLeft || '12 tablets · lasts until Tue, 17 Nov',
  );
  const [remindAtDose, setRemindAtDose] = useState<boolean>(
    initialData?.remindAtDose ?? true,
  );
  const [missedDoseAlert, setMissedDoseAlert] = useState<boolean>(
    initialData?.missedDoseAlert ?? true,
  );
  const [reorderAlert, setReorderAlert] = useState<boolean>(
    initialData?.reorderAlert ?? true,
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Time Picker Modal State
  const [isTimePickerVisible, setIsTimePickerVisible] = useState<boolean>(false);
  const [activeDoseTarget, setActiveDoseTarget] = useState<1 | 2 | 3 | 4>(1);

  // Date Pickers & Tablets Modal State
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] = useState<boolean>(false);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState<boolean>(false);
  const [isTabletsModalVisible, setIsTabletsModalVisible] = useState<boolean>(false);
  const [tabletsInputText, setTabletsInputText] = useState<string>('12');

  const handleSelectTimesPerDay = (count: number) => {
    setTimesPerDay(count);
    if (count === 3 && dose2Time === '9:00 PM') {
      setDose2Time('1:00 PM');
      setDose3Time('9:00 PM');
    } else if (count === 4) {
      if (dose2Time === '9:00 PM') setDose2Time('1:00 PM');
      if (dose3Time === '9:00 PM') setDose3Time('6:00 PM');
      setDose4Time('9:00 PM');
    } else if (count === 2 && dose2Time === '1:00 PM') {
      setDose2Time('9:00 PM');
    }
  };

  const openTimePicker = (target: 1 | 2 | 3 | 4) => {
    setActiveDoseTarget(target);
    setIsTimePickerVisible(true);
  };

  const handleSetTime = (timeString: string) => {
    if (activeDoseTarget === 1) {
      setDose1Time(timeString);
    } else if (activeDoseTarget === 2) {
      setDose2Time(timeString);
    } else if (activeDoseTarget === 3) {
      setDose3Time(timeString);
    } else if (activeDoseTarget === 4) {
      setDose4Time(timeString);
    }
  };

  const getActiveDoseTime = (): string => {
    if (activeDoseTarget === 1) return dose1Time;
    if (activeDoseTarget === 2) return dose2Time;
    if (activeDoseTarget === 3) return dose3Time;
    return dose4Time;
  };

  const getActiveDoseTitle = (): string => {
    if (activeDoseTarget === 1) return 'Dose 1 · Morning';
    if (activeDoseTarget === 2) return timesPerDay === 2 ? 'Dose 2 · Night' : 'Dose 2 · Afternoon';
    if (activeDoseTarget === 3) return timesPerDay === 3 ? 'Dose 3 · Night' : 'Dose 3 · Evening';
    return 'Dose 4 · Night';
  };

  const handleSave = async () => {
    const formData: WhenToTakeMedicineData = {
      frequency,
      timesPerDay,
      dose1Time,
      dose2Time,
      dose3Time,
      dose4Time,
      startDate,
      endDate,
      tabletsLeft,
      remindAtDose,
      missedDoseAlert,
      reorderAlert,
    };

    setIsSaving(true);
    try {
      if (medicineId) {
        // Resolve a valid family member for missed dose alerts
        const otherMember = familyMembers.find((m: any) => m.id && m.id !== memberId);
        const tellMemberId = otherMember?.id || familyMembers[0]?.id || memberId;

        const freqEnum =
          frequency === 'Some days'
            ? 'SOME_DAYS'
            : frequency === 'When needed'
            ? 'WHEN_NEEDED'
            : 'EVERY_DAY';

        const doses: Array<{ label: string; timeOfDay: string; foodNote?: string }> = [
          {
            label: 'Morning',
            timeOfDay: convertTo24Hour(dose1Time),
            foodNote: 'after breakfast',
          },
        ];

        if (timesPerDay === 2) {
          doses.push({
            label: 'Night',
            timeOfDay: convertTo24Hour(dose2Time),
            foodNote: 'after dinner',
          });
        } else if (timesPerDay === 3) {
          doses.push({
            label: 'Afternoon',
            timeOfDay: convertTo24Hour(dose2Time),
            foodNote: 'after lunch',
          });
          doses.push({
            label: 'Night',
            timeOfDay: convertTo24Hour(dose3Time),
            foodNote: 'after dinner',
          });
        } else if (timesPerDay === 4) {
          doses.push({
            label: 'Afternoon',
            timeOfDay: convertTo24Hour(dose2Time),
            foodNote: 'after lunch',
          });
          doses.push({
            label: 'Evening',
            timeOfDay: convertTo24Hour(dose3Time),
            foodNote: 'evening snack',
          });
          doses.push({
            label: 'Night',
            timeOfDay: convertTo24Hour(dose4Time),
            foodNote: 'after dinner',
          });
        }

        let startsOnIso: string;
        try {
          startsOnIso = startDateObj.toISOString().slice(0, 10);
        } catch {
          startsOnIso = new Date().toISOString().slice(0, 10);
        }

        let endsOnIso: string | null = null;
        if (endDate !== 'Ongoing' && endDateObj) {
          try {
            endsOnIso = endDateObj.toISOString().slice(0, 10);
          } catch {
            endsOnIso = null;
          }
        }

        const payload: UpdateMedicineRequest = {
          frequency: freqEnum,
          daysOfWeek: freqEnum === 'SOME_DAYS' ? ['MON', 'WED', 'FRI'] : [],
          timesPerDay,
          doses,
          startsOn: startsOnIso,
          endsOn: endsOnIso,
          unitsLeft: parseUnitsLeft(tabletsLeft),
          remindAtEachDose: remindAtDose,
          ...(missedDoseAlert
            ? {
                missedDoseAfterMin: 30,
                ...(tellMemberId ? { missedDoseTellMemberId: tellMemberId } : {}),
              }
            : {}),
          ...(reorderAlert ? { reorderWhenDaysLeft: 5 } : {}),
        };

        console.log('====================================');
        console.log('[WhenToTakeMedicine] Submitting PATCH /family/medicines/:id:');
        console.log(`[WhenToTakeMedicine] MedicineId: ${medicineId}`);
        console.log(JSON.stringify(payload, null, 2));
        console.log('====================================');

        const updateRes = await dispatch(
          updateMedicineThunk({ medicineId, payload }),
        ).unwrap();

        console.log('====================================');
        console.log('[WhenToTakeMedicine] Medicine Schedule Saved Successfully:');
        console.log(JSON.stringify(updateRes, null, 2));
        console.log('====================================');

        // Refetch medicines so HealthProfileDetailsScreen has the fresh list
        let targetMemberId = memberId;
        if (!targetMemberId || targetMemberId === 'me') {
          const stored = await getMyMemberId();
          if (stored) targetMemberId = stored;
        }
        if (targetMemberId) {
          dispatch(fetchMedicinesThunk({ memberId: targetMemberId }));
        }
      }

      onSave?.(formData);
    } catch (err: any) {
      console.warn('[WhenToTakeMedicine] Error saving medicine schedule:', err);
      const errMsg =
        err?.message ||
        (Array.isArray(err?.message) ? err.message.join(', ') : null) ||
        'Failed to save schedule. Saving locally.';
      Alert.alert('Notice', errMsg, [
        {
          text: 'OK',
          onPress: () => {
            onSave?.(formData);
          },
        },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>When to take it</Text>
          <Text style={styles.headerSubtitleText}>
            Step 2 of 2 · {medicineName}
          </Text>
        </View>

        <View style={styles.spacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HOW OFTEN Section */}
        <View style={styles.sectionHeaderBox}>
          <Text style={styles.sectionHeaderText}>HOW OFTEN</Text>
        </View>

        <View style={styles.chipsRow}>
          {FREQUENCY_OPTIONS.map((item) => {
            const isSelected = item === frequency;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.7}
                onPress={() => setFrequency(item)}
                style={[
                  styles.chip,
                  isSelected ? styles.chipSelected : styles.chipUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected
                      ? styles.chipTextSelected
                      : styles.chipTextUnselected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Times a Day Section */}
        <View style={styles.timesADayRow}>
          <Text style={styles.timesADayLabel}>Times a day</Text>
          <View style={styles.timesNumbersRow}>
            {TIMES_PER_DAY_OPTIONS.map((count) => {
              const isSelected = count === timesPerDay;
              return (
                <TouchableOpacity
                  key={count}
                  activeOpacity={0.7}
                  onPress={() => handleSelectTimesPerDay(count)}
                  style={[
                    styles.numberCircle,
                    isSelected
                      ? styles.numberCircleSelected
                      : styles.numberCircleUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.numberText,
                      isSelected
                        ? styles.numberTextSelected
                        : styles.numberTextUnselected,
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Doses Card */}
        <View style={styles.cardContainer}>
          {/* Dose 1 */}
          <View style={styles.doseRow}>
            <View style={styles.doseIconBox}>
              <Feather name="clock" size={16} color="#8E9BAE" />
            </View>
            <View style={styles.doseTextContainer}>
              <Text style={styles.doseTitle}>Dose 1 · Morning</Text>
              <Text style={styles.doseSubtitle}>
                1 tablet · after breakfast
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => openTimePicker(1)}
              style={styles.timeButton}
              accessibilityRole="button"
              accessibilityLabel={`Dose 1 time: ${dose1Time}`}
            >
              <Text style={styles.timeButtonText}>{dose1Time}</Text>
            </TouchableOpacity>
          </View>

          {timesPerDay >= 2 && (
            <>
              <View style={styles.divider} />

              {/* Dose 2 */}
              <View style={styles.doseRow}>
                <View style={styles.doseIconBox}>
                  <Feather
                    name="clock"
                    size={16}
                    color="#F0913A"
                  />
                </View>
                <View style={styles.doseTextContainer}>
                  <Text style={[styles.doseTitle, { color: '#F0913A' }]}>
                    {timesPerDay === 2 ? 'Dose 2 · Night' : 'Dose 2 · Afternoon'}
                  </Text>
                  <Text style={styles.doseSubtitle}>
                    {timesPerDay === 2
                      ? '1 tablet · after dinner'
                      : '1 tablet · after lunch'}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openTimePicker(2)}
                  style={styles.timeButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Dose 2 time: ${dose2Time}`}
                >
                  <Text style={styles.timeButtonText}>{dose2Time}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {timesPerDay >= 3 && (
            <>
              <View style={styles.divider} />

              {/* Dose 3 */}
              <View style={styles.doseRow}>
                <View style={styles.doseIconBox}>
                  <Feather
                    name={timesPerDay === 3 ? 'moon' : 'coffee'}
                    size={16}
                    color="#8E9BAE"
                  />
                </View>
                <View style={styles.doseTextContainer}>
                  <Text style={styles.doseTitle}>
                    {timesPerDay === 3 ? 'Dose 3 · Night' : 'Dose 3 · Evening'}
                  </Text>
                  <Text style={styles.doseSubtitle}>
                    {timesPerDay === 3
                      ? '1 tablet · after dinner'
                      : '1 tablet · evening snack'}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openTimePicker(3)}
                  style={styles.timeButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Dose 3 time: ${dose3Time}`}
                >
                  <Text style={styles.timeButtonText}>{dose3Time}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {timesPerDay >= 4 && (
            <>
              <View style={styles.divider} />

              {/* Dose 4 */}
              <View style={styles.doseRow}>
                <View style={styles.doseIconBox}>
                  <Feather name="moon" size={16} color="#8E9BAE" />
                </View>
                <View style={styles.doseTextContainer}>
                  <Text style={styles.doseTitle}>Dose 4 · Night</Text>
                  <Text style={styles.doseSubtitle}>
                    1 tablet · after dinner
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openTimePicker(4)}
                  style={styles.timeButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Dose 4 time: ${dose4Time}`}
                >
                  <Text style={styles.timeButtonText}>{dose4Time}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Schedule Timing & Refill Card */}
        <View style={styles.cardContainer}>
          {/* Starts */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (onStartsPress) {
                onStartsPress();
              } else {
                setIsStartDatePickerVisible(true);
              }
            }}
            style={styles.infoRow}
          >
            <View style={styles.infoIconBox}>
              <Feather name="calendar" size={16} color="#8E9BAE" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Starts</Text>
              <Text style={styles.infoValue}>{startDate}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Ends */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (onEndsPress) {
                onEndsPress();
              } else {
                Alert.alert(
                  'Medication Duration',
                  'Choose when this medication schedule ends:',
                  [
                    {
                      text: 'Ongoing (No end date)',
                      onPress: () => {
                        setEndDate('Ongoing');
                        setEndDateObj(null);
                      },
                    },
                    {
                      text: 'Pick specific end date',
                      onPress: () => {
                        setIsEndDatePickerVisible(true);
                      },
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ],
                  { cancelable: true }
                );
              }
            }}
            style={styles.infoRow}
          >
            <View style={styles.infoIconBox}>
              <Feather name="rotate-ccw" size={16} color="#8E9BAE" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Ends</Text>
              <Text style={styles.infoValue}>{endDate}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Tablets Left */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (onTabletsLeftPress) {
                onTabletsLeftPress();
              } else {
                const cur = parseUnitsLeft(tabletsLeft);
                setTabletsInputText(String(cur));
                setIsTabletsModalVisible(true);
              }
            }}
            style={styles.infoRow}
          >
            <View style={styles.infoIconBox}>
              <Feather name="paperclip" size={16} color="#8E9BAE" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Tablets left · for refill reminders</Text>
              <Text style={styles.infoValue}>{tabletsLeft}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Reminder Settings Card */}
        <View style={styles.cardContainer}>
          {/* Remind Dadi at each dose */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Remind Dadi at each dose</Text>
              <Text style={styles.switchSubtitle}>
                On her phone, with Taken and Snooze
              </Text>
            </View>
            <Switch
              value={remindAtDose}
              onValueChange={setRemindAtDose}
              trackColor={{ false: '#1E293B', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          {/* If a dose is missed */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>If a dose is missed</Text>
              <Text style={styles.switchSubtitle}>
                Tell Priya after 30 minutes
              </Text>
            </View>
            <Switch
              value={missedDoseAlert}
              onValueChange={setMissedDoseAlert}
              trackColor={{ false: '#1E293B', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          {/* Remind to reorder */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Remind to reorder</Text>
            </View>
            <Switch
              value={reorderAlert}
              onValueChange={setReorderAlert}
              trackColor={{ false: '#1E293B', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Save Medicine Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title={isSaving ? 'Saving...' : 'Save medicine'}
          disabled={isSaving}
          onPress={handleSave}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={54}
          borderRadius={27}
        />
      </View>

      {/* Integrated Pick Time Modal using AppDateTimePicker */}
      <AppDateTimePicker
        visible={isTimePickerVisible}
        mode="time"
        title={getActiveDoseTitle()}
        date={parseDateTimeString(getActiveDoseTime(), 'time')}
        onConfirm={(date) => {
          setIsTimePickerVisible(false);
          handleSetTime(formatTime(date));
        }}
        onCancel={() => setIsTimePickerVisible(false)}
      />

      {/* Start Date Picker Modal */}
      <AppDateTimePicker
        visible={isStartDatePickerVisible}
        mode="date"
        title="Start date"
        date={startDateObj}
        onConfirm={(date) => {
          setIsStartDatePickerVisible(false);
          setStartDateObj(date);
          setStartDate(formatDate(date, 'DD MMM YYYY'));
        }}
        onCancel={() => setIsStartDatePickerVisible(false)}
      />

      {/* End Date Picker Modal */}
      <AppDateTimePicker
        visible={isEndDatePickerVisible}
        mode="date"
        title="End date"
        date={endDateObj || new Date(Date.now() + 30 * 86400000)}
        minimumDate={startDateObj}
        onConfirm={(date) => {
          setIsEndDatePickerVisible(false);
          setEndDateObj(date);
          setEndDate(formatDate(date, 'DD MMM YYYY'));
        }}
        onCancel={() => setIsEndDatePickerVisible(false)}
      />

      {/* Tablets Count Modal */}
      <Modal
        visible={isTabletsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTabletsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tablets left</Text>
            <Text style={styles.modalSubtitle}>
              Enter total tablets available for refill alerts
            </Text>

            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.modalTextInput}
                keyboardType="number-pad"
                value={tabletsInputText}
                onChangeText={setTabletsInputText}
                placeholder="12"
                placeholderTextColor="#64748B"
                selectionColor="#F0913A"
                autoFocus
              />
              <Text style={styles.modalInputUnit}>tablets</Text>
            </View>

            <View style={styles.modalChipsRow}>
              {[10, 15, 20, 30, 60, 90].map((num) => (
                <TouchableOpacity
                  key={num}
                  activeOpacity={0.7}
                  style={[
                    styles.modalChip,
                    tabletsInputText === String(num) && styles.modalChipActive,
                  ]}
                  onPress={() => setTabletsInputText(String(num))}
                >
                  <Text
                    style={[
                      styles.modalChipText,
                      tabletsInputText === String(num) &&
                        styles.modalChipTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.modalCancelBtn}
                onPress={() => setIsTabletsModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.modalSaveBtn}
                onPress={() => {
                  const count = parseInt(tabletsInputText, 10) || 12;
                  const days = Math.max(
                    1,
                    Math.floor(count / Math.max(1, timesPerDay)),
                  );
                  const targetDate = new Date(Date.now() + days * 86400000);
                  const lastsUntilStr = targetDate.toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  });
                  setTabletsLeft(
                    `${count} tablets · lasts until ${lastsUntilStr}`,
                  );
                  setIsTabletsModalVisible(false);
                }}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WhenToTakeMedicineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitleText: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    marginTop: 2,
    textAlign: 'center',
  },
  spacer: {
    width: 40,
    height: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeaderBox: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionHeaderText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: '#0C1E34',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipSelected: {
    backgroundColor: Colors.primary || '#F0913A',
    borderColor: Colors.primary || '#F0913A',
  },
  chipText: {
    fontSize: RFValue(12.5),
  },
  chipTextUnselected: {
    color: '#CBD5E1',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#071526',
    fontWeight: '700',
  },
  timesADayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  timesADayLabel: {
    color: '#CBD5E1',
    fontSize: RFValue(13),
    fontWeight: '500',
  },
  timesNumbersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  numberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  numberCircleUnselected: {
    backgroundColor: '#0C1E34',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  numberCircleSelected: {
    backgroundColor: Colors.primary || '#F0913A',
    borderColor: Colors.primary || '#F0913A',
  },
  numberText: {
    fontSize: RFValue(13),
  },
  numberTextUnselected: {
    color: '#CBD5E1',
    fontWeight: '600',
  },
  numberTextSelected: {
    color: '#071526',
    fontWeight: '700',
  },
  cardContainer: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginBottom: 14,
    overflow: 'hidden',
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  doseIconBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  doseTextContainer: {
    flex: 1,
  },
  doseTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  doseSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 2,
  },
  timeButton: {
    backgroundColor: '#071526',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  timeButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(12.5),
    fontWeight: '600',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoIconBox: {
    width: 28,
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
    marginBottom: 2,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  switchSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#0B1E36',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    marginBottom: 16,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071526',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0913A',
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
  },
  modalTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '600',
    padding: 0,
  },
  modalInputUnit: {
    color: '#8E9BAE',
    fontSize: RFValue(13),
    fontWeight: '500',
  },
  modalChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  modalChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#0E2442',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalChipActive: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  modalChipText: {
    color: '#CBD5E1',
    fontSize: RFValue(12),
    fontWeight: '500',
  },
  modalChipTextActive: {
    color: '#071526',
    fontWeight: '700',
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalCancelBtnText: {
    color: '#CBD5E1',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  modalSaveBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0913A',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '700',
  },
});

