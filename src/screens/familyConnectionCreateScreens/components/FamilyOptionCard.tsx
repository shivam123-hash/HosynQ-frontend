import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface FamilyOptionCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const FamilyOptionCard: React.FC<FamilyOptionCardProps> = ({
  id,
  title,
  description,
  icon,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(id)}
      style={[
        styles.cardContainer,
        isSelected ? styles.cardSelected : styles.cardUnselected,
      ]}
    >
      {/* Top Row: Icon Badge (Left) & Radio Button (Right) */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconBadge,
            isSelected ? styles.iconBadgeSelected : styles.iconBadgeUnselected,
          ]}
        >
          {icon}
        </View>

        {/* Radio Button */}
        <View
          style={[
            styles.radioOuter,
            isSelected ? styles.radioOuterSelected : styles.radioOuterUnselected,
          ]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>

      {/* Content Below Top Row */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
};

export default FamilyOptionCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    backgroundColor: Colors.cardBackground,
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  cardUnselected: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  iconBadgeSelected: {
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.35)',
  },
  iconBadgeUnselected: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  radioOuterUnselected: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  title: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: RFValue(12.5),
    lineHeight: RFValue(18),
  },
});

