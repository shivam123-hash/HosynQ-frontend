import React from 'react';
import { StaffModal } from './StaffModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type StaffScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'Staff'>
> & {
  onBack?: () => void;
};

export const StaffScreen: React.FC<StaffScreenProps> = ({
  navigation,
  onBack,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Members');
    }
  };

  return <StaffModal onClose={handleBack} isScreen={true} />;
};

export default StaffScreen;
