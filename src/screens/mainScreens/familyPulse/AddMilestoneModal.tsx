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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

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
  }) => void;
}

const MEMBERS = [
  { id: 'anaya', name: 'Anaya', initial: 'A', color: Colors.avatarWine },
  { id: 'aarav', name: 'Aarav', initial: 'Aa', color: Colors.avatarOlive },
  { id: 'you', name: 'You', initial: 'P', color: Colors.avatarBrown },
  { id: 'rohan', name: 'Rohan', initial: 'R', color: Colors.avatarNavy },
  { id: 'dadi', name: 'Dadi', initial: 'D', color: Colors.avatarGreen },
  { id: 'family', name: 'Family', initial: 'Fam', color: Colors.surfaceNavy, isGroup: true },
];

export const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
  visible,
  onClose,
  onSaveMilestone,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedPersonId, setSelectedPersonId] = useState('anaya');
  const [title, setTitle] = useState('Reached the badminton semi-final');
  const [dateText] = useState('Wed, 28 Oct 2026');
  const [saveToLifeProfile, setSaveToLifeProfile] = useState(true);
  const [shareInPulse, setShareInPulse] = useState(true);

  const selectedPerson = MEMBERS.find((m) => m.id === selectedPersonId) || MEMBERS[0];

  const handleSave = () => {
    if (!title.trim()) return;
    onSaveMilestone({
      personId: selectedPerson.id,
      personName: selectedPerson.name,
      title: title.trim(),
      dateText,
      saveToLifeProfile,
      shareInPulse,
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
                        { backgroundColor: member.color },
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
          <View style={styles.titleInputContainer}>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Reached badminton semi-final"
              placeholderTextColor={Colors.textPlaceholder}
              selectionColor={Colors.primary}
            />
          </View>

          {/* When */}
          <TouchableOpacity style={styles.whenCard} activeOpacity={0.7}>
            <Feather
              name="calendar"
              size={18}
              color={Colors.textSecondary}
              style={styles.whenIcon}
            />
            <View style={styles.whenTextGroup}>
              <Text style={styles.whenSubLabel}>When</Text>
              <Text style={styles.whenValueText}>{dateText}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Photos */}
          <View style={styles.photosHeaderRow}>
            <Text style={styles.sectionHeaderUpper}>PHOTOS</Text>
            <Text style={styles.photosSubtext}>1 of 6</Text>
          </View>

          <View style={styles.photosGrid}>
            {/* Slot 1: Court graphic preview */}
            <View style={styles.photoSlotFilled}>
              <View style={styles.courtNetGraphic}>
                <View style={styles.courtNetVertical} />
                <View style={styles.courtNetHorizontal} />
                <View style={styles.shuttlecockBall} />
              </View>
            </View>

            {/* Slot 2: Camera Add Slot */}
            <TouchableOpacity style={styles.photoSlotAdd} activeOpacity={0.7}>
              <Feather name="camera" size={22} color={Colors.primary} />
            </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerRightSpacer: {
    width: 44,
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
    color: Colors.textSecondary,
    letterSpacing: 0.6,
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
  avatarInitial: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  memberNameSelected: {
    color: Colors.white,
  },
  sectionLabel: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: 8,
  },
  titleInputContainer: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 16,
  },
  titleInput: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  whenCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 20,
  },
  whenIcon: {
    marginRight: 14,
  },
  whenTextGroup: {
    flex: 1,
  },
  whenSubLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
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
    color: Colors.textSecondary,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  photoSlotFilled: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#1E3F33', // Deep sports green
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courtNetGraphic: {
    flex: 1,
    position: 'relative',
  },
  courtNetVertical: {
    position: 'absolute',
    left: 44,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  courtNetHorizontal: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  shuttlecockBall: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white,
  },
  photoSlotAdd: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderMuted,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
  },
  settingsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 18,
    paddingVertical: 8,
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
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  saveButton: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 26,
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
