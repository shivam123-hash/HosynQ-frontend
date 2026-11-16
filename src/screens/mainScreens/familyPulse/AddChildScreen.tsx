import React from 'react';
import { AddChildModal } from './AddChildModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type AddChildScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'AddChild'>
> & {
  onBack?: () => void;
};

export const AddChildScreen: React.FC<AddChildScreenProps> = ({
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

  return (
    <AddChildModal
      visible={true}
      isScreen={true}
      onClose={handleBack}
    />
  );
};

export default AddChildScreen;
