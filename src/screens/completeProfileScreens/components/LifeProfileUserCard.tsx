import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface LifeProfileUserCardProps {
  name?: string;
  role?: string;
  age?: number | string;
  occupation?: string;
  tagline?: string;
  initial?: string;
  avatarUrl?: string | null;
  avatarColor?: string;
}

const LifeProfileUserCard: React.FC<LifeProfileUserCardProps> = ({
  name = 'Priya Sharma',
  role = 'Mother',
  age = '38 years',
  occupation = 'Working',
  tagline,
  initial,
  avatarUrl,
  avatarColor = '#6E4327',
}) => {
  const displayInitial =
    initial || (name ? name.trim().charAt(0).toUpperCase() : 'P');

  const displayTagline =
    tagline || [role, age, occupation].filter(Boolean).join(' · ');

  return (
    <View style={styles.container}>
      <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.initialText}>{displayInitial}</Text>
        )}
      </View>

      <Text style={styles.nameText}>{name}</Text>
      <Text style={styles.taglineText}>{displayTagline}</Text>
    </View>
  );
};

export default LifeProfileUserCard;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  initialText: {
    color: '#F0913A',
    fontSize: RFValue(26),
    fontWeight: '700',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: RFValue(20),
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  taglineText: {
    color: Colors.textSecondary,
    fontSize: RFValue(13),
    marginTop: 4,
    textAlign: 'center',
  },
});

