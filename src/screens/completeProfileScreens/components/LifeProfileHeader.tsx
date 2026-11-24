import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';

export interface LifeProfileHeaderProps {
  title?: string;
  onBack?: () => void;
  onEdit?: () => void;
  showEdit?: boolean;
}

const LifeProfileHeader: React.FC<LifeProfileHeaderProps> = ({
  title = 'My Life Profile',
  onBack,
  onEdit,
  showEdit = false,
}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBack}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Feather name="chevron-left" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <Text style={styles.titleText}>{title}</Text>

      {showEdit ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEdit}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Feather name="edit-2" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

export default LifeProfileHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});

