import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import ImagePath from '../../../units/ImagePath';

export const ORBIT_SIZE = 300;
const C = ORBIT_SIZE / 2;

export type OrbitItem = {
  type: 'icon' | 'avatar';
  dx: number;
  dy: number;
  featherIcon?: string;
  icon?: string;
  color?: string;
  label?: string;
  size?: number;
  reverse?: boolean; // orbits anticlockwise
};

export const DEFAULT_ORBIT_ITEMS: OrbitItem[] = [
  { type: 'icon', featherIcon: 'list', icon: '▦', dx: -103, dy: -95, color: '#FFB04A' },
  { type: 'icon', featherIcon: 'map-pin', icon: '●', dx: 78, dy: -116, color: '#FF8A3D' },
  { type: 'icon', featherIcon: 'message-circle', icon: '◉', dx: 124, dy: 61, color: '#FFB04A' },
  { type: 'icon', featherIcon: 'calendar', icon: '▣', dx: -78, dy: 112, color: '#FF8A3D' },
  { type: 'avatar', label: '👩🏻‍💼', dx: -13, dy: -92, size: 38, reverse: true },
  { type: 'avatar', label: '🧑🏽', dx: 132, dy: -44, size: 38 },
  { type: 'avatar', label: '👩🏽‍🦱', dx: -1, dy: 137, size: 38 },
  { type: 'avatar', label: '👨🏽‍💼', dx: -132, dy: 46, size: 38 },
  { type: 'avatar', label: '👨🏽', dx: 46, dy: 86, size: 38, reverse: true },
];

export interface OrbitAnimationVisualProps {
  orbitItems?: OrbitItem[];
  centerImage?: any;
}

const OrbitAnimationVisual: React.FC<OrbitAnimationVisualProps> = ({
  orbitItems = DEFAULT_ORBIT_ITEMS,
  centerImage = ImagePath.onBordingGroupImage,
}) => {
  const orbitRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    orbitRotation.setValue(0);
    const animation = Animated.loop(
      Animated.timing(orbitRotation, {
        toValue: 1,
        duration: 24000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => {
      animation.stop();
    };
  }, [orbitRotation]);

  // 0deg -> 360deg (clockwise)
  const orbitSpin = orbitRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 0deg -> -360deg (anticlockwise)
  const outerAvatarSpin = orbitRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const renderItem = (
    item: OrbitItem,
    i: number,
    avatarSpin: Animated.AnimatedInterpolation<string>,
  ) => {
    if (item.type === 'icon') {
      return (
        <View
          key={i}
          style={[
            styles.iconWrap,
            { left: C + item.dx - 14, top: C + item.dy - 14 },
          ]}>
          <View style={styles.orangeBadge}>
            {item.featherIcon ? (
              <Feather name={item.featherIcon as any} size={15} color="#FFFFFF" />
            ) : (
              <Text style={[styles.iconText, { color: item.color }]}>
                {item.icon}
              </Text>
            )}
          </View>
        </View>
      );
    }

    const size = item.size ?? 38;
    return (
      <Animated.View
        key={i}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            left: C + item.dx - size / 2,
            top: C + item.dy - size / 2,
            transform: [{ rotate: avatarSpin }],
          },
        ]}>
        <Text style={styles.avatarText}>{item.label}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.visual}>
      <View style={styles.orbit}>
        {/* Outer Dashed Ring */}
        <View style={styles.dashedRing} />

        {/* Middle Filled Circular Ring */}
        <View style={styles.filledCircle} />

        {/* Center Glowing White Circle with Family Image */}
        <View style={styles.centerCircle}>
          <View style={styles.centerPhoto}>
            <Animated.View
              style={[
                styles.centerPhotoInner,
                { transform: [{ rotate: outerAvatarSpin }] },
              ]}>
              {centerImage ? (
                <Image
                  source={centerImage}
                  style={styles.centerImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.familyEmoji}>👨‍👩‍👧‍👦</Text>
              )}
            </Animated.View>
          </View>
        </View>

        {/* Clockwise group (items stay upright via counter-rotation) */}
        <Animated.View
          style={[
            styles.rotatingOrbit,
            { transform: [{ rotate: orbitSpin }] },
          ]}>
          {orbitItems.map((item, i) =>
            item.reverse ? null : renderItem(item, i, outerAvatarSpin),
          )}
        </Animated.View>

        {/* Anticlockwise group */}
        <Animated.View
          style={[
            styles.rotatingOrbit,
            { transform: [{ rotate: outerAvatarSpin }] },
          ]}>
          {orbitItems.map((item, i) =>
            item.reverse ? renderItem(item, i, orbitSpin) : null,
          )}
        </Animated.View>
      </View>
    </View>
  );
};

export default OrbitAnimationVisual;

const styles = StyleSheet.create({
  visual: {
    flex: 1,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbit: {
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
  },
  rotatingOrbit: {
    position: 'absolute',
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
  },
  dashedRing: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: ORBIT_SIZE - 20,
    height: ORBIT_SIZE - 20,
    borderRadius: (ORBIT_SIZE - 20) / 2,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: 'rgba(58, 74, 96, 0.7)',
  },
  filledCircle: {
    position: 'absolute',
    left: C - 99,
    top: C - 99,
    width: 198,
    height: 198,
    borderRadius: 99,
    backgroundColor: '#1E2D42',
  },
  centerCircle: {
    position: 'absolute',
    zIndex: 10,
    left: C - 58,
    top: C - 58,
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  centerPhoto: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  centerPhotoInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerImage: {
    width: '100%',
    height: '100%',
  },
  familyEmoji: {
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  avatar: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#E9EDF3',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarText: {
    fontSize: 18,
  },
  iconWrap: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orangeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0963C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F0963C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  iconText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
});

