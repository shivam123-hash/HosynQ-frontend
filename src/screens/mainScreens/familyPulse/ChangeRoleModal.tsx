import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector, RootState } from '../../../redux/store';
import { updateMemberRoleThunk } from '../../../redux/features/family/familySlice';
import type { FamilyMemberItem, MemberRole } from './MembersModal';

export interface ChangeRoleModalProps {
  visible: boolean;
  member?: FamilyMemberItem | null;
  onClose: () => void;
  onSaveRole?: (memberId: string, newRole: MemberRole) => void;
  onRemoveMember?: (member: FamilyMemberItem) => void;
  onTransferOwnershipPress?: () => void;
  isScreen?: boolean;
}

interface RoleOption {
  role: MemberRole;
  title: string;
  description: string;
  disabled?: boolean;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'Owner',
    title: 'Owner',
    description: 'Full control and billing. Use Transfer ownership instead.',
    disabled: true,
  },
  {
    role: 'Admin',
    title: 'Admin',
    description: 'Manage members and approve join requests',
    disabled: false,
  },
  {
    role: 'Adult',
    title: 'Adult',
    description: 'Use everything, but can’t manage members',
    disabled: false,
  },
  {
    role: 'Child',
    title: 'Child',
    description: 'Only for children. Parents manage their profile.',
    disabled: true,
  },
];

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  visible,
  member,
  onClose,
  onSaveRole,
  onRemoveMember,
  onTransferOwnershipPress,
  isScreen = false,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { actionLoading } = useAppSelector((state) => state.family);

  const memberName = member?.name?.replace(/\s*\(you\)/i, '') || 'Member';
  const initialRole: MemberRole = member?.role || 'Admin';
  const [selectedRole, setSelectedRole] = useState<MemberRole>(initialRole);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (member?.role) {
      setSelectedRole(member.role);
    }
  }, [member?.role]);

  const handleSave = async () => {
    if (!member) {
      onClose();
      return;
    }

    if (onSaveRole) {
      onSaveRole(member.id, selectedRole);
      onClose();
      return;
    }

    if (selectedRole !== 'Admin' && selectedRole !== 'Adult') {
      onClose();
      return;
    }

    setIsSaving(true);
    const backendRole = selectedRole === 'Admin' ? 'FAMILY_ADMIN' : 'ADULT_MEMBER';
    try {
      await dispatch(
        updateMemberRoleThunk({ memberId: member.id, role: backendRole })
      ).unwrap();
      setIsSaving(false);
      Alert.alert(
        'Role Updated',
        `${memberName}’s role has been updated to ${selectedRole}.`
      );
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      Alert.alert('Role Update Failed', err || 'Could not change member role.');
    }
  };

  const isBusy = isSaving || actionLoading;

  const content = (
    <View style={styles.sheetOverlay}>
      <TouchableWithoutFeedback
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss modal"
      >
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View
        style={[
          styles.sheetContainer,
          {
            paddingBottom: Math.max(insets.bottom, 20) + 12,
          },
        ]}
      >
        {/* Grabber Handle */}
        <View style={styles.handle} />

        {/* Title */}
        <Text style={styles.title}>
          {`Change ${memberName}’s role`}
        </Text>

        {/* Roles List Card */}
        <View style={styles.rolesCard}>
          {ROLE_OPTIONS.map((option, index) => {
            const isLast = index === ROLE_OPTIONS.length - 1;
            const isSelected = selectedRole === option.role;
            const isDisabled = option.disabled;

            let titleColor = '#FFFFFF';
            let descColor = '#8A9BAE';
            let radioBorderColor = '#3B4D66';

            if (isSelected) {
              titleColor = '#FFFFFF';
              descColor = '#8A9BAE';
              radioBorderColor = '#F0923A';
            } else if (isDisabled) {
              titleColor = '#5A6B82';
              descColor = '#405066';
              radioBorderColor = '#27374D';
            } else {
              titleColor = '#FFFFFF';
              descColor = '#8A9BAE';
              radioBorderColor = '#3B4D66';
            }

            return (
              <React.Fragment key={option.role}>
                <TouchableOpacity
                  style={styles.roleRow}
                  onPress={() => {
                    if (option.role === 'Owner' && onTransferOwnershipPress) {
                      onClose();
                      onTransferOwnershipPress();
                      return;
                    }
                    if (!isDisabled) {
                      setSelectedRole(option.role);
                    }
                  }}
                  disabled={
                    isDisabled &&
                    (option.role !== 'Owner' || !onTransferOwnershipPress)
                  }
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                  accessibilityLabel={`${option.title} role`}
                >
                  <View style={styles.roleInfo}>
                    <Text style={[styles.roleTitle, { color: titleColor }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.roleDescription, { color: descColor }]}>
                      {option.description}
                    </Text>
                  </View>

                  {/* Custom Radio Button */}
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: radioBorderColor,
                        borderWidth: isSelected ? 2.5 : 2,
                      },
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>

                {!isLast && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
        </View>

        {/* Remove Member option button if allowed */}
        {member && !member.isYou && member.role !== 'Owner' && onRemoveMember && (
          <TouchableOpacity
            style={styles.removeMemberRow}
            onPress={() => {
              onClose();
              onRemoveMember(member);
            }}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={16} color="#F06A6D" />
            <Text style={styles.removeMemberText}>{`Remove ${memberName} from family`}</Text>
          </TouchableOpacity>
        )}

        {/* Save Role Button */}
        <TouchableOpacity
          style={[styles.saveButton, isBusy && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isBusy}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Save role"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save role</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isScreen) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: '#0B1A2F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#27384E',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 16,
  },
  rolesCard: {
    backgroundColor: '#11223A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 16,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  roleInfo: {
    flex: 1,
    marginRight: 14,
  },
  roleTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    letterSpacing: -0.1,
  },
  roleDescription: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0923A',
  },
  divider: {
    height: 1,
    backgroundColor: '#192C45',
    marginLeft: 16,
  },
  removeMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
    marginBottom: 8,
  },
  removeMemberText: {
    fontSize: 14,
    color: '#F06A6D',
    fontWeight: '600',
  },
  saveButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default ChangeRoleModal;