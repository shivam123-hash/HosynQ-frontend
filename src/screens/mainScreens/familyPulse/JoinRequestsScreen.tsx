import React from 'react';
import { JoinRequestsModal } from './JoinRequestsModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type JoinRequestsScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'JoinRequests'>
> & {
  onBack?: () => void;
};

export const JoinRequestsScreen: React.FC<JoinRequestsScreenProps> = ({
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
    <JoinRequestsModal
      visible={true}
      isScreen={true}
      onClose={handleBack}
    />
  );
};

export default JoinRequestsScreen;
