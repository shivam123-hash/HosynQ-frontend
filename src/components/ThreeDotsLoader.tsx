import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';

export interface ThreeDotsLoaderProps {
  color?: string;
  size?: number;
  middleSize?: number;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

const ThreeDotsLoader: React.FC<ThreeDotsLoaderProps> = ({
  color = '#FFFFFF',
  size = 7.5,
  middleSize = 11.5,
  spacing = 7,
  style,
}) => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value) =>
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
      ]);

    const animation = Animated.loop(
      Animated.stagger(150, [
        createPulse(anim1),
        createPulse(anim2),
        createPulse(anim3),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [anim1, anim2, anim3]);

  const scale1 = anim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.25],
  });
  const opacity1 = anim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1],
  });

  const scale2 = anim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.35],
  });
  const opacity2 = anim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });

  const scale3 = anim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.25],
  });
  const opacity3 = anim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Left Dot (Small) */}
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            marginRight: spacing,
            opacity: opacity1,
            transform: [{ scale: scale1 }],
          },
        ]}
      />

      {/* Middle Dot (Larger) */}
      <Animated.View
        style={[
          styles.dot,
          {
            width: middleSize,
            height: middleSize,
            borderRadius: middleSize / 2,
            backgroundColor: color,
            marginRight: spacing,
            opacity: opacity2,
            transform: [{ scale: scale2 }],
          },
        ]}
      />

      {/* Right Dot (Small) */}
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: opacity3,
            transform: [{ scale: scale3 }],
          },
        ]}
      />
    </View>
  );
};

export default React.memo(ThreeDotsLoader);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  dot: {},
});

