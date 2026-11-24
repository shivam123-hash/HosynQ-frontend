import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  StatusBar,
  Switch,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector, RootState } from '../../../redux/store';
import {
  addManagedMemberThunk,
  updateChildAvatarThunk,
} from '../../../redux/features/family/familySlice';
import {
  AppCalendarDatePickerModal,
  formatDate,
  parseDateTimeString,
} from '../../../components';

export type ChildRelationship = 'Daughter' | 'Son' | 'Grandchild' | 'Other';

export interface AddChildModalProps {
  visible: boolean;
  onClose: () => void;
  onAddChild?: (childData: {
    name: string;
    dob: string;
    relationship: ChildRelationship;
    selectedColor: string;
    canSignIn: boolean;
  }) => void;
  isScreen?: boolean;
}

const AVATAR_COLORS = [
  '#F7A8C8', // Pink
  '#8EB7F5', // Soft Blue
  '#9BD4AA', // Mint
  '#F3C049', // Warm Yellow
  '#C9A8EF', // Lavender
  '#80D0D1', // Soft Teal
];

function parseToIsoDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const parsed = parseDateTimeString(dateStr, 'date');
  if (parsed && !isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '2018-05-14';
}

function calculateAgeText(childName: string, dateStr: string): string {
  const displayName = childName.trim() || 'Child';
  if (!dateStr) return '';

  const date = parseDateTimeString(dateStr, 'date');
  if (!date || isNaN(date.getTime())) return '';

  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  const m = now.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < date.getDate())) {
    years--;
  }

  if (years < 0) {
    return '';
  }

  if (years === 0) {
    let months =
      (now.getFullYear() - date.getFullYear()) * 12 +
      (now.getMonth() - date.getMonth());
    if (now.getDate() < date.getDate()) {
      months--;
    }
    if (months <= 0) {
      return `${displayName} was born recently.`;
    }
    return `${displayName} is ${months} ${months === 1 ? 'month' : 'months'} old.`;
  }

  return `${displayName} is ${years} ${years === 1 ? 'year' : 'years'} old.`;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  visible,
  onClose,
  onAddChild,
  isScreen = false,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { actionLoading } = useAppSelector((state) => state.family);

  const [selectedColor, setSelectedColor] = useState<string>('#F7A8C8');
  const [name, setName] = useState('Myra');
  const [dob, setDob] = useState('14 Mar 2022');
  const [relationship, setRelationship] =
    useState<ChildRelationship>('Daughter');
  const [canSignIn, setCanSignIn] = useState(false);

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ageText = calculateAgeText(name, dob);

  const handleAddChild = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Required Field', 'Please enter the child’s name.');
      return;
    }

    if (onAddChild) {
      onAddChild({
        name: trimmedName,
        dob,
        relationship,
        selectedColor,
        canSignIn,
      });
      return;
    }

    setIsSubmitting(true);
    const isoDate = parseToIsoDate(dob);
    const familyRole =
      relationship === 'Daughter'
        ? 'DAUGHTER'
        : relationship === 'Son'
        ? 'SON'
        : 'OTHER';
    const gender =
      relationship === 'Son'
        ? 'MALE'
        : relationship === 'Daughter'
        ? 'FEMALE'
        : 'OTHER';

    try {
      const response = await dispatch(
        addManagedMemberThunk({
          role: 'DEPENDENT_CHILD_PROFILE',
          personal: {
            fullName: trimmedName,
            familyRole,
            gender,
            birthDate: isoDate,
          },
        })
      ).unwrap();

      // If created member has ID, save avatar color
      const createdMemberId =
        response?.member?.id || (response?.member as any)?.memberId;
      if (createdMemberId && selectedColor) {
        try {
          await dispatch(
            updateChildAvatarThunk({
              memberId: createdMemberId,
              avatarColor: selectedColor,
            })
          ).unwrap();
        } catch (e) {
          // Non-fatal if avatar color update fails
        }
      }

      setIsSubmitting(false);
      Alert.alert(
        'Child Added',
        `${trimmedName} has been added to your family.`
      );
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Failed to Add Child', err || 'Could not add child profile.');
    }
  };

  const isBusy = isSubmitting || actionLoading;

  const topPadding =
    Math.max(
      insets.top,
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 48
    ) + (Platform.OS === 'ios' ? 8 : 4);

  const mainContent = (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButtonLeft}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add a child</Text>
      </View>

      {/* Scrollable Form Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo Picker & Color Palette Row */}
        <View style={styles.avatarSectionRow}>
          <TouchableOpacity
            style={styles.cameraCircle}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add child photo"
          >
            <Feather name="camera" size={22} color="#F0913A" />
          </TouchableOpacity>

          <View style={styles.colorPaletteGroup}>
            <Text style={styles.colorPaletteLabel}>
              Add a photo or pick a colour
            </Text>

            <View style={styles.dotsRow}>
              {AVATAR_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color },
                      isSelected && styles.colorDotSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Pick color ${color}`}
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* Input 1: Name */}
        <Text style={styles.inputLabel}>Name</Text>
        <View
          style={[
            styles.inputWrapper,
            isNameFocused && styles.inputWrapperFocused,
          ]}
        >
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Child's full name"
            placeholderTextColor="#6E8096"
            selectionColor="#F0913A"
            cursorColor="#F0913A"
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            accessibilityLabel="Name"
          />
        </View>

        {/* Input 2: Date of birth */}
        <Text style={styles.inputLabel}>Date of birth</Text>
        <TouchableOpacity
          style={[
            styles.inputWrapper,
            isDatePickerVisible && styles.inputWrapperFocused,
          ]}
          onPress={() => setIsDatePickerVisible(true)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Date of birth"
        >
          <Text
            style={[
              styles.textInputDisplay,
              !dob && styles.placeholderText,
            ]}
          >
            {dob || 'Select date of birth'}
          </Text>
          <Feather
            name="calendar"
            size={18}
            color={isDatePickerVisible ? '#F0913A' : '#8997AB'}
          />
        </TouchableOpacity>

        {/* Age Helper Text */}
        {ageText ? <Text style={styles.ageHelperText}>{ageText}</Text> : null}

        {/* RELATIONSHIP Section */}
        <Text style={styles.roleSectionLabel}>RELATIONSHIP</Text>
        <View style={styles.roleChipsRow}>
          {(['Daughter', 'Son', 'Grandchild', 'Other'] as ChildRelationship[]).map(
            (rel) => {
              const isSelected = relationship === rel;
              return (
                <TouchableOpacity
                  key={rel}
                  style={[
                    styles.roleChip,
                    isSelected ? styles.roleChipActive : styles.roleChipInactive,
                  ]}
                  onPress={() => setRelationship(rel)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`Relationship ${rel}`}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      isSelected
                        ? styles.roleChipTextActive
                        : styles.roleChipTextInactive,
                    ]}
                  >
                    {rel}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* Info Notice Box */}
        <View style={styles.infoNoticeBox}>
          <Feather
            name="shield"
            size={18}
            color="#8997AB"
            style={styles.infoNoticeIcon}
          />
          <Text style={styles.infoNoticeText}>
            Children don't need a phone. Parents manage their profile, location
            and reminders.
          </Text>
        </View>

        {/* Toggle Card */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleTextGroup}>
            <Text style={styles.toggleTitle}>
              Can sign in on their own phone
            </Text>
            <Text style={styles.toggleSubtitle}>Needs decision for V1</Text>
          </View>

          <Switch
            value={canSignIn}
            onValueChange={setCanSignIn}
            trackColor={{ false: '#24364D', true: '#F0913A' }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Can sign in on their own phone toggle"
          />
        </View>
      </ScrollView>

      {/* Pinned Bottom Button */}
      <View
        style={[
          styles.pinnedBottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 4 },
        ]}
      >
        <TouchableOpacity
          style={[styles.addChildButton, isBusy && styles.buttonDisabled]}
          onPress={handleAddChild}
          disabled={isBusy}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add child"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#0B1A2F" />
          ) : (
            <Text style={styles.addChildButtonText}>Add child</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Calendar DOB Picker Modal */}
      <AppCalendarDatePickerModal
        visible={isDatePickerVisible}
        title="Date of birth"
        initialDate={dob}
        maximumDate={new Date()}
        onConfirm={(selectedDate, formattedDate) => {
          setDob(formattedDate);
          setIsDatePickerVisible(false);
        }}
        onClose={() => setIsDatePickerVisible(false)}
      />
    </View>
  );

  if (isScreen) {
    return mainContent;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {mainContent}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerButtonLeft: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: '#122440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  avatarSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cameraCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14253E',
  },
  colorPaletteGroup: {
    marginLeft: 16,
    flex: 1,
  },
  colorPaletteLabel: {
    fontSize: 13,
    color: '#CAD4DF',
    fontFamily: 'Roboto-Medium',
    marginBottom: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorDotSelected: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  inputLabel: {
    fontSize: 14,
    color: '#CAD4DF',
    fontFamily: 'Roboto-Medium',
    marginTop: 18,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11223A',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#1F3352',
    height: 52,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#F0913A',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'Roboto-Medium',
    padding: 0,
  },
  ageHelperText: {
    fontSize: 12.5,
    color: '#CAD4DF',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  roleSectionLabel: {
    fontSize: 12,
    color: '#8997AB',
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 10,
  },
  roleChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1.2,
  },
  roleChipActive: {
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    borderColor: '#F0913A',
  },
  roleChipInactive: {
    backgroundColor: '#14253E',
    borderColor: '#233754',
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  roleChipTextActive: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
  },
  roleChipTextInactive: {
    color: '#C8D1DC',
    fontFamily: 'Roboto-Medium',
  },
  infoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11223A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 14,
    marginTop: 20,
    gap: 12,
  },
  infoNoticeIcon: {
    flexShrink: 0,
  },
  infoNoticeText: {
    flex: 1,
    fontSize: 12.5,
    color: '#8A9BAE',
    lineHeight: 18,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#11223A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 16,
    marginBottom: 20,
  },
  toggleTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#8A9BAE',
    marginTop: 2,
  },
  pinnedBottomContainer: {
    borderTopWidth: 1,
    borderTopColor: '#1D314E',
    backgroundColor: '#0B1A2F',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  addChildButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChildButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
});

export default AddChildModal;