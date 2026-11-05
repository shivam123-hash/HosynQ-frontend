import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';

export interface IdNotFoundErrorCardProps {
  title?: string;
  message?: string;
}

const IdNotFoundErrorCard: React.FC<IdNotFoundErrorCardProps> = ({
  title = "We couldn't find that Family ID",
  message = 'Check the 4 digits with your family, or ask them to send the invite again.',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Feather name="alert-circle" size={18} color="#F87171" />
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

export default IdNotFoundErrorCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleText: {
    color: '#F87171',
    fontSize: RFValue(13.5),
    fontWeight: '700',
    marginLeft: 8,
  },
  messageText: {
    color: '#FECACA',
    fontSize: RFValue(12),
    lineHeight: RFValue(17),
    paddingLeft: 26,
  },
});

