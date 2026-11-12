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
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import PickTimeModal from '../components/PickTimeModal';

export interface WhenToTakeMedicineData {
  frequency: string;
  timesPerDay: number;
  dose1Time: string;
  dose2Time: string;
  startDate: string;
  endDate: string;
  tabletsLeft: string;
  remindAtDose: boolean;
  missedDoseAlert: boolean;
  reorderAlert: boolean;
}

export interface WhenToTakeMedicineScreenProps {
  initialData?: Partial<WhenToTakeMedicineData>;
  medicineName?: string;
  onBack?: () => void;
  onSave?: (data: WhenToTakeMedicineData) => void;
  onStartsPress?: () => void;
  onEndsPress?: () => void;
  onTabletsLeftPress?: () => void;
}

const FREQUENCY_OPTIONS = ['Every day', 'Some days', 'When needed'];
const TIMES_PER_DAY_OPTIONS = [1, 2, 3, 4];

const WhenToTakeMedicineScreen: React.FC<WhenToTakeMedicineScreenProps> = ({
  initialData,
  medicineName = 'BP tablet',
  onBack,
  onSave,
  onStartsPress,
  onEndsPress,
  onTabletsLeftPress,
}) => {
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
  const [startDate, setStartDate] = useState<string>(
    initialData?.startDate || 'Today, Wed 11 Nov',
  );
  const [endDate, setEndDate] = useState<string>(
    initialData?.endDate || 'Ongoing',
  );
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

  // Time Picker Modal State
  const [isTimePickerVisible, setIsTimePickerVisible] = useState<boolean>(false);
  const [activeDoseTarget, setActiveDoseTarget] = useState<'dose1' | 'dose2'>(
    'dose2',
  );

  const openTimePicker = (target: 'dose1' | 'dose2') => {
    setActiveDoseTarget(target);
    setIsTimePickerVisible(true);
  };

  const handleSetTime = (timeString: string) => {
    if (activeDoseTarget === 'dose1') {
      setDose1Time(timeString);
    } else {
      setDose2Time(timeString);
    }
  };

  const handleSave = () => {
    onSave?.({
      frequency,
      timesPerDay,
      dose1Time,
      dose2Time,
      startDate,
      endDate,
      tabletsLeft,
      remindAtDose,
      missedDoseAlert,
      reorderAlert,
    });
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
                  onPress={() => setTimesPerDay(count)}
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
              onPress={() => openTimePicker('dose1')}
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
                  <Feather name="moon" size={16} color="#8E9BAE" />
                </View>
                <View style={styles.doseTextContainer}>
                  <Text style={styles.doseTitle}>Dose 2 · Night</Text>
                  <Text style={styles.doseSubtitle}>
                    1 tablet · after dinner
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openTimePicker('dose2')}
                  style={styles.timeButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Dose 2 time: ${dose2Time}`}
                >
                  <Text style={styles.timeButtonText}>{dose2Time}</Text>
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
            onPress={onStartsPress}
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
            onPress={onEndsPress}
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
            onPress={onTabletsLeftPress}
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
                On her phone, with talked and buzzer
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
          title="Save medicine"
          onPress={handleSave}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={54}
          borderRadius={27}
        />
      </View>

      {/* Integrated Pick Time Modal Bottom Sheet */}
      <PickTimeModal
        visible={isTimePickerVisible}
        doseTitle={
          activeDoseTarget === 'dose1' ? 'Dose 1 · Morning' : 'Dose 2 · Night'
        }
        onClose={() => setIsTimePickerVisible(false)}
        onSetTime={handleSetTime}
      />
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
});

