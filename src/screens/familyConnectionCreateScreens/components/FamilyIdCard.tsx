import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface FamilyIdCardProps {
  familyId?: string;
  onCopy?: (id: string) => void;
}

const FamilyIdCard: React.FC<FamilyIdCardProps> = ({
  familyId = 'HSQ-4821',
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy?.(familyId);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>YOUR FAMILY ID</Text>
      <Text style={styles.familyIdText}>{familyId}</Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleCopy}
        style={styles.copyRow}
      >
        <Feather
          name={copied ? 'check' : 'copy'}
          size={14}
          color={copied ? '#2DD4BF' : Colors.textSecondary}
          style={styles.copyIcon}
        />
        <Text
          style={[
            styles.copyText,
            copied && { color: '#2DD4BF', fontWeight: '600' },
          ]}
        >
          {copied ? 'Copied!' : 'Copy ID'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FamilyIdCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: 'rgba(240, 145, 58, 0.04)',
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: RFValue(11),
    letterSpacing: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  familyIdText: {
    color: '#FFFFFF',
    fontSize: RFValue(28),
    fontWeight: '800',
    letterSpacing: 3,
    marginVertical: 10,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  copyIcon: {
    marginRight: 6,
  },
  copyText: {
    color: Colors.textSecondary,
    fontSize: RFValue(13),
    fontWeight: '500',
  },
});

