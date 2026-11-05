import React from 'react';
import { View, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface SuccessCheckmarkCircleProps {
  size?: number;
}

const SuccessCheckmarkCircle: React.FC<SuccessCheckmarkCircleProps> = ({
  size = 96,
}) => {
  const innerSize = size * 0.78;
  const iconSize = size * 0.42;

  return (
    <View
      style={[
        styles.outerCircle,
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
        <Feather name="check" size={iconSize} color="#2DD4BF" />
      </View>
    </View>
  );
};

export default SuccessCheckmarkCircle;

const styles = StyleSheet.create({
  outerCircle: {
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  innerCircle: {
    backgroundColor: '#0E2833',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

