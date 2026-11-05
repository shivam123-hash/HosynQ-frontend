import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface FamilyAvatarClusterProps {
  primaryInitial?: string;
  members?: Array<{
    initial: string;
    bgColor: string;
    textColor?: string;
    isPrimary?: boolean;
  }>;
}

const DEFAULT_MEMBERS = [
  { initial: 'P', bgColor: '#7C4A27' },
  { initial: 'D', bgColor: '#1E4D45' },
  { initial: 'S', bgColor: Colors.primary, textColor: '#0A1B31', isPrimary: true },
  { initial: 'Aa', bgColor: '#7A6B22' },
  { initial: 'A', bgColor: '#5C2444' },
];

const FamilyAvatarCluster: React.FC<FamilyAvatarClusterProps> = ({
  primaryInitial = 'S',
  members = DEFAULT_MEMBERS,
}) => {
  return (
    <View style={styles.clusterContainer}>
      {members.map((m, idx) => {
        const isCenter = m.isPrimary || (idx === Math.floor(members.length / 2));
        const initialText = isCenter ? primaryInitial : m.initial;

        return (
          <View
            key={`${m.initial}-${idx}`}
            style={[
              isCenter ? styles.centerAvatar : styles.sideAvatar,
              {
                backgroundColor: isCenter ? Colors.primary : m.bgColor,
                zIndex: isCenter ? 10 : 5 - Math.abs(2 - idx),
              },
            ]}
          >
            <Text
              style={[
                isCenter ? styles.centerText : styles.sideText,
                { color: m.textColor || '#FFFFFF' },
              ]}
            >
              {initialText}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default FamilyAvatarCluster;

const styles = StyleSheet.create({
  clusterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  sideAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -6,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  sideText: {
    fontSize: RFValue(12.5),
    fontWeight: '700',
  },
  centerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -4,
    borderWidth: 3,
    borderColor: Colors.background,
    elevation: 4,
  },
  centerText: {
    fontSize: RFValue(25),
    fontWeight: '800',
  },
});
