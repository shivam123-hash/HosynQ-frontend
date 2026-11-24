import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { PersonalInfoHeader } from '../components';
import { AppDateTimePicker, formatDate } from '../../../components';
import { useAppDispatch } from '../../../redux';
import {
  updateLifeProfileSectionThunk,
  fetchLifeProfileSectionThunk,
  fetchLifeProfileFullThunk,
} from '../../../redux/features/lifeProfile/lifeProfileSlice';
import { getMyMemberId } from '../../../units/AsyncStorageManager';
import { buildGrowthItemPayload } from './vaccinationPayloadUtils';

export interface MeasurementData {
  id?: string;
  measuredOn: string;
  unit: 'metric' | 'imperial';
  height: number;
  weight: number;
  headSize?: string | null;
  remindMe: boolean;
  remindInterval?: string;
}

export interface AddMeasurementScreenProps {
  memberId?: string;
  childName?: string;
  initialData?: Partial<MeasurementData>;
  onClose?: () => void;
  onSave?: (data: MeasurementData) => void;
}

const formatMeasurementDate = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  return `Today, ${dayName} ${dayNum} ${monthName}`;
};

const AddMeasurementScreen: React.FC<AddMeasurementScreenProps> = ({
  memberId,
  childName = 'Aarav',
  initialData,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [measuredDate, setMeasuredDate] = useState<Date>(new Date());
  const [unit, setUnit] = useState<'metric' | 'imperial'>(
    initialData?.unit || 'metric',
  );
  const [height, setHeight] = useState<number>(initialData?.height ?? 0);
  const [weight, setWeight] = useState<number>(initialData?.weight ?? 0);
  const [remindMe, setRemindMe] = useState<boolean>(
    initialData?.remindMe ?? true,
  );
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [activeCard, setActiveCard] = useState<'height' | 'weight'>('height');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Smooth hover / active transition animation values
  const heightAnim = useRef(new Animated.Value(1)).current; // 1 = active, 0 = inactive
  const weightAnim = useRef(new Animated.Value(0)).current; // 0 = inactive, 1 = active

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: activeCard === 'height' ? 1 : 0,
        duration: 240,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
      Animated.timing(weightAnim, {
        toValue: activeCard === 'weight' ? 1 : 0,
        duration: 240,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
    ]).start();
  }, [activeCard, heightAnim, weightAnim]);

  // Height interpolations
  const heightBorderColor = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1E324A', Colors.primary || '#F0913A'],
  });
  const heightBorderWidth = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6],
  });
  const heightScale = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });
  const heightBg = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0E1B2C', '#0F1F33'],
  });

  // Weight interpolations
  const weightBorderColor = weightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1E324A', Colors.primary || '#F0913A'],
  });
  const weightBorderWidth = weightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6],
  });
  const weightScale = weightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });
  const weightBg = weightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0E1B2C', '#0F1F33'],
  });

  // Stepper handlers
  const handleHeightStep = (delta: number) => {
    setActiveCard('height');
    setHeight((prev) => {
      if (prev === 0 && delta > 0) return 100;
      return Math.max(0, Math.round((prev + delta) * 10) / 10);
    });
  };

  const handleWeightStep = (delta: number) => {
    setActiveCard('weight');
    setWeight((prev) => {
      if (prev === 0 && delta > 0) return 20;
      return Math.max(0, Math.round((prev + delta) * 10) / 10);
    });
  };

  const handleSave = async () => {
    if (height <= 0 && weight <= 0) {
      Alert.alert('Required', 'Please enter height or weight measurement.');
      return;
    }

    const data: MeasurementData = {
      id: initialData?.id,
      measuredOn: formatDate(measuredDate, 'DD MMM YYYY'),
      unit,
      height,
      weight,
      headSize: `Not needed for ${childName}`,
      remindMe,
      remindInterval: 'Every 3 months',
    };

    setIsSaving(true);
    let targetMemberId = memberId;
    if (!targetMemberId || targetMemberId === 'me') {
      const stored = await getMyMemberId();
      if (stored) targetMemberId = stored;
    }

    const growthPayload = buildGrowthItemPayload({
      id: initialData?.id,
      heightCm: unit === 'imperial' ? Math.round(height * 2.54 * 10) / 10 : height,
      weightKg:
        unit === 'imperial' ? Math.round(weight * 0.453592 * 10) / 10 : weight,
      measuredOn: measuredDate,
      remindMe,
    });

    console.log('====================================');
    console.log('[AddMeasurement] Submitting PATCH /life-profile with growth:');
    console.log(`[AddMeasurement] Target MemberId: ${targetMemberId}`);
    console.log(
      JSON.stringify({ vaccination: { growth: [growthPayload] } }, null, 2),
    );
    console.log('====================================');

    try {
      if (targetMemberId) {
        await dispatch(
          updateLifeProfileSectionThunk({
            memberId: targetMemberId,
            payload: {
              vaccination: {
                growth: [growthPayload],
              },
            },
          }),
        ).unwrap();

        try {
          await Promise.all([
            dispatch(
              fetchLifeProfileSectionThunk({
                memberId: targetMemberId,
                section: 'vaccination',
              }),
            ),
            dispatch(fetchLifeProfileFullThunk({ memberId: targetMemberId })),
          ]);
        } catch (err) {
          console.log('[AddMeasurement] Error refreshing profile:', err);
        }
      }

      onSave?.(data);
      onClose?.();
    } catch (err: any) {
      console.warn('[AddMeasurement] Failed to save growth measurement:', err);
      const msg = err?.message || err?.error || 'Failed to save measurement';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDateString = formatMeasurementDate(measuredDate);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with Circular Close X */}
      <PersonalInfoHeader
        title="Add measurement"
        subtitle={`${childName} · Growth`}
        onBack={onClose}
        icon="close"
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Measured On Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowDatePicker(true)}
          style={styles.dateCard}
          accessibilityRole="button"
          accessibilityLabel={`Measured on: ${formattedDateString}`}
        >
          <View style={styles.calendarIconContainer}>
            <Feather name="calendar" size={18} color="#8E9BAE" />
          </View>

          <View style={styles.dateTextContainer}>
            <Text style={styles.dateLabel}>Measured on</Text>
            <Text style={styles.dateValue}>{formattedDateString}</Text>
          </View>

          <Feather name="chevron-right" size={18} color="#64748B" />
        </TouchableOpacity>

        {/* Unit Switcher: cm · kg vs ft · lb */}
        <View style={styles.unitSelectorContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setUnit('metric')}
            style={[
              styles.unitOption,
              unit === 'metric' && styles.unitOptionActive,
            ]}
          >
            <Text
              style={[
                styles.unitOptionText,
                unit === 'metric' && styles.unitOptionTextActive,
              ]}
            >
              cm · kg
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setUnit('imperial')}
            style={[
              styles.unitOption,
              unit === 'imperial' && styles.unitOptionActive,
            ]}
          >
            <Text
              style={[
                styles.unitOptionText,
                unit === 'imperial' && styles.unitOptionTextActive,
              ]}
            >
              ft · lb
            </Text>
          </TouchableOpacity>
        </View>

        {/* Height Stepper Card */}
        <Animated.View
          onTouchStart={() => setActiveCard('height')}
          style={[
            styles.stepperCard,
            {
              borderColor: heightBorderColor,
              borderWidth: heightBorderWidth,
              backgroundColor: heightBg,
              transform: [{ scale: heightScale }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveCard('height')}
            style={styles.stepperLabelTouch}
          >
            <Text
              style={[
                styles.stepperLabel,
                activeCard === 'height' && styles.stepperLabelActive,
              ]}
            >
              Height
            </Text>
          </TouchableOpacity>

          <View style={styles.stepperControls}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleHeightStep(-0.5)}
              style={styles.minusButton}
              accessibilityRole="button"
              accessibilityLabel="Decrease height"
            >
              <Feather name="minus" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveCard('height')}
              style={styles.valueRow}
            >
              <Text style={styles.stepperValueText}>
                {height === 0
                  ? '--'
                  : unit === 'metric'
                  ? height.toFixed(1)
                  : (height / 2.54).toFixed(1)}
              </Text>
              <Text style={styles.stepperUnitText}>
                {unit === 'metric' ? 'cm' : 'in'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleHeightStep(0.5)}
              style={styles.plusButton}
              accessibilityRole="button"
              accessibilityLabel="Increase height"
            >
              <Feather name="plus" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Weight Stepper Card */}
        <Animated.View
          onTouchStart={() => setActiveCard('weight')}
          style={[
            styles.stepperCard,
            {
              borderColor: weightBorderColor,
              borderWidth: weightBorderWidth,
              backgroundColor: weightBg,
              transform: [{ scale: weightScale }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveCard('weight')}
            style={styles.stepperLabelTouch}
          >
            <Text
              style={[
                styles.stepperLabel,
                activeCard === 'weight' && styles.stepperLabelActive,
              ]}
            >
              Weight
            </Text>
          </TouchableOpacity>

          <View style={styles.stepperControls}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleWeightStep(-0.2)}
              style={styles.minusButton}
              accessibilityRole="button"
              accessibilityLabel="Decrease weight"
            >
              <Feather name="minus" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveCard('weight')}
              style={styles.valueRow}
            >
              <Text style={styles.stepperValueText}>
                {weight === 0
                  ? '--'
                  : unit === 'metric'
                  ? weight.toFixed(1)
                  : (weight * 2.20462).toFixed(1)}
              </Text>
              <Text style={styles.stepperUnitText}>
                {unit === 'metric' ? 'kg' : 'lb'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleWeightStep(0.2)}
              style={styles.plusButton}
              accessibilityRole="button"
              accessibilityLabel="Increase weight"
            >
              <Feather name="plus" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Head size (under 2 years only) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.fieldLabel}>Head size (under 2 years only)</Text>
          <View style={styles.disabledInputCard}>
            <Text style={styles.disabledInputText}>
              Not needed for {childName}
            </Text>
          </View>
        </View>

        {/* Last measurement historical note */}
        <Text style={styles.historyNoteText}>
          Last time: 132 cm and 28 kg on 12 Oct 2026.
        </Text>

        {/* Remind me to measure Toggle Card */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderTextContainer}>
            <Text style={styles.reminderTitle}>Remind me to measure</Text>
            <Text style={styles.reminderSubtitle}>Every 3 months</Text>
          </View>

          <Switch
            value={remindMe}
            onValueChange={setRemindMe}
            trackColor={{ false: '#243B58', true: Colors.primary || '#F0913A' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#243B58"
          />
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title={isSaving ? 'Saving...' : 'Save measurement'}
          disabled={isSaving}
          onPress={handleSave}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={54}
          borderRadius={27}
          fontSize={RFValue(15)}
        />
      </View>

      {/* Date Picker Modal */}
      <AppDateTimePicker
        visible={showDatePicker}
        date={measuredDate}
        mode="date"
        title="Measured on"
        onConfirm={(d) => {
          setMeasuredDate(d);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
};

export default AddMeasurementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1D30',
    borderWidth: 1,
    borderColor: '#1E324A',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  calendarIconContainer: {
    marginRight: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: RFValue(11.5),
    color: '#8E9BAE',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: RFValue(14.5),
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  unitSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F1D30',
    borderWidth: 1,
    borderColor: '#1E324A',
    borderRadius: 24,
    padding: 3,
    marginBottom: 16,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitOptionActive: {
    backgroundColor: Colors.primary || '#F0913A',
  },
  unitOptionText: {
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
    color: '#94A3B8',
  },
  unitOptionTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Roboto-Bold',
  },
  stepperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginVertical: 3,
    marginBottom: 12,
  },
  stepperLabelTouch: {
    flex: 1,
    paddingVertical: 6,
  },
  stepperLabel: {
    fontSize: RFValue(15),
    fontFamily: 'Roboto-SemiBold',
    color: '#8E9BAE',
  },
  stepperLabelActive: {
    color: '#CBD5E1',
    fontFamily: 'Roboto-Bold',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16283E',
    borderWidth: 1,
    borderColor: '#263B54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginHorizontal: 14,
  },
  stepperValueText: {
    fontSize: RFValue(24),
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  stepperUnitText: {
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-Medium',
    color: '#8E9BAE',
    marginLeft: 4,
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary || '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginTop: 6,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: RFValue(12.5),
    color: '#64748B',
    marginBottom: 8,
  },
  disabledInputCard: {
    backgroundColor: '#0E1A2C',
    borderWidth: 1,
    borderColor: '#17283E',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  disabledInputText: {
    fontSize: RFValue(13.5),
    color: '#475569',
  },
  historyNoteText: {
    fontSize: RFValue(12),
    color: '#64748B',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1D30',
    borderWidth: 1,
    borderColor: '#1E324A',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: RFValue(14),
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  reminderSubtitle: {
    fontSize: RFValue(12),
    color: '#8E9BAE',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
  },
});
