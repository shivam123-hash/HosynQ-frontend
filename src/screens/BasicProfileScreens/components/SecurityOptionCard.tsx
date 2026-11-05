import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface SecurityOptionCardProps {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isRecommended?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const SecurityOptionCard: React.FC<SecurityOptionCardProps> = ({
  id,
  title,
  description,
  icon,
  isSelected,
  onSelect,
  isRecommended = false,
  containerStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect(id)}
      style={[
        styles.cardContainer,
        isSelected ? styles.selectedCard : styles.unselectedCard,
        containerStyle,
      ]}
    >
      {/* Main Content Row */}
      <View style={styles.contentRow}>
        {/* Left Icon in Circular Container */}
        <View
          style={[
            styles.iconCircle,
            isSelected ? styles.selectedIconCircle : styles.unselectedIconCircle,
          ]}
        >
          {icon}
        </View>

        {/* Center Text Column with Title, Badge, and Description */}
        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{title}</Text>
            {isRecommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            )}
          </View>

          {/* Full description always visible on both cards */}
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Right Radio Indicator */}
        <View
          style={[
            styles.radioOuter,
            isSelected ? styles.radioOuterSelected : styles.radioOuterUnselected,
          ]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SecurityOptionCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: 20,
    paddingHorizontal: 18,
    marginVertical: 8,
    backgroundColor: '#101E31',
  },
  selectedCard: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#13233A',
    paddingVertical: 18,
    transform: [{ scale: 1.02 }],
    // Subtle shadow for elevated selected card
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  unselectedCard: {
    borderWidth: 1,
    borderColor: '#1C2F46',
    backgroundColor: '#101E31',
    paddingVertical: 16,
    transform: [{ scale: 1 }],
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIconCircle: {
    backgroundColor: '#0F1E31',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  unselectedIconCircle: {
    backgroundColor: '#0D1A2A',
    borderWidth: 1,
    borderColor: '#1F344D',
  },
  textColumn: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  titleText: {
    fontSize: RFValue(14.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recommendedBadge: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recommendedText: {
    color: Colors.primary,
    fontSize: RFValue(9.5),
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: RFValue(11.5),
    color: Colors.textSecondary,
    lineHeight: RFValue(16),
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
    borderColor: '#2A3F58',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
