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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import type { StaffMember } from './StaffModal';

export type StaffRole =
  | 'Driver'
  | 'House help'
  | 'Nanny'
  | 'Cook'
  | 'Gardener'
  | 'Other';

export interface AddStaffModalProps {
  visible: boolean;
  onClose: () => void;
  onAddStaff: (newStaff: StaffMember) => void;
  isScreen?: boolean;
}

const AVATAR_PALETTE = [
  { bg: '#1E3F3B', color: '#80D0D1' }, // Teal
  { bg: '#1F3A66', color: '#8EB7F5' }, // Blue
  { bg: '#4A3519', color: '#F3C049' }, // Amber
  { bg: '#3D1F48', color: '#C9A8EF' }, // Purple
  { bg: '#481F2F', color: '#F7A8C8' }, // Pink
  { bg: '#1E4028', color: '#9BD4AA' }, // Mint
];

const ROLE_OPTIONS: StaffRole[] = [
  'Driver',
  'House help',
  'Nanny',
  'Cook',
  'Gardener',
  'Other',
];

const getRoleBadgeConfig = (role: StaffRole) => {
  switch (role) {
    case 'Driver':
      return {
        badgeBorder: '#2E5080',
        badgeColor: '#8EB7F5',
        defaultSubtext: 'Sees pickups and drop-offs',
      };
    case 'House help':
      return {
        badgeBorder: '#6E4D1B',
        badgeColor: '#F3C049',
        defaultSubtext: 'Sees grocery lists and chores',
      };
    case 'Nanny':
      return {
        badgeBorder: '#5D2E70',
        badgeColor: '#C9A8EF',
        defaultSubtext: 'Sees child calendar and pickups',
      };
    case 'Cook':
      return {
        badgeBorder: '#1E4D3E',
        badgeColor: '#80D0D1',
        defaultSubtext: 'Sees meal plans and groceries',
      };
    case 'Gardener':
      return {
        badgeBorder: '#235032',
        badgeColor: '#9BD4AA',
        defaultSubtext: 'Home maintenance tasks',
      };
    default:
      return {
        badgeBorder: '#3F4D62',
        badgeColor: '#CAD4DF',
        defaultSubtext: 'Staff access configured',
      };
  }
};

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  visible,
  onClose,
  onAddStaff,
  isScreen = false,
}) => {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('Driver');
  const [phone, setPhone] = useState('');
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  // Permissions state
  const [permissions, setPermissions] = useState({
    pickups: true,
    calendar: false,
    location: false,
    chat: false,
  });

  const handleRoleChange = (selectedRole: StaffRole) => {
    setRole(selectedRole);
    // Suggest default permissions for selected role
    if (selectedRole === 'Driver') {
      setPermissions({
        pickups: true,
        calendar: false,
        location: true,
        chat: false,
      });
      setSelectedPaletteIndex(0);
    } else if (selectedRole === 'House help') {
      setPermissions({
        pickups: false,
        calendar: false,
        location: false,
        chat: false,
      });
      setSelectedPaletteIndex(2);
    } else if (selectedRole === 'Nanny') {
      setPermissions({
        pickups: true,
        calendar: true,
        location: true,
        chat: true,
      });
      setSelectedPaletteIndex(3);
    }
  };

  const computeInitials = (fullName: string): string => {
    const trimmed = fullName.trim();
    if (!trimmed) return 'St';
    const parts = trimmed.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).charAt(0).toUpperCase() + trimmed.slice(1, 2).toLowerCase();
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Required Field', 'Please enter the staff member’s name.');
      return;
    }

    const { badgeBorder, badgeColor, defaultSubtext } = getRoleBadgeConfig(role);
    const palette = AVATAR_PALETTE[selectedPaletteIndex] || AVATAR_PALETTE[0];
    const initial = computeInitials(trimmedName);
    const newId = `staff-${Date.now()}`;

    const newStaff: StaffMember = {
      id: newId,
      name: trimmedName,
      subtext: defaultSubtext,
      badge: role,
      badgeBorder,
      badgeColor,
      initial,
      avatarBg: palette.bg,
      avatarColor: palette.color,
      permissions: { ...permissions },
    };

    onAddStaff(newStaff);
    onClose();
  };

  const topPadding =
    Math.max(
      insets.top,
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 48
    ) + (Platform.OS === 'ios' ? 8 : 4);

  const mainContent = (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isScreen ? 'Back' : 'Close'}
        >
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add staff</Text>
      </View>

      {/* Scrollable Form */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Color Picker Row */}
        <View style={styles.avatarSectionRow}>
          <View
            style={[
              styles.avatarPreview,
              {
                backgroundColor:
                  AVATAR_PALETTE[selectedPaletteIndex]?.bg || '#1E3F3B',
              },
            ]}
          >
            <Text
              style={[
                styles.avatarPreviewText,
                {
                  color:
                    AVATAR_PALETTE[selectedPaletteIndex]?.color || '#80D0D1',
                },
              ]}
            >
              {computeInitials(name)}
            </Text>
          </View>

          <View style={styles.paletteContainer}>
            <Text style={styles.paletteLabel}>Avatar colour</Text>
            <View style={styles.dotsRow}>
              {AVATAR_PALETTE.map((p, idx) => {
                const isSelected = selectedPaletteIndex === idx;
                return (
                  <TouchableOpacity
                    key={p.bg}
                    style={[
                      styles.colorDot,
                      { backgroundColor: p.color },
                      isSelected && styles.colorDotSelected,
                    ]}
                    onPress={() => setSelectedPaletteIndex(idx)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Select avatar color ${idx + 1}`}
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* Input: Name */}
        <Text style={styles.inputLabel}>FULL NAME</Text>
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
            placeholder="e.g. Ramesh Kumar"
            placeholderTextColor="#6E8096"
            selectionColor="#F0913A"
            cursorColor="#F0913A"
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            accessibilityLabel="Full name"
          />
        </View>

        {/* Role Selection Chips */}
        <Text style={styles.inputLabel}>ROLE / CATEGORY</Text>
        <View style={styles.chipsRow}>
          {ROLE_OPTIONS.map((r) => {
            const isSelected = role === r;
            return (
              <TouchableOpacity
                key={r}
                style={[
                  styles.chip,
                  isSelected ? styles.chipSelected : styles.chipUnselected,
                ]}
                onPress={() => handleRoleChange(r)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Role ${r}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input: Phone Number */}
        <Text style={styles.inputLabel}>MOBILE NUMBER (OPTIONAL)</Text>
        <View
          style={[
            styles.inputWrapper,
            isPhoneFocused && styles.inputWrapperFocused,
          ]}
        >
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +91 98765 43210"
            placeholderTextColor="#6E8096"
            keyboardType="phone-pad"
            selectionColor="#F0913A"
            cursorColor="#F0913A"
            onFocus={() => setIsPhoneFocused(true)}
            onBlur={() => setIsPhoneFocused(false)}
            accessibilityLabel="Mobile number"
          />
        </View>

        {/* Permissions Section */}
        <Text style={styles.sectionHeader}>WHAT THEY CAN SEE</Text>
        <View style={styles.permissionsCard}>
          {/* Permission: Pickups and drop-offs */}
          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>Pickups and drop-offs</Text>
            <Switch
              value={permissions.pickups}
              onValueChange={(val) =>
                setPermissions((prev) => ({ ...prev, pickups: val }))
              }
              trackColor={{ false: '#1F3352', true: '#F0913A' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Pickups and drop-offs switch"
            />
          </View>
          <View style={styles.divider} />

          {/* Permission: Family calendar */}
          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>Family calendar</Text>
            <Switch
              value={permissions.calendar}
              onValueChange={(val) =>
                setPermissions((prev) => ({ ...prev, calendar: val }))
              }
              trackColor={{ false: '#1F3352', true: '#F0913A' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Family calendar switch"
            />
          </View>
          <View style={styles.divider} />

          {/* Permission: Live location */}
          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>Live location</Text>
            <Switch
              value={permissions.location}
              onValueChange={(val) =>
                setPermissions((prev) => ({ ...prev, location: val }))
              }
              trackColor={{ false: '#1F3352', true: '#F0913A' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Live location switch"
            />
          </View>
          <View style={styles.divider} />

          {/* Permission: Family chat */}
          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>Family chat</Text>
            <Switch
              value={permissions.chat}
              onValueChange={(val) =>
                setPermissions((prev) => ({ ...prev, chat: val }))
              }
              trackColor={{ false: '#1F3352', true: '#F0913A' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Family chat switch"
            />
          </View>
        </View>

        {/* Notice Box */}
        <View style={styles.infoNoticeBox}>
          <Feather
            name="shield"
            size={18}
            color="#8997AB"
            style={styles.infoNoticeIcon}
          />
          <Text style={styles.infoNoticeText}>
            Staff members get restricted access to only the features you allow
            here.
          </Text>
        </View>
      </ScrollView>

      {/* Pinned Bottom Button */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 4 },
        ]}
      >
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSave}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add staff member"
        >
          <Text style={styles.submitBtnText}>Add staff</Text>
        </TouchableOpacity>
      </View>
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

export default AddStaffModal;

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
  closeBtn: {
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
    fontWeight: '700',
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
  avatarPreview: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreviewText: {
    fontSize: 20,
    fontWeight: '700',
  },
  paletteContainer: {
    marginLeft: 16,
    flex: 1,
  },
  paletteLabel: {
    fontSize: 13,
    color: '#8A9BAE',
    marginBottom: 8,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  colorDotSelected: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8997AB',
    letterSpacing: 1.1,
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
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1.2,
  },
  chipSelected: {
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    borderColor: '#F0913A',
  },
  chipUnselected: {
    backgroundColor: '#14253E',
    borderColor: '#233754',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#F0913A',
  },
  chipTextUnselected: {
    color: '#8A9BAE',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8997AB',
    letterSpacing: 1.1,
    marginTop: 22,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  permissionsCard: {
    backgroundColor: '#11223A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  permissionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1A2E4B',
  },
  infoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11223A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 14,
    marginTop: 18,
    marginBottom: 10,
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
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#1D314E',
    backgroundColor: '#0B1A2F',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1A2F',
  },
});
