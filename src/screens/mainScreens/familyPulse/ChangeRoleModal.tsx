import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
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
  const memberName = member?.name?.replace(/\s*\(you\)/i, '') || 'Rohan';
  const initialRole: MemberRole = member?.role || 'Admin';
  const [selectedRole, setSelectedRole] = useState<MemberRole>(initialRole);

  useEffect(() => {
    if (member?.role) {
      setSelectedRole(member.role);
    }
  }, [member?.role]);

  const handleSave = () => {
    if (member && onSaveRole) {
      onSaveRole(member.id, selectedRole);
    }
    onClose();
  };

  const content = (
    <View style={styles.sheetOverlay}>
      <TouchableWithoutFeedback onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss modal">
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

            // Exact color tokens extracted from Figma design
            let titleColor = '#FFFFFF';
            let descColor = '#8997AB';
            let radioBorderColor = '#4A5870';
            let rowBgColor = 'transparent';

            if (isSelected) {
              rowBgColor = '#1A2B47';
              titleColor = '#FFFFFF';
              descColor = '#8997AB';
              radioBorderColor = '#F0923A';
            } else if (isDisabled) {
              rowBgColor = 'transparent';
              titleColor = '#88919F';
              descColor = '#4E5F76';
              radioBorderColor = '#2E3E58';
            } else {
              // Unselected & enabled (e.g. Adult)
              rowBgColor = 'transparent';
              titleColor = '#FFFFFF';
              descColor = '#8997AB';
              radioBorderColor = '#4A5870';
            }

            return (
              <React.Fragment key={option.role}>
                <TouchableOpacity
                  style={[
                    styles.roleRow,
                    { backgroundColor: rowBgColor },
                  ]}
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
                  disabled={isDisabled && (option.role !== 'Owner' || !onTransferOwnershipPress)}
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
                      { borderColor: radioBorderColor },
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

        {/* Save Role Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Save role"
        >
          <Text style={styles.saveButtonText}>Save role</Text>
        </TouchableOpacity>

        {/* Optional Remove Member Option (if not Owner) */}
        {member && member.role !== 'Owner' && onRemoveMember && (
          <TouchableOpacity
            style={styles.removeMemberButton}
            onPress={() => {
              onClose();
              onRemoveMember(member);
            }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${memberName} from family`}
          >
            <Feather name="trash-2" size={15} color="#F06A6D" />
            <Text style={styles.removeMemberButtonText}>
              {`Remove ${memberName} from family`}
            </Text>
          </TouchableOpacity>
        )}
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
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 12, 22, 0.65)',
  },
  sheetContainer: {
    backgroundColor: '#122440',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4555',
    alignSelf: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  rolesCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  roleInfo: {
    flex: 1,
    paddingRight: 16,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  roleDescription: {
    fontSize: 13.5,
    marginTop: 4,
    lineHeight: 19,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  radioDot: {
    width: 10.5,
    height: 10.5,
    borderRadius: 5.5,
    backgroundColor: '#F0923A',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    width: '100%',
  },
  saveButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 6,
  },
  removeMemberButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F06A6D',
  },
});

export default ChangeRoleModal;

