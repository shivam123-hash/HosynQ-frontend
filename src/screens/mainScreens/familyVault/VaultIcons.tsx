import React from 'react';
import { View, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';

interface IconProps {
  size?: number;
  color: string;
}

/**
 * ID Card / License Icon
 */
export const IdCardIcon: React.FC<IconProps> = ({ size = 20, color }) => (
  <View
    style={{
      width: size,
      height: size * 0.72,
      borderWidth: 1.5,
      borderColor: color,
      borderRadius: 3,
      paddingHorizontal: 2.5,
      paddingVertical: 2,
      justifyContent: 'space-between',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: 1.5,
          borderWidth: 1,
          borderColor: color,
        }}
      />
      <View style={{ marginLeft: 3, flex: 1 }}>
        <View style={{ height: 1.2, backgroundColor: color, width: '100%', marginBottom: 1.5 }} />
        <View style={{ height: 1.2, backgroundColor: color, width: '60%' }} />
      </View>
    </View>
    <View style={{ height: 1.2, backgroundColor: color, width: '90%' }} />
  </View>
);

/**
 * Umbrella Icon for Insurance
 */
export const UmbrellaIcon: React.FC<IconProps> = ({ size = 20, color }) => (
  <Feather name="umbrella" size={size} color={color} />
);

/**
 * Receipt Icon for Bills & Warranties
 */
export const ReceiptIcon: React.FC<IconProps> = ({ size = 18, color }) => (
  <View
    style={{
      width: size * 0.8,
      height: size + 2,
      borderWidth: 1.5,
      borderColor: color,
      borderRadius: 2,
      justifyContent: 'space-evenly',
      paddingHorizontal: 2,
      paddingVertical: 2,
      alignItems: 'center',
    }}
  >
    <View style={{ width: '80%', height: 1.5, backgroundColor: color, borderRadius: 0.5 }} />
    <View style={{ width: '80%', height: 1.5, backgroundColor: color, borderRadius: 0.5 }} />
    <View style={{ width: '50%', height: 1.5, backgroundColor: color, borderRadius: 0.5, alignSelf: 'flex-start' }} />
  </View>
);

/**
 * Sofa / Home Asset Icon
 */
export const SofaIcon: React.FC<IconProps> = ({ size = 20, color }) => (
  <View
    style={{
      width: size,
      height: size * 0.75,
      justifyContent: 'flex-end',
      alignItems: 'center',
    }}
  >
    {/* Backrest */}
    <View
      style={{
        width: size * 0.8,
        height: size * 0.4,
        borderWidth: 1.5,
        borderColor: color,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        borderBottomWidth: 0,
      }}
    />
    {/* Seat with Armrests */}
    <View
      style={{
        width: size,
        height: size * 0.35,
        borderWidth: 1.5,
        borderColor: color,
        borderRadius: 2.5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 1,
      }}
    >
      <View style={{ width: 2, height: '70%', backgroundColor: color }} />
      <View style={{ width: 2, height: '70%', backgroundColor: color }} />
    </View>
    {/* Legs */}
    <View
      style={{
        width: size * 0.7,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ width: 1.5, height: 2, backgroundColor: color }} />
      <View style={{ width: 1.5, height: 2, backgroundColor: color }} />
    </View>
  </View>
);

/**
 * Contacts / Contact Card Icon
 */
export const ContactCardIcon: React.FC<IconProps> = ({ size = 20, color }) => (
  <View
    style={{
      width: size * 0.85,
      height: size,
      borderWidth: 1.5,
      borderColor: color,
      borderRadius: 3,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
    }}
  >
    {/* Head */}
    <View
      style={{
        width: size * 0.35,
        height: size * 0.35,
        borderRadius: size * 0.18,
        borderWidth: 1.2,
        borderColor: color,
        marginBottom: 1.5,
      }}
    />
    {/* Shoulders */}
    <View
      style={{
        width: size * 0.55,
        height: size * 0.25,
        borderTopLeftRadius: size * 0.2,
        borderTopRightRadius: size * 0.2,
        borderWidth: 1.2,
        borderColor: color,
        borderBottomWidth: 0,
      }}
    />
  </View>
);

/**
 * Car Icon (front-facing vehicle matching Figma)
 */
export const CarIcon: React.FC<IconProps> = ({ size = 20, color }) => (
  <Ionicons name="car-outline" size={size} color={color} />
);

/**
 * Passport Icon (two vertical booklet pages)
 */
export const PassportIcon: React.FC<IconProps> = ({ size = 18, color }) => (
  <View
    style={{
      width: size * 0.9,
      height: size,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.4,
        height: size,
        borderWidth: 1.5,
        borderColor: color,
        borderRadius: 2.5,
      }}
    />
    <View
      style={{
        width: size * 0.4,
        height: size,
        borderWidth: 1.5,
        borderColor: color,
        borderRadius: 2.5,
      }}
    />
  </View>
);
