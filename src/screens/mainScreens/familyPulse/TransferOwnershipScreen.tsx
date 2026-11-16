import React from 'react';
import { TransferOwnershipModal } from './TransferOwnershipModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type TransferOwnershipScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'TransferOwnership'>
> & {
  onBack?: () => void;
};

export const TransferOwnershipScreen: React.FC<TransferOwnershipScreenProps> = ({
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

  return <TransferOwnershipModal onClose={handleBack} isScreen={true} />;
};

export default TransferOwnershipScreen;
