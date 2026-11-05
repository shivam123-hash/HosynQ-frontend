import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../../../units/Colors';

export interface HourglassProgressCircleProps {
  size?: number;
}

const HourglassProgressCircle: React.FC<HourglassProgressCircleProps> = ({
  size = 88,
}) => {
  const innerSize = size * 0.76;
  const iconSize = size * 0.35;

  return (
    <View
      style={[
        styles.outerDashed,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        <Ionicons name="hourglass-outline" size={iconSize} color={Colors.primary} />
      </View>
    </View>
  );
};

export default HourglassProgressCircle;

const styles = StyleSheet.create({
  outerDashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 16,
  },
  innerCircle: {
    backgroundColor: '#0F253E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

