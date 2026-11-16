import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';

export interface PersonalInfoData {
  fullName: string;
  nickname: string;
  email: string;
  familyRole: string;
  gender: string;
  birthDate: string;
  bloodGroup: string;
  heightWeight: string;
}

export interface PersonalInfoGroupCardProps {
  data?: Partial<PersonalInfoData>;
  onRowPress?: (fieldKey: keyof PersonalInfoData) => void;
}

interface RowConfig {
  key: keyof PersonalInfoData;
  label: string;
  defaultVal: string;
  iconName: string;
}

const ROWS: RowConfig[] = [
  {
    key: 'fullName',
    label: 'Full name',
    defaultVal: 'Priya Sharma',
    iconName: 'user',
  },
  {
    key: 'nickname',
    label: 'Nickname',
    defaultVal: 'Pri',
    iconName: 'smile',
  },
  {
    key: 'email',
    label: 'Email',
    defaultVal: 'priya.sharma@example.com',
    iconName: 'mail',
  },
  {
    key: 'familyRole',
    label: 'Family role',
    defaultVal: 'Mother',
    iconName: 'users',
  },
  {
    key: 'gender',
    label: 'Gender (optional)',
    defaultVal: 'Female',
    iconName: 'user',
  },
  {
    key: 'birthDate',
    label: 'Birth date',
    defaultVal: '8 Aug 1988 · 38 years',
    iconName: 'calendar',
  },
  {
    key: 'bloodGroup',
    label: 'Blood group',
    defaultVal: 'O+',
    iconName: 'activity',
  },
  {
    key: 'heightWeight',
    label: 'Height and weight',
    defaultVal: '162 cm · 58 kg',
    iconName: 'maximize-2',
  },
];

const PersonalInfoGroupCard: React.FC<PersonalInfoGroupCardProps> = ({
  data = {},
  onRowPress,
}) => {
  return (
    <View style={styles.cardContainer}>
      {ROWS.map((row, index) => {
        const isLast = index === ROWS.length - 1;
        const displayVal = data[row.key] ?? row.defaultVal;

        return (
          <TouchableOpacity
            key={row.key}
            activeOpacity={0.7}
            onPress={() => onRowPress?.(row.key)}
            style={[styles.rowContainer, !isLast && styles.rowBorderBottom]}
            accessibilityRole="button"
            accessibilityLabel={`${row.label}: ${displayVal}`}
          >
            {/* Left Icon */}
            <View style={styles.iconContainer}>
              <Feather name={row.iconName as any} size={18} color="#8E9BAE" />
            </View>

            {/* Label and Value */}
            <View style={styles.textContainer}>
              <Text style={styles.labelText}>{row.label}</Text>
              <Text style={styles.valueText} numberOfLines={1}>
                {displayVal}
              </Text>
            </View>

            {/* Right Chevron */}
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default PersonalInfoGroupCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 14,
    overflow: 'hidden',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  labelText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '400',
    marginBottom: 2,
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
  },
});

