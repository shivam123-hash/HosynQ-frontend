import React from 'react';
import { AddStaffModal } from './AddStaffModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import type { StaffMember } from './StaffModal';

export type AddStaffScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'AddStaff'>
> & {
  onBack?: () => void;
  onAddStaff?: (newStaff: StaffMember) => void;
};

export const AddStaffScreen: React.FC<AddStaffScreenProps> = ({
  navigation,
  onBack,
  onAddStaff,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Staff');
    }
  };

  return (
    <AddStaffModal
      visible={true}
      isScreen={true}
      onClose={handleBack}
      onAddStaff={(staff) => {
        if (onAddStaff) {
          onAddStaff(staff);
        }
        handleBack();
      }}
    />
  );
};

export default AddStaffScreen;
