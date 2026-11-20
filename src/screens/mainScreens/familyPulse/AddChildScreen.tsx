import React from 'react';
import { AddChildModal } from './AddChildModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type AddChildScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'AddChild'>
> & {
  onBack?: () => void;
  onAddChild?: (childData: {
    name: string;
    dob: string;
    relationship: 'Daughter' | 'Son' | 'Grandchild' | 'Other';
    selectedColor: string;
    canSignIn: boolean;
  }) => void;
};

export const AddChildScreen: React.FC<AddChildScreenProps> = ({
  navigation,
  onBack,
  onAddChild,
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
      onAddChild={(childData) => {
        if (onAddChild) {
          onAddChild(childData);
        }
        handleBack();
      }}
    />
  );
};

export default AddChildScreen;
