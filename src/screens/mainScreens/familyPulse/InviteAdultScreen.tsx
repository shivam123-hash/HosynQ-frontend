import React from 'react';
import { InviteAdultModal } from './InviteAdultModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type InviteAdultScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'InviteAdult'>
> & {
  onBack?: () => void;
};

export const InviteAdultScreen: React.FC<InviteAdultScreenProps> = ({
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

  const handleSendInvite = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('InvitationSent');
    }
  };

  return (
    <InviteAdultModal
      visible={true}
      isScreen={true}
      onClose={handleBack}
      onSendInvite={handleSendInvite}
    />
  );
};

export default InviteAdultScreen;
