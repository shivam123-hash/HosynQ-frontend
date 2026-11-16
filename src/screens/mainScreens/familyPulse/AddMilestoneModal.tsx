import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import ImagePicker from 'react-native-image-crop-picker';
import Colors from '../../../units/Colors';
import DueDateTimeModal from '../tasksScreen/components/DueDateTimeModal';

export type MilestonePhoto =
  | { id: string; type: 'court' }
  | { id: string; type: 'image'; uri: string };

export interface AddMilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveMilestone: (milestoneData: {
    personId: string;
    personName: string;
    title: string;
    dateText: string;
    saveToLifeProfile: boolean;
    shareInPulse: boolean;
    photos?: MilestonePhoto[];
  }) => void;
}

const MEMBERS = [
  { id: 'anaya', name: 'Anaya', initial: 'A', color: Colors.avatarWine },
  { id: 'aarav', name: 'Aarav', initial: 'Aa', color: Colors.avatarOlive },
  { id: 'you', name: 'You', initial: 'P', color: Colors.avatarBrown },
  { id: 'rohan', name: 'Rohan', initial: 'R', color: Colors.avatarNavy },
  { id: 'dadi', name: 'Dadi', initial: 'D', color: Colors.avatarGreen },
  {
    id: 'family',
    name: 'Family',
    initial: 'Fam',
    color: 'transparent',
    isGroup: true,
  },
];

export const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
  visible,
  onClose,
  onSaveMilestone,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedPersonId, setSelectedPersonId] = useState('anaya');
  const [title, setTitle] = useState('Reached the badminton semi-final');
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [dateText, setDateText] = useState('Wed, 28 Oct 2026');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photos, setPhotos] = useState<MilestonePhoto[]>([
    { id: 'initial-court', type: 'court' },
  ]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [saveToLifeProfile, setSaveToLifeProfile] = useState(true);
  const [shareInPulse, setShareInPulse] = useState(true);

  const selectedPerson = MEMBERS.find((m) => m.id === selectedPersonId) || MEMBERS[0];

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
        };
        setPhotos((prev) => [...prev, newPhoto].slice(0, 6));
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        // user cancelled or picker error
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
        }));
        setPhotos((prev) => [...prev, ...newItems].slice(0, 6));
      } else if (res?.path) {
        const newPhoto: MilestonePhoto = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'image',
          uri: res.path,
        };
        setPhotos((prev) => [...prev, newPhoto].slice(0, 6));
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        // user cancelled or picker error
      }
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSaveMilestone({
      personId: selectedPerson.id,
      personName: selectedPerson.name,
      title: title.trim(),
      dateText,
      saveToLifeProfile,
      shareInPulse,
      photos,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
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
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Whose milestone? */}
          <Text style={styles.sectionHeaderUpper}>WHOSE MILESTONE?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberPickerRow}
          >
            {MEMBERS.map((member) => {
              const isSelected = selectedPersonId === member.id;
              return (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberItem}
                  onPress={() => setSelectedPersonId(member.id)}
                  activeOpacity={0.7}
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
                        <Feather name="users" size={18} color={Colors.white} />
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
            />
          </View>

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
                {photo.type === 'court' ? (
                  <View style={styles.courtNetGraphic}>
                    <View style={styles.courtNetVertical} />
                    <View style={styles.courtNetHorizontal} />
                    <View style={styles.shuttlecockBall} />
                  </View>
                ) : (
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                )}
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

            {photos.length < 6 && (
              <TouchableOpacity
                style={styles.photoSlotAdd}
                activeOpacity={0.7}
                onPress={() => setShowPhotoOptions(true)}
                accessibilityRole="button"
                accessibilityLabel="Add photo"
              >
                <Feather name="camera" size={22} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Settings Card */}
          <View style={styles.settingsCard}>
            {/* Save to Life Profile */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>
                  Save to {selectedPerson.name}’s Life Profile
                </Text>
                <Text style={styles.settingSubtitle}>
                  Under F · Interests and activities
                </Text>
              </View>
              <Switch
                value={saveToLifeProfile}
                onValueChange={setSaveToLifeProfile}
                trackColor={{
                  false: Colors.surfaceMuted,
                  true: Colors.primary,
                }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.divider} />

            {/* Share in Family Pulse */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Share in Family Pulse</Text>
                <Text style={styles.settingSubtitle}>Everyone can react</Text>
              </View>
              <Switch
                value={shareInPulse}
                onValueChange={setShareInPulse}
                trackColor={{
                  false: Colors.surfaceMuted,
                  true: Colors.primary,
                }}
                thumbColor={Colors.white}
              />
            </View>
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        <DueDateTimeModal
          visible={showDatePicker}
          initialDate={dateText}
          onClose={() => setShowDatePicker(false)}
          onSave={(dateLabel, dueFormatted) => {
            setDateText(dateLabel || dueFormatted);
            setShowDatePicker(false);
          }}
        />

        {/* Photo Options Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPhotoOptions}
          onRequestClose={() => setShowPhotoOptions(false)}
          statusBarTranslucent
        >
          <Pressable
            style={styles.sheetOverlay}
            onPress={() => setShowPhotoOptions(false)}
          >
            <Pressable
              style={styles.sheetContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Add photo</Text>
              <Text style={styles.sheetSubtitle}>
                Take a photo or choose from your library
              </Text>

              <View style={styles.sheetActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleTakePhoto}
                  style={styles.sheetActionButton}
                >
                  <View style={styles.sheetIconCircle}>
                    <Feather name="camera" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.sheetActionText}>Take photo</Text>
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
            activeOpacity={0.85}
          >
            <Text style={styles.saveButtonText}>Save milestone</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 44,
    height: 44,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionHeaderUpper: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  memberPickerRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  memberItem: {
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
    fontWeight: '700',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A97AB',
  },
  memberNameSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
    color: Colors.textLightMuted,
    fontWeight: '500',
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
    fontWeight: '500',
    padding: 0,
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
    fontWeight: '500',
  },
  whenValueText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600',
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
    backgroundColor: '#164035',
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
  courtNetGraphic: {
    flex: 1,
    position: 'relative',
  },
  courtNetVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: '50%',
    width: 2,
    marginLeft: -1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  courtNetHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    marginTop: -1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  shuttlecockBall: {
    position: 'absolute',
    top: 20,
    right: 14,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white,
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '700',
  },
});

export default AddMilestoneModal;
