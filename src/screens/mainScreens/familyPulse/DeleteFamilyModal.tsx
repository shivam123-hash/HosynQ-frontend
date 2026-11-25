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
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector, RootState } from '../../../redux/store';
import { deleteFamilyThunk } from '../../../redux/features/family/familySlice';

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
  visible = true,
  isScreen = false,
  familyName = 'The Sharma Family',
  memberCount = 5,
  onClose,
  onDeleteFamily,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { actionLoading } = useAppSelector((state) => state.family);

  const [confirmText, setConfirmText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDeleteEnabled = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = () => {
    if (!isDeleteEnabled) {
      Alert.alert(
        'Confirmation Required',
        'Please type DELETE to confirm family deletion.'
      );
      return;
    }

    Alert.alert(
      'Final Confirmation',
      `Are you absolutely sure you want to permanently delete ${familyName}? All data will be permanently wiped.`,
      [
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await dispatch(deleteFamilyThunk()).unwrap();
              setIsDeleting(false);
              Alert.alert(
                'Family Deleted',
                `Deleted "${familyName}". You can now create or join another family.`
              );
              if (onDeleteFamily) {
                onDeleteFamily();
              }
              onClose();
            } catch (err: any) {
              setIsDeleting(false);
              Alert.alert(
                'Cannot Delete Family',
                err ||
                  'You can only delete the family once you are the last remaining member.'
              );
            }
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

  const isBusy = isDeleting || actionLoading;

  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44
  );

  const mainContent = (
    <View style={[styles.container, { paddingTop: topPadding }]}>
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
            selectionColor="#F0913A"
            cursorColor="#F0913A"
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
          <Feather name="download" size={16} color="#F0913A" />
          <Text style={styles.downloadText}>
            Download your family’s data first
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Pinned Bottom CTA */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.deleteButton,
            (!isDeleteEnabled || isBusy) && styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          disabled={!isDeleteEnabled || isBusy}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Delete this family forever"
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.deleteButtonText}>
              Delete this family forever
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          disabled={isBusy}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isScreen) {
    return mainContent;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {mainContent}
    </Modal>
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
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  ownerBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(240, 106, 109, 0.4)',
    backgroundColor: 'rgba(240, 106, 109, 0.08)',
    marginBottom: 14,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F06A6D',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A9BAE',
    lineHeight: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: '#8A9BAE',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  itemsCard: {
    backgroundColor: '#11223A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  itemCross: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#F06A6D',
    fontWeight: '800',
  },
  itemText: {
    fontSize: 14.5,
    color: '#E0E7F0',
    fontFamily: 'Roboto-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#192C45',
    marginLeft: 42,
  },
  inputLabel: {
    fontSize: 13,
    color: '#8A9BAE',
    fontFamily: 'Roboto-Medium',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    backgroundColor: '#11223A',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#1F3352',
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 20,
  },
  inputWrapperFocused: {
    borderColor: '#F0913A',
  },
  textInput: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  downloadText: {
    fontSize: 13.5,
    fontFamily: 'Roboto-SemiBold',
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
    opacity: 0.45,
    backgroundColor: '#3A4B60',
  },
  deleteButtonText: {
    fontSize: 15.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14.5,
    fontFamily: 'Roboto-Medium',
    color: '#8A9BAE',
  },
});

export default DeleteFamilyModal;