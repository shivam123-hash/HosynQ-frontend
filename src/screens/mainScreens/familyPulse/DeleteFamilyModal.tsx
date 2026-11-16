import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface DeleteFamilyModalProps {
  visible?: boolean;
  isScreen?: boolean;
  familyName?: string;
  memberCount?: number;
  onClose: () => void;
  onDeleteFamily?: () => void;
}

const DELETION_ITEMS = [
  'All tasks, events and lists',
  'Family chat and Just Us',
  'Everything in Family Vault',
  'Children’s Life Profiles',
];

// Mini Crown Icon matching Figma Owner outline badge
const MiniCrownIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 13,
  color = '#F06A6D',
}) => {
  const s = size / 20;
  return (
    <View
      style={{
        width: 16 * s,
        height: 12 * s,
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <View
        style={{
          width: 14 * s,
          height: 9 * s,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View
          style={{
            width: 1.4 * s,
            height: 7.5 * s,
            backgroundColor: color,
            borderRadius: 0.5 * s,
            transform: [{ rotate: '-18deg' }],
          }}
        />
        <View
          style={{
            width: 1.4 * s,
            height: 9 * s,
            backgroundColor: color,
            borderRadius: 0.5 * s,
            transform: [{ rotate: '19deg' }],
          }}
        />
        <View
          style={{
            width: 1.4 * s,
            height: 9 * s,
            backgroundColor: color,
            borderRadius: 0.5 * s,
            transform: [{ rotate: '-19deg' }],
          }}
        />
        <View
          style={{
            width: 1.4 * s,
            height: 7.5 * s,
            backgroundColor: color,
            borderRadius: 0.5 * s,
            transform: [{ rotate: '18deg' }],
          }}
        />
      </View>
      <View
        style={{
          width: 14 * s,
          height: 1.5 * s,
          backgroundColor: color,
          borderRadius: 0.75 * s,
          marginTop: 1 * s,
        }}
      />
    </View>
  );
};

export const DeleteFamilyModal: React.FC<DeleteFamilyModalProps> = ({
  familyName = 'The Sharma Family',
  memberCount = 5,
  onClose,
  onDeleteFamily,
}) => {
  const insets = useSafeAreaInsets();
  const [confirmText, setConfirmText] = useState('DELETE');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const isDeleteEnabled = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = () => {
    if (!isDeleteEnabled) {
      Alert.alert('Confirmation Required', 'Please type DELETE to confirm family deletion.');
      return;
    }

    Alert.alert(
      'Final Confirmation',
      `Are you absolutely sure you want to permanently delete ${familyName}? All data will be lost.`,
      [
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: () => {
            if (onDeleteFamily) {
              onDeleteFamily();
            }
            onClose();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download Started',
      `An archive of ${familyName}’s tasks, calendar, photos and vaults is being prepared and will be sent to your email.`
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Back"
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Delete family</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Owner Only Pill Badge */}
        <View style={styles.ownerBadge}>
          <MiniCrownIcon size={12} color="#F06A6D" />
          <Text style={styles.ownerBadgeText}>Owner only</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{`Delete ${familyName}?`}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {`This removes the family for all ${memberCount} members. It can’t be undone.`}
        </Text>

        {/* Section Label */}
        <Text style={styles.sectionLabel}>WHAT GETS DELETED</Text>

        {/* Deletion Items Card */}
        <View style={styles.itemsCard}>
          {DELETION_ITEMS.map((item, index) => {
            const isLast = index === DELETION_ITEMS.length - 1;
            return (
              <React.Fragment key={item}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemCross}>✕</Text>
                  <Text style={styles.itemText}>{item}</Text>
                </View>
                {!isLast && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
        </View>

        {/* Type DELETE to confirm */}
        <Text style={styles.inputLabel}>Type DELETE to confirm</Text>
        <View
          style={[
            styles.inputWrapper,
            isInputFocused && styles.inputWrapperFocused,
          ]}
        >
          <TextInput
            style={styles.textInput}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder="Type DELETE"
            placeholderTextColor="#6E8096"
            autoCapitalize="characters"
            selectionColor="#F0923A"
            cursorColor="#F0923A"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            accessibilityLabel="Type DELETE to confirm"
          />
        </View>

        {/* Download Link */}
        <TouchableOpacity
          style={styles.downloadRow}
          onPress={handleDownloadData}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Download your family’s data first"
        >
          <Feather name="download" size={16} color="#F0923A" />
          <Text style={styles.downloadText}>
            Download your family’s data first
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Pinned Bottom Actions */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 6 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.deleteButton,
            !isDeleteEnabled && styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          disabled={!isDeleteEnabled}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Delete family"
        >
          <Text style={styles.deleteButtonText}>Delete family</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(240, 106, 109, 0.45)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    marginBottom: 14,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F06A6D',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8A9BAE',
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A9BAE',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  itemsCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  itemCross: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F06A6D',
    width: 18,
  },
  itemText: {
    fontSize: 14.5,
    color: '#E0E7F0',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    color: '#8A9BAE',
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: '#F0923A',
    borderWidth: 1.5,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
    padding: 0,
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingVertical: 6,
  },
  downloadText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F0923A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  deleteButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F06A6D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#8A9BAE',
  },
});

export default DeleteFamilyModal;
