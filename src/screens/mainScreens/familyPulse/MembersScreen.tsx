import React from 'react';
import { MembersModal } from './MembersModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type MembersScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'Members'>
> & {
  onBack?: () => void;
  onReviewJoinRequests?: () => void;
  onInviteSomeone?: () => void;
  onAddChildProfile?: () => void;
  onNavigateTransferOwnership?: () => void;
  onNavigateDeleteFamily?: () => void;
  onNavigateStaff?: () => void;
};

export const MembersScreen: React.FC<MembersScreenProps> = ({
  navigation,
  onBack,
  onReviewJoinRequests,
  onInviteSomeone,
  onAddChildProfile,
  onNavigateTransferOwnership,
  onNavigateDeleteFamily,
  onNavigateStaff,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Home');
    }
  };

  const handleReviewJoinRequests = () => {
    if (onReviewJoinRequests) {
      onReviewJoinRequests();
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('JoinRequests');
    }
  };

  const handleInviteSomeone = () => {
    if (onInviteSomeone) {
      onInviteSomeone();
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('InviteAdult');
    }
  };

  const canNavigateAddChild = Boolean(
    onAddChildProfile || (navigation && typeof navigation.navigate === 'function')
  );
  const handleAddChildProfile = canNavigateAddChild
    ? () => {
        if (onAddChildProfile) {
          onAddChildProfile();
        } else if (navigation && typeof navigation.navigate === 'function') {
          navigation.navigate('AddChild');
        }
      }
    : undefined;

  const canNavigateTransferOwnership = Boolean(
    onNavigateTransferOwnership || (navigation && typeof navigation.navigate === 'function')
  );
  const handleTransferOwnership = canNavigateTransferOwnership
    ? () => {
        if (onNavigateTransferOwnership) {
          onNavigateTransferOwnership();
        } else if (navigation && typeof navigation.navigate === 'function') {
          navigation.navigate('TransferOwnership');
        }
      }
    : undefined;

  const canNavigateDeleteFamily = Boolean(
    onNavigateDeleteFamily || (navigation && typeof navigation.navigate === 'function')
  );
  const handleDeleteFamily = canNavigateDeleteFamily
    ? () => {
        if (onNavigateDeleteFamily) {
          onNavigateDeleteFamily();
        } else if (navigation && typeof navigation.navigate === 'function') {
          navigation.navigate('DeleteFamily');
        }
      }
    : undefined;

  const canNavigateStaff = Boolean(
    onNavigateStaff || (navigation && typeof navigation.navigate === 'function')
  );
  const handleStaff = canNavigateStaff
    ? () => {
        if (onNavigateStaff) {
          onNavigateStaff();
        } else if (navigation && typeof navigation.navigate === 'function') {
          navigation.navigate('Staff');
        }
      }
    : undefined;

  return (
    <MembersModal
      visible={true}
      isScreen={true}
      onClose={handleBack}
      onSelectMember={(member) => {
        if (navigation && typeof navigation.navigate === 'function') {
          navigation.navigate('MemberProfile', {
            memberId: member.id,
            memberName: member.name,
          });
        }
      }}
      onReviewJoinRequests={handleReviewJoinRequests}
      onInviteSomeone={handleInviteSomeone}
      onAddChildProfile={handleAddChildProfile}
      onOpenTransferOwnership={handleTransferOwnership}
      onOpenDeleteFamily={handleDeleteFamily}
      onOpenStaff={handleStaff}
    />
  );
};

export default MembersScreen;
