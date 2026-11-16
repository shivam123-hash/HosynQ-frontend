import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface WorkLocationMapCardProps {
  onPress?: () => void;
}

const WorkLocationMapCard: React.FC<WorkLocationMapCardProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="Map view of office location"
    >
      {/* Map Background Canvas */}
      <View style={styles.mapCanvas}>
        {/* Soft Green Park Zones */}
        <View style={styles.parkZoneBottomLeft} />
        <View style={styles.parkZoneBottomRight} />
        <View style={styles.parkZoneTopRight} />

        {/* Horizontal Road Grid Lines */}
        <View style={[styles.roadHorizontal, { top: 22 }]} />
        <View style={[styles.roadHorizontal, { top: 62 }]} />
        <View style={[styles.roadHorizontal, { top: 88 }]} />

        {/* Vertical Road Grid Lines */}
        <View style={[styles.roadVertical, { left: '20%' }]} />
        <View style={[styles.roadVertical, { left: '50%' }]} />
        <View style={[styles.roadVertical, { left: '78%' }]} />

        {/* Main Diagonal Highway */}
        <View style={styles.diagonalHighway} />

        {/* Central Briefcase Pin Marker */}
        <View style={styles.pinWrapper}>
          <View style={styles.pinBadge}>
            <Feather name="briefcase" size={17} color="#FB7185" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default WorkLocationMapCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mapCanvas: {
    height: 105,
    backgroundColor: '#091A2C',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  parkZoneBottomLeft: {
    position: 'absolute',
    left: 8,
    bottom: 6,
    width: 90,
    height: 38,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 68, 44, 0.55)',
  },
  parkZoneBottomRight: {
    position: 'absolute',
    right: 12,
    bottom: 6,
    width: 70,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 68, 44, 0.5)',
  },
  parkZoneTopRight: {
    position: 'absolute',
    right: 20,
    top: 8,
    width: 60,
    height: 28,
    borderRadius: 4,
    backgroundColor: 'rgba(16, 68, 44, 0.4)',
  },
  roadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#12263B',
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: '#12263B',
  },
  diagonalHighway: {
    position: 'absolute',
    top: '30%',
    left: '-20%',
    width: '140%',
    height: 14,
    backgroundColor: '#1C3754',
    transform: [{ rotate: '-18deg' }],
  },
  pinWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#181C2C',
    borderWidth: 1.5,
    borderColor: '#FB7185',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FB7185',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
});

