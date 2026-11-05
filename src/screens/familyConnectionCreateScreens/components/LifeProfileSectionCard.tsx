import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface LifeProfileSectionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const LifeProfileSectionCard: React.FC<LifeProfileSectionCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {/* Icon Badge */}
      <View style={styles.iconBadge}>{icon}</View>

      {/* Middle Text Details */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {/* Right Chevron */}
      <Feather
        name="chevron-right"
        size={18}
        color="rgba(255, 255, 255, 0.3)"
      />
    </TouchableOpacity>
  );
};

export default LifeProfileSectionCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: RFValue(11.5),
  },
});

