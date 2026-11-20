import React from 'react';
import { InvitationSentModal } from './InvitationSentModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type InvitationSentScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'InvitationSent'>
> & {
  onBack?: () => void;
};

export const InvitationSentScreen: React.FC<InvitationSentScreenProps> = ({
  navigation,
  onBack,
}) => {
  const handleDone = () => {
    if (onBack) {
      onBack();
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Members');
    }
  };

  const handleInviteAnother = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('InviteAdult');
    }
  };

  return (
    <InvitationSentModal
      visible={true}
      isScreen={true}
      onClose={handleDone}
      onInviteAnother={handleInviteAnother}
    />
  );
};

export default InvitationSentScreen;
