import React from 'react';
import { View, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface RejectedUserCircleProps {
  size?: number;
}

const RejectedUserCircle: React.FC<RejectedUserCircleProps> = ({
  size = 88,
}) => {
  const innerSize = size * 0.76;
  const iconSize = size * 0.36;

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
        <Feather name="user-x" size={iconSize} color="#E2E8F0" />
      </View>
    </View>
  );
};

export default RejectedUserCircle;

const styles = StyleSheet.create({
  outerCircle: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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

