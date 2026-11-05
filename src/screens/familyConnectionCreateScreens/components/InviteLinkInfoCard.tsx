import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface InviteLinkInfoCardProps {
  text?: string;
}

const InviteLinkInfoCard: React.FC<InviteLinkInfoCardProps> = ({
  text = "Got an invite link? Tap it and you'll land on the invitation with the ID already filled in.",
}) => {
  return (
    <View style={styles.card}>
      <Feather
        name="link-2"
        size={18}
        color={Colors.primary}
        style={styles.icon}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default InviteLinkInfoCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    color: '#94A3B8',
    fontSize: RFValue(11.5),
    lineHeight: RFValue(17),
  },
});

