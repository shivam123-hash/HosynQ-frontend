import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Colors from '../../../../units/Colors';
import { BriefSuggestion } from '../types';

export interface BriefSmartSuggestionProps {
  sectionTitle: string;
  suggestion: BriefSuggestion;
  onConfirm?: () => void;
  onEdit?: () => void;
  onIgnore?: () => void;
}

const BriefSmartSuggestion: React.FC<BriefSmartSuggestionProps> = ({
  sectionTitle,
  suggestion,
  onConfirm,
  onEdit,
  onIgnore,
}) => {
  const [actionState, setActionState] = useState<'pending' | 'confirmed' | 'ignored'>(
    suggestion.state || 'pending'
  );

  const handleConfirm = () => {
    setActionState('confirmed');
    onConfirm?.();
  };

  const handleIgnore = () => {
    setActionState('ignored');
    onIgnore?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>

      <View style={styles.card}>
        {/* Suggestion Text with Sparkle */}
        <View style={styles.textRow}>
          <Text style={styles.sparkleIcon}>✧</Text>
          <Text style={styles.suggestionText}>{suggestion.text}</Text>
        </View>

        {/* Action Buttons or Feedback State */}
        {actionState === 'pending' ? (
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                onEdit?.();
                Alert.alert('Edit Suggestion', 'Open editor to modify this suggestion.');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ignoreButton}
              onPress={handleIgnore}
              activeOpacity={0.7}
            >
              <Text style={styles.ignoreText}>Ignore</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.feedbackRow}>
            <Text style={styles.feedbackText}>
              {actionState === 'confirmed' ? '✓ Suggestion confirmed' : '✕ Suggestion ignored'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: '#B6B8B8',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#0B1A2F',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2A3E5E',
    padding: 16,
    gap: 14,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sparkleIcon: {
    fontSize: 18,
    lineHeight: 22,
    color: Colors.primary, // #F0913A
    marginTop: 1,
  },
  suggestionText: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.15,
    color: '#E6EBF2',
    fontWeight: '400',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
  },
  confirmButton: {
    backgroundColor: Colors.primary, // #F0913A
    height: 44,
    minWidth: 113,
    paddingHorizontal: 14,
    borderRadius: 22,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontFamily: 'Roboto',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#B6B8B8',
  },
  editButton: {
    backgroundColor: 'transparent',
    height: 44,
    minWidth: 116,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontFamily: 'Roboto',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#C9D1DC',
  },
  ignoreButton: {
    height: 44,
    minWidth: 71,
    paddingHorizontal: 14,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ignoreText: {
    fontFamily: 'Roboto',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#8A97AB',
  },
  feedbackRow: {
    paddingVertical: 6,
  },
  feedbackText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default memo(BriefSmartSuggestion);

