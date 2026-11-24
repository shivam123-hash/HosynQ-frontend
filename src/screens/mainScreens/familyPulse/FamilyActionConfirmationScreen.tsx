import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MembersModal } from './MembersModal';
import {
  FamilyActionConfirmationModal,
  type FamilyActionModalType,
} from './FamilyActionConfirmationModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type FamilyActionConfirmationScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'FamilyActionConfirmation'>
> & {
  onBack?: () => void;
  initialType?: FamilyActionModalType;
  memberName?: string;
};

export const FamilyActionConfirmationScreen: React.FC<
  FamilyActionConfirmationScreenProps
> = ({
  navigation,
  onBack,
  route,
  initialType = 'remove_member',
  memberName = 'Dadi',
}) => {
  const insets = useSafeAreaInsets();
  const routeType = route?.params?.type || initialType;
  const [activeType, setActiveType] = useState<FamilyActionModalType>(routeType);
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

  const handleConfirm = () => {
    handleClose();
  };

  return (
    <View style={styles.container}>
      {/* Background Members screen */}
      <MembersModal visible={true} isScreen={true} onClose={handleClose} />

      {/* Floating Variant Switcher to preview all 3 Figma variants in one screen */}
      <View
        style={[
          styles.variantSwitcherContainer,
          { top: Math.max(insets.top, 20) + 50 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.variantTab,
            activeType === 'remove_member' && styles.variantTabActive,
          ]}
          onPress={() => {
            setActiveType('remove_member');
            setIsModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.variantTabText,
              activeType === 'remove_member' && styles.variantTabTextActive,
            ]}
          >
            Remove Dadi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.variantTab,
            activeType === 'leave_family' && styles.variantTabActive,
          ]}
          onPress={() => {
            setActiveType('leave_family');
            setIsModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.variantTabText,
              activeType === 'leave_family' && styles.variantTabTextActive,
            ]}
          >
            Leave Family
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.variantTab,
            activeType === 'transfer_owner_required' && styles.variantTabActive,
          ]}
          onPress={() => {
            setActiveType('transfer_owner_required');
            setIsModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.variantTabText,
              activeType === 'transfer_owner_required' &&
                styles.variantTabTextActive,
            ]}
          >
            Owner Transfer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reusable Family Action Confirmation Modal */}
      <FamilyActionConfirmationModal
        visible={isModalVisible}
        type={activeType}
        memberName={memberName}
        familyName="The Sharma Family"
        onClose={handleClose}
        onConfirm={handleConfirm}
        onSecondary={handleClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  variantSwitcherContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 36, 64, 0.92)',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  variantTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantTabActive: {
    backgroundColor: '#F0923A',
  },
  variantTabText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#8A9BAE',
  },
  variantTabTextActive: {
    color: '#FFFFFF',
  },
});

export default FamilyActionConfirmationScreen;
