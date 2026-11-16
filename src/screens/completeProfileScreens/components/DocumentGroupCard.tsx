import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

export interface DocumentGroupCardProps {
  sectionTitle: string;
  children: React.ReactNode;
}

const DocumentGroupCard: React.FC<DocumentGroupCardProps> = ({
  sectionTitle,
  children,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>{sectionTitle}</Text>
      <View style={styles.cardContainer}>{children}</View>
    </View>
  );
};

export default DocumentGroupCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  cardContainer: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
});

