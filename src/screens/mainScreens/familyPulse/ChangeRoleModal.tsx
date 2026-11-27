import React, { useState, useEffect, useMemo } from 'react';
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
import {
  updateMemberRoleThunk,
  transferOwnershipThunk,
  getMyFamilyThunk,
} from '../../../redux/features/family/familySlice';
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
  const { actionLoading, family, myFamilyData } = useAppSelector(
    (state) => state.family
  );

  const currentFamily = myFamilyData?.family || family;
  const isCurrentOwner = currentFamily?.myRole === 'FAMILY_OWNER';
  const familyName = currentFamily?.name || 'the family';

  const memberName = member?.name?.replace(/\s*\(you\)/i, '') || 'Member';
  const initialRole: MemberRole = member?.role || 'Admin';
  const [selectedRole, setSelectedRole] = useState<MemberRole>(initialRole);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (member?.role) {
      setSelectedRole(member.role);
    }
  }, [member?.role]);

  const isTargetChild = member?.role === 'Child';

  // Dynamic role options based on member type and user permissions
  const roleOptions: RoleOption[] = useMemo(() => {
    if (isTargetChild) {
      return [
        {
          role: 'Adult',
          title: 'Adult',
          description: `Promote ${memberName} to an independent adult profile`,
          disabled: false,
        },
        {
          role: 'Admin',
          title: 'Admin',
          description: 'Must be an adult member before becoming Admin',
          disabled: true,
        },
        {
          role: 'Owner',
          title: 'Owner',
          description: 'Children cannot be family Owner',
          disabled: true,
        },
        {
          role: 'Child',
          title: 'Child',
          description: 'Current child profile. Parents manage their profile.',
          disabled: false,
        },
      ];
    }

    // Member is Adult / Admin
    return [
      {
        role: 'Owner',
        title: 'Owner (Transfer Ownership)',
        description: isCurrentOwner
          ? `Transfer full ownership of ${familyName} to ${memberName}`
          : 'Only the current family Owner can transfer ownership',
        disabled: !isCurrentOwner,
      },
      {
        role: 'Admin',
        title: 'Admin',
        description: 'Manage members, settings and approve join requests',
        disabled: false,
      },
      {
        role: 'Adult',
        title: 'Adult',
        description: 'Full access to family chats, calendar, tasks and vault',
        disabled: false,
      },
      {
        role: 'Child',
        title: 'Child',
        description: 'Adults cannot be changed to child profiles',
        disabled: true,
      },
    ];
  }, [isTargetChild, isCurrentOwner, familyName, memberName]);

  const handleSave = async () => {
    if (!member) {
      onClose();
      return;
    }

    if (onSaveRole && selectedRole !== 'Owner') {
      onSaveRole(member.id, selectedRole);
      onClose();
      return;
    }

    // 1. Transfer Ownership flow
    if (selectedRole === 'Owner') {
      if (!isCurrentOwner) {
        Alert.alert(
          'Owner Only Action',
          'Only the current family Owner can transfer ownership.'
        );
        return;
      }

      Alert.alert(
        'Transfer Family Ownership',
        `Are you sure you want to make ${memberName} the new Owner of ${familyName}?\n\nYou will step down to Admin and lose Owner billing controls.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Transfer Ownership',
            style: 'destructive',
            onPress: async () => {
              setIsSaving(true);
              try {
                await dispatch(transferOwnershipThunk(member.id)).unwrap();
                await dispatch(getMyFamilyThunk());
                setIsSaving(false);
                Alert.alert(
                  'Ownership Transferred',
                  `${memberName} is now the Owner of ${familyName}.`
                );
                onClose();
              } catch (err: any) {
                setIsSaving(false);
                Alert.alert(
                  'Transfer Failed',
                  err || 'Could not transfer ownership.'
                );
              }
            },
          },
        ]
      );
      return;
    }

    // 2. Regular Role Update flow (Admin / Adult)
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
      await dispatch(getMyFamilyThunk());
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
          {roleOptions.map((option, index) => {
            const isLast = index === roleOptions.length - 1;
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
                  style={[
                    styles.roleRow,
                    isDisabled && styles.roleRowDisabled,
                  ]}
                  onPress={() => {
                    if (!isDisabled) {
                      setSelectedRole(option.role);
                    }
                  }}
                  disabled={isDisabled}
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

        {/* Save / Transfer Action Button */}
        <TouchableOpacity
          style={[
            selectedRole === 'Owner' ? styles.transferButton : styles.saveButton,
            isBusy && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={isBusy}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={
            selectedRole === 'Owner'
              ? `Transfer ownership to ${memberName}`
              : 'Save role'
          }
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {selectedRole === 'Owner'
                ? `Transfer Ownership to ${memberName}`
                : 'Save role'}
            </Text>
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
  roleRowDisabled: {
    opacity: 0.5,
  },
  saveButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  transferButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E05638',
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