import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Switch,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import ImagePicker from 'react-native-image-crop-picker';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  createMilestoneThunk,
  uploadMilestonePhotoThunk,
} from '../../../redux/features/pulse/pulseSlice';
import { PulseMilestoneType } from '../../../services/pulseServices';
import Colors from '../../../units/Colors';
import DueDateTimeModal from '../tasksScreen/components/DueDateTimeModal';
import { FamilyMemberPulse } from './types';
import {
  extractPulseMembersFromFamilyState,
  isJestTestEnv,
} from './pulseApiHelpers';
import PulseModalContainer from './PulseModalContainer';
import PulseDialog, {
  INITIAL_PULSE_DIALOG_STATE,
  PulseDialogState,
} from './PulseDialog';

export interface MilestonePhoto {
  id: string;
  type: 'image';
  uri: string;
  filename?: string;
  mime?: string;
}

export interface AddMilestoneModalProps {
  visible: boolean;
  asModal?: boolean;
  members?: FamilyMemberPulse[];
  onClose: () => void;
  onSaveMilestone?: (milestoneData: {
    personId: string;
    personName: string;
    title: string;
    dateText: string;
    achievedOn: string;
    type: PulseMilestoneType;
    saveToLifeProfile: boolean;
    shareInPulse: boolean;
    photos?: MilestonePhoto[];
  }) => void;
}

const MILESTONE_TYPES: Array<{ id: PulseMilestoneType; label: string }> = [
  { id: 'FIRST', label: 'First' },
  { id: 'PHYSICAL', label: 'Physical' },
  { id: 'LEARNING', label: 'Learning' },
  { id: 'SOCIAL', label: 'Social' },
  { id: 'OTHER', label: 'Other' },
];

const formatTodayDefaults = () => {
  const now = new Date();
  const iso = now.toISOString().slice(0, 10);
  const label = now.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return { iso, label };
};

export const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
  visible,
  asModal = true,
  members: membersProp,
  onClose,
  onSaveMilestone,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const familyState = useAppSelector((state) => state.family);

  const memberOptions = useMemo(() => {
    const resolved =
      membersProp && membersProp.length > 0
        ? membersProp
        : extractPulseMembersFromFamilyState(familyState);
    const items = resolved.map((m) => ({
      id: m.id,
      name: m.name,
      initial: m.initial,
      color: m.bgColor,
      isGroup: false,
      isYou: Boolean(m.isYou),
      isAdult: m.isAdult,
      hasAccount: Boolean(m.hasAccount),
    }));
    items.push({
      id: 'family',
      name: 'Family',
      initial: 'Fam',
      color: 'transparent',
      isGroup: true,
      isYou: false,
      isAdult: false,
      hasAccount: false,
    });
    return items;
  }, [membersProp, familyState]);

  const defaultToday = useMemo(() => formatTodayDefaults(), []);

  const [selectedPersonId, setSelectedPersonId] = useState<string>('family');
  const [milestoneType, setMilestoneType] = useState<PulseMilestoneType>('FIRST');
  const [title, setTitle] = useState('');
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [achievedOn, setAchievedOn] = useState(defaultToday.iso);
  const [dateText, setDateText] = useState(defaultToday.label);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photos, setPhotos] = useState<MilestonePhoto[]>([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [saveToLifeProfile, setSaveToLifeProfile] = useState(true);
  const [shareInPulse, setShareInPulse] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<PulseDialogState>(INITIAL_PULSE_DIALOG_STATE);

  useEffect(() => {
    if (!visible) return;
    const today = formatTodayDefaults();
    const initialMember = memberOptions[0];
    setSelectedPersonId(initialMember?.id || 'family');
    setMilestoneType('FIRST');
    setTitle('');
    setAchievedOn(today.iso);
    setDateText(today.label);
    setPhotos([]);
    setShareInPulse(true);
    setSaveToLifeProfile(Boolean(initialMember && !initialMember.isGroup));
  }, [visible, memberOptions]);

  const selectedPerson =
    memberOptions.find((m) => m.id === selectedPersonId) || memberOptions[0];

  const canSaveToLifeProfile = useMemo(() => {
    if (!selectedPerson || selectedPerson.isGroup) return false;
    // Backend allows inLifeProfile for self, or child/member without account (admin)
    if (selectedPerson.isYou) return true;
    if (!selectedPerson.hasAccount || !selectedPerson.isAdult) return true;
    return false;
  }, [selectedPerson]);

  useEffect(() => {
    if (!canSaveToLifeProfile && saveToLifeProfile) {
      setSaveToLifeProfile(false);
    }
  }, [canSaveToLifeProfile, saveToLifeProfile]);

  const handleTakePhoto = async () => {
    try {
      setShowPhotoOptions(false);
      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        cropping: false,
      });
      if (image?.path) {
        const newPhoto: MilestonePhoto = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'image',
          uri: image.path,
          filename: image.filename,
          mime: image.mime,
        };
        setPhotos((prev) => [...prev, newPhoto].slice(0, 6));
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        setDialog({
          visible: true,
          type: 'danger',
          iconName: 'alert-circle',
          title: 'Camera unavailable',
          description: 'Could not open camera right now.',
          primaryButtonText: 'OK',
          secondaryButtonText: '',
        });
      }
    }
  };

  const handleFromGallery = async () => {
    try {
      setShowPhotoOptions(false);
      const res = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: false,
      });
      if (Array.isArray(res)) {
        const newItems: MilestonePhoto[] = res.map((img) => ({
          id: `${Date.now()}-${Math.random()}`,
          type: 'image',
          uri: img.path,
          filename: img.filename,
          mime: img.mime,
        }));
        setPhotos((prev) => [...prev, ...newItems].slice(0, 6));
      } else if (res?.path) {
        const newPhoto: MilestonePhoto = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'image',
          uri: res.path,
          filename: res.filename,
          mime: res.mime,
        };
        setPhotos((prev) => [...prev, newPhoto].slice(0, 6));
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        setDialog({
          visible: true,
          type: 'danger',
          iconName: 'alert-circle',
          title: 'Gallery unavailable',
          description: 'Could not choose photo right now.',
          primaryButtonText: 'OK',
          secondaryButtonText: '',
        });
      }
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setDialog({
        visible: true,
        type: 'warning',
        iconName: 'alert-circle',
        title: 'Add a milestone title',
        description: 'Tell everyone what happened before saving.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
      return;
    }

    const effectiveLifeProfile = canSaveToLifeProfile && saveToLifeProfile;
    if (!effectiveLifeProfile && !shareInPulse) {
      setDialog({
        visible: true,
        type: 'warning',
        iconName: 'alert-circle',
        title: 'Choose where to save',
        description: 'Enable Life Profile or Share in Family Pulse.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
      return;
    }

    const callbackPayload = {
      personId: selectedPerson.id,
      personName: selectedPerson.name,
      title: cleanTitle,
      dateText,
      achievedOn,
      type: milestoneType,
      saveToLifeProfile: effectiveLifeProfile,
      shareInPulse,
      photos,
    };

    if (onSaveMilestone && isJestTestEnv()) {
      onSaveMilestone(callbackPayload);
      onClose();
      return;
    }

    setSaving(true);
    try {
      const apiPayload = {
        ...(selectedPerson.isGroup ? {} : { memberId: selectedPerson.id }),
        title: cleanTitle,
        achievedOn,
        type: milestoneType,
        inLifeProfile: effectiveLifeProfile,
        sharedToPulse: shareInPulse,
      };

      const res = await dispatch(createMilestoneThunk(apiPayload));
      if (createMilestoneThunk.rejected.match(res)) {
        setDialog({
          visible: true,
          type: 'danger',
          iconName: 'alert-circle',
          title: 'Could not save milestone',
          description: (res.payload as string) || 'Please try again.',
          primaryButtonText: 'OK',
          secondaryButtonText: '',
        });
        return;
      }

      const createdId = res.payload?.id;
      if (createdId && photos.length > 0) {
        for (const photo of photos) {
          const formData = new FormData();
          formData.append('file', {
            uri: photo.uri,
            name: photo.filename || `milestone-${Date.now()}.jpg`,
            type: photo.mime || 'image/jpeg',
          } as any);
          await dispatch(
            uploadMilestonePhotoThunk({ milestoneId: createdId, formData })
          );
        }
      }

      onSaveMilestone?.(callbackPayload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <PulseModalContainer
      visible={visible}
      asModal={asModal}
      variant="push"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Feather name="x" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New milestone</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 100, 110) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Who is this for? */}
          <Text style={styles.sectionHeaderUpper}>WHO IS THIS FOR?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.membersRow}
          >
            {memberOptions.map((member) => {
              const isSelected = member.id === selectedPersonId;
              return (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberColumn}
                  onPress={() => setSelectedPersonId(member.id)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={member.name}
                >
                  <View
                    style={[
                      styles.avatarWrapper,
                      isSelected && styles.avatarWrapperSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.avatarCircle,
                        member.isGroup
                          ? styles.avatarCircleGroup
                          : { backgroundColor: member.color },
                      ]}
                    >
                      {member.isGroup ? (
                        <Feather name="users" size={18} color="#8A97AB" />
                      ) : (
                        <Text style={styles.avatarInitial}>{member.initial}</Text>
                      )}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.memberName,
                      isSelected && styles.memberNameSelected,
                    ]}
                  >
                    {member.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* What happened? */}
          <Text style={styles.sectionLabel}>What happened?</Text>
          <View
            style={[
              styles.titleInputContainer,
              isTitleFocused && styles.titleInputContainerFocused,
            ]}
          >
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setIsTitleFocused(true)}
              onBlur={() => setIsTitleFocused(false)}
              placeholder="e.g. Reached badminton semi-final"
              placeholderTextColor={Colors.textPlaceholder}
              selectionColor={Colors.primary}
              maxLength={150}
            />
          </View>

          {/* Category / Type */}
          <Text style={styles.sectionHeaderUpper}>CATEGORY</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeChipsRow}
          >
            {MILESTONE_TYPES.map((t) => {
              const active = milestoneType === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeChip, active && styles.typeChipActive]}
                  onPress={() => setMilestoneType(t.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.typeChipText, active && styles.typeChipTextActive]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* When */}
          <TouchableOpacity
            style={styles.whenCard}
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Change milestone date"
          >
            <Feather
              name="calendar"
              size={18}
              color="#8A97AB"
              style={styles.whenIcon}
            />
            <View style={styles.whenTextGroup}>
              <Text style={styles.whenSubLabel}>When</Text>
              <Text style={styles.whenValueText}>{dateText}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#8A97AB" />
          </TouchableOpacity>

          {/* Photos */}
          <View style={styles.photosHeaderRow}>
            <Text style={styles.sectionHeaderUpper}>PHOTOS</Text>
            <Text style={styles.photosSubtext}>{`${photos.length} of 6`}</Text>
          </View>

          <View style={styles.photosGrid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoSlotFilled}>
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.photoRemoveBtn}
                  onPress={() => handleRemovePhoto(photo.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                >
                  <Feather name="x" size={12} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}

            {photos.length < 6 ? (
              <TouchableOpacity
                style={styles.photoSlotAdd}
                activeOpacity={0.7}
                onPress={() => setShowPhotoOptions(true)}
                accessibilityRole="button"
                accessibilityLabel="Add photo"
              >
                <Feather name="plus" size={20} color="#8A97AB" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Settings Card */}
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Save in Life Profile</Text>
                <Text style={styles.settingSubtitle}>
                  {canSaveToLifeProfile
                    ? `Keep permanently in ${selectedPerson.name}'s memories`
                    : selectedPerson.isGroup
                    ? 'Available for individual member milestones'
                    : 'Only available for your own or child profiles'}
                </Text>
              </View>
              <Switch
                value={canSaveToLifeProfile && saveToLifeProfile}
                onValueChange={setSaveToLifeProfile}
                disabled={!canSaveToLifeProfile}
                trackColor={{ false: Colors.surfaceNavy, true: Colors.primary }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.surfaceNavy}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Share in Family Pulse</Text>
                <Text style={styles.settingSubtitle}>
                  Celebrate with everyone in the feed
                </Text>
              </View>
              <Switch
                value={shareInPulse}
                onValueChange={setShareInPulse}
                trackColor={{ false: Colors.surfaceNavy, true: Colors.primary }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.surfaceNavy}
              />
            </View>
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        <DueDateTimeModal
          visible={showDatePicker}
          initialDate={achievedOn}
          onClose={() => setShowDatePicker(false)}
          onSave={(_dateLabel, formatted, _time, isoDate) => {
            if (isoDate) {
              setAchievedOn(isoDate);
            }
            if (formatted) {
              setDateText(formatted);
            }
            setShowDatePicker(false);
          }}
        />

        {/* Photo Picker Options */}
        <Modal
          visible={showPhotoOptions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPhotoOptions(false)}
        >
          <Pressable
            style={styles.sheetOverlay}
            onPress={() => setShowPhotoOptions(false)}
          >
            <Pressable style={styles.sheetContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Add Photo</Text>
              <Text style={styles.sheetSubtitle}>Choose an option</Text>

              <View style={styles.sheetActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleTakePhoto}
                  style={styles.sheetActionButton}
                >
                  <View style={styles.sheetIconCircle}>
                    <Feather name="camera" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.sheetActionText}>Take a photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleFromGallery}
                  style={styles.sheetActionButton}
                >
                  <View style={styles.sheetIconCircle}>
                    <Feather name="image" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.sheetActionText}>Choose from library</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.sheetCancelBtn}
                onPress={() => setShowPhotoOptions(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Bottom CTA Button */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save milestone</Text>
            )}
          </TouchableOpacity>
        </View>

        <PulseDialog
          dialog={dialog}
          onClose={() => setDialog(INITIAL_PULSE_DIALOG_STATE)}
        />
      </View>
    </PulseModalContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 44,
    height: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionHeaderUpper: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  membersRow: {
    flexDirection: 'row',
    gap: 14,
    paddingBottom: 22,
  },
  memberColumn: {
    alignItems: 'center',
  },
  avatarWrapper: {
    padding: 3,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.transparent,
    marginBottom: 6,
  },
  avatarWrapperSelected: {
    borderColor: Colors.primary,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleGroup: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  memberName: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
  },
  memberNameSelected: {
    color: Colors.white,
    fontFamily: 'Roboto-SemiBold',
  },
  sectionLabel: {
    fontSize: 14,
    color: Colors.textLightMuted,
    fontFamily: 'Roboto-Medium',
    marginBottom: 8,
  },
  titleInputContainer: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleInputContainerFocused: {
    borderColor: Colors.primary,
  },
  titleInput: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    padding: 0,
  },
  typeChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: Colors.cardBackground,
  },
  typeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(240, 145, 58, 0.16)',
  },
  typeChipText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    color: '#CAD4DF',
  },
  typeChipTextActive: {
    color: Colors.primary,
    fontFamily: 'Roboto-Bold',
  },
  whenCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    height: 56,
    marginBottom: 24,
  },
  whenIcon: {
    marginRight: 14,
  },
  whenTextGroup: {
    flex: 1,
  },
  whenSubLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 2,
    fontFamily: 'Roboto-Medium',
  },
  whenValueText: {
    fontSize: 15,
    color: Colors.white,
    fontFamily: 'Roboto-SemiBold',
  },
  photosHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photosSubtext: {
    fontSize: 13,
    color: '#8A97AB',
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  photoSlotFilled: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: '#132238',
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  photoSlotAdd: {
    width: 82,
    height: 82,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  settingsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    color: Colors.white,
    fontFamily: 'Roboto-SemiBold',
    marginBottom: 3,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  divider: {
    height: 1,
    backgroundColor: '#192A44',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginBottom: 20,
  },
  sheetActionsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 16,
  },
  sheetActionButton: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sheetActionText: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.white,
  },
  sheetCancelBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  sheetCancelText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.white,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
  saveButton: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
});

export default AddMilestoneModal;
