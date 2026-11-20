import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MembersModal, type FamilyMemberItem, type MemberRole } from './MembersModal';
import { ChangeRoleModal } from './ChangeRoleModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type ChangeRoleScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'ChangeRole'>
> & {
  onBack?: () => void;
  member?: FamilyMemberItem;
};

const DEFAULT_ROHAN: FamilyMemberItem = {
  id: 'rohan',
  name: 'Rohan',
  relation: 'Father',
  role: 'Admin',
  initials: 'R',
  avatarBg: '#1F3A66',
};

export const ChangeRoleScreen: React.FC<ChangeRoleScreenProps> = ({
  navigation,
  onBack,
  member = DEFAULT_ROHAN,
}) => {
  const [currentMember, setCurrentMember] = useState<FamilyMemberItem>(member);
  const [isModalVisible, setIsModalVisible] = useState(true);

  const handleClose = () => {
    setIsModalVisible(false);
    if (onBack) {
      onBack();
    } else if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Members');
    }
  };

  const handleSaveRole = (_memberId: string, newRole: MemberRole) => {
    setCurrentMember((prev) => ({ ...prev, role: newRole }));
    handleClose();
  };

  return (
    <View style={styles.container}>
      <MembersModal
        visible={true}
        isScreen={true}
        onClose={handleClose}
      />
      <ChangeRoleModal
        visible={isModalVisible}
        member={currentMember}
        onClose={handleClose}
        onSaveRole={handleSaveRole}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
});

export default ChangeRoleScreen;
