import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface HealthCheckupItem {
  id: string;
  title: string;
  actionText?: string;
  onPress?: () => void;
}

export interface HealthCheckupsCardProps {
  items?: HealthCheckupItem[];
  onItemPress?: (id: string) => void;
}

const DEFAULT_CHECKUPS: HealthCheckupItem[] = [
  { id: 'full-body', title: 'Last Full Body Checkup', actionText: 'Add →' },
  { id: 'next-due', title: 'Next Checkup Due', actionText: 'Add →' },
  { id: 'dental', title: 'Last Dental Checkup', actionText: 'Add →' },
  { id: 'eye', title: 'Last Eye Checkup', actionText: 'Add →' },
];

const HealthCheckupsCard: React.FC<HealthCheckupsCardProps> = ({
  items = DEFAULT_CHECKUPS,
  onItemPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Health Checkups</Text>
      <View style={styles.cardContainer}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <View key={item.id}>
              <View style={styles.row}>
                <Text style={styles.titleText}>{item.title}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => (item.onPress ? item.onPress() : onItemPress?.(item.id))}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.actionText}>{item.actionText || 'Add →'}</Text>
                </TouchableOpacity>
              </View>
              {!isLast && <View style={styles.separator} />}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default HealthCheckupsCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
  sectionHeader: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    marginLeft: 4,
  },
  cardContainer: {
    backgroundColor: '#101E31',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1C2F46',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  titleText: {
    fontSize: RFValue(13),
    color: '#CBD5E1',
    fontWeight: '500',
  },
  actionText: {
    fontSize: RFValue(12.5),
    color: Colors.primary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#16283E',
  },
});

