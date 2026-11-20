import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import ImagePicker from 'react-native-image-crop-picker';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { PersonalInfoHeader } from '../components';
import { AppDateTimePicker, formatDate } from '../../../components';
import { useAppDispatch } from '../../../redux/store';
import {
  updateLifeProfileSectionThunk,
  fetchLifeProfileSectionThunk,
  fetchLifeProfileFullThunk,
} from '../../../redux/features/lifeProfile/lifeProfileSlice';
import { getMyMemberId } from '../../../units/asyncStorageManager';
import { buildMilestoneItemPayload } from './vaccinationPayloadUtils';

export type MilestoneType =
  | 'Physical'
  | 'Learning'
  | 'Social'
  | 'A first'
  | 'Other';

export interface MilestoneData {
  id?: string;
  title: string;
  when: string;
  type: MilestoneType;
  photos: string[];
  shareInPulse: boolean;
}

export interface AddMilestoneScreenProps {
  memberId?: string;
  childName?: string;
  initialData?: Partial<MilestoneData>;
  onClose?: () => void;
  onSave?: (data: MilestoneData) => void;
}

const MILESTONE_TYPES: MilestoneType[] = [
  'Physical',
  'Learning',
  'Social',
  'A first',
  'Other',
];

const formatMilestoneDate = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
};

const AddMilestoneScreen: React.FC<AddMilestoneScreenProps> = ({
  memberId,
  childName = 'Aarav',
  initialData,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState<string>(initialData?.title || '');
  const [isTitleFocused, setIsTitleFocused] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedType, setSelectedType] = useState<MilestoneType>(
    initialData?.type || 'Physical',
  );
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [shareInPulse, setShareInPulse] = useState<boolean>(
    initialData?.shareInPulse ?? true,
  );
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handlePickPhoto = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          try {
            const image = await ImagePicker.openCamera({
              width: 800,
              height: 800,
              cropping: true,
            });
            if (image?.path) {
              setPhotos((prev) => [...prev, image.path]);
            }
          } catch (e: any) {
            if (e?.code !== 'E_PICKER_CANCELLED') {
              console.log('Camera error:', e);
            }
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          try {
            const image = await ImagePicker.openPicker({
              width: 800,
              height: 800,
              cropping: true,
            });
            if (image?.path) {
              setPhotos((prev) => [...prev, image.path]);
            }
          } catch (e: any) {
            if (e?.code !== 'E_PICKER_CANCELLED') {
              console.log('Picker error:', e);
            }
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please describe what milestone happened.');
      return;
    }

    const data: MilestoneData = {
      id: initialData?.id,
      title: title.trim(),
      when: formatMilestoneDate(selectedDate),
      type: selectedType,
      photos,
      shareInPulse,
    };

    setIsSaving(true);
    let targetMemberId = memberId;
    if (!targetMemberId || targetMemberId === 'me') {
      const stored = await getMyMemberId();
      if (stored) targetMemberId = stored;
    }

    const milestonePayload = buildMilestoneItemPayload({
      id: initialData?.id,
      title,
      achievedOn: selectedDate,
      type: selectedType,
      sharedToPulse: shareInPulse,
    });

    console.log('====================================');
    console.log('[AddMilestone] Submitting PATCH /life-profile with milestone:');
    console.log(`[AddMilestone] Target MemberId: ${targetMemberId}`);
    console.log(
      JSON.stringify({ vaccination: { milestones: [milestonePayload] } }, null, 2),
    );
    console.log('====================================');

    try {
      if (targetMemberId) {
        await dispatch(
          updateLifeProfileSectionThunk({
            memberId: targetMemberId,
            payload: {
              vaccination: {
                milestones: [milestonePayload],
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
        } catch (refetchErr) {
          console.warn('[AddMilestone] Refetch warning:', refetchErr);
        }
      }

      onSave?.(data);
      onClose?.();
    } catch (err: any) {
      console.error('[AddMilestone] Save failed:', err);
      Alert.alert(
        'Save Failed',
        err?.message || 'Could not save milestone record. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDateString = formatMilestoneDate(selectedDate);

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
        title="Add milestone"
        subtitle={`${childName} · Milestones`}
        onBack={onClose}
        icon="close"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* What happened? Input Card */}
          <View style={styles.inputSection}>
            <Text style={styles.fieldLabel}>What happened?</Text>
            <View
              style={[
                styles.inputWrapper,
                isTitleFocused && styles.inputWrapperFocused,
              ]}
            >
              <TextInput
                value={title}
                onChangeText={setTitle}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
                placeholder="Swam a full length of the pool"
                placeholderTextColor="#64748B"
                style={styles.textInput}
                selectionColor={Colors.primary || '#F0913A'}
                multiline={false}
              />
            </View>
          </View>

          {/* When Date Card */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
            style={styles.dateCard}
            accessibilityRole="button"
            accessibilityLabel={`When: ${formattedDateString}`}
          >
            <View style={styles.calendarIconContainer}>
              <Feather name="calendar" size={18} color="#8E9BAE" />
            </View>

            <View style={styles.dateTextContainer}>
              <Text style={styles.dateLabel}>When</Text>
              <Text style={styles.dateValue}>{formattedDateString}</Text>
            </View>

            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>

          {/* TYPE Section */}
          <View style={styles.typeSection}>
            <Text style={styles.sectionHeading}>TYPE</Text>
            <View style={styles.chipsContainer}>
              {MILESTONE_TYPES.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.7}
                    onPress={() => setSelectedType(type)}
                    style={[
                      styles.typeChip,
                      isSelected && styles.typeChipSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        isSelected && styles.typeChipTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* PHOTOS · OPTIONAL */}
          <View style={styles.photosSection}>
            <Text style={styles.sectionHeading}>PHOTOS · OPTIONAL</Text>
            <View style={styles.photosRow}>
              {photos.map((item, idx) => (
                <View key={idx} style={styles.photoBox}>
                  {item === 'sample_photo' ? (
                    <View style={styles.samplePhotoFill} />
                  ) : (
                    <Image source={{ uri: item }} style={styles.photoImage} />
                  )}
                </View>
              ))}

              {/* Add Photo Button (Dashed Border with Camera) */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePickPhoto}
                style={styles.addPhotoBox}
                accessibilityRole="button"
                accessibilityLabel="Add photo"
              >
                <Feather
                  name="camera"
                  size={20}
                  color={Colors.primary || '#F0913A'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Share in Family Pulse Card */}
          <View style={styles.pulseCard}>
            <View style={styles.pulseTextContainer}>
              <Text style={styles.pulseTitle}>Share in Family Pulse</Text>
              <Text style={styles.pulseSubtitle}>Everyone can react</Text>
            </View>

            <Switch
              value={shareInPulse}
              onValueChange={setShareInPulse}
              trackColor={{ false: '#243B58', true: Colors.primary || '#F0913A' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#243B58"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Save Action Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title={isSaving ? 'Saving...' : 'Save milestone'}
          onPress={handleSave}
          disabled={isSaving}
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
        date={selectedDate}
        mode="date"
        title="When"
        onConfirm={(d) => {
          setSelectedDate(d);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
};

export default AddMilestoneScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  inputSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: RFValue(12.5),
    color: '#8E9BAE',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#0F1D30',
    borderWidth: 1,
    borderColor: '#1E324A',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: Colors.primary || '#F0913A',
    borderWidth: 1.5,
  },
  textInput: {
    fontSize: RFValue(14),
    color: '#FFFFFF',
    fontWeight: '500',
    padding: 0,
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
    marginBottom: 18,
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
  typeSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: RFValue(11.5),
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#8E9BAE',
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeChip: {
    backgroundColor: '#0F1D30',
    borderWidth: 1,
    borderColor: '#1E324A',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginHorizontal: 4,
    marginBottom: 10,
  },
  typeChipSelected: {
    backgroundColor: Colors.primary || '#F0913A',
    borderColor: Colors.primary || '#F0913A',
  },
  typeChipText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#94A3B8',
  },
  typeChipTextSelected: {
    color: '#000000',
    fontWeight: '700',
  },
  photosSection: {
    marginBottom: 20,
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1E3A5F',
    marginRight: 12,
  },
  samplePhotoFill: {
    flex: 1,
    backgroundColor: '#1A365D',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  addPhotoBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#263D5C',
    backgroundColor: 'rgba(15, 29, 48, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCard: {
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
  pulseTextContainer: {
    flex: 1,
  },
  pulseTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  pulseSubtitle: {
    fontSize: RFValue(12),
    color: '#8E9BAE',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
  },
});
