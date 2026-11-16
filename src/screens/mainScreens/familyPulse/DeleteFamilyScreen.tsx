import React from 'react';
import { DeleteFamilyModal } from './DeleteFamilyModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type DeleteFamilyScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'DeleteFamily'>
> & {
  onBack?: () => void;
};

export const DeleteFamilyScreen: React.FC<DeleteFamilyScreenProps> = ({
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

  return <DeleteFamilyModal onClose={handleBack} isScreen={true} />;
};

export default DeleteFamilyScreen;
